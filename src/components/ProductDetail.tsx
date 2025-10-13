import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ShoppingCart, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';
import { WHATSAPP_LINK } from '../constants';

interface ProductImage {
  url: string;
  alt: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  images: ProductImage[];
  category: string;
  slug: string;
}

const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addToCart, removeFromCart, cartCount } = useCart();
  const [isInCart, setIsInCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) {
        console.error('Slug is undefined');
        setError('Slug do produto não fornecido.');
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('items')
          .select('id, name, description, images, category, slug')
          .eq('slug', slug)
          .single();
        if (error) throw error;
        if (!data) throw new Error('Produto não encontrado.');
        setProduct(data);
      } catch (err: any) {
        console.error('Error fetching product:', err.message);
        setError('Erro ao carregar o produto.');
        toast.error('Erro ao carregar o produto.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  useEffect(() => {
    const checkCart = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        console.log('Checking cart for user:', user?.id, 'item_id:', product?.id);
        if (user && product) {
          const { data: cartItem, error } = await supabase
            .from('cart')
            .select('id')
            .eq('user_id', user.id)
            .eq('item_id', product.id)
            .single();
          if (error && error.code !== 'PGRST116') {
            console.error('Cart query error:', error.message, error.code);
            throw error;
          }
          setIsInCart(!!cartItem);
        }
      } catch (error) {
        console.error('Error checking cart status:', error);
      }
    };

    if (product) {
      checkCart();
    }
  }, [product]);

  const handleCartToggle = async () => {
    if (!product) return;
    try {
      if (isInCart) {
        await removeFromCart(product.id);
        setIsInCart(false);
        toast.success(`${product.name} removido do carrinho`);
      } else {
        await addToCart(product.id);
        setIsInCart(true);
        toast.success(`${product.name} adicionado ao carrinho`);
      }
    } catch (error) {
      console.error('Error toggling cart item:', error);
      toast.error('Erro ao atualizar o carrinho.');
    }
  };

  const handleWhatsAppClick = () => {
    if (!product) return;
    const message = `Olá! Tenho interesse no produto: ${product.name}. Poderia me dar mais informações?`;
    const whatsappUrl = `${WHATSAPP_LINK}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const nextImage = () => {
    if (product && product.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product && product.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">{error || 'Produto não encontrado.'}</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/catalogo">Voltar ao Catálogo</Link>
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 sm:px-6 py-8"
    >
      <Button asChild variant="outline" className="mb-6">
        <Link to="/catalogo">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Voltar ao Catálogo
        </Link>
      </Button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg shadow-md">
            <img
              src={product.images[currentImageIndex]?.url || product.images[0]?.url}
              alt={product.images[currentImageIndex]?.alt || product.name}
              className="w-full h-full object-cover"
            />
            {product.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm text-gray-700 flex items-center justify-center hover:bg-white hover:scale-105 transition-all duration-200"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm text-gray-700 flex items-center justify-center hover:bg-white hover:scale-105 transition-all duration-200"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white text-sm px-2 py-1 rounded-full">
                  {currentImageIndex + 1}/{product.images.length}
                </div>
              </>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 hover:scale-105 ${
                    index === currentImageIndex
                      ? 'border-primary'
                      : 'border-transparent hover:border-muted-foreground/30'
                  }`}
                >
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-6">
          <div>
            <Badge variant="secondary" className="text-sm mb-2">
              {product.category}
            </Badge>
            <h1 className="text-3xl font-bold eco-text-gradient">{product.name}</h1>
          </div>
          <p className="text-lg text-muted-foreground">{product.description}</p>
          <div className="flex items-center gap-4">
            <Button
              onClick={handleCartToggle}
              className={isInCart ? 'bg-red-600 hover:bg-red-700' : 'eco-gradient text-white'}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              {isInCart ? 'Remover do Carrinho' : 'Adicionar ao Carrinho'}
            </Button>
            <Button
              variant="outline"
              onClick={handleWhatsAppClick}
            >
              Consultar no WhatsApp
            </Button>
            <Button asChild variant="outline">
              <Link to="/carrinho">
                Ver Carrinho ({cartCount})
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductDetail;