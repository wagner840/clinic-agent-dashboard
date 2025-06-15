
import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { Appointment } from '@/types/appointment'
import { useToast } from "@/hooks/use-toast"

export function usePaymentForm() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [amount, setAmount] = useState('')
  const [isInsurance, setIsInsurance] = useState(false)
  const [loading, setLoading] = useState(false)

  const resetForm = () => {
    setAmount('')
    setIsInsurance(false)
  }

  const submitPayment = async (appointment: Appointment, onSuccess: () => void) => {
    if (!appointment || !user) return

    console.log('💰 Submitting payment for appointment:', {
      appointmentId: appointment.id,
      patientName: appointment.patient.name,
      amount: parseFloat(amount),
      isInsurance,
      userId: user.id
    })

    setLoading(true)

    const paymentData = {
      appointment_id: appointment.id,
      amount: parseFloat(amount),
      is_insurance: isInsurance,
      user_id: user.id,
    }

    const { error } = await supabase.from('payments').insert(paymentData)

    setLoading(false)

    if (error) {
      console.error('❌ Error saving payment:', error)
      toast({
        title: 'Erro ao salvar pagamento',
        description: error.message.includes('unique_payment_for_appointment') 
          ? 'Já existe um pagamento para este agendamento.'
          : error.message,
        variant: 'destructive',
      })
    } else {
      console.log('✅ Payment saved successfully for appointment:', appointment.id)
      toast({
        title: 'Pagamento registrado com sucesso!',
        description: `Consulta de ${appointment.patient.name} finalizada.`,
        duration: 5000,
      })
      onSuccess()
      resetForm()
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
