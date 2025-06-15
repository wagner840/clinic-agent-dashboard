
import { googleApiRequest, GOOGLE_API_BASE_URL } from './googleApiClient'

export interface CreateCalendarRequest {
  summary: string
  description?: string
  timeZone?: string
}

export interface CalendarResource {
  id: string
  summary: string
  description?: string
  timeZone: string
}

export class CalendarManagementService {
  private checkToken(accessToken?: string | null): asserts accessToken is string {
    if (!accessToken) {
      throw new Error('Google access token is required')
    }
  }

  async createCalendar(accessToken: string | null, calendarData: CreateCalendarRequest): Promise<CalendarResource> {
    this.checkToken(accessToken)
    
    const calendar = {
      summary: calendarData.summary,
      description: calendarData.description || `Agenda médica - ${calendarData.summary}`,
      timeZone: calendarData.timeZone || 'America/Sao_Paulo'
    }

    console.log('Creating new calendar:', calendar.summary)
    const data = await googleApiRequest(
      `${GOOGLE_API_BASE_URL}/calendars`,
      accessToken,
      {
        method: 'POST',
        body: JSON.stringify(calendar),
      }
    )

    // Automatically add Brazilian holidays to the new calendar
    await this.addBrazilianHolidays(accessToken, data.id)

    return data
  }

  async deleteCalendar(accessToken: string | null, calendarId: string): Promise<void> {
    this.checkToken(accessToken)
    
    console.log('Deleting calendar:', calendarId)
    await googleApiRequest(
      `${GOOGLE_API_BASE_URL}/calendars/${encodeURIComponent(calendarId)}`,
      accessToken,
      {
        method: 'DELETE',
      }
    )
  }

  private async addBrazilianHolidays(accessToken: string | null, calendarId: string): Promise<void> {
    this.checkToken(accessToken)
    
    console.log('Adding Brazilian holidays to calendar:', calendarId)
    
    // Define principais feriados brasileiros para 2025
    const holidays = [
      { date: '2025-01-01', name: 'Confraternização Universal' },
      { date: '2025-02-28', name: 'Carnaval' }, // Segunda de Carnaval
      { date: '2025-03-01', name: 'Carnaval' }, // Terça de Carnaval
      { date: '2025-04-18', name: 'Sexta-feira Santa' },
      { date: '2025-04-21', name: 'Tiradentes' },
      { date: '2025-05-01', name: 'Dia do Trabalhador' },
      { date: '2025-09-07', name: 'Independência do Brasil' },
      { date: '2025-10-12', name: 'Nossa Senhora Aparecida' },
      { date: '2025-11-02', name: 'Finados' },
      { date: '2025-11-15', name: 'Proclamação da República' },
      { date: '2025-12-25', name: 'Natal' }
    ]

    for (const holiday of holidays) {
      try {
        const event = {
          summary: `🇧🇷 ${holiday.name}`,
          start: {
            date: holiday.date
          },
          end: {
            date: holiday.date
          },
          description: 'Feriado nacional brasileiro',
          transparency: 'transparent', // Não conta como ocupado
          visibility: 'public'
        }

        await googleApiRequest(
          `${GOOGLE_API_BASE_URL}/calendars/${encodeURIComponent(calendarId)}/events`,
          accessToken,
          {
            method: 'POST',
            body: JSON.stringify(event),
          }
        )
      } catch (error) {
        console.warn(`Failed to add holiday ${holiday.name}:`, error)
      }
    }
    
    console.log('✅ Brazilian holidays added to calendar')
  }

  async addHolidaysToExistingCalendars(accessToken: string | null, calendarIds: string[]): Promise<void> {
    this.checkToken(accessToken)
    
    console.log('Adding Brazilian holidays to existing calendars...')
    
    for (const calendarId of calendarIds) {
      try {
        await this.addBrazilianHolidays(accessToken, calendarId)
      } catch (error) {
        console.warn(`Failed to add holidays to calendar ${calendarId}:`, error)
      }
    }
  }
}
