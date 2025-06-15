
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

  const syncAppointmentToSupabase = useCallback(async (appointment: Appointment) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('appointments' as any)
        .upsert({
          id: appointment.id,
          user_id: user.id,
          title: appointment.title,
          start_time: appointment.start.toISOString(),
          end_time: appointment.end.toISOString(),
          description: appointment.description,
          patient_name: appointment.patient.name,
          patient_email: appointment.patient.email,
          patient_phone: appointment.patient.phone,
          doctor_name: appointment.doctor.name,
          doctor_email: appointment.doctor.email,
          status: appointment.status,
          type: appointment.type
        }, {
          onConflict: 'id',
          ignoreDuplicates: false
        })

      if (error) {
        console.error('Error syncing appointment to Supabase:', error)
      } else {
        console.log('✅ Appointment synced to Supabase:', appointment.id)
      }
    } catch (error) {
      console.error('Error syncing appointment to Supabase:', error)
    }
  }, [user])

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
      
      console.log('🔄 Converted appointments before Supabase sync:', {
        totalConverted: convertedAppointments.length,
        statusBreakdown: convertedAppointments.reduce((acc, apt) => {
          acc[apt.status] = (acc[apt.status] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      })

      // Sync all appointments to Supabase
      await Promise.all(convertedAppointments.map(syncAppointmentToSupabase))

      // Fetch status updates from Supabase
      const { data: supabaseAppointments, error: supabaseError } = await supabase
        .from('appointments' as any)
        .select('id, status')
        .eq('user_id', user.id)

      if (supabaseError) {
        console.error('Error fetching appointment status from Supabase:', supabaseError)
      }

      const statusMap = new Map(
        (supabaseAppointments as any[])?.map(apt => [apt.id, apt.status]) || []
      )

      // Update appointments with Supabase status
      const updatedAppointments = convertedAppointments.map(apt => {
        const supabaseStatus = statusMap.get(apt.id)
        if (supabaseStatus && supabaseStatus !== apt.status) {
          console.log(`📊 Updating appointment ${apt.id} status from ${apt.status} to ${supabaseStatus}`)
          return { ...apt, status: supabaseStatus as 'scheduled' | 'completed' | 'cancelled' }
        }
        return apt
      })

      console.log('📋 Final appointments after Supabase sync:', {
        totalFinal: updatedAppointments.length,
        statusBreakdown: updatedAppointments.reduce((acc, apt) => {
          acc[apt.status] = (acc[apt.status] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      })

      setAppointments(updatedAppointments)
      console.log(`Carregados ${updatedAppointments.length} agendamentos, sincronizados com Supabase.`)

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
  }, [accessToken, user, isGoogleSignedIn, syncAppointmentToSupabase])

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
