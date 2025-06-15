
import { Button } from '@/components/ui/button'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Calculator, AlertTriangle } from 'lucide-react'
import { useHistoricalEarningsRecalculation } from '@/hooks/useHistoricalEarningsRecalculation'

export function HistoricalRecalculationButton() {
  const { recalculateHistoricalEarnings, isRecalculating } = useHistoricalEarningsRecalculation()

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="outline" 
          disabled={isRecalculating}
          className="flex items-center space-x-2"
        >
          <Calculator className={`h-4 w-4 ${isRecalculating ? 'animate-spin' : ''}`} />
          <span>Recalcular Histórico</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <span>Recalcular Ganhos Históricos</span>
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Esta ação irá recalcular todos os ganhos baseados nos pagamentos já registrados no sistema.
            </p>
            <p>
              <strong>Atenção:</strong> Isso irá substituir todos os dados atuais de ganhos pelos dados recalculados a partir do histórico de pagamentos.
            </p>
            <p>
              Esta operação é útil para incluir ganhos de agendamentos que foram concluídos antes da implementação do sistema de relatórios.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={recalculateHistoricalEarnings}
            disabled={isRecalculating}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isRecalculating ? 'Recalculando...' : 'Recalcular Agora'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
