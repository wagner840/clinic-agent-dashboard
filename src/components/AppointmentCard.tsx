import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, User, Phone, CheckCircle, MoreVertical } from 'lucide-react'
import { Appointment } from '@/types/appointment'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { toast } from '@/components/ui/use-toast'

interface AppointmentCardProps {
  appointment: Appointment
  onMarkAsCompleted: (appointment: Appointment) => void
}

export function AppointmentCard({ appointment, onMarkAsCompleted }: AppointmentCardProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Agendado'
      case 'completed':
        return 'Concluído'
      case 'cancelled':
        return 'Cancelado'
      default:
        return status
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'consultation':
        return 'Consulta'
      case 'procedure':
        return 'Procedimento'
      case 'follow-up':
        return 'Retorno'
      default:
        return type
    }
  }

  const handleStatusChange = (status: 'completed' | 'cancelled') => {
    if (status === 'completed') {
      onMarkAsCompleted(appointment)
    } else {
      toast({
        title: 'Função em desenvolvimento',
        description: 'A opção de cancelar agendamentos por aqui estará disponível em breve.',
      })
    }
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Card className="hover:shadow-md transition-shadow relative">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 pr-2">
                <h3 className="font-semibold text-sm text-gray-900 mb-1">
                  {appointment.patient.name}
                </h3>
                <div className="flex items-center text-xs text-gray-600 mb-2">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>
                    {formatTime(appointment.start)} - {formatTime(appointment.end)}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-1">
                <Badge className={getStatusColor(appointment.status)}>
                  {getStatusText(appointment.status)}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {getTypeText(appointment.type)}
                </Badge>
              </div>
            </div>

            {appointment.description && (
              <p className="text-xs text-gray-600 mb-3">
                {appointment.description}
              </p>
            )}

            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center">
                <User className="h-3 w-3 mr-1" />
                <span>{appointment.patient.email || 'Sem email'}</span>
              </div>
              {appointment.patient.phone && (
                <div className="flex items-center">
                  <Phone className="h-3 w-3 mr-1" />
                  <span>{appointment.patient.phone}</span>
                </div>
              )}
            </div>
          </CardContent>
          <div className="absolute top-2 right-2 text-gray-400">
             <MoreVertical className="h-4 w-4" />
          </div>
        </Card>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem
          onClick={() => handleStatusChange('completed')}
          disabled={appointment.status === 'completed' || appointment.status === 'cancelled'}
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          <span>Marcar como Concluído</span>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem disabled>
          Cancelar Agendamento (em breve)
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
