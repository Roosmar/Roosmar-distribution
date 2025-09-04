import { createClient } from '@supabase/supabase-js'
import { Database } from './types/supabase'

// Configuration Supabase avec variables d'environnement Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Vérification que les variables d'environnement sont définies
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Les variables d\'environnement VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY doivent être définies dans le fichier .env'
  )
}

// Création et export de l'instance Supabase
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Export des types utiles
export type { User, Session } from '@supabase/supabase-js'