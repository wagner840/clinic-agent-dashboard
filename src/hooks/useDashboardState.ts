
import { useState, useCallback } from 'react'
import { useGoogleAuth } from '@/hooks/useGoogleAuth'
import { useAppointments } from '@/hooks/useAppointments'
import { Appointment } from '@/types/appointment'
import { useToast } from '@/hooks/use-toast'

export function useDashboardState() {
  const [paymentAppointment, setPaymentAppointment] = useState<Appointment | null>(null)
  const { toast } = useToast()

  // Always call hooks in the same order - no conditional calls
  const googleAuthResult = useGoogleAuth()
  const {
    loading: authLoading,
    error: authError,
    isGoogleInitialized,
    isGoogleSignedIn,
    googleSignIn,
    googleSignOut,
    googleSwitchAccount,
    googleProfile,
    accessToken,
    clearError: clearAuthError
  } = googleAuthResult

  // Always call useAppointments - it handles its own conditional logic internally
  const appointmentsResult = useAppointments(accessToken, isGoogleSignedIn)
  const {
    appointments,
    loading: appointmentsLoading,
    error: appointmentsError,
    fetchAppointments,
    getTodayAppointments,
    getUpcomingAppointments,
    getPastAppointments,
    getCompletedAppointments,
    getCancelledAppointments,
    clearError: clearAppointmentsError,
    rescheduleAppointment,
    cancelAppointment,
    reactivateAppointment,
    addAppointment,
    markAsCompleted
  } = appointmentsResult

  // Compute derived state
  const loading = authLoading || (isGoogleSignedIn && appointmentsLoading)
  const error = authError || appointmentsError
  
  const clearError = useCallback(() => {
    if (authError) clearAuthError()
    if (appointmentsError) clearAppointmentsError()
  }, [authError, appointmentsError, clearAuthError, clearAppointmentsError])

  const todayAppointments = getTodayAppointments()
  const upcomingAppointments = getUpcomingAppointments()
  const pastAppointments = getPastAppointments()
  const completedAppointments = getCompletedAppointments()
  const cancelledAppointments = getCancelledAppointments()
  
  const currentGoogleUser = isGoogleSignedIn && googleProfile ? {
    email: googleProfile.getEmail(),
    name: googleProfile.getName(),
    imageUrl: googleProfile.getImageUrl()
  } : null

  const handleGoogleAuth = useCallback(async (): Promise<void> => {
    try {
      if (isGoogleSignedIn) {
        await googleSignOut()
        toast({
          title: "Desconectado",
          description: "Você foi desconectado do Google.",
        })
      } else {
        await googleSignIn()
        toast({
          title: "Conectado",
          description: "Conectado ao Google com sucesso!",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao conectar/desconectar do Google.",
        variant: "destructive"
      })
    }
  }, [isGoogleSignedIn, googleSignIn, googleSignOut, toast])

  const handleSwitchAccount = useCallback(async (): Promise<void> => {
    try {
      await googleSwitchAccount()
      toast({
        title: "Conta alterada",
        description: "Conta do Google alterada com sucesso!",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao trocar conta do Google.",
        variant: "destructive"
      })
    }
  }, [googleSwitchAccount, toast])

  const handleMarkAsCompleted = useCallback(async (appointment: Appointment) => {
    try {
      await markAsCompleted(appointment.id)
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
  }, [markAsCompleted, toast])

  const handleRetry = useCallback(async () => {
    try {
      clearError()
      if (appointmentsError) {
        await fetchAppointments()
        toast({
          title: "Sincronizado",
          description: "Agendamentos sincronizados com sucesso!",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao sincronizar agendamentos.",
        variant: "destructive"
      })
    }
  }, [clearError, appointmentsError, fetchAppointments, toast])

  const handlePaymentSuccess = useCallback(() => {
    fetchAppointments()
    setPaymentAppointment(null)
    toast({
      title: "Pagamento registrado",
      description: "Pagamento registrado com sucesso!",
    })
  }, [fetchAppointments, toast])

  const handleRescheduleAppointment = useCallback(async (appointment: Appointment, newDate: Date) => {
    try {
      const duration = appointment.end.getTime() - appointment.start.getTime()
      const newEnd = new Date(newDate.getTime() + duration)
      await rescheduleAppointment(appointment.id, newDate, newEnd)
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
  }, [rescheduleAppointment, toast])

  const handleCancelAppointment = useCallback(async (appointment: Appointment) => {
    try {
      await cancelAppointment(appointment.id)
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
  }, [cancelAppointment, toast])

  const handleReactivateAppointment = useCallback(async (appointment: Appointment) => {
    try {
      await reactivateAppointment(appointment.id)
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
  }, [reactivateAppointment, toast])

  const handleAddAppointment = useCallback(async (appointmentData: any) => {
    try {
      await addAppointment(appointmentData)
      toast({
        title: "Criado",
        description: "Agendamento criado com sucesso!",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar agendamento.",
        variant: "destructive"
      })
    }
  }, [addAppointment, toast])

  return {
    // State
    paymentAppointment,
    setPaymentAppointment,
    
    // Google Auth
    isGoogleInitialized,
    isGoogleSignedIn,
    currentGoogleUser,
    
    // Data
    appointments,
    todayAppointments,
    upcomingAppointments,
    pastAppointments,
    completedAppointments,
    cancelledAppointments,
    
    // Loading & Error states
    loading,
    error,
    
    // Handlers
    handleGoogleAuth,
    handleSwitchAccount,
    handleMarkAsCompleted,
    handleRetry,
    handlePaymentSuccess,
    clearError,
    fetchAppointments,
    googleSignIn,
    handleRescheduleAppointment,
    handleCancelAppointment,
    handleReactivateAppointment,
    handleAddAppointment
  }
}
