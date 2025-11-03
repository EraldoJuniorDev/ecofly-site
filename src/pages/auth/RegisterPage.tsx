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

  // CRIA PERFIL NO FRONTEND AO REGISTRAR COM GOOGLE
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('Usuário registrado com Google:', session.user.email)

          const { error } = await supabase
            .from('profiles')
            .upsert({
              id: session.user.id,
              email: session.user.email,
              display_name: 
                session.user.user_metadata.full_name || 
                session.user.user_metadata.name || 
                session.user.email?.split('@')[0],
              avatar_url: session.user.user_metadata.picture,
              role: 'user'
            }, { onConflict: 'id' })

          if (error) {
            console.error('Erro ao salvar perfil:', error)
            toast.error('Erro ao salvar perfil')
          } else {
            toast.success('Registro com Google realizado com sucesso!')
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
      toast.error('Por favor, preencha todos os campos.')
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
            role: 'user'
          }, { onConflict: 'id' })

        if (dbError) throw dbError
      }

      toast.success('Registro realizado! Verifique seu email.')
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
      const baseUrl = import.meta.env.PROD 
        ? import.meta.env.VITE_APP_URL 
        : window.location.origin
      const redirectTo = `${baseUrl}/auth/callback`

      console.log('Google OAuth (Register) → redirectTo:', redirectTo)

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo }
      })
      if (error) throw error
    } catch (error: any) {
      console.error('Erro no Google OAuth:', error)
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
              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-700 dark:text-slate-200 font-medium flex items-center space-x-2">
                  <User className="h-4 w-4 text-emerald-500" />
                  <span>Nome de Usuário</span>
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Digite seu nome"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 dark:text-slate-200 font-medium flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-emerald-500" />
                  <span>Email</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Digite seu email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              {/* Senha */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 dark:text-slate-200 font-medium flex items-center space-x-2">
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
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Confirmar Senha */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700 dark:text-slate-200 font-medium flex items-center space-x-2">
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
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Botão Registrar */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white h-12"
              >
                {isSubmitting ? 'Registrando...' : (
                  <>
                    <UserPlus className="h-5 w-5 mr-2" />
                    Registrar
                  </>
                )}
              </Button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white dark:bg-background px-2 text-gray-500 dark:text-slate-400">ou</span>
                </div>
              </div>

              {/* Google */}
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleRegister}
                disabled={isGoogleLoading}
                className="w-full h-12 flex items-center justify-center space-x-2"
              >
                {isGoogleLoading ? (
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
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