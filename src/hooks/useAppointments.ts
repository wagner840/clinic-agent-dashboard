
import { useAuth } from './useAuth'
import { useAppointmentData } from './appointments/useAppointmentData'
import { useAppointmentOperations } from './appointments/useAppointmentOperations'
import { useAppointmentFilters } from './appointments/useAppointmentFilters'
import { useCalendarManagement } from './appointments/useCalendarManagement'
import { useCancelledAppointmentCleanup } from './appointments/useCancelledAppointmentCleanup'
import { useEffect } from 'react'

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
    deleteAppointment,
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

  const calendarManagement = useCalendarManagement(accessToken, doctorCalendars, fetchAppointments)
  const {
    handleCreateCalendar,
    handleDeleteCalendar,
    handleAddHolidaysToAll
  } = calendarManagement

  const cancelledCleanup = useCancelledAppointmentCleanup(user?.id, fetchAppointments)
  const {
    cleanupOldCancelledAppointments,
    manualCleanupCancelledAppointments
  } = cancelledCleanup

  // Execute automatic cleanup when appointments are loaded
  useEffect(() => {
    if (isGoogleSignedIn && user && appointments.length > 0) {
      cleanupOldCancelledAppointments()
    }
  }, [isGoogleSignedIn, user, appointments.length, cleanupOldCancelledAppointments])

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
    deleteAppointment,
    addAppointment,
    markAsCompleted,
    // Calendar management
    handleCreateCalendar,
    handleDeleteCalendar,
    handleAddHolidaysToAll,
    // Cancelled appointment cleanup
    manualCleanupCancelledAppointments
  }
}
