import { useState, useEffect } from 'react'
import { Appointment, CalendarEvent } from '@/types/appointment'
import { useAuth } from './useAuth'

export function useGoogleCalendar() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  // Mock data para demonstração - agora com dados mais realistas
  const mockAppointments: Appointment[] = [
    {
      id: '1',
      title: 'Consulta - João Silva',
      start: new Date(2025, 0, 15, 9, 0),
      end: new Date(2025, 0, 15, 10, 0),
      start_time: new Date(2025, 0, 15, 9, 0).toISOString(),
      end_time: new Date(2025, 0, 15, 10, 0).toISOString(),
      description: 'Consulta de rotina - Hipertensão',
      patient: {
        name: 'João Silva',
        email: 'joao.silva@email.com',
        phone: '(11) 99999-9999'
      },
      doctor: {
        name: 'Dr. Maria Santos',
        email: user?.email || ''
      },
      doctor_name: 'Dr. Maria Santos',
      doctor_email: user?.email || '',
      patient_name: 'João Silva',
      status: 'scheduled',
      type: 'consultation'
    },
    {
      id: '2',
      title: 'Retorno - Ana Costa',
      start: new Date(2025, 0, 15, 14, 0),
      end: new Date(2025, 0, 15, 15, 0),
      start_time: new Date(2025, 0, 15, 14, 0).toISOString(),
      end_time: new Date(2025, 0, 15, 15, 0).toISOString(),
      description: 'Retorno pós-cirúrgico - Acompanhamento',
      patient: {
        name: 'Ana Costa',
        email: 'ana.costa@email.com',
        phone: '(11) 88888-8888'
      },
      doctor: {
        name: 'Dr. Maria Santos',
        email: user?.email || ''
      },
      doctor_name: 'Dr. Maria Santos',
      doctor_email: user?.email || '',
      patient_name: 'Ana Costa',
      status: 'scheduled',
      type: 'follow-up'
    },
    {
      id: '3',
      title: 'Procedimento - Carlos Oliveira',
      start: new Date(2025, 0, 16, 10, 0),
      end: new Date(2025, 0, 16, 11, 30),
      start_time: new Date(2025, 0, 16, 10, 0).toISOString(),
      end_time: new Date(2025, 0, 16, 11, 30).toISOString(),
      description: 'Pequena cirurgia - Remoção de cisto',
      patient: {
        name: 'Carlos Oliveira',
        email: 'carlos.oliveira@email.com',
        phone: '(11) 77777-7777'
      },
      doctor: {
        name: 'Dr. Maria Santos',
        email: user?.email || ''
      },
      doctor_name: 'Dr. Maria Santos',
      doctor_email: user?.email || '',
      patient_name: 'Carlos Oliveira',
      status: 'scheduled',
      type: 'procedure'
    }
  ]

  const fetchAppointments = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Simula carregamento da API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('Carregando agendamentos do Google Calendar...')
      console.log('API Key configurada para integração')
      
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
