
import { useCallback } from 'react'
import { Appointment } from '@/types/appointment'
import { useToast } from '@/hooks/use-toast'

interface AppointmentOperations {
  rescheduleAppointment: (id: string, newStart: Date, newEnd: Date) => Promise<void>
  cancelAppointment: (id: string) => Promise<void>
  reactivateAppointment: (id: string) => Promise<void>
  addAppointment: (appointmentData: any) => Promise<string>
  markAsCompleted: (id: string) => Promise<void>
}

interface PaymentActions {
  setPaymentAppointment: (appointment: Appointment | null) => void
}

export function useAppointmentHandlers(operations: AppointmentOperations, paymentActions?: PaymentActions) {
  const { toast } = useToast()

  const handleMarkAsCompleted = useCallback(async (appointment: Appointment) => {
    // Se temos as ações de pagamento, abre o modal de pagamento
    if (paymentActions) {
      paymentActions.setPaymentAppointment(appointment)
      return
    }

    // Caso contrário, marca diretamente como concluído (fallback)
    try {
      await operations.markAsCompleted(appointment.id)
      toast({
        title: "Agendamento finalizado",
        description: `${appointment.patient.name} foi marcado como concluído.`,
      })
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao finalizar agendamento.",
        variant: "destructive"
      })
    }
  }, [operations.markAsCompleted, paymentActions, toast])

  const handleRescheduleAppointment = useCallback(async (appointment: Appointment, newDate: Date) => {
    try {
      const duration = appointment.end.getTime() - appointment.start.getTime()
      const newEnd = new Date(newDate.getTime() + duration)
      await operations.rescheduleAppointment(appointment.id, newDate, newEnd)
      toast({
        title: "Reagendado",
        description: `${appointment.patient.name} foi reagendado com sucesso.`,
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao reagendar agendamento.",
        variant: "destructive"
      })
    }
  }, [operations.rescheduleAppointment, toast])

  const handleCancelAppointment = useCallback(async (appointment: Appointment) => {
    try {
      await operations.cancelAppointment(appointment.id)
      toast({
        title: "Cancelado",
        description: `${appointment.patient.name} foi cancelado.`,
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao cancelar agendamento.",
        variant: "destructive"
      })
    }
  }, [operations.cancelAppointment, toast])

  const handleReactivateAppointment = useCallback(async (appointment: Appointment) => {
    try {
      await operations.reactivateAppointment(appointment.id)
      toast({
        title: "Reativado",
        description: `${appointment.patient.name} foi reativado.`,
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao reativar agendamento.",
        variant: "destructive"
      })
    }
  }, [operations.reactivateAppointment, toast])

  const handleAddAppointment = useCallback(async (appointmentData: any) => {
    try {
      const eventId = await operations.addAppointment(appointmentData)
      toast({
        title: "Criado",
        description: "Agendamento criado com sucesso!",
      })
      return eventId
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar agendamento.",
        variant: "destructive"
      })
      throw error
    }
  }, [operations.addAppointment, toast])

  return {
    handleMarkAsCompleted,
    handleRescheduleAppointment,
    handleCancelAppointment,
    handleReactivateAppointment,
    handleAddAppointment
  }
}
