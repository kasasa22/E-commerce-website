import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const isSupabaseConfigured = () => {
  return !!(import.meta.env.SUPABASE_URL && import.meta.env.SUPABASE_ANON_KEY)
}

export const getAppName = () => {
  return import.meta.env.VITE_APP_NAME || 'E-commerce System'
}

export const getDefaultCurrency = () => {
  return import.meta.env.VITE_DEFAULT_CURRENCY || 'UGX'
}

