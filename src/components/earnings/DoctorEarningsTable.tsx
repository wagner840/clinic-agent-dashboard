
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

interface DoctorTotalEarnings {
  id: string
  doctor_name: string
  doctor_email: string
  total_amount: number
  total_appointments: number
  insurance_amount: number
  insurance_appointments: number
  private_amount: number
  private_appointments: number
  first_appointment_date: string | null
  last_appointment_date: string | null
}

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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Ganhos por Médico</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (earnings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Ganhos por Médico</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum ganho registrado ainda</p>
            <p className="text-sm">Os ganhos aparecerão quando pagamentos forem processados</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5" />
          <span>Ganhos por Médico</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Médico</span>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4" />
                  <span>Total</span>
                </div>
              </TableHead>
              <TableHead>Consultas</TableHead>
              <TableHead>Particular</TableHead>
              <TableHead>Convênio</TableHead>
              <TableHead>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Período</span>
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {earnings.map((doctor) => (
              <TableRow key={doctor.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{doctor.doctor_name}</div>
                    <div className="text-sm text-muted-foreground">{doctor.doctor_email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-bold text-lg text-green-600">
                    {formatCurrency(doctor.total_amount)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {doctor.total_appointments} consultas
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-center">
                    {doctor.total_appointments}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{formatCurrency(doctor.private_amount)}</div>
                    <div className="text-sm text-muted-foreground">
                      {doctor.private_appointments} consultas
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{formatCurrency(doctor.insurance_amount)}</div>
                    <div className="text-sm text-muted-foreground">
                      {doctor.insurance_appointments} consultas
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{formatDate(doctor.first_appointment_date)}</div>
                    <div className="text-muted-foreground">até</div>
                    <div>{formatDate(doctor.last_appointment_date)}</div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
