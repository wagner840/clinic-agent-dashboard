
import { DashboardHeader } from '@/components/DashboardHeader'
import { EarningsPage } from '@/components/earnings/EarningsPage'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { Appointment } from '@/types/appointment'

interface DashboardEarningsViewProps {
  isGoogleInitialized: boolean
  isGoogleSignedIn: boolean
  loading: boolean
  currentGoogleUser: {
    email: string
    name: string
    imageUrl: string
  } | null
  onGoogleAuth: () => Promise<void>
  onSwitchAccount: () => Promise<void>
  onSyncAppointments: () => Promise<void>
  onOpenSettings: () => void
  onBackToDashboard: () => void
  appointments?: Appointment[]
}

export function DashboardEarningsView({ 
  isGoogleInitialized,
  isGoogleSignedIn,
  loading,
  currentGoogleUser,
  onGoogleAuth,
  onSwitchAccount,
  onSyncAppointments,
  onOpenSettings,
  onBackToDashboard,
  appointments = []
}: DashboardEarningsViewProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader
        isGoogleInitialized={isGoogleInitialized}
        isGoogleSignedIn={isGoogleSignedIn}
        loading={loading}
        onGoogleAuth={onGoogleAuth}
        onSwitchAccount={onSwitchAccount}
        onSyncAppointments={onSyncAppointments}
        currentGoogleUser={currentGoogleUser}
        onOpenSettings={onOpenSettings}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={onBackToDashboard}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar ao Dashboard</span>
          </Button>
        </div>

        <EarningsPage appointments={appointments} />
      </main>
    </div>
  )
}
