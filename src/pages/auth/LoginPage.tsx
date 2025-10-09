import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { supabase } from '../../lib/supabaseClient'
import { toast } from 'sonner'
import './LoginPage.css' // CSS de animação sangrenta
import ThemeToggle from '../../components/layout/ThemeToggle'

export default function LoginPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.email.trim() || !formData.password.trim()) {
      toast.error('Por favor, preencha todos os campos.')
      return
    }
    if (!formData.email.includes('@')) {
      toast.error('Por favor, insira um email válido.')
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
      navigate('/admin')
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetEmail.trim() || !resetEmail.includes('@')) {
      toast.error('Por favor, insira um email válido para redefinição.')
      return
    }

    setIsSubmitting(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      if (error) throw error
      toast.success('Link de redefinição de senha enviado para o seu e-mail!')
      setIsResettingPassword(false)
      setResetEmail('')
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoBack = () => navigate('/home')

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-background flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-500">
      {/* Login Card */}
      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Top Bar: Voltar + Tema */}
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
              <LogIn className="h-8 w-8 text-white" />
            </div>

            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent pb-1">
              {isResettingPassword ? 'Redefinir Senha' : 'Login'}
            </h1>
            <p className="text-gray-700 dark:text-slate-200 mt-2 transition-colors duration-500">
              {isResettingPassword
                ? 'Digite seu e-mail para receber o link de redefinição'
                : 'Entre com suas credenciais para acessar o sistema'}
            </p>
          </CardHeader>

          <CardContent>
            {isResettingPassword ? (
              <form onSubmit={handleResetPassword} className="space-y-6">
                {/* Email Field for Reset */}
                <div className="space-y-2">
                  <Label htmlFor="reset-email" className="text-gray-700 dark:text-slate-200 font-medium flex items-center space-x-2 transition-colors duration-500">
                    <Mail className="h-4 w-4 text-emerald-500" />
                    <span>Email</span>
                  </Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="Digite seu email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    required
                  />
                </div>

                {/* Reset Password Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none h-12 text-base font-medium"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <span>Enviando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Mail className="h-5 w-5" />
                      <span>Enviar Link de Redefinição</span>
                    </div>
                  )}
                </Button>

                {/* Back to Login */}
                <p className="text-center text-sm mt-4">
                  <button
                    type="button"
                    onClick={() => setIsResettingPassword(false)}
                    className="text-emerald-500 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300 underline transition-colors duration-300"
                  >
                    Voltar para o login
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
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

                {/* Password Field */}
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

                {/* Login Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none h-12 text-base font-medium"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <span>Entrando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <LogIn className="h-5 w-5" />
                      <span>Entrar</span>
                    </div>
                  )}
                </Button>

                {/* Forgot Password Link */}
                <p className="text-center text-sm mt-4">
                  <button
                    type="button"
                    onClick={() => setIsResettingPassword(true)}
                    className="text-emerald-500 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300 underline transition-colors duration-300"
                  >
                    Esqueceu a senha?
                  </button>
                </p>

                {/* Mensagem sangrenta/macabra */}
                <p className="text-center text-sm mt-4 blood-text text-red-600 dark:text-red-400 transition-colors duration-500">
                  Se você está aqui e não tem um e-mail/senha, você está no lugar errado.
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}