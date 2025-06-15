
import { Appointment } from '@/types/appointment'

export function createTestAppointments(): Appointment[] {
  const now = new Date()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  yesterday.setHours(14, 0, 0, 0)
  
  const lastWeek = new Date(now)
  lastWeek.setDate(lastWeek.getDate() - 7)
  lastWeek.setHours(10, 0, 0, 0)
  
  const todayPast = new Date(now)
  todayPast.setHours(9, 0, 0, 0)
  
  const todayFuture = new Date(now)
  todayFuture.setHours(16, 0, 0, 0)
  
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(14, 0, 0, 0)

  return [
    {
      id: 'test-past-1',
      title: 'Consulta - Maria Silva',
      start: yesterday,
      end: new Date(yesterday.getTime() + 60 * 60 * 1000), // 1 hour later
      patient: {
        name: 'Maria Silva',
        email: 'maria@test.com'
      },
      doctor: {
        name: 'Dr. João',
        email: 'joao@test.com'
      },
      status: 'scheduled',
      type: 'consultation'
    },
    {
      id: 'test-past-2',
      title: 'Procedimento - João Santos',
      start: lastWeek,
      end: new Date(lastWeek.getTime() + 2 * 60 * 60 * 1000), // 2 hours later
      patient: {
        name: 'João Santos',
        email: 'joao.santos@test.com'
      },
      doctor: {
        name: 'Dr. João',
        email: 'joao@test.com'
      },
      status: 'scheduled',
      type: 'procedure'
    },
    {
      id: 'test-completed-1',
      title: 'Consulta - Ana Costa',
      start: lastWeek,
      end: new Date(lastWeek.getTime() + 60 * 60 * 1000),
      patient: {
        name: 'Ana Costa',
        email: 'ana@test.com'
      },
      doctor: {
        name: 'Dr. João',
        email: 'joao@test.com'
      },
      status: 'completed',
      type: 'consultation'
    },
    {
      id: 'test-today-past',
      title: 'Consulta - Pedro Lima',
      start: todayPast,
      end: new Date(todayPast.getTime() + 60 * 60 * 1000),
      patient: {
        name: 'Pedro Lima',
        email: 'pedro@test.com'
      },
      doctor: {
        name: 'Dr. João',
        email: 'joao@test.com'
      },
      status: 'scheduled',
      type: 'consultation'
    },
    {
      id: 'test-today-future',
      title: 'Consulta - Laura Oliveira',
      start: todayFuture,
      end: new Date(todayFuture.getTime() + 60 * 60 * 1000),
      patient: {
        name: 'Laura Oliveira',
        email: 'laura@test.com'
      },
      doctor: {
        name: 'Dr. João',
        email: 'joao@test.com'
      },
      status: 'scheduled',
      type: 'consultation'
    },
    {
      id: 'test-upcoming',
      title: 'Consulta - Carlos Mendes',
      start: tomorrow,
      end: new Date(tomorrow.getTime() + 60 * 60 * 1000),
      patient: {
        name: 'Carlos Mendes',
        email: 'carlos@test.com'
      },
      doctor: {
        name: 'Dr. João',
        email: 'joao@test.com'
      },
      status: 'scheduled',
      type: 'consultation'
    }
  ]
}

export function logTestAppointmentDetails() {
  const testAppointments = createTestAppointments()
  const now = new Date()
  
  console.log('🧪 Test appointments created:', {
    currentTime: now,
    appointments: testAppointments.map(apt => ({
      id: apt.id,
      patient: apt.patient.name,
      start: apt.start,
      status: apt.status,
      isPast: apt.start < now,
      isToday: apt.start.toDateString() === now.toDateString()
    }))
  })
  
  return testAppointments
}
