
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DollarSign, TrendingUp, Calendar, User } from 'lucide-react'
import { DoctorTotalEarnings } from '@/types/earnings'

interface DoctorEarningsTableProps {
  earnings: DoctorTotalEarnings[]
  loading: boolean
}

export function DoctorEarningsTable({ earnings, loading }: DoctorEarningsTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  if (loading) {
    return (
      <Card className="mx-2 sm:mx-0">
        <CardHeader className="px-3 sm:px-6">
          <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Ganhos por Médico</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (earnings.length === 0) {
    return (
      <Card className="mx-2 sm:mx-0">
        <CardHeader className="px-3 sm:px-6">
          <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Ganhos por Médico</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <div className="text-center py-8 text-muted-foreground">
            <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm sm:text-base">Nenhum ganho registrado ainda</p>
            <p className="text-xs sm:text-sm">Os ganhos aparecerão quando pagamentos forem processados</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mx-2 sm:mx-0">
      <CardHeader className="px-3 sm:px-6">
        <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
          <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
          <span>Ganhos por Médico</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 sm:px-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px] px-3 sm:px-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="text-xs sm:text-sm">Médico</span>
                  </div>
                </TableHead>
                <TableHead className="min-w-[120px] px-3 sm:px-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="text-xs sm:text-sm">Total</span>
                  </div>
                </TableHead>
                <TableHead className="min-w-[80px] px-3 sm:px-4 text-xs sm:text-sm">Consultas</TableHead>
                <TableHead className="min-w-[100px] px-3 sm:px-4 text-xs sm:text-sm">Particular</TableHead>
                <TableHead className="min-w-[100px] px-3 sm:px-4 text-xs sm:text-sm">Convênio</TableHead>
                <TableHead className="min-w-[120px] px-3 sm:px-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="text-xs sm:text-sm">Período</span>
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {earnings.map((doctor) => (
                <TableRow key={doctor.id}>
                  <TableCell className="px-3 sm:px-4">
                    <div>
                      <div className="font-medium text-xs sm:text-sm break-words">{doctor.doctor_name}</div>
                      <div className="text-xs text-muted-foreground break-all">{doctor.doctor_email}</div>
                    </div>
                  </TableCell>
                  <TableCell className="px-3 sm:px-4">
                    <div className="font-bold text-sm sm:text-lg text-green-600 break-words">
                      {formatCurrency(doctor.total_amount)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {doctor.total_appointments} consultas
                    </div>
                  </TableCell>
                  <TableCell className="px-3 sm:px-4">
                    <Badge variant="outline" className="text-center text-xs">
                      {doctor.total_appointments}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-3 sm:px-4">
                    <div>
                      <div className="font-medium text-xs sm:text-sm break-words">{formatCurrency(doctor.private_amount)}</div>
                      <div className="text-xs text-muted-foreground">
                        {doctor.private_appointments} consultas
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-3 sm:px-4">
                    <div>
                      <div className="font-medium text-xs sm:text-sm break-words">{formatCurrency(doctor.insurance_amount)}</div>
                      <div className="text-xs text-muted-foreground">
                        {doctor.insurance_appointments} consultas
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-3 sm:px-4">
                    <div className="text-xs">
                      <div>{formatDate(doctor.first_appointment_date)}</div>
                      <div className="text-muted-foreground">até</div>
                      <div>{formatDate(doctor.last_appointment_date)}</div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
