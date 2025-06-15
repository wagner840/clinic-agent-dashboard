
import { useCallback } from 'react'
import { GoogleCalendarService } from '@/services/googleCalendar'

const calendarService = new GoogleCalendarService()

export function useCalendarManagement(
  accessToken: string | null,
  doctorCalendars: any[],
  fetchAppointments: () => Promise<void>
) {
  const handleCreateCalendar = useCallback(async (calendarName: string) => {
    if (!accessToken) {
      throw new Error('Access token is required')
    }

    console.log('Creating calendar:', calendarName)
    await calendarService.createCalendar(accessToken, {
      summary: calendarName,
      description: `Agenda médica - ${calendarName}`,
      timeZone: 'America/Sao_Paulo'
    })

    // Refresh appointments to include the new calendar
    await fetchAppointments()
  }, [accessToken, fetchAppointments])

  const handleDeleteCalendar = useCallback(async (calendarId: string) => {
    if (!accessToken) {
      throw new Error('Access token is required')
    }

    console.log('Deleting calendar:', calendarId)
    await calendarService.deleteCalendar(accessToken, calendarId)

    // Refresh appointments to remove the deleted calendar
    await fetchAppointments()
  }, [accessToken, fetchAppointments])

  const handleAddHolidaysToAll = useCallback(async () => {
    if (!accessToken) {
      throw new Error('Access token is required')
    }

    const calendarIds = doctorCalendars.map(cal => cal.id)
    console.log('Adding holidays to calendars:', calendarIds)
    await calendarService.addHolidaysToExistingCalendars(accessToken, calendarIds)
  }, [accessToken, doctorCalendars])

  return {
    handleCreateCalendar,
    handleDeleteCalendar,
    handleAddHolidaysToAll
  }
}
