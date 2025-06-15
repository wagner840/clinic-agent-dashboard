
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ChartControlsProps {
  viewMode: 'combined' | 'individual'
  selectedDoctor: string
  dataType: 'amount' | 'appointments'
  comparisonMode: 'none' | 'private-insurance'
  availableDoctors: string[]
  onViewModeChange: (value: 'combined' | 'individual') => void
  onDoctorChange: (value: string) => void
  onDataTypeChange: (value: 'amount' | 'appointments') => void
  onComparisonModeChange: (value: 'none' | 'private-insurance') => void
}

export function ChartControls({
  viewMode,
  selectedDoctor,
  dataType,
  comparisonMode,
  availableDoctors,
  onViewModeChange,
  onDoctorChange,
  onDataTypeChange,
  onComparisonModeChange
}: ChartControlsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium">Visualização</label>
        <Select value={viewMode} onValueChange={onViewModeChange}>
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
          <Select value={selectedDoctor} onValueChange={onDoctorChange}>
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
        <Select value={dataType} onValueChange={onDataTypeChange}>
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
        <Select value={comparisonMode} onValueChange={onComparisonModeChange}>
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
  )
}
