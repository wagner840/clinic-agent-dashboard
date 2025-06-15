
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2 } from 'lucide-react'
import { Appointment } from '@/types/appointment'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { getTypeText } from '@/utils/appointmentUtils'

interface CompletedAppointmentsTableProps {
  appointments: Appointment[]
}

export function CompletedAppointmentsTable({ appointments }: CompletedAppointmentsTableProps) {
  if (appointments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Agendamentos Concluídos
            <Badge variant="secondary">0</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhum agendamento concluído</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          Agendamentos Concluídos
          <Badge className="bg-green-100 text-green-800">{appointments.length}</Badge>
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
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((appointment) => (
              <TableRow key={appointment.id} className="bg-green-50/30">
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
                <TableCell>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Concluído
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
