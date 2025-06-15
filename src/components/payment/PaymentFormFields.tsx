
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { DollarSign, Building, CreditCard } from 'lucide-react'

interface PaymentFormFieldsProps {
  amount: string
  setAmount: (amount: string) => void
  isInsurance: boolean
  setIsInsurance: (isInsurance: boolean) => void
}

export function PaymentFormFields({ 
  amount, 
  setAmount, 
  isInsurance, 
  setIsInsurance 
}: PaymentFormFieldsProps) {
  return (
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
  )
}
