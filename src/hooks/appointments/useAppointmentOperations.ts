
import { useCallback } from 'react'
import { GoogleCalendarService } from '@/services/googleCalendar'
import { supabase } from '@/integrations/supabase/client'
import { TARGET_CALENDAR_IDS } from '@/constants/appointments'

const calendarService = new GoogleCalendarService()

export function useAppointmentOperations(
  accessToken: string | null, 
  user: any,
  fetchAppointments: () => Promise<void>
) {
  const updateAppointmentStatusInSupabase = useCallback(async (
    appointmentId: string, 
    status: 'scheduled' | 'completed' | 'cancelled'
  ) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointmentId)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error updating appointment status in Supabase:', error)
      } else {
        console.log(`✅ Appointment ${appointmentId} status updated to ${status} in Supabase`)
      }
    } catch (error) {
      console.error('Error updating appointment status in Supabase:', error)
    }
  }, [user])

  const rescheduleAppointment = useCallback(async (eventId: string, newStart: Date, newEnd: Date) => {
    if (!accessToken || !user) return

    try {
      await calendarService.rescheduleAppointment(accessToken, TARGET_CALENDAR_IDS, eventId, newStart, newEnd)
      
      // Update appointment in Supabase
      const { error } = await supabase
        .from('appointments')
        .update({ 
          start_time: newStart.toISOString(),
          end_time: newEnd.toISOString()
        })
        .eq('id', eventId)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error updating appointment in Supabase:', error)
      }

      await fetchAppointments()
    } catch (error: any) {
      console.error('Error rescheduling appointment:', error)
      throw new Error(`Erro ao reagendar: ${error.message}`)
    }
  }, [accessToken, user, fetchAppointments])

  const cancelAppointment = useCallback(async (eventId: string) => {
    if (!accessToken || !user) return

    try {
      await calendarService.cancelAppointment(accessToken, TARGET_CALENDAR_IDS, eventId)
      await updateAppointmentStatusInSupabase(eventId, 'cancelled')
      await fetchAppointments()
    } catch (error: any) {
      console.error('Error cancelling appointment:', error)
      throw new Error(`Erro ao cancelar: ${error.message}`)
    }
  }, [accessToken, user, fetchAppointments, updateAppointmentStatusInSupabase])

  const reactivateAppointment = useCallback(async (eventId: string) => {
    if (!accessToken || !user) return

    try {
      await calendarService.reactivateAppointment(accessToken, TARGET_CALENDAR_IDS, eventId)
      await updateAppointmentStatusInSupabase(eventId, 'scheduled')
      await fetchAppointments()
    } catch (error: any) {
      console.error('Error reactivating appointment:', error)
      throw new Error(`Erro ao reativar: ${error.message}`)
    }
  }, [accessToken, user, fetchAppointments, updateAppointmentStatusInSupabase])

  const markAsCompleted = useCallback(async (eventId: string) => {
    if (!user) return

    try {
      await updateAppointmentStatusInSupabase(eventId, 'completed')
      await fetchAppointments()
    } catch (error: any) {
      console.error('Error marking appointment as completed:', error)
      throw new Error(`Erro ao marcar como concluído: ${error.message}`)
    }
  }, [user, fetchAppointments, updateAppointmentStatusInSupabase])

  const addAppointment = useCallback(async (appointmentData: {
    patientName: string
    patientEmail?: string
    patientPhone?: string
    start: Date
    end: Date
    type: 'consultation' | 'procedure' | 'follow-up'
    description?: string
  }) => {
    if (!accessToken || !user) return

    try {
      const allCalendars = await calendarService.fetchCalendarList(accessToken)
      const targetCalendars = allCalendars.filter(cal => TARGET_CALENDAR_IDS.includes(cal.id))

      if (targetCalendars.length === 0) {
        throw new Error('Nenhum calendário alvo encontrado')
      }

      const primaryCalendar = targetCalendars[0]
      const eventId = await calendarService.createAppointment(accessToken, primaryCalendar.id, appointmentData)
      
      // The appointment will be synced to Supabase on the next fetchAppointments call
      await fetchAppointments()
      
      return eventId
    } catch (error: any) {
      console.error('Error adding appointment:', error)
      throw new Error(`Erro ao adicionar agendamento: ${error.message}`)
    }
  }, [accessToken, user, fetchAppointments])

  return {
    rescheduleAppointment,
    cancelAppointment,
    reactivateAppointment,
    addAppointment,
    markAsCompleted
  }
}
