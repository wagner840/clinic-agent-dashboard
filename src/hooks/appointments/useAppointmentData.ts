
import { useState, useEffect, useCallback } from 'react'
import { Appointment } from '@/types/appointment'
import { CalendarListEntry } from '@/services/googleCalendar'
import { CalendarDataService } from '@/services/appointments/calendarDataService'

// Set to true to use test data instead of Google Calendar
const USE_TEST_DATA = false

export function useAppointmentData(
  accessToken: string | null, 
  user: any, 
  isGoogleSignedIn: boolean
) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [doctorCalendars, setDoctorCalendars] = useState<CalendarListEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAppointments = useCallback(async () => {
    // Handle cases where we shouldn't fetch
    if (!isGoogleSignedIn) {
      setAppointments([])
      return
    }

    if (!accessToken || !user) {
      console.log('Não é possível buscar agendamentos - token ou usuário ausente')
      setAppointments([])
      return
    }

    console.log('Iniciando busca de agendamentos...')
    setLoading(true)
    setError(null)

    // Use test data if enabled
    if (USE_TEST_DATA) {
      console.log('🧪 Using test appointment data')
      // Import test data dynamically to avoid circular dependencies
      const { logTestAppointmentDetails } = await import('@/utils/testAppointments')
      const testAppointments = logTestAppointmentDetails()
      setAppointments(testAppointments)
      setLoading(false)
      return
    }
    
    try {
      const { appointments: fetchedAppointments, doctorCalendars: fetchedCalendars } = 
        await CalendarDataService.fetchCalendarData(accessToken, user)
      
      setAppointments(fetchedAppointments)
      setDoctorCalendars(fetchedCalendars)
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
  }, [accessToken, user, isGoogleSignedIn])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  const clearError = useCallback(() => setError(null), [])

  return {
    appointments,
    doctorCalendars,
    loading,
    error,
    clearError,
    fetchAppointments
  }
}
