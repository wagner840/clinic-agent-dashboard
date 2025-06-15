
import { useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'

interface ErrorHandlerOperations {
  authError: string | null
  appointmentsError: string | null
  clearAuthError: () => void
  clearAppointmentsError: () => void
  fetchAppointments: () => Promise<void>
}

export function useErrorHandlers(operations: ErrorHandlerOperations) {
  const { toast } = useToast()

  const clearError = useCallback(() => {
    if (operations.authError) operations.clearAuthError()
    if (operations.appointmentsError) operations.clearAppointmentsError()
  }, [operations.authError, operations.appointmentsError, operations.clearAuthError, operations.clearAppointmentsError])

  const handleRetry = useCallback(async () => {
    try {
      clearError()
      if (operations.appointmentsError) {
        await operations.fetchAppointments()
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
  }, [clearError, operations.appointmentsError, operations.fetchAppointments, toast])

  return {
    clearError,
    handleRetry
  }
}
