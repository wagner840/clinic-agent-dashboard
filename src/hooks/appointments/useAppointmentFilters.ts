
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

  const getCancelledAppointments = useMemo(() => {
    return appointments.filter(apt => apt.status === 'cancelled')
      .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime())
  }, [appointments])

  return {
    todayAppointments: getTodayAppointments,
    upcomingAppointments: getUpcomingAppointments,
    cancelledAppointments: getCancelledAppointments
  }
}
