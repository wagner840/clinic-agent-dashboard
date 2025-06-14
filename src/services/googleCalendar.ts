
import { CalendarEvent, Appointment } from '@/types/appointment'

const GOOGLE_API_KEY = 'AIzaSyDt7Oi3Y2OQcj7r6zh8kFFrw8PWzVsSCF0'
const CALENDAR_ID = 'primary'

interface GoogleCalendarEvent {
  id: string
  summary: string
  description?: string
  start: {
    dateTime: string
    timeZone?: string
  }
  end: {
    dateTime: string
    timeZone?: string
  }
  attendees?: Array<{
    email: string
    displayName?: string
  }>
}

export class GoogleCalendarService {
  private async initializeGapi() {
    if (!window.gapi) {
      throw new Error('Google API não carregada')
    }

    await window.gapi.load('client', async () => {
      await window.gapi.client.init({
        apiKey: GOOGLE_API_KEY,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest']
      })
    })
  }

  async fetchEvents(timeMin?: string, timeMax?: string): Promise<GoogleCalendarEvent[]> {
    try {
      await this.initializeGapi()
      
      const response = await window.gapi.client.calendar.events.list({
        calendarId: CALENDAR_ID,
        timeMin: timeMin || new Date().toISOString(),
        timeMax: timeMax,
        showDeleted: false,
        singleEvents: true,
        orderBy: 'startTime'
      })

      return response.result.items || []
    } catch (error) {
      console.error('Erro ao buscar eventos do Google Calendar:', error)
      throw error
    }
  }

  async createEvent(event: CalendarEvent): Promise<string> {
    try {
      await this.initializeGapi()
      
      const response = await window.gapi.client.calendar.events.insert({
        calendarId: CALENDAR_ID,
        resource: event
      })

      return response.result.id
    } catch (error) {
      console.error('Erro ao criar evento no Google Calendar:', error)
      throw error
    }
  }

  convertToAppointment(event: GoogleCalendarEvent, doctorEmail: string): Appointment {
    // Extrai informações do paciente do título ou descrição
    const patientName = this.extractPatientName(event.summary)
    const patientEmail = event.attendees?.find(a => a.email !== doctorEmail)?.email || ''
    
    return {
      id: event.id,
      title: event.summary,
      start: new Date(event.start.dateTime),
      end: new Date(event.end.dateTime),
      description: event.description,
      patient: {
        name: patientName,
        email: patientEmail
      },
      doctor: {
        name: 'Dr. Sistema',
        email: doctorEmail
      },
      status: 'scheduled',
      type: this.determineAppointmentType(event.summary)
    }
  }

  private extractPatientName(summary: string): string {
    // Extrai o nome do paciente do título
    const match = summary.match(/(?:Consulta|Retorno|Procedimento)\s*-\s*(.+)/i)
    return match ? match[1].trim() : summary
  }

  private determineAppointmentType(summary: string): 'consultation' | 'procedure' | 'follow-up' {
    const lowerSummary = summary.toLowerCase()
    if (lowerSummary.includes('retorno') || lowerSummary.includes('follow')) {
      return 'follow-up'
    }
    if (lowerSummary.includes('procedimento') || lowerSummary.includes('cirurgia')) {
      return 'procedure'
    }
    return 'consultation'
  }
}

// Adiciona tipos globais para a API do Google
declare global {
  interface Window {
    gapi: any
  }
}
