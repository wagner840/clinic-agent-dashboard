
import { GoogleCalendarService, CalendarListEntry } from '@/services/googleCalendar'
import { Appointment } from '@/types/appointment'
import { CalendarFilterService } from './calendarFilterService'
import { AppointmentSyncService } from './appointmentSyncService'

const calendarService = new GoogleCalendarService()

export class CalendarDataService {
  /**
   * Fetch and process all calendar data
   */
  static async fetchCalendarData(accessToken: string, user: any): Promise<{
    appointments: Appointment[]
    doctorCalendars: CalendarListEntry[]
  }> {
    try {
      const allCalendars = await calendarService.fetchCalendarList(accessToken)
      
      // Filter calendars: non-primary AND non-holiday
      const targetCalendars = CalendarFilterService.filterDoctorCalendars(allCalendars)
      
      console.log(`📋 Filtered calendars for appointments: ${targetCalendars.map(c => c.summary).join(', ')}`)

      if (targetCalendars.length === 0) {
        throw new Error(`Nenhum calendário de médico foi encontrado na sua conta Google. Verifique se os calendários estão compartilhados com a conta conectada.`)
      }

      console.log(`Buscando eventos para os calendários: ${targetCalendars.map(c => c.summary).join(', ')}`)

      const eventsPerCalendar = await this.fetchEventsFromCalendars(accessToken, targetCalendars)
      const convertedAppointments = this.convertEventsToAppointments(eventsPerCalendar, user?.email || '')

      console.log('🔄 Converted appointments after filtering:', {
        totalConverted: convertedAppointments.length,
        statusBreakdown: convertedAppointments.reduce((acc, apt) => {
          acc[apt.status] = (acc[apt.status] || 0) + 1
          return acc
        }, {} as Record<string, number>),
        doctorBreakdown: convertedAppointments.reduce((acc, apt) => {
          acc[apt.doctor.name] = (acc[apt.doctor.name] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      })

      // Sync all appointments to Supabase
      await AppointmentSyncService.syncAllAppointments(convertedAppointments, user)

      // Update paid appointment statuses
      await AppointmentSyncService.updatePaidAppointmentStatuses(user)

      // Apply Supabase status updates
      const updatedAppointments = await AppointmentSyncService.applySupabaseStatusUpdates(convertedAppointments, user)

      console.log('📋 Final appointments after Supabase sync:', {
        totalFinal: updatedAppointments.length,
        statusBreakdown: updatedAppointments.reduce((acc, apt) => {
          acc[apt.status] = (acc[apt.status] || 0) + 1
          return acc
        }, {} as Record<string, number>),
        doctorBreakdown: updatedAppointments.reduce((acc, apt) => {
          acc[apt.doctor.name] = (acc[apt.doctor.name] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      })

      console.log(`Carregados ${updatedAppointments.length} agendamentos válidos, excluindo calendários de feriados.`)

      return {
        appointments: updatedAppointments,
        doctorCalendars: targetCalendars
      }
    } catch (error) {
      console.error('Erro detalhado ao buscar eventos:', error)
      throw error
    }
  }

  /**
   * Fetch events from multiple calendars
   */
  private static async fetchEventsFromCalendars(accessToken: string, calendars: CalendarListEntry[]) {
    const eventPromises = calendars.map(cal => 
      calendarService.fetchEvents(accessToken, cal.id).then(events => ({
        calendarId: cal.id,
        calendarSummary: cal.summary,
        events,
      }))
    )
    
    return await Promise.all(eventPromises)
  }

  /**
   * Convert calendar events to appointments
   */
  private static convertEventsToAppointments(eventsPerCalendar: any[], userEmail: string): Appointment[] {
    return eventsPerCalendar.flatMap(({ calendarId, calendarSummary, events }) =>
        events.map(event => {
          const appointment = calendarService.convertToAppointment(event, userEmail)
          appointment.doctor.name = calendarSummary
          appointment.doctor.calendarId = calendarId
          return appointment
        })
      )
      // Filter only appointments with valid dates
      .filter(appointment => {
        const hasValidDate = !isNaN(appointment.start.getTime()) && !isNaN(appointment.end.getTime())
        if (!hasValidDate) {
          console.log(`❌ Filtering out appointment with invalid date: "${appointment.title}"`)
        }
        return hasValidDate
      })
      .sort((a, b) => a.start.getTime() - b.start.getTime())
  }
}
