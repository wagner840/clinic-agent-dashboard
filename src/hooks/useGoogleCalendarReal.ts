
import { useState, useEffect, useCallback } from 'react'
import { gapi } from 'gapi-script'
import { Appointment } from '@/types/appointment'
import { GoogleCalendarService } from '@/services/googleCalendar'
import { useAuth } from './useAuth'
import { GOOGLE_CLIENT_ID, GOOGLE_CALENDAR_SCOPES } from '@/lib/google'

export function useGoogleCalendarReal() {
  const { user, loading: authLoading } = useAuth()
  
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [googleAuth, setGoogleAuth] = useState<gapi.auth2.GoogleAuth | null>(null)
  const [isGoogleInitialized, setIsGoogleInitialized] = useState(false)
  const [isGoogleSignedIn, setIsGoogleSignedIn] = useState(false)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [googleProfile, setGoogleProfile] = useState<gapi.auth2.BasicProfile | null>(null)
  
  const calendarService = new GoogleCalendarService()

  const fetchAppointmentsCallback = useCallback(async (token: string): Promise<void> => {
    if (!token || !user) {
      console.log('Não é possível buscar agendamentos - token ou usuário ausente')
      return
    }

    console.log('Iniciando busca de agendamentos com nova auth...')
    setLoading(true)
    setError(null)
    
    try {
      const events = await calendarService.fetchEvents(token)
      const convertedAppointments = events.map(event => 
        calendarService.convertToAppointment(event, user?.email || '')
      )
      
      setAppointments(convertedAppointments)
      console.log(`Carregados ${convertedAppointments.length} agendamentos do Google Calendar`)
    } catch (err: any) {
      console.error('Erro detalhado ao buscar eventos:', err)
      const errorMessage = err.message || 'Erro ao carregar agendamentos'
      if (err.message.includes('401') || err.message.includes('Invalid Credentials')) {
        setError('Sessão do Google expirada. Por favor, conecte novamente.')
      } else if (err.message.includes('403')) {
        setError('Acesso negado ao Google Calendar. Verifique as permissões.')
      } else {
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    const initClient = () => {
      gapi.client.init({
        clientId: GOOGLE_CLIENT_ID,
        scope: GOOGLE_CALENDAR_SCOPES,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest']
      }).then(() => {
        const authInstance = gapi.auth2.getAuthInstance()
        setGoogleAuth(authInstance)
        setIsGoogleInitialized(true)
        
        const updateSigninStatus = (signedIn: boolean) => {
          setIsGoogleSignedIn(signedIn)
          if (signedIn) {
            const currentGoogleUser = authInstance.currentUser.get()
            const authResponse = currentGoogleUser.getAuthResponse(true) // get non-expired token
            setAccessToken(authResponse.access_token)
            setGoogleProfile(currentGoogleUser.getBasicProfile())
            console.log('Usuário Google conectado. Buscando agendamentos.')
            fetchAppointmentsCallback(authResponse.access_token)
          } else {
            setAccessToken(null)
            setGoogleProfile(null)
            setAppointments([])
            console.log('Usuário Google desconectado.')
          }
        }
        
        authInstance.isSignedIn.listen(updateSigninStatus)
        updateSigninStatus(authInstance.isSignedIn.get())
      }).catch(err => {
        console.error("Erro ao inicializar o Google Client", err)
        setError("Falha ao inicializar a integração com o Google. Verifique seu Client ID e a configuração no Google Cloud.")
        setIsGoogleInitialized(true)
      })
    }
    
    if (GOOGLE_CLIENT_ID.startsWith('YOUR_GOOGLE_CLIENT_ID_HERE')) {
        setError("Por favor, configure seu ID de Cliente do Google no arquivo 'src/lib/google.ts'")
        setIsGoogleInitialized(true)
        return
    }

    gapi.load('client:auth2', initClient)
  }, [fetchAppointmentsCallback])

  const handleGoogleSignIn = async () => {
    if (googleAuth) {
      try {
        await googleAuth.signIn()
      } catch (err: any) {
        console.error("Erro ao fazer login com Google:", err)
        if (err.error === 'popup_closed_by_user') {
          setError("A janela de login do Google foi fechada antes da conclusão.")
        } else {
          setError("Ocorreu um erro ao tentar fazer login com o Google.")
        }
      }
    }
  }

  const handleGoogleSignOut = async () => {
    if (googleAuth) {
      try {
        await googleAuth.signOut()
      } catch (err) {
        console.error("Erro ao fazer logout do Google:", err)
      }
    }
  }

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
    loading: loading || authLoading || !isGoogleInitialized,
    error,
    fetchAppointments: async () => {
      if (accessToken) {
        await fetchAppointmentsCallback(accessToken)
      }
    },
    getTodayAppointments,
    getUpcomingAppointments,
    isGoogleInitialized,
    isGoogleSignedIn,
    googleSignIn: handleGoogleSignIn,
    googleSignOut: handleGoogleSignOut,
    googleSwitchAccount: handleGoogleSignIn,
    clearError: () => setError(null),
    googleProfile,
  }
}
