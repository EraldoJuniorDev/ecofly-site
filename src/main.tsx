// src/main.tsx
import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'

console.log('ECOFLY - Aplicação iniciando...')

// === ESTADO GLOBAL DE AUTENTICAÇÃO ===
let authInitialized = false
let currentSession: any = null

// Função para notificar TODAS as páginas que o auth mudou
const notifyAuthChange = () => {
  window.dispatchEvent(new Event('supabase-auth-change'))
}

// Componente raiz com listener global
function Root() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Carrega sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      currentSession = session
      authInitialized = true
      setLoading(false)
      notifyAuthChange()
    }).catch(err => {
      console.error('Erro ao carregar sessão inicial:', err)
      authInitialized = true
      setLoading(false)
      notifyAuthChange()
    })

    // 2. Escuta TODAS as mudanças de autenticação
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event, session?.user?.email || 'anônimo')

      currentSession = session
      authInitialized = true
      setLoading(false)
      notifyAuthChange()

      // Feedback visual
      if (event === 'SIGNED_IN') {
        toast.success('Login realizado com sucesso!')
      }
      if (event === 'SIGNED_OUT') {
        toast.success('Você saiu da conta.')
      }
      if (event === 'TOKEN_REFRESHED') {
        console.log('Token renovado automaticamente')
      }
    })

    // Cleanup
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Tela de carregamento global
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-foreground">Carregando ECOFLY...</p>
        </div>
      </div>
    )
  }

  return <App />
}

// Renderização
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
)

console.log('ECOFLY - Aplicação carregada com sucesso!')