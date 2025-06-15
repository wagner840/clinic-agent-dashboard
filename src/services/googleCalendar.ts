
import { CalendarEvent, Appointment } from '@/types/appointment'
import { CalendarListService } from './google/calendarListService'
import { EventsService } from './google/eventsService'
import { AppointmentOperationsService } from './google/appointmentOperationsService'
import { CalendarManagementService, CreateCalendarRequest, CalendarResource } from './google/calendarManagementService'
import { convertToAppointment } from './google/appointmentUtils'

export interface CalendarListEntry {
  id: string
  summary: string
  primary?: boolean
}

export class GoogleCalendarService {
  private calendarListService = new CalendarListService()
  private eventsService = new EventsService()
  private appointmentOperationsService = new AppointmentOperationsService()
  private calendarManagementService = new CalendarManagementService()

  async fetchCalendarList(accessToken: string | null): Promise<CalendarListEntry[]> {
    return this.calendarListService.fetchCalendarList(accessToken)
  }

  async fetchEvents(accessToken: string | null, calendarId: string, timeMin?: string, timeMax?: string): Promise<CalendarEvent[]> {
    return this.eventsService.fetchEvents(accessToken, calendarId, timeMin, timeMax)
  }

  async createEvent(accessToken: string | null, calendarId: string, event: CalendarEvent): Promise<string> {
    return this.eventsService.createEvent(accessToken, calendarId, event)
  }

  async updateEvent(accessToken: string | null, calendarId: string, eventId: string, event: Partial<CalendarEvent>): Promise<void> {
    return this.eventsService.updateEvent(accessToken, calendarId, eventId, event)
  }

  async deleteEvent(accessToken: string | null, calendarId: string, eventId: string): Promise<void> {
    return this.eventsService.deleteEvent(accessToken, calendarId, eventId)
  }

  async findEventInCalendars(accessToken: string | null, eventId: string, calendarIds: string[]): Promise<{ calendar: string; event: CalendarEvent } | null> {
    return this.eventsService.findEventInCalendars(accessToken, eventId, calendarIds)
  }

  async createAppointment(accessToken: string | null, calendarId: string, appointmentData: {
    patientName: string
    patientEmail?: string
    patientPhone?: string
    start: Date
    end: Date
    type: 'consultation' | 'procedure' | 'follow-up'
    description?: string
  }): Promise<string> {
    return this.appointmentOperationsService.createAppointment(accessToken, calendarId, appointmentData)
  }

  async rescheduleAppointment(accessToken: string | null, calendarIds: string[], eventId: string, newStart: Date, newEnd: Date): Promise<void> {
    return this.appointmentOperationsService.rescheduleAppointment(accessToken, calendarIds, eventId, newStart, newEnd)
  }

  async cancelAppointment(accessToken: string | null, calendarIds: string[], eventId: string): Promise<void> {
    return this.appointmentOperationsService.cancelAppointment(accessToken, calendarIds, eventId)
  }

  async reactivateAppointment(accessToken: string | null, calendarIds: string[], eventId: string): Promise<void> {
    return this.appointmentOperationsService.reactivateAppointment(accessToken, calendarIds, eventId)
  }

  async deleteAppointment(accessToken: string | null, calendarIds: string[], eventId: string): Promise<void> {
    return this.appointmentOperationsService.deleteAppointment(accessToken, calendarIds, eventId)
  }

  // Calendar management methods
  async createCalendar(accessToken: string | null, calendarData: CreateCalendarRequest): Promise<CalendarResource> {
    return this.calendarManagementService.createCalendar(accessToken, calendarData)
  }

  async deleteCalendar(accessToken: string | null, calendarId: string): Promise<void> {
    return this.calendarManagementService.deleteCalendar(accessToken, calendarId)
  }

  async addHolidaysToExistingCalendars(accessToken: string | null, calendarIds: string[]): Promise<void> {
    return this.calendarManagementService.addHolidaysToExistingCalendars(accessToken, calendarIds)
  }

  convertToAppointment(event: CalendarEvent, doctorEmail: string): Appointment {
    return convertToAppointment(event, doctorEmail)
  }
}
