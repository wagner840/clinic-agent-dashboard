
import { Calendar, Clock, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { KanbanColumn } from '@/components/KanbanColumn'
import { Appointment } from '@/types/appointment'
import { DragDropContext, DropResult } from 'react-beautiful-dnd'
import { useToast } from "@/hooks/use-toast"

interface AppointmentsSectionProps {
  todayAppointments: Appointment[]
  upcomingAppointments: Appointment[]
  cancelledAppointments: Appointment[]
  isGoogleSignedIn: boolean
  isGoogleInitialized: boolean
  loading: boolean
  onGoogleSignIn: () => Promise<void>
  onMarkAsCompleted: (appointment: Appointment) => void
}

export function AppointmentsSection({
  todayAppointments,
  upcomingAppointments,
  cancelledAppointments,
  isGoogleSignedIn,
  isGoogleInitialized,
  loading,
  onGoogleSignIn,
  onMarkAsCompleted
}: AppointmentsSectionProps) {
  const { toast } = useToast()

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result

    // Se não há destino, cancela
    if (!destination) return

    // Se foi solto no mesmo lugar, cancela
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return
    }

    // Encontra o appointment que foi movido
    const allAppointments = [...todayAppointments, ...upcomingAppointments, ...cancelledAppointments]
    const movedAppointment = allAppointments.find(apt => apt.id === draggableId)

    if (!movedAppointment) return

    // Lógica de movimentação baseada no destino
    if (destination.droppableId === 'cancelled') {
      toast({
        title: 'Função em desenvolvimento',
        description: 'A funcionalidade de cancelar agendamentos via drag and drop estará disponível em breve.',
      })
      return
    }

    if (destination.droppableId === 'today' && movedAppointment.status === 'scheduled') {
      // Se arrastou para "hoje", marca como concluído
      onMarkAsCompleted(movedAppointment)
      toast({
        title: 'Consulta finalizada!',
        description: `${movedAppointment.patient.name} foi marcado para finalização.`,
      })
    } else if (destination.droppableId === 'upcoming') {
      toast({
        title: 'Informação',
        description: 'Para reagendar consultas, use diretamente o Google Calendar.',
      })
    }
  }

  if (!isGoogleSignedIn) {
    return (
      <div className="mt-8">
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Calendar className="h-16 w-16 mx-auto mb-6 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Conecte o Google Calendar
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Para visualizar e gerenciar seus agendamentos no formato Kanban, 
            conecte sua conta do Google Calendar.
          </p>
          <Button onClick={onGoogleSignIn} disabled={!isGoogleInitialized} size="lg">
            <Calendar className="h-5 w-5 mr-2" />
            Conectar Google Calendar
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="mt-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando agendamentos do Google Calendar...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Quadro Kanban - Agendamentos</h2>
        <p className="text-gray-600">
          Arraste e solte os agendamentos para gerenciá-los. Arraste para "Hoje" para finalizar uma consulta.
        </p>
      </div>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <KanbanColumn
            id="today"
            title="Agendamentos de Hoje"
            appointments={todayAppointments}
            icon={Calendar}
            badgeColor="bg-green-100 text-green-800 border-green-200"
            onMarkAsCompleted={onMarkAsCompleted}
          />
          
          <KanbanColumn
            id="upcoming"
            title="Próximos Agendamentos"
            appointments={upcomingAppointments}
            icon={Clock}
            badgeColor="bg-blue-100 text-blue-800 border-blue-200"
            onMarkAsCompleted={onMarkAsCompleted}
          />
          
          <KanbanColumn
            id="cancelled"
            title="Agendamentos Cancelados"
            appointments={cancelledAppointments}
            icon={XCircle}
            badgeColor="bg-red-100 text-red-800 border-red-200"
            onMarkAsCompleted={onMarkAsCompleted}
          />
        </div>
      </DragDropContext>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start space-x-3">
          <div className="text-blue-600 mt-1">💡</div>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Dicas de uso:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Arraste um agendamento para "Hoje" para finalizar e registrar pagamento</li>
              <li>Use o clique direito nos cards para mais opções</li>
              <li>Agendamentos finalizados e cancelados não podem ser movidos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
