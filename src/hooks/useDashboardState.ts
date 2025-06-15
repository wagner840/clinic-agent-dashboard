
import { useGoogleAuth } from '@/hooks/useGoogleAuth'
import { useAppointments } from '@/hooks/useAppointments'
import { usePaymentState } from '@/hooks/dashboard/usePaymentState'
import { useAppointmentHandlers } from '@/hooks/dashboard/useAppointmentHandlers'
import { useGoogleAuthHandlers } from '@/hooks/dashboard/useGoogleAuthHandlers'
import { useErrorHandlers } from '@/hooks/dashboard/useErrorHandlers'

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

  // Initialize specialized hooks
  const paymentState = usePaymentState(fetchAppointments)
  const { paymentAppointment, setPaymentAppointment, handlePaymentSuccess } = paymentState

  const appointmentHandlers = useAppointmentHandlers({
    rescheduleAppointment,
    cancelAppointment,
    reactivateAppointment,
    addAppointment,
    markAsCompleted
  })

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
  
  const todayAppointments = getTodayAppointments()
  const upcomingAppointments = getUpcomingAppointments()
  const pastAppointments = getPastAppointments()
  const completedAppointments = getCompletedAppointments()
  const cancelledAppointments = getCancelledAppointments()
  
  const currentGoogleUser = isGoogleSignedIn && googleProfile ? {
    email: googleProfile.getEmail(),
    name: googleProfile.getName(),
    imageUrl: googleProfile.getImageUrl()
  } : null

  return {
    // State
    paymentAppointment,
    setPaymentAppointment,
    
    // Google Auth
    isGoogleInitialized,
    isGoogleSignedIn,
    currentGoogleUser,
    
    // Data
    appointments,
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
