import { useMemo } from 'react'
import { Appointment } from '@/types/appointment'

export function useAppointmentFilters(appointments: Appointment[]) {
  console.log('🔍 Filtering appointments:', {
    totalAppointments: appointments.length,
    appointmentSample: appointments.slice(0, 3).map(apt => ({
      id: apt.id,
      title: apt.title,
      start: apt.start,
      status: apt.status,
      patient: apt.patient.name
    }))
  })

  const getTodayAppointments = useMemo(() => {
    const today = new Date()
    const filtered = appointments.filter(apt => {
      const aptDate = new Date(apt.start)
      const isToday = aptDate.toDateString() === today.toDateString()
      const isScheduled = apt.status === 'scheduled'
      
      console.log('📅 Today filter check:', {
        appointment: apt.patient.name,
        aptDate: aptDate.toDateString(),
        today: today.toDateString(),
        isToday,
        status: apt.status,
        isScheduled,
        included: isToday && isScheduled
      })
      
      return isToday && isScheduled
    })
    
    console.log('📅 Today appointments result:', filtered.length)
    return filtered
  }, [appointments])

  const getUpcomingAppointments = useMemo(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    
    const filtered = appointments.filter(apt => {
      const aptDate = new Date(apt.start)
      const isFuture = aptDate >= tomorrow
      const isScheduled = apt.status === 'scheduled'
      
      console.log('🔮 Upcoming filter check:', {
        appointment: apt.patient.name,
        start: apt.start,
        tomorrow: tomorrow.toDateString(),
        aptDate: aptDate.toDateString(),
        isFuture,
        status: apt.status,
        isScheduled,
        included: isFuture && isScheduled
      })
      
      return isFuture && isScheduled
    })
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    
    console.log('🔮 Upcoming appointments result:', filtered.length)
    return filtered
  }, [appointments])

  const getPastAppointments = useMemo(() => {
    const now = new Date()
    
    const filtered = appointments.filter(apt => {
      const aptStart = new Date(apt.start)
      const isPast = aptStart < now
      const isScheduled = apt.status === 'scheduled'
      
      console.log('⏰ Past filter check (new logic):', {
        appointment: apt.patient.name,
        start: apt.start,
        now,
        isPast,
        status: apt.status,
        isScheduled,
        included: isPast && isScheduled
      })
      
      return isPast && isScheduled
    }).sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime())
    
    console.log('⏰ Past appointments result:', filtered.length)
    return filtered
  }, [appointments])

  const getCompletedAppointments = useMemo(() => {
    const filtered = appointments.filter(apt => {
      const isCompleted = apt.status === 'completed'
      
      console.log('✅ Completed filter check:', {
        appointment: apt.patient.name,
        status: apt.status,
        isCompleted,
        included: isCompleted
      })
      
      return isCompleted
    }).sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime())
    
    console.log('✅ Completed appointments result:', filtered.length)
    return filtered
  }, [appointments])

  const getCancelledAppointments = useMemo(() => {
    const filtered = appointments.filter(apt => {
      const isCancelled = apt.status === 'cancelled'
      
      console.log('❌ Cancelled filter check:', {
        appointment: apt.patient.name,
        status: apt.status,
        isCancelled,
        included: isCancelled
      })
      
      return isCancelled
    }).sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime())
    
    console.log('❌ Cancelled appointments result:', filtered.length)
    return filtered
  }, [appointments])

  console.log('📊 Filter results summary:', {
    total: appointments.length,
    today: getTodayAppointments.length,
    upcoming: getUpcomingAppointments.length,
    past: getPastAppointments.length,
    completed: getCompletedAppointments.length,
    cancelled: getCancelledAppointments.length
  })

  return {
    todayAppointments: getTodayAppointments,
    upcomingAppointments: getUpcomingAppointments,
    pastAppointments: getPastAppointments,
    completedAppointments: getCompletedAppointments,
    cancelledAppointments: getCancelledAppointments
  }
}
