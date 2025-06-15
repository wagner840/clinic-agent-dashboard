
import { useState, useEffect, useCallback } from 'react'
import { gapi } from 'gapi-script'
import { Appointment } from '@/types/appointment'
import { GoogleCalendarService } from '@/services/googleCalendar'
import { useAuth } from './useAuth'
import { GOOGLE_CALENDAR_SCOPES } from '@/lib/google'
import { supabase } from '@/integrations/supabase/client'

const TARGET_CALENDAR_NAMES = ['doutora anne', 'doutor iago']

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
  const [googleClientId, setGoogleClientId] = useState<string | null>(null)
  
  const calendarService = new GoogleCalendarService()

  const fetchAppointmentsCallback = useCallback(async (token: string): Promise<void> => {
    if (!token || !user) {
      console.log('Não é possível buscar agendamentos - token ou usuário ausente')
      return
    }

    console.log('Iniciando busca de agendamentos...')
    setLoading(true)
    setError(null)
    
    try {
      const allCalendars = await calendarService.fetchCalendarList(token)
      
      const targetCalendars = allCalendars.filter(cal => 
        TARGET_CALENDAR_NAMES.includes(cal.summary.toLowerCase())
      )

      if (targetCalendars.length === 0) {
        setError(`Nenhum dos calendários alvo (${TARGET_CALENDAR_NAMES.join(', ')}) foi encontrado na sua conta Google. Verifique os nomes e permissões.`)
        setAppointments([])
        setLoading(false)
        return
      }

      console.log(`Buscando eventos para os calendários: ${targetCalendars.map(c => c.summary).join(', ')}`)

      const eventPromises = targetCalendars.map(cal => 
        calendarService.fetchEvents(token, cal.id)
      )
      
      const eventsPerCalendar = await Promise.all(eventPromises)
      const allEvents = eventsPerCalendar.flat()
      
      const convertedAppointments = allEvents
        .map(event => calendarService.convertToAppointment(event, user?.email || ''))
        .sort((a, b) => a.start.getTime() - b.start.getTime())
      
      setAppointments(convertedAppointments)
      console.log(`Carregados ${convertedAppointments.length} agendamentos de ${targetCalendars.length} calendários.`)
    } catch (err: any) {
      console.error('Erro detalhado ao buscar eventos:', err)
      const errorMessage = err.message || 'Erro ao carregar agendamentos'
      if (err.message.includes('401') || err.message.includes('Invalid Credentials')) {
        setError('Sessão do Google expirada. Por favor, conecte novamente.')
      } else if (err.message.includes('403')) {
        setError('Acesso negado ao Google Calendar. Verifique as permissões para todos os calendários alvo.')
      } else {
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }, [user]);

  useEffect(() => {
    const fetchGoogleClientId = async () => {
      console.log('Buscando Google Client ID da função do Supabase...');
      const { data, error: invokeError } = await supabase.functions.invoke('get-google-client-id');
      
      if (invokeError) {
        console.error('Erro ao buscar Google Client ID:', invokeError.message);
        setError('Falha ao buscar a configuração do Google (Client ID). Verifique se a função "get-google-client-id" está implantada corretamente no Supabase.');
        setIsGoogleInitialized(true); // Para o carregamento
        return;
      }

      if (data && data.clientId) {
        console.log('Google Client ID buscado com sucesso.');
        setGoogleClientId(data.clientId);
      } else {
        console.error('Google Client ID não retornado pela função:', data);
        setError('A configuração do Google está incompleta. O Client ID está ausente nos segredos do Supabase. Por favor, adicione um segredo chamado "client_id".');
        setIsGoogleInitialized(true); // Para o carregamento
      }
    };

    fetchGoogleClientId();
  }, []);

  useEffect(() => {
    if (!googleClientId) {
      console.log('Aguardando Google Client ID para inicializar o GAPI...');
      return;
    }

    const initClient = () => {
      window.gapi.client.init({
        clientId: googleClientId,
        scope: GOOGLE_CALENDAR_SCOPES,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest']
      }).then(() => {
        const authInstance = window.gapi.auth2.getAuthInstance()
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
        setError("Falha ao inicializar a integração com o Google. Verifique se o Client ID é válido e a configuração no Google Cloud está correta.")
        setIsGoogleInitialized(true)
      })
    }
    
    gapi.load('client:auth2', initClient)
  }, [googleClientId, fetchAppointmentsCallback])

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
  };

  const handleGoogleSignOut = async () => {
    if (googleAuth) {
      try {
        await googleAuth.signOut()
      } catch (err) {
        console.error("Erro ao fazer logout do Google:", err)
      }
    }
  };

  const getTodayAppointments = () => {
    const today = new Date()
    return appointments.filter(apt => {
      const aptDate = new Date(apt.start)
      return aptDate.toDateString() === today.toDateString()
    })
  };

  const getUpcomingAppointments = () => {
    const now = new Date()
    return appointments.filter(apt => new Date(apt.start) > now)
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
  };

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
