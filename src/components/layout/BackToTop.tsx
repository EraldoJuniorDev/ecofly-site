import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { ChevronUp } from 'lucide-react'

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false)

  console.log('BackToTop component rendered')

  // Monitora o scroll da página
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)

    return () => {
      window.removeEventListener('scroll', toggleVisibility)
    }
  }, [])

  // Função para scroll suave até o topo
  const scrollToTop = () => {
    console.log('ScrollToTop clicked')
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  if (!isVisible) {
    return null
  }

  return (
    <Button
      onClick={scrollToTop}
      className={`
        fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full shadow-lg
        eco-gradient text-white hover:opacity-90 transition-all duration-300
        transform hover:scale-110 animate-bounce
        ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}
      size="icon"
      aria-label="Voltar ao topo"
    >
      <ChevronUp className="h-6 w-6" />
    </Button>
  )
}

export default BackToTop