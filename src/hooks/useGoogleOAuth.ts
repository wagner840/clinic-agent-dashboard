
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

  const clearGoogleSession = async () => {
    try {
      // Limpa todos os cookies do Google
      const googleDomains = ['.google.com', '.googleapis.com', '.accounts.google.com']
      
      // Tenta limpar cookies via JavaScript (limitado por CORS)
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/") 
      })

      // Remove dados do localStorage relacionados ao Google
      Object.keys(localStorage).forEach(key => {
        if (key.includes('google') || key.includes('gapi') || key.includes('oauth')) {
          localStorage.removeItem(key)
        }
      })

      // Remove dados do sessionStorage
      Object.keys(sessionStorage).forEach(key => {
        if (key.includes('google') || key.includes('gapi') || key.includes('oauth')) {
          sessionStorage.removeItem(key)
        }
      })

      console.log('Sessão do Google limpa')
    } catch (error) {
      console.warn('Não foi possível limpar completamente a sessão:', error)
    }
  }

  const signIn = async (forceAccountSelection = false) => {
    try {
      if (!authState.isInitialized) {
        throw new Error('Google API não foi inicializada')
      }

      const authInstance = window.gapi.auth2.getAuthInstance()
      
      if (forceAccountSelection) {
        console.log('Forçando seleção de conta - limpando sessão...')
        
        // 1. Desconecta completamente se estiver logado
        if (authInstance.isSignedIn.get()) {
          await authInstance.disconnect()
          console.log('Desconectado do Google')
        }
        
        // 2. Limpa a sessão local
        await clearGoogleSession()
        
        // 3. Aguarda para garantir que a limpeza foi processada
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // 4. Abre uma nova janela diretamente para accounts.google.com para forçar seleção
        const authUrl = `https://accounts.google.com/oauth/v2/auth?` +
          `client_id=${GOOGLE_CLIENT_ID}&` +
          `response_type=code&` +
          `scope=${encodeURIComponent(GOOGLE_SCOPES)}&` +
          `redirect_uri=${encodeURIComponent(window.location.origin)}&` +
          `prompt=select_account consent&` +
          `access_type=offline&` +
          `include_granted_scopes=true`
        
        console.log('Abrindo tela de seleção de conta...')
        
        // Abre popup com URL customizada
        const popup = window.open(
          authUrl,
          'google-auth',
          'width=500,height=600,scrollbars=yes,resizable=yes'
        )
        
        if (!popup) {
          throw new Error('Popup foi bloqueado pelo navegador')
        }
        
        // Monitora o popup
        return new Promise((resolve, reject) => {
          const checkClosed = setInterval(() => {
            if (popup.closed) {
              clearInterval(checkClosed)
              // Após o popup fechar, tenta fazer o login normal
              setTimeout(async () => {
                try {
                  await authInstance.signIn({
                    prompt: 'none' // Não mostra prompt pois já foi selecionado
                  })
                  resolve(true)
                } catch (error) {
                  reject(error)
                }
              }, 1000)
            }
          }, 1000)
          
          // Timeout de 5 minutos
          setTimeout(() => {
            clearInterval(checkClosed)
            if (!popup.closed) {
              popup.close()
            }
            reject(new Error('Timeout na autenticação'))
          }, 300000)
        })
      } else {
        // Login normal
        console.log('Iniciando login normal...')
        await authInstance.signIn({
          prompt: 'select_account consent',
          include_granted_scopes: true
        })
      }
      
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
      
      // Limpa sessão local
      await clearGoogleSession()
      
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
      console.log('Iniciando troca de conta com limpeza completa...')
      
      // Usa o signIn com força de seleção de conta
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
    await signIn(true)
  }

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }))
  }

  return {
    ...authState,
    signIn: () => signIn(false),
    signOut,
    disconnect,
    switchAccount,
    forceAccountSelection,
    clearError
  }
}
