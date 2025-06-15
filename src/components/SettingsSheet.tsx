
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "next-themes"
import { CalendarListEntry } from "@/services/googleCalendar"
import { Trash2 } from 'lucide-react'

interface SettingsSheetProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  doctorCalendars: CalendarListEntry[]
  // TODO: Implement these handlers
  // onAddCalendar: (calendarId: string) => void
  // onDeleteCalendar: (calendarId: string) => void
}

export function SettingsSheet({
  isOpen,
  onOpenChange,
  doctorCalendars,
}: SettingsSheetProps) {
  const { theme, setTheme } = useTheme()

  return (
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
            <div className="space-y-2 rounded-lg border p-4">
              <Label htmlFor="new-calendar-id">Adicionar Nova Agenda</Label>
              <div className="flex space-x-2">
                <Input id="new-calendar-id" placeholder="ID da agenda do Google" />
                <Button disabled>Adicionar</Button>
              </div>
               <p className="text-xs text-muted-foreground pt-1">
                Cole o ID da agenda do Google que você deseja sincronizar.
              </p>
            </div>
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
                      <Button variant="ghost" size="icon" disabled>
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
  )
}
