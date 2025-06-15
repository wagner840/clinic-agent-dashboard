
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
    pastAppointments,
    completedAppointments,
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
    googleSignIn,
    handleRescheduleAppointment,
    handleCancelAppointment,
    handleReactivateAppointment,
    handleAddAppointment
  } = useDashboardState()

  console.log('Google Auth and Appointments status:', {
    isGoogleInitialized,
    isGoogleSignedIn,
    authLoading: loading,
    appointmentsLoading: loading,
    loading,
    error,
    currentUser: currentGoogleUser,
    appointmentsCount: appointments.length,
    pastAppointmentsCount: pastAppointments.length,
    completedAppointmentsCount: completedAppointments.length
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
        pastAppointments={pastAppointments}
        completedAppointments={completedAppointments}
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
        onRescheduleAppointment={handleRescheduleAppointment}
        onCancelAppointment={handleCancelAppointment}
        onReactivateAppointment={handleReactivateAppointment}
        onAddAppointment={handleAddAppointment}
      />
    </TooltipProvider>
  )
}
