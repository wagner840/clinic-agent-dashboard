
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
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { Appointment } from '@/types/appointment'
import { useToast } from "@/hooks/use-toast"
import { DollarSign, Clock, User, CreditCard, Building } from 'lucide-react'

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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR')
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
        title: 'Pagamento registrado com sucesso!',
        description: `Consulta de ${appointment.patient.name} finalizada.`,
        duration: 5000,
      })
      onPaymentSuccess()
      resetForm()
    }
  }

  if (!appointment) return null

  const isValidAmount = amount && parseFloat(amount) > 0

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && resetForm()}>
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

        {/* Informações da consulta */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Paciente:</span>
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-semibold">{appointment.patient.name}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Data/Hora:</span>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm">
                {formatDate(appointment.start)} às {formatTime(appointment.start)}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium">
                Valor do Pagamento (R$) *
              </Label>
              <div className="relative">
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  className="pl-8"
                />
                <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2">
                {isInsurance ? (
                  <Building className="h-4 w-4 text-blue-600" />
                ) : (
                  <CreditCard className="h-4 w-4 text-blue-600" />
                )}
                <Label htmlFor="is-insurance" className="text-sm font-medium text-blue-800">
                  {isInsurance ? 'Pagamento via convênio' : 'Pagamento particular'}
                </Label>
              </div>
              <Switch
                id="is-insurance"
                checked={isInsurance}
                onCheckedChange={setIsInsurance}
              />
            </div>

            {isInsurance && (
              <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded border-l-2 border-blue-400">
                💡 Lembre-se de verificar a cobertura do convênio
              </div>
            )}
          </div>

          <DialogFooter className="space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={resetForm} 
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
