import { createContext, useContext, useEffect, useState } from 'react'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from '../types/supabase'

interface SupabaseContextValue {
  supabase: SupabaseClient<Database> | null
  connected: boolean
}

const SupabaseContext = createContext<SupabaseContextValue>({
  supabase: null,
  connected: false
})

export const useSupabase = () => {
  const context = useContext(SupabaseContext)
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}

interface SupabaseProviderProps {
  children: React.ReactNode
}

export const SupabaseProvider: React.FC<SupabaseProviderProps> = ({ children }) => {
  const [supabase, setSupabase] = useState<SupabaseClient<Database> | null>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    // Check if Supabase is configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http')) {
      const client = createClient<Database>(supabaseUrl, supabaseAnonKey)
      setSupabase(client)
      setConnected(true)
    } else {
      // Mock mode for development without Supabase
      if (supabaseUrl && !supabaseUrl.startsWith('http')) {
        console.warn('VITE_SUPABASE_URL doit être une URL valide (ex: https://your-project.supabase.co)')
      }
      console.log('Supabase non configuré - mode développement local')
    }
  }, [])

  const value: SupabaseContextValue = {
    supabase,
    connected
  }

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  )
}