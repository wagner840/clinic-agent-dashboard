
import { Activity, RefreshCw, Users, LogOut, Calendar, UserCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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
    <TooltipProvider>
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Activity className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Dashboard Médico
                </h1>
                <p className="text-xs text-gray-500">
                  Sistema de Gestão de Consultas
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Informações do usuário */}
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  Dr(a). {user?.email?.split('@')[0]}
                </div>
                {isGoogleSignedIn && currentGoogleUser && (
                  <div className="text-xs text-green-600 flex items-center space-x-1">
                    <UserCheck className="h-3 w-3" />
                    <span>Google conectado</span>
                  </div>
                )}
              </div>
              
              {/* Status da integração Google */}
              {!isGoogleInitialized && (
                <Badge variant="outline" className="text-orange-600 border-orange-300">
                  Carregando Google API...
                </Badge>
              )}

              {/* Botões de ação */}
              {isGoogleInitialized && (
                <div className="flex items-center space-x-2">
                  {/* Botão principal Google */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant={isGoogleSignedIn ? "destructive" : "default"}
                        onClick={onGoogleAuth}
                        disabled={loading}
                        size="sm"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        {isGoogleSignedIn ? 'Desconectar' : 'Conectar Google'}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {isGoogleSignedIn 
                          ? 'Desconectar do Google Calendar' 
                          : 'Conectar ao Google Calendar para sincronizar agendamentos'
                        }
                      </p>
                    </TooltipContent>
                  </Tooltip>

                  {/* Botão trocar conta */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        onClick={onSwitchAccount}
                        disabled={loading}
                        size="sm"
                      >
                        <Users className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Trocar conta do Google</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* Botão sincronizar */}
                  {isGoogleSignedIn && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          onClick={onSyncAppointments}
                          disabled={loading}
                          size="sm"
                        >
                          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Sincronizar agendamentos do Google Calendar</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              )}

              {/* Botão sair */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    onClick={signOut}
                    size="sm"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Sair do sistema</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </header>
    </TooltipProvider>
  )
}
