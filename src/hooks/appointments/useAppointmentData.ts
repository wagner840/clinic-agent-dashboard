
import { useState, useEffect, useCallback } from 'react'
import { Appointment } from '@/types/appointment'
import { GoogleCalendarService } from '@/services/googleCalendar'
import { supabase } from '@/integrations/supabase/client'
import { TARGET_CALENDAR_IDS } from '@/constants/appointments'

const calendarService = new GoogleCalendarService()

export function useAppointmentData(
  accessToken: string | null, 
  user: any, 
  isGoogleSignedIn: boolean
) {
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

  useEffect(() => {
    if (isGoogleSignedIn) {
      fetchAppointments()
    } else {
      setAppointments([])
    }
  }, [isGoogleSignedIn, fetchAppointments])

  const clearError = useCallback(() => setError(null), [])

  return {
    appointments,
    loading,
    error,
    clearError,
    fetchAppointments
  }
}
