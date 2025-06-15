
import { useState, useEffect, useCallback } from 'react'
import { Appointment } from '@/types/appointment'
import { GoogleCalendarService } from '@/services/googleCalendar'
import { useAuth } from './useAuth'
import { supabase } from '@/integrations/supabase/client'

const TARGET_CALENDAR_IDS = [
  'a4f94e53c7bbe793339545813e6c1ca2b586d70fb56e23407b47997926b3dafa@group.calendar.google.com', // Dra Anne Martins
  'b70f9e7f14829bc83b3a3b86e742fb5c5a542b057b31b20ab7d0baffb4ad0f01@group.calendar.google.com'  // Dr Iago Kulpel
]

const calendarService = new GoogleCalendarService()

export function useAppointments(accessToken: string | null, isGoogleSignedIn: boolean) {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAppointments = useCallback(async () => {
    if (!accessToken || !user || !isGoogleSignedIn) {
      if (isGoogleSignedIn) {
        console.log('Não é possível buscar agendamentos - token ou usuário ausente')
      }
      setAppointments([])
      return
    }

    console.log('Iniciando busca de agendamentos...')
    setLoading(true)
    setError(null)
    
    try {
      const allCalendars = await calendarService.fetchCalendarList(accessToken)
      
      const targetCalendars = allCalendars.filter(cal => 
        TARGET_CALENDAR_IDS.includes(cal.id)
      )

      if (targetCalendars.length === 0) {
        setError(`Nenhum dos calendários alvo foi encontrado na sua conta Google. Verifique se os IDs de calendário estão corretos e se você tem permissão para acessá-los.`)
        setAppointments([])
        setLoading(false)
        return
      }

      console.log(`Buscando eventos para os calendários: ${targetCalendars.map(c => c.summary).join(', ')}`)

      const eventPromises = targetCalendars.map(cal => 
        calendarService.fetchEvents(accessToken, cal.id)
      )
      
      const eventsPerCalendar = await Promise.all(eventPromises)
      const allEvents = eventsPerCalendar.flat()
      
      const convertedAppointments = allEvents
        .map(event => calendarService.convertToAppointment(event, user?.email || ''))
        .sort((a, b) => a.start.getTime() - b.start.getTime())
      
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('appointment_id')

      if (paymentsError) {
        console.error('Error fetching payments', paymentsError)
      }

      const paidAppointmentIds = new Set(payments?.map(p => p.appointment_id) || [])
      const updatedAppointments = convertedAppointments.map(apt => {
        if (apt.status === 'cancelled') {
          return apt
        }
        if (paidAppointmentIds.has(apt.id)) {
          return { ...apt, status: 'completed' as const }
        }
        return apt
      })

      setAppointments(updatedAppointments)
      console.log(`Carregados ${updatedAppointments.length} agendamentos, com status de pagamento atualizado.`)

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

  const rescheduleAppointment = useCallback(async (eventId: string, newStart: Date, newEnd: Date) => {
    if (!accessToken || !user) return

    try {
      await calendarService.rescheduleAppointment(accessToken, TARGET_CALENDAR_IDS, eventId, newStart, newEnd)
      await fetchAppointments() // Refresh appointments
    } catch (error: any) {
      console.error('Error rescheduling appointment:', error)
      setError(`Erro ao reagendar: ${error.message}`)
      throw error
    }
  }, [accessToken, user, fetchAppointments])

  const cancelAppointment = useCallback(async (eventId: string) => {
    if (!accessToken || !user) return

    try {
      await calendarService.cancelAppointment(accessToken, TARGET_CALENDAR_IDS, eventId)
      await fetchAppointments()
    } catch (error: any) {
      console.error('Error cancelling appointment:', error)
      setError(`Erro ao cancelar: ${error.message}`)
      throw error
    }
  }, [accessToken, user, fetchAppointments])

  const reactivateAppointment = useCallback(async (eventId: string) => {
    if (!accessToken || !user) return

    try {
      await calendarService.reactivateAppointment(accessToken, TARGET_CALENDAR_IDS, eventId)
      await fetchAppointments()
    } catch (error: any) {
      console.error('Error reactivating appointment:', error)
      setError(`Erro ao reativar: ${error.message}`)
      throw error
    }
  }, [accessToken, user, fetchAppointments])

  const addAppointment = useCallback(async (appointmentData: {
    patientName: string
    patientEmail?: string
    patientPhone?: string
    start: Date
    end: Date
    type: 'consultation' | 'procedure' | 'follow-up'
    description?: string
  }) => {
    if (!accessToken || !user) return

    try {
      const allCalendars = await calendarService.fetchCalendarList(accessToken)
      const targetCalendars = allCalendars.filter(cal => TARGET_CALENDAR_IDS.includes(cal.id))

      if (targetCalendars.length === 0) {
        throw new Error('Nenhum calendário alvo encontrado')
      }

      // Usar o primeiro calendário disponível
      const primaryCalendar = targetCalendars[0]
      await calendarService.createAppointment(accessToken, primaryCalendar.id, appointmentData)
      await fetchAppointments()
    } catch (error: any) {
      console.error('Error adding appointment:', error)
      setError(`Erro ao adicionar agendamento: ${error.message}`)
      throw error
    }
  }, [accessToken, user, fetchAppointments])

  useEffect(() => {
    if (isGoogleSignedIn) {
      fetchAppointments()
    } else {
        setAppointments([]) // Clear appointments when signed out
    }
  }, [isGoogleSignedIn, fetchAppointments])

  const getTodayAppointments = () => {
    const today = new Date()
    return appointments.filter(apt => {
      const aptDate = new Date(apt.start)
      return aptDate.toDateString() === today.toDateString() && apt.status !== 'cancelled'
    })
  }

  const getUpcomingAppointments = () => {
    const now = new Date()
    return appointments.filter(apt => new Date(apt.start) > now && apt.status !== 'cancelled')
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
  }

  const getCancelledAppointments = () => {
    return appointments.filter(apt => apt.status === 'cancelled')
      .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime())
  }

  return {
    appointments,
    loading,
    error,
    clearError: () => setError(null),
    fetchAppointments,
    getTodayAppointments,
    getUpcomingAppointments,
    getCancelledAppointments,
    rescheduleAppointment,
    cancelAppointment,
    reactivateAppointment,
    addAppointment,
  }
}
