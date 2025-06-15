
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 px-2 sm:px-0">
        <KanbanColumn
          id="today"
          title="Hoje"
          appointments={todayAppointments}
          icon={Calendar}
          badgeColor="bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700"
          onMarkAsCompleted={onMarkAsCompleted}
          onCancelAppointment={onCancelAppointment}
          onReactivateAppointment={onReactivateAppointment}
        />
        
        <KanbanColumn
          id="upcoming"
          title="Próximos"
          appointments={upcomingAppointments}
          icon={Clock}
          badgeColor="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700"
          onMarkAsCompleted={onMarkAsCompleted}
          onCancelAppointment={onCancelAppointment}
          onReactivateAppointment={onReactivateAppointment}
        />
        
        <KanbanColumn
          id="cancelled"
          title="Cancelados"
          appointments={cancelledAppointments}
          icon={XCircle}
          badgeColor="bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700"
          onMarkAsCompleted={onMarkAsCompleted}
          onCancelAppointment={onCancelAppointment}
          onReactivateAppointment={onReactivateAppointment}
        />
      </div>
    </DragDropContext>
  )
}
