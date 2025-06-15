
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AppointmentCard } from '@/components/AppointmentCard'
import { Appointment } from '@/types/appointment'
import { Droppable, Draggable } from 'react-beautiful-dnd'
import { LucideIcon } from 'lucide-react'

interface KanbanColumnProps {
  id: string
  title: string
  appointments: Appointment[]
  icon: LucideIcon
  badgeColor?: string
  onMarkAsCompleted: (appointment: Appointment) => void
  onCancelAppointment: (appointment: Appointment) => Promise<void>
  onReactivateAppointment: (appointment: Appointment) => Promise<void>
}

export function KanbanColumn({ 
  id, 
  title, 
  appointments, 
  icon: Icon, 
  badgeColor = "bg-blue-100 text-blue-800 border-blue-200",
  onMarkAsCompleted,
  onCancelAppointment,
  onReactivateAppointment
}: KanbanColumnProps) {
  const getEmptyMessage = () => {
    switch (id) {
      case 'today': return 'Nenhum agendamento para hoje'
      case 'upcoming': return 'Nenhum agendamento próximo'
      case 'cancelled': return 'Nenhum agendamento cancelado'
      default: return 'Nenhum agendamento'
    }
  }

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-base sm:text-lg">{title}</span>
          </div>
          <Badge className={`${badgeColor} text-xs sm:text-sm font-medium`}>
            {appointments.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Droppable droppableId={id}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`
                space-y-3 min-h-[200px] p-2 rounded-lg transition-colors
                ${snapshot.isDraggingOver ? 'bg-blue-50 border-2 border-dashed border-blue-300' : ''}
              `}
            >
              {appointments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Icon className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-xs sm:text-sm">{getEmptyMessage()}</p>
                </div>
              ) : (
                appointments.map((appointment, index) => (
                  <Draggable
                    key={appointment.id}
                    draggableId={appointment.id}
                    index={index}
                    isDragDisabled={appointment.status === 'completed'}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`
                          transition-transform duration-200
                          ${snapshot.isDragging ? 'rotate-3 shadow-lg scale-105' : ''}
                          ${appointment.status === 'completed'
                            ? 'opacity-60 cursor-not-allowed' 
                            : 'cursor-grab active:cursor-grabbing'
                          }
                        `}
                      >
                        <AppointmentCard
                          appointment={appointment}
                          onMarkAsCompleted={onMarkAsCompleted}
                          onCancelAppointment={onCancelAppointment}
                          onReactivateAppointment={onReactivateAppointment}
                        />
                      </div>
                    )}
                  </Draggable>
                ))
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </CardContent>
    </Card>
  )
}
