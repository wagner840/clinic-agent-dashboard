
import { useState } from 'react'
import { useGoogleAuth } from '@/hooks/useGoogleAuth'
import { useAppointments } from '@/hooks/useAppointments'
import { Appointment } from '@/types/appointment'

export function useDashboardState() {
  const [paymentAppointment, setPaymentAppointment] = useState<Appointment | null>(null)

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
  } = useGoogleAuth()

  const {
    appointments,
    loading: appointmentsLoading,
    error: appointmentsError,
    fetchAppointments,
    getTodayAppointments,
    getUpcomingAppointments,
    getCancelledAppointments,
    clearError: clearAppointmentsError
  } = useAppointments(accessToken, isGoogleSignedIn)

  const loading = authLoading || (isGoogleSignedIn && appointmentsLoading)
  const error = authError || appointmentsError
  
  const clearError = () => {
    if (authError) clearAuthError()
    if (appointmentsError) clearAppointmentsError()
  }

  const todayAppointments = getTodayAppointments()
  const upcomingAppointments = getUpcomingAppointments()
  const cancelledAppointments = getCancelledAppointments()
  
  const currentGoogleUser = isGoogleSignedIn && googleProfile ? {
    email: googleProfile.getEmail(),
    name: googleProfile.getName(),
    imageUrl: googleProfile.getImageUrl()
  } : null

  const handleGoogleAuth = async (): Promise<void> => {
    if (isGoogleSignedIn) {
      await googleSignOut()
    } else {
      await googleSignIn()
    }
  }

  const handleSwitchAccount = async (): Promise<void> => {
    console.log('Botão de troca de conta clicado')
    await googleSwitchAccount()
  }

  const handleMarkAsCompleted = (appointment: Appointment) => {
    setPaymentAppointment(appointment)
  }

  const handleRetry = async () => {
    clearError()
    if (appointmentsError) {
      await fetchAppointments()
    }
  }

  const handlePaymentSuccess = () => {
    fetchAppointments()
    setPaymentAppointment(null)
  }

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
    cancelledAppointments,
    
    // Loading & Error states
    loading,
    error,
    
    // Handlers
    handleGoogleAuth,
    handleSwitchAccount,
    handleMarkAsCompleted,
    handleRetry,
    handlePaymentSuccess,
    clearError,
    fetchAppointments,
    googleSignIn
  }
}
