
export interface Appointment {
  id: string
  title: string
  start: Date
  end: Date
  description?: string
  patient: {
    name: string
    email?: string
    phone?: string
  }
  doctor: {
    name: string
    email: string
    calendarId?: string
  }
  status: 'scheduled' | 'completed' | 'cancelled'
  type: 'consultation' | 'procedure' | 'follow-up'
}

export interface CalendarEvent {
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
  status?: 'confirmed' | 'tentative' | 'cancelled'
}
