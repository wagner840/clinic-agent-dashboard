
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { CalendarListEntry } from '@/services/googleCalendar'
import { useMemo } from 'react'

interface DoctorFilterProps {
  doctorCalendars: CalendarListEntry[]
  doctorFilter: string
  onDoctorFilterChange: (value: string) => void
}

export function DoctorFilter({
  doctorCalendars,
  doctorFilter,
  onDoctorFilterChange
}: DoctorFilterProps) {
  // Filter calendars to remove "Holidays in Brazil" from doctor selector
  const doctorCalendarsForFilter = useMemo(() => {
    return doctorCalendars.filter(cal => 
      !cal.summary?.toLowerCase().includes('holiday') && 
      !cal.summary?.toLowerCase().includes('feriado')
    )
  }, [doctorCalendars])

  if (doctorCalendarsForFilter.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="doctor-filter">Filtrar por Médico</Label>
      <Select value={doctorFilter} onValueChange={onDoctorFilterChange}>
        <SelectTrigger id="doctor-filter" className="w-full sm:w-[280px] bg-white dark:bg-slate-800 dark:border-slate-600">
          <SelectValue placeholder="Selecionar médico..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os Médicos</SelectItem>
          {doctorCalendarsForFilter.map((cal) => (
            <SelectItem key={cal.id} value={cal.id}>
              {cal.summary}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
