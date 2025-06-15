
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DoctorTotalEarnings } from '@/types/earnings'

interface SummaryCardsProps {
  filteredEarnings: DoctorTotalEarnings[]
  totalEarnings: DoctorTotalEarnings[]
  formatCurrency: (value: number) => string
}

export function SummaryCards({ filteredEarnings, totalEarnings, formatCurrency }: SummaryCardsProps) {
  const totalClinicAmount = filteredEarnings.reduce((sum, doctor) => sum + doctor.total_amount, 0)
  const totalClinicAppointments = filteredEarnings.reduce((sum, doctor) => sum + doctor.total_appointments, 0)
  
  const isFiltered = filteredEarnings.length !== totalEarnings.length

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
      <Card className="min-h-[120px]">
        <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-xs sm:text-sm text-muted-foreground">Faturamento Total</CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
          <div className="text-lg sm:text-2xl font-bold text-green-600 break-words">
            {formatCurrency(totalClinicAmount)}
          </div>
          {isFiltered && (
            <div className="text-xs text-muted-foreground mt-1">
              de {formatCurrency(totalEarnings.reduce((sum, doctor) => sum + doctor.total_amount, 0))} total
            </div>
          )}
        </CardContent>
      </Card>
      <Card className="min-h-[120px]">
        <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-xs sm:text-sm text-muted-foreground">Total de Consultas</CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
          <div className="text-lg sm:text-2xl font-bold text-blue-600">
            {totalClinicAppointments}
          </div>
          {isFiltered && (
            <div className="text-xs text-muted-foreground mt-1">
              de {totalEarnings.reduce((sum, doctor) => sum + doctor.total_appointments, 0)} total
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
