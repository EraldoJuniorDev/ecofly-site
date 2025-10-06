// src/components/ProductCard.tsx
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { Heart, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext';
import { toast } from 'sonner';

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
  onWhatsAppClick?: (productName: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  category,
  images,
  description,
  onWhatsAppClick,
}) => {
  console.log(`ProductCard ${id} rendered with simplified design`);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
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

  const nextModalImage = () => {
    setModalImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevModalImage = () => {
    setModalImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleImageSelect = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handleModalImageSelect = (index: number) => {
    setModalImageIndex(index);
  };

  const handleFavoriteToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Toggling favorite for item:', favoriteItem);
    toggleFavorite(favoriteItem);

    if (isProductFavorite) {
      toast.success(`${name} removido dos favoritos`);
    } else {
      toast.success(`${name} adicionado aos favoritos`);
    }
  }, [favoriteItem, isProductFavorite, name, toggleFavorite]);

  return (
    <Card
      ref={cardRef}
      className="group overflow-hidden card-hover glass-subtle border-0 relative animate-fade-in-up"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square overflow-hidden bg-muted/20">
        {!imageLoaded && (
          <div className="absolute inset-0 skeleton"></div>
        )}

        <img
          src={images[currentImageIndex]?.url || images[0]?.url}
          alt={images[currentImageIndex]?.alt || name}
          className={`w-full h-full object-cover transition-all duration-500 hover-scale ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
        />

        <div className={`absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}></div>

        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className={`absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm text-gray-700 flex items-center justify-center transition-all duration-300 hover:bg-white hover-scale ${
                isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextImage}
              className={`absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm text-gray-700 flex items-center justify-center transition-all duration-300 hover:bg-white hover-scale ${
                isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
              }`}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        {images.length > 1 && (
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
            {currentImageIndex + 1}/{images.length}
          </div>
        )}

        <div className={`absolute top-3 left-3 flex flex-col gap-2 transition-all duration-300 ${
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
        }`}>
          <Dialog>
            <DialogTrigger asChild>
              <button
                className="w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm text-gray-700 flex items-center justify-center hover:bg-white hover-scale transition-all duration-200"
                onClick={() => setModalImageIndex(currentImageIndex)}
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[95vh] p-0 bg-black/95 border-0">
              <div className="relative">
                <div className="relative aspect-square max-h-[75vh] overflow-hidden rounded-t-lg">
                  <img
                    src={images[modalImageIndex]?.url}
                    alt={images[modalImageIndex]?.alt || name}
                    className="w-full h-full object-contain bg-black"
                  />
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prevModalImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/30 transition-all duration-200"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={nextModalImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/30 transition-all duration-200"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </div>
                {images.length > 1 && (
                  <div className="p-4 border-t border-white/10">
                    <div className="flex gap-2 overflow-x-auto">
                      {images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => handleModalImageSelect(index)}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 hover-scale ${
                            index === modalImageIndex
                              ? 'border-primary'
                              : 'border-white/20 hover:border-white/40'
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
                <div className="p-4 border-t border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="secondary" className="text-sm">
                      {category}
                    </Badge>
                    {images.length > 1 && (
                      <span className="text-sm text-white/60">
                        {modalImageIndex + 1} de {images.length}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-white">{name}</h3>
                  <p className="text-sm text-white/80">{description}</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <button
            onClick={handleFavoriteToggle}
            className={`w-9 h-9 rounded-full backdrop-blur-sm flex items-center justify-center hover-scale transition-all duration-200 ${
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
                onClick={() => handleImageSelect(index)}
                className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all duration-200 hover-scale ${
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
            onClick={() => onWhatsAppClick(name)}
            className="w-full mt-2"
          >
            Consultar no WhatsApp
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductCard;