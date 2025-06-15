
import { useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export function useCancelledAppointmentCleanup(
  userId: string | undefined,
  fetchAppointments: () => Promise<void>
) {
  const { toast } = useToast()

  const cleanupOldCancelledAppointments = useCallback(async () => {
    if (!userId) return

    try {
      // Remove agendamentos cancelados há mais de 30 dias
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: oldCancelledAppointments, error: fetchError } = await supabase
        .from('appointments')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'cancelled')
        .lt('updated_at', thirtyDaysAgo.toISOString())

      if (fetchError) {
        console.error('Error fetching old cancelled appointments:', fetchError)
        return
      }

      if (oldCancelledAppointments && oldCancelledAppointments.length > 0) {
        const { error: deleteError } = await supabase
          .from('appointments')
          .delete()
          .eq('user_id', userId)
          .eq('status', 'cancelled')
          .lt('updated_at', thirtyDaysAgo.toISOString())

        if (deleteError) {
          console.error('Error deleting old cancelled appointments:', deleteError)
          return
        }

        console.log(`✅ Cleaned up ${oldCancelledAppointments.length} old cancelled appointments`)
        
        if (oldCancelledAppointments.length > 0) {
          toast({
            title: 'Limpeza automática',
            description: `${oldCancelledAppointments.length} agendamentos cancelados antigos foram removidos.`,
          })
        }

        await fetchAppointments()
      }
    } catch (error) {
      console.error('Error during automatic cleanup:', error)
    }
  }, [userId, fetchAppointments, toast])

  const manualCleanupCancelledAppointments = useCallback(async () => {
    if (!userId) return

    try {
      const { data: cancelledAppointments, error: fetchError } = await supabase
        .from('appointments')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'cancelled')

      if (fetchError) {
        console.error('Error fetching cancelled appointments:', fetchError)
        toast({
          title: 'Erro',
          description: 'Erro ao buscar agendamentos cancelados.',
          variant: 'destructive'
        })
        return
      }

      if (cancelledAppointments && cancelledAppointments.length > 0) {
        const { error: deleteError } = await supabase
          .from('appointments')
          .delete()
          .eq('user_id', userId)
          .eq('status', 'cancelled')

        if (deleteError) {
          console.error('Error deleting cancelled appointments:', deleteError)
          toast({
            title: 'Erro',
            description: 'Erro ao limpar agendamentos cancelados.',
            variant: 'destructive'
          })
          return
        }

        console.log(`✅ Manually cleaned up ${cancelledAppointments.length} cancelled appointments`)
        
        toast({
          title: 'Limpeza concluída',
          description: `${cancelledAppointments.length} agendamentos cancelados foram removidos.`,
        })

        await fetchAppointments()
      } else {
        toast({
          title: 'Nenhum agendamento',
          description: 'Não há agendamentos cancelados para remover.',
        })
      }
    } catch (error) {
      console.error('Error during manual cleanup:', error)
      toast({
        title: 'Erro',
        description: 'Erro durante a limpeza manual.',
        variant: 'destructive'
      })
    }
  }, [userId, fetchAppointments, toast])

  return {
    cleanupOldCancelledAppointments,
    manualCleanupCancelledAppointments
  }
}
