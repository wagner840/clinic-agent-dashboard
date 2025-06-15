
import { CalendarEvent, Appointment } from '@/types/appointment'

const CALENDAR_ID = 'primary'
const GOOGLE_API_BASE_URL = 'https://www.googleapis.com/calendar/v3'

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

async function googleApiRequest(url: string, accessToken: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const errorData = await response.json()
    console.error('Google API Error:', errorData)
    const errorMessage = errorData.error?.message || `Request failed with status ${response.status}`
    throw new Error(errorMessage)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

export class GoogleCalendarService {
  private checkToken(accessToken?: string | null): asserts accessToken is string {
    if (!accessToken) {
      throw new Error('Google access token is required')
    }
  }

  async fetchEvents(accessToken: string | null, timeMin?: string, timeMax?: string): Promise<GoogleCalendarEvent[]> {
    this.checkToken(accessToken)
    
    const params = new URLSearchParams({
      timeMin: timeMin || new Date().toISOString(),
      showDeleted: 'false',
      singleEvents: 'true',
      orderBy: 'startTime',
      maxResults: '50',
    })
    if (timeMax) {
      params.append('timeMax', timeMax)
    }

    const data = await googleApiRequest(
      `${GOOGLE_API_BASE_URL}/calendars/${CALENDAR_ID}/events?${params.toString()}`,
      accessToken
    )

    return data.items || []
  }

  async createEvent(accessToken: string | null, event: CalendarEvent): Promise<string> {
    this.checkToken(accessToken)
    
    const data = await googleApiRequest(
      `${GOOGLE_API_BASE_URL}/calendars/${CALENDAR_ID}/events`,
      accessToken,
      {
        method: 'POST',
        body: JSON.stringify(event),
      }
    )

    return data.id
  }

  async updateEvent(accessToken: string | null, eventId: string, event: Partial<CalendarEvent>): Promise<void> {
    this.checkToken(accessToken)
    
    await googleApiRequest(
      `${GOOGLE_API_BASE_URL}/calendars/${CALENDAR_ID}/events/${eventId}`,
      accessToken,
      {
        method: 'PATCH',
        body: JSON.stringify(event),
      }
    )
  }

  async deleteEvent(accessToken: string | null, eventId: string): Promise<void> {
    this.checkToken(accessToken)
    
    await googleApiRequest(
      `${GOOGLE_API_BASE_URL}/calendars/${CALENDAR_ID}/events/${eventId}`,
      accessToken,
      {
        method: 'DELETE',
      }
    )
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

// Tipos globais para a API do Google
declare global {
  interface Window {
    gapi: any
  }
}
