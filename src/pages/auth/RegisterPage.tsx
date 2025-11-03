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
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '', username: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  // Escuta registro OAuth e sincroniza perfil
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await syncProfileWithGoogle(session.user)
          toast.success('Registro com Google realizado com sucesso!')
          navigate('/')
        }
      }
    )

    return () => listener.subscription.unsubscribe()
  }, [navigate])

  const syncProfileWithGoogle = async (user: any) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          display_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
          role: 'user'
        }, { onConflict: 'id' })

      if (error && error.code !== '23505') {
        console.error('Erro ao sincronizar perfil:', error)
      }
    } catch (err) {
      console.error('Erro ao sincronizar perfil:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.email.trim() || !formData.password.trim() || !formData.confirmPassword.trim() || !formData.username.trim()) {
      toast.error('Por favor, preencha todos os campos.')
      return
    }
    if (!formData.email.includes('@')) {
      toast.error('Por favor, insira um email válido.')
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
    if (formData.username.length < 3) {
      toast.error('O nome de usuário deve ter pelo menos 3 caracteres.')
      return
    }

    setIsSubmitting(true)
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { display_name: formData.username }
        }
      })

      if (authError) throw authError

      if (authData.user) {
        const { error: dbError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            email: formData.email,
            display_name: formData.username,
            role: 'user'
          }, { onConflict: 'id' })

        if (dbError) {
          await supabase.auth.admin.deleteUser(authData.user.id)
          throw dbError
        }
      }

      toast.success('Registro realizado com sucesso! Verifique seu email para confirmar.')
      navigate('/login')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleRegister = async () => {
    setIsGoogleLoading(true)
    try {
      // Detecta automaticamente o ambiente
      const isProduction = import.meta.env.PROD
      const baseUrl = isProduction
        ? import.meta.env.VITE_APP_URL  // Vercel: https://ecofly-site.vercel.app
        : window.location.origin        // Local: localhost ou IP

      const redirectTo = `${baseUrl}/auth/callback`

      console.log('Google OAuth (Register) → redirectTo:', redirectTo) // Debug no F12

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo }
      })

      if (error) throw error
    } catch (error: any) {
      console.error('Erro no Google OAuth (registro):', error)
      toast.error(error.message || 'Falha ao registrar com Google')
      setIsGoogleLoading(false)
    }
  }

  const handleGoBack = () => navigate('/login')

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-background flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-500">
      <div className="w-full max-w-md relative z-10 animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <Button
            variant="ghost"
            onClick={handleGoBack}
            className="text-emerald-500 dark:text-emerald-400 hover:text-emerald-400 dark:hover:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-700/30 transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>

        <Card className="bg-white dark:bg-background border border-gray-200 dark:border-white/10 shadow-2xl animate-slide-up transition-colors duration-500">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg animate-pulse-glow">
              <UserPlus className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent pb-1">
              Registrar
            </h1>
            <p className="text-gray-700 dark:text-slate-200 mt-2 transition-colors duration-500">
              Crie uma conta para acessar o sistema
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-700 dark:text-slate-200 font-medium flex items-center space-x-2 transition-colors duration-500">
                  <User className="h-4 w-4 text-emerald-500" />
                  <span>Nome de Usuário</span>
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Digite seu nome de usuário"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 dark:text-slate-200 font-medium flex items-center space-x-2 transition-colors duration-500">
                  <Mail className="h-4 w-4 text-emerald-500" />
                  <span>Email</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Digite seu email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 dark:text-slate-200 font-medium flex items-center space-x-2 transition-colors duration-500">
                  <Lock className="h-4 w-4 text-emerald-500" />
                  <span>Senha</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Digite sua senha"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 text-gray-500 dark:text-slate-300 hover:text-gray-700 dark:hover:text-slate-100 hover:bg-gray-200 dark:hover:bg-slate-700/50 transition-colors duration-500"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700 dark:text-slate-200 font-medium flex items-center space-x-2 transition-colors duration-500">
                  <Lock className="h-4 w-4 text-emerald-500" />
                  <span>Confirmar Senha</span>
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirme sua senha"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 text-gray-500 dark:text-slate-300 hover:text-gray-700 dark:hover:text-slate-100 hover:bg-gray-200 dark:hover:bg-slate-700/50 transition-colors duration-500"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none h-12 text-base font-medium"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <span>Registrando...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <UserPlus className="h-5 w-5" />
                    <span>Registrar</span>
                  </div>
                )}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white dark:bg-background px-2 text-gray-500 dark:text-slate-400">ou</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleRegister}
                disabled={isGoogleLoading}
                className="w-full h-12 text-base font-medium border border-gray-300 dark:border-white/20 hover:bg-gray-50 dark:hover:bg-white/5 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                {isGoogleLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    <span>Carregando...</span>
                  </div>
                ) : (
                  <>
                    <Chrome className="h-5 w-5" />
                    <span>Registrar com Google</span>
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