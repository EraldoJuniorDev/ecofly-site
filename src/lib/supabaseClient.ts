// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

// === 1. USE VARIÁVEIS DE AMBIENTE ===
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// === 2. VALIDAÇÃO DE SEGURANÇA ===
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltando VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY no .env')
}

// === 3. CRIA CLIENTE COM HEADER CORRETO ===
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      Accept: 'application/json' // ELIMINA O 406!
    }
  }
})