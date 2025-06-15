import { useState } from 'react'
import { Appointment } from '@/types/appointment'
import { useToast } from "@/hooks/use-toast"
import { useAppointmentsDragDrop } from '@/hooks/appointments/useAppointmentsDragDrop'
import { AppointmentsSectionEmpty } from '@/components/appointments/AppointmentsSectionEmpty'
import { AppointmentsSectionLoading } from '@/components/appointments/AppointmentsSectionLoading'
import { AppointmentsSectionHeader } from '@/components/appointments/AppointmentsSectionHeader'
import { AppointmentsKanbanGrid } from '@/components/appointments/AppointmentsKanbanGrid'
import { AppointmentsSectionInstructions } from '@/components/appointments/AppointmentsSectionInstructions'
import { RescheduleModal } from '@/components/modals/RescheduleModal'
import { AddAppointmentModal } from '@/components/modals/AddAppointmentModal'
import { CalendarListEntry } from '@/services/googleCalendar'

interface AppointmentsSectionProps {
  todayAppointments: Appointment[]
  upcomingAppointments: Appointment[]
  cancelledAppointments: Appointment[]
  isGoogleSignedIn: boolean
  isGoogleInitialized: boolean
  loading: boolean
  doctorCalendars: CalendarListEntry[]
  onGoogleSignIn: () => Promise<void>
  onMarkAsCompleted: (appointment: Appointment) => void
  onRescheduleAppointment: (appointment: Appointment, newDate: Date) => Promise<void>
  onCancelAppointment: (appointment: Appointment) => Promise<void>
  onReactivateAppointment: (appointment: Appointment) => Promise<void>
  onAddAppointment: (appointmentData: any, calendarId: string) => Promise<string>
}

export function AppointmentsSection({
  todayAppointments,
  upcomingAppointments,
  cancelledAppointments,
  isGoogleSignedIn,
  isGoogleInitialized,
  loading,
  doctorCalendars,
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

  const { handleDragEnd } = useAppointmentsDragDrop({
    todayAppointments,
    upcomingAppointments,
    cancelledAppointments,
    onCancelAppointment,
    onReactivateAppointment,
    onRescheduleAppointment: (appointment: Appointment) => {
      setSelectedAppointment(appointment)
      setRescheduleModalOpen(true)
    }
  })

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
      <AppointmentsSectionEmpty
        isGoogleInitialized={isGoogleInitialized}
        onGoogleSignIn={onGoogleSignIn}
      />
    )
  }

  if (loading) {
    return <AppointmentsSectionLoading />
  }

  return (
    <div className="mt-8">
      <AppointmentsSectionHeader onAddAppointment={() => setAddModalOpen(true)} />
      
      <AppointmentsKanbanGrid
        todayAppointments={todayAppointments}
        upcomingAppointments={upcomingAppointments}
        cancelledAppointments={cancelledAppointments}
        onDragEnd={handleDragEnd}
        onMarkAsCompleted={onMarkAsCompleted}
        onCancelAppointment={onCancelAppointment}
        onReactivateAppointment={onReactivateAppointment}
      />
      
      <AppointmentsSectionInstructions />

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
        doctorCalendars={doctorCalendars}
      />
    </div>
  )
}
