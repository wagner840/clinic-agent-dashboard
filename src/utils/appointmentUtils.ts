
export const getStatusColor = (status: string) => {
  switch (status) {
    case 'scheduled':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export const getStatusText = (status: string) => {
  switch (status) {
    case 'scheduled':
      return 'Agendado'
    case 'completed':
      return 'Concluído'
    case 'cancelled':
      return 'Cancelado'
    default:
      return status
  }
}

export const getTypeText = (type: string) => {
  switch (type) {
    case 'consultation':
      return 'Consulta'
    case 'procedure':
      return 'Procedimento'
    case 'follow-up':
      return 'Retorno'
    default:
      return type
  }
}
