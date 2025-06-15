
import { useGoogleAuth } from '@/hooks/useGoogleAuth'
import { useAppointments } from '@/hooks/useAppointments'
import { usePaymentState } from '@/hooks/dashboard/usePaymentState'
import { useGoogleAuthHandlers } from '@/hooks/dashboard/useGoogleAuthHandlers'
import { useErrorHandlers } from '@/hooks/dashboard/useErrorHandlers'
import { useDashboardData } from '@/hooks/dashboard/useDashboardData'
import { useDashboardActions } from '@/hooks/dashboard/useDashboardActions'
import { useState } from 'react'

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
    deleteAppointment,
    addAppointment,
    markAsCompleted,
    // Calendar management
    handleCreateCalendar,
    handleDeleteCalendar,
    handleAddHolidaysToAll,
    // Cancelled appointment cleanup
    manualCleanupCancelledAppointments
  } = appointmentsResult

  const [doctorFilter, setDoctorFilter] = useState('all')

  // Get filtered data
  const dashboardData = useDashboardData({
    appointments,
    doctorFilter,
    todayAppointments: getTodayAppointments(),
    upcomingAppointments: getUpcomingAppointments(),
    pastAppointments: getPastAppointments(),
    completedAppointments: getCompletedAppointments(),
    cancelledAppointments: getCancelledAppointments()
  })

  // Initialize specialized hooks
  const paymentState = usePaymentState(fetchAppointments)
  const { paymentAppointment, setPaymentAppointment, handlePaymentSuccess } = paymentState

  const dashboardActions = useDashboardActions({
    rescheduleAppointment,
    cancelAppointment,
    reactivateAppointment,
    deleteAppointment,
    addAppointment,
    markAsCompleted,
    handleCreateCalendar,
    handleDeleteCalendar,
    handleAddHolidaysToAll,
    setPaymentAppointment
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
    accessToken,
    
    // Data
    appointments: dashboardData.filteredAppointments,
    doctorCalendars,
    todayAppointments: dashboardData.filteredTodayAppointments,
    upcomingAppointments: dashboardData.filteredUpcomingAppointments,
    pastAppointments: dashboardData.filteredPastAppointments,
    completedAppointments: dashboardData.filteredCompletedAppointments,
    cancelledAppointments: dashboardData.filteredCancelledAppointments,
    
    // Loading & Error states
    loading,
    error,
    
    // Handlers
    handleGoogleAuth: googleAuthHandlers.handleGoogleAuth,
    handleSwitchAccount: googleAuthHandlers.handleSwitchAccount,
    handleMarkAsCompleted: dashboardActions.handleMarkAsCompleted,
    handleRetry: errorHandlers.handleRetry,
    handlePaymentSuccess,
    clearError: errorHandlers.clearError,
    fetchAppointments,
    googleSignIn,
    handleRescheduleAppointment: dashboardActions.handleRescheduleAppointment,
    handleCancelAppointment: dashboardActions.handleCancelAppointment,
    handleReactivateAppointment: dashboardActions.handleReactivateAppointment,
    handleDeleteAppointment: dashboardActions.handleDeleteAppointment,
    handleAddAppointment: dashboardActions.handleAddAppointment,
    // Calendar management
    handleCreateCalendar: dashboardActions.handleCreateCalendar,
    handleDeleteCalendar: dashboardActions.handleDeleteCalendar,
    handleAddHolidaysToAll: dashboardActions.handleAddHolidaysToAll,
    // Cancelled appointment cleanup
    manualCleanupCancelledAppointments
  }
}
