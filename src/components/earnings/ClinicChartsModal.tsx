
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer } from '@/components/ui/chart';
import { TrendingUp, BarChart3, PieChart as PieChartIcon, X } from 'lucide-react';
import { DoctorTotalEarnings } from '@/types/earnings';
import { Appointment } from '@/types/appointment';
import { ChartFilters, ChartFilterState } from './ChartFilters';
import { ChartControls } from './charts/ChartControls';
import { ChartRenderer } from './charts/ChartRenderer';
import { ChartDataProcessor } from './charts/ChartDataProcessor';
import { ChartLegend } from './charts/ChartLegend';
import { SummaryCards } from './charts/SummaryCards';

interface ClinicChartsModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalEarnings: DoctorTotalEarnings[];
  appointments?: Appointment[];
}

export function ClinicChartsModal({
  isOpen,
  onClose,
  totalEarnings,
  appointments = []
}: ClinicChartsModalProps) {
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');
  const [dataType, setDataType] = useState<'amount' | 'appointments'>('amount');
  const [viewMode, setViewMode] = useState<'combined' | 'individual'>('combined');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('all');
  const [comparisonMode, setComparisonMode] = useState<'none' | 'private-insurance'>('none');
  const [filters, setFilters] = useState<ChartFilterState>({
    timeRange: 'all',
    dayOfWeek: 'all',
    month: 'all',
    year: 'all'
  });
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  const dataProcessor = new ChartDataProcessor(totalEarnings, filters, appointments);
  const filteredEarnings = dataProcessor.getFilteredEarnings();
  const prepareChartData = () => {
    return viewMode === 'combined' ? dataProcessor.prepareCombinedData(dataType) : dataProcessor.prepareIndividualData(dataType, selectedDoctor);
  };
  const chartData = prepareChartData();
  const pieData = dataProcessor.preparePieData(chartData);
  const availableDoctors = filteredEarnings.map(doctor => doctor.doctor_name);
  const hasActiveFilters = filters.timeRange !== 'all' || filters.dayOfWeek !== 'all' || filters.month !== 'all' || filters.year !== 'all';
  const getChartTitle = () => {
    const baseTitle = dataType === 'amount' ? 'Faturamento' : 'Consultas';
    const viewTitle = viewMode === 'combined' ? ' - Total da Clínica' : ' por Médico';
    const filterTitle = hasActiveFilters ? ' (Filtrado)' : '';
    return `${baseTitle}${viewTitle}${filterTitle}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] flex flex-col p-0 sm:rounded-lg">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 border-b">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <TrendingUp className="h-5 w-5" />
                <span>Análise Gráfica - Dados da Clínica</span>
              </DialogTitle>
              <DialogDescription className="mt-2 text-xs sm:text-sm">
                Visualize e compare os dados de faturamento e consultas
                {hasActiveFilters && (
                  <span className="block text-blue-600 font-medium mt-1">
                    Filtros ativos - {filteredEarnings.length} de {totalEarnings.length} médicos
                  </span>
                )}
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="ml-4 -mt-2 -mr-2 sm:mt-0 sm:-mr-0">
              <X className="h-4 w-4" />
              <span className="sr-only">Fechar</span>
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <ChartFilters onFiltersChange={setFilters} />

          <SummaryCards filteredEarnings={filteredEarnings} totalEarnings={totalEarnings} formatCurrency={formatCurrency} />

          <ChartControls
            viewMode={viewMode}
            selectedDoctor={selectedDoctor}
            dataType={dataType}
            comparisonMode={comparisonMode}
            availableDoctors={availableDoctors}
            onViewModeChange={setViewMode}
            onDoctorChange={setSelectedDoctor}
            onDataTypeChange={setDataType}
            onComparisonModeChange={setComparisonMode}
          />

          <Tabs value={chartType} onValueChange={value => setChartType(value as 'bar' | 'line' | 'pie')}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="bar" className="flex items-center space-x-2 text-xs sm:text-sm py-3">
                <BarChart3 className="h-4 w-4" />
                <span>Barras</span>
              </TabsTrigger>
              <TabsTrigger value="line" className="flex items-center space-x-2 text-xs sm:text-sm py-3">
                <TrendingUp className="h-4 w-4" />
                <span>Linhas</span>
              </TabsTrigger>
              <TabsTrigger value="pie" className="flex items-center space-x-2 text-xs sm:text-sm py-3">
                <PieChartIcon className="h-4 w-4" />
                <span>Pizza</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={chartType} className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">
                    {getChartTitle()}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pl-0 pr-2 sm:pl-2 sm:pr-4 pt-4">
                  <ChartContainer
                    config={{
                      total: {
                        label: 'Total',
                        color: 'hsl(var(--primary))'
                      },
                      private: {
                        label: 'Particular',
                        color: '#10b981'
                      },
                      insurance: {
                        label: 'Convênio',
                        color: '#3b82f6'
                      }
                    }}
                  >
                    <ChartRenderer
                      chartType={chartType}
                      chartData={chartData}
                      pieData={pieData}
                      dataType={dataType}
                      comparisonMode={comparisonMode}
                      formatCurrency={formatCurrency}
                    />
                  </ChartContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <ChartLegend comparisonMode={comparisonMode} chartType={chartType} />

          {filteredEarnings.length === 0 && (
            <div className="text-center py-8">
              <div className="text-muted-foreground">
                Nenhum dado encontrado com os filtros aplicados.
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
