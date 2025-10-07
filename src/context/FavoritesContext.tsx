// src/context/FavoritesContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface FavoriteItem {
  id: number;
  name: string;
  category: string;
  image: string;
  description: string;
}

interface FavoritesContextType {
  favorites: FavoriteItem[];
  addToFavorites: (item: FavoriteItem) => void;
  removeFromFavorites: (itemId: number) => void;
  isFavorite: (itemId: number) => boolean;
  toggleFavorite: (item: FavoriteItem) => void;
  clearAllFavorites: () => void;
  favoritesCount: number;
  isLoaded: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadFavorites = () => {
      try {
        const savedFavorites = localStorage.getItem('ecofly-favorites');
        if (savedFavorites) {
          setFavorites(JSON.parse(savedFavorites));
        }
      } catch (error) {
        console.error('Erro ao carregar favoritos do localStorage:', error);
        localStorage.removeItem('ecofly-favorites');
        setFavorites([]);
      } finally {
        setIsLoaded(true);
      }
    };
    loadFavorites();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('ecofly-favorites', JSON.stringify(favorites));
    }
  }, [favorites, isLoaded]);

  const addToFavorites = (item: FavoriteItem) => {
    setFavorites(prev => {
      if (prev.some(fav => fav.id === item.id)) return prev;
      return [...prev, item];
    });
  };

  // ⚡ Remove sem pop-up
  const removeFromFavorites = (itemId: number) => {
    setFavorites(prev => prev.filter(item => item.id !== itemId));
  };

  const isFavorite = (itemId: number) => favorites.some(item => item.id === itemId);

  const toggleFavorite = (item: FavoriteItem) => {
    if (isFavorite(item.id)) {
      removeFromFavorites(item.id);
    } else {
      addToFavorites(item);
    }
  };

  const clearAllFavorites = useCallback(() => {
    setFavorites([]);
    localStorage.removeItem('ecofly-favorites');
  }, []);

  return (
    <FavoritesContext.Provider value={{
      favorites,
      addToFavorites,
      removeFromFavorites,
      isFavorite,
      toggleFavorite,
      clearAllFavorites,
      favoritesCount: favorites.length,
      isLoaded
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites deve ser usado dentro de um FavoritesProvider');
  return context;
};
