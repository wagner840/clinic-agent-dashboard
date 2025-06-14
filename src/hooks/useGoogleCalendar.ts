
import { useState, useEffect } from 'react'
import { Appointment, CalendarEvent } from '@/types/appointment'
import { useAuth } from './useAuth'

export function useGoogleCalendar() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  // Mock data para demonstração - em produção isso viria da API do Google Calendar
  const mockAppointments: Appointment[] = [
    {
      id: '1',
      title: 'Consulta - João Silva',
      start: new Date(2024, 0, 15, 9, 0),
      end: new Date(2024, 0, 15, 10, 0),
      description: 'Consulta de rotina',
      patient: {
        name: 'João Silva',
        email: 'joao@email.com',
        phone: '(11) 99999-9999'
      },
      doctor: {
        name: 'Dr. Maria Santos',
        email: user?.email || ''
      },
      status: 'scheduled',
      type: 'consultation'
    },
    {
      id: '2',
      title: 'Retorno - Ana Costa',
      start: new Date(2024, 0, 15, 14, 0),
      end: new Date(2024, 0, 15, 15, 0),
      description: 'Retorno pós-cirúrgico',
      patient: {
        name: 'Ana Costa',
        email: 'ana@email.com',
        phone: '(11) 88888-8888'
      },
      doctor: {
        name: 'Dr. Maria Santos',
        email: user?.email || ''
      },
      status: 'scheduled',
      type: 'follow-up'
    }
  ]

  const fetchAppointments = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Simula carregamento da API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Em produção, aqui seria feita a chamada para a API do Google Calendar
      // const response = await gapi.client.calendar.events.list({
      //   calendarId: 'primary',
      //   timeMin: new Date().toISOString(),
      //   showDeleted: false,
      //   singleEvents: true,
      //   orderBy: 'startTime'
      // })
      
      setAppointments(mockAppointments)
    } catch (err) {
      setError('Erro ao carregar agendamentos')
      console.error('Erro:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchAppointments()
    }
  }, [user])

  const getTodayAppointments = () => {
    const today = new Date()
    return appointments.filter(apt => {
      const aptDate = new Date(apt.start)
      return aptDate.toDateString() === today.toDateString()
    })
  }

  const getUpcomingAppointments = () => {
    const now = new Date()
    return appointments.filter(apt => new Date(apt.start) > now)
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
  }

  return {
    appointments,
    loading,
    error,
    fetchAppointments,
    getTodayAppointments,
    getUpcomingAppointments
  }
}
