
import { useState, useEffect } from 'react'

const GOOGLE_CLIENT_ID = '334488532936-0s8r9hp9l50cr5u34vk4ujk2v6ujm6v0.apps.googleusercontent.com'
const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events'
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'

interface GoogleAuthState {
  isSignedIn: boolean
  isInitialized: boolean
  accessToken: string | null
  error: string | null
}

export function useGoogleOAuth() {
  const [authState, setAuthState] = useState<GoogleAuthState>({
    isSignedIn: false,
    isInitialized: false,
    accessToken: null,
    error: null
  })

  useEffect(() => {
    initializeGapi()
  }, [])

  const initializeGapi = async () => {
    try {
      console.log('Iniciando inicialização do Google API...')
      
      if (!window.gapi) {
        console.log('Carregando script do Google API...')
        await loadGapiScript()
      }

      console.log('Carregando auth2...')
      await new Promise<void>((resolve) => {
        window.gapi.load('auth2', resolve)
      })

      console.log('Inicializando cliente Google...')
      await window.gapi.client.init({
        clientId: GOOGLE_CLIENT_ID,
        scope: GOOGLE_SCOPES,
        discoveryDocs: [DISCOVERY_DOC]
      })

      console.log('Obtendo instância de auth...')
      const authInstance = window.gapi.auth2.getAuthInstance()
      
      if (!authInstance) {
        console.error('Falha ao obter instância de auth')
        throw new Error('Falha ao inicializar instância de autenticação Google')
      }

      console.log('Instância de auth obtida com sucesso')
      const isSignedIn = authInstance.isSignedIn.get()
      
      setAuthState(prev => ({
        ...prev,
        isInitialized: true,
        isSignedIn,
        accessToken: isSignedIn ? authInstance.currentUser.get().getAuthResponse().access_token : null
      }))

      // Escuta mudanças no estado de autenticação
      authInstance.isSignedIn.listen((signedIn: boolean) => {
        console.log('Estado de autenticação mudou:', signedIn)
        setAuthState(prev => ({
          ...prev,
          isSignedIn: signedIn,
          accessToken: signedIn ? authInstance.currentUser.get().getAuthResponse().access_token : null
        }))
      })

      console.log('Inicialização do Google API concluída com sucesso')

    } catch (error: any) {
      console.error('Erro ao inicializar Google API:', error)
      setAuthState(prev => ({
        ...prev,
        isInitialized: true,
        error: error.message || 'Erro ao inicializar Google API'
      }))
    }
  }

  const loadGapiScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://apis.google.com/js/api.js'
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Falha ao carregar Google API'))
      document.head.appendChild(script)
    })
  }

  const signIn = async (forceAccountSelection = false) => {
    try {
      console.log('Tentando fazer login...', { forceAccountSelection })
      
      if (!authState.isInitialized) {
        throw new Error('Google API não foi inicializada')
      }

      const authInstance = window.gapi.auth2.getAuthInstance()
      
      if (!authInstance) {
        throw new Error('Instância de autenticação não está disponível')
      }
      
      const signInOptions: any = {
        include_granted_scopes: true
      }

      if (forceAccountSelection) {
        signInOptions.prompt = 'select_account'
      }
      
      console.log('Iniciando login com opções:', signInOptions)
      const user = await authInstance.signIn(signInOptions)
      console.log('Login realizado com sucesso:', user.getBasicProfile().getEmail())
      
    } catch (error: any) {
      console.error('Erro no login Google:', error)
      setAuthState(prev => ({
        ...prev,
        error: error.message || 'Erro no login'
      }))
    }
  }

  const signOut = async () => {
    try {
      console.log('Tentando fazer logout...')
      
      if (!authState.isInitialized) return

      const authInstance = window.gapi.auth2.getAuthInstance()
      
      if (!authInstance) {
        console.warn('Instância de autenticação não encontrada para logout')
        return
      }
      
      await authInstance.signOut()
      console.log('Usuário desconectado com sucesso')
    } catch (error: any) {
      console.error('Erro no logout Google:', error)
      setAuthState(prev => ({
        ...prev,
        error: error.message || 'Erro no logout'
      }))
    }
  }

  const disconnect = async () => {
    try {
      console.log('Tentando desconectar...')
      
      if (!authState.isInitialized) return

      const authInstance = window.gapi.auth2.getAuthInstance()
      
      if (!authInstance) {
        console.warn('Instância de autenticação não encontrada para desconexão')
        return
      }
      
      // Revoga completamente o acesso
      if (authInstance.isSignedIn.get()) {
        await authInstance.disconnect()
        console.log('Acesso revogado completamente')
      }
      
      // Limpar o estado após desconectar
      setAuthState(prev => ({
        ...prev,
        isSignedIn: false,
        accessToken: null
      }))
    } catch (error: any) {
      console.error('Erro ao desconectar Google:', error)
      setAuthState(prev => ({
        ...prev,
        error: error.message || 'Erro ao desconectar'
      }))
    }
  }

  const switchAccount = async () => {
    try {
      console.log('Iniciando troca de conta...')
      
      // Força uma nova seleção de conta com opções mais agressivas
      await signIn(true)
      
    } catch (error: any) {
      console.error('Erro ao trocar conta:', error)
      setAuthState(prev => ({
        ...prev,
        error: error.message || 'Erro ao trocar conta'
      }))
    }
  }

  const forceAccountSelection = async () => {
    try {
      console.log('Forçando seleção de conta...')
      
      const authInstance = window.gapi.auth2.getAuthInstance()
      
      if (!authInstance) {
        throw new Error('Instância de autenticação não está disponível')
      }
      
      // Primeiro, desconecta se estiver conectado
      if (authInstance.isSignedIn.get()) {
        console.log('Desconectando conta atual...')
        await authInstance.signOut()
        
        // Aguarda para garantir que a desconexão foi processada
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      
      // Força nova autenticação com prompt de seleção
      console.log('Iniciando nova autenticação...')
      await signIn(true)
      
    } catch (error: any) {
      console.error('Erro ao forçar seleção de conta:', error)
      setAuthState(prev => ({
        ...prev,
        error: error.message || 'Erro ao forçar seleção de conta'
      }))
    }
  }

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }))
  }

  const getCurrentUser = () => {
    if (!authState.isInitialized || !authState.isSignedIn) return null
    
    const authInstance = window.gapi.auth2.getAuthInstance()
    
    if (!authInstance) return null
    
    const user = authInstance.currentUser.get()
    const profile = user.getBasicProfile()
    
    return {
      email: profile.getEmail(),
      name: profile.getName(),
      imageUrl: profile.getImageUrl()
    }
  }

  return {
    ...authState,
    signIn: () => signIn(false),
    signOut,
    disconnect,
    switchAccount,
    forceAccountSelection,
    clearError,
    getCurrentUser
  }
}
