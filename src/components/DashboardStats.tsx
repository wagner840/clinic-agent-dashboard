
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Clock, Users, TrendingUp } from 'lucide-react'

interface DashboardStatsProps {
  totalAppointments: number
  todayAppointments: number
  upcomingAppointments: number
  clinicTotalEarnings?: number
}

export function DashboardStats({ 
  totalAppointments, 
  todayAppointments, 
  upcomingAppointments,
  clinicTotalEarnings = 0
}: DashboardStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total de Agendamentos
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalAppointments}</div>
          <p className="text-xs text-muted-foreground">
            Agendamentos totais
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Hoje
          </CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{todayAppointments}</div>
          <p className="text-xs text-muted-foreground">
            Consultas hoje
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Próximos
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{upcomingAppointments}</div>
          <p className="text-xs text-muted-foreground">
            Consultas futuras
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Faturamento Total
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(clinicTotalEarnings)}</div>
          <p className="text-xs text-muted-foreground">
            Receita da clínica
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
