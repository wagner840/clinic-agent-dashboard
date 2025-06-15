
import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar, Clock, User } from 'lucide-react'
import { Appointment } from '@/types/appointment'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface RescheduleModalProps {
  isOpen: boolean
  onClose: () => void
  appointment: Appointment | null
  onReschedule: (newDate: Date) => Promise<void>
}

export function RescheduleModal({
  isOpen,
  onClose,
  appointment,
  onReschedule
}: RescheduleModalProps) {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (appointment && isOpen) {
      // Definir a data de hoje como padrão
      const today = new Date()
      setDate(format(today, 'yyyy-MM-dd'))
      
      // Manter o horário original do agendamento
      const originalTime = format(appointment.start, 'HH:mm')
      setTime(originalTime)
    }
  }, [appointment, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!appointment || !date || !time) return

    setLoading(true)
    try {
      const [hours, minutes] = time.split(':').map(Number)
      const newDate = new Date(date)
      newDate.setHours(hours, minutes, 0, 0)
      
      await onReschedule(newDate)
    } catch (error) {
      console.error('Error rescheduling:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!appointment) return null

  const originalDateTime = format(appointment.start, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Alterar Horário
          </DialogTitle>
          <DialogDescription>
            Altere o horário do agendamento para hoje
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informações do agendamento */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-gray-500" />
              <span className="font-medium">{appointment.patient.name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Horário atual: {originalDateTime}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Nova Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Novo Horário</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading || !date || !time}
                className="flex-1"
              >
                {loading ? 'Alterando...' : 'Confirmar'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
