
import { useMemo } from 'react'
import { Appointment } from '@/types/appointment'

export function useAppointmentFilters(appointments: Appointment[]) {
  const getTodayAppointments = useMemo(() => {
    const today = new Date()
    return appointments.filter(apt => {
      const aptDate = new Date(apt.start)
      return aptDate.toDateString() === today.toDateString() && apt.status !== 'cancelled'
    })
  }, [appointments])

  const getUpcomingAppointments = useMemo(() => {
    const now = new Date()
    return appointments.filter(apt => new Date(apt.start) > now && apt.status !== 'cancelled')
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
  }, [appointments])

  const getPastAppointments = useMemo(() => {
    const now = new Date()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    return appointments.filter(apt => {
      const aptDate = new Date(apt.start)
      const aptDateOnly = new Date(aptDate)
      aptDateOnly.setHours(0, 0, 0, 0)
      
      // Inclui agendamentos de dias anteriores ou de hoje que já passaram
      return (aptDateOnly < today || (aptDateOnly.getTime() === today.getTime() && new Date(apt.start) < now)) 
        && apt.status === 'scheduled'
    }).sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime())
  }, [appointments])

  const getCompletedAppointments = useMemo(() => {
    return appointments.filter(apt => apt.status === 'completed')
      .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime())
  }, [appointments])

  const getCancelledAppointments = useMemo(() => {
    return appointments.filter(apt => apt.status === 'cancelled')
      .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime())
  }, [appointments])

  return {
    todayAppointments: getTodayAppointments,
    upcomingAppointments: getUpcomingAppointments,
    pastAppointments: getPastAppointments,
    completedAppointments: getCompletedAppointments,
    cancelledAppointments: getCancelledAppointments
  }
}
