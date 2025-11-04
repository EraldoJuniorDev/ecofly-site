import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ArrowRight, Leaf, Recycle, Sparkles } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { WHATSAPP_LINK } from '../constants';
import { supabase } from '../lib/supabaseClient';

interface Product {
  id: number; // Changed to number to match items.id (bigint)
  name: string;
  category: string;
  description: string;
  images: { url: string; alt: string }[];
  slug: string;
}

const Home = () => {
  console.log('Home page rendered with minimal animations');

  const heroRef = useRef<HTMLImageElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('items')
          .select('id, name, category, description, images, slug')
          .limit(6) as { data: Product[] | null; error: any };

        if (error) {
          throw new Error(`Erro ao buscar produtos: ${error.message}`);
        }

        console.log('Produtos buscados do Supabase:', data?.map(p => ({ id: p.id, slug: p.slug })));
        const validProducts = data?.map(product => ({
          ...product,
          slug: product.slug || `product-${product.id}` // Fallback for missing slugs
        })) || [];
        setProducts(validProducts);
      } catch (err: any) {
        console.error('Erro:', err.message);
        setError('Não foi possível carregar os produtos. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate');
          }
        });
      },
      { threshold: 0.1 }
    );

    const animateElements = document.querySelectorAll('.animate-on-scroll');
    animateElements.forEach((el) => observer.observe(el));

    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const parallax = heroRef.current;
      if (parallax) {
        const speed = scrolled * 0.3;
        parallax.style.transform = `translateY(${speed}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);

    const animateStats = () => {
      const statsElements = statsRef.current?.querySelectorAll('.stat-number');
      if (statsElements) {
        statsElements.forEach((stat, index) => {
          const target = parseInt(stat.getAttribute('data-target') || '0');
          const increment = target / 80;
          let current = 0;

          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              stat.textContent = target.toString();
              clearInterval(timer);
            } else {
              stat.textContent = Math.ceil(current).toString();
            }
          }, 25 + index * 5);
        });
      }
    };

    const statsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateStats();
            statsObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (statsRef.current) {
      statsObserver.observe(statsRef.current);
    }

    return () => {
      observer.disconnect();
      statsObserver.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const highlights = [
    {
      icon: <Leaf className="h-7 w-7 text-primary animate-float" />,
      title: '100% Sustentável',
      description: 'Produtos ecológicos que fazem a diferença',
    },
    {
      icon: <Recycle className="h-7 w-7 text-primary animate-float-delayed" />,
      title: 'Reutilizável',
      description: 'Durabilidade e qualidade em cada produto',
    },
    {
      icon: <Sparkles className="h-7 w-7 text-primary animate-gentle-bounce" />,
      title: 'Feito com Amor',
      description: 'Cada peça é única e artesanal',
    },
  ];

  const handleWhatsApp = (productName: string) => {
    const message = `Olá! Tenho interesse no produto: ${productName}. Poderia me dar mais informações?`;
    const whatsappUrl = `${WHATSAPP_LINK}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen overflow-hidden">
      <section className="relative overflow-hidden eco-gradient min-h-screen flex items-center">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-24 h-24 bg-white/10 rounded-full animate-float"></div>
          <div className="absolute top-1/3 right-24 w-16 h-16 bg-white/10 rounded-full animate-float-delayed"></div>
          <div className="absolute bottom-32 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-gentle-bounce"></div>
        </div>

        <div className="container px-4 py-16 md:py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-6 animate-fade-in-left">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                <span className="inline-block">EcoBags</span>
                <br />
                <span className="text-white/90 inline-block animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  Personalizadas
                </span>
              </h1>

              <p className="text-xl text-white/90 max-w-lg animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                Transforme sua rotina com produtos sustentáveis únicos. 
                EcoBags, cinzeiros artesanais, chaveiros e mini telas criativas.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                <Button asChild size="lg" variant="secondary" className="bg-white text-black hover:bg-white/90 btn-smooth">
                  <Link to="/catalogo">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Ver Produtos
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white text-white bg-transparent hover:bg-white/10 btn-smooth">
                  <Link to="/contato">
                    Fale Conosco
                  </Link>
                </Button>
              </div>
            </div>

            <div className="relative animate-fade-in-right">
              <div className="aspect-square rounded-2xl overflow-hidden glass-subtle hover-subtle relative group">
                <img
                  src="https://euxlnqarxvbyaaqofyqh.supabase.co/storage/v1/object/public/site-images/logo_transparent.png"
                  alt="ECOFLY Logo"
                  className="w-full h-full object-contain p-8 transition-transform duration-500 group-hover:scale-105 parallax bg-green-400"
                />
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-xl animate-float"></div>
                <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white/5 rounded-full blur-2xl animate-float-delayed"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 animate-on-scroll">
        <div className="container px-4">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 eco-text-gradient">
              Por que escolher a ECOFLY?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Mais que produtos, oferecemos uma experiência sustentável única
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger-children">
            {highlights.map((highlight, index) => (
              <Card key={index} className="border-none shadow-md hover-subtle glass-subtle group">
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

      <section className="py-16 md:py-24 bg-muted/30 animate-on-scroll">
        <div className="container px-4">
          <div className="text-center mb-12 animate-scale-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Conheça Nossa Variedade de Itens
            </h2>
            <p className="text-xl text-muted-foreground">
              Explore opções que atendem a todos os gostos e necessidades.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">Carregando produtos...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-lg text-red-600">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 stagger-children">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  category={product.category}
                  images={product.images}
                  description={product.description}
                  slug={product.slug}
                  onWhatsAppClick={handleWhatsApp}
                />
              ))}
            </div>
          )}

          <div className="text-center animate-scale-in">
            <Button asChild size="lg" className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 hover:scale-[1.02] transform transition-all duration-300 text-white btn-smooth">
              <Link to="/catalogo">
                Ver Todos os Produtos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 animate-on-scroll">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-emerald-700 to-green-700 rounded-2xl p-8 md:p-12 text-white relative overflow-hidden">
              <Leaf className="h-12 w-12 mx-auto mb-6 opacity-80 animate-float" />
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Sustentabilidade em Cada Detalhe
              </h2>
              <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                Na ECOFLY, cada produto é pensado para minimizar o impacto ambiental. 
                Usamos materiais sustentáveis e processos artesanais que respeitam o planeta.
              </p>
              <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="animate-scale-in">
                  <div className="text-3xl font-bold mb-2">
                    <span className="stat-number" data-target="100">0</span>%
                  </div>
                  <div className="opacity-90">Materiais Sustentáveis</div>
                </div>
                <div className="animate-scale-in" style={{ animationDelay: '0.2s' }}>
                  <div className="text-3xl font-bold mb-2">
                    <span className="stat-number" data-target="0">0</span>%
                  </div>
                  <div className="opacity-90">Desperdício</div>
                </div>
                <div className="animate-scale-in" style={{ animationDelay: '0.4s' }}>
                  <div className="text-3xl font-bold mb-2">∞</div>
                  <div className="opacity-90">Reutilização</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;