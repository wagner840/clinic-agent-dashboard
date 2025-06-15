import { useState, useEffect, useCallback } from 'react'
import { gapi } from 'gapi-script'
import { supabase } from '@/integrations/supabase/client'
import { GOOGLE_CALENDAR_SCOPES } from '@/lib/google'

// Chaves para localStorage
const GOOGLE_AUTH_STORAGE_KEY = 'google_auth_state'
const GOOGLE_USER_STORAGE_KEY = 'google_user_profile'

interface StoredAuthState {
  isSignedIn: boolean
  accessToken: string | null
  userProfile: {
    email: string
    name: string
    imageUrl: string
  } | null
  timestamp: number
}

export function useGoogleAuth() {
  const [googleAuth, setGoogleAuth] = useState<gapi.auth2.GoogleAuth | null>(null)
  const [isGoogleInitialized, setIsGoogleInitialized] = useState(false)
  const [isGoogleSignedIn, setIsGoogleSignedIn] = useState(false)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [googleProfile, setGoogleProfile] = useState<gapi.auth2.BasicProfile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [googleClientId, setGoogleClientId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Função para salvar estado no localStorage
  const saveAuthState = useCallback((
    signedIn: boolean, 
    token: string | null, 
    profile: gapi.auth2.BasicProfile | null
  ) => {
    try {
      const authState: StoredAuthState = {
        isSignedIn: signedIn,
        accessToken: token,
        userProfile: profile ? {
          email: profile.getEmail(),
          name: profile.getName(),
          imageUrl: profile.getImageUrl()
        } : null,
        timestamp: Date.now()
      }
      localStorage.setItem(GOOGLE_AUTH_STORAGE_KEY, JSON.stringify(authState))
      console.log('✅ Estado do Google Auth salvo no localStorage')
    } catch (error) {
      console.warn('⚠️ Erro ao salvar estado no localStorage:', error)
    }
  }, [])

  // Função para carregar estado do localStorage
  const loadSavedAuthState = useCallback(() => {
    try {
      const saved = localStorage.getItem(GOOGLE_AUTH_STORAGE_KEY)
      if (saved) {
        const authState: StoredAuthState = JSON.parse(saved)
        const isExpired = Date.now() - authState.timestamp > 24 * 60 * 60 * 1000 // 24 horas
        
        if (!isExpired && authState.isSignedIn) {
          console.log('📱 Estado do Google Auth carregado do localStorage')
          return authState
        } else {
          // Remove estado expirado
          localStorage.removeItem(GOOGLE_AUTH_STORAGE_KEY)
          console.log('🗑️ Estado expirado removido do localStorage')
        }
      }
    } catch (error) {
      console.warn('⚠️ Erro ao carregar estado do localStorage:', error)
      localStorage.removeItem(GOOGLE_AUTH_STORAGE_KEY)
    }
    return null
  }, [])

  // Função para limpar estado salvo
  const clearSavedAuthState = useCallback(() => {
    try {
      localStorage.removeItem(GOOGLE_AUTH_STORAGE_KEY)
      localStorage.removeItem(GOOGLE_USER_STORAGE_KEY)
      console.log('🧹 Estado do Google Auth limpo do localStorage')
    } catch (error) {
      console.warn('⚠️ Erro ao limpar localStorage:', error)
    }
  }, [])

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

    // Carrega estado salvo antes de inicializar
    const savedState = loadSavedAuthState()

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
            const profile = currentGoogleUser.getBasicProfile()
            
            setAccessToken(authResponse.access_token)
            setGoogleProfile(profile)
            
            // Salva o estado atual
            saveAuthState(true, authResponse.access_token, profile)
            
            console.log('✅ Usuário Google conectado e estado salvo.')
          } else {
            setAccessToken(null)
            setGoogleProfile(null)
            
            // Limpa estado salvo
            clearSavedAuthState()
            
            console.log('❌ Usuário Google desconectado e estado limpo.')
          }
        }
        
        // Se temos estado salvo e o Google diz que está logado, restaura
        if (savedState && authInstance.isSignedIn.get()) {
          console.log('🔄 Restaurando sessão do Google...')
          updateSigninStatus(true)
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
  }, [googleClientId, loadSavedAuthState, saveAuthState, clearSavedAuthState])

  const googleSignIn = useCallback(async () => {
    if (googleAuth) {
      try {
        // Força a seleção de conta e solicita novos tokens
        const user = await googleAuth.signIn({
          prompt: 'select_account'
        })
        
        // Salva imediatamente após o login bem-sucedido
        const authResponse = user.getAuthResponse(true)
        const profile = user.getBasicProfile()
        saveAuthState(true, authResponse.access_token, profile)
        
        setError(null)
        console.log('✅ Login realizado e estado persistido.')
      } catch (err: any) {
        console.error("Erro ao fazer login com Google:", err)
        if (err.error === 'popup_closed_by_user') {
          setError("A janela de login do Google foi fechada antes da conclusão.")
        } else {
          setError("Ocorreu um erro ao tentar fazer login com o Google.")
        }
      }
    }
  }, [googleAuth, saveAuthState])

  const googleSignOut = useCallback(async () => {
    if (googleAuth) {
      try {
        await googleAuth.signOut()
        clearSavedAuthState()
        setError(null)
        console.log('✅ Logout realizado e estado limpo.')
      } catch (err) {
        console.error("Erro ao fazer logout do Google:", err)
        setError("Ocorreu um erro ao fazer logout do Google.")
      }
    }
  }, [googleAuth, clearSavedAuthState])

  const googleSwitchAccount = useCallback(async () => {
    if (googleAuth) {
      try {
        // Primeiro faz logout e limpa estado
        await googleAuth.signOut()
        clearSavedAuthState()
        
        // Depois faz login com prompt de seleção de conta
        const user = await googleAuth.signIn({
          prompt: 'select_account'
        })
        
        // Salva o novo estado
        const authResponse = user.getAuthResponse(true)
        const profile = user.getBasicProfile()
        saveAuthState(true, authResponse.access_token, profile)
        
        setError(null)
        console.log('✅ Troca de conta realizada e estado atualizado.')
      } catch (err: any) {
        console.error("Erro ao trocar conta do Google:", err)
        if (err.error === 'popup_closed_by_user') {
          setError("A janela de login do Google foi fechada antes da conclusão.")
        } else {
          setError("Ocorreu um erro ao tentar trocar a conta do Google.")
        }
      }
    }
  }, [googleAuth, saveAuthState, clearSavedAuthState])

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
