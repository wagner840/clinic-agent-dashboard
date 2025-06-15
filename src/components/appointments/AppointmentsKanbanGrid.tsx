
import { Calendar, Clock, XCircle } from 'lucide-react'
import { DragDropContext } from 'react-beautiful-dnd'
import { KanbanColumn } from '@/components/KanbanColumn'
import { Appointment } from '@/types/appointment'

interface AppointmentsKanbanGridProps {
  todayAppointments: Appointment[]
  upcomingAppointments: Appointment[]
  cancelledAppointments: Appointment[]
  onDragEnd: (result: any) => void
  onMarkAsCompleted: (appointment: Appointment) => void
  onCancelAppointment: (appointment: Appointment) => Promise<void>
  onReactivateAppointment: (appointment: Appointment) => Promise<void>
}

export function AppointmentsKanbanGrid({
  todayAppointments,
  upcomingAppointments,
  cancelledAppointments,
  onDragEnd,
  onMarkAsCompleted,
  onCancelAppointment,
  onReactivateAppointment
}: AppointmentsKanbanGridProps) {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <KanbanColumn
          id="today"
          title="Agendamentos de Hoje"
          appointments={todayAppointments}
          icon={Calendar}
          badgeColor="bg-green-100 text-green-800 border-green-200"
          onMarkAsCompleted={onMarkAsCompleted}
          onCancelAppointment={onCancelAppointment}
          onReactivateAppointment={onReactivateAppointment}
        />
        
        <KanbanColumn
          id="upcoming"
          title="Próximos Agendamentos"
          appointments={upcomingAppointments}
          icon={Clock}
          badgeColor="bg-blue-100 text-blue-800 border-blue-200"
          onMarkAsCompleted={onMarkAsCompleted}
          onCancelAppointment={onCancelAppointment}
          onReactivateAppointment={onReactivateAppointment}
        />
        
        <KanbanColumn
          id="cancelled"
          title="Agendamentos Cancelados"
          appointments={cancelledAppointments}
          icon={XCircle}
          badgeColor="bg-red-100 text-red-800 border-red-200"
          onMarkAsCompleted={onMarkAsCompleted}
          onCancelAppointment={onCancelAppointment}
          onReactivateAppointment={onReactivateAppointment}
        />
      </div>
    </DragDropContext>
  )
}
