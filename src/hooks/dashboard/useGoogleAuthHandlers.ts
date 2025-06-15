
import { useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'

interface GoogleAuthOperations {
  isGoogleSignedIn: boolean
  googleSignIn: () => Promise<void>
  googleSignOut: () => Promise<void>
  googleSwitchAccount: () => Promise<void>
}

export function useGoogleAuthHandlers(operations: GoogleAuthOperations) {
  const { toast } = useToast()

  const handleGoogleAuth = useCallback(async (): Promise<void> => {
    try {
      if (operations.isGoogleSignedIn) {
        await operations.googleSignOut()
        toast({
          title: "Desconectado",
          description: "Você foi desconectado do Google.",
        })
      } else {
        await operations.googleSignIn()
        toast({
          title: "Conectado",
          description: "Conectado ao Google com sucesso!",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao conectar/desconectar do Google.",
        variant: "destructive"
      })
    }
  }, [operations.isGoogleSignedIn, operations.googleSignIn, operations.googleSignOut, toast])

  const handleSwitchAccount = useCallback(async (): Promise<void> => {
    try {
      await operations.googleSwitchAccount()
      toast({
        title: "Conta alterada",
        description: "Conta do Google alterada com sucesso!",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao trocar conta do Google.",
        variant: "destructive"
      })
    }
  }, [operations.googleSwitchAccount, toast])

  return {
    handleGoogleAuth,
    handleSwitchAccount
  }
}
