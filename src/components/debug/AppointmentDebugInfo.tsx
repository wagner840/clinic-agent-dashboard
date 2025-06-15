
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Appointment } from '@/types/appointment'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface AppointmentDebugInfoProps {
  appointments: Appointment[]
  todayAppointments: Appointment[]
  upcomingAppointments: Appointment[]
  pastAppointments: Appointment[]
  completedAppointments: Appointment[]
  cancelledAppointments: Appointment[]
}

export function AppointmentDebugInfo({
  appointments,
  todayAppointments,
  upcomingAppointments,
  pastAppointments,
  completedAppointments,
  cancelledAppointments
}: AppointmentDebugInfoProps) {
  const now = new Date()

  return (
    <Card className="mt-4 border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="text-yellow-800">🐛 Debug Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2">Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
            <Badge variant="outline">Total: {appointments.length}</Badge>
            <Badge variant="outline">Today: {todayAppointments.length}</Badge>
            <Badge variant="outline">Upcoming: {upcomingAppointments.length}</Badge>
            <Badge variant="outline">Past: {pastAppointments.length}</Badge>
            <Badge variant="outline">Completed: {completedAppointments.length}</Badge>
            <Badge variant="outline">Cancelled: {cancelledAppointments.length}</Badge>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Current Time: {format(now, 'dd/MM/yyyy HH:mm', { locale: ptBR })}</h4>
        </div>

        <div>
          <h4 className="font-semibold mb-2">All Appointments</h4>
          <div className="space-y-1 max-h-60 overflow-y-auto text-sm">
            {appointments.length === 0 ? (
              <p className="text-gray-500">No appointments found</p>
            ) : (
              appointments.map(apt => (
                <div key={apt.id} className="flex items-center gap-2 p-2 bg-white rounded border">
                  <Badge 
                    variant={apt.status === 'completed' ? 'default' : apt.status === 'cancelled' ? 'destructive' : 'secondary'}
                  >
                    {apt.status}
                  </Badge>
                  <span className="font-medium">{apt.patient.name}</span>
                  <span className="text-gray-500">
                    {format(apt.start, 'dd/MM HH:mm', { locale: ptBR })}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {apt.start < now ? 'Past' : apt.start.toDateString() === now.toDateString() ? 'Today' : 'Future'}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
