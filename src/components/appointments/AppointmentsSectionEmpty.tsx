
import { Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AppointmentsSectionEmptyProps {
  isGoogleInitialized: boolean
  onGoogleSignIn: () => Promise<void>
}

export function AppointmentsSectionEmpty({ 
  isGoogleInitialized, 
  onGoogleSignIn 
}: AppointmentsSectionEmptyProps) {
  return (
    <div className="mt-8">
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <Calendar className="h-16 w-16 mx-auto mb-6 text-gray-300" />
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Conecte o Google Calendar
        </h3>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          Para visualizar e gerenciar seus agendamentos, 
          conecte sua conta do Google Calendar.
        </p>
        <Button onClick={onGoogleSignIn} disabled={!isGoogleInitialized} size="lg">
          <Calendar className="h-5 w-5 mr-2" />
          Conectar Google Calendar
        </Button>
      </div>
    </div>
  )
}
