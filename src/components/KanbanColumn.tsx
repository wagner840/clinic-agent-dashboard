
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
  return (
    <Card className="h-fit">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon className="h-5 w-5" />
            <span className="text-lg">{title}</span>
          </div>
          <Badge className={`${badgeColor} text-sm font-medium`}>
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
              className={`space-y-3 min-h-[200px] p-2 rounded-lg transition-colors ${
                snapshot.isDraggingOver ? 'bg-blue-50 border-2 border-dashed border-blue-300' : ''
              }`}
            >
              {appointments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Icon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm">
                    {id === 'today' && 'Nenhum agendamento para hoje'}
                    {id === 'upcoming' && 'Nenhum agendamento próximo'}
                    {id === 'cancelled' && 'Nenhum agendamento cancelado'}
                  </p>
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
                        className={`${
                          snapshot.isDragging ? 'rotate-3 shadow-lg' : ''
                        } ${
                          appointment.status === 'completed'
                            ? 'opacity-60 cursor-not-allowed' 
                            : 'cursor-grab active:cursor-grabbing'
                        }`}
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
