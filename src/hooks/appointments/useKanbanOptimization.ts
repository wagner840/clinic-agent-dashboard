
import { useMemo, useCallback, useState } from 'react'
import { Appointment } from '@/types/appointment'

interface UseKanbanOptimizationProps {
  todayAppointments: Appointment[]
  upcomingAppointments: Appointment[]
  cancelledAppointments: Appointment[]
}

export function useKanbanOptimization({
  todayAppointments,
  upcomingAppointments,
  cancelledAppointments
}: UseKanbanOptimizationProps) {
  // Estado local para otimizar re-renders apenas das colunas que mudaram
  const [optimizedState, setOptimizedState] = useState({
    today: todayAppointments,
    upcoming: upcomingAppointments,
    cancelled: cancelledAppointments,
    lastUpdate: Date.now()
  })

  // Memoizar as listas para evitar re-renders desnecessários
  const memoizedTodayAppointments = useMemo(() => {
    console.log('🔄 Memoizing today appointments:', todayAppointments.length)
    return todayAppointments
  }, [todayAppointments])

  const memoizedUpcomingAppointments = useMemo(() => {
    console.log('🔄 Memoizing upcoming appointments:', upcomingAppointments.length)
    return upcomingAppointments
  }, [upcomingAppointments])

  const memoizedCancelledAppointments = useMemo(() => {
    console.log('🔄 Memoizing cancelled appointments:', cancelledAppointments.length)
    return cancelledAppointments
  }, [cancelledAppointments])

  // Detectar mudanças específicas nas colunas
  const hasChanges = useMemo(() => {
    const todayChanged = JSON.stringify(memoizedTodayAppointments) !== JSON.stringify(optimizedState.today)
    const upcomingChanged = JSON.stringify(memoizedUpcomingAppointments) !== JSON.stringify(optimizedState.upcoming)
    const cancelledChanged = JSON.stringify(memoizedCancelledAppointments) !== JSON.stringify(optimizedState.cancelled)

    return {
      today: todayChanged,
      upcoming: upcomingChanged,
      cancelled: cancelledChanged,
      any: todayChanged || upcomingChanged || cancelledChanged
    }
  }, [memoizedTodayAppointments, memoizedUpcomingAppointments, memoizedCancelledAppointments, optimizedState])

  // Atualizar estado otimizado apenas quando necessário
  const updateOptimizedState = useCallback(() => {
    if (hasChanges.any) {
      console.log('📊 Updating kanban state - changes detected:', hasChanges)
      setOptimizedState({
        today: memoizedTodayAppointments,
        upcoming: memoizedUpcomingAppointments,
        cancelled: memoizedCancelledAppointments,
        lastUpdate: Date.now()
      })
    }
  }, [hasChanges, memoizedTodayAppointments, memoizedUpcomingAppointments, memoizedCancelledAppointments])

  // Executar atualização quando há mudanças
  if (hasChanges.any) {
    updateOptimizedState()
  }

  return {
    optimizedTodayAppointments: memoizedTodayAppointments,
    optimizedUpcomingAppointments: memoizedUpcomingAppointments,
    optimizedCancelledAppointments: memoizedCancelledAppointments,
    hasChanges,
    lastUpdate: optimizedState.lastUpdate
  }
}
