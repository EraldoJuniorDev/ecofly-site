import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext';
import { toast } from 'sonner';
import { supabase } from '../lib/supabaseClient';

interface ProductImage {
  url: string;
  alt: string;
}

interface Product {
  id: number;
  name: string;
  category: string;
  images: ProductImage[];
  description: string;
}

interface ProductCardProps extends Product {
  onWhatsAppClick?: (productName: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  category,
  images,
  description,
  onWhatsAppClick,
}) => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const { isFavorite, toggleFavorite } = useFavorites();
  const isProductFavorite = isFavorite(id);

  const favoriteItem = useMemo(() => ({
    id,
    name,
    category,
    image: images[0]?.url || '',
    description,
  }), [id, name, category, images, description]);

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

  const handleFavoriteToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(favoriteItem);

    if (isProductFavorite) {
      toast.success(`${name} removido dos favoritos`);
    } else {
      toast.success(`${name} adicionado aos favoritos`);
    }
  }, [favoriteItem, isProductFavorite, name, toggleFavorite]);

  const handleCardClick = () => {
    navigate(`/product/${id}`);
  };

  return (
    <Card
      ref={cardRef}
      onClick={handleCardClick}
      className="group overflow-hidden card-hover glass-subtle border-0 relative animate-fade-in-up cursor-pointer"
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
            onClick={handleFavoriteToggle}
            className={`w-9 h-9 rounded-full backdrop-blur-sm flex items-center justify-center hover:scale-105 transition-all duration-200 ${
              isProductFavorite
                ? 'bg-red-500/90 text-white'
                : 'bg-white/80 text-gray-700 hover:bg-white'
            }`}
            title={isProductFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <Heart className={`h-4 w-4 transition-all duration-200 ${isProductFavorite ? 'fill-current' : ''}`} />
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
            onClick={handleFavoriteToggle}
            variant="ghost"
            size="sm"
            className={`transition-all duration-200 ${
              isProductFavorite
                ? 'text-red-500 hover:text-red-600'
                : 'text-muted-foreground hover:text-red-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${isProductFavorite ? 'fill-current' : ''}`} />
          </Button>
        </div>
        <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors duration-200">{name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        {onWhatsAppClick && (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onWhatsAppClick(name);
            }}
            className="w-full mt-2 hover:text-white"
          >
            Consultar no WhatsApp
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data, error } = await supabase
          .from('items')
          .select('*')
          .eq('id', productId)
          .single();
        if (error) throw error;
        setProduct(data);
      } catch (error) {
        console.error('Erro ao buscar produto:', error);
        setProduct(null);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleFavoriteToggle = useCallback(() => {
    if (product) {
      const favoriteItem = {
        id: product.id,
        name: product.name,
        category: product.category,
        image: product.images[0]?.url || '',
        description: product.description,
      };
      toggleFavorite(favoriteItem);
      toast.success(
        isFavorite(product.id)
          ? `${product.name} removido dos favoritos`
          : `${product.name} adicionado aos favoritos`
      );
    }
  }, [product, isFavorite, toggleFavorite]);

  const nextImage = () => {
    if (product) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product) {
      setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  const handleImageSelect = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handleWhatsAppClick = () => {
    if (product) {
      const message = `Olá! Tenho interesse no produto: ${product.name}. Poderia me dar mais informações?`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  if (!product) {
    return <div className="p-6 text-center">Produto não encontrado</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-4 text-primary hover:text-primary-dark"
      >
        <ChevronLeft className="h-5 w-5 mr-2" /> Voltar
      </Button>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="relative">
          <div className="aspect-square overflow-hidden rounded-lg bg-muted/20">
            <img
              src={product.images[currentImageIndex]?.url || product.images[0]?.url}
              alt={product.images[currentImageIndex]?.alt || product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => handleImageSelect(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
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
          {product.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm text-gray-700 flex items-center justify-center hover:bg-white"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm text-gray-700 flex items-center justify-center hover:bg-white"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-sm">{product.category}</Badge>
            <Button
              onClick={handleFavoriteToggle}
              variant="ghost"
              size="sm"
              className={`transition-all duration-200 ${
                isFavorite(product.id)
                  ? 'text-red-500 hover:text-red-600'
                  : 'text-muted-foreground hover:text-red-500'
              }`}
            >
              <Heart
                className={`w-5 h-5 ${isFavorite(product.id) ? 'fill-current' : ''}`}
              />
            </Button>
          </div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-lg text-muted-foreground">{product.description}</p>
          <Button
            variant="outline"
            size="lg"
            onClick={handleWhatsAppClick}
            className="w-full hover:text-white"
          >
            Consultar no WhatsApp
          </Button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProductCard, (prevProps, nextProps) => {
  return prevProps.id === nextProps.id &&
         prevProps.name === nextProps.name &&
         prevProps.category === nextProps.category &&
         prevProps.description === nextProps.description &&
         prevProps.images.length === nextProps.images.length &&
         prevProps.onWhatsAppClick === nextProps.onWhatsAppClick;
});