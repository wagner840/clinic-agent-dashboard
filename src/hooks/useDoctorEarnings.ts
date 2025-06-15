
import { useState, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import { Appointment } from '@/types/appointment'
import { DoctorDailyEarnings, DoctorTotalEarnings } from '@/types/earnings'
import { calculateAndSaveEarnings as calculateEarnings } from '@/services/earnings/earningsCalculationService'
import { fetchDailyEarnings as fetchDaily, fetchTotalEarnings as fetchTotal } from '@/services/earnings/earningsDataService'
import { calculateClinicTotals } from '@/utils/clinicTotalsCalculator'

export function useDoctorEarnings() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [dailyEarnings, setDailyEarnings] = useState<DoctorDailyEarnings[]>([])
  const [totalEarnings, setTotalEarnings] = useState<DoctorTotalEarnings[]>([])

  const calculateAndSaveEarnings = useCallback(async (appointment: Appointment, paymentAmount: number, isInsurance: boolean) => {
    if (!user) return

    try {
      await calculateEarnings(appointment, paymentAmount, isInsurance, user.id)
    } catch (error) {
      console.error('Error calculating earnings:', error)
      toast({
        title: 'Erro ao calcular ganhos',
        description: 'Ocorreu um erro ao calcular os ganhos do médico.',
        variant: 'destructive'
      })
    }
  }, [user, toast])

  const fetchDailyEarnings = useCallback(async (startDate?: string, endDate?: string) => {
    if (!user) return

    setLoading(true)
    try {
      const data = await fetchDaily(user.id, startDate, endDate)
      setDailyEarnings(data)
    } catch (error) {
      console.error('Error fetching daily earnings:', error)
      toast({
        title: 'Erro ao carregar ganhos diários',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [user, toast])

  const fetchTotalEarnings = useCallback(async () => {
    if (!user) {
      console.log('⚠️ No user found, skipping earnings fetch')
      return
    }

    setLoading(true)
    try {
      const data = await fetchTotal(user.id)
      setTotalEarnings(data)
    } catch (error) {
      console.error('❌ Error fetching total earnings:', error)
      toast({
        title: 'Erro ao carregar ganhos totais',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [user, toast])

  const getClinicTotals = useCallback(() => {
    return calculateClinicTotals(totalEarnings)
  }, [totalEarnings])

  return {
    dailyEarnings,
    totalEarnings,
    loading,
    calculateAndSaveEarnings,
    fetchDailyEarnings,
    fetchTotalEarnings,
    getClinicTotals
  }
}
