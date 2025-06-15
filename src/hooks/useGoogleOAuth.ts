
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

      console.log('Carregando client:auth2...')
      await new Promise<void>((resolve) => {
        window.gapi.load('client:auth2', resolve)
      })

      console.log('Inicializando Google Auth2...')
      await window.gapi.auth2.init({
        clientId: GOOGLE_CLIENT_ID,
        scope: GOOGLE_SCOPES,
      })

      console.log('Inicializando Google API Client...')
      await window.gapi.client.init({
        discoveryDocs: [DISCOVERY_DOC],
      })
      
      console.log('Obtendo instância de auth...')
      const authInstance = window.gapi.auth2.getAuthInstance()
      
      if (!authInstance) {
        console.error('Falha ao obter instância de auth após inicialização correta.')
        throw new Error('Falha ao inicializar instância de autenticação Google')
      }

      console.log('Instância de auth obtida com sucesso!')
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
      const details = error.details ? `${error.details}` : ''
      const errorMessage = error.error || error.message || 'Erro desconhecido.'
      setAuthState(prev => ({
        ...prev,
        isInitialized: true,
        error: `Falha na API Google: ${errorMessage} ${details}`.trim()
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
      if (error.error === 'popup_closed_by_user') {
        console.log('Janela de login do Google fechada pelo usuário.')
        clearError() // Limpa erro anterior, se houver
        return
      }
      const details = error.details ? `${error.details}` : ''
      const errorMessage = error.error || error.message || 'Erro desconhecido.'
      setAuthState(prev => ({
        ...prev,
        error: `Erro de login: ${errorMessage} ${details}`.trim()
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
      const errorMessage = error.error || error.message || 'Erro desconhecido.'
      setAuthState(prev => ({
        ...prev,
        error: `Erro no logout: ${errorMessage}`
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
      const errorMessage = error.error || error.message || 'Erro desconhecido.'
      setAuthState(prev => ({
        ...prev,
        error: `Erro ao revogar acesso: ${errorMessage}`
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
      const errorMessage = error.error || error.message || 'Erro desconhecido.'
      setAuthState(prev => ({
        ...prev,
        error: `Erro ao trocar de conta: ${errorMessage}`
      }))
    }
  }

  const forceAccountSelection = async () => {
    try {
      console.log('Forçando seleção de conta com disconnect...')
      
      const authInstance = window.gapi.auth2.getAuthInstance()
      
      if (!authInstance) {
        throw new Error('Instância de autenticação não está disponível')
      }
      
      // Revoga o acesso se estiver conectado para forçar re-autenticação
      if (authInstance.isSignedIn.get()) {
        console.log('Revogando acesso da conta atual...')
        await authInstance.disconnect()
        
        // Aguarda para garantir que a desconexão foi processada
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      
      // Força nova autenticação com prompt de seleção de conta
      console.log('Iniciando nova autenticação...')
      await signIn(true)
      
    } catch (error: any) {
      console.error('Erro ao forçar seleção de conta:', error)
      const errorMessage = error.error || error.message || 'Erro desconhecido.'
      setAuthState(prev => ({
        ...prev,
        error: `Erro ao selecionar conta: ${errorMessage}`
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
