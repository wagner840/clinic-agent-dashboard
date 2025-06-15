
import { googleApiRequest, GOOGLE_API_BASE_URL } from './googleApiClient'
import { CalendarEvent } from '@/types/appointment'

export class EventsService {
  private checkToken(accessToken?: string | null): asserts accessToken is string {
    if (!accessToken) {
      throw new Error('Google access token is required')
    }
  }

  async fetchEvents(accessToken: string | null, calendarId: string, timeMin?: string, timeMax?: string): Promise<CalendarEvent[]> {
    this.checkToken(accessToken)
    
    const params = new URLSearchParams({
      timeMin: timeMin || new Date().toISOString(),
      showDeleted: 'true',
      singleEvents: 'true',
      orderBy: 'startTime',
      maxResults: '250',
    })
    if (timeMax) {
      params.append('timeMax', timeMax)
    }

    const url = `${GOOGLE_API_BASE_URL}/calendars/${encodeURIComponent(calendarId)}/events?${params.toString()}`
    
    console.log(`Fetching events for calendar: ${calendarId}`)
    const data = await googleApiRequest(url, accessToken)

    return data.items || []
  }

  async createEvent(accessToken: string | null, calendarId: string, event: CalendarEvent): Promise<string> {
    this.checkToken(accessToken)
    
    const data = await googleApiRequest(
      `${GOOGLE_API_BASE_URL}/calendars/${encodeURIComponent(calendarId)}/events`,
      accessToken,
      {
        method: 'POST',
        body: JSON.stringify(event),
      }
    )

    return data.id
  }

  async updateEvent(accessToken: string | null, calendarId: string, eventId: string, event: Partial<CalendarEvent>): Promise<void> {
    this.checkToken(accessToken)
    
    await googleApiRequest(
      `${GOOGLE_API_BASE_URL}/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
      accessToken,
      {
        method: 'PATCH',
        body: JSON.stringify(event),
      }
    )
  }

  async deleteEvent(accessToken: string | null, calendarId: string, eventId: string): Promise<void> {
    this.checkToken(accessToken)
    
    await googleApiRequest(
      `${GOOGLE_API_BASE_URL}/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
      accessToken,
      {
        method: 'DELETE',
      }
    )
  }

  async findEventInCalendars(accessToken: string | null, eventId: string, calendarIds: string[]): Promise<{ calendar: string; event: CalendarEvent } | null> {
    this.checkToken(accessToken)
    
    console.log(`Searching for event ${eventId} in ${calendarIds.length} calendars`)
    
    for (const calendarId of calendarIds) {
      try {
        const url = `${GOOGLE_API_BASE_URL}/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`
        const event = await googleApiRequest(url, accessToken)
        console.log(`Event ${eventId} found in calendar ${calendarId}`)
        return { calendar: calendarId, event }
      } catch (error: any) {
        if (error.message.includes('404') || error.message.includes('Not Found')) {
          console.log(`Event ${eventId} not found in calendar ${calendarId}`)
          continue
        }
        throw error
      }
    }
    
    console.log(`Event ${eventId} not found in any calendar`)
    return null
  }
}
