
import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'

interface PaymentWithAppointment {
  id: string
  amount: number
  is_insurance: boolean
  appointment_id: string
  created_at: string
  appointments: {
    doctor_name: string
    doctor_email: string
    start_time: string
  }
}

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
      console.log('🔄 Starting historical earnings recalculation...')
      
      // 1. Limpar dados existentes de ganhos
      const { error: clearDailyError } = await supabase
        .from('doctor_daily_earnings')
        .delete()
        .eq('user_id', user.id)

      if (clearDailyError) {
        console.error('Error clearing daily earnings:', clearDailyError)
        throw clearDailyError
      }

      const { error: clearTotalError } = await supabase
        .from('doctor_total_earnings')
        .delete()
        .eq('user_id', user.id)

      if (clearTotalError) {
        console.error('Error clearing total earnings:', clearTotalError)
        throw clearTotalError
      }

      // 2. Buscar todos os pagamentos
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)

      if (paymentsError) {
        console.error('Error fetching payments:', paymentsError)
        throw paymentsError
      }

      if (!payments || payments.length === 0) {
        toast({
          title: 'Nenhum pagamento encontrado',
          description: 'Não há dados históricos para recalcular.',
        })
        return
      }

      // 3. Buscar todos os agendamentos
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('id, doctor_name, doctor_email, start_time')
        .eq('user_id', user.id)

      if (appointmentsError) {
        console.error('Error fetching appointments:', appointmentsError)
        throw appointmentsError
      }

      if (!appointments || appointments.length === 0) {
        toast({
          title: 'Nenhum agendamento encontrado',
          description: 'Não há agendamentos para associar aos pagamentos.',
        })
        return
      }

      // 4. Criar um mapa de agendamentos para busca rápida
      const appointmentsMap = new Map(
        appointments.map(apt => [apt.id, apt])
      )

      // 5. Filtrar pagamentos que têm agendamentos correspondentes
      const paymentsWithAppointments: PaymentWithAppointment[] = payments
        .map(payment => {
          const appointment = appointmentsMap.get(payment.appointment_id)
          if (!appointment) {
            console.warn('Payment without matching appointment:', payment.id)
            return null
          }
          return {
            ...payment,
            appointments: {
              doctor_name: appointment.doctor_name,
              doctor_email: appointment.doctor_email,
              start_time: appointment.start_time
            }
          }
        })
        .filter((payment): payment is PaymentWithAppointment => payment !== null)

      console.log(`📊 Found ${paymentsWithAppointments.length} payments with appointments to process`)

      // 6. Agrupar pagamentos por médico e data
      const dailyEarningsMap = new Map<string, any>()
      const totalEarningsMap = new Map<string, any>()

      paymentsWithAppointments.forEach((payment: PaymentWithAppointment) => {
        const appointment = payment.appointments
        const paymentDate = new Date(appointment.start_time).toISOString().split('T')[0]
        const doctorName = appointment.doctor_name
        const doctorEmail = appointment.doctor_email
        const amount = Number(payment.amount)
        const isInsurance = payment.is_insurance

        // Ganhos diários
        const dailyKey = `${doctorName}-${paymentDate}`
        if (!dailyEarningsMap.has(dailyKey)) {
          dailyEarningsMap.set(dailyKey, {
            user_id: user.id,
            doctor_name: doctorName,
            doctor_email: doctorEmail,
            date: paymentDate,
            total_amount: 0,
            total_appointments: 0,
            insurance_amount: 0,
            insurance_appointments: 0,
            private_amount: 0,
            private_appointments: 0
          })
        }

        const dailyData = dailyEarningsMap.get(dailyKey)
        dailyData.total_amount += amount
        dailyData.total_appointments += 1
        if (isInsurance) {
          dailyData.insurance_amount += amount
          dailyData.insurance_appointments += 1
        } else {
          dailyData.private_amount += amount
          dailyData.private_appointments += 1
        }

        // Ganhos totais
        if (!totalEarningsMap.has(doctorName)) {
          totalEarningsMap.set(doctorName, {
            user_id: user.id,
            doctor_name: doctorName,
            doctor_email: doctorEmail,
            total_amount: 0,
            total_appointments: 0,
            insurance_amount: 0,
            insurance_appointments: 0,
            private_amount: 0,
            private_appointments: 0,
            first_appointment_date: paymentDate,
            last_appointment_date: paymentDate
          })
        }

        const totalData = totalEarningsMap.get(doctorName)
        totalData.total_amount += amount
        totalData.total_appointments += 1
        if (isInsurance) {
          totalData.insurance_amount += amount
          totalData.insurance_appointments += 1
        } else {
          totalData.private_amount += amount
          totalData.private_appointments += 1
        }

        // Atualizar datas
        if (paymentDate < totalData.first_appointment_date) {
          totalData.first_appointment_date = paymentDate
        }
        if (paymentDate > totalData.last_appointment_date) {
          totalData.last_appointment_date = paymentDate
        }
      })

      // 7. Inserir ganhos diários recalculados
      const dailyEarningsArray = Array.from(dailyEarningsMap.values())
      if (dailyEarningsArray.length > 0) {
        const { error: dailyInsertError } = await supabase
          .from('doctor_daily_earnings')
          .insert(dailyEarningsArray)

        if (dailyInsertError) {
          console.error('Error inserting daily earnings:', dailyInsertError)
          throw dailyInsertError
        }
      }

      // 8. Inserir ganhos totais recalculados
      const totalEarningsArray = Array.from(totalEarningsMap.values())
      if (totalEarningsArray.length > 0) {
        const { error: totalInsertError } = await supabase
          .from('doctor_total_earnings')
          .insert(totalEarningsArray)

        if (totalInsertError) {
          console.error('Error inserting total earnings:', totalInsertError)
          throw totalInsertError
        }
      }

      console.log('✅ Historical earnings recalculation completed successfully')
      console.log(`📈 Processed ${dailyEarningsArray.length} daily earnings records`)
      console.log(`👨‍⚕️ Processed ${totalEarningsArray.length} doctors`)

      toast({
        title: 'Recálculo concluído!',
        description: `Ganhos históricos recalculados com sucesso. Processados ${paymentsWithAppointments.length} pagamentos para ${totalEarningsArray.length} médicos.`,
        duration: 5000
      })

    } catch (error: any) {
      console.error('❌ Error recalculating historical earnings:', error)
      toast({
        title: 'Erro no recálculo',
        description: 'Ocorreu um erro ao recalcular os ganhos históricos. Tente novamente.',
        variant: 'destructive'
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
