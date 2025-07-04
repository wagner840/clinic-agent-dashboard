
import { CalendarEvent, Appointment } from '@/types/appointment'

export function buildEventDescription(appointmentData: {
  patientEmail?: string
  patientPhone?: string
  description?: string
}): string {
  const parts = []
  
  if (appointmentData.patientEmail) {
    parts.push(`Email: ${appointmentData.patientEmail}`)
  }
  
  if (appointmentData.patientPhone) {
    parts.push(`Telefone: ${appointmentData.patientPhone}`)
  }
  
  if (appointmentData.description) {
    parts.push(`Observações: ${appointmentData.description}`)
  }
  
  return parts.join('\n')
}

export function convertToAppointment(event: CalendarEvent, doctorEmail: string): Appointment {
  const patientName = extractPatientName(event.summary)
  const patientEmail = event.attendees?.find(a => a.email !== doctorEmail)?.email || ''
  const patientPhone = extractPatientPhone(event.description)
  const startDate = new Date(event.start.dateTime)
  const endDate = new Date(event.end.dateTime)
  
  return {
    id: event.id,
    title: event.summary,
    start: startDate,
    end: endDate,
    start_time: event.start.dateTime,
    end_time: event.end.dateTime,
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
    doctor_name: 'Dr. Sistema',
    doctor_email: doctorEmail,
    patient_name: patientName,
    status: convertGCalStatus(event.status),
    type: determineAppointmentType(event.summary)
  }
}

function extractPatientName(summary: string): string {
  const match = summary.match(/(?:Consulta|Retorno|Procedimento)\s*-\s*(.+)/i)
  return match ? match[1].trim() : summary
}

function determineAppointmentType(summary: string): 'consultation' | 'procedure' | 'follow-up' | 'private' | 'insurance' {
  const lowerSummary = summary.toLowerCase()
  if (lowerSummary.includes('retorno') || lowerSummary.includes('follow')) {
    return 'follow-up'
  }
  if (lowerSummary.includes('procedimento') || lowerSummary.includes('cirurgia')) {
    return 'procedure'
  }
  if (lowerSummary.includes('particular') || lowerSummary.includes('private')) {
    return 'private'
  }
  if (lowerSummary.includes('convênio') || lowerSummary.includes('insurance')) {
    return 'insurance'
  }
  return 'consultation'
}

function convertGCalStatus(status?: 'confirmed' | 'tentative' | 'cancelled'): 'scheduled' | 'completed' | 'cancelled' {
  if (status === 'cancelled') {
    return 'cancelled'
  }
  return 'scheduled'
}

function extractPatientPhone(description?: string): string | undefined {
  if (!description) {
    return undefined
  }
  const phoneRegex = /(?:telefone|celular|contato|phone|cell|tel)\s*[:\- ]?\s*(\+?[0-9\s.\-()]{8,})/i
  const match = description.match(phoneRegex)
  return match ? match[1].trim() : undefined
}
