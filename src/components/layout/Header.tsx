import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, Heart } from 'lucide-react'
import MainLogo from '../../../public/favicon.ico'
import { Button } from '../ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '../ui/sheet'
import { Badge } from '../ui/badge'
import ThemeToggle from './ThemeToggle'
import { useFavorites } from '../../context/FavoritesContext'

console.log('Header component loading...')

const Header = () => {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const { favoritesCount } = useFavorites()

  console.log('Header rendered, current location:', location.pathname)
  console.log('Favorites count:', favoritesCount)

  const menuItems = [
    { href: '/', label: 'Início' },
    { href: '/catalogo', label: 'Catálogo' },
    { href: '/feedback', label: 'Feedback' },
    { href: '/contato', label: 'Contato' }
  ]

  const isActive = (href: string) => location.pathname === href

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <img src={MainLogo} alt="Logo" className='w-14'/>
          <div className="flex flex-col">
            <span className="text-xl font-bold eco-text-gradient">ECOFLY</span>
            <span className="text-xs text-muted-foreground -mt-1">ecobags personalizadas</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-6">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`text-sm font-medium transition-colors hover:text-primary relative ${
                isActive(item.href)
                  ? 'text-primary border-b-2 border-primary pb-1'
                  : 'text-muted-foreground'
              }`}
            >
              {item.label}
              {item.href === '/favoritos' && favoritesCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs animate-scale-in"
                >
                  {favoritesCount}
                </Badge>
              )}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-2">
          <Link to="/favoritos">
            <Button variant="ghost" size="icon" className="relative">
              <Heart className={`h-5 w-5 ${favoritesCount > 0 ? 'text-red-500' : ''}`} />
              {favoritesCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs animate-scale-in"
                >
                  {favoritesCount}
                </Badge>
              )}
              <span className="sr-only">Favoritos ({favoritesCount})</span>
            </Button>
          </Link>
          <ThemeToggle />
        </div>

        {/* Mobile Navigation */}
        <div className="flex items-center gap-2 lg:hidden">
          <Link to="/favoritos">
            <Button variant="ghost" size="icon" className="relative">
              <Heart className={`h-5 w-5 ${favoritesCount > 0 ? 'text-red-500' : ''}`} />
              {favoritesCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs animate-scale-in"
                >
                  {favoritesCount}
                </Badge>
              )}
              <span className="sr-only">Favoritos ({favoritesCount})</span>
            </Button>
          </Link>
          <ThemeToggle />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-primary">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col h-full">
                <div className="flex items-center space-x-2 py-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full eco-gradient">
                  </div>
                  <span className="text-lg font-bold eco-text-gradient">ECOFLY</span>
                </div>
                
                <nav className="flex flex-col space-y-4 mt-8">
                  {menuItems.map((item) => (
                    <SheetClose asChild key={item.href}>
                      <Link
                        to={item.href}
                        className={`text-lg font-medium transition-colors hover:text-primary px-4 py-2 rounded-lg relative flex items-center justify-between ${
                          isActive(item.href)
                            ? 'text-primary bg-primary/10'
                            : 'text-muted-foreground hover:bg-accent'
                        }`}
                      >
                        <span>{item.label}</span>
                        {item.href === '/favoritos' && favoritesCount > 0 && (
                          <Badge 
                            variant="destructive" 
                            className="h-5 w-5 p-0 flex items-center justify-center text-xs"
                          >
                            {favoritesCount}
                          </Badge>
                        )}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

export default Header