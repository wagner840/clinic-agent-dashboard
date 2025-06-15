
import { useEffect } from 'react'
import { useDoctorEarnings } from '@/hooks/useDoctorEarnings'
import { DoctorEarningsTable } from './DoctorEarningsTable'
import { ClinicTotalCard } from './ClinicTotalCard'
import { HistoricalRecalculationButton } from './HistoricalRecalculationButton'
import { Button } from '@/components/ui/button'
import { RefreshCw, TrendingUp } from 'lucide-react'

export function EarningsPage() {
  const {
    totalEarnings,
    loading,
    fetchTotalEarnings,
    getClinicTotals
  } = useDoctorEarnings()

  const clinicTotals = getClinicTotals()

  useEffect(() => {
    fetchTotalEarnings()
  }, [fetchTotalEarnings])

  const handleRefresh = () => {
    fetchTotalEarnings()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
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
          <Button onClick={handleRefresh} disabled={loading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Totais da Clínica */}
      <ClinicTotalCard totals={clinicTotals} />

      {/* Tabela de Ganhos por Médico */}
      <DoctorEarningsTable earnings={totalEarnings} loading={loading} />
    </div>
  )
}
