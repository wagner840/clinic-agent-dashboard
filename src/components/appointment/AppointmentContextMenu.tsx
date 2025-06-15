
import { CheckCircle, MoreVertical, XCircle, RotateCcw } from 'lucide-react'
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
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Appointment } from '@/types/appointment'
import { toast } from '@/components/ui/use-toast'

interface AppointmentContextMenuProps {
  appointment: Appointment
  onMarkAsCompleted: (appointment: Appointment) => void
  onCancelAppointment: (appointment: Appointment) => Promise<void>
  onReactivateAppointment: (appointment: Appointment) => Promise<void>
  children: React.ReactNode
}

export function AppointmentContextMenu({ 
  appointment, 
  onMarkAsCompleted, 
  onCancelAppointment,
  onReactivateAppointment,
  children 
}: AppointmentContextMenuProps) {
  const handleStatusChange = async (action: 'completed' | 'cancelled' | 'reactivate') => {
    try {
      switch (action) {
        case 'completed':
          onMarkAsCompleted(appointment)
          break
        case 'cancelled':
          await onCancelAppointment(appointment)
          toast({
            title: 'Agendamento cancelado',
            description: `${appointment.patient.name} foi cancelado com sucesso.`,
          })
          break
        case 'reactivate':
          await onReactivateAppointment(appointment)
          toast({
            title: 'Agendamento reativado',
            description: `${appointment.patient.name} foi reativado com sucesso.`,
          })
          break
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao processar a ação.',
        variant: 'destructive',
      })
    }
  }

  const isCompleted = appointment.status === 'completed'
  const isCancelled = appointment.status === 'cancelled'
  const isScheduled = appointment.status === 'scheduled'

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        {children}
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
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        {isScheduled && (
          <>
            <ContextMenuItem
              onClick={() => handleStatusChange('completed')}
              className="cursor-pointer"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              <span>Marcar como Concluído</span>
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={() => handleStatusChange('cancelled')}
              className="cursor-pointer text-red-600"
            >
              <XCircle className="mr-2 h-4 w-4" />
              <span>Cancelar Agendamento</span>
            </ContextMenuItem>
          </>
        )}
        
        {isCancelled && (
          <ContextMenuItem
            onClick={() => handleStatusChange('reactivate')}
            className="cursor-pointer text-blue-600"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            <span>Reativar Agendamento</span>
          </ContextMenuItem>
        )}

        {isCompleted && (
          <ContextMenuItem disabled className="text-gray-500">
            <CheckCircle className="mr-2 h-4 w-4" />
            <span>Agendamento Finalizado</span>
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  )
}
