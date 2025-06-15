
import { Badge } from '@/components/ui/badge'
import { Clock, User, Phone } from 'lucide-react'
import { Appointment } from '@/types/appointment'
import { formatTime } from '@/utils/dateFormatters'
import { getStatusColor, getStatusText, getTypeText } from '@/utils/appointmentUtils'

interface AppointmentDetailsProps {
  appointment: Appointment
}

export function AppointmentDetails({ appointment }: AppointmentDetailsProps) {
  return (
    <>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 pr-2">
          <h3 className="font-semibold text-sm text-gray-900 mb-1">
            {appointment.patient.name}
          </h3>
          <div className="flex items-center text-xs text-gray-600 mb-2">
            <Clock className="h-3 w-3 mr-1" />
            <span>
              {formatTime(appointment.start)} - {formatTime(appointment.end)}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <Badge className={`${getStatusColor(appointment.status)} text-xs font-medium`}>
            {getStatusText(appointment.status)}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {getTypeText(appointment.type)}
          </Badge>
        </div>
      </div>

      {appointment.description && (
        <p className="text-xs text-gray-600 mb-3 bg-gray-50 p-2 rounded">
          {appointment.description}
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <div className="flex items-center">
          <User className="h-3 w-3 mr-1" />
          <span>{appointment.patient.email || 'Sem email'}</span>
        </div>
        {appointment.patient.phone && (
          <div className="flex items-center">
            <Phone className="h-3 w-3 mr-1" />
            <span>{appointment.patient.phone}</span>
          </div>
        )}
      </div>
    </>
  )
}
