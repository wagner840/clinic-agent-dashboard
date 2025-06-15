
import { AlertCircle } from 'lucide-react'
import { DoctorTotalEarnings } from '@/types/earnings'

interface EarningsDebugInfoProps {
  totalEarnings: DoctorTotalEarnings[]
  loading: boolean
}

export function EarningsDebugInfo({ totalEarnings, loading }: EarningsDebugInfoProps) {
  if (totalEarnings.length > 0 || loading) {
    return null
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-center space-x-2">
        <AlertCircle className="h-5 w-5 text-yellow-600" />
        <div>
          <h3 className="font-medium text-yellow-800">Nenhum ganho encontrado</h3>
          <p className="text-sm text-yellow-700 mt-1">
            Se você tem agendamentos concluídos mas não vê ganhos aqui, use o botão "Recalcular Histórico" 
            para processar pagamentos de agendamentos anteriores à implementação do sistema de relatórios.
          </p>
        </div>
      </div>
    </div>
  )
}
