// src/components/ProductCard.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ShoppingCart, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';
import { supabase } from '../lib/supabaseClient';

interface ProductImage {
  url: string;
  alt: string;
}

interface ProductCardProps {
  id: number;
  name: string;
  category: string;
  images: ProductImage[];
  description: string;
  slug: string;
  onWhatsAppClick?: (productName: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  category,
  images,
  description,
  slug,
  onWhatsAppClick,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isInCart, setIsInCart] = useState(false);
  const [price, setPrice] = useState<number | null>(null);
  const [originalPrice, setOriginalPrice] = useState<number | null>(null);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [user, setUser] = useState<any>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const { addToCart, removeFromCart } = useCart();
  const navigate = useNavigate();

  // Buscar dados do usuário, preço, avaliações e status do carrinho
  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        // Verifica se está no carrinho
        if (user) {
          const { data: cartItem } = await supabase
            .from('cart')
            .select('id')
            .eq('user_id', user.id)
            .eq('item_id', id)
            .maybeSingle(); // ← CORRETO: não dá erro se não existir

          setIsInCart(!!cartItem);
        }

        // Preço
        const { data: item } = await supabase
          .from('items')
          .select('price, original_price')
          .eq('id', id)
          .single();

        if (item) {
          setPrice(item.price);
          setOriginalPrice(item.original_price ?? item.price);
        }

        // Avaliações
        const { data: reviews } = await supabase
          .from('reviews')
          .select('rating')
          .eq('item_id', id);

        if (reviews && reviews.length > 0) {
          const total = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
          setAverageRating(total / reviews.length);
          setReviewCount(reviews.length);
        } else {
          setAverageRating(null);
          setReviewCount(0);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do produto:', error);
        toast.error('Erro ao carregar informações do item.');
      }
    };

    fetchData();
  }, [id, slug]);

  const nextImage = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevImage = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const handleWhatsAppClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onWhatsAppClick) onWhatsAppClick(name);
  }, [name, onWhatsAppClick]);

  const handleCartToggle = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();

      if (!user) {
        toast.error('Você precisa estar logado para adicionar itens ao carrinho.');
        navigate('/login');
        return;
      }

      try {
        if (isInCart) {
          await removeFromCart(id);
          setIsInCart(false);
          toast.success(`${name} removido do carrinho`);
        } else {
          await addToCart(id);
          setIsInCart(true);
          toast.success(`${name} adicionado ao carrinho`);
        }
      } catch (error) {
        console.error('Erro ao atualizar o carrinho:', error);
        toast.error('Erro ao atualizar o carrinho.');
      }
    },
    [id, name, isInCart, addToCart, removeFromCart, user, navigate]
  );

  if (!slug) return null;

  const hasDiscount = originalPrice !== null && price !== null && originalPrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice! - price!) / originalPrice!) * 100)
    : 0;

  return (
    <Card
      ref={cardRef}
      className="group overflow-hidden card-hover glass-subtle border-0 relative animate-fade-in-up"
    >
      <div className="relative aspect-square overflow-hidden bg-muted/20">
        <img
          src={images[currentImageIndex]?.url || images[0]?.url}
          alt={images[currentImageIndex]?.alt || name}
          className="w-full h-full object-cover transition-all duration-500 hover:scale-105"
        />

        {images.length > 1 && (
          <>
            <button
              onClick={nextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 text-gray-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={prevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 text-gray-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </>
        )}

        {hasDiscount && (
          <div className="absolute top-3 left-3 bg-red-600 text-white text-xs px-2 py-1 rounded-md shadow-md">
            -{discountPercent}%
          </div>
        )}
      </div>

      <CardContent className="p-5 space-y-3">
        <div className="flex items-start justify-between">
          <Badge variant="secondary" className="text-xs">
            {category}
          </Badge>

          {averageRating !== null ? (
            <div className="flex items-center gap-1 text-yellow-500 text-sm mt-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i <= Math.round(averageRating) ? 'fill-current' : 'opacity-30'
                  }`}
                />
              ))}
              <span className="text-muted-foreground text-xs ml-1">
                ({reviewCount})
              </span>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground mt-1">Sem avaliações</p>
          )}
        </div>

        <Link to={`/produto/${slug}`} className="block">
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors duration-200">
            {name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {description}
          </p>

          {price !== null ? (
            <div className="flex items-center gap-2 mt-1">
              {hasDiscount ? (
                <>
                  <p className="text-2xl font-bold text-primary">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(price)}
                  </p>
                  <p className="text-sm text-muted-foreground line-through">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(originalPrice!)}
                  </p>
                </>
              ) : (
                <p className="text-lg font-bold text-primary">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(price)}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Preço indisponível</p>
          )}
        </Link>

        <div className="flex items-center gap-1">
          {onWhatsAppClick && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleWhatsAppClick}
              className="w-full hover:text-white"
            >
              Consultar no WhatsApp
            </Button>
          )}

          <Button
            onClick={handleCartToggle}
            variant="outline"
            size="sm"
            className={`transition-all duration-200 ${
              isInCart
                ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                : 'text-muted-foreground hover:text-emerald-500 hover:bg-emerald-50'
            }`}
          >
            <ShoppingCart
              className={`w-4 h-4 ${isInCart ? 'fill-current' : ''}`}
            />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(ProductCard);