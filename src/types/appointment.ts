
export interface Appointment {
  id: string
  title: string
  start: Date
  end: Date
  start_time: string // Add start_time for database compatibility
  end_time: string // Add end_time for database compatibility
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
  doctor_name: string // Add doctor_name for database compatibility
  doctor_email: string // Add doctor_email for database compatibility
  patient_name: string // Add patient_name for database compatibility
  status: 'scheduled' | 'completed' | 'cancelled'
  type: 'consultation' | 'procedure' | 'follow-up' | 'private' | 'insurance' // Update type to include payment types
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
