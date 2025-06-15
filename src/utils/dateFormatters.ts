
export const formatTime = (date: Date) => {
  return date.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

export const formatDate = (date: Date) => {
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export const formatShortDate = (date: Date) => {
  return date.toLocaleDateString('pt-BR')
}
