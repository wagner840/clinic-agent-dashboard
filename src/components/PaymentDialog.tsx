
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { Appointment } from '@/types/appointment'
import { useToast } from "@/hooks/use-toast"

interface PaymentDialogProps {
  appointment: Appointment | null
  isOpen: boolean
  onClose: () => void
  onPaymentSuccess: () => void
}

export function PaymentDialog({ appointment, isOpen, onClose, onPaymentSuccess }: PaymentDialogProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [amount, setAmount] = useState('')
  const [isInsurance, setIsInsurance] = useState(false)
  const [loading, setLoading] = useState(false)

  const resetForm = () => {
    setAmount('')
    setIsInsurance(false)
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!appointment || !user) return

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
      console.error('Error saving payment:', error)
      toast({
        title: 'Erro ao salvar pagamento',
        description: error.message.includes('unique_payment_for_appointment') 
          ? 'Já existe um pagamento para este agendamento.'
          : error.message,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Pagamento salvo com sucesso!',
        description: `O agendamento de ${appointment.patient.name} foi marcado como concluído.`,
      })
      onPaymentSuccess()
      resetForm()
    }
  }

  if (!appointment) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && resetForm()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Pagamento para Agendamento</DialogTitle>
          <DialogDescription>
            Confirme os detalhes do pagamento para marcar o agendamento de <span className="font-semibold">{appointment.patient.name}</span> como concluído.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Valor (R$)
              </Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="col-span-3"
                required
                step="0.01"
                placeholder="Ex: 150.00"
              />
            </div>
            <div className="flex items-center space-x-2 justify-end pt-2">
              <Label htmlFor="is-insurance">Pagamento por convênio?</Label>
              <Switch
                id="is-insurance"
                checked={isInsurance}
                onCheckedChange={setIsInsurance}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={resetForm} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!amount || loading}>
              {loading ? 'Salvando...' : 'Salvar Pagamento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
