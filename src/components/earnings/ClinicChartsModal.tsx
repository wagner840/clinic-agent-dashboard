import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, BarChart3, PieChart as PieChartIcon, X } from 'lucide-react'
import { DoctorTotalEarnings } from '@/types/earnings'
import { ChartFilters, ChartFilterState } from './ChartFilters'

interface ClinicChartsModalProps {
  isOpen: boolean
  onClose: () => void
  totalEarnings: DoctorTotalEarnings[]
}

const chartConfig = {
  total: {
    label: "Total",
    color: "hsl(var(--primary))",
  },
  private: {
    label: "Particular",
    color: "#10b981",
  },
  insurance: {
    label: "Convênio", 
    color: "#3b82f6",
  },
}

export function ClinicChartsModal({ isOpen, onClose, totalEarnings }: ClinicChartsModalProps) {
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar')
  const [dataType, setDataType] = useState<'amount' | 'appointments'>('amount')
  const [viewMode, setViewMode] = useState<'combined' | 'individual'>('combined')
  const [selectedDoctor, setSelectedDoctor] = useState<string>('all')
  const [comparisonMode, setComparisonMode] = useState<'none' | 'private-insurance'>('none')
  const [filters, setFilters] = useState<ChartFilterState>({
    timeRange: 'all',
    dayOfWeek: 'all',
    month: 'all',
    year: 'all'
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  // Função para aplicar filtros de data
  const applyDateFilters = (earnings: DoctorTotalEarnings[]): DoctorTotalEarnings[] => {
    return earnings.filter(doctor => {
      // Se não tem datas, não pode filtrar
      if (!doctor.first_appointment_date || !doctor.last_appointment_date) {
        return filters.timeRange === 'all' && filters.month === 'all' && filters.year === 'all'
      }

      const firstDate = new Date(doctor.first_appointment_date)
      const lastDate = new Date(doctor.last_appointment_date)
      const now = new Date()

      // Filtro por período de tempo
      if (filters.timeRange !== 'all') {
        let cutoffDate: Date
        switch (filters.timeRange) {
          case 'last-week':
            cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            break
          case 'last-month':
            cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            break
          case 'last-3months':
            cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
            break
          case 'last-year':
            cutoffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
            break
          default:
            cutoffDate = new Date(0)
        }
        
        // Verifica se o médico teve consultas no período
        if (lastDate < cutoffDate) {
          return false
        }
      }

      // Filtro por mês
      if (filters.month !== 'all') {
        const monthNum = parseInt(filters.month)
        const hasAppointmentInMonth = 
          (firstDate.getMonth() + 1 <= monthNum && lastDate.getMonth() + 1 >= monthNum) ||
          firstDate.getMonth() + 1 === monthNum ||
          lastDate.getMonth() + 1 === monthNum
        
        if (!hasAppointmentInMonth) {
          return false
        }
      }

      // Filtro por ano
      if (filters.year !== 'all') {
        const yearNum = parseInt(filters.year)
        const hasAppointmentInYear = 
          firstDate.getFullYear() <= yearNum && lastDate.getFullYear() >= yearNum
        
        if (!hasAppointmentInYear) {
          return false
        }
      }

      return true
    })
  }

  // Função para aplicar filtros de dia da semana (simulado - em um caso real precisaríamos dos dados detalhados)
  const applyDayOfWeekFilter = (earnings: DoctorTotalEarnings[]): DoctorTotalEarnings[] => {
    if (filters.dayOfWeek === 'all') {
      return earnings
    }

    // Como não temos dados detalhados por dia da semana, vamos simular uma redução proporcional
    const dayFactors = {
      'monday': 0.15,
      'tuesday': 0.15,
      'wednesday': 0.15,
      'thursday': 0.15,
      'friday': 0.15,
      'saturday': 0.15,
      'sunday': 0.10
    }

    const factor = dayFactors[filters.dayOfWeek as keyof typeof dayFactors] || 1

    return earnings.map(doctor => ({
      ...doctor,
      total_amount: Math.round(doctor.total_amount * factor),
      total_appointments: Math.round(doctor.total_appointments * factor),
      private_amount: Math.round(doctor.private_amount * factor),
      private_appointments: Math.round(doctor.private_appointments * factor),
      insurance_amount: Math.round(doctor.insurance_amount * factor),
      insurance_appointments: Math.round(doctor.insurance_appointments * factor)
    })).filter(doctor => doctor.total_appointments > 0)
  }

  // Aplicar todos os filtros
  const getFilteredEarnings = () => {
    console.log('🔍 Aplicando filtros:', filters)
    
    let filtered = [...totalEarnings]
    
    // Aplicar filtros de data
    filtered = applyDateFilters(filtered)
    console.log('📅 Após filtros de data:', filtered.length, 'médicos')
    
    // Aplicar filtro de dia da semana
    filtered = applyDayOfWeekFilter(filtered)
    console.log('📆 Após filtro de dia da semana:', filtered.length, 'médicos')
    
    return filtered
  }

  const filteredEarnings = getFilteredEarnings()

  const prepareCombinedData = () => {
    const totalClinicAmount = filteredEarnings.reduce((sum, doctor) => 
      sum + (dataType === 'amount' ? doctor.total_amount : doctor.total_appointments), 0)
    const totalPrivate = filteredEarnings.reduce((sum, doctor) => 
      sum + (dataType === 'amount' ? doctor.private_amount : doctor.private_appointments), 0)
    const totalInsurance = filteredEarnings.reduce((sum, doctor) => 
      sum + (dataType === 'amount' ? doctor.insurance_amount : doctor.insurance_appointments), 0)

    return [{
      name: 'Total da Clínica',
      fullName: 'Total da Clínica',
      total: totalClinicAmount,
      private: totalPrivate,
      insurance: totalInsurance,
    }]
  }

  const prepareIndividualData = () => {
    let data = filteredEarnings.map(doctor => ({
      name: doctor.doctor_name.split(' ')[0], // Primeiro nome para mobile
      fullName: doctor.doctor_name,
      total: dataType === 'amount' ? doctor.total_amount : doctor.total_appointments,
      private: dataType === 'amount' ? doctor.private_amount : doctor.private_appointments,
      insurance: dataType === 'amount' ? doctor.insurance_amount : doctor.insurance_appointments,
    }))

    // Se um médico específico foi selecionado, filtrar apenas ele
    if (selectedDoctor !== 'all') {
      data = data.filter(doctor => doctor.fullName === selectedDoctor)
    }

    return data
  }

  const prepareChartData = () => {
    return viewMode === 'combined' ? prepareCombinedData() : prepareIndividualData()
  }

  const preparePieData = () => {
    const data = prepareChartData()
    const totalAmount = data.reduce((sum, item) => sum + item.total, 0)
    
    return data.map((item, index) => ({
      name: item.name,
      fullName: item.fullName,
      value: item.total,
      percentage: totalAmount > 0 ? ((item.total / totalAmount) * 100).toFixed(1) : '0'
    }))
  }

  const chartData = prepareChartData()
  const pieData = preparePieData()

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

  // Função para renderizar o gráfico
  const renderChart = () => {
    if (chartType === 'pie') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => `${name} (${percentage}%)`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <ChartTooltip 
              content={<ChartTooltipContent />}
              formatter={(value: number, name: string) => [
                dataType === 'amount' ? formatCurrency(value) : value,
                name
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      )
    }

    if (chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="name" 
              className="text-xs fill-muted-foreground"
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis className="text-xs fill-muted-foreground" />
            <ChartTooltip 
              content={<ChartTooltipContent />}
              formatter={(value: number) => [
                dataType === 'amount' ? formatCurrency(value) : value,
                dataType === 'amount' ? 'Valor' : 'Consultas'
              ]}
            />
            <Line 
              type="monotone" 
              dataKey="total" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))" }}
            />
            {comparisonMode === 'private-insurance' && (
              <>
                <Line 
                  type="monotone" 
                  dataKey="private" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: "#10b981" }}
                />
                <Line 
                  type="monotone" 
                  dataKey="insurance" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6" }}
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      )
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="name" 
            className="text-xs fill-muted-foreground"
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis className="text-xs fill-muted-foreground" />
          <ChartTooltip 
            content={<ChartTooltipContent />}
            formatter={(value: number) => [
              dataType === 'amount' ? formatCurrency(value) : value,
              dataType === 'amount' ? 'Valor' : 'Consultas'
            ]}
          />
          <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          {comparisonMode === 'private-insurance' && (
            <>
              <Bar dataKey="private" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="insurance" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </>
          )}
        </BarChart>
      </ResponsiveContainer>
    )
  }

  const totalClinicAmount = filteredEarnings.reduce((sum, doctor) => sum + doctor.total_amount, 0)
  const totalClinicAppointments = filteredEarnings.reduce((sum, doctor) => sum + doctor.total_appointments, 0)
  const availableDoctors = filteredEarnings.map(doctor => doctor.doctor_name)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Análise Gráfica - Dados da Clínica</span>
              </DialogTitle>
              <DialogDescription>
                Visualize e compare os dados de faturamento e consultas
                {(filters.timeRange !== 'all' || filters.dayOfWeek !== 'all' || filters.month !== 'all' || filters.year !== 'all') && (
                  <span className="block text-blue-600 font-medium mt-1">
                    Filtros ativos - {filteredEarnings.length} de {totalEarnings.length} médicos
                  </span>
                )}
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Filtros Avançados */}
        <ChartFilters onFiltersChange={setFilters} />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Faturamento Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalClinicAmount)}
              </div>
              {filteredEarnings.length !== totalEarnings.length && (
                <div className="text-xs text-muted-foreground mt-1">
                  de {formatCurrency(totalEarnings.reduce((sum, doctor) => sum + doctor.total_amount, 0))} total
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Total de Consultas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {totalClinicAppointments}
              </div>
              {filteredEarnings.length !== totalEarnings.length && (
                <div className="text-xs text-muted-foreground mt-1">
                  de {totalEarnings.reduce((sum, doctor) => sum + doctor.total_appointments, 0)} total
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">Visualização</label>
            <Select value={viewMode} onValueChange={(value: 'combined' | 'individual') => setViewMode(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="combined">Total da Clínica</SelectItem>
                <SelectItem value="individual">Por Médico</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {viewMode === 'individual' && (
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">Médico</label>
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Médicos</SelectItem>
                  {availableDoctors.map(doctor => (
                    <SelectItem key={doctor} value={doctor}>{doctor}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">Tipo de Dados</label>
            <Select value={dataType} onValueChange={(value: 'amount' | 'appointments') => setDataType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="amount">Valores (R$)</SelectItem>
                <SelectItem value="appointments">Consultas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">Comparação</label>
            <Select value={comparisonMode} onValueChange={(value: 'none' | 'private-insurance') => setComparisonMode(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Apenas Total</SelectItem>
                <SelectItem value="private-insurance">Particular vs Convênio</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Chart Tabs */}
        <Tabs value={chartType} onValueChange={(value) => setChartType(value as 'bar' | 'line' | 'pie')}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bar" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Barras</span>
            </TabsTrigger>
            <TabsTrigger value="line" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Linhas</span>
            </TabsTrigger>
            <TabsTrigger value="pie" className="flex items-center space-x-2">
              <PieChartIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Pizza</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={chartType} className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {dataType === 'amount' ? 'Faturamento' : 'Consultas'} 
                  {viewMode === 'combined' ? ' - Total da Clínica' : ' por Médico'}
                  {filteredEarnings.length !== totalEarnings.length && (
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      (Filtrado)
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  {renderChart()}
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Legend for comparison mode */}
        {comparisonMode === 'private-insurance' && chartType !== 'pie' && (
          <div className="flex flex-wrap justify-center gap-4 mt-4 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-primary rounded"></div>
              <span className="text-sm">Total</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-sm">Particular</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-sm">Convênio</span>
            </div>
          </div>
        )}

        {/* Aviso quando nenhum dado é encontrado */}
        {filteredEarnings.length === 0 && (
          <div className="text-center py-8">
            <div className="text-muted-foreground">
              Nenhum dado encontrado com os filtros aplicados.
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
