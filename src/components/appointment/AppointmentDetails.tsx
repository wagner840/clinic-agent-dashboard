
import { Badge } from '@/components/ui/badge'
import { Clock, User, Phone, Calendar, Stethoscope } from 'lucide-react'
import { Appointment } from '@/types/appointment'
import { formatTime, formatShortDate } from '@/utils/dateFormatters'
import { getStatusColor, getStatusText, getTypeText } from '@/utils/appointmentUtils'

interface AppointmentDetailsProps {
  appointment: Appointment
}

export function AppointmentDetails({ appointment }: AppointmentDetailsProps) {
  return (
    <div className="space-y-3">
      {/* Header with patient name and badges */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm sm:text-base text-gray-900 truncate">
            {appointment.patient.name}
          </h3>
          <div className="flex items-center text-xs text-gray-600 mt-1">
            <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="truncate">{formatShortDate(appointment.start)}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge className={`${getStatusColor(appointment.status)} text-xs font-medium`}>
            {getStatusText(appointment.status)}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {getTypeText(appointment.type)}
          </Badge>
        </div>
      </div>

      {/* Time */}
      <div className="flex items-center text-xs text-gray-600">
        <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
        <span>
          {formatTime(appointment.start)} - {formatTime(appointment.end)}
        </span>
      </div>

      {/* Description */}
      {appointment.description && (
        <div className="bg-gray-50 p-2 rounded text-xs text-gray-600">
          {appointment.description}
        </div>
      )}

      {/* Doctor Info */}
      <div className="flex items-center text-xs pt-2 mt-2 border-t border-gray-100 text-gray-600">
        <Stethoscope className="h-3 w-3 mr-1.5 flex-shrink-0" />
        <span className="truncate font-medium">{appointment.doctor.name}</span>
      </div>

      {/* Contact info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-500 pt-2 border-t border-gray-100">
        <div className="flex items-center min-w-0">
          <User className="h-3 w-3 mr-1 flex-shrink-0" />
          <span className="truncate">{appointment.patient.email || 'Sem email'}</span>
        </div>
        {appointment.patient.phone && (
          <div className="flex items-center min-w-0">
            <Phone className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="truncate">{appointment.patient.phone}</span>
          </div>
        )}
      </div>
    </div>
  )
}
