
import { DoctorTotalEarnings } from '@/types/earnings'
import { ChartFilterState } from '../ChartFilters'

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

  constructor(totalEarnings: DoctorTotalEarnings[], filters: ChartFilterState) {
    this.totalEarnings = totalEarnings
    this.filters = filters
  }

  private applyDateFilters(earnings: DoctorTotalEarnings[]): DoctorTotalEarnings[] {
    return earnings.filter(doctor => {
      if (!doctor.first_appointment_date || !doctor.last_appointment_date) {
        return this.filters.timeRange === 'all' && this.filters.month === 'all' && this.filters.year === 'all'
      }

      const firstDate = new Date(doctor.first_appointment_date)
      const lastDate = new Date(doctor.last_appointment_date)
      const now = new Date()

      // Filtro por período de tempo
      if (this.filters.timeRange !== 'all') {
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
        
        if (lastDate < cutoffDate) {
          return false
        }
      }

      // Filtro por mês
      if (this.filters.month !== 'all') {
        const monthNum = parseInt(this.filters.month)
        const hasAppointmentInMonth = 
          (firstDate.getMonth() + 1 <= monthNum && lastDate.getMonth() + 1 >= monthNum) ||
          firstDate.getMonth() + 1 === monthNum ||
          lastDate.getMonth() + 1 === monthNum
        
        if (!hasAppointmentInMonth) {
          return false
        }
      }

      // Filtro por ano
      if (this.filters.year !== 'all') {
        const yearNum = parseInt(this.filters.year)
        const hasAppointmentInYear = 
          firstDate.getFullYear() <= yearNum && lastDate.getFullYear() >= yearNum
        
        if (!hasAppointmentInYear) {
          return false
        }
      }

      return true
    })
  }

  private applyDayOfWeekFilter(earnings: DoctorTotalEarnings[]): DoctorTotalEarnings[] {
    if (this.filters.dayOfWeek === 'all') {
      return earnings
    }

    const dayFactors = {
      'monday': 0.15,
      'tuesday': 0.15,
      'wednesday': 0.15,
      'thursday': 0.15,
      'friday': 0.15,
      'saturday': 0.15,
      'sunday': 0.10
    }

    const factor = dayFactors[this.filters.dayOfWeek as keyof typeof dayFactors] || 1

    return earnings.map(doctor => ({
      ...doctor,
      total_amount: Math.round(doctor.total_amount * factor),
      total_appointments: Math.round(doctor.total_appointments * factor),
      private_amount: Math.round(doctor.private_amount * factor),
      private_appointments: Math.round(doctor.private_appointments * factor),
      insurance_amount: Math.round(doctor.insurance_amount * factor),
      insurance_appointments: Math.round(doctor.insurance_appointments * factor)
    })).filter(doctor => doctor.total_appointments > 0)
  }

  getFilteredEarnings(): DoctorTotalEarnings[] {
    console.log('🔍 Aplicando filtros:', this.filters)
    
    let filtered = [...this.totalEarnings]
    
    filtered = this.applyDateFilters(filtered)
    console.log('📅 Após filtros de data:', filtered.length, 'médicos')
    
    filtered = this.applyDayOfWeekFilter(filtered)
    console.log('📆 Após filtro de dia da semana:', filtered.length, 'médicos')
    
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
      name: doctor.doctor_name.split(' ')[0],
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
      name: item.name,
      fullName: item.fullName,
      value: item.total,
      percentage: totalAmount > 0 ? ((item.total / totalAmount) * 100).toFixed(1) : '0'
    }))
  }
}
