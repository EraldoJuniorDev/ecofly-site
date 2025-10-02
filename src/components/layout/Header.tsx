import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, Leaf } from 'lucide-react'
import { Button } from '../ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '../ui/sheet'
import ThemeToggle from './ThemeToggle'

console.log('Header component loading...')

const Header = () => {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  console.log('Header rendered, current location:', location.pathname)

  const menuItems = [
    { href: '/', label: 'Início' },
    { href: '/loja', label: 'Loja' },
    { href: '/ecobags', label: 'EcoBags' },
    { href: '/cinzeiros', label: 'Cinzeiros' },
    { href: '/mini-telas', label: 'Mini Telas' },
    { href: '/feedback', label: 'Feedback' },
    { href: '/contato', label: 'Contato' }
  ]

  const isActive = (href: string) => location.pathname === href

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <div className="flex items-center justify-center w-10 h-10 rounded-full eco-gradient">
            <Leaf className="h-6 w-6 text-white" />
          </div>
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
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive(item.href)
                  ? 'text-primary border-b-2 border-primary pb-1'
                  : 'text-muted-foreground'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Theme Toggle */}
        <div className="hidden lg:flex items-center">
          <ThemeToggle />
        </div>

        {/* Mobile Navigation */}
        <div className="flex items-center gap-2 lg:hidden">
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
                    <Leaf className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-lg font-bold eco-text-gradient">ECOFLY</span>
                </div>
                
                <nav className="flex flex-col space-y-4 mt-8">
                  {menuItems.map((item) => (
                    <SheetClose asChild key={item.href}>
                      <Link
                        to={item.href}
                        className={`text-lg font-medium transition-colors hover:text-primary px-4 py-2 rounded-lg ${
                          isActive(item.href)
                            ? 'text-primary bg-primary/10'
                            : 'text-muted-foreground hover:bg-accent'
                        }`}
                      >
                        {item.label}
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