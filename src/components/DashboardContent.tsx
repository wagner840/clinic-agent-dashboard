
import { DashboardStats } from '@/components/DashboardStats'
import { DashboardHeader } from '@/components/DashboardHeader'
import { GoogleAuthAlerts } from '@/components/GoogleAuthAlerts'
import { AppointmentsSection } from '@/components/AppointmentsSection'
import { PastAppointmentsTable } from '@/components/PastAppointmentsTable'
import { CompletedAppointmentsTable } from '@/components/CompletedAppointmentsTable'
import { PaymentDialog } from '@/components/PaymentDialog'
import { Appointment } from '@/types/appointment'
import { CalendarListEntry } from '@/services/googleCalendar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { SettingsSheet } from './SettingsSheet'
import { useMemo } from 'react'

interface DashboardContentProps {
  isGoogleInitialized: boolean
  isGoogleSignedIn: boolean
  loading: boolean
  error: string | null
  currentGoogleUser: {
    email: string
    name: string
    imageUrl: string
  } | null
  appointments: Appointment[]
  doctorCalendars: CalendarListEntry[]
  doctorFilter: string
  onDoctorFilterChange: (value: string) => void
  todayAppointments: Appointment[]
  upcomingAppointments: Appointment[]
  pastAppointments: Appointment[]
  completedAppointments: Appointment[]
  cancelledAppointments: Appointment[]
  paymentAppointment: Appointment | null
  onGoogleAuth: () => Promise<void>
  onSwitchAccount: () => Promise<void>
  onSyncAppointments: () => Promise<void>
  onGoogleSignIn: () => Promise<void>
  onMarkAsCompleted: (appointment: Appointment) => void
  onRetry: () => Promise<void>
  onClearError: () => void
  onPaymentSuccess: () => Promise<void>
  onClosePaymentDialog: () => void
  onRescheduleAppointment: (appointment: Appointment, newDate: Date) => Promise<void>
  onCancelAppointment: (appointment: Appointment) => Promise<void>
  onReactivateAppointment: (appointment: Appointment) => Promise<void>
  onAddAppointment: (appointmentData: any, calendarId: string) => Promise<string>
  onCreateCalendar: (calendarName: string) => Promise<void>
  onDeleteCalendar: (calendarId: string) => Promise<void>
  onAddHolidaysToAll: () => Promise<void>
  accessToken: string | null
  isSettingsOpen: boolean
  onSettingsChange: (isOpen: boolean) => void
}

export function DashboardContent({
  isGoogleInitialized,
  isGoogleSignedIn,
  loading,
  error,
  currentGoogleUser,
  appointments,
  doctorCalendars,
  doctorFilter,
  onDoctorFilterChange,
  todayAppointments,
  upcomingAppointments,
  pastAppointments,
  completedAppointments,
  cancelledAppointments,
  paymentAppointment,
  onGoogleAuth,
  onSwitchAccount,
  onSyncAppointments,
  onGoogleSignIn,
  onMarkAsCompleted,
  onRetry,
  onClearError,
  onPaymentSuccess,
  onClosePaymentDialog,
  onRescheduleAppointment,
  onCancelAppointment,
  onReactivateAppointment,
  onAddAppointment,
  onCreateCalendar,
  onDeleteCalendar,
  onAddHolidaysToAll,
  accessToken,
  isSettingsOpen,
  onSettingsChange
}: DashboardContentProps) {
  // Filtrar calendários para remover "Holidays in Brazil" do seletor de médicos
  const doctorCalendarsForFilter = useMemo(() => {
    return doctorCalendars.filter(cal => 
      !cal.summary?.toLowerCase().includes('holiday') && 
      !cal.summary?.toLowerCase().includes('feriado')
    )
  }, [doctorCalendars])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader
        isGoogleInitialized={isGoogleInitialized}
        isGoogleSignedIn={isGoogleSignedIn}
        loading={loading}
        onGoogleAuth={onGoogleAuth}
        onSwitchAccount={onSwitchAccount}
        onSyncAppointments={onSyncAppointments}
        currentGoogleUser={currentGoogleUser}
        onOpenSettings={() => onSettingsChange(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <GoogleAuthAlerts
          isGoogleInitialized={isGoogleInitialized}
          isGoogleSignedIn={isGoogleSignedIn}
          error={error}
          onGoogleSignIn={onGoogleSignIn}
          onRetry={onRetry}
          onClearError={onClearError}
          loading={loading}
          currentGoogleUser={currentGoogleUser}
        />

        <div className="space-y-6 sm:space-y-8">
          {isGoogleSignedIn && doctorCalendarsForFilter.length > 0 && (
            <div className="flex justify-start">
              <div className="space-y-2">
                <Label htmlFor="doctor-filter">Filtrar por Médico</Label>
                <Select value={doctorFilter} onValueChange={onDoctorFilterChange}>
                  <SelectTrigger id="doctor-filter" className="w-full sm:w-[280px] bg-white dark:bg-slate-800 dark:border-slate-600">
                    <SelectValue placeholder="Selecionar médico..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Médicos</SelectItem>
                    {doctorCalendarsForFilter.map((cal) => (
                      <SelectItem key={cal.id} value={cal.id}>
                        {cal.summary}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DashboardStats 
            totalAppointments={appointments.length}
            todayAppointments={todayAppointments.length}
            upcomingAppointments={upcomingAppointments.length}
          />

          <AppointmentsSection
            todayAppointments={todayAppointments}
            upcomingAppointments={upcomingAppointments}
            cancelledAppointments={cancelledAppointments}
            isGoogleSignedIn={isGoogleSignedIn}
            isGoogleInitialized={isGoogleInitialized}
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
      </main>

      <PaymentDialog
        appointment={paymentAppointment}
        isOpen={!!paymentAppointment}
        onClose={onClosePaymentDialog}
        onPaymentSuccess={onPaymentSuccess}
      />

      <SettingsSheet
        isOpen={isSettingsOpen}
        onOpenChange={onSettingsChange}
        doctorCalendars={doctorCalendars}
        onCreateCalendar={onCreateCalendar}
        onDeleteCalendar={onDeleteCalendar}
        onAddHolidaysToAll={onAddHolidaysToAll}
        accessToken={accessToken}
      />
    </div>
  )
}
