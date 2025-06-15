
import { DashboardStats } from '@/components/DashboardStats'
import { AppointmentsSection } from '@/components/AppointmentsSection'
import { PastAppointmentsTable } from '@/components/PastAppointmentsTable'
import { CompletedAppointmentsTable } from '@/components/CompletedAppointmentsTable'
import { Appointment } from '@/types/appointment'
import { CalendarListEntry } from '@/services/googleCalendar'

interface DashboardMainContentProps {
  isGoogleSignedIn: boolean
  loading: boolean
  appointments: Appointment[]
  doctorCalendars: CalendarListEntry[]
  todayAppointments: Appointment[]
  upcomingAppointments: Appointment[]
  pastAppointments: Appointment[]
  completedAppointments: Appointment[]
  cancelledAppointments: Appointment[]
  clinicTotalEarnings: number
  onGoogleSignIn: () => Promise<void>
  onMarkAsCompleted: (appointment: Appointment) => void
  onRescheduleAppointment: (appointment: Appointment, newDate: Date) => Promise<void>
  onCancelAppointment: (appointment: Appointment) => Promise<void>
  onReactivateAppointment: (appointment: Appointment) => Promise<void>
  onAddAppointment: (appointmentData: any, calendarId: string) => Promise<string>
}

export function DashboardMainContent({
  isGoogleSignedIn,
  loading,
  appointments,
  doctorCalendars,
  todayAppointments,
  upcomingAppointments,
  pastAppointments,
  completedAppointments,
  cancelledAppointments,
  clinicTotalEarnings,
  onGoogleSignIn,
  onMarkAsCompleted,
  onRescheduleAppointment,
  onCancelAppointment,
  onReactivateAppointment,
  onAddAppointment
}: DashboardMainContentProps) {
  return (
    <div className="space-y-6 sm:space-y-8">
      <DashboardStats 
        totalAppointments={appointments.length}
        todayAppointments={todayAppointments.length}
        upcomingAppointments={upcomingAppointments.length}
        clinicTotalEarnings={clinicTotalEarnings}
      />

      <AppointmentsSection
        todayAppointments={todayAppointments}
        upcomingAppointments={upcomingAppointments}
        cancelledAppointments={cancelledAppointments}
        isGoogleSignedIn={isGoogleSignedIn}
        isGoogleInitialized={true}
        loading={loading && isGoogleSignedIn}
        doctorCalendars={doctorCalendars}
        onGoogleSignIn={onGoogleSignIn}
        onMarkAsCompleted={onMarkAsCompleted}
        onRescheduleAppointment={onRescheduleAppointment}
        onCancelAppointment={onCancelAppointment}
        onReactivateAppointment={onReactivateAppointment}
        onAddAppointment={onAddAppointment}
      />

      {isGoogleSignedIn && !loading && (
        <div className="space-y-6">
          <PastAppointmentsTable
            appointments={pastAppointments}
            onMarkAsCompleted={onMarkAsCompleted}
          />
          
          <CompletedAppointmentsTable
            appointments={completedAppointments}
          />
        </div>
      )}
    </div>
  )
}
