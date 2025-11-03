// src/pages/RegisterPage.tsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff, UserPlus, Chrome } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { supabase } from '../../lib/supabaseClient'
import { toast } from 'sonner'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '', 
    confirmPassword: '', 
    username: '' 
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  // CRIA PERFIL AUTOMATICAMENTE AO REGISTRAR COM GOOGLE
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const user = session.user

          const displayName = 
            user.user_metadata.full_name || 
            user.user_metadata.name || 
            user.email?.split('@')[0] || 
            'Usuário'

          const profileData = {
            id: user.id,
            email: user.email!,
            display_name: displayName,
            avatar_url: user.user_metadata.picture || user.user_metadata.avatar_url || null,
            phone: user.user_metadata.phone || null,
            role: 'user' as const,
            birth_date: null as null | string,
            updated_at: new Date().toISOString(),
          }

          const { error } = await supabase
            .from('profiles')
            .upsert(profileData, { 
              onConflict: 'id', 
              ignoreDuplicates: false  // FORÇA ATUALIZAÇÃO
            })

          if (error) {
            console.error('Erro ao salvar perfil (Google):', error)
            toast.error('Erro ao salvar perfil')
          } else {
            toast.success('Registro com Google concluído!')
            navigate('/')
          }
        }
      }
    )

    return () => listener.subscription.unsubscribe()
  }, [navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.email.trim() || !formData.password.trim() || !formData.confirmPassword.trim() || !formData.username.trim()) {
      toast.error('Preencha todos os campos.')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem.')
      return
    }
    if (formData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    setIsSubmitting(true)
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { data: { display_name: formData.username } }
      })

      if (authError) throw authError

      if (authData.user) {
        const { error: dbError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            email: formData.email,
            display_name: formData.username,
            role: 'user',
            updated_at: new Date().toISOString(),
          }, { 
            onConflict: 'id', 
            ignoreDuplicates: false  // FORÇA ATUALIZAÇÃO
          })

        if (dbError) throw dbError
      }

      toast.success('Registro realizado! Verifique seu email.')
      navigate('/login')
    } catch (error: any) {
      toast.error(error.message || 'Falha no registro')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleRegister = async () => {
    setIsGoogleLoading(true)
    try {
      const baseUrl = import.meta.env.PROD 
        ? import.meta.env.VITE_APP_URL 
        : window.location.origin
      const redirectTo = `${baseUrl}/auth/callback`

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { 
          redirectTo,
          queryParams: { access_type: 'offline', prompt: 'consent' }
        }
      })
      if (error) throw error
    } catch (error: any) {
      toast.error(error.message || 'Falha ao registrar com Google')
      setIsGoogleLoading(false)
    }
  }

  const handleGoBack = () => navigate('/login')

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
              <UserPlus className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">
              Registrar
            </h1>
            <p className="text-gray-600 dark:text-slate-300 mt-2">
              Crie sua conta agora
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input
                  type="text"
                  placeholder="Seu nome"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  required
                />
              </div>

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

              <div className="space-y-2">
                <Label>Confirmar Senha</Label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white h-12"
              >
                {isSubmitting ? 'Registrando...' : 'Registrar'}
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
                onClick={handleGoogleRegister}
                disabled={isGoogleLoading}
                className="w-full h-12"
              >
                {isGoogleLoading ? (
                  <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Chrome className="h-5 w-5 mr-2" />
                    Registrar com Google
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}