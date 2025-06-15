
import { useState, useEffect, useCallback } from 'react'
import { gapi } from 'gapi-script'
import { supabase } from '@/integrations/supabase/client'
import { GOOGLE_CALENDAR_SCOPES } from '@/lib/google'

export function useGoogleAuth() {
  const [googleAuth, setGoogleAuth] = useState<gapi.auth2.GoogleAuth | null>(null)
  const [isGoogleInitialized, setIsGoogleInitialized] = useState(false)
  const [isGoogleSignedIn, setIsGoogleSignedIn] = useState(false)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [googleProfile, setGoogleProfile] = useState<gapi.auth2.BasicProfile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [googleClientId, setGoogleClientId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGoogleClientId = async () => {
      setLoading(true)
      setError(null)
      console.log('Buscando Google Client ID da função do Supabase...')
      const { data, error: invokeError } = await supabase.functions.invoke('get-google-client-id')
      
      if (invokeError) {
        console.error('Erro ao buscar Google Client ID:', invokeError.message)
        setError('Falha ao buscar a configuração do Google (Client ID). Verifique se a função "get-google-client-id" está implantada corretamente no Supabase.')
        setIsGoogleInitialized(true)
        setLoading(false)
        return
      }

      if (data && data.clientId) {
        console.log('Google Client ID buscado com sucesso.')
        setGoogleClientId(data.clientId)
      } else {
        console.error('Google Client ID não retornado pela função:', data)
        setError('A configuração do Google está incompleta. O Client ID está ausente nos segredos do Supabase. Por favor, adicione um segredo chamado "client_id".')
        setIsGoogleInitialized(true)
        setLoading(false)
      }
    }

    fetchGoogleClientId()
  }, [])

  useEffect(() => {
    if (!googleClientId) {
      console.log('Aguardando Google Client ID para inicializar o GAPI...')
      return
    }

    const initClient = () => {
      window.gapi.client.init({
        clientId: googleClientId,
        scope: GOOGLE_CALENDAR_SCOPES,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest']
      }).then(() => {
        const authInstance = window.gapi.auth2.getAuthInstance()
        setGoogleAuth(authInstance)
        setIsGoogleInitialized(true)
        setLoading(false)
        
        const updateSigninStatus = (signedIn: boolean) => {
          setIsGoogleSignedIn(signedIn)
          if (signedIn) {
            const currentGoogleUser = authInstance.currentUser.get()
            const authResponse = currentGoogleUser.getAuthResponse(true)
            setAccessToken(authResponse.access_token)
            setGoogleProfile(currentGoogleUser.getBasicProfile())
            console.log('Usuário Google conectado.')
          } else {
            setAccessToken(null)
            setGoogleProfile(null)
            console.log('Usuário Google desconectado.')
          }
        }
        
        authInstance.isSignedIn.listen(updateSigninStatus)
        updateSigninStatus(authInstance.isSignedIn.get())

      }).catch(err => {
        console.error("Erro ao inicializar o Google Client", err)
        setError("Falha ao inicializar a integração com o Google. Verifique se o Client ID é válido e a configuração no Google Cloud está correta.")
        setIsGoogleInitialized(true)
        setLoading(false)
      })
    }
    
    gapi.load('client:auth2', initClient)
  }, [googleClientId])

  const googleSignIn = useCallback(async () => {
    if (googleAuth) {
      try {
        // Força a seleção de conta e solicita novos tokens
        await googleAuth.signIn({
          prompt: 'select_account'
        })
        setError(null)
      } catch (err: any) {
        console.error("Erro ao fazer login com Google:", err)
        if (err.error === 'popup_closed_by_user') {
          setError("A janela de login do Google foi fechada antes da conclusão.")
        } else {
          setError("Ocorreu um erro ao tentar fazer login com o Google.")
        }
      }
    }
  }, [googleAuth])

  const googleSignOut = useCallback(async () => {
    if (googleAuth) {
      try {
        await googleAuth.signOut()
        setError(null)
      } catch (err) {
        console.error("Erro ao fazer logout do Google:", err)
        setError("Ocorreu um erro ao fazer logout do Google.")
      }
    }
  }, [googleAuth])

  const googleSwitchAccount = useCallback(async () => {
    if (googleAuth) {
      try {
        // Primeiro faz logout
        await googleAuth.signOut()
        // Depois faz login com prompt de seleção de conta
        await googleAuth.signIn({
          prompt: 'select_account'
        })
        setError(null)
      } catch (err: any) {
        console.error("Erro ao trocar conta do Google:", err)
        if (err.error === 'popup_closed_by_user') {
          setError("A janela de login do Google foi fechada antes da conclusão.")
        } else {
          setError("Ocorreu um erro ao tentar trocar a conta do Google.")
        }
      }
    }
  }, [googleAuth])

  return {
    loading,
    error,
    clearError: () => setError(null),
    isGoogleInitialized,
    isGoogleSignedIn,
    accessToken,
    googleProfile,
    googleSignIn,
    googleSignOut,
    googleSwitchAccount,
  }
}
