
import { TooltipProvider } from '@/components/ui/tooltip'
import { DashboardContent } from '@/components/DashboardContent'
import { useDashboardState } from '@/hooks/useDashboardState'

export default function Dashboard() {
  const {
    paymentAppointment,
    setPaymentAppointment,
    isGoogleInitialized,
    isGoogleSignedIn,
    currentGoogleUser,
    appointments,
    todayAppointments,
    upcomingAppointments,
    cancelledAppointments,
    loading,
    error,
    handleGoogleAuth,
    handleSwitchAccount,
    handleMarkAsCompleted,
    handleRetry,
    handlePaymentSuccess,
    clearError,
    fetchAppointments,
    googleSignIn
  } = useDashboardState()

  console.log('Google Auth and Appointments status:', {
    isGoogleInitialized,
    isGoogleSignedIn,
    authLoading: loading,
    appointmentsLoading: loading,
    loading,
    error,
    currentUser: currentGoogleUser,
    appointmentsCount: appointments.length
  })

  return (
    <TooltipProvider>
      <DashboardContent
        isGoogleInitialized={isGoogleInitialized}
        isGoogleSignedIn={isGoogleSignedIn}
        loading={loading}
        error={error}
        currentGoogleUser={currentGoogleUser}
        appointments={appointments}
        todayAppointments={todayAppointments}
        upcomingAppointments={upcomingAppointments}
        cancelledAppointments={cancelledAppointments}
        paymentAppointment={paymentAppointment}
        onGoogleAuth={handleGoogleAuth}
        onSwitchAccount={handleSwitchAccount}
        onSyncAppointments={fetchAppointments}
        onGoogleSignIn={googleSignIn}
        onMarkAsCompleted={handleMarkAsCompleted}
        onRetry={handleRetry}
        onClearError={clearError}
        onPaymentSuccess={handlePaymentSuccess}
        onClosePaymentDialog={() => setPaymentAppointment(null)}
      />
    </TooltipProvider>
  )
}
