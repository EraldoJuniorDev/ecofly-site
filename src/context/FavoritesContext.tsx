import React, { createContext, useContext, useState, useEffect } from 'react';

interface FavoriteItem {
  id: number;
  name: string;
  category: string;
  image: string;
  description: string;
  slug: string; // Added slug
}

interface FavoritesContextType {
  favorites: FavoriteItem[];
  isFavorite: (id: number) => boolean;
  toggleFavorite: (item: FavoriteItem) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    const storedFavorites = localStorage.getItem('favorites');
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const isFavorite = (id: number) => {
    return favorites.some((item) => item.id === id);
  };

  const toggleFavorite = (item: FavoriteItem) => {
    setFavorites((prev) =>
      isFavorite(item.id)
        ? prev.filter((fav) => fav.id !== item.id)
        : [...prev, item]
    );
  };

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};