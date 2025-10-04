import React from 'react'
import { Button } from '../components/ui/button'
import { MessageCircle } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { WHATSAPP_LINK } from "../constants"
import productsData from "../data/products.json";

const Store = () => {
  console.log('Store page rendered with enhanced product cards')

function ProductsList() {
  return (
    <div>
      {productsData.map((product) => (
        <div key={product.id}>
          <h2>{product.name}</h2>
          <p>{product.description}</p>
          {product.images.map((img, i) => (
            <img key={i} src={img.url} alt={img.alt} width="200" />
          ))}
        </div>
      ))}
    </div>
  );
}

  const categories = ["Todos", "EcoBags", "Cinzeiros", "Mini Telas"]
  const [selectedCategory, setSelectedCategory] = React.useState("Todos")

  const filteredProducts = selectedCategory === "Todos" 
    ? productsData
    : productsData.filter(product => product.category === selectedCategory)

  const handleWhatsApp = (productName: string) => {
    const message = `Olá! Poderia me fornecer mais informações sobre os produtos da ECOFLY?`
    const whatsappUrl = `${WHATSAPP_LINK}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <div className="container px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 eco-text-gradient">
          Nossos Produtos
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Cada peça é única, feita com amor e consciência ambiental. Explore todos os ângulos dos nossos produtos artesanais.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            onClick={() => setSelectedCategory(category)}
            className={selectedCategory === category ? "eco-gradient text-white" : ""}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            category={product.category}
            images={product.images}
            description={product.description}
            onWhatsAppClick={handleWhatsApp}
          />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            Nenhum produto encontrado nesta categoria.
          </p>
        </div>
      )}

      {/* Call to Action */}
      <div className="text-center mt-16 p-8 rounded-2xl eco-gradient text-white">
        <h2 className="text-2xl font-bold mb-4">Não encontrou o que procura?</h2>
        <p className="text-lg mb-6 opacity-90">
          Fazemos produtos personalizados sob encomenda!
        </p>
        <Button 
          onClick={() => handleWhatsApp("produto personalizado")}
          variant="secondary" 
          size="lg"
          className="bg-white text-primary hover:bg-white/90"
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          Solicitar Orçamento
        </Button>
      </div>
    </div>
  )
}

export default Store