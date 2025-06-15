
import { Button } from '@/components/ui/button'
import { RefreshCw, TrendingUp } from 'lucide-react'
import { HistoricalRecalculationButton } from './HistoricalRecalculationButton'

interface EarningsPageHeaderProps {
  loading: boolean
  onRefresh: () => void
}

export function EarningsPageHeader({ loading, onRefresh }: EarningsPageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center space-x-2">
          <TrendingUp className="h-8 w-8" />
          <span>Relatório de Ganhos</span>
        </h1>
        <p className="text-muted-foreground mt-2">
          Acompanhe os ganhos por médico e totais da clínica
        </p>
      </div>
      <div className="flex items-center space-x-3">
        <HistoricalRecalculationButton />
        <Button onClick={onRefresh} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>
    </div>
  )
}
