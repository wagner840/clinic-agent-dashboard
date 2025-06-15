
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface AppointmentsSectionHeaderProps {
  onAddAppointment: () => void
}

export function AppointmentsSectionHeader({ onAddAppointment }: AppointmentsSectionHeaderProps) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Agendamentos</h2>
        <p className="text-gray-600">
          Arraste e solte para gerenciar. Arraste para "Hoje" para alterar horário.
        </p>
      </div>
      <Button onClick={onAddAppointment} className="sm:w-auto">
        <Plus className="h-4 w-4 mr-2" />
        Novo Agendamento
      </Button>
    </div>
  )
}
