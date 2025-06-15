
import { supabase } from '@/integrations/supabase/client'
import { Appointment } from '@/types/appointment'

export async function calculateAndSaveEarnings(
  appointment: Appointment, 
  paymentAmount: number, 
  isInsurance: boolean,
  userId: string
) {
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
      .eq('user_id', userId)
      .eq('doctor_name', appointment.doctor.name)
      .eq('date', appointmentDate)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error fetching existing daily earnings:', fetchError)
      return
    }

    // Preparar dados para ganhos diários
    const dailyData = {
      user_id: userId,
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
      .eq('user_id', userId)
      .eq('doctor_name', appointment.doctor.name)
      .single()

    if (fetchTotalError && fetchTotalError.code !== 'PGRST116') {
      console.error('Error fetching existing total earnings:', fetchTotalError)
      return
    }

    // Preparar dados para ganhos totais
    const totalData = {
      user_id: userId,
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
    throw error
  }
}
