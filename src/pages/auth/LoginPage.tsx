// src/pages/auth/LoginPage.tsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Lock, Eye, EyeOff, LogIn, UserPlus, Chrome } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { supabase } from '../../lib/supabaseClient'
import { toast } from 'sonner'

export default function LoginPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  // FUNÇÃO PARA CRIAR/ATUALIZAR PERFIL (USADA NO GOOGLE)
  const createOrUpdateProfile = async (user: any) => {
    const displayName =
      user.user_metadata.full_name ||
      user.user_metadata.name ||
      user.email?.split('@')[0] ||
      'Usuário'

    const { error } = await supabase
      .from('profiles')
      .upsert(
        {
          id: user.id,
          email: user.email!,
          display_name: displayName,
          avatar_url: user.user_metadata.picture || user.user_metadata.avatar_url || null,
          phone: user.user_metadata.phone || null,
          role: 'user',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id', ignoreDuplicates: false }
      )

    if (error) {
      console.error('Erro ao criar/atualizar perfil:', error)
      toast.error('Erro ao salvar perfil')
    } else {
      toast.success('Login com Google concluído!')
      navigate('/')
    }
  }

  // DETECTA LOGIN COM GOOGLE E CRIA PERFIL
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await createOrUpdateProfile(session.user)
        }
      }
    )

    return () => listener.subscription.unsubscribe()
  }, [navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.email.trim() || !formData.password.trim()) {
      toast.error('Preencha todos os campos.')
      return
    }

    setIsSubmitting(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })
      if (error) throw error
      toast.success('Login realizado com sucesso!')
      navigate('/')
    } catch (error: any) {
      toast.error(error.message || 'Falha no login')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    try {
      const redirectTo = `${import.meta.env.PROD ? import.meta.env.VITE_APP_URL : location.origin}/auth/callback`

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo }
      })
      if (error) throw error
    } catch (error: any) {
      toast.error(error.message || 'Falha ao conectar com Google')
      setIsGoogleLoading(false)
    }
  }

  const handleGoBack = () => navigate('/')
  const handleRegister = () => navigate('/register')

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <Button variant="ghost" onClick={handleGoBack}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Button>
        </div>

        <Card className="shadow-2xl">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center mb-6">
              <LogIn className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">
              Login
            </h1>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Senha</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white h-12"
              >
                {isSubmitting ? 'Entrando...' : 'Entrar'}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">ou</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading}
                className="w-full h-12"
              >
                {isGoogleLoading ? (
                  <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Chrome className="h-5 w-5 mr-2" />
                    Continuar com Google
                  </>
                )}
              </Button>

              <div className="text-center mt-6">
                <p className="text-sm">Não tem conta?</p>
                <Button variant="link" onClick={handleRegister} className="text-emerald-500">
                  <UserPlus className="h-4 w-4 mr-1" />
                  Crie uma agora
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}