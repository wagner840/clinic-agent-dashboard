
import { useGoogleCalendarReal } from '@/hooks/useGoogleCalendarReal'
import { DashboardStats } from '@/components/DashboardStats'
import { DashboardHeader } from '@/components/DashboardHeader'
import { GoogleAuthAlerts } from '@/components/GoogleAuthAlerts'
import { AppointmentsSection } from '@/components/AppointmentsSection'

export default function Dashboard() {
  const { 
    appointments, 
    loading, 
    error, 
    getTodayAppointments, 
    getUpcomingAppointments,
    isGoogleInitialized,
    isGoogleSignedIn,
    googleSignIn,
    googleSignOut,
    googleSwitchAccount,
    fetchAppointments,
    clearError
  } = useGoogleCalendarReal()

  const todayAppointments = getTodayAppointments()
  const upcomingAppointments = getUpcomingAppointments()

  console.log('Google Calendar OAuth status:', {
    isGoogleInitialized,
    isGoogleSignedIn,
    appointmentsCount: appointments.length,
    loading,
    error
  })

  const handleGoogleAuth = async (): Promise<void> => {
    if (isGoogleSignedIn) {
      await googleSignOut()
    } else {
      await googleSignIn()
    }
  }

  const handleSwitchAccount = async (): Promise<void> => {
    await googleSwitchAccount()
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
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <GoogleAuthAlerts
          isGoogleInitialized={isGoogleInitialized}
          isGoogleSignedIn={isGoogleSignedIn}
          error={error}
          onGoogleSignIn={googleSignIn}
          onRetry={fetchAppointments}
          onClearError={clearError}
          loading={loading}
        />

        {/* Stats Cards */}
        <DashboardStats 
          totalAppointments={appointments.length}
          todayAppointments={todayAppointments.length}
          upcomingAppointments={upcomingAppointments.length}
        />

        <AppointmentsSection
          todayAppointments={todayAppointments}
          upcomingAppointments={upcomingAppointments}
          isGoogleSignedIn={isGoogleSignedIn}
          isGoogleInitialized={isGoogleInitialized}
          loading={loading}
          onGoogleSignIn={googleSignIn}
        />
      </main>
    </div>
  )
}
