
import { DoctorTotalEarnings } from '@/types/earnings'
import { ChartFilterState } from '../ChartFilters'
import { Appointment } from '@/types/appointment'

export interface ChartData {
  name: string
  fullName: string
  total: number
  private: number
  insurance: number
}

export interface PieData {
  name: string
  fullName: string
  value: number
  percentage: string
}

export class ChartDataProcessor {
  private totalEarnings: DoctorTotalEarnings[]
  private filters: ChartFilterState
  private appointments: Appointment[]

  constructor(totalEarnings: DoctorTotalEarnings[], filters: ChartFilterState, appointments: Appointment[] = []) {
    this.totalEarnings = totalEarnings
    this.filters = filters
    this.appointments = appointments
  }

  private getCompletedAppointmentsByDoctor(): Map<string, Appointment[]> {
    const appointmentsByDoctor = new Map<string, Appointment[]>()
    
    this.appointments
      .filter(apt => apt.status === 'completed')
      .forEach(apt => {
        const doctorKey = apt.doctor_name
        if (!appointmentsByDoctor.has(doctorKey)) {
          appointmentsByDoctor.set(doctorKey, [])
        }
        appointmentsByDoctor.get(doctorKey)!.push(apt)
      })
    
    return appointmentsByDoctor
  }

  private applyDateFilters(earnings: DoctorTotalEarnings[]): DoctorTotalEarnings[] {
    if (this.filters.timeRange === 'all' && this.filters.month === 'all' && 
        this.filters.year === 'all' && this.filters.dayOfWeek === 'all') {
      return earnings
    }

    const appointmentsByDoctor = this.getCompletedAppointmentsByDoctor()
    
    return earnings.map(doctor => {
      const doctorAppointments = appointmentsByDoctor.get(doctor.doctor_name) || []
      let filteredAppointments = [...doctorAppointments]

      // Filtro por período de tempo
      if (this.filters.timeRange !== 'all') {
        const now = new Date()
        let cutoffDate: Date
        
        switch (this.filters.timeRange) {
          case 'last-week':
            cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            break
          case 'last-month':
            cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            break
          case 'last-3months':
            cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
            break
          case 'last-year':
            cutoffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
            break
          default:
            cutoffDate = new Date(0)
        }
        
        filteredAppointments = filteredAppointments.filter(apt => {
          const aptDate = new Date(apt.start_time)
          return aptDate >= cutoffDate
        })
      }

      // Filtro por dia da semana
      if (this.filters.dayOfWeek !== 'all') {
        const dayMap = {
          'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
          'thursday': 4, 'friday': 5, 'saturday': 6
        }
        const targetDay = dayMap[this.filters.dayOfWeek as keyof typeof dayMap]
        
        filteredAppointments = filteredAppointments.filter(apt => {
          const aptDate = new Date(apt.start_time)
          return aptDate.getDay() === targetDay
        })
      }

      // Filtro por mês
      if (this.filters.month !== 'all') {
        const targetMonth = parseInt(this.filters.month) - 1 // JavaScript months are 0-indexed
        
        filteredAppointments = filteredAppointments.filter(apt => {
          const aptDate = new Date(apt.start_time)
          return aptDate.getMonth() === targetMonth
        })
      }

      // Filtro por ano
      if (this.filters.year !== 'all') {
        const targetYear = parseInt(this.filters.year)
        
        filteredAppointments = filteredAppointments.filter(apt => {
          const aptDate = new Date(apt.start_time)
          return aptDate.getFullYear() === targetYear
        })
      }

      // Calcular novos totais baseados nos agendamentos filtrados
      const totalAppointments = filteredAppointments.length
      const privateAppointments = filteredAppointments.filter(apt => apt.type === 'private').length
      const insuranceAppointments = filteredAppointments.filter(apt => apt.type === 'insurance').length

      // Estimar valores baseados na proporção original
      const originalTotal = doctor.total_appointments || 1
      const ratio = totalAppointments / originalTotal
      
      return {
        ...doctor,
        total_appointments: totalAppointments,
        private_appointments: privateAppointments,
        insurance_appointments: insuranceAppointments,
        total_amount: Math.round(doctor.total_amount * ratio),
        private_amount: Math.round(doctor.private_amount * (privateAppointments / (doctor.private_appointments || 1))),
        insurance_amount: Math.round(doctor.insurance_amount * (insuranceAppointments / (doctor.insurance_appointments || 1)))
      }
    }).filter(doctor => doctor.total_appointments > 0)
  }

  getFilteredEarnings(): DoctorTotalEarnings[] {
    console.log('🔍 Aplicando filtros:', this.filters)
    console.log('📊 Agendamentos disponíveis:', this.appointments.length)
    
    let filtered = [...this.totalEarnings]
    filtered = this.applyDateFilters(filtered)
    
    console.log('📅 Após filtros:', filtered.length, 'médicos', filtered)
    
    return filtered
  }

  prepareCombinedData(dataType: 'amount' | 'appointments'): ChartData[] {
    const filteredEarnings = this.getFilteredEarnings()
    
    const totalClinicAmount = filteredEarnings.reduce((sum, doctor) => 
      sum + (dataType === 'amount' ? doctor.total_amount : doctor.total_appointments), 0)
    const totalPrivate = filteredEarnings.reduce((sum, doctor) => 
      sum + (dataType === 'amount' ? doctor.private_amount : doctor.private_appointments), 0)
    const totalInsurance = filteredEarnings.reduce((sum, doctor) => 
      sum + (dataType === 'amount' ? doctor.insurance_amount : doctor.insurance_appointments), 0)

    return [{
      name: 'Total da Clínica',
      fullName: 'Total da Clínica',
      total: totalClinicAmount,
      private: totalPrivate,
      insurance: totalInsurance,
    }]
  }

  prepareIndividualData(dataType: 'amount' | 'appointments', selectedDoctor: string): ChartData[] {
    const filteredEarnings = this.getFilteredEarnings()
    
    let data = filteredEarnings.map(doctor => ({
      name: doctor.doctor_name, // Nome completo em vez de apenas primeiro nome
      fullName: doctor.doctor_name,
      total: dataType === 'amount' ? doctor.total_amount : doctor.total_appointments,
      private: dataType === 'amount' ? doctor.private_amount : doctor.private_appointments,
      insurance: dataType === 'amount' ? doctor.insurance_amount : doctor.insurance_appointments,
    }))

    if (selectedDoctor !== 'all') {
      data = data.filter(doctor => doctor.fullName === selectedDoctor)
    }

    return data
  }

  preparePieData(chartData: ChartData[]): PieData[] {
    const totalAmount = chartData.reduce((sum, item) => sum + item.total, 0)
    
    return chartData.map((item, index) => ({
      name: item.fullName, // Usar nome completo
      fullName: item.fullName,
      value: item.total,
      percentage: totalAmount > 0 ? ((item.total / totalAmount) * 100).toFixed(1) : '0'
    }))
  }
}
