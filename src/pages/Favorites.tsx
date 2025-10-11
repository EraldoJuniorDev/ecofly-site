import React from 'react';
import { ProductCard } from '../components/ProductComponents';
import { useFavorites } from '../context/FavoritesContext';
import { Button } from '../components/ui/button';
import { MessageCircle } from 'lucide-react';
import { WHATSAPP_LINK } from '../constants';

const Favorites = () => {
  const { favorites } = useFavorites();

  const handleWhatsApp = (productName: string) => {
    const message = `Olá! Tenho interesse no produto: ${productName}. Poderia me dar mais informações?`;
    const whatsappUrl = `${WHATSAPP_LINK}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="container px-4 py-8">
      <h1 className="text-4xl md:text-5xl font-bold mb-8 eco-text-gradient text-center">
        Meus Favoritos
      </h1>
      {favorites.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            Você ainda não tem produtos favoritados.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              category={product.category}
              images={[{ url: product.image, alt: product.name }]}
              description={product.description}
              slug={product.slug || 'default-slug'} // Fallback for missing slug
              onWhatsAppClick={handleWhatsApp}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;