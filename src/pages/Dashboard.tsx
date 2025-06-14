
import { Calendar, Clock, Users, Activity } from 'lucide-react'
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
    isGapiLoaded,
    fetchAppointments
  } = useGoogleCalendarReal()

  const todayAppointments = getTodayAppointments()
  const upcomingAppointments = getUpcomingAppointments()

  console.log('Google Calendar API status:', {
    isGapiLoaded,
    appointmentsCount: appointments.length,
    loading,
    error
  })

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
              {!isGapiLoaded && (
                <span className="text-xs text-orange-600">
                  Carregando Google API...
                </span>
              )}
              <Button 
                variant="outline" 
                onClick={fetchAppointments}
                disabled={loading || !isGapiLoaded}
              >
                {loading ? 'Sincronizando...' : 'Sincronizar'}
              </Button>
              <Button variant="outline" onClick={signOut}>
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status da API */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="text-red-800">
                <strong>Erro na integração:</strong> {error}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={fetchAppointments}
                disabled={loading}
              >
                Tentar novamente
              </Button>
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
                {isGapiLoaded && (
                  <span className="ml-2 text-green-600">• Google Calendar conectado</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  Carregando do Google Calendar...
                </div>
              ) : error ? (
                <div className="text-center py-4 text-red-600">{error}</div>
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
              {loading ? (
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
