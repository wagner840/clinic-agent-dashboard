
import { useState, useEffect } from 'react'
import { Appointment } from '@/types/appointment'
import { GoogleCalendarService } from '@/services/googleCalendar'
import { useAuth } from './useAuth'

export function useGoogleCalendarReal() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user, session, loading: authLoading, signInWithGoogle, signOut } = useAuth()

  const accessToken = session?.provider_token
  const isGoogleSignedIn = !!accessToken
  const calendarService = new GoogleCalendarService()

  const fetchAppointments = async (): Promise<void> => {
    if (!isGoogleSignedIn || !user) {
      // Don't fetch if not signed in, the useEffect will clear appointments
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      const events = await calendarService.fetchEvents(accessToken)
      const convertedAppointments = events.map(event => 
        calendarService.convertToAppointment(event, user?.email || '')
      )
      
      setAppointments(convertedAppointments)
      console.log(`Carregados ${convertedAppointments.length} agendamentos do Google Calendar`)
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao carregar agendamentos'
      if (err.message.includes('401') || err.message.includes('Invalid Credentials')) {
        setError('Sessão do Google expirada. Por favor, conecte novamente.')
      } else {
        setError(errorMessage)
      }
      console.error('Erro ao buscar eventos:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isGoogleSignedIn && user) {
      fetchAppointments()
    } else {
      setAppointments([])
    }
  }, [isGoogleSignedIn, user])

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

  const handleGoogleSignIn = async (): Promise<void> => {
    await signInWithGoogle()
  }

  const handleGoogleSignOut = async (): Promise<void> => {
    await signOut()
  }

  const handleGoogleSwitchAccount = async (): Promise<void> => {
    await signInWithGoogle({ switchAccount: true })
  }

  return {
    appointments,
    loading: loading || authLoading,
    error,
    fetchAppointments,
    getTodayAppointments,
    getUpcomingAppointments,
    isGoogleInitialized: !authLoading,
    isGoogleSignedIn,
    googleSignIn: handleGoogleSignIn,
    googleSignOut: handleGoogleSignOut,
    googleSwitchAccount: handleGoogleSwitchAccount,
    clearError: () => setError(null),
  }
}
