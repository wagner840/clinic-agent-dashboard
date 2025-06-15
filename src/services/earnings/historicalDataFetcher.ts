
import { supabase } from '@/integrations/supabase/client'
import { PaymentWithAppointment } from '@/types/historicalEarnings'

export class HistoricalDataFetcher {
  static async clearExistingEarnings(userId: string): Promise<void> {
    console.log('🧹 Clearing existing earnings data...')
    
    const { error: clearDailyError } = await supabase
      .from('doctor_daily_earnings')
      .delete()
      .eq('user_id', userId)

    if (clearDailyError) {
      console.error('Error clearing daily earnings:', clearDailyError)
      throw clearDailyError
    }

    const { error: clearTotalError } = await supabase
      .from('doctor_total_earnings')
      .delete()
      .eq('user_id', userId)

    if (clearTotalError) {
      console.error('Error clearing total earnings:', clearTotalError)
      throw clearTotalError
    }
  }

  static async fetchPaymentsWithAppointments(userId: string): Promise<PaymentWithAppointment[]> {
    console.log('📊 Fetching payments and appointments...')
    
    // Fetch all payments
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)

    if (paymentsError) {
      console.error('Error fetching payments:', paymentsError)
      throw paymentsError
    }

    if (!payments || payments.length === 0) {
      return []
    }

    // Fetch all appointments
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('id, doctor_name, doctor_email, start_time')
      .eq('user_id', userId)

    if (appointmentsError) {
      console.error('Error fetching appointments:', appointmentsError)
      throw appointmentsError
    }

    if (!appointments || appointments.length === 0) {
      return []
    }

    // Create a map of appointments for fast lookup
    const appointmentsMap = new Map(
      appointments.map(apt => [apt.id, apt])
    )

    // Filter payments that have matching appointments
    const paymentsWithAppointments: PaymentWithAppointment[] = payments
      .map(payment => {
        const appointment = appointmentsMap.get(payment.appointment_id)
        if (!appointment) {
          console.warn('Payment without matching appointment:', payment.id)
          return null
        }
        return {
          ...payment,
          appointments: {
            doctor_name: appointment.doctor_name,
            doctor_email: appointment.doctor_email,
            start_time: appointment.start_time
          }
        }
      })
      .filter((payment): payment is PaymentWithAppointment => payment !== null)

    console.log(`✅ Found ${paymentsWithAppointments.length} payments with appointments`)
    return paymentsWithAppointments
  }
}
