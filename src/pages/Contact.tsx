import React, { useState } from 'react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Label } from '../components/ui/label'
import { MessageCircle, Mail, Instagram, MapPin, Clock, Send, Phone } from 'lucide-react'
import { toast } from 'sonner'
import { WHATSAPP_LINK, INSTAGRAM_LINK, INSTAGRAM_USER, WHATSAPP_NUMBER } from "../constants";

const Contact = () => {
  console.log('Contact page rendered')

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Contact form submitted:', formData)

    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Por favor, preencha todos os campos obrigatórios.')
      return
    }

    toast.success('Mensagem enviada com sucesso! Retornaremos em breve.')

    // Reset form
    setFormData({ name: '', email: '', subject: '', message: '' })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleWhatsApp = () => {
    const message = "Olá! Gostaria de receber detalhes adicionais sobre os produtos da ECOFLY."
    const whatsappUrl = `${WHATSAPP_LINK}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const formatWhatsAppNumber = (number: string) => {
    const countryCode = number.slice(0, 2); // 55
    const areaCode = number.slice(2, 4);    // 82
    const firstPart = number.slice(4, 8);   // 9821
    const secondPart = number.slice(8);     // 3105
    return `+${countryCode} ${areaCode} ${firstPart}-${secondPart}`;
  };

  // Número formatado para exibição
  const WHATSAPP_FORMATTED = formatWhatsAppNumber(WHATSAPP_NUMBER);

  const contactMethods = [
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: "WhatsApp",
      description: "Resposta rápida",
      action: () => window.open(WHATSAPP_LINK, "_blank"),
      color: "text-green-600",
    },
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Email",
      description: "Para pedidos e dúvidas",
      info: "ecoflybags@gmail.com",
      action: () => window.location.href = "mailto:ecoflybags@gmail.com",
      color: "text-blue-600"
    },
    {
      icon: <Instagram className="h-6 w-6" />,
      title: "Instagram",
      description: "Siga nossos produtos",
      info: `@${INSTAGRAM_USER}`,
      action: () => window.open(INSTAGRAM_LINK, "_blank"),
      color: "text-pink-600"
    }
  ]

  return (
    <div className="container px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 eco-text-gradient">
          Entre em Contato
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Estamos aqui para ajudar! Entre em contato conosco para tirar dúvidas, fazer pedidos ou dar sugestões.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Methods */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-2xl font-bold mb-6">Formas de Contato</h2>

          {contactMethods.map((method, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={method.action}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`${method.color}`}>
                    {method.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{method.title}</h3>
                    <p className="text-sm text-muted-foreground mb-1">{method.description}</p>
                    <p className="font-medium">{method.info}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Business Info */}
          <Card className="mt-8">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h4 className="font-semibold">Horário de Atendimento</h4>
                  <p className="text-sm text-muted-foreground">
                    Segunda a Sexta: 9h às 18h<br />
                    Sábado: 9h às 14h
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h4 className="font-semibold">Atendimento</h4>
                  <p className="text-sm text-muted-foreground">
                    Online via WhatsApp e redes sociais
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-primary" />
                Envie sua Mensagem
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Assunto</Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Ex: Pedido personalizado, dúvida sobre produto..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Mensagem *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Digite sua mensagem aqui..."
                    rows={6}
                    required
                  />
                </div>

                <Button
                  variant='submit'
                  type="submit"
                  className="w-full hover:scale-[1.02] transform transition-all duration-300 text-white">
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Mensagem
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* FAQ Quick Access */}
          <Card className="mt-8 bg-gradient-to-r from-emerald-700 to-green-700 text-white">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-semibold mb-4">Dúvidas Frequentes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Personalizações</h4>
                  <p className="opacity-90">Aceitamos pedidos personalizados! Entre em contato para orçamento.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Prazo de Entrega</h4>
                  <p className="opacity-90">Produtos prontos: 2-5 dias úteis. Personalizados: 7-15 dias úteis.</p>
                </div>
              </div>

              <Button
                onClick={handleWhatsApp}
                variant="secondary"
                className="bg-white text-black hover:bg-gray-300"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Falar no WhatsApp
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Contact