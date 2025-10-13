import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const cardRef = useRef<HTMLDivElement>(null);

  const { addToCart, removeFromCart } = useCart();

  useEffect(() => {
    if (!slug) {
      console.error(`Slug is undefined for product: ${name} (ID: ${id})`);
    }
    const checkCart = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        console.log('Checking cart for user:', user?.id, 'item_id:', id);
        if (user) {
          const { data: cartItem, error } = await supabase
            .from('cart')
            .select('id')
            .eq('user_id', user.id)
            .eq('item_id', id)
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
    checkCart();
  }, [id, name, slug]);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleImageSelect = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handleCartToggle = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
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
        console.error('Error toggling cart item:', error);
        toast.error('Erro ao atualizar o carrinho.');
      }
    },
    [id, name, isInCart, addToCart, removeFromCart]
  );

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onWhatsAppClick) {
      onWhatsAppClick(name);
    }
  };

  if (!slug) {
    return null;
  }

  return (
    <Link to={`/produto/${slug}`} className="block">
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm text-gray-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-105"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm text-gray-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-105"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
          {images.length > 1 && (
            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {currentImageIndex + 1}/{images.length}
            </div>
          )}
          <div className="absolute top-3 left-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={handleCartToggle}
              className={`w-9 h-9 rounded-full backdrop-blur-sm flex items-center justify-center hover:scale-105 transition-all duration-200 ${
                isInCart
                  ? 'bg-emerald-500/90 text-white'
                  : 'bg-white/80 text-gray-700 hover:bg-white'
              }`}
              title={isInCart ? 'Remover do carrinho' : 'Adicionar ao carrinho'}
            >
              <ShoppingCart className={`h-4 w-4 transition-all duration-200 ${isInCart ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
        {images.length > 1 && (
          <div className="p-3 border-b bg-muted/20">
            <div className="flex gap-2 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImageSelect(index);
                  }}
                  className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all duration-200 hover:scale-105 ${
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
          </div>
        )}
        <CardContent className="p-5 space-y-3">
          <div className="flex items-start justify-between">
            <Badge variant="secondary" className="text-xs">
              {category}
            </Badge>
            <Button
              onClick={handleCartToggle}
              variant="ghost"
              size="sm"
              className={`transition-all duration-200 ${
                isInCart
                  ? 'text-emerald-500 hover:text-emerald-600'
                  : 'text-muted-foreground hover:text-emerald-500'
              }`}
            >
              <ShoppingCart className={`w-4 h-4 ${isInCart ? 'fill-current' : ''}`} />
            </Button>
          </div>
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors duration-200">{name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
          {onWhatsAppClick && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleWhatsAppClick}
              className="w-full mt-2 hover:text-white"
            >
              Consultar no WhatsApp
            </Button>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};

export default React.memo(ProductCard, (prevProps, nextProps) => {
  return (
    prevProps.id === nextProps.id &&
    prevProps.name === nextProps.name &&
    prevProps.category === nextProps.category &&
    prevProps.description === nextProps.description &&
    prevProps.images.length === nextProps.images.length &&
    prevProps.slug === nextProps.slug &&
    prevProps.onWhatsAppClick === nextProps.onWhatsAppClick
  );
});