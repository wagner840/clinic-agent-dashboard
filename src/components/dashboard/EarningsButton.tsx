
import { Button } from '@/components/ui/button'
import { TrendingUp } from 'lucide-react'

interface EarningsButtonProps {
  onShowEarnings: () => void
}

export function EarningsButton({ onShowEarnings }: EarningsButtonProps) {
  return (
    <Button 
      onClick={onShowEarnings}
      className="flex items-center space-x-2"
    >
      <TrendingUp className="h-4 w-4" />
      <span>Ver Relatório de Ganhos</span>
    </Button>
  )
}
