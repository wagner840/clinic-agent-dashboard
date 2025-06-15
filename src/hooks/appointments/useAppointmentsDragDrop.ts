
import { DropResult } from 'react-beautiful-dnd'
import { Appointment } from '@/types/appointment'
import { useToast } from "@/hooks/use-toast"

interface UseAppointmentsDragDropProps {
  todayAppointments: Appointment[]
  upcomingAppointments: Appointment[]
  cancelledAppointments: Appointment[]
  onCancelAppointment: (appointment: Appointment) => Promise<void>
  onReactivateAppointment: (appointment: Appointment) => Promise<void>
  onRescheduleAppointment: (appointment: Appointment) => void
}

export function useAppointmentsDragDrop({
  todayAppointments,
  upcomingAppointments,
  cancelledAppointments,
  onCancelAppointment,
  onReactivateAppointment,
  onRescheduleAppointment
}: UseAppointmentsDragDropProps) {
  const { toast } = useToast()

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
      onRescheduleAppointment(movedAppointment)
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

  return {
    handleDragEnd
  }
}
