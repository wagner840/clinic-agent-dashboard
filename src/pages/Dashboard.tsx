
import { useState } from 'react'
import { useGoogleAuth } from '@/hooks/useGoogleAuth'
import { useAppointments } from '@/hooks/useAppointments'
import { DashboardStats } from '@/components/DashboardStats'
import { DashboardHeader } from '@/components/DashboardHeader'
import { GoogleAuthAlerts } from '@/components/GoogleAuthAlerts'
import { AppointmentsSection } from '@/components/AppointmentsSection'
import { PaymentDialog } from '@/components/PaymentDialog'
import { Appointment } from '@/types/appointment'

export default function Dashboard() {
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

  const [paymentAppointment, setPaymentAppointment] = useState<Appointment | null>(null)

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

  console.log('Google Auth and Appointments status:', {
    isGoogleInitialized,
    isGoogleSignedIn,
    authLoading,
    appointmentsLoading,
    loading,
    error,
    currentUser: currentGoogleUser,
    appointmentsCount: appointments.length
  })

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

  const handleRetry = () => {
    clearError()
    if (appointmentsError) {
        fetchAppointments()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        isGoogleInitialized={isGoogleInitialized}
        isGoogleSignedIn={isGoogleSignedIn}
        loading={loading}
        onGoogleAuth={handleGoogleAuth}
        onSwitchAccount={handleSwitchAccount}
        onSyncAppointments={fetchAppointments}
        currentGoogleUser={currentGoogleUser}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <GoogleAuthAlerts
          isGoogleInitialized={isGoogleInitialized}
          isGoogleSignedIn={isGoogleSignedIn}
          error={error}
          onGoogleSignIn={googleSignIn}
          onRetry={handleRetry}
          onClearError={clearError}
          loading={loading}
          currentGoogleUser={currentGoogleUser}
        />

        <DashboardStats 
          totalAppointments={appointments.length}
          todayAppointments={todayAppointments.length}
          upcomingAppointments={upcomingAppointments.length}
        />

        <AppointmentsSection
          todayAppointments={todayAppointments}
          upcomingAppointments={upcomingAppointments}
          cancelledAppointments={cancelledAppointments}
          isGoogleSignedIn={isGoogleSignedIn}
          isGoogleInitialized={isGoogleInitialized}
          loading={loading && isGoogleSignedIn}
          onGoogleSignIn={googleSignIn}
          onMarkAsCompleted={handleMarkAsCompleted}
        />
      </main>

      <PaymentDialog
        appointment={paymentAppointment}
        isOpen={!!paymentAppointment}
        onClose={() => setPaymentAppointment(null)}
        onPaymentSuccess={() => {
          fetchAppointments()
          setPaymentAppointment(null)
        }}
      />
    </div>
  )
}
