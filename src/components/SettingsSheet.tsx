
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from "@/components/ui/sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "next-themes"
import { CalendarListEntry } from "@/services/googleCalendar"
import { Trash2, Plus, Calendar } from 'lucide-react'
import { useState } from 'react'
import { toast } from "sonner"

interface SettingsSheetProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  doctorCalendars: CalendarListEntry[]
  onCreateCalendar: (calendarName: string) => Promise<void>
  onDeleteCalendar: (calendarId: string) => Promise<void>
  onAddHolidaysToAll: () => Promise<void>
  accessToken: string | null
}

export function SettingsSheet({
  isOpen,
  onOpenChange,
  doctorCalendars,
  onCreateCalendar,
  onDeleteCalendar,
  onAddHolidaysToAll,
  accessToken
}: SettingsSheetProps) {
  const { theme, setTheme } = useTheme()
  const [newCalendarName, setNewCalendarName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [isAddingHolidays, setIsAddingHolidays] = useState(false)
  const [calendarToDelete, setCalendarToDelete] = useState<CalendarListEntry | null>(null)

  const handleCreateCalendar = async () => {
    if (!newCalendarName.trim()) {
      toast.error('Por favor, insira um nome para a agenda')
      return
    }

    if (!accessToken) {
      toast.error('Você precisa estar conectado ao Google para criar agendas')
      return
    }

    setIsCreating(true)
    try {
      await onCreateCalendar(newCalendarName.trim())
      setNewCalendarName('')
      toast.success('Agenda criada com sucesso!')
    } catch (error) {
      console.error('Erro ao criar agenda:', error)
      toast.error('Erro ao criar agenda. Verifique suas permissões.')
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteCalendarClick = (calendar: CalendarListEntry) => {
    if (!accessToken) {
      toast.error('Você precisa estar conectado ao Google para excluir agendas.');
      return;
    }
    setCalendarToDelete(calendar);
  };

  const confirmDeleteCalendar = async () => {
    if (!calendarToDelete) return;

    try {
      await onDeleteCalendar(calendarToDelete.id);
      toast.success(`Agenda "${calendarToDelete.summary}" excluída com sucesso!`);
    } catch (error) {
      console.error('Erro ao excluir agenda:', error);
      toast.error('Erro ao excluir agenda.');
    } finally {
      setCalendarToDelete(null);
    }
  };

  const handleAddHolidays = async () => {
    if (doctorCalendars.length === 0) {
      toast.error('Nenhuma agenda encontrada para adicionar feriados')
      return
    }

    setIsAddingHolidays(true)
    try {
      await onAddHolidaysToAll()
      toast.success('Feriados brasileiros adicionados a todas as agendas!')
    } catch (error) {
      console.error('Erro ao adicionar feriados:', error)
      toast.error('Erro ao adicionar feriados às agendas.')
    } finally {
      setIsAddingHolidays(false)
    }
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Configurações</SheetTitle>
            <SheetDescription>
              Gerencie as preferências da aplicação e suas agendas.
            </SheetDescription>
          </SheetHeader>
          <div className="py-4 space-y-8">
            {/* Appearance Settings */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Aparência</h4>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode" className="cursor-pointer">Modo Escuro</Label>
                  <p className="text-xs text-muted-foreground">
                    Alterne entre o tema claro e escuro.
                  </p>
                </div>
                <Switch
                  id="dark-mode"
                  checked={theme === 'dark'}
                  onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                />
              </div>
            </div>

            {/* Calendar Management */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Gerenciar Agendas</h4>
              
              {/* Create New Calendar */}
              <div className="space-y-2 rounded-lg border p-4">
                <Label htmlFor="new-calendar-name">Criar Nova Agenda</Label>
                <div className="flex space-x-2">
                  <Input 
                    id="new-calendar-name"
                    placeholder="Nome da nova agenda (ex: Dr. João Silva)"
                    value={newCalendarName}
                    onChange={(e) => setNewCalendarName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateCalendar()}
                  />
                  <Button 
                    onClick={handleCreateCalendar}
                    disabled={isCreating || !accessToken}
                  >
                    {isCreating ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Criando...</span>
                      </div>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Criar
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground pt-1">
                  A agenda será criada no seu Google Calendar com os feriados brasileiros incluídos.
                </p>
              </div>

              {/* Add Holidays to All Calendars */}
              <div className="space-y-2 rounded-lg border p-4">
                <Label>Feriados Brasileiros</Label>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      Adicionar feriados brasileiros de 2025 a todas as agendas existentes.
                    </p>
                  </div>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={handleAddHolidays}
                    disabled={isAddingHolidays || doctorCalendars.length === 0}
                  >
                    {isAddingHolidays ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span>Adicionando...</span>
                      </div>
                    ) : (
                      <>
                        <Calendar className="h-4 w-4 mr-2" />
                        Adicionar
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Connected Calendars */}
              <div className="space-y-2">
                <Label>Agendas Conectadas</Label>
                {doctorCalendars.length > 0 ? (
                  <div className="space-y-2 rounded-lg border p-4">
                    {doctorCalendars.map((cal) => (
                      <div key={cal.id} className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{cal.summary}</p>
                          <p className="text-xs text-muted-foreground break-all">{cal.id}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteCalendarClick(cal)}
                          disabled={!accessToken}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground p-4 text-center border rounded-lg">
                    Nenhuma agenda de médico encontrada.
                  </div>
                )}
              </div>
            </div>
          </div>
          <SheetFooter>
            {/* Footer content can be added here if needed */}
          </SheetFooter>
        </SheetContent>
      </Sheet>
      <AlertDialog open={!!calendarToDelete} onOpenChange={(isOpen) => !isOpen && setCalendarToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              A ação não pode ser desfeita. Isto irá excluir permanentemente a agenda "{calendarToDelete?.summary}" e todos os seus eventos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCalendarToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteCalendar}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
