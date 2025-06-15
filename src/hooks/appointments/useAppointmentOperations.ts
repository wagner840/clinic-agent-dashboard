
import { useCallback } from 'react'
import { GoogleCalendarService } from '@/services/googleCalendar'
import { TARGET_CALENDAR_IDS } from '@/constants/appointments'

const calendarService = new GoogleCalendarService()

export function useAppointmentOperations(
  accessToken: string | null, 
  user: any,
  fetchAppointments: () => Promise<void>
) {
  const rescheduleAppointment = useCallback(async (eventId: string, newStart: Date, newEnd: Date) => {
    if (!accessToken || !user) return

    try {
      await calendarService.rescheduleAppointment(accessToken, TARGET_CALENDAR_IDS, eventId, newStart, newEnd)
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
      await fetchAppointments()
    } catch (error: any) {
      console.error('Error cancelling appointment:', error)
      throw new Error(`Erro ao cancelar: ${error.message}`)
    }
  }, [accessToken, user, fetchAppointments])

  const reactivateAppointment = useCallback(async (eventId: string) => {
    if (!accessToken || !user) return

    try {
      await calendarService.reactivateAppointment(accessToken, TARGET_CALENDAR_IDS, eventId)
      await fetchAppointments()
    } catch (error: any) {
      console.error('Error reactivating appointment:', error)
      throw new Error(`Erro ao reativar: ${error.message}`)
    }
  }, [accessToken, user, fetchAppointments])

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
      await calendarService.createAppointment(accessToken, primaryCalendar.id, appointmentData)
      await fetchAppointments()
    } catch (error: any) {
      console.error('Error adding appointment:', error)
      throw new Error(`Erro ao adicionar agendamento: ${error.message}`)
    }
  }, [accessToken, user, fetchAppointments])

  return {
    rescheduleAppointment,
    cancelAppointment,
    reactivateAppointment,
    addAppointment
  }
}
