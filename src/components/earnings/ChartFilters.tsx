
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Calendar, Filter, X } from 'lucide-react'

interface ChartFiltersProps {
  onFiltersChange: (filters: ChartFilterState) => void
}

export interface ChartFilterState {
  timeRange: 'all' | 'last-week' | 'last-month' | 'last-3months' | 'last-year'
  dayOfWeek: 'all' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
  month: 'all' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12'
  year: 'all' | '2024' | '2023' | '2022'
}

const defaultFilters: ChartFilterState = {
  timeRange: 'all',
  dayOfWeek: 'all',
  month: 'all',
  year: 'all'
}

export function ChartFilters({ onFiltersChange }: ChartFiltersProps) {
  const [filters, setFilters] = useState<ChartFilterState>(defaultFilters)
  const [isExpanded, setIsExpanded] = useState(false)

  const updateFilter = <K extends keyof ChartFilterState>(
    key: K, 
    value: ChartFilterState[K]
  ) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    setFilters(defaultFilters)
    onFiltersChange(defaultFilters)
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== 'all')

  const dayLabels = {
    all: 'Todos os dias',
    monday: 'Segunda-feira',
    tuesday: 'Terça-feira', 
    wednesday: 'Quarta-feira',
    thursday: 'Quinta-feira',
    friday: 'Sexta-feira',
    saturday: 'Sábado',
    sunday: 'Domingo'
  }

  const monthLabels = {
    all: 'Todos os meses',
    '1': 'Janeiro', '2': 'Fevereiro', '3': 'Março', '4': 'Abril',
    '5': 'Maio', '6': 'Junho', '7': 'Julho', '8': 'Agosto',
    '9': 'Setembro', '10': 'Outubro', '11': 'Novembro', '12': 'Dezembro'
  }

  return (
    <Card className="mb-4 mx-2 sm:mx-0">
      <CardHeader className="pb-2 px-3 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <CardTitle className="text-sm flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Filtros Avançados</span>
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {Object.values(filters).filter(v => v !== 'all').length}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
                <X className="h-3 w-3 mr-1" />
                Limpar
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs"
            >
              {isExpanded ? 'Ocultar' : 'Mostrar'}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4 px-3 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Período</label>
              <Select value={filters.timeRange} onValueChange={(value) => updateFilter('timeRange', value as any)}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os períodos</SelectItem>
                  <SelectItem value="last-week">Última semana</SelectItem>
                  <SelectItem value="last-month">Último mês</SelectItem>
                  <SelectItem value="last-3months">Últimos 3 meses</SelectItem>
                  <SelectItem value="last-year">Último ano</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Dia da Semana</label>
              <Select value={filters.dayOfWeek} onValueChange={(value) => updateFilter('dayOfWeek', value as any)}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(dayLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value} className="text-xs">{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Mês</label>
              <Select value={filters.month} onValueChange={(value) => updateFilter('month', value as any)}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(monthLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value} className="text-xs">{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Ano</label>
              <Select value={filters.year} onValueChange={(value) => updateFilter('year', value as any)}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os anos</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
