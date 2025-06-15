
import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { cleanupAuthState } from '@/lib/authUtils'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  signInWithGoogle: (options?: { switchAccount?: boolean }) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', {
        hasSession: !!session,
        provider: session?.app_metadata?.provider,
        hasProviderToken: !!session?.provider_token,
        userEmail: session?.user?.email
      })
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state change:', {
        event: _event,
        hasSession: !!session,
        provider: session?.app_metadata?.provider,
        hasProviderToken: !!session?.provider_token,
        userEmail: session?.user?.email
      })
      setSession(session)
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    cleanupAuthState();
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (err) {
      console.warn('Pre-signin global signout failed. This is expected if no user was logged in.', err);
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signOut = async () => {
    cleanupAuthState();
    const { error } = await supabase.auth.signOut({ scope: 'global' })
    if (error) {
      console.error('Error signing out:', error)
      // We don't throw an error because the local state is cleared anyway.
    }
  }

  const signInWithGoogle = async (options?: { switchAccount?: boolean }) => {
    console.log('signInWithGoogle called with options:', options)
    
    cleanupAuthState();
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (err) {
      console.warn('Pre-Google-signin global signout failed. This is expected if no user was logged in.', err);
    }

    console.log('Attempting Google OAuth with Supabase...')
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events',
        queryParams: {
          access_type: 'offline',
          prompt: options?.switchAccount ? 'consent select_account' : 'consent',
        },
        redirectTo: `${window.location.origin}`,
      },
    })
    
    if (error) {
      console.error('Error signing in with Google:', error)
      throw error
    }
    
    console.log('Google OAuth redirect initiated successfully')
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signOut, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
