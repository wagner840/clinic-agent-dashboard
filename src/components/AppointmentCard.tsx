
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, User, Phone, CheckCircle, MoreVertical, DollarSign } from 'lucide-react'
import { Appointment } from '@/types/appointment'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
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

  const isCompleted = appointment.status === 'completed'
  const isCancelled = appointment.status === 'cancelled'
  const isScheduled = appointment.status === 'scheduled'

  return (
    <TooltipProvider>
      <ContextMenu>
        <ContextMenuTrigger>
          <Card className={`hover:shadow-lg transition-all duration-200 relative border-l-4 ${
            isCompleted ? 'border-l-green-500 bg-green-50/30' : 
            isCancelled ? 'border-l-red-500 bg-red-50/30' : 
            'border-l-blue-500 hover:border-l-blue-600'
          }`}>
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
                <div className="flex flex-col items-end space-y-2">
                  <Badge className={`${getStatusColor(appointment.status)} text-xs font-medium`}>
                    {getStatusText(appointment.status)}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {getTypeText(appointment.type)}
                  </Badge>
                </div>
              </div>

              {appointment.description && (
                <p className="text-xs text-gray-600 mb-3 bg-gray-50 p-2 rounded">
                  {appointment.description}
                </p>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
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

              {/* Botão de ação principal */}
              {isScheduled && (
                <div className="flex justify-end">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange('completed')}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <DollarSign className="h-3 w-3 mr-1" />
                        Finalizar
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Marcar como concluído e registrar pagamento</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}

              {isCompleted && (
                <div className="flex justify-end">
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Finalizado
                  </Badge>
                </div>
              )}
            </CardContent>

            <div className="absolute top-2 right-2 text-gray-400">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <MoreVertical className="h-4 w-4" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Clique com o botão direito para mais opções</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </Card>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-56">
          <ContextMenuItem
            onClick={() => handleStatusChange('completed')}
            disabled={isCompleted || isCancelled}
            className="cursor-pointer"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            <span>Marcar como Concluído</span>
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem disabled className="text-gray-500">
            Cancelar Agendamento (em breve)
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </TooltipProvider>
  )
}
