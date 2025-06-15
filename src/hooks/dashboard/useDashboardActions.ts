
import { useCallback } from 'react'
import { Appointment } from '@/types/appointment'

interface DashboardActionsConfig {
  rescheduleAppointment: (id: string, newStart: Date, newEnd: Date) => Promise<void>
  cancelAppointment: (id: string) => Promise<void>
  reactivateAppointment: (id: string) => Promise<void>
  addAppointment: (appointmentData: any, calendarId: string) => Promise<string>
  markAsCompleted: (id: string) => Promise<void>
  handleCreateCalendar: (calendarName: string) => Promise<void>
  handleDeleteCalendar: (calendarId: string) => Promise<void>
  handleAddHolidaysToAll: () => Promise<void>
  setPaymentAppointment: (appointment: Appointment | null) => void
}

export function useDashboardActions(config: DashboardActionsConfig) {
  const {
    rescheduleAppointment,
    cancelAppointment,
    reactivateAppointment,
    addAppointment,
    markAsCompleted,
    handleCreateCalendar,
    handleDeleteCalendar,
    handleAddHolidaysToAll,
    setPaymentAppointment
  } = config

  const handleMarkAsCompleted = useCallback((appointment: Appointment) => {
    setPaymentAppointment(appointment)
  }, [setPaymentAppointment])

  const handleRescheduleAppointment = useCallback(async (appointment: Appointment, newDate: Date) => {
    const duration = appointment.end.getTime() - appointment.start.getTime()
    const newEnd = new Date(newDate.getTime() + duration)
    await rescheduleAppointment(appointment.id, newDate, newEnd)
  }, [rescheduleAppointment])

  const handleCancelAppointment = useCallback(async (appointment: Appointment) => {
    await cancelAppointment(appointment.id)
  }, [cancelAppointment])

  const handleReactivateAppointment = useCallback(async (appointment: Appointment) => {
    await reactivateAppointment(appointment.id)
  }, [reactivateAppointment])

  const handleAddAppointment = useCallback(async (appointmentData: any, calendarId: string) => {
    return await addAppointment(appointmentData, calendarId)
  }, [addAppointment])

  return {
    handleMarkAsCompleted,
    handleRescheduleAppointment,
    handleCancelAppointment,
    handleReactivateAppointment,
    handleAddAppointment,
    handleCreateCalendar,
    handleDeleteCalendar,
    handleAddHolidaysToAll
  }
}
