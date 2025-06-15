
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
      console.log('🔍 Buscando Google Client ID da função do Supabase...')
      
      const { data, error: invokeError } = await supabase.functions.invoke('get-google-client-id')
      
      if (invokeError) {
        console.error('❌ Erro ao buscar Google Client ID:', invokeError.message)
        setError('Falha ao buscar a configuração do Google (Client ID). Verifique se a função "get-google-client-id" está implantada corretamente no Supabase.')
        setLoading(false)
        return
      }

      if (data && data.clientId) {
        console.log('✅ Google Client ID buscado com sucesso:', data.clientId.substring(0, 20) + '...')
        setGoogleClientId(data.clientId)
      } else {
        console.error('❌ Google Client ID não retornado pela função:', data)
        setError('A configuração do Google está incompleta. O Client ID está ausente nos segredos do Supabase.')
        setLoading(false)
      }
    }

    fetchGoogleClientId()
  }, [])

  useEffect(() => {
    if (!googleClientId) {
      console.log('⏳ Aguardando Google Client ID para inicializar o GAPI...')
      return
    }

    console.log('🚀 Iniciando inicialização do Google GAPI com Client ID...')

    const initClient = async () => {
      try {
        console.log('📦 Carregando GAPI client...')
        
        await new Promise<void>((resolve, reject) => {
          if (window.gapi && window.gapi.client) {
            console.log('✅ GAPI já está carregado')
            resolve()
          } else {
            gapi.load('client:auth2', {
              callback: () => {
                console.log('✅ GAPI carregado com sucesso')
                resolve()
              },
              onerror: () => {
                console.error('❌ Erro ao carregar GAPI')
                reject(new Error('Falha ao carregar GAPI'))
              }
            })
          }
        })

        console.log('⚙️ Inicializando Google Client...')
        await window.gapi.client.init({
          clientId: googleClientId,
          scope: GOOGLE_CALENDAR_SCOPES,
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest']
        })

        console.log('🔐 Obtendo instância de autenticação...')
        const authInstance = window.gapi.auth2.getAuthInstance()
        if (!authInstance) {
          throw new Error('Falha ao obter instância de autenticação')
        }

        setGoogleAuth(authInstance)
        setIsGoogleInitialized(true)
        console.log('✅ Google Auth inicializado com sucesso!')

        // Função para atualizar status de login
        const updateSigninStatus = (signedIn: boolean) => {
          console.log('🔄 Atualizando status de login:', signedIn)
          setIsGoogleSignedIn(signedIn)
          
          if (signedIn) {
            const currentGoogleUser = authInstance.currentUser.get()
            const authResponse = currentGoogleUser.getAuthResponse(true)
            const profile = currentGoogleUser.getBasicProfile()
            
            console.log('👤 Usuário Google logado:', profile.getEmail())
            setAccessToken(authResponse.access_token)
            setGoogleProfile(profile)
            saveAuthState(true, authResponse.access_token, profile)
          } else {
            console.log('👤 Usuário Google deslogado')
            setAccessToken(null)
            setGoogleProfile(null)
            clearSavedAuthState()
          }
        }

        // Configurar listener para mudanças de status
        authInstance.isSignedIn.listen(updateSigninStatus)
        
        // Verificar status atual
        const currentlySignedIn = authInstance.isSignedIn.get()
        console.log('📊 Status atual de login:', currentlySignedIn)
        
        // Se há estado salvo e o Google confirma que está logado, use o status do Google
        const savedState = loadSavedAuthState()
        if (savedState && currentlySignedIn) {
          console.log('🔄 Restaurando sessão do Google a partir do estado salvo')
          updateSigninStatus(true)
        } else {
          updateSigninStatus(currentlySignedIn)
        }

        setLoading(false)

      } catch (err: any) {
        console.error("❌ Erro ao inicializar o Google Client:", err)
        setError(`Falha ao inicializar a integração com o Google: ${err.message}`)
        setLoading(false)
      }
    }
    
    initClient()
  }, [googleClientId, loadSavedAuthState, saveAuthState, clearSavedAuthState])

  const googleSignIn = useCallback(async () => {
    if (!googleAuth) {
      console.error('❌ Google Auth não inicializado')
      setError('Google Auth não está inicializado. Aguarde a inicialização.')
      return
    }

    try {
      console.log('🔐 Iniciando processo de login...')
      const user = await googleAuth.signIn({
        prompt: 'select_account'
      })
      
      const authResponse = user.getAuthResponse(true)
      const profile = user.getBasicProfile()
      console.log('✅ Login realizado com sucesso para:', profile.getEmail())
      
      saveAuthState(true, authResponse.access_token, profile)
      setError(null)
    } catch (err: any) {
      console.error("❌ Erro ao fazer login com Google:", err)
      if (err.error === 'popup_closed_by_user') {
        setError("A janela de login do Google foi fechada antes da conclusão.")
      } else {
        setError(`Erro ao tentar fazer login com o Google: ${err.error || err.message}`)
      }
    }
  }, [googleAuth, saveAuthState])

  const googleSignOut = useCallback(async () => {
    if (!googleAuth) {
      console.error('❌ Google Auth não inicializado')
      return
    }

    try {
      console.log('🚪 Fazendo logout...')
      await googleAuth.signOut()
      clearSavedAuthState()
      setError(null)
      console.log('✅ Logout realizado com sucesso')
    } catch (err: any) {
      console.error("❌ Erro ao fazer logout do Google:", err)
      setError(`Erro ao fazer logout do Google: ${err.message}`)
    }
  }, [googleAuth, clearSavedAuthState])

  const googleSwitchAccount = useCallback(async () => {
    if (!googleAuth) {
      console.error('❌ Google Auth não inicializado')
      return
    }

    try {
      console.log('🔄 Trocando conta...')
      await googleAuth.signOut()
      clearSavedAuthState()
      
      const user = await googleAuth.signIn({
        prompt: 'select_account'
      })
      
      const authResponse = user.getAuthResponse(true)
      const profile = user.getBasicProfile()
      console.log('✅ Troca de conta realizada para:', profile.getEmail())
      
      saveAuthState(true, authResponse.access_token, profile)
      setError(null)
    } catch (err: any) {
      console.error("❌ Erro ao trocar conta do Google:", err)
      if (err.error === 'popup_closed_by_user') {
        setError("A janela de login do Google foi fechada antes da conclusão.")
      } else {
        setError(`Erro ao trocar conta do Google: ${err.error || err.message}`)
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
