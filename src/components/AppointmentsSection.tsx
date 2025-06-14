
import { Calendar, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AppointmentCard } from '@/components/AppointmentCard'
import { Appointment } from '@/types/appointment'

interface AppointmentsSectionProps {
  todayAppointments: Appointment[]
  upcomingAppointments: Appointment[]
  isGoogleSignedIn: boolean
  isGoogleInitialized: boolean
  loading: boolean
  onGoogleSignIn: () => Promise<void>
}

export function AppointmentsSection({
  todayAppointments,
  upcomingAppointments,
  isGoogleSignedIn,
  isGoogleInitialized,
  loading,
  onGoogleSignIn
}: AppointmentsSectionProps) {
  return (
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
              <Button onClick={onGoogleSignIn} disabled={!isGoogleInitialized}>
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
  )
}
