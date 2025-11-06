// src/pages/auth/AuthCallback.tsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        toast.error('Erro ao autenticar')
        navigate('/login')
        return
      }

      if (session) {
        toast.success('Login com Google concluído!')
        navigate('/')
      } else {
        navigate('/login')
      }
    }

    handleAuth()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-lg font-medium">Finalizando login...</p>
      </div>
    </div>
  )
}