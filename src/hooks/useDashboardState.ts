import { useGoogleAuth } from '@/hooks/useGoogleAuth'
import { useAppointments } from '@/hooks/useAppointments'
import { usePaymentState } from '@/hooks/dashboard/usePaymentState'
import { useAppointmentHandlers } from '@/hooks/dashboard/useAppointmentHandlers'
import { useGoogleAuthHandlers } from '@/hooks/dashboard/useGoogleAuthHandlers'
import { useErrorHandlers } from '@/hooks/dashboard/useErrorHandlers'
import { useState, useMemo } from 'react'

export function useDashboardState() {
  // Always call hooks in the same order - no conditional calls
  const googleAuthResult = useGoogleAuth()
  const {
    loading: authLoading,
    error: authError,
    isGoogleInitialized,
    isGoogleSignedIn,
    googleSignIn,
    googleSignOut,
    googleSwitchAccount,
    googleProfile,
    accessToken,
    clearError: clearAuthError
  } = googleAuthResult

  // Always call useAppointments - it handles its own conditional logic internally
  const appointmentsResult = useAppointments(accessToken, isGoogleSignedIn)
  const {
    appointments,
    doctorCalendars,
    loading: appointmentsLoading,
    error: appointmentsError,
    fetchAppointments,
    getTodayAppointments,
    getUpcomingAppointments,
    getPastAppointments,
    getCompletedAppointments,
    getCancelledAppointments,
    clearError: clearAppointmentsError,
    rescheduleAppointment,
    cancelAppointment,
    reactivateAppointment,
    addAppointment,
    markAsCompleted
  } = appointmentsResult

  const [doctorFilter, setDoctorFilter] = useState('all')

  const filteredAppointments = useMemo(() => {
    if (doctorFilter === 'all' || !doctorFilter) {
      return appointments
    }
    return appointments.filter(apt => apt.doctor.calendarId === doctorFilter)
  }, [appointments, doctorFilter])

  // Initialize specialized hooks
  const paymentState = usePaymentState(fetchAppointments)
  const { paymentAppointment, setPaymentAppointment, handlePaymentSuccess } = paymentState

  const appointmentHandlers = useAppointmentHandlers({
    rescheduleAppointment,
    cancelAppointment,
    reactivateAppointment,
    addAppointment,
    markAsCompleted
  }, { setPaymentAppointment })

  const googleAuthHandlers = useGoogleAuthHandlers({
    isGoogleSignedIn,
    googleSignIn,
    googleSignOut,
    googleSwitchAccount
  })

  const errorHandlers = useErrorHandlers({
    authError,
    appointmentsError,
    clearAuthError,
    clearAppointmentsError: clearAppointmentsError,
    fetchAppointments
  })

  // Compute derived state
  const loading = authLoading || (isGoogleSignedIn && appointmentsLoading)
  const error = authError || appointmentsError
  
  const todayAppointments = getTodayAppointments().filter(apt => filteredAppointments.includes(apt))
  const upcomingAppointments = getUpcomingAppointments().filter(apt => filteredAppointments.includes(apt))
  const pastAppointments = getPastAppointments().filter(apt => filteredAppointments.includes(apt))
  const completedAppointments = getCompletedAppointments().filter(apt => filteredAppointments.includes(apt))
  const cancelledAppointments = getCancelledAppointments().filter(apt => filteredAppointments.includes(apt))
  
  const currentGoogleUser = isGoogleSignedIn && googleProfile ? {
    email: googleProfile.getEmail(),
    name: googleProfile.getName(),
    imageUrl: googleProfile.getImageUrl()
  } : null

  return {
    // State
    paymentAppointment,
    setPaymentAppointment,
    doctorFilter,
    setDoctorFilter,
    
    // Google Auth
    isGoogleInitialized,
    isGoogleSignedIn,
    currentGoogleUser,
    
    // Data
    appointments: filteredAppointments,
    doctorCalendars,
    todayAppointments,
    upcomingAppointments,
    pastAppointments,
    completedAppointments,
    cancelledAppointments,
    
    // Loading & Error states
    loading,
    error,
    
    // Handlers
    handleGoogleAuth: googleAuthHandlers.handleGoogleAuth,
    handleSwitchAccount: googleAuthHandlers.handleSwitchAccount,
    handleMarkAsCompleted: appointmentHandlers.handleMarkAsCompleted,
    handleRetry: errorHandlers.handleRetry,
    handlePaymentSuccess,
    clearError: errorHandlers.clearError,
    fetchAppointments,
    googleSignIn,
    handleRescheduleAppointment: appointmentHandlers.handleRescheduleAppointment,
    handleCancelAppointment: appointmentHandlers.handleCancelAppointment,
    handleReactivateAppointment: appointmentHandlers.handleReactivateAppointment,
    handleAddAppointment: appointmentHandlers.handleAddAppointment
  }
}
