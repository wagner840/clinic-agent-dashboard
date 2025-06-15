
import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { Appointment } from '@/types/appointment'
import { useToast } from "@/hooks/use-toast"
import { useDoctorEarnings } from '@/hooks/useDoctorEarnings'

export function usePaymentForm() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { calculateAndSaveEarnings } = useDoctorEarnings()
  const [amount, setAmount] = useState('')
  const [isInsurance, setIsInsurance] = useState(false)
  const [loading, setLoading] = useState(false)

  const resetForm = () => {
    setAmount('')
    setIsInsurance(false)
  }

  const submitPayment = async (appointment: Appointment, onSuccess: () => Promise<void>) => {
    if (!appointment || !user) return

    console.log('💰 Submitting payment for appointment:', {
      appointmentId: appointment.id,
      patientName: appointment.patient.name,
      amount: parseFloat(amount),
      isInsurance,
      userId: user.id
    })

    setLoading(true)

    try {
      // 1. Salvar o pagamento
      const paymentData = {
        appointment_id: appointment.id,
        amount: parseFloat(amount),
        is_insurance: isInsurance,
        user_id: user.id,
      }

      const { error: paymentError } = await supabase.from('payments').insert(paymentData)

      if (paymentError) {
        console.error('❌ Error saving payment:', paymentError)
        // Se o pagamento já existe, podemos prosseguir para marcar o agendamento como concluído.
        if (paymentError.message.includes('unique_payment_for_appointment')) {
          toast({
            title: 'Pagamento já existente',
            description: 'Este agendamento já possui um pagamento. Finalizando a consulta.',
          })
        } else {
          toast({
            title: 'Erro ao salvar pagamento',
            description: paymentError.message,
            variant: 'destructive',
          })
          return // Parar para outros erros
        }
      } else {
        console.log('✅ Payment saved successfully for appointment:', appointment.id)
        
        // 2. Calcular e salvar ganhos do médico
        await calculateAndSaveEarnings(appointment, parseFloat(amount), isInsurance)
      }

      // 3. Marcar o agendamento como concluído no Supabase
      const { error: appointmentError } = await supabase
        .from('appointments')
        .update({ status: 'completed' })
        .eq('id', appointment.id)
        .eq('user_id', user.id)

      if (appointmentError) {
        console.error('❌ Error updating appointment status:', appointmentError)
        toast({
          title: 'Erro ao finalizar agendamento',
          description: 'Pagamento salvo, mas erro ao marcar como concluído.',
          variant: 'destructive',
        })
        return
      }

      console.log('✅ Appointment marked as completed:', appointment.id)

      toast({
        title: 'Agendamento finalizado com sucesso!',
        description: `Consulta de ${appointment.patient.name} foi finalizada e o pagamento foi registrado.`,
        duration: 5000,
      })
      
      await onSuccess()
      resetForm()

    } catch (error: any) {
      console.error('❌ Unexpected error:', error)
      toast({
        title: 'Erro inesperado',
        description: 'Ocorreu um erro ao processar a finalização.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const isValidAmount = amount && parseFloat(amount) > 0

  return {
    amount,
    setAmount,
    isInsurance,
    setIsInsurance,
    loading,
    resetForm,
    submitPayment,
    isValidAmount
  }
}
