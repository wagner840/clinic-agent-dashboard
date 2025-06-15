import { Activity, RefreshCw, Users, LogOut, Calendar, UserCheck, Settings } from 'lucide-react'
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
  onOpenSettings: () => void
}

export function DashboardHeader({
  isGoogleInitialized,
  isGoogleSignedIn,
  loading,
  onGoogleAuth,
  onSwitchAccount,
  onSyncAppointments,
  currentGoogleUser,
  onOpenSettings
}: DashboardHeaderProps) {
  const { user, signOut } = useAuth()

  return (
    <TooltipProvider>
      <header className="bg-background shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Activity className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  Dashboard Médico
                </h1>
                <p className="text-xs text-muted-foreground">
                  Sistema de Gestão de Consultas
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Informações do usuário */}
              <div className="text-right">
                <div className="text-sm font-medium text-foreground">
                  Dr(a). {user?.email?.split('@')[0]}
                </div>
                {isGoogleSignedIn && currentGoogleUser && (
                  <div className="text-xs text-green-600 flex items-center justify-center space-x-1">
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

              {/* Botão de configurações */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    onClick={onOpenSettings}
                    size="icon"
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Configurações</p>
                </TooltipContent>
              </Tooltip>

              {/* Botão sair */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    onClick={signOut}
                    size="icon"
                  >
                    <LogOut className="h-5 w-5" />
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
