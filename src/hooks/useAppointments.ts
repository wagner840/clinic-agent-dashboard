
import { useAuth } from './useAuth'
import { useAppointmentData } from './appointments/useAppointmentData'
import { useAppointmentOperations } from './appointments/useAppointmentOperations'
import { useAppointmentFilters } from './appointments/useAppointmentFilters'

export function useAppointments(accessToken: string | null, isGoogleSignedIn: boolean) {
  // Always call hooks in the same order
  const { user } = useAuth()

  const appointmentDataResult = useAppointmentData(accessToken, user, isGoogleSignedIn)
  const {
    appointments,
    doctorCalendars,
    loading,
    error,
    clearError,
    fetchAppointments
  } = appointmentDataResult

  const appointmentOperations = useAppointmentOperations(accessToken, user, fetchAppointments)
  const {
    rescheduleAppointment,
    cancelAppointment,
    reactivateAppointment,
    addAppointment,
    markAsCompleted
  } = appointmentOperations

  const appointmentFilters = useAppointmentFilters(appointments)
  const {
    todayAppointments,
    upcomingAppointments,
    pastAppointments,
    completedAppointments,
    cancelledAppointments
  } = appointmentFilters

  return {
    appointments,
    doctorCalendars,
    loading,
    error,
    clearError,
    fetchAppointments,
    getTodayAppointments: () => todayAppointments,
    getUpcomingAppointments: () => upcomingAppointments,
    getPastAppointments: () => pastAppointments,
    getCompletedAppointments: () => completedAppointments,
    getCancelledAppointments: () => cancelledAppointments,
    rescheduleAppointment,
    cancelAppointment,
    reactivateAppointment,
    addAppointment,
    markAsCompleted,
  }
}
