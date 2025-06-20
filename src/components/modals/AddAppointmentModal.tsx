
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarPlus } from 'lucide-react';
import { CalendarListEntry } from '@/services/googleCalendar';

interface AddAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAppointment: (appointmentData: any, calendarId: string) => Promise<string>;
  doctorCalendars: CalendarListEntry[];
}

export function AddAppointmentModal({
  isOpen,
  onClose,
  onAddAppointment,
  doctorCalendars
}: AddAppointmentModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patientName: '',
    patientEmail: '',
    patientPhone: '',
    date: '',
    time: '',
    duration: '60',
    type: 'consultation',
    description: '',
    calendarId: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Parse time correctly to avoid timezone issues
      const [hours, minutes] = formData.time.split(':').map(Number);
      
      // Create date using the local date and time specified by user
      const startDate = new Date(formData.date + 'T00:00:00');
      startDate.setHours(hours, minutes, 0, 0);
      
      // Calculate end date by adding duration
      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + parseInt(formData.duration));

      console.log('📅 Creating appointment:', {
        selectedDate: formData.date,
        selectedTime: formData.time,
        duration: formData.duration,
        calculatedStart: startDate.toISOString(),
        calculatedEnd: endDate.toISOString(),
        localStart: startDate.toLocaleString(),
        localEnd: endDate.toLocaleString()
      });

      const appointmentData = {
        patientName: formData.patientName,
        patientEmail: formData.patientEmail,
        patientPhone: formData.patientPhone,
        start: startDate,
        end: endDate,
        type: formData.type,
        description: formData.description
      };

      await onAddAppointment(appointmentData, formData.calendarId);

      // Reset form
      setFormData({
        patientName: '',
        patientEmail: '',
        patientPhone: '',
        date: '',
        time: '',
        duration: '60',
        type: 'consultation',
        description: '',
        calendarId: ''
      });
      onClose();
    } catch (error) {
      console.error('Error adding appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarPlus className="h-5 w-5" />
            Novo Agendamento
          </DialogTitle>
          <DialogDescription>
            Adicione um novo agendamento ao Google Calendar
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="calendarId">Médico(a) *</Label>
            <Select value={formData.calendarId} onValueChange={value => handleInputChange('calendarId', value)} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um(a) médico(a)" />
              </SelectTrigger>
              <SelectContent>
                {doctorCalendars.map(cal => (
                  <SelectItem key={cal.id} value={cal.id}>{cal.summary}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        
          <div className="space-y-2">
            <Label htmlFor="patientName">Nome do Paciente *</Label>
            <Input id="patientName" value={formData.patientName} onChange={e => handleInputChange('patientName', e.target.value)} placeholder="Digite o nome completo" required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patientEmail">Email</Label>
              <Input id="patientEmail" type="email" value={formData.patientEmail} onChange={e => handleInputChange('patientEmail', e.target.value)} placeholder="email@exemplo.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="patientPhone">Telefone</Label>
              <Input id="patientPhone" value={formData.patientPhone} onChange={e => handleInputChange('patientPhone', e.target.value)} placeholder="(11) 99999-9999" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data *</Label>
              <Input id="date" type="date" value={formData.date} onChange={e => handleInputChange('date', e.target.value)} required className="mx-px px-[5px] py-[6px] my-[8px] rounded" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Horário *</Label>
              <Input id="time" type="time" value={formData.time} onChange={e => handleInputChange('time', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duração (min)</Label>
              <Select value={formData.duration} onValueChange={value => handleInputChange('duration', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="45">45 min</SelectItem>
                  <SelectItem value="60">60 min</SelectItem>
                  <SelectItem value="90">90 min</SelectItem>
                  <SelectItem value="120">120 min</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Consulta</Label>
            <Select value={formData.type} onValueChange={value => handleInputChange('type', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="consultation">Consulta</SelectItem>
                <SelectItem value="follow-up">Retorno</SelectItem>
                <SelectItem value="procedure">Procedimento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Observações</Label>
            <Textarea id="description" value={formData.description} onChange={e => handleInputChange('description', e.target.value)} placeholder="Informações adicionais sobre a consulta" rows={3} />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !formData.patientName || !formData.date || !formData.time || !formData.calendarId} className="flex-1">
              {loading ? 'Criando...' : 'Criar Agendamento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
