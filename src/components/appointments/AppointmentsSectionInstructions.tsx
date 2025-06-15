
export function AppointmentsSectionInstructions() {
  return (
    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-start space-x-3">
        <div className="text-blue-600 mt-1">💡</div>
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">Dicas de uso:</p>
          <ul className="list-disc list-inside space-y-1 text-blue-700">
            <li>Arraste de "Próximos" para "Hoje" para alterar horário</li>
            <li>Arraste para "Cancelados" para cancelar agendamento</li>
            <li>Clique em "Finalizar" para concluir e registrar pagamento</li>
            <li>Use o menu do card (botão direito) para mais opções</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
