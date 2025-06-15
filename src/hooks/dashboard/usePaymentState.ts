
import { useState, useCallback } from 'react'
import { Appointment } from '@/types/appointment'
import { useToast } from '@/hooks/use-toast'

export function usePaymentState(fetchAppointments: () => Promise<void>) {
  const [paymentAppointment, setPaymentAppointment] = useState<Appointment | null>(null)
  const { toast } = useToast()

  const handlePaymentSuccess = useCallback(() => {
    fetchAppointments()
    setPaymentAppointment(null)
    toast({
      title: "Pagamento registrado",
      description: "Pagamento registrado com sucesso!",
    })
  }, [fetchAppointments, toast])

  return {
    paymentAppointment,
    setPaymentAppointment,
    handlePaymentSuccess
  }
}
