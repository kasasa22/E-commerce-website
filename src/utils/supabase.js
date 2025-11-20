import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY || 'placeholder-key'
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client for server-side operations (requires service role key)
// Note: In production, this should be done via Supabase Edge Functions
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

export const isSupabaseConfigured = () => {
  return !!(import.meta.env.SUPABASE_URL && import.meta.env.SUPABASE_ANON_KEY)
}

export const getAppName = () => {
  return import.meta.env.VITE_APP_NAME || 'E-commerce System'
}

export const getDefaultCurrency = () => {
  return import.meta.env.VITE_DEFAULT_CURRENCY || 'UGX'
}

