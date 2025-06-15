
import { DashboardHeader } from '@/components/DashboardHeader'
import { GoogleAuthAlerts } from '@/components/GoogleAuthAlerts'
import { PaymentDialog } from '@/components/PaymentDialog'
import { SettingsSheet } from './SettingsSheet'
import { DashboardMainContent } from '@/components/dashboard/DashboardMainContent'
import { DashboardEarningsView } from '@/components/dashboard/DashboardEarningsView'
import { DoctorFilter } from '@/components/dashboard/DoctorFilter'
import { EarningsButton } from '@/components/dashboard/EarningsButton'
import { Appointment } from '@/types/appointment'
import { CalendarListEntry } from '@/services/googleCalendar'
import { useState, useEffect } from 'react'
import { useDoctorEarnings } from '@/hooks/useDoctorEarnings'

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

export function DashboardContent(props: DashboardContentProps) {
  const [showEarnings, setShowEarnings] = useState(false)
  const { getClinicTotals, fetchTotalEarnings } = useDoctorEarnings()

  // Load earnings when component mounts and user is signed in
  useEffect(() => {
    if (props.isGoogleSignedIn) {
      fetchTotalEarnings()
    }
  }, [props.isGoogleSignedIn, fetchTotalEarnings])

  const clinicTotals = getClinicTotals()

  return (
    <>
      {showEarnings ? (
        <DashboardEarningsView
          isGoogleInitialized={props.isGoogleInitialized}
          isGoogleSignedIn={props.isGoogleSignedIn}
          loading={props.loading}
          currentGoogleUser={props.currentGoogleUser}
          onGoogleAuth={props.onGoogleAuth}
          onSwitchAccount={props.onSwitchAccount}
          onSyncAppointments={props.onSyncAppointments}
          onOpenSettings={() => props.onSettingsChange(true)}
          onBackToDashboard={() => setShowEarnings(false)}
          appointments={props.appointments}
        />
      ) : (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <DashboardHeader
            isGoogleInitialized={props.isGoogleInitialized}
            isGoogleSignedIn={props.isGoogleSignedIn}
            loading={props.loading}
            onGoogleAuth={props.onGoogleAuth}
            onSwitchAccount={props.onSwitchAccount}
            onSyncAppointments={props.onSyncAppointments}
            currentGoogleUser={props.currentGoogleUser}
            onOpenSettings={() => props.onSettingsChange(true)}
          />

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
            <GoogleAuthAlerts
              isGoogleInitialized={props.isGoogleInitialized}
              isGoogleSignedIn={props.isGoogleSignedIn}
              error={props.error}
              onGoogleSignIn={props.onGoogleSignIn}
              onRetry={props.onRetry}
              onClearError={props.onClearError}
              loading={props.loading}
              currentGoogleUser={props.currentGoogleUser}
            />

            {props.isGoogleSignedIn && props.doctorCalendars.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
                <DoctorFilter
                  doctorCalendars={props.doctorCalendars}
                  doctorFilter={props.doctorFilter}
                  onDoctorFilterChange={props.onDoctorFilterChange}
                />

                {props.isGoogleSignedIn && (
                  <EarningsButton onShowEarnings={() => setShowEarnings(true)} />
                )}
              </div>
            )}

            <DashboardMainContent
              isGoogleSignedIn={props.isGoogleSignedIn}
              loading={props.loading}
              appointments={props.appointments}
              doctorCalendars={props.doctorCalendars}
              todayAppointments={props.todayAppointments}
              upcomingAppointments={props.upcomingAppointments}
              pastAppointments={props.pastAppointments}
              completedAppointments={props.completedAppointments}
              cancelledAppointments={props.cancelledAppointments}
              clinicTotalEarnings={clinicTotals.totalAmount}
              totalCancelledAppointments={props.cancelledAppointments.length}
              onGoogleSignIn={props.onGoogleSignIn}
              onMarkAsCompleted={props.onMarkAsCompleted}
              onRescheduleAppointment={props.onRescheduleAppointment}
              onCancelAppointment={props.onCancelAppointment}
              onReactivateAppointment={props.onReactivateAppointment}
              onAddAppointment={props.onAddAppointment}
            />
          </main>
        </div>
      )}

      <PaymentDialog
        appointment={props.paymentAppointment}
        isOpen={!!props.paymentAppointment}
        onClose={props.onClosePaymentDialog}
        onPaymentSuccess={props.onPaymentSuccess}
      />

      <SettingsSheet
        isOpen={props.isSettingsOpen}
        onOpenChange={props.onSettingsChange}
        doctorCalendars={props.doctorCalendars}
        onCreateCalendar={props.onCreateCalendar}
        onDeleteCalendar={props.onDeleteCalendar}
        onAddHolidaysToAll={props.onAddHolidaysToAll}
        accessToken={props.accessToken}
      />
    </>
  )
}
