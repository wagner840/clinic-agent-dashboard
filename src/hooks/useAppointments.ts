
import { useAuth } from './useAuth'
import { useAppointmentData } from './appointments/useAppointmentData'
import { useAppointmentOperations } from './appointments/useAppointmentOperations'
import { useAppointmentFilters } from './appointments/useAppointmentFilters'

export function useAppointments(accessToken: string | null, isGoogleSignedIn: boolean) {
  const { user } = useAuth()

  const {
    appointments,
    loading,
    error,
    clearError,
    fetchAppointments
  } = useAppointmentData(accessToken, user, isGoogleSignedIn)

  const {
    rescheduleAppointment,
    cancelAppointment,
    reactivateAppointment,
    addAppointment
  } = useAppointmentOperations(accessToken, user, fetchAppointments)

  const {
    todayAppointments,
    upcomingAppointments,
    cancelledAppointments
  } = useAppointmentFilters(appointments)

  return {
    appointments,
    loading,
    error,
    clearError,
    fetchAppointments,
    getTodayAppointments: () => todayAppointments,
    getUpcomingAppointments: () => upcomingAppointments,
    getCancelledAppointments: () => cancelledAppointments,
    rescheduleAppointment,
    cancelAppointment,
    reactivateAppointment,
    addAppointment,
  }
}
