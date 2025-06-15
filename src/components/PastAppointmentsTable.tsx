
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock } from 'lucide-react'
import { Appointment } from '@/types/appointment'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { getTypeText } from '@/utils/appointmentUtils'

interface PastAppointmentsTableProps {
  appointments: Appointment[]
  onMarkAsCompleted: (appointment: Appointment) => void
}

export function PastAppointmentsTable({ appointments, onMarkAsCompleted }: PastAppointmentsTableProps) {
  if (appointments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Agendamentos Passados
            <Badge variant="secondary">0</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhum agendamento passado pendente</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Agendamentos Passados
          <Badge variant="secondary">{appointments.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Paciente</TableHead>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Médico</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell className="font-medium">
                  <div>
                    <p>{appointment.patient.name}</p>
                    {appointment.patient.email && (
                      <p className="text-sm text-gray-500">{appointment.patient.email}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p>{format(appointment.start, "dd/MM/yyyy", { locale: ptBR })}</p>
                    <p className="text-sm text-gray-500">
                      {format(appointment.start, "HH:mm", { locale: ptBR })} - {format(appointment.end, "HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{getTypeText(appointment.type)}</Badge>
                </TableCell>
                <TableCell>{appointment.doctor.name}</TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    onClick={() => onMarkAsCompleted(appointment)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Marcar como Concluído
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
