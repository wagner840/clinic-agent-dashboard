
import { useState, useEffect, useCallback } from 'react'
import { Appointment } from '@/types/appointment'
import { GoogleCalendarService } from '@/services/googleCalendar'
import { supabase } from '@/integrations/supabase/client'
import { TARGET_CALENDAR_IDS } from '@/constants/appointments'
import { createTestAppointments, logTestAppointmentDetails } from '@/utils/testAppointments'

const calendarService = new GoogleCalendarService()

// Set to true to use test data instead of Google Calendar
const USE_TEST_DATA = false

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

    // Use test data if enabled
    if (USE_TEST_DATA) {
      console.log('🧪 Using test appointment data')
      const testAppointments = logTestAppointmentDetails()
      setAppointments(testAppointments)
      setLoading(false)
      return
    }
    
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
      
      console.log('🎯 Raw events from Google Calendar:', {
        totalEvents: allEvents.length,
        eventSample: allEvents.slice(0, 3).map(event => ({
          id: event.id,
          summary: event.summary,
          start: event.start,
          status: event.status
        }))
      })
      
      const convertedAppointments = allEvents
        .map(event => calendarService.convertToAppointment(event, user?.email || ''))
        .sort((a, b) => a.start.getTime() - b.start.getTime())
      
      console.log('🔄 Converted appointments before payment processing:', {
        totalConverted: convertedAppointments.length,
        statusBreakdown: convertedAppointments.reduce((acc, apt) => {
          acc[apt.status] = (acc[apt.status] || 0) + 1
          return acc
        }, {} as Record<string, number>),
        sampleAppointments: convertedAppointments.slice(0, 3).map(apt => ({
          id: apt.id,
          title: apt.title,
          start: apt.start,
          status: apt.status,
          patient: apt.patient.name
        }))
      })

      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('appointment_id')

      if (paymentsError) {
        console.error('Error fetching payments', paymentsError)
      }

      const paidAppointmentIds = new Set(payments?.map(p => p.appointment_id) || [])
      console.log('💰 Payment data:', {
        totalPayments: payments?.length || 0,
        paidAppointmentIds: Array.from(paidAppointmentIds)
      })

      const updatedAppointments = convertedAppointments.map(apt => {
        if (apt.status === 'cancelled') {
          return apt
        }
        if (paidAppointmentIds.has(apt.id)) {
          console.log(`✅ Marking appointment ${apt.id} (${apt.patient.name}) as completed due to payment`)
          return { ...apt, status: 'completed' as const }
        }
        return apt
      })

      console.log('📋 Final appointments after payment processing:', {
        totalFinal: updatedAppointments.length,
        statusBreakdown: updatedAppointments.reduce((acc, apt) => {
          acc[apt.status] = (acc[apt.status] || 0) + 1
          return acc
        }, {} as Record<string, number>),
        appointmentDetails: updatedAppointments.map(apt => ({
          id: apt.id,
          title: apt.title,
          start: apt.start,
          status: apt.status,
          patient: apt.patient.name
        }))
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
