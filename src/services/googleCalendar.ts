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
  console.log('Google API Request:', {
    url,
    method: options.method || 'GET',
    hasToken: !!accessToken,
    tokenPrefix: accessToken?.substring(0, 20) + '...'
  })

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  console.log('Google API Response:', {
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries())
  })

  if (!response.ok) {
    const errorText = await response.text()
    let errorData
    try {
      errorData = JSON.parse(errorText)
    } catch {
      errorData = { message: errorText }
    }
    
    console.error('Google API Error Details:', {
      status: response.status,
      statusText: response.statusText,
      errorData,
      url
    })
    
    const errorMessage = errorData?.error?.message || 
                        errorData?.message || 
                        `Request failed with status ${response.status}: ${response.statusText}`
    throw new Error(errorMessage)
  }

  if (response.status === 204) {
    return null
  }

  const data = await response.json()
  console.log('Google API Success Response:', {
    itemsCount: data.items?.length || 0,
    hasNextPageToken: !!data.nextPageToken
  })

  return data
}

export class GoogleCalendarService {
  private checkToken(accessToken?: string | null): asserts accessToken is string {
    if (!accessToken) {
      throw new Error('Google access token is required')
    }
  }

  async fetchEvents(accessToken: string | null, timeMin?: string, timeMax?: string): Promise<CalendarEvent[]> {
    this.checkToken(accessToken)
    
    const params = new URLSearchParams({
      timeMin: timeMin || new Date().toISOString(),
      showDeleted: 'true',
      singleEvents: 'true',
      orderBy: 'startTime',
      maxResults: '50',
    })
    if (timeMax) {
      params.append('timeMax', timeMax)
    }

    const url = `${GOOGLE_API_BASE_URL}/calendars/${CALENDAR_ID}/events?${params.toString()}`
    
    const data = await googleApiRequest(url, accessToken)

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

  convertToAppointment(event: CalendarEvent, doctorEmail: string): Appointment {
    const patientName = this.extractPatientName(event.summary)
    const patientEmail = event.attendees?.find(a => a.email !== doctorEmail)?.email || ''
    const patientPhone = this.extractPatientPhone(event.description)
    
    return {
      id: event.id,
      title: event.summary,
      start: new Date(event.start.dateTime),
      end: new Date(event.end.dateTime),
      description: event.description,
      patient: {
        name: patientName,
        email: patientEmail,
        phone: patientPhone
      },
      doctor: {
        name: 'Dr. Sistema',
        email: doctorEmail
      },
      status: this.convertGCalStatus(event.status),
      type: this.determineAppointmentType(event.summary)
    }
  }

  private extractPatientName(summary: string): string {
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

  private convertGCalStatus(status?: 'confirmed' | 'tentative' | 'cancelled'): 'scheduled' | 'completed' | 'cancelled' {
    if (status === 'cancelled') {
      return 'cancelled'
    }
    return 'scheduled'
  }

  private extractPatientPhone(description?: string): string | undefined {
    if (!description) {
      return undefined
    }
    const phoneRegex = /(?:telefone|celular|contato|phone|cell|tel)\s*[:\- ]?\s*(\+?[0-9\s.\-()]{8,})/i
    const match = description.match(phoneRegex)
    return match ? match[1].trim() : undefined
  }
}

// Removing the global type declaration for 'gapi' as it conflicts with
// the more specific types provided by @types/gapi.client and @types/gapi.auth2.
