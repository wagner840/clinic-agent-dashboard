
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
      if (!window.gapi) {
        await loadGapiScript()
      }

      await new Promise<void>((resolve) => {
        window.gapi.load('auth2', resolve)
      })

      await window.gapi.client.init({
        clientId: GOOGLE_CLIENT_ID,
        scope: GOOGLE_SCOPES,
        discoveryDocs: [DISCOVERY_DOC]
      })

      const authInstance = window.gapi.auth2.getAuthInstance()
      const isSignedIn = authInstance.isSignedIn.get()
      
      setAuthState(prev => ({
        ...prev,
        isInitialized: true,
        isSignedIn,
        accessToken: isSignedIn ? authInstance.currentUser.get().getAuthResponse().access_token : null
      }))

      // Escuta mudanças no estado de autenticação
      authInstance.isSignedIn.listen((signedIn: boolean) => {
        setAuthState(prev => ({
          ...prev,
          isSignedIn: signedIn,
          accessToken: signedIn ? authInstance.currentUser.get().getAuthResponse().access_token : null
        }))
      })

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

  const signIn = async () => {
    try {
      if (!authState.isInitialized) {
        throw new Error('Google API não foi inicializada')
      }

      const authInstance = window.gapi.auth2.getAuthInstance()
      
      // Se já estiver logado, desconecta primeiro para forçar seleção de conta
      if (authInstance.isSignedIn.get()) {
        console.log('Desconectando conta atual para permitir seleção...')
        await authInstance.signOut()
        // Pequena pausa para garantir que a desconexão foi processada
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      // Tenta fazer login com seleção forçada de conta
      console.log('Iniciando processo de seleção de conta...')
      await authInstance.signIn({
        prompt: 'select_account consent',
        include_granted_scopes: true
      })
      
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
      if (!authState.isInitialized) return

      const authInstance = window.gapi.auth2.getAuthInstance()
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
      if (!authState.isInitialized) return

      const authInstance = window.gapi.auth2.getAuthInstance()
      
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
      
      // Desconecta completamente primeiro
      await disconnect()
      
      // Aguarda um pouco para garantir que a desconexão foi processada
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Tenta novo login com seleção de conta
      await signIn()
      
    } catch (error: any) {
      console.error('Erro ao trocar conta:', error)
      setAuthState(prev => ({
        ...prev,
        error: error.message || 'Erro ao trocar conta'
      }))
    }
  }

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }))
  }

  return {
    ...authState,
    signIn,
    signOut,
    disconnect,
    switchAccount,
    clearError
  }
}
