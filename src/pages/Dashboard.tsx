
import { TooltipProvider } from '@/components/ui/tooltip'
import { DashboardContent } from '@/components/DashboardContent'
import { useDashboardState } from '@/hooks/useDashboardState'
import { ThemeProvider } from '@/components/ThemeProvider'
import { useState } from 'react'

export default function Dashboard() {
  const {
    paymentAppointment,
    setPaymentAppointment,
    doctorFilter,
    setDoctorFilter,
    isGoogleInitialized,
    isGoogleSignedIn,
    currentGoogleUser,
    accessToken,
    appointments,
    doctorCalendars,
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
    handleAddAppointment,
    // Calendar management
    handleCreateCalendar,
    handleDeleteCalendar,
    handleAddHolidaysToAll
  } = useDashboardState()

  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

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
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <DashboardContent
          isGoogleInitialized={isGoogleInitialized}
          isGoogleSignedIn={isGoogleSignedIn}
          loading={loading}
          error={error}
          currentGoogleUser={currentGoogleUser}
          accessToken={accessToken}
          appointments={appointments}
          doctorCalendars={doctorCalendars}
          doctorFilter={doctorFilter}
          onDoctorFilterChange={setDoctorFilter}
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
          isSettingsOpen={isSettingsOpen}
          onSettingsChange={setIsSettingsOpen}
          // Calendar management
          onCreateCalendar={handleCreateCalendar}
          onDeleteCalendar={handleDeleteCalendar}
          onAddHolidaysToAll={handleAddHolidaysToAll}
        />
      </TooltipProvider>
    </ThemeProvider>
  )
}
