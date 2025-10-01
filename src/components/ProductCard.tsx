import React, { useState } from 'react'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog'
import { MessageCircle, Star, Heart, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'

interface ProductImage {
  url: string
  alt: string
}

interface ProductCardProps {
  id: number
  name: string
  category: string
  images: ProductImage[]
  description: string
  onWhatsAppClick: (productName: string) => void
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  category,
  images,
  description,
  onWhatsAppClick
}) => {
  console.log(`ProductCard ${id} rendered with ${images.length} images`)
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [modalImageIndex, setModalImageIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const nextModalImage = () => {
    setModalImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevModalImage = () => {
    setModalImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleImageSelect = (index: number) => {
    setCurrentImageIndex(index)
  }

  const handleModalImageSelect = (index: number) => {
    setModalImageIndex(index)
  }

  return (
    <Card 
      className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Image Container */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={images[currentImageIndex]?.url || images[0]?.url}
          alt={images[currentImageIndex]?.alt || name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Navigation Arrows - Only show if multiple images */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className={`absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center transition-opacity ${
                isHovered ? 'opacity-100' : 'opacity-0'
              } hover:bg-black/70`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextImage}
              className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center transition-opacity ${
                isHovered ? 'opacity-100' : 'opacity-0'
              } hover:bg-black/70`}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
            {currentImageIndex + 1}/{images.length}
          </div>
        )}

        {/* Zoom Icon */}
        <Dialog>
          <DialogTrigger asChild>
            <button 
              className={`absolute top-2 left-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center transition-opacity ${
                isHovered ? 'opacity-100' : 'opacity-0'
              } hover:bg-black/70`}
              onClick={() => setModalImageIndex(currentImageIndex)}
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </DialogTrigger>
          
          {/* Modal Content */}
          <DialogContent className="max-w-4xl max-h-[90vh] p-0">
            <div className="relative">
              {/* Modal Main Image */}
              <div className="relative aspect-square max-h-[70vh] overflow-hidden rounded-t-lg">
                <img
                  src={images[modalImageIndex]?.url}
                  alt={images[modalImageIndex]?.alt || name}
                  className="w-full h-full object-contain bg-black"
                />
                
                {/* Modal Navigation */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevModalImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={nextModalImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Modal Thumbnails */}
              {images.length > 1 && (
                <div className="p-4 border-t">
                  <div className="flex gap-2 overflow-x-auto">
                    {images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => handleModalImageSelect(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-colors ${
                          index === modalImageIndex 
                            ? 'border-primary' 
                            : 'border-transparent hover:border-muted-foreground'
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

              {/* Modal Product Info */}
              <div className="p-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {category}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {modalImageIndex + 1} de {images.length}
                  </span>
                </div>
                <h3 className="font-semibold text-lg mb-2">{name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{description}</p>
                
                <Button 
                  onClick={() => onWhatsAppClick(name)}
                  className="w-full eco-gradient text-white hover:opacity-90"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Consultar no WhatsApp
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Thumbnail Navigation */}
      {images.length > 1 && (
        <div className="p-2 border-b bg-muted/30">
          <div className="flex gap-1 overflow-x-auto">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => handleImageSelect(index)}
                className={`flex-shrink-0 w-12 h-12 rounded overflow-hidden border-2 transition-colors ${
                  index === currentImageIndex 
                    ? 'border-primary' 
                    : 'border-transparent hover:border-muted-foreground'
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

      {/* Card Content */}
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <Badge variant="secondary" className="text-xs">
            {category}
          </Badge>
          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
            <Heart className="h-4 w-4 text-muted-foreground hover:text-red-500" />
          </Button>
        </div>
        
        <h3 className="font-semibold text-sm line-clamp-2">{name}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
        
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-3 w-3 fill-primary text-primary" />
          ))}
          <span className="text-xs text-muted-foreground ml-1">(5.0)</span>
        </div>

        <Button 
          onClick={() => onWhatsAppClick(name)}
          className="w-full eco-gradient text-white hover:opacity-90 transition-opacity"
          size="sm"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Consultar no WhatsApp
        </Button>
      </CardContent>
    </Card>
  )
}

export default ProductCard