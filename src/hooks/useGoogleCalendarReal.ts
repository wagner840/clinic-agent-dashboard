
import { useState, useEffect } from 'react'
import { Appointment } from '@/types/appointment'
import { GoogleCalendarService } from '@/services/googleCalendar'
import { useAuth } from './useAuth'

export function useGoogleCalendarReal() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isGapiLoaded, setIsGapiLoaded] = useState(false)
  const { user } = useAuth()

  const calendarService = new GoogleCalendarService()

  // Carrega a API do Google
  useEffect(() => {
    const loadGoogleAPI = () => {
      const script = document.createElement('script')
      script.src = 'https://apis.google.com/js/api.js'
      script.onload = () => {
        setIsGapiLoaded(true)
      }
      script.onerror = () => {
        setError('Erro ao carregar a API do Google')
      }
      document.head.appendChild(script)
    }

    if (!window.gapi) {
      loadGoogleAPI()
    } else {
      setIsGapiLoaded(true)
    }
  }, [])

  const fetchAppointments = async () => {
    if (!isGapiLoaded || !user) return

    setLoading(true)
    setError(null)
    
    try {
      const events = await calendarService.fetchEvents()
      const convertedAppointments = events.map(event => 
        calendarService.convertToAppointment(event, user.email || '')
      )
      
      setAppointments(convertedAppointments)
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar agendamentos')
      console.error('Erro:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isGapiLoaded && user) {
      fetchAppointments()
    }
  }, [isGapiLoaded, user])

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
    getUpcomingAppointments,
    isGapiLoaded
  }
}
