import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { supabase } from '../../lib/supabaseClient'
import { toast } from 'sonner'
import './LoginPage.css' // Import do CSS de animação sangrenta

export default function LoginPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      const { data, error } = await supabase.auth.signInWithPassword({
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

  const handleGoBack = () => navigate('/')

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Animations */}
      <div className="absolute inset-0" />
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={handleGoBack}
          className="mb-6 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all duration-300"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para a página inicial
        </Button>

        <Card className="glass-morphism border-white/10 shadow-2xl animate-slide-up">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg animate-pulse-glow">
              <LogIn className="h-8 w-8 text-white" />
            </div>

            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">
              Login
            </h1>
            <p className="text-slate-400 mt-2">
              Entre com suas credenciais para acessar o sistema
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200 font-medium flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-emerald-400" />
                  <span>Email</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Digite seu email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="bg-slate-800/50 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all duration-300 pl-4 pr-4"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-200 font-medium flex items-center space-x-2">
                  <Lock className="h-4 w-4 text-emerald-400" />
                  <span>Senha</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Digite sua senha"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="bg-slate-800/50 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all duration-300 pl-4 pr-12"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 text-slate-400 hover:text-slate-300 hover:bg-slate-700/50"
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

              {/* Mensagem sangrenta/macabra */}
              <p className="text-center text-sm mt-4 blood-text">
                Se você está aqui e não tem um e-mail/senha, você está no lugar errado.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
