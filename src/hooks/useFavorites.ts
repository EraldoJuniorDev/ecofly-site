import { useState, useEffect } from 'react'

export interface FavoriteItem {
  id: number
  name: string
  category: string
  image: string
  description: string
}

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])

  console.log('useFavorites hook initialized')

  useEffect(() => {
    // Carregar favoritos do localStorage ao inicializar
    const savedFavorites = localStorage.getItem('ecofly-favorites')
    if (savedFavorites) {
      try {
        const parsedFavorites = JSON.parse(savedFavorites)
        setFavorites(parsedFavorites)
        console.log('Favoritos carregados do localStorage:', parsedFavorites.length)
      } catch (error) {
        console.error('Erro ao carregar favoritos:', error)
      }
    }
  }, [])

  const addToFavorites = (item: FavoriteItem) => {
    console.log('Adicionando aos favoritos:', item.name)
    const newFavorites = [...favorites, item]
    setFavorites(newFavorites)
    localStorage.setItem('ecofly-favorites', JSON.stringify(newFavorites))
  }

  const removeFromFavorites = (itemId: number) => {
    console.log('Removendo dos favoritos:', itemId)
    const newFavorites = favorites.filter(item => item.id !== itemId)
    setFavorites(newFavorites)
    localStorage.setItem('ecofly-favorites', JSON.stringify(newFavorites))
  }

  const isFavorite = (itemId: number) => {
    return favorites.some(item => item.id === itemId)
  }

  const toggleFavorite = (item: FavoriteItem) => {
    if (isFavorite(item.id)) {
      removeFromFavorites(item.id)
    } else {
      addToFavorites(item)
    }
  }

  const clearAllFavorites = () => {
    console.log('Limpando todos os favoritos')
    setFavorites([])
    localStorage.removeItem('ecofly-favorites')
  }

  return {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
    clearAllFavorites,
    favoritesCount: favorites.length
  }
}