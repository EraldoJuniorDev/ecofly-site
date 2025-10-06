  import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

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
    const isClearingRef = useRef(false);

    useEffect(() => {
      const loadFavorites = () => {
        try {
          const savedFavorites = localStorage.getItem('ecofly-favorites');
          if (savedFavorites) {
            const parsedFavorites = JSON.parse(savedFavorites);
            console.log('Favoritos carregados do localStorage:', parsedFavorites);
            setFavorites(parsedFavorites);
          } else {
            console.log('Nenhum favorito encontrado no localStorage');
            setFavorites([]);
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
        console.log('Estado de favoritos atualizado no contexto:', favorites);
        localStorage.setItem('ecofly-favorites', JSON.stringify(favorites));
      }
    }, [favorites, isLoaded]);

    const addToFavorites = (item: FavoriteItem) => {
      console.log('=== ADICIONANDO AOS FAVORITOS ===', 'Item:', item);
      console.log('Favoritos atuais antes da adição:', favorites);
      setFavorites(prevFavorites => {
        const itemExists = prevFavorites.some(fav => fav.id === item.id);
        if (itemExists) {
          console.log('Item já existe, não adicionando');
          return prevFavorites;
        }
        const newFavorites = [...prevFavorites, item];
        console.log('Novos favoritos após adição:', newFavorites);
        return newFavorites;
      });
    };

    const removeFromFavorites = (itemId: number) => {
      console.log('=== REMOVENDO DOS FAVORITOS ===', 'ID:', itemId);
      console.log('Favoritos atuais antes da remoção:', favorites);
      const itemToRemove = favorites.find(item => item.id === itemId);
      if (!window.confirm(`Tem certeza que deseja remover "${itemToRemove?.name || 'este item'}" dos favoritos?`)) {
        console.log('Remoção cancelada pelo usuário');
        return;
      }
      setFavorites(prevFavorites => prevFavorites.filter(item => item.id !== itemId));
    };

    const isFavorite = (itemId: number) => {
      const result = favorites.some(item => item.id === itemId);
      console.log(`Item ${itemId} é favorito?`, result);
      return result;
    };

    const toggleFavorite = (item: FavoriteItem) => {
      console.log('=== TOGGLE FAVORITO ===', 'Item:', item);
      const isCurrentlyFavorite = isFavorite(item.id);
      console.log('É favorito atualmente?', isCurrentlyFavorite);
      if (isCurrentlyFavorite) {
        removeFromFavorites(item.id);
      } else {
        addToFavorites(item);
      }
    };

    const clearAllFavorites = useCallback(() => {
      console.log('=== TENTATIVA DE LIMPAR TODOS OS FAVORITOS ===', { isClearing: isClearingRef.current });
      if (isClearingRef.current) {
        console.log('Operação de limpeza já em andamento, ignorando chamada duplicada');
        return;
      }
      isClearingRef.current = true;
      console.log('=== LIMPANDO TODOS OS FAVORITOS ===');
      if (!window.confirm('Tem certeza que deseja remover todos os itens dos favoritos?')) {
        console.log('Limpeza de favoritos cancelada pelo usuário');
        isClearingRef.current = false;
        return;
      }
      setFavorites([]);
      localStorage.removeItem('ecofly-favorites');
      isClearingRef.current = false;
      console.log('Limpeza de favoritos concluída');
    }, []);

    console.log('Hook estado atual no provedor:', { 
      favoritesCount: favorites.length, 
      favoriteIds: favorites.map(f => f.id),
      favorites: favorites.map(f => ({ id: f.id, name: f.name })),
      isLoaded
    });

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
    if (!context) {
      throw new Error('useFavorites deve ser usado dentro de um FavoritesProvider');
    }
    return context;
  };