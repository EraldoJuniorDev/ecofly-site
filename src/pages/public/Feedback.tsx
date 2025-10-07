import React, { useState, useEffect } from 'react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Label } from '../../components/ui/label'
import { Star, Send, User, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '../../lib/supabaseClient'

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
  const [testimonials, setTestimonials] = useState([])

  useEffect(() => {
    const fetchFeedbacks = async () => {
      const { data, error } = await supabase
        .from('feedbacks')
        .select('*')
        .order('created_at', { ascending: false })

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
      email: formData.email || null,
      product: formData.product || null,
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
      
      setFormData({ name: '', email: '', product: '', message: '' })
      setRating(0)
      
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ]
    return `${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`
  }

  return (
    <div className="container px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 eco-text-gradient">
          Sua Opinião Importa
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Compartilhe sua experiência conosco e ajude outros clientes a conhecer nossos produtos
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Deixe seu Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
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
                  <option value="Ecobag">Ecobag</option>
                  <option value="Cinzeiro">Cinzeiro</option>
                  <option value="Mini Tela">Mini Tela</option>
                </select>
              </div>

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

              <Button
                type="submit"
                className="w-full eco-gradient text-white !bg-[linear-gradient(90deg,#22c55e,#4ade80)] hover:!bg-[linear-gradient(90deg,#16a34a,#22c55e)]"
                disabled={loading}
              >
                <Send className="w-4 h-4 mr-2" />
                {loading ? 'Enviando...' : 'Enviar Feedback'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold mb-6">O que nossos clientes dizem</h2>
          
          <div className="max-h-[600px] overflow-y-auto space-y-6 pr-4">
            {testimonials.length === 0 ? (
              <p className="text-muted-foreground">Nenhum depoimento ainda. Seja o primeiro!</p>
            ) : (
              testimonials.map((testimonial) => (
                <Card key={testimonial.id} className="shadow-md hover:shadow-lg transition-shadow text-foreground">
                  <CardContent className="p-4 overflow-hidden max-w-full">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex flex-1 flex-col gap-1">
                        <h3 className="font-semibold text-sm">{testimonial.name}</h3>
                        <p className="text-xs text-gray-400">{formatDate(testimonial.created_at)}</p>
                      </div>
                      <span className="inline-block bg-green-500 text-white text-xs font-bold py-1 px-2 rounded-full">
                        {testimonial.product || 'Geral'}
                      </span>
                    </div>
                    
                    <div className="flex gap-1 mb-2">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    
                    <p className="text-sm leading-relaxed break-words max-w-full"> "{testimonial.message}"</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

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