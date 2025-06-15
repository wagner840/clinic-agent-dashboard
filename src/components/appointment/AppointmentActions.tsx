
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DollarSign, CheckCircle } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Appointment } from '@/types/appointment'

interface AppointmentActionsProps {
  appointment: Appointment
  onMarkAsCompleted: (appointment: Appointment) => void
}

export function AppointmentActions({ appointment, onMarkAsCompleted }: AppointmentActionsProps) {
  const isCompleted = appointment.status === 'completed'
  const isScheduled = appointment.status === 'scheduled'

  if (isScheduled) {
    return (
      <div className="flex justify-end">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              onClick={() => onMarkAsCompleted(appointment)}
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
    )
  }

  if (isCompleted) {
    return (
      <div className="flex justify-end">
        <Badge className="bg-green-100 text-green-800 text-xs">
          <CheckCircle className="h-3 w-3 mr-1" />
          Finalizado
        </Badge>
      </div>
    )
  }

  return null
}
