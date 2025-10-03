import React from 'react'
import { Button } from '../components/ui/button'
import { MessageCircle } from 'lucide-react'
import ProductCard from '../components/ProductCard'

const Store = () => {
  console.log('Store page rendered with enhanced product cards')

  const products = [
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
      description: "Design inspirado no mar com tipografia criativa"
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
      description: "Inspirada na música, com cerejas delicadas"
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
      description: "Design místico com olho centralizado"
    },
    {
      id: 4,
      name: "EcoBag Borboleta",
      category: "EcoBags",
      images: [
        {
          url: "https://cdn-ai.onspace.ai/onspace/project/image/Rk6hnQT9RkGMY7g8bsoN6k/logo.png",
          alt: "EcoBag Borboleta - Design principal"
        }
      ],
      description: "Delicada borboleta em tons suaves"
    },
    {
      id: 5,
      name: "EcoBag Girassol",
      category: "EcoBags",
      images: [
        {
          url: "https://cdn-ai.onspace.ai/onspace/project/image/Rk6hnQT9RkGMY7g8bsoN6k/logo.png",
          alt: "EcoBag Girassol - Design principal"
        }
      ],
      description: "Alegria do girassol em sua ecobag"
    },
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
        }
      ],
      description: "Design cósmico com olho central e estrelas"
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
      description: "Clássico logo dos Rolling Stones"
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
      description: "Máscara do Homem-Aranha em detalhes"
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
      description: "Personagem icônico do Pesadelo Antes do Natal"
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
      description: "Logo clássico do Batman em amarelo"
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
      description: "Design divertido com diabinho fumante"
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
      description: "Ironia artística com símbolo proibido"
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
      description: "Para os amantes do futebol"
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
      description: "Bart Simpson em estilo divertido"
    },
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
      description: "Universo em miniatura com olho central"
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
      description: "Espiral hipnótica em tons vibrantes"
    }
  ]

  const categories = ["Todos", "EcoBags", "Cinzeiros", "Mini Telas"]
  const [selectedCategory, setSelectedCategory] = React.useState("Todos")

  const filteredProducts = selectedCategory === "Todos" 
    ? products 
    : products.filter(product => product.category === selectedCategory)

  const handleWhatsApp = (productName: string) => {
    const message = `Olá! Tenho interesse no produto: ${productName}. Poderia me dar mais informações?`
    const whatsappUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <div className="container px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 eco-text-gradient">
          Nossos Produtos
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Cada peça é única, feita com amor e consciência ambiental. Explore todos os ângulos dos nossos produtos artesanais.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            onClick={() => setSelectedCategory(category)}
            className={selectedCategory === category ? "eco-gradient text-white" : ""}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
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

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            Nenhum produto encontrado nesta categoria.
          </p>
        </div>
      )}

      {/* Call to Action */}
      <div className="text-center mt-16 p-8 rounded-2xl eco-gradient text-white">
        <h2 className="text-2xl font-bold mb-4">Não encontrou o que procura?</h2>
        <p className="text-lg mb-6 opacity-90">
          Fazemos produtos personalizados sob encomenda!
        </p>
        <Button 
          onClick={() => handleWhatsApp("produto personalizado")}
          variant="secondary" 
          size="lg"
          className="bg-white text-primary hover:bg-white/90"
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          Solicitar Orçamento
        </Button>
      </div>
    </div>
  )
}

export default Store