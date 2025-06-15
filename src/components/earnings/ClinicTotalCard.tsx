
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Building2, DollarSign, Users, CreditCard, Shield, BarChart3 } from 'lucide-react'
import { ClinicTotals } from '@/types/earnings'

interface ClinicTotalCardProps {
  totals: ClinicTotals
  onShowCharts?: () => void
}

export function ClinicTotalCard({ totals, onShowCharts }: ClinicTotalCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const privatePercentage = totals.totalAmount > 0 
    ? (totals.privateAmount / totals.totalAmount * 100).toFixed(1)
    : '0'

  const insurancePercentage = totals.totalAmount > 0
    ? (totals.insuranceAmount / totals.totalAmount * 100).toFixed(1)
    : '0'

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
            <Building2 className="h-6 w-6" />
            <span>Total da Clínica</span>
          </CardTitle>
          {onShowCharts && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onShowCharts}
              className="flex items-center space-x-2 bg-white/50 hover:bg-white/80 dark:bg-gray-800/50 dark:hover:bg-gray-800/80"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Gráficos</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Valor Total */}
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {formatCurrency(totals.totalAmount)}
          </div>
          <div className="flex items-center justify-center space-x-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{totals.totalAppointments} consultas realizadas</span>
          </div>
        </div>

        {/* Breakdown por tipo */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <CreditCard className="h-5 w-5 text-green-600" />
              <span className="font-medium">Particular</span>
            </div>
            <div className="text-xl font-bold text-green-600">
              {formatCurrency(totals.privateAmount)}
            </div>
            <div className="text-sm text-muted-foreground">
              {totals.privateAppointments} consultas ({privatePercentage}%)
            </div>
          </div>

          <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Convênio</span>
            </div>
            <div className="text-xl font-bold text-blue-600">
              {formatCurrency(totals.insuranceAmount)}
            </div>
            <div className="text-sm text-muted-foreground">
              {totals.insuranceAppointments} consultas ({insurancePercentage}%)
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="flex justify-center space-x-4">
          <Badge variant="secondary" className="text-sm">
            <DollarSign className="h-3 w-3 mr-1" />
            Média: {formatCurrency(totals.totalAppointments > 0 ? totals.totalAmount / totals.totalAppointments : 0)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
