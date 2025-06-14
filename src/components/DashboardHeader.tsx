
import { Activity, AlertCircle, RefreshCw, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'

interface DashboardHeaderProps {
  isGoogleInitialized: boolean
  isGoogleSignedIn: boolean
  loading: boolean
  onGoogleAuth: () => Promise<void>
  onSwitchAccount: () => Promise<void>
  onSyncAppointments: () => Promise<void>
  currentGoogleUser?: {
    email: string
    name: string
    imageUrl: string
  } | null
}

export function DashboardHeader({
  isGoogleInitialized,
  isGoogleSignedIn,
  loading,
  onGoogleAuth,
  onSwitchAccount,
  onSyncAppointments,
  currentGoogleUser
}: DashboardHeaderProps) {
  const { user, signOut } = useAuth()

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Activity className="h-8 w-8 text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-900">
              Dashboard Médico
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Olá, Dr(a). {user?.email}
            </span>
            
            {/* Informações da conta Google atual */}
            {isGoogleSignedIn && currentGoogleUser && (
              <div className="text-xs bg-green-50 px-2 py-1 rounded border border-green-200">
                <span className="text-green-700">
                  Google: {currentGoogleUser.email}
                </span>
              </div>
            )}
            
            {/* Status da API Google */}
            {!isGoogleInitialized && (
              <span className="text-xs text-orange-600">
                Carregando Google API...
              </span>
            )}

            {/* Botões de autenticação Google */}
            {isGoogleInitialized && (
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  onClick={onGoogleAuth}
                  disabled={loading}
                  className={isGoogleSignedIn ? "border-green-500 text-green-700" : "border-red-500 text-red-700"}
                >
                  {isGoogleSignedIn ? 'Desconectar Google' : 'Conectar Google Calendar'}
                </Button>

                {/* Botão para forçar seleção de conta */}
                <Button 
                  variant="outline" 
                  onClick={onSwitchAccount}
                  disabled={loading}
                  className="border-blue-500 text-blue-700"
                  title="Selecionar conta diferente"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Trocar Conta
                </Button>
              </div>
            )}

            {/* Botão de sincronização */}
            {isGoogleSignedIn && (
              <Button 
                variant="outline" 
                onClick={onSyncAppointments}
                disabled={loading}
              >
                {loading ? 'Sincronizando...' : 'Sincronizar'}
              </Button>
            )}

            <Button variant="outline" onClick={signOut}>
              Sair
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
