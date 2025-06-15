
import { CalendarEvent } from '@/types/appointment'
import { EventsService } from './eventsService'
import { buildEventDescription } from './appointmentUtils'

export class AppointmentOperationsService {
  private eventsService = new EventsService()

  async createAppointment(accessToken: string | null, calendarId: string, appointmentData: {
    patientName: string
    patientEmail?: string
    patientPhone?: string
    start: Date
    end: Date
    type: 'consultation' | 'procedure' | 'follow-up'
    description?: string
  }): Promise<string> {
    const typeLabels = {
      consultation: 'Consulta',
      procedure: 'Procedimento',
      'follow-up': 'Retorno'
    }

    const event: CalendarEvent = {
      id: '',
      summary: `${typeLabels[appointmentData.type]} - ${appointmentData.patientName}`,
      description: buildEventDescription(appointmentData),
      start: {
        dateTime: appointmentData.start.toISOString(),
      },
      end: {
        dateTime: appointmentData.end.toISOString(),
      },
      attendees: appointmentData.patientEmail ? [{
        email: appointmentData.patientEmail,
        displayName: appointmentData.patientName
      }] : undefined,
      status: 'confirmed'
    }

    return this.eventsService.createEvent(accessToken, calendarId, event)
  }

  async rescheduleAppointment(accessToken: string | null, calendarIds: string[], eventId: string, newStart: Date, newEnd: Date): Promise<void> {
    const eventInfo = await this.eventsService.findEventInCalendars(accessToken, eventId, calendarIds)
    
    if (!eventInfo) {
      throw new Error('Evento não encontrado em nenhum calendário')
    }

    const updateData = {
      start: {
        dateTime: newStart.toISOString(),
      },
      end: {
        dateTime: newEnd.toISOString(),
      }
    }

    await this.eventsService.updateEvent(accessToken, eventInfo.calendar, eventId, updateData)
    console.log(`Event ${eventId} rescheduled successfully in calendar ${eventInfo.calendar}`)
  }

  async cancelAppointment(accessToken: string | null, calendarIds: string[], eventId: string): Promise<void> {
    const eventInfo = await this.eventsService.findEventInCalendars(accessToken, eventId, calendarIds)
    
    if (!eventInfo) {
      throw new Error('Evento não encontrado em nenhum calendário')
    }

    await this.eventsService.updateEvent(accessToken, eventInfo.calendar, eventId, { status: 'cancelled' })
    console.log(`Event ${eventId} cancelled successfully in calendar ${eventInfo.calendar}`)
  }

  async reactivateAppointment(accessToken: string | null, calendarIds: string[], eventId: string): Promise<void> {
    const eventInfo = await this.eventsService.findEventInCalendars(accessToken, eventId, calendarIds)
    
    if (!eventInfo) {
      throw new Error('Evento não encontrado em nenhum calendário')
    }

    await this.eventsService.updateEvent(accessToken, eventInfo.calendar, eventId, { status: 'confirmed' })
    console.log(`Event ${eventId} reactivated successfully in calendar ${eventInfo.calendar}`)
  }

  async deleteAppointment(accessToken: string | null, calendarIds: string[], eventId: string): Promise<void> {
    const eventInfo = await this.eventsService.findEventInCalendars(accessToken, eventId, calendarIds)
    
    if (!eventInfo) {
      throw new Error('Evento não encontrado em nenhum calendário')
    }

    await this.eventsService.deleteEvent(accessToken, eventInfo.calendar, eventId)
    console.log(`Event ${eventId} deleted successfully from calendar ${eventInfo.calendar}`)
  }
}
