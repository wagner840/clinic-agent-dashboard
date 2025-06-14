
import { AlertCircle, User } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

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
      {/* Informações da conta Google conectada */}
      {isGoogleSignedIn && currentGoogleUser && (
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <img 
                  src={currentGoogleUser.imageUrl} 
                  alt={currentGoogleUser.name}
                  className="h-10 w-10 rounded-full"
                />
              </div>
              <div className="flex-1">
                <div className="text-green-800 font-medium">
                  Google Calendar Conectado
                </div>
                <div className="text-sm text-green-700">
                  {currentGoogleUser.name} ({currentGoogleUser.email})
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerta de autenticação Google */}
      {isGoogleInitialized && !isGoogleSignedIn && (
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-blue-800">
              <AlertCircle className="h-5 w-5" />
              <div>
                <strong>Google Calendar não conectado</strong>
                <p className="text-sm mt-1">
                  Para visualizar seus agendamentos reais, conecte sua conta do Google Calendar.
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3"
              onClick={onGoogleSignIn}
            >
              Conectar Google Calendar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Status de erro */}
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="text-red-800">
              <strong>Erro na integração:</strong> {error}
            </div>
            <div className="flex space-x-2 mt-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={onClearError}
              >
                Limpar erro
              </Button>
              {isGoogleSignedIn && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onRetry}
                  disabled={loading}
                >
                  Tentar novamente
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}
