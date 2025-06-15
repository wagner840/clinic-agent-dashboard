
import { useState, useEffect } from 'react'
import { Appointment } from '@/types/appointment'
import { GoogleCalendarService } from '@/services/googleCalendar'
import { useAuth } from './useAuth'
import { useGoogleOAuth } from './useGoogleOAuth'

export function useGoogleCalendarReal() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const { 
    isSignedIn: isGoogleSignedIn, 
    isInitialized: isGoogleInitialized, 
    error: googleError,
    signIn: googleSignIn,
    signOut: googleSignOut,
    switchAccount: googleSwitchAccount,
    clearError: clearGoogleError
  } = useGoogleOAuth()

  const calendarService = new GoogleCalendarService()

  const fetchAppointments = async (): Promise<void> => {
    if (!isGoogleInitialized || !isGoogleSignedIn || !user) {
      console.log('Não é possível buscar eventos:', {
        isGoogleInitialized,
        isGoogleSignedIn,
        hasUser: !!user
      })
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      const events = await calendarService.fetchEvents()
      const convertedAppointments = events.map(event => 
        calendarService.convertToAppointment(event, user.email || '')
      )
      
      setAppointments(convertedAppointments)
      console.log(`Carregados ${convertedAppointments.length} agendamentos do Google Calendar`)
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao carregar agendamentos'
      setError(errorMessage)
      console.error('Erro ao buscar eventos:', err)
    } finally {
      setLoading(false)
    }
  }

  // Auto-fetch quando Google estiver autenticado
  useEffect(() => {
    if (isGoogleInitialized && isGoogleSignedIn && user) {
      fetchAppointments()
    }
  }, [isGoogleInitialized, isGoogleSignedIn, user])

  // Combinar erros do Google OAuth com erros locais
  const combinedError = error || googleError

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
    await googleSignIn()
  }

  const handleGoogleSignOut = async (): Promise<void> => {
    await googleSignOut()
  }

  const handleGoogleSwitchAccount = async (): Promise<void> => {
    await googleSwitchAccount()
  }

  return {
    appointments,
    loading,
    error: combinedError,
    fetchAppointments,
    getTodayAppointments,
    getUpcomingAppointments,
    // Estados do Google OAuth
    isGoogleInitialized,
    isGoogleSignedIn,
    googleSignIn: handleGoogleSignIn,
    googleSignOut: handleGoogleSignOut,
    googleSwitchAccount: handleGoogleSwitchAccount,
    clearError: () => {
      setError(null)
      clearGoogleError()
    }
  }
}
