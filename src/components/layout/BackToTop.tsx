import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { ChevronUp } from 'lucide-react'

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  console.log('BackToTop component rendered with minimal design')

  useEffect(() => {
    const toggleVisibility = () => {
      const scrolled = window.pageYOffset
      const maxHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = (scrolled / maxHeight) * 100

      setScrollProgress(progress)
      setIsVisible(scrolled > 300)
    }

    const handleScroll = () => requestAnimationFrame(toggleVisibility)
    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const scrollToTop = () => {
    console.log('ScrollToTop clicked with smooth animation')
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 group">
      {/* Progress Ring */}
      <div className="relative">
        <svg
          className="w-14 h-14 transform -rotate-90 absolute"
          viewBox="0 0 56 56"
        >
          {/* Background circle */}
          <circle
            cx="28"
            cy="28"
            r="24"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-muted/30"
          />
          {/* Progress circle */}
          <circle
            cx="28"
            cy="28"
            r="24"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 24}`}
            strokeDashoffset={`${2 * Math.PI * 24 * (1 - scrollProgress / 100)}`}
            className="text-primary transition-all duration-300 ease-out"
            strokeLinecap="round"
          />
        </svg>
        
        {/* Main Button */}
        <Button
          onClick={scrollToTop}
          className={`
            relative w-14 h-14 rounded-full shadow-lg
            eco-gradient text-white hover:opacity-90 
            transition-all duration-300 hover-scale
            group-hover:shadow-lg
            micro-interaction
            ${isVisible ? 'animate-scale-in' : ''}
          `}
          size="icon"
          aria-label="Voltar ao topo"
        >
          {/* Icon */}
          <ChevronUp className="h-5 w-5 transition-transform duration-200 group-hover:-translate-y-0.5" />
        </Button>
        
        {/* Tooltip */}
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
          Voltar ao topo
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-black/80"></div>
        </div>
      </div>
    </div>
  )
}

export default BackToTop