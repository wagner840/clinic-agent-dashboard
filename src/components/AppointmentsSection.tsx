
import { Calendar, Clock, XCircle, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { KanbanColumn } from '@/components/KanbanColumn'
import { Appointment } from '@/types/appointment'
import { DragDropContext, DropResult } from 'react-beautiful-dnd'
import { useToast } from "@/hooks/use-toast"
import { useState } from 'react'
import { RescheduleModal } from '@/components/modals/RescheduleModal'
import { AddAppointmentModal } from '@/components/modals/AddAppointmentModal'

interface AppointmentsSectionProps {
  todayAppointments: Appointment[]
  upcomingAppointments: Appointment[]
  cancelledAppointments: Appointment[]
  isGoogleSignedIn: boolean
  isGoogleInitialized: boolean
  loading: boolean
  onGoogleSignIn: () => Promise<void>
  onMarkAsCompleted: (appointment: Appointment) => void
  onRescheduleAppointment: (appointment: Appointment, newDate: Date) => Promise<void>
  onCancelAppointment: (appointment: Appointment) => Promise<void>
  onReactivateAppointment: (appointment: Appointment) => Promise<void>
  onAddAppointment: (appointmentData: any) => Promise<void>
}

export function AppointmentsSection({
  todayAppointments,
  upcomingAppointments,
  cancelledAppointments,
  isGoogleSignedIn,
  isGoogleInitialized,
  loading,
  onGoogleSignIn,
  onMarkAsCompleted,
  onRescheduleAppointment,
  onCancelAppointment,
  onReactivateAppointment,
  onAddAppointment
}: AppointmentsSectionProps) {
  const { toast } = useToast()
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return
    }

    const allAppointments = [...todayAppointments, ...upcomingAppointments, ...cancelledAppointments]
    const movedAppointment = allAppointments.find(apt => apt.id === draggableId)

    if (!movedAppointment) return

    // Se moveu de "upcoming" para "today", abre modal para alterar horário
    if (source.droppableId === 'upcoming' && destination.droppableId === 'today') {
      setSelectedAppointment(movedAppointment)
      setRescheduleModalOpen(true)
      return
    }

    // Se moveu para "cancelled", cancela o agendamento
    if (destination.droppableId === 'cancelled') {
      handleCancelAppointment(movedAppointment)
      return
    }

    // Se moveu de "cancelled" para outro lugar, reativa
    if (source.droppableId === 'cancelled' && destination.droppableId !== 'cancelled') {
      handleReactivateAppointment(movedAppointment)
      return
    }

    toast({
      title: 'Informação',
      description: 'Para outras alterações, use as opções do menu do agendamento.',
    })
  }

  const handleCancelAppointment = async (appointment: Appointment) => {
    try {
      await onCancelAppointment(appointment)
      toast({
        title: 'Agendamento cancelado',
        description: `${appointment.patient.name} foi cancelado com sucesso.`,
      })
    } catch (error) {
      toast({
        title: 'Erro ao cancelar',
        description: 'Ocorreu um erro ao cancelar o agendamento.',
        variant: 'destructive',
      })
    }
  }

  const handleReactivateAppointment = async (appointment: Appointment) => {
    try {
      await onReactivateAppointment(appointment)
      toast({
        title: 'Agendamento reativado',
        description: `${appointment.patient.name} foi reativado com sucesso.`,
      })
    } catch (error) {
      toast({
        title: 'Erro ao reativar',
        description: 'Ocorreu um erro ao reativar o agendamento.',
        variant: 'destructive',
      })
    }
  }

  const handleReschedule = async (newDate: Date) => {
    if (selectedAppointment) {
      try {
        await onRescheduleAppointment(selectedAppointment, newDate)
        toast({
          title: 'Horário alterado',
          description: `${selectedAppointment.patient.name} foi reagendado com sucesso.`,
        })
        setRescheduleModalOpen(false)
        setSelectedAppointment(null)
      } catch (error) {
        toast({
          title: 'Erro ao reagendar',
          description: 'Ocorreu um erro ao alterar o horário.',
          variant: 'destructive',
        })
      }
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
            Para visualizar e gerenciar seus agendamentos, 
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
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Agendamentos</h2>
          <p className="text-gray-600">
            Arraste e solte para gerenciar. Arraste para "Hoje" para alterar horário.
          </p>
        </div>
        <Button onClick={() => setAddModalOpen(true)} className="sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Novo Agendamento
        </Button>
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
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start space-x-3">
          <div className="text-blue-600 mt-1">💡</div>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Dicas de uso:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Arraste de "Próximos" para "Hoje" para alterar horário</li>
              <li>Arraste para "Cancelados" para cancelar agendamento</li>
              <li>Clique em "Finalizar" para concluir e registrar pagamento</li>
              <li>Use o menu do card (botão direito) para mais opções</li>
            </ul>
          </div>
        </div>
      </div>

      <RescheduleModal
        isOpen={rescheduleModalOpen}
        onClose={() => {
          setRescheduleModalOpen(false)
          setSelectedAppointment(null)
        }}
        appointment={selectedAppointment}
        onReschedule={handleReschedule}
      />

      <AddAppointmentModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAddAppointment={onAddAppointment}
      />
    </div>
  )
}
