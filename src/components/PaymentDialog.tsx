
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Appointment } from '@/types/appointment'
import { DollarSign } from 'lucide-react'
import { PaymentFormFields } from '@/components/payment/PaymentFormFields'
import { AppointmentInfo } from '@/components/payment/AppointmentInfo'
import { usePaymentForm } from '@/hooks/usePaymentForm'

interface PaymentDialogProps {
  appointment: Appointment | null
  isOpen: boolean
  onClose: () => void
  onPaymentSuccess: () => void
}

export function PaymentDialog({ appointment, isOpen, onClose, onPaymentSuccess }: PaymentDialogProps) {
  const {
    amount,
    setAmount,
    isInsurance,
    setIsInsurance,
    loading,
    resetForm,
    submitPayment,
    isValidAmount
  } = usePaymentForm()

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!appointment) return

    await submitPayment(appointment, () => {
      onPaymentSuccess()
      handleClose()
    })
  }

  if (!appointment) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span>Finalizar Consulta</span>
          </DialogTitle>
          <DialogDescription className="text-left">
            Registre o pagamento para finalizar a consulta
          </DialogDescription>
        </DialogHeader>

        <AppointmentInfo appointment={appointment} />

        <form onSubmit={handleSubmit} className="space-y-6">
          <PaymentFormFields
            amount={amount}
            setAmount={setAmount}
            isInsurance={isInsurance}
            setIsInsurance={setIsInsurance}
          />

          <DialogFooter className="space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose} 
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={!isValidAmount || loading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Salvando...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4" />
                  <span>Finalizar Consulta</span>
                </div>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
