
import { useState, useEffect, useCallback } from 'react'
import { Appointment } from '@/types/appointment'
import { GoogleCalendarService, CalendarListEntry } from '@/services/googleCalendar'
import { supabase } from '@/integrations/supabase/client'

const calendarService = new GoogleCalendarService()

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

  const syncAppointmentToSupabase = useCallback(async (appointment: Appointment) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('appointments')
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

  // Função para verificar se um calendário é de feriados
  const isHolidayCalendar = (calendarSummary: string) => {
    const holidayKeywords = ['holiday', 'feriado', 'holidays in brazil', 'feriados']
    return holidayKeywords.some(keyword => 
      calendarSummary.toLowerCase().includes(keyword.toLowerCase())
    )
  }

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
      const allCalendars = await calendarService.fetchCalendarList(accessToken)
      
      // Filtrar calendários: não-primários E não de feriados
      const targetCalendars = allCalendars.filter(cal => {
        const isNotPrimary = !cal.primary
        const isNotHoliday = !isHolidayCalendar(cal.summary || '')
        
        console.log(`📅 Calendar check: "${cal.summary}" - Primary: ${cal.primary}, Holiday: ${isHolidayCalendar(cal.summary || '')}, Include: ${isNotPrimary && isNotHoliday}`)
        
        return isNotPrimary && isNotHoliday
      })
      
      console.log(`📋 Filtered calendars for appointments: ${targetCalendars.map(c => c.summary).join(', ')}`)
      setDoctorCalendars(targetCalendars);

      if (targetCalendars.length === 0) {
        setError(`Nenhum calendário de médico foi encontrado na sua conta Google. Verifique se os calendários estão compartilhados com a conta conectada.`)
        setAppointments([])
        setLoading(false)
        return
      }

      console.log(`Buscando eventos para os calendários: ${targetCalendars.map(c => c.summary).join(', ')}`)

      const eventPromises = targetCalendars.map(cal => 
        calendarService.fetchEvents(accessToken, cal.id).then(events => ({
          calendarId: cal.id,
          calendarSummary: cal.summary,
          events,
        }))
      )
      
      const eventsPerCalendar = await Promise.all(eventPromises)
      
      const allEvents = eventsPerCalendar.flat()
      
      const convertedAppointments = eventsPerCalendar.flatMap(({ calendarId, calendarSummary, events }) =>
          events.map(event => {
            const appointment = calendarService.convertToAppointment(event, user?.email || '')
            appointment.doctor.name = calendarSummary
            appointment.doctor.calendarId = calendarId
            return appointment
          })
        )
        // Filtrar apenas agendamentos com datas válidas
        .filter(appointment => {
          const hasValidDate = !isNaN(appointment.start.getTime()) && !isNaN(appointment.end.getTime())
          if (!hasValidDate) {
            console.log(`❌ Filtering out appointment with invalid date: "${appointment.title}"`)
          }
          return hasValidDate
        })
        .sort((a, b) => a.start.getTime() - b.start.getTime())
      
      console.log('🔄 Converted appointments after filtering:', {
        totalConverted: convertedAppointments.length,
        statusBreakdown: convertedAppointments.reduce((acc, apt) => {
          acc[apt.status] = (acc[apt.status] || 0) + 1
          return acc
        }, {} as Record<string, number>),
        doctorBreakdown: convertedAppointments.reduce((acc, apt) => {
          acc[apt.doctor.name] = (acc[apt.doctor.name] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      })

      // Sync all appointments to Supabase
      await Promise.all(convertedAppointments.map(syncAppointmentToSupabase))

      // Corrigir status para agendamentos que têm pagamentos
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('appointment_id')
        .eq('user_id', user.id)

      if (paymentsError) {
        console.error('Error fetching payments to sync status:', paymentsError)
      } else if (paymentsData && paymentsData.length > 0) {
        const paidAppointmentIds = paymentsData.map(p => p.appointment_id)
        const { error: updateError } = await supabase
          .from('appointments')
          .update({ status: 'completed' })
          .in('id', paidAppointmentIds)
          .eq('user_id', user.id)
        
        if (updateError) {
          console.error('Error updating status for paid appointments:', updateError)
        } else {
          console.log(`✅ Ensured ${paidAppointmentIds.length} paid appointments are marked as 'completed'.`)
        }
      }

      // Fetch status updates from Supabase
      const { data: supabaseAppointments, error: supabaseError } = await supabase
        .from('appointments')
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
        }, {} as Record<string, number>),
        doctorBreakdown: updatedAppointments.reduce((acc, apt) => {
          acc[apt.doctor.name] = (acc[apt.doctor.name] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      })

      setAppointments(updatedAppointments)
      console.log(`Carregados ${updatedAppointments.length} agendamentos válidos, excluindo calendários de feriados.`)

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
