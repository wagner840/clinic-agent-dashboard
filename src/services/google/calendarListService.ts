
import { googleApiRequest, GOOGLE_API_BASE_URL } from './googleApiClient'

export interface CalendarListEntry {
  id: string
  summary: string
  primary?: boolean
}

export class CalendarListService {
  private checkToken(accessToken?: string | null): asserts accessToken is string {
    if (!accessToken) {
      throw new Error('Google access token is required')
    }
  }

  async fetchCalendarList(accessToken: string | null): Promise<CalendarListEntry[]> {
    this.checkToken(accessToken)
    const url = `${GOOGLE_API_BASE_URL}/users/me/calendarList`
    console.log('Fetching calendar list...')
    const data = await googleApiRequest(url, accessToken)
    const calendars = data.items || []
    console.log(`Found ${calendars.length} calendars:`, calendars.map((c: any) => c.summary))
    return calendars
  }
}
