import React from 'react'
import { Button } from '../components/ui/button'
import { MessageCircle, Palette } from 'lucide-react'
import ProductCard from '../components/ProductCard'

const Cinzeiros = () => {
  console.log('Cinzeiros page rendered')

  const cinzeirosProducts = [
    {
      id: 6,
      name: "Cinzeiro Universo Místico",
      category: "Cinzeiros",
      images: [
        {
          url: "https://cdn-ai.onspace.ai/onspace/project/image/XoNWXGKFovkBZWDxR2zUFV/Imagem_do_WhatsApp_de_2025-09-30_à(s)_01.44.27_17d633eb.jpg",
          alt: "Cinzeiro Universo Místico - Vista superior"
        },
        {
          url: "https://cdn-ai.onspace.ai/onspace/project/image/B3ujeDNDD66Eh9ykSQVcKB/Imagem_do_WhatsApp_de_2025-09-30_à(s)_01.44.27_17d633eb.jpg",
          alt: "Cinzeiro Universo Místico - Vista na mão"
        },
        {
          url: "https://cdn-ai.onspace.ai/onspace/project/image/LpTV7aG2YXVL5eKV5Gatv6/Imagem_do_WhatsApp_de_2025-09-30_à(s)_01.44.27_17d633eb.jpg",
          alt: "Cinzeiro Universo Místico - Detalhe do design"
        }
      ],
      description: "Design cósmico com olho central, estrelas douradas e gradiente místico"
    },
    {
      id: 7,
      name: "Cinzeiro Rolling Stones",
      category: "Cinzeiros",
      images: [
        {
          url: "https://cdn-ai.onspace.ai/onspace/project/image/i3DWd6hsNsLcKNCoRgDjTf/Imagem_do_WhatsApp_de_2025-09-30_à(s)_01.44.27_09211f44.jpg",
          alt: "Cinzeiro Rolling Stones - Vista superior"
        },
        {
          url: "https://cdn-ai.onspace.ai/onspace/project/image/5h5ukSGRg7QoVSxH63GBJj/Imagem_do_WhatsApp_de_2025-09-30_à(s)_01.44.27_09211f44.jpg",
          alt: "Cinzeiro Rolling Stones - Vista lateral"
        }
      ],
      description: "Clássico logo dos Rolling Stones em design elegante e resistente"
    },
    {
      id: 8,
      name: "Cinzeiro Homem-Aranha",
      category: "Cinzeiros",
      images: [
        {
          url: "https://cdn-ai.onspace.ai/onspace/project/image/fi8fNhUiMf3gBvTRfW6Xdq/Imagem_do_WhatsApp_de_2025-09-30_à(s)_01.44.28_1e9e08c9.jpg",
          alt: "Cinzeiro Homem-Aranha - Vista superior"
        },
        {
          url: "https://cdn-ai.onspace.ai/onspace/project/image/jCo6Yz5YKVJkGA34GgX4TH/Imagem_do_WhatsApp_de_2025-09-30_à(s)_01.44.28_1e9e08c9.jpg",
          alt: "Cinzeiro Homem-Aranha - Vista em processo"
        }
      ],
      description: "Máscara do Homem-Aranha em detalhes perfeitos para fãs do herói"
    },
    {
      id: 9,
      name: "Cinzeiro Jack Skellington",
      category: "Cinzeiros",
      images: [
        {
          url: "https://cdn-ai.onspace.ai/onspace/project/image/Hn5PYAB26xENQJttG8HJzB/Imagem_do_WhatsApp_de_2025-09-30_à(s)_01.44.28_4bc4dd2b.jpg",
          alt: "Cinzeiro Jack Skellington - Vista superior"
        },
        {
          url: "https://cdn-ai.onspace.ai/onspace/project/image/RiJFFtm2TnqZNhp4gZsnjF/Imagem_do_WhatsApp_de_2025-09-30_à(s)_01.44.28_4bc4dd2b.jpg",
          alt: "Cinzeiro Jack Skellington - Vista alternativa"
        }
      ],
      description: "Personagem icônico do 'Pesadelo Antes do Natal' em arte única"
    },
    {
      id: 10,
      name: "Cinzeiro Batman",
      category: "Cinzeiros",
      images: [
        {
          url: "https://cdn-ai.onspace.ai/onspace/project/image/4tPTXouZuiDxWYgUSZUHBt/Imagem_do_WhatsApp_de_2025-09-30_à(s)_01.44.28_59c8ca00.jpg",
          alt: "Cinzeiro Batman - Vista superior"
        },
        {
          url: "https://cdn-ai.onspace.ai/onspace/project/image/MHVxus6JuzzhguBTpXZxhL/Imagem_do_WhatsApp_de_2025-09-30_à(s)_01.44.28_59c8ca00.jpg",
          alt: "Cinzeiro Batman - Vista na mão"
        },
        {
          url: "https://cdn-ai.onspace.ai/onspace/project/image/TKdCseBamvNMfeju2f4wXV/Imagem_do_WhatsApp_de_2025-09-30_à(s)_01.44.28_6e9c1d9f.jpg",
          alt: "Cinzeiro Batman - Vista lateral"
        }
      ],
      description: "Logo clássico do Batman em amarelo sobre fundo escuro"
    },
    {
      id: 11,
      name: "Cinzeiro Diabinho",
      category: "Cinzeiros",
      images: [
        {
          url: "https://cdn-ai.onspace.ai/onspace/project/image/bHSjTNQfG7WtDmNuGJmFb9/Imagem_do_WhatsApp_de_2025-09-30_à(s)_01.44.28_b3e4f3f7.jpg",
          alt: "Cinzeiro Diabinho - Vista superior"
        },
        {
          url: "https://cdn-ai.onspace.ai/onspace/project/image/3tM4fdguYisb5AfXcn8nAy/Imagem_do_WhatsApp_de_2025-09-30_à(s)_01.44.28_b3e4f3f7.jpg",
          alt: "Cinzeiro Diabinho - Vista na mão"
        }
      ],
      description: "Design divertido e irreverente com diabinho fumante"
    },
    {
      id: 12,
      name: "Cinzeiro Proibido Fumar",
      category: "Cinzeiros",
      images: [
        {
          url: "https://cdn-ai.onspace.ai/onspace/project/image/JP4GjHmsvER6W9GNRd9n6A/Imagem_do_WhatsApp_de_2025-09-30_à(s)_01.44.29_b48ca1c6.jpg",
          alt: "Cinzeiro Proibido Fumar - Vista superior"
        },
        {
          url: "https://cdn-ai.onspace.ai/onspace/project/image/dFJwFbe66tCrZKK4iRC4r6/Imagem_do_WhatsApp_de_2025-09-30_à(s)_01.44.29_b48ca1c6.jpg",
          alt: "Cinzeiro Proibido Fumar - Vista na mão"
        }
      ],
      description: "Ironia artística com símbolo proibido - arte conceitual única"
    },
    {
      id: 13,
      name: "Cinzeiro Futebol",
      category: "Cinzeiros",
      images: [
        {
          url: "https://cdn-ai.onspace.ai/onspace/project/image/CcQqFoZJrhLugHETtqoKzs/Imagem_do_WhatsApp_de_2025-09-30_à(s)_01.44.28_bdcff20b.jpg",
          alt: "Cinzeiro Futebol - Vista superior"
        },
        {
          url: "https://cdn-ai.onspace.ai/onspace/project/image/bDBvfBWRMc3dcBqHf7dTWX/Imagem_do_WhatsApp_de_2025-09-30_à(s)_01.44.28_bdcff20b.jpg",
          alt: "Cinzeiro Futebol - Vista alternativa"
        }
      ],
      description: "Para os apaixonados por futebol - arte esportiva funcional"
    },
    {
      id: 14,
      name: "Cinzeiro Bart Simpson",
      category: "Cinzeiros",
      images: [
        {
          url: "https://cdn-ai.onspace.ai/onspace/project/image/eR875FN8dFWubDfuogdcFa/Imagem_do_WhatsApp_de_2025-09-30_à(s)_01.44.29_8ca4317f.jpg",
          alt: "Cinzeiro Bart Simpson - Vista superior"
        },
        {
          url: "https://cdn-ai.onspace.ai/onspace/project/image/PVRmDANLJdx7L8uKR9KLMV/Imagem_do_WhatsApp_de_2025-09-30_à(s)_01.44.29_8ca4317f.jpg",
          alt: "Cinzeiro Bart Simpson - Vista alternativa"
        }
      ],
      description: "Bart Simpson em estilo divertido e nostálgico"
    }
  ]

  const handleWhatsApp = (productName: string) => {
    const message = `Olá! Tenho interesse no cinzeiro: ${productName}. Poderia me dar mais informações sobre disponibilidade e valores?`
    const whatsappUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <div className="container px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Palette className="h-8 w-8 text-primary" />
          <h1 className="text-4xl md:text-5xl font-bold eco-text-gradient">
            Cinzeiros Artísticos
          </h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Transformamos cinzeiros em verdadeiras obras de arte. Cada peça é pintada à mão com designs únicos, 
          desde personagens icônicos até símbolos místicos e culturais.
        </p>
      </div>

      {/* Categories Preview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <div className="text-center p-4 rounded-lg bg-card border hover:shadow-md transition-shadow">
          <div className="text-2xl mb-2">🎬</div>
          <h3 className="font-semibold text-sm">Cinema & TV</h3>
          <p className="text-xs text-muted-foreground">Personagens icônicos</p>
        </div>
        <div className="text-center p-4 rounded-lg bg-card border hover:shadow-md transition-shadow">
          <div className="text-2xl mb-2">🎵</div>
          <h3 className="font-semibold text-sm">Música</h3>
          <p className="text-xs text-muted-foreground">Bandas e artistas</p>
        </div>
        <div className="text-center p-4 rounded-lg bg-card border hover:shadow-md transition-shadow">
          <div className="text-2xl mb-2">⚽</div>
          <h3 className="font-semibold text-sm">Esportes</h3>
          <p className="text-xs text-muted-foreground">Times e modalidades</p>
        </div>
        <div className="text-center p-4 rounded-lg bg-card border hover:shadow-md transition-shadow">
          <div className="text-2xl mb-2">🔮</div>
          <h3 className="font-semibold text-sm">Místico</h3>
          <p className="text-xs text-muted-foreground">Símbolos esotéricos</p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {cinzeirosProducts.map((product) => (
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
        <h2 className="text-2xl font-bold mb-4">Quer um design exclusivo?</h2>
        <p className="text-lg mb-6 opacity-90">
          Criamos cinzeiros personalizados com qualquer tema ou personagem que você desejar!
        </p>
        <Button 
          onClick={() => handleWhatsApp("cinzeiro personalizado")}
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

export default Cinzeiros