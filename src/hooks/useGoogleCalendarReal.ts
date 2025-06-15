
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

  console.log('useGoogleCalendarReal - Auth state:', {
    user: user?.email,
    hasSession: !!session,
    hasProviderToken: !!accessToken,
    providerTokenLength: accessToken?.length,
    sessionProvider: session?.app_metadata?.provider,
    userMetadata: user?.user_metadata
  })

  const fetchAppointments = async (): Promise<void> => {
    if (!isGoogleSignedIn || !user) {
      console.log('Não é possível buscar agendamentos - não autenticado')
      return
    }

    console.log('Iniciando busca de agendamentos...', {
      accessToken: accessToken?.substring(0, 20) + '...',
      userEmail: user.email
    })

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
      console.error('Erro detalhado ao buscar eventos:', {
        error: err,
        message: err.message,
        status: err.status,
        response: err.response
      })
      
      const errorMessage = err.message || 'Erro ao carregar agendamentos'
      if (err.message.includes('401') || err.message.includes('Invalid Credentials')) {
        setError('Sessão do Google expirada. Por favor, conecte novamente.')
      } else if (err.message.includes('403')) {
        setError('Acesso negado ao Google Calendar. Verifique as permissões e configurações OAuth.')
      } else {
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log('useEffect triggered:', { isGoogleSignedIn, user: !!user, authLoading })
    
    if (isGoogleSignedIn && user && !authLoading) {
      console.log('Conditions met, fetching appointments...')
      fetchAppointments()
    } else {
      console.log('Clearing appointments - conditions not met')
      setAppointments([])
    }
  }, [isGoogleSignedIn, user, authLoading])

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
    console.log('Iniciando login do Google...')
    try {
      await signInWithGoogle()
      console.log('Login do Google completado')
    } catch (err) {
      console.error('Erro no login do Google:', err)
      setError('Erro ao conectar com Google. Tente novamente.')
    }
  }

  const handleGoogleSignOut = async (): Promise<void> => {
    console.log('Iniciando logout do Google...')
    try {
      await signOut()
      console.log('Logout do Google completado')
    } catch (err) {
      console.error('Erro no logout do Google:', err)
    }
  }

  const handleGoogleSwitchAccount = async (): Promise<void> => {
    console.log('Iniciando troca de conta do Google...')
    try {
      await signInWithGoogle({ switchAccount: true })
      console.log('Troca de conta do Google completada')
    } catch (err) {
      console.error('Erro na troca de conta do Google:', err)
      setError('Erro ao trocar conta do Google. Tente novamente.')
    }
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
