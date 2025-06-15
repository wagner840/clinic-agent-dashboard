
import { Card, CardContent } from '@/components/ui/card'
import { Appointment } from '@/types/appointment'
import {
  TooltipProvider,
} from "@/components/ui/tooltip"
import { AppointmentDetails } from '@/components/appointment/AppointmentDetails'
import { AppointmentActions } from '@/components/appointment/AppointmentActions'
import { AppointmentContextMenu } from '@/components/appointment/AppointmentContextMenu'

interface AppointmentCardProps {
  appointment: Appointment
  onMarkAsCompleted: (appointment: Appointment) => void
}

export function AppointmentCard({ appointment, onMarkAsCompleted }: AppointmentCardProps) {
  const isCompleted = appointment.status === 'completed'
  const isCancelled = appointment.status === 'cancelled'

  return (
    <TooltipProvider>
      <AppointmentContextMenu 
        appointment={appointment} 
        onMarkAsCompleted={onMarkAsCompleted}
      >
        <Card className={`hover:shadow-lg transition-all duration-200 relative border-l-4 ${
          isCompleted ? 'border-l-green-500 bg-green-50/30' : 
          isCancelled ? 'border-l-red-500 bg-red-50/30' : 
          'border-l-blue-500 hover:border-l-blue-600'
        }`}>
          <CardContent className="p-4">
            <AppointmentDetails appointment={appointment} />
            <AppointmentActions 
              appointment={appointment} 
              onMarkAsCompleted={onMarkAsCompleted} 
            />
          </CardContent>
        </Card>
      </AppointmentContextMenu>
    </TooltipProvider>
  )
}
