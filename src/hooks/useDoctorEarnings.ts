
import { useState, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import { Appointment } from '@/types/appointment'

interface DoctorDailyEarnings {
  id: string
  doctor_name: string
  doctor_email: string
  date: string
  total_amount: number
  total_appointments: number
  insurance_amount: number
  insurance_appointments: number
  private_amount: number
  private_appointments: number
}

interface DoctorTotalEarnings {
  id: string
  doctor_name: string
  doctor_email: string
  total_amount: number
  total_appointments: number
  insurance_amount: number
  insurance_appointments: number
  private_amount: number
  private_appointments: number
  first_appointment_date: string | null
  last_appointment_date: string | null
}

export function useDoctorEarnings() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [dailyEarnings, setDailyEarnings] = useState<DoctorDailyEarnings[]>([])
  const [totalEarnings, setTotalEarnings] = useState<DoctorTotalEarnings[]>([])

  const calculateAndSaveEarnings = useCallback(async (appointment: Appointment, paymentAmount: number, isInsurance: boolean) => {
    if (!user) return

    try {
      console.log('💰 Calculating earnings for appointment:', {
        appointmentId: appointment.id,
        doctorName: appointment.doctor.name,
        amount: paymentAmount,
        isInsurance,
        date: appointment.start.toDateString()
      })

      const appointmentDate = appointment.start.toISOString().split('T')[0]
      
      // Buscar ganhos diários existentes para este médico e data
      const { data: existingDaily, error: fetchError } = await supabase
        .from('doctor_daily_earnings')
        .select('*')
        .eq('user_id', user.id)
        .eq('doctor_name', appointment.doctor.name)
        .eq('date', appointmentDate)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error fetching existing daily earnings:', fetchError)
        return
      }

      // Preparar dados para ganhos diários
      const dailyData = {
        user_id: user.id,
        doctor_name: appointment.doctor.name,
        doctor_email: appointment.doctor.email,
        date: appointmentDate,
        total_amount: (existingDaily?.total_amount || 0) + paymentAmount,
        total_appointments: (existingDaily?.total_appointments || 0) + 1,
        insurance_amount: (existingDaily?.insurance_amount || 0) + (isInsurance ? paymentAmount : 0),
        insurance_appointments: (existingDaily?.insurance_appointments || 0) + (isInsurance ? 1 : 0),
        private_amount: (existingDaily?.private_amount || 0) + (!isInsurance ? paymentAmount : 0),
        private_appointments: (existingDaily?.private_appointments || 0) + (!isInsurance ? 1 : 0)
      }

      // Salvar ou atualizar ganhos diários
      const { error: dailyError } = await supabase
        .from('doctor_daily_earnings')
        .upsert(dailyData, {
          onConflict: 'user_id,doctor_name,date'
        })

      if (dailyError) {
        console.error('Error saving daily earnings:', dailyError)
        return
      }

      console.log('✅ Daily earnings saved successfully')

      // Buscar ganhos totais existentes para este médico
      const { data: existingTotal, error: fetchTotalError } = await supabase
        .from('doctor_total_earnings')
        .select('*')
        .eq('user_id', user.id)
        .eq('doctor_name', appointment.doctor.name)
        .single()

      if (fetchTotalError && fetchTotalError.code !== 'PGRST116') {
        console.error('Error fetching existing total earnings:', fetchTotalError)
        return
      }

      // Preparar dados para ganhos totais
      const totalData = {
        user_id: user.id,
        doctor_name: appointment.doctor.name,
        doctor_email: appointment.doctor.email,
        total_amount: (existingTotal?.total_amount || 0) + paymentAmount,
        total_appointments: (existingTotal?.total_appointments || 0) + 1,
        insurance_amount: (existingTotal?.insurance_amount || 0) + (isInsurance ? paymentAmount : 0),
        insurance_appointments: (existingTotal?.insurance_appointments || 0) + (isInsurance ? 1 : 0),
        private_amount: (existingTotal?.private_amount || 0) + (!isInsurance ? paymentAmount : 0),
        private_appointments: (existingTotal?.private_appointments || 0) + (!isInsurance ? 1 : 0),
        first_appointment_date: existingTotal?.first_appointment_date || appointmentDate,
        last_appointment_date: appointmentDate
      }

      // Salvar ou atualizar ganhos totais
      const { error: totalError } = await supabase
        .from('doctor_total_earnings')
        .upsert(totalData, {
          onConflict: 'user_id,doctor_name'
        })

      if (totalError) {
        console.error('Error saving total earnings:', totalError)
        return
      }

      console.log('✅ Total earnings saved successfully')

    } catch (error) {
      console.error('Error calculating earnings:', error)
      toast({
        title: 'Erro ao calcular ganhos',
        description: 'Ocorreu um erro ao calcular os ganhos do médico.',
        variant: 'destructive'
      })
    }
  }, [user, toast])

  const fetchDailyEarnings = useCallback(async (startDate?: string, endDate?: string) => {
    if (!user) return

    setLoading(true)
    try {
      let query = supabase
        .from('doctor_daily_earnings')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (startDate) {
        query = query.gte('date', startDate)
      }
      if (endDate) {
        query = query.lte('date', endDate)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching daily earnings:', error)
        toast({
          title: 'Erro ao carregar ganhos diários',
          description: error.message,
          variant: 'destructive'
        })
        return
      }

      console.log('📊 Daily earnings fetched:', data?.length || 0, 'records')
      setDailyEarnings(data || [])
    } catch (error) {
      console.error('Error fetching daily earnings:', error)
    } finally {
      setLoading(false)
    }
  }, [user, toast])

  const fetchTotalEarnings = useCallback(async () => {
    if (!user) {
      console.log('⚠️ No user found, skipping earnings fetch')
      return
    }

    setLoading(true)
    try {
      console.log('🔍 Fetching total earnings for user:', user.id)
      
      const { data, error } = await supabase
        .from('doctor_total_earnings')
        .select('*')
        .eq('user_id', user.id)
        .order('total_amount', { ascending: false })

      if (error) {
        console.error('❌ Error fetching total earnings:', error)
        toast({
          title: 'Erro ao carregar ganhos totais',
          description: error.message,
          variant: 'destructive'
        })
        return
      }

      console.log('📊 Total earnings fetched:', {
        recordsCount: data?.length || 0,
        records: data?.map(d => ({
          doctorName: d.doctor_name,
          totalAmount: d.total_amount,
          totalAppointments: d.total_appointments
        }))
      })

      setTotalEarnings(data || [])
    } catch (error) {
      console.error('❌ Error fetching total earnings:', error)
    } finally {
      setLoading(false)
    }
  }, [user, toast])

  const getClinicTotals = useCallback(() => {
    const totals = totalEarnings.reduce((acc, doctor) => ({
      totalAmount: acc.totalAmount + doctor.total_amount,
      totalAppointments: acc.totalAppointments + doctor.total_appointments,
      insuranceAmount: acc.insuranceAmount + doctor.insurance_amount,
      insuranceAppointments: acc.insuranceAppointments + doctor.insurance_appointments,
      privateAmount: acc.privateAmount + doctor.private_amount,
      privateAppointments: acc.privateAppointments + doctor.private_appointments
    }), {
      totalAmount: 0,
      totalAppointments: 0,
      insuranceAmount: 0,
      insuranceAppointments: 0,
      privateAmount: 0,
      privateAppointments: 0
    })

    console.log('🏥 Clinic totals calculated:', totals)
    return totals
  }, [totalEarnings])

  return {
    dailyEarnings,
    totalEarnings,
    loading,
    calculateAndSaveEarnings,
    fetchDailyEarnings,
    fetchTotalEarnings,
    getClinicTotals
  }
}
