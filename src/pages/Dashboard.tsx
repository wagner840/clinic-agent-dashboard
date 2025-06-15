
import { useGoogleCalendarReal } from '@/hooks/useGoogleCalendarReal'
import { DashboardStats } from '@/components/DashboardStats'
import { DashboardHeader } from '@/components/DashboardHeader'
import { GoogleAuthAlerts } from '@/components/GoogleAuthAlerts'
import { AppointmentsSection } from '@/components/AppointmentsSection'
import { useAuth } from '@/hooks/useAuth'

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

  const { user } = useAuth()

  const todayAppointments = getTodayAppointments()
  const upcomingAppointments = getUpcomingAppointments()
  const currentGoogleUser = isGoogleSignedIn && user ? {
    email: user.email || '',
    name: user.user_metadata?.full_name || user.email || 'Usuário',
    imageUrl: user.user_metadata?.avatar_url || ''
  } : null

  console.log('Google Calendar OAuth status:', {
    isGoogleInitialized,
    isGoogleSignedIn,
    appointmentsCount: appointments.length,
    loading,
    error,
    currentUser: currentGoogleUser
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
          onRetry={fetchAppointments}
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
          isGoogleSignedIn={isGoogleSignedIn}
          isGoogleInitialized={isGoogleInitialized}
          loading={loading}
          onGoogleSignIn={googleSignIn}
        />
      </main>
    </div>
  )
}
