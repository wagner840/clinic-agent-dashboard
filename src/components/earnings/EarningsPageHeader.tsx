
import { Button } from '@/components/ui/button'
import { RefreshCw, TrendingUp } from 'lucide-react'
import { HistoricalRecalculationButton } from './HistoricalRecalculationButton'

interface EarningsPageHeaderProps {
  loading: boolean
  onRefresh: () => void
}

export function EarningsPageHeader({ loading, onRefresh }: EarningsPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center space-x-2">
          <TrendingUp className="h-7 w-7 sm:h-8 sm:w-8" />
          <span>Relatório de Ganhos</span>
        </h1>
        <p className="text-muted-foreground mt-2">
          Acompanhe os ganhos por médico e totais da clínica
        </p>
      </div>
      <div className="flex items-center space-x-3 self-end sm:self-auto">
        <HistoricalRecalculationButton />
        <Button onClick={onRefresh} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>
    </div>
  )
}
