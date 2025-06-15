
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface CancelledCleanupButtonProps {
  onCleanup: () => Promise<void>
  cancelledCount: number
}

export function CancelledCleanupButton({ onCleanup, cancelledCount }: CancelledCleanupButtonProps) {
  if (cancelledCount === 0) return null

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onCleanup}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Limpar Cancelados ({cancelledCount})
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Remove todos os agendamentos cancelados permanentemente</p>
      </TooltipContent>
    </Tooltip>
  )
}
