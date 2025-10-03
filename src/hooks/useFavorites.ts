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
  const [isLoaded, setIsLoaded] = useState(false)

  console.log('useFavorites hook initialized')

  // Carregar favoritos do localStorage apenas uma vez na inicialização
  useEffect(() => {
    const loadFavorites = () => {
      try {
        const savedFavorites = localStorage.getItem('ecofly-favorites')
        if (savedFavorites) {
          const parsedFavorites = JSON.parse(savedFavorites)
          console.log('Favoritos carregados do localStorage:', parsedFavorites)
          setFavorites(parsedFavorites)
        } else {
          console.log('Nenhum favorito encontrado no localStorage')
          setFavorites([])
        }
      } catch (error) {
        console.error('Erro ao carregar favoritos do localStorage:', error)
        localStorage.removeItem('ecofly-favorites')
        setFavorites([])
      } finally {
        setIsLoaded(true)
      }
    }

    if (!isLoaded) {
      loadFavorites()
    }
  }, [isLoaded])

  // Salvar no localStorage sempre que favorites mudar (apenas após carregar)
  useEffect(() => {
    if (isLoaded) {
      console.log('Salvando favoritos no localStorage:', favorites)
      localStorage.setItem('ecofly-favorites', JSON.stringify(favorites))
    }
  }, [favorites, isLoaded])

  const addToFavorites = (item: FavoriteItem) => {
    console.log('=== ADICIONANDO AOS FAVORITOS ===')
    console.log('Item a ser adicionado:', item)
    console.log('Favoritos atuais antes da adição:', favorites)
    
    setFavorites(prevFavorites => {
      // Verificar se o item já existe usando o ID
      const itemExists = prevFavorites.some(fav => fav.id === item.id)
      
      if (itemExists) {
        console.log('Item já existe nos favoritos, não adicionando')
        return prevFavorites
      }
      
      const newFavorites = [...prevFavorites, item]
      console.log('Novos favoritos após adição:', newFavorites)
      console.log('Total de favoritos:', newFavorites.length)
      
      return newFavorites
    })
  }

  const removeFromFavorites = (itemId: number) => {
    console.log('=== REMOVENDO DOS FAVORITOS ===')
    console.log('ID do item a ser removido:', itemId)
    console.log('Favoritos atuais antes da remoção:', favorites)
    
    setFavorites(prevFavorites => {
      const newFavorites = prevFavorites.filter(item => item.id !== itemId)
      console.log('Favoritos após remoção:', newFavorites)
      console.log('Total de favoritos:', newFavorites.length)
      
      return newFavorites
    })
  }

  const isFavorite = (itemId: number) => {
    const result = favorites.some(item => item.id === itemId)
    console.log(`Item ${itemId} é favorito?`, result)
    return result
  }

  const toggleFavorite = (item: FavoriteItem) => {
    console.log('=== TOGGLE FAVORITO ===')
    console.log('Item:', item.name, 'ID:', item.id)
    console.log('Estado atual dos favoritos:', favorites.map(f => ({ id: f.id, name: f.name })))
    
    const isCurrentlyFavorite = favorites.some(fav => fav.id === item.id)
    console.log('É favorito atualmente?', isCurrentlyFavorite)
    
    if (isCurrentlyFavorite) {
      removeFromFavorites(item.id)
    } else {
      addToFavorites(item)
    }
  }

  const clearAllFavorites = () => {
    console.log('=== LIMPANDO TODOS OS FAVORITOS ===')
    setFavorites([])
    localStorage.removeItem('ecofly-favorites')
  }

  // Debug logs
  console.log('Hook estado atual:', { 
    favoritesCount: favorites.length, 
    favoriteIds: favorites.map(f => f.id),
    favorites: favorites.map(f => ({ id: f.id, name: f.name })),
    isLoaded
  })

  return {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
    clearAllFavorites,
    favoritesCount: favorites.length,
    isLoaded
  }
}