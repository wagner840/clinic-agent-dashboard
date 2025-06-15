
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import { HistoricalEarningsRecalculationService } from '@/services/earnings/historicalEarningsRecalculationService'

export function useHistoricalEarningsRecalculation() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isRecalculating, setIsRecalculating] = useState(false)

  const recalculateHistoricalEarnings = async () => {
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado',
        variant: 'destructive'
      })
      return
    }

    setIsRecalculating(true)
    
    try {
      const result = await HistoricalEarningsRecalculationService.recalculateHistoricalEarnings(user.id)

      toast({
        title: 'Recálculo concluído!',
        description: `Ganhos históricos recalculados com sucesso. Processados ${result.paymentsCount} pagamentos para ${result.doctorsCount} médicos.`,
        duration: 5000
      })

    } catch (error: any) {
      console.error('❌ Error recalculating historical earnings:', error)
      
      let errorMessage = 'Ocorreu um erro ao recalcular os ganhos históricos. Tente novamente.'
      
      if (error.message === 'No payments with matching appointments found') {
        errorMessage = 'Não há dados históricos para recalcular.'
      }
      
      toast({
        title: error.message === 'No payments with matching appointments found' ? 'Nenhum dado encontrado' : 'Erro no recálculo',
        description: errorMessage,
        variant: error.message === 'No payments with matching appointments found' ? 'default' : 'destructive'
      })
    } finally {
      setIsRecalculating(false)
    }
  }

  return {
    recalculateHistoricalEarnings,
    isRecalculating
  }
}
