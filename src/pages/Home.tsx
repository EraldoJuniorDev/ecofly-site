import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { ArrowRight, Leaf, Recycle, Heart, Star } from 'lucide-react'
import ProductCard from '../components/ProductCard'

const Home = () => {
  console.log('Home page rendered')

  const highlights = [
    {
      icon: <Leaf className="h-8 w-8 text-primary" />,
      title: "100% Sustentável",
      description: "Produtos ecológicos que fazem a diferença"
    },
    {
      icon: <Recycle className="h-8 w-8 text-primary" />,
      title: "Reutilizável",
      description: "Durabilidade e qualidade em cada produto"
    },
    {
      icon: <Heart className="h-8 w-8 text-primary" />,
      title: "Feito com Amor",
      description: "Cada peça é única e artesanal"
    }
  ]

  const featuredProducts = [
    {
      id: 101,
      name: "EcoBag Personalizada 'Mar Doce Lar'",
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
      id: 102,
      name: "Cinzeiro Artesanal Universo Místico",
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
      id: 103,
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
        },
        {
          url: "https://cdn-ai.onspace.ai/onspace/project/image/Nv6avEzcdGQy47eT2bxjH2/Imagem_do_WhatsApp_de_2025-09-30_à(s)_01.44.29_de2e1d21.jpg",
          alt: "Mini Tela Espiral Colorida - Variação"
        }
      ],
      description: "Universo em miniatura com olho central e padrões hipnóticos"
    },
    {
      id: 104,
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
      id: 105,
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
      id: 106,
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
    }
  ]

  const handleWhatsApp = (productName: string) => {
    const message = `Olá! Vi no site da ECOFLY o produto: ${productName}. Gostaria de mais informações!`
    const whatsappUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden eco-gradient">
        <div className="container px-4 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                EcoBags
                <br />
                <span className="text-white/90">Personalizadas</span>
              </h1>
              <p className="text-xl text-white/90 max-w-lg">
                Transforme sua rotina com produtos sustentáveis únicos. 
                EcoBags, cinzeiros artesanais, chaveiros e mini telas criativas.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
                  <Link to="/loja">
                    Ver Produtos
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white text-white bg-transparent hover:bg-white/10">
                  <Link to="/contato">
                    Fale Conosco
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden bg-white/10 backdrop-blur-sm animate-float">
                <img 
                  src="https://cdn-ai.onspace.ai/onspace/project/image/PmDAFoyvUEJHW4u7FEeqZd/logo.png"
                  alt="ECOFLY Logo"
                  className="w-full h-full object-contain p-8"
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/20 rounded-full blur-xl"></div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 eco-text-gradient">
              Por que escolher a ECOFLY?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Mais que produtos, oferecemos uma experiência sustentável única
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {highlights.map((highlight, index) => (
              <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-8 text-center space-y-4">
                  <div className="flex justify-center">{highlight.icon}</div>
                  <h3 className="text-xl font-semibold">{highlight.title}</h3>
                  <p className="text-muted-foreground">{highlight.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Products Preview - Diverse Categories */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Nossos Produtos em Destaque
            </h2>
            <p className="text-xl text-muted-foreground">
              Explore nossa variedade de produtos sustentáveis e únicos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredProducts.map((product) => (
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

          {/* Category Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Link to="/ecobags" className="group">
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-4">🛍️</div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">EcoBags</h3>
                  <p className="text-muted-foreground">Personalizadas e sustentáveis</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/cinzeiros" className="group">
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-4">🎨</div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">Cinzeiros</h3>
                  <p className="text-muted-foreground">Arte funcional e criativa</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/mini-telas" className="group">
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-4">🖼️</div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">Mini Telas</h3>
                  <p className="text-muted-foreground">Pequenas obras de arte</p>
                </CardContent>
              </Card>
            </Link>
          </div>

          <div className="text-center">
            <Button asChild size="lg" className="eco-gradient text-white">
              <Link to="/loja">
                Ver Todos os Produtos
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Sustainability Message */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="eco-gradient rounded-2xl p-8 md:p-12 text-white">
              <Leaf className="h-16 w-16 mx-auto mb-6 opacity-80" />
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Sustentabilidade em Cada Detalhe
              </h2>
              <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                Na ECOFLY, cada produto é pensado para minimizar o impacto ambiental. 
                Usamos materiais sustentáveis e processos artesanais que respeitam o planeta.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold mb-2">100%</div>
                  <div className="opacity-90">Materiais Sustentáveis</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">0%</div>
                  <div className="opacity-90">Desperdício</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">∞</div>
                  <div className="opacity-90">Reutilização</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home