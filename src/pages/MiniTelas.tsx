import React from 'react'
import { Button } from '../components/ui/button'
import { MessageCircle, Sparkles } from 'lucide-react'
import ProductCard from '../components/ProductCard'

const MiniTelas = () => {
  console.log('MiniTelas page rendered')

  const miniTelasProducts = [
    {
      id: 15,
      name: "Mini Tela Cósmica",
      category: "Mini Telas",
      images: [
        {
          url: "https://cdn-ai.onspace.ai/onspace/project/image/9pko3fbvc927PViDX539mT/Imagem_do_WhatsApp_de_2025-09-30_à(s)_01.44.29_a9e29dbc.jpg",
          alt: "Mini Tela Cósmica - Vista superior"
        },
        {
          url: "https://cdn-ai.onspace.ai/onspace/project/image/Q2XL2GHwhRAHQNreRvtswn/Imagem_do_WhatsApp_de_2025-09-30_à(s)_01.44.29_a9e29dbc.jpg",
          alt: "Mini Tela Cósmica - Vista na mão"
        }
      ],
      description: "Universo em miniatura com olho central e detalhes dourados místicos"
    },
    {
      id: 16,
      name: "Mini Tela Espiral Colorida",
      category: "Mini Telas",
      images: [
        {
          url: "https://cdn-ai.onspace.ai/onspace/project/image/GEvjzk6rDK5Jkf4D3Rc9FE/Imagem_do_WhatsApp_de_2025-09-30_à(s)_01.44.29_de2e1d21.jpg",
          alt: "Mini Tela Espiral - Vista superior"
        },
        {
          url: "https://cdn-ai.onspace.ai/onspace/project/image/fR3xrSSQeWwUjGNSUxsDc4/Imagem_do_WhatsApp_de_2025-09-30_à(s)_01.44.29_de2e1d21.jpg",
          alt: "Mini Tela Espiral - Vista alternativa"
        }
      ],
      description: "Espiral hipnótica em tons vibrantes de roxo e rosa com olho central"
    }
  ]

  const handleWhatsApp = (productName: string) => {
    const message = `Olá! Tenho interesse na mini tela: ${productName}. Poderia me dar mais informações sobre tamanhos e valores?`
    const whatsappUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <div className="container px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Sparkles className="h-8 w-8 text-primary" />
          <h1 className="text-4xl md:text-5xl font-bold eco-text-gradient">
            Mini Telas Criativas
          </h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Pequenas obras de arte que transformam qualquer ambiente. Nossas mini telas são pintadas à mão 
          com designs únicos e inspiradores, perfeitas para decorar sua casa, escritório ou presentear.
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="text-center p-6 rounded-lg bg-card border">
          <div className="text-3xl mb-3">🎨</div>
          <h3 className="font-semibold mb-2">Arte Original</h3>
          <p className="text-sm text-muted-foreground">Cada tela é única e pintada à mão</p>
        </div>
        <div className="text-center p-6 rounded-lg bg-card border">
          <div className="text-3xl mb-3">📏</div>
          <h3 className="font-semibold mb-2">Tamanho Perfeito</h3>
          <p className="text-sm text-muted-foreground">Ideais para qualquer espaço</p>
        </div>
        <div className="text-center p-6 rounded-lg bg-card border">
          <div className="text-3xl mb-3">💝</div>
          <h3 className="font-semibold mb-2">Presente Ideal</h3>
          <p className="text-sm text-muted-foreground">Arte acessível e significativa</p>
        </div>
        <div className="text-center p-6 rounded-lg bg-card border">
          <div className="text-3xl mb-3">✨</div>
          <h3 className="font-semibold mb-2">Acabamento Premium</h3>
          <p className="text-sm text-muted-foreground">Tintas de alta qualidade</p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {miniTelasProducts.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            category={product.category}
            images={product.images}
            description={product.description}
            onWhatsAppClick={handleWhatsApp}
          />
        ))}
      </div>

      {/* Size Guide */}
      <div className="bg-muted/30 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-bold text-center mb-8">Tamanhos Disponíveis</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-card rounded-lg border">
            <h3 className="font-semibold text-lg mb-2">Mini</h3>
            <p className="text-2xl font-bold text-primary mb-2">10x10cm</p>
            <p className="text-sm text-muted-foreground">Perfeita para mesa de cabeceira ou escrivaninha</p>
          </div>
          <div className="text-center p-6 bg-card rounded-lg border ring-2 ring-primary">
            <h3 className="font-semibold text-lg mb-2">Padrão</h3>
            <p className="text-2xl font-bold text-primary mb-2">15x15cm</p>
            <p className="text-sm text-muted-foreground">Mais popular - ideal para estantes e prateleiras</p>
            <span className="inline-block mt-2 px-3 py-1 bg-primary text-white text-xs rounded-full">Mais vendida</span>
          </div>
          <div className="text-center p-6 bg-card rounded-lg border">
            <h3 className="font-semibold text-lg mb-2">Grande</h3>
            <p className="text-2xl font-bold text-primary mb-2">20x20cm</p>
            <p className="text-sm text-muted-foreground">Destaque na decoração de qualquer ambiente</p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center p-8 rounded-2xl eco-gradient text-white">
        <h2 className="text-2xl font-bold mb-4">Tem uma ideia artística?</h2>
        <p className="text-lg mb-6 opacity-90">
          Criamos mini telas personalizadas com seus temas favoritos, paisagens, abstratos e muito mais!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => handleWhatsApp("mini tela personalizada")}
            variant="secondary" 
            size="lg"
            className="bg-white text-primary hover:bg-white/90"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Solicitar Arte Personalizada
          </Button>
          <Button 
            onClick={() => handleWhatsApp("catálogo mini telas")}
            variant="outline" 
            size="lg"
            className="border-white text-white bg-transparent hover:bg-white/10"
          >
            Ver Mais Designs
          </Button>
        </div>
      </div>
    </div>
  )
}

export default MiniTelas