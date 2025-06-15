
import { useEffect, useState } from 'react'
import { useDoctorEarnings } from '@/hooks/useDoctorEarnings'
import { DoctorEarningsTable } from './DoctorEarningsTable'
import { ClinicTotalCard } from './ClinicTotalCard'
import { ClinicChartsModal } from './ClinicChartsModal'
import { HistoricalRecalculationButton } from './HistoricalRecalculationButton'
import { Button } from '@/components/ui/button'
import { RefreshCw, TrendingUp, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'

export function EarningsPage() {
  const { user } = useAuth()
  const [showChartsModal, setShowChartsModal] = useState(false)
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

  useEffect(() => {
    // Debug: verificar agendamentos concluídos e pagamentos
    const debugData = async () => {
      if (!user) return

      console.log('🔍 Debugging earnings data...')
      
      // Buscar agendamentos concluídos
      const { data: completedAppointments, error: apptError } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')

      if (apptError) {
        console.error('Error fetching completed appointments:', apptError)
      } else {
        console.log('📅 Completed appointments:', completedAppointments?.length || 0, completedAppointments)
      }

      // Buscar pagamentos
      const { data: payments, error: paymentError } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)

      if (paymentError) {
        console.error('Error fetching payments:', paymentError)
      } else {
        console.log('💰 Payments:', payments?.length || 0, payments)
      }

      // Buscar ganhos salvos
      const { data: earnings, error: earningsError } = await supabase
        .from('doctor_total_earnings')
        .select('*')
        .eq('user_id', user.id)

      if (earningsError) {
        console.error('Error fetching earnings:', earningsError)
      } else {
        console.log('📊 Saved earnings:', earnings?.length || 0, earnings)
      }
    }

    debugData()
  }, [user])

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

      {/* Debug Info */}
      {totalEarnings.length === 0 && !loading && (
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
      )}

      {/* Totais da Clínica */}
      <ClinicTotalCard 
        totals={clinicTotals} 
        onShowCharts={() => setShowChartsModal(true)}
      />

      {/* Tabela de Ganhos por Médico */}
      <DoctorEarningsTable earnings={totalEarnings} loading={loading} />

      {/* Modal de Gráficos */}
      <ClinicChartsModal
        isOpen={showChartsModal}
        onClose={() => setShowChartsModal(false)}
        totalEarnings={totalEarnings}
      />
    </div>
  )
}
