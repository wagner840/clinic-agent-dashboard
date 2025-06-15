
import { CheckCircle, MoreVertical } from 'lucide-react'
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
  children: React.ReactNode
}

export function AppointmentContextMenu({ 
  appointment, 
  onMarkAsCompleted, 
  children 
}: AppointmentContextMenuProps) {
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
  )
}
