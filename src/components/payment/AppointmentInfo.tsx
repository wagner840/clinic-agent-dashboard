
import { Clock, User, Calendar } from 'lucide-react'
import { Appointment } from '@/types/appointment'
import { formatTime, formatDate, formatShortDate } from '@/utils/dateFormatters'

interface AppointmentInfoProps {
  appointment: Appointment
}

export function AppointmentInfo({ appointment }: AppointmentInfoProps) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-semibold text-gray-900">
              {appointment.patient.name}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-700">
              {formatShortDate(appointment.start)}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-700">
              {formatTime(appointment.start)} - {formatTime(appointment.end)}
            </span>
          </div>
        </div>
      </div>
      
      <div className="pt-2 border-t border-gray-200">
        <p className="text-xs text-gray-600 italic">
          {formatDate(appointment.start)}
        </p>
      </div>
    </div>
  )
}
