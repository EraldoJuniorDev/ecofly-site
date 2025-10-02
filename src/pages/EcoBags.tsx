import React from 'react'
import { Button } from '../components/ui/button'
import { MessageCircle, Leaf } from 'lucide-react'
import ProductCard from '../components/ProductCard'

const EcoBags = () => {
  console.log('EcoBags page rendered')

  const ecoBagsProducts = [
    {
      id: 1,
      name: "EcoBag 'Mar Doce Lar'",
      category: "EcoBags",
      images: [
        {
          url: "https://cdn-ai.onspace.ai/onspace/project/image/XeQ2YWQvTtREiHW8mDN79N/Imagem_do_WhatsApp_de_2025-09-30_à(s)_01.44.29_18aae992.jpg",
          alt: "EcoBag Mar Doce Lar - Vista frontal"
        },
        {
          url: "https://cdn-ai.onspace.ai/onspace/project/image/mUHwvvXqSHptCB4uvaVZc8/Imagem_do_WhatsApp_de_2025-09-30_à(s)_01.44.29_18aae992.jpg",
          alt: "EcoBag Mar Doce Lar - Vista pendurada"
        }
      ],
      description: "Design inspirado no mar com tipografia criativa e símbolos marítimos"
    },
    {
      id: 2,
      name: "EcoBag Lana Del Rey",
      category: "EcoBags",
      images: [
        {
          url: "https://cdn-ai.onspace.ai/onspace/project/image/MjCgbX9iiN5zM37BGqs352/Imagem_do_WhatsApp_de_2025-09-30_à(s)_01.44.30_c32269da.jpg",
          alt: "EcoBag Lana Del Rey - Vista frontal"
        },
        {
          url: "https://cdn-ai.onspace.ai/onspace/project/image/gG2HHSLCDoxm2rscH6Viv3/Imagem_do_WhatsApp_de_2025-09-30_à(s)_01.44.30_c32269da.jpg",
          alt: "EcoBag Lana Del Rey - Post Instagram"
        }
      ],
      description: "Inspirada na música, com cerejas delicadas e frase icônica"
    },
    {
      id: 3,
      name: "EcoBag Olho Místico",
      category: "EcoBags",
      images: [
        {
          url: "https://cdn-ai.onspace.ai/onspace/project/image/itTiUSDxUvB8WjUC4AUTMD/Imagem_do_WhatsApp_de_2025-09-30_à(s)_01.44.30_d405b426.jpg",
          alt: "EcoBag Olho Místico - Vista frontal"
        },
        {
          url: "https://cdn-ai.onspace.ai/onspace/project/image/DNpUUgoq8zLroVotVHmDbw/Imagem_do_WhatsApp_de_2025-09-30_à(s)_01.44.30_d405b426.jpg",
          alt: "EcoBag Olho Místico - Post Instagram"
        }
      ],
      description: "Design místico com olho centralizado e elementos esotéricos"
    },
    {
      id: 4,
      name: "EcoBag Borboleta",
      category: "EcoBags",
      images: [
        {
          url: "https://cdn-ai.onspace.ai/onspace/project/image/3eJeCnxUEcvXrNoj5pZJsz/logo.png",
          alt: "EcoBag Borboleta - Design principal"
        }
      ],
      description: "Delicadas borboletas em tons suaves e femininos"
    },
    {
      id: 5,
      name: "EcoBag Girassol",
      category: "EcoBags",
      images: [
        {
          url: "https://cdn-ai.onspace.ai/onspace/project/image/3eJeCnxUEcvXrNoj5pZJsz/logo.png",
          alt: "EcoBag Girassol - Design principal"
        }
      ],
      description: "Alegria do girassol trazendo energia positiva para o seu dia"
    }
  ]

  const handleWhatsApp = (productName: string) => {
    const message = `Olá! Tenho interesse na EcoBag: ${productName}. Poderia me dar mais informações sobre personalização e valores?`
    const whatsappUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <div className="container px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Leaf className="h-8 w-8 text-primary" />
          <h1 className="text-4xl md:text-5xl font-bold eco-text-gradient">
            EcoBags Personalizadas
          </h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Nossas EcoBags são mais que sacolas reutilizáveis - são uma declaração de estilo e consciência ambiental. 
          Cada peça é cuidadosamente personalizada com designs únicos e inspiradores.
        </p>
      </div>

      {/* Benefits Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="text-center p-6 rounded-lg bg-card border">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full eco-gradient flex items-center justify-center">
            <Leaf className="h-6 w-6 text-white" />
          </div>
          <h3 className="font-semibold mb-2">100% Sustentável</h3>
          <p className="text-sm text-muted-foreground">Materiais ecológicos e processo artesanal</p>
        </div>
        <div className="text-center p-6 rounded-lg bg-card border">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full eco-gradient flex items-center justify-center">
            <MessageCircle className="h-6 w-6 text-white" />
          </div>
          <h3 className="font-semibold mb-2">Personalização</h3>
          <p className="text-sm text-muted-foreground">Designs únicos feitos especialmente para você</p>
        </div>
        <div className="text-center p-6 rounded-lg bg-card border">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full eco-gradient flex items-center justify-center">
            <span className="text-white font-bold">∞</span>
          </div>
          <h3 className="font-semibold mb-2">Durabilidade</h3>
          <p className="text-sm text-muted-foreground">Qualidade que acompanha sua rotina por anos</p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {ecoBagsProducts.map((product) => (
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

      {/* Call to Action */}
      <div className="text-center mt-16 p-8 rounded-2xl eco-gradient text-white">
        <h2 className="text-2xl font-bold mb-4">Tem uma ideia personalizada?</h2>
        <p className="text-lg mb-6 opacity-90">
          Criamos EcoBags com seus próprios designs, frases ou logos!
        </p>
        <Button 
          onClick={() => handleWhatsApp("EcoBag personalizada")}
          variant="secondary" 
          size="lg"
          className="bg-white text-primary hover:bg-white/90"
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          Solicitar Personalização
        </Button>
      </div>
    </div>
  )
}

export default EcoBags