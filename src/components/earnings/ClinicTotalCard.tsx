
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
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 mx-2 sm:mx-0">
      <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <CardTitle className="flex items-center space-x-2 text-blue-700 dark:text-blue-300 text-sm sm:text-base">
            <Building2 className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
            <span>Total da Clínica</span>
          </CardTitle>
          {onShowCharts && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onShowCharts}
              className="flex items-center space-x-2 bg-white/50 hover:bg-white/80 dark:bg-gray-800/50 dark:hover:bg-gray-800/80 text-xs sm:text-sm w-full sm:w-auto"
            >
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Gráficos</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 px-3 sm:px-6 pb-3 sm:pb-6">
        {/* Valor Total */}
        <div className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2 break-words">
            {formatCurrency(totals.totalAmount)}
          </div>
          <div className="flex items-center justify-center space-x-2 text-muted-foreground text-sm">
            <Users className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span>{totals.totalAppointments} consultas realizadas</span>
          </div>
        </div>

        {/* Breakdown por tipo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="text-center p-3 sm:p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
              <span className="font-medium text-sm sm:text-base">Particular</span>
            </div>
            <div className="text-lg sm:text-xl font-bold text-green-600 break-words">
              {formatCurrency(totals.privateAmount)}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              {totals.privateAppointments} consultas ({privatePercentage}%)
            </div>
          </div>

          <div className="text-center p-3 sm:p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
              <span className="font-medium text-sm sm:text-base">Convênio</span>
            </div>
            <div className="text-lg sm:text-xl font-bold text-blue-600 break-words">
              {formatCurrency(totals.insuranceAmount)}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              {totals.insuranceAppointments} consultas ({insurancePercentage}%)
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="flex justify-center">
          <Badge variant="secondary" className="text-xs sm:text-sm">
            <DollarSign className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="break-all">
              Média: {formatCurrency(totals.totalAppointments > 0 ? totals.totalAmount / totals.totalAppointments : 0)}
            </span>
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
