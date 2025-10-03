import React from 'react'
import { useFavorites } from '../hooks/useFavorites'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Heart, MessageCircle, Trash2, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

const Favorites = () => {
  console.log('Favorites page rendered')

  const { favorites, removeFromFavorites, clearAllFavorites } = useFavorites()

  const handleWhatsApp = (productName: string) => {
    const message = `Olá! Tenho interesse no produto dos meus favoritos: ${productName}. Poderia me dar mais informações?`
    const whatsappUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const handleRemoveFavorite = (itemId: number, itemName: string) => {
    removeFromFavorites(itemId)
    toast.success(`${itemName} removido dos favoritos`)
  }

  const handleClearAll = () => {
    if (favorites.length === 0) return
    
    const confirmed = window.confirm('Tem certeza que deseja remover todos os favoritos?')
    if (confirmed) {
      clearAllFavorites()
      toast.success('Todos os favoritos foram removidos')
    }
  }

  if (favorites.length === 0) {
    return (
      <div className="container px-4 py-16">
        <div className="text-center max-w-lg mx-auto">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted/30 flex items-center justify-center">
            <Heart className="h-12 w-12 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Seus Favoritos</h1>
          <p className="text-muted-foreground mb-8">
            Você ainda não adicionou nenhum produto aos favoritos. 
            Explore nossa loja e salve os produtos que mais gostar!
          </p>
          <Link to="/loja">
            <Button className="eco-gradient text-white">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Explorar Produtos
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold eco-text-gradient">
            Meus Favoritos
          </h1>
          <p className="text-muted-foreground mt-2">
            {favorites.length} {favorites.length === 1 ? 'produto favoritado' : 'produtos favoritados'}
          </p>
        </div>
        
        {favorites.length > 0 && (
          <Button 
            variant="outline" 
            onClick={handleClearAll}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Limpar Todos
          </Button>
        )}
      </div>

      {/* Favorites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {favorites.map((item) => (
          <Card key={item.id} className="group overflow-hidden hover-subtle animate-fade-in-up">
            <div className="relative aspect-square overflow-hidden bg-muted/20">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              
              {/* Favorite Badge */}
              <div className="absolute top-3 left-3">
                <Badge variant="secondary" className="bg-red-500/90 text-white">
                  <Heart className="w-3 h-3 mr-1 fill-current" />
                  Favoritado
                </Badge>
              </div>

              {/* Remove Button */}
              <button
                onClick={() => handleRemoveFavorite(item.id, item.name)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm text-gray-700 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all duration-200 opacity-0 group-hover:opacity-100"
                title="Remover dos favoritos"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <Badge variant="secondary" className="text-xs">
                  {item.category}
                </Badge>
              </div>
              
              <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors duration-200">
                {item.name}
              </h3>
              
              <p className="text-sm text-muted-foreground line-clamp-2">
                {item.description}
              </p>

              <div className="flex gap-2">
                <Button 
                  onClick={() => handleWhatsApp(item.name)}
                  className="flex-1 eco-gradient text-white btn-smooth"
                  size="sm"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
                
                <Button
                  onClick={() => handleRemoveFavorite(item.id, item.name)}
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive border-destructive/20 hover:border-destructive"
                >
                  <Heart className="w-4 h-4 fill-current" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Call to Action */}
      <div className="text-center mt-12 p-8 rounded-2xl bg-muted/30">
        <h2 className="text-xl font-semibold mb-4">Encontrou tudo que procurava?</h2>
        <p className="text-muted-foreground mb-6">
          Continue explorando nossa loja para descobrir mais produtos únicos e sustentáveis!
        </p>
        <Link to="/loja">
          <Button className="eco-gradient text-white">
            <ShoppingBag className="w-4 h-4 mr-2" />
            Ver Mais Produtos
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default Favorites