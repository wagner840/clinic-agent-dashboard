
export function AppointmentsSectionLoading() {
  return (
    <div className="mt-8">
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando agendamentos do Google Calendar...</p>
      </div>
    </div>
  )
}
