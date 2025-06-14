
import { Calendar, Clock, Users, Activity, AlertCircle, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useGoogleCalendarReal } from '@/hooks/useGoogleCalendarReal'
import { AppointmentCard } from '@/components/AppointmentCard'
import { DashboardStats } from '@/components/DashboardStats'

export default function Dashboard() {
  const { user, signOut } = useAuth()
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

  const handleGoogleAuth = async () => {
    if (isGoogleSignedIn) {
      await googleSignOut()
    } else {
      await googleSignIn()
    }
  }

  const handleSwitchAccount = async () => {
    await googleSwitchAccount()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
                    onClick={handleGoogleAuth}
                    disabled={loading}
                    className={isGoogleSignedIn ? "border-green-500 text-green-700" : "border-red-500 text-red-700"}
                  >
                    {isGoogleSignedIn ? 'Desconectar Google' : 'Conectar Google Calendar'}
                  </Button>

                  {/* Botão para trocar conta */}
                  {isGoogleSignedIn && (
                    <Button 
                      variant="outline" 
                      onClick={handleSwitchAccount}
                      disabled={loading}
                      className="border-blue-500 text-blue-700"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Trocar Conta
                    </Button>
                  )}
                </div>
              )}

              {/* Botão de sincronização */}
              {isGoogleSignedIn && (
                <Button 
                  variant="outline" 
                  onClick={fetchAppointments}
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                onClick={googleSignIn}
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
                  onClick={clearError}
                >
                  Limpar erro
                </Button>
                {isGoogleSignedIn && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={fetchAppointments}
                    disabled={loading}
                  >
                    Tentar novamente
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <DashboardStats 
          totalAppointments={appointments.length}
          todayAppointments={todayAppointments.length}
          upcomingAppointments={upcomingAppointments.length}
        />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Today's Appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Agendamentos de Hoje</span>
              </CardTitle>
              <CardDescription>
                {todayAppointments.length} consulta(s) agendada(s)
                {isGoogleSignedIn && (
                  <span className="ml-2 text-green-600">• Google Calendar conectado</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isGoogleSignedIn ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="mb-4">Conecte o Google Calendar para ver seus agendamentos</p>
                  <Button onClick={googleSignIn} disabled={!isGoogleInitialized}>
                    Conectar Google Calendar
                  </Button>
                </div>
              ) : loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  Carregando do Google Calendar...
                </div>
              ) : todayAppointments.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  Nenhum agendamento para hoje
                </div>
              ) : (
                <div className="space-y-4">
                  {todayAppointments.map(appointment => (
                    <AppointmentCard 
                      key={appointment.id} 
                      appointment={appointment} 
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Próximos Agendamentos</span>
              </CardTitle>
              <CardDescription>
                Próximas consultas agendadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isGoogleSignedIn ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Conecte o Google Calendar para ver próximos agendamentos</p>
                </div>
              ) : loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  Carregando...
                </div>
              ) : upcomingAppointments.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  Nenhum agendamento próximo
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingAppointments.slice(0, 5).map(appointment => (
                    <AppointmentCard 
                      key={appointment.id} 
                      appointment={appointment} 
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
