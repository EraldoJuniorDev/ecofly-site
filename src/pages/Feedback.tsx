import React, { useState, useEffect } from 'react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Label } from '../components/ui/label'
import { Star, Send, User, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '../lib/supabaseClient' // Importe o cliente Supabase (ajuste o caminho se necessário)

const Feedback = () => {
  console.log('Feedback page rendered')

  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    product: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [testimonials, setTestimonials] = useState([]) // Estado para feedbacks dinâmicos do Supabase

  // Função para buscar feedbacks do Supabase
  useEffect(() => {
    const fetchFeedbacks = async () => {
      const { data, error } = await supabase
        .from('feedbacks')
        .select('*')
        .order('created_at', { ascending: false }) // Mais recentes primeiro

      if (error) {
        console.error('Erro ao carregar feedbacks:', error)
        toast.error('Erro ao carregar depoimentos.')
      } else {
        setTestimonials(data || [])
      }
    }

    fetchFeedbacks()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    console.log('Feedback submitted:', { ...formData, rating })
    
    if (!formData.name || !formData.message || rating < 1 || rating > 5) {
      toast.error('Por favor, preencha pelo menos seu nome, mensagem e uma avaliação entre 1 e 5.')
      setLoading(false)
      return
    }

    const feedbackData = {
      name: formData.name,
      email: formData.email || null, // Opcional
      product: formData.product || null, // Opcional
      message: formData.message,
      rating: rating,
    }

    const { data: insertData, error } = await supabase
      .from('feedbacks')
      .insert([feedbackData])

    setLoading(false)

    if (error) {
      console.error('Erro ao inserir feedback:', error)
      toast.error('Erro ao enviar feedback: ' + error.message)
    } else {
      toast.success('Obrigado pelo seu feedback! Sua opinião é muito importante para nós.')
      
      // Reset form
      setFormData({ name: '', email: '', product: '', message: '' })
      setRating(0)
      
      // Recarregar depoimentos para incluir o novo
      const { data: refreshedData, error: refreshError } = await supabase
        .from('feedbacks')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (!refreshError) {
        setTestimonials(refreshedData || [])
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  // Função para formatar data em português (ex.: "Outubro 2025")
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ]
    return `${months[date.getMonth()]} ${date.getFullYear()}`
  }

  return (
    <div className="container px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 eco-text-gradient">
          Sua Opinião Importa
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Compartilhe sua experiência conosco e ajude outros clientes a conhecer nossos produtos
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Feedback Form */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Deixe seu Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Rating */}
              <div className="space-y-2">
                <Label>Avaliação</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-8 w-8 cursor-pointer transition-colors ${
                        star <= (hoveredRating || rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      onClick={() => setRating(star)}
                    />
                  ))}
                </div>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Seu nome"
                  required
                  disabled={loading}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email (opcional)</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="seu@email.com"
                  disabled={loading}
                />
              </div>

              {/* Product */}
              <div className="space-y-2">
                <Label htmlFor="product">Produto (opcional)</Label>
                <select
                  id="product"
                  name="product"
                  value={formData.product}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                  disabled={loading}
                >
                  <option value="">Selecione um produto</option>
                  <option value="Ecobags">Ecobags</option>
                  <option value="Cinzeiros">Cinzeiros</option>
                  <option value="Mini Telas">Mini Telas</option>
                </select>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message">Sua experiência *</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Conte-nos sobre sua experiência com nossos produtos..."
                  rows={4}
                  required
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full eco-gradient text-white" disabled={loading}>
                <Send className="w-4 h-4 mr-2" />
                {loading ? 'Enviando...' : 'Enviar Feedback'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Testimonials (agora dinâmicos do Supabase) */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold mb-6">O que nossos clientes dizem</h2>
          
          {testimonials.length === 0 ? (
            <p className="text-muted-foreground">Nenhum depoimento ainda. Seja o primeiro!</p>
          ) : (
            testimonials.slice(0, 3).map((testimonial) => ( // Limita a 3 para manter o design
              <Card key={testimonial.id} className="shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{testimonial.name}</h3>
                          <p className="text-sm text-muted-foreground">{testimonial.product || 'Geral'}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{formatDate(testimonial.created_at)}</span>
                      </div>
                      
                      <div className="flex gap-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      
                      <p className="text-sm leading-relaxed">"{testimonial.message}"</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}

          {/* Call to Action */}
          <Card className="eco-gradient text-white">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">Satisfação Garantida</h3>
              <p className="text-sm opacity-90">
                Nossa prioridade é sua satisfação. Cada produto é feito com carinho e atenção aos detalhes.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Feedback