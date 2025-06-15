
import { supabase } from '@/integrations/supabase/client'
import { Appointment } from '@/types/appointment'

export class AppointmentSyncService {
  /**
   * Sync a single appointment to Supabase
   */
  static async syncAppointmentToSupabase(appointment: Appointment, user: any): Promise<void> {
    if (!user) return

    try {
      const { error } = await supabase
        .from('appointments')
        .upsert({
          id: appointment.id,
          user_id: user.id,
          title: appointment.title,
          start_time: appointment.start.toISOString(),
          end_time: appointment.end.toISOString(),
          description: appointment.description,
          patient_name: appointment.patient.name,
          patient_email: appointment.patient.email,
          patient_phone: appointment.patient.phone,
          doctor_name: appointment.doctor.name,
          doctor_email: appointment.doctor.email,
          status: appointment.status,
          type: appointment.type
        }, {
          onConflict: 'id',
          ignoreDuplicates: false
        })

      if (error) {
        console.error('Error syncing appointment to Supabase:', error)
      } else {
        console.log('✅ Appointment synced to Supabase:', appointment.id)
      }
    } catch (error) {
      console.error('Error syncing appointment to Supabase:', error)
    }
  }

  /**
   * Sync multiple appointments to Supabase
   */
  static async syncAllAppointments(appointments: Appointment[], user: any): Promise<void> {
    await Promise.all(appointments.map(apt => this.syncAppointmentToSupabase(apt, user)))
  }

  /**
   * Update appointment statuses based on payments
   */
  static async updatePaidAppointmentStatuses(user: any): Promise<void> {
    const { data: paymentsData, error: paymentsError } = await supabase
      .from('payments')
      .select('appointment_id')
      .eq('user_id', user.id)

    if (paymentsError) {
      console.error('Error fetching payments to sync status:', paymentsError)
      return
    }

    if (paymentsData && paymentsData.length > 0) {
      const paidAppointmentIds = paymentsData.map(p => p.appointment_id)
      const { error: updateError } = await supabase
        .from('appointments')
        .update({ status: 'completed' })
        .in('id', paidAppointmentIds)
        .eq('user_id', user.id)
      
      if (updateError) {
        console.error('Error updating status for paid appointments:', updateError)
      } else {
        console.log(`✅ Ensured ${paidAppointmentIds.length} paid appointments are marked as 'completed'.`)
      }
    }
  }

  /**
   * Fetch and apply status updates from Supabase
   */
  static async applySupabaseStatusUpdates(appointments: Appointment[], user: any): Promise<Appointment[]> {
    const { data: supabaseAppointments, error: supabaseError } = await supabase
      .from('appointments')
      .select('id, status')
      .eq('user_id', user.id)

    if (supabaseError) {
      console.error('Error fetching appointment status from Supabase:', supabaseError)
      return appointments
    }

    const statusMap = new Map(
      (supabaseAppointments as any[])?.map(apt => [apt.id, apt.status]) || []
    )

    return appointments.map(apt => {
      const supabaseStatus = statusMap.get(apt.id)
      if (supabaseStatus && supabaseStatus !== apt.status) {
        console.log(`📊 Updating appointment ${apt.id} status from ${apt.status} to ${supabaseStatus}`)
        return { ...apt, status: supabaseStatus as 'scheduled' | 'completed' | 'cancelled' }
      }
      return apt
    })
  }
}
