
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
      await authInstance.signIn()
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
    } catch (error: any) {
      console.error('Erro no logout Google:', error)
      setAuthState(prev => ({
        ...prev,
        error: error.message || 'Erro no logout'
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
    clearError
  }
}
