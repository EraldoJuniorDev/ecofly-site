import React, { useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import { MessageCircle } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { WHATSAPP_LINK } from '../constants';
import { supabase } from '../lib/supabaseClient';
import { Item } from '../types/supabase';

// Definir a interface para os produtos, alinhada com a tabela items
interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  images: { url: string; alt: string }[];
}

const Store = () => {
  console.log('Store page rendered with enhanced product cards');

  const categories = ['Todos', 'Ecobags', 'Cinzeiros', 'Mini Telas'];
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar produtos do Supabase ao carregar o componente
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('items')
          .select('*') as { data: Item[] | null; error: any };
        
        if (error) {
          throw new Error(`Erro ao buscar produtos: ${error.message}`);
        }

        console.log('Dados do Supabase:', data);
        console.log('Tipo do primeiro id:', data?.[0]?.id, typeof data?.[0]?.id);
        setProducts(data || []);
      } catch (err: any) {
        console.error('Erro:', err.message);
        setError('Não foi possível carregar os produtos. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = selectedCategory === 'Todos'
    ? products
    : products.filter((product) => product.category === selectedCategory);

  const handleWhatsApp = (productName: string) => {
    const message = `Olá! Tenho interesse. Poderia me dar mais informações?`;
    const whatsappUrl = `${WHATSAPP_LINK}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="container px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 eco-text-gradient">
          Nossos Produtos
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Cada peça é única, feita com amor e consciência ambiental. Explore todos os ângulos dos nossos produtos artesanais.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(category)}
            className={selectedCategory === category ? 'eco-gradient text-white' : ''}
          >
            {category}
          </Button>
        ))}
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
      )}

      {filteredProducts.length === 0 && !loading && !error && (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            Nenhum produto encontrado nesta categoria.
          </p>
        </div>
      )}

      <div className="text-center mt-16 p-8 rounded-2xl eco-gradient text-white">
        <h2 className="text-2xl font-bold mb-4">Não encontrou o que procura?</h2>
        <p className="text-lg mb-6 opacity-90">
          Fazemos produtos personalizados sob encomenda!
        </p>
        <Button
          onClick={() => handleWhatsApp('produto personalizado')}
          variant="secondary"
          size="lg"
          className="bg-white text-primary hover:bg-white/90"
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          Solicitar Orçamento
        </Button>
      </div>
    </div>
  );
};

export default Store;