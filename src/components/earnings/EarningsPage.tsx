
import { useEffect } from 'react'
import { useDoctorEarnings } from '@/hooks/useDoctorEarnings'
import { DoctorEarningsTable } from './DoctorEarningsTable'
import { ClinicTotalCard } from './ClinicTotalCard'
import { ClinicChartsModal } from './ClinicChartsModal'
import { EarningsPageHeader } from './EarningsPageHeader'
import { EarningsDebugInfo } from './EarningsDebugInfo'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { Appointment } from '@/types/appointment'

interface EarningsPageProps {
  appointments?: Appointment[]
}

export function EarningsPage({ appointments = [] }: EarningsPageProps) {
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
      <EarningsPageHeader loading={loading} onRefresh={handleRefresh} />

      <EarningsDebugInfo totalEarnings={totalEarnings} loading={loading} />

      <ClinicTotalCard 
        totals={clinicTotals} 
        onShowCharts={() => setShowChartsModal(true)}
      />

      <DoctorEarningsTable earnings={totalEarnings} loading={loading} />

      <ClinicChartsModal
        isOpen={showChartsModal}
        onClose={() => setShowChartsModal(false)}
        totalEarnings={totalEarnings}
        appointments={appointments}
      />
    </div>
  )
}
