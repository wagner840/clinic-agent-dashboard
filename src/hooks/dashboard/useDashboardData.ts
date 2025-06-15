
import { useMemo } from 'react'
import { Appointment } from '@/types/appointment'

interface DashboardDataProps {
  appointments: Appointment[]
  doctorFilter: string
  todayAppointments: Appointment[]
  upcomingAppointments: Appointment[]
  pastAppointments: Appointment[]
  completedAppointments: Appointment[]
  cancelledAppointments: Appointment[]
}

export function useDashboardData({
  appointments,
  doctorFilter,
  todayAppointments,
  upcomingAppointments,
  pastAppointments,
  completedAppointments,
  cancelledAppointments
}: DashboardDataProps) {
  const filteredAppointments = useMemo(() => {
    if (doctorFilter === 'all' || !doctorFilter) {
      return appointments
    }
    return appointments.filter(apt => apt.doctor.calendarId === doctorFilter)
  }, [appointments, doctorFilter])

  const filteredTodayAppointments = useMemo(() => 
    todayAppointments.filter(apt => filteredAppointments.includes(apt)),
    [todayAppointments, filteredAppointments]
  )

  const filteredUpcomingAppointments = useMemo(() => 
    upcomingAppointments.filter(apt => filteredAppointments.includes(apt)),
    [upcomingAppointments, filteredAppointments]
  )

  const filteredPastAppointments = useMemo(() => 
    pastAppointments.filter(apt => filteredAppointments.includes(apt)),
    [pastAppointments, filteredAppointments]
  )

  const filteredCompletedAppointments = useMemo(() => 
    completedAppointments.filter(apt => filteredAppointments.includes(apt)),
    [completedAppointments, filteredAppointments]
  )

  const filteredCancelledAppointments = useMemo(() => 
    cancelledAppointments.filter(apt => filteredAppointments.includes(apt)),
    [cancelledAppointments, filteredAppointments]
  )

  return {
    filteredAppointments,
    filteredTodayAppointments,
    filteredUpcomingAppointments,
    filteredPastAppointments,
    filteredCompletedAppointments,
    filteredCancelledAppointments
  }
}
