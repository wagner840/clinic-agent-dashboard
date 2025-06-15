
import { AlertCircle, CheckCircle, Calendar, Wifi, WifiOff } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface GoogleAuthAlertsProps {
  isGoogleInitialized: boolean
  isGoogleSignedIn: boolean
  error: string | null
  onGoogleSignIn: () => Promise<void>
  onRetry: () => Promise<void>
  onClearError: () => void
  loading: boolean
  currentGoogleUser?: {
    email: string
    name: string
    imageUrl: string
  } | null
}

export function GoogleAuthAlerts({
  isGoogleInitialized,
  isGoogleSignedIn,
  error,
  onGoogleSignIn,
  onRetry,
  onClearError,
  loading,
  currentGoogleUser
}: GoogleAuthAlertsProps) {
  return (
    <>
      {/* Conta Google conectada */}
      {isGoogleSignedIn && currentGoogleUser && (
        <Card className="mb-6 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="relative">
                  <img 
                    src={currentGoogleUser.imageUrl} 
                    alt={currentGoogleUser.name}
                    className="h-12 w-12 rounded-full border-2 border-green-200"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                    <CheckCircle className="h-3 w-3 text-white" />
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-green-600" />
                  <span className="text-green-800 font-semibold">Google Calendar Conectado</span>
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    <Wifi className="h-3 w-3 mr-1" />
                    Online
                  </Badge>
                </div>
                <div className="text-sm text-green-700 mt-1">
                  <strong>{currentGoogleUser.name}</strong> • {currentGoogleUser.email}
                </div>
                <div className="text-xs text-green-600 mt-1">
                  Agendamentos sendo sincronizados automaticamente
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerta para conectar Google */}
      {isGoogleInitialized && !isGoogleSignedIn && !error && (
        <Card className="mb-6 border-blue-200 bg-gradient-to-r from-blue-50 to-sky-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="bg-blue-100 rounded-full p-3">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-blue-800 font-semibold">Google Calendar</span>
                  <Badge variant="outline" className="text-blue-600 border-blue-300">
                    <WifiOff className="h-3 w-3 mr-1" />
                    Desconectado
                  </Badge>
                </div>
                <p className="text-sm text-blue-700 mb-3">
                  Conecte sua conta do Google Calendar para visualizar e gerenciar seus agendamentos em tempo real.
                </p>
                <Button 
                  variant="default" 
                  size="sm" 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={onGoogleSignIn}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Conectar Google Calendar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alertas de erro */}
      {error && (
        <Card className="mb-6 border-red-200 bg-gradient-to-r from-red-50 to-rose-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="bg-red-100 rounded-full p-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
              </div>
              <div className="flex-1">
                <div className="text-red-800 font-semibold mb-1">
                  Erro na Integração com Google
                </div>
                <p className="text-sm text-red-700 mb-3">
                  {error}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={onClearError}
                    className="border-red-200 text-red-700 hover:bg-red-50"
                  >
                    Dispensar
                  </Button>
                  {isGoogleSignedIn && (
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={onRetry}
                      disabled={loading}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {loading ? 'Tentando...' : 'Tentar Novamente'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}
