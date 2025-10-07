import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Menu,
  Heart,
  LogIn,
  LogOut,
  User,
  Home,
  ShoppingBag,
  MessageSquare,
  Phone,
} from 'lucide-react'
import MainLogo from '../../../public/favicon.ico'
import { Button } from '../ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '../ui/sheet'
import { Badge } from '../ui/badge'
import ThemeToggle from './ThemeToggle'
import { useFavorites } from '../../context/FavoritesContext'
import { supabase } from '../../lib/supabaseClient'

const Header = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState(null)
  const location = useLocation()
  const { favoritesCount } = useFavorites()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const menuItems = [
    { href: '/', label: 'Início', icon: <Home /> },
    { href: '/catalogo', label: 'Catálogo', icon: <ShoppingBag /> },
    { href: '/feedback', label: 'Feedback', icon: <MessageSquare /> },
    { href: '/contato', label: 'Contato', icon: <Phone /> },
    { href: '/favoritos', label: 'Favoritos', icon: <Heart /> }
  ]

  const isActive = (href: string) => location.pathname === href

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <img src={MainLogo} alt="Logo" className="w-14" />
          <div className="flex flex-col">
            <span className="text-xl font-bold eco-text-gradient">ECOFLY</span>
            <span className="text-xs text-muted-foreground -mt-1">ecobags personalizadas</span>
          </div>
        </Link>

        {/* Menu Desktop com ícones (sem Favoritos) */}
        <nav className="hidden lg:flex items-center space-x-6">
          {menuItems.slice(0, 4).map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary relative ${
                isActive(item.href)
                  ? 'text-primary border-b-2 border-primary pb-1'
                  : 'text-muted-foreground'
              }`}
            >
              {React.cloneElement(item.icon, {
                className: 'h-4 w-4 text-muted-foreground hover:text-primary',
              })}
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Ações Desktop */}
        <div className="hidden lg:flex items-center gap-2">
          {user ? (
            <>
              <Link to="/admin">
                <Button variant="ghost" size="icon" title="Painel Admin">
                  <User className="h-5 w-5 text-muted-foreground hover:text-primary" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title="Sair"
              >
                <LogOut className="h-5 w-5 text-red-500 hover:text-red-400" />
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button variant="ghost" size="icon" title="Entrar">
                <LogIn className="h-5 w-5 text-muted-foreground hover:text-primary" />
              </Button>
            </Link>
          )}

          {/* Ícone de Favoritos só desktop */}
          <Link to="/favoritos">
            <Button variant="ghost" size="icon" className="relative">
              <Heart className="h-5 w-5 text-red-500" />
              {favoritesCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {favoritesCount}
                </Badge>
              )}
            </Button>
          </Link>

          <ThemeToggle />
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-2 lg:hidden">
          {user ? (
            <>
              <Link to="/admin">
                <Button variant="ghost" size="icon" title="Painel Admin">
                  <User className="h-5 w-5 text-muted-foreground hover:text-primary" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title="Sair"
              >
                <LogOut className="h-5 w-5 text-red-500 hover:text-red-400" />
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button variant="ghost" size="icon" title="Entrar">
                <LogIn className="h-5 w-5 text-muted-foreground hover:text-primary" />
              </Button>
            </Link>
          )}

          <ThemeToggle />

          {/* Menu hambúrguer mobile */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-primary">
                <Menu className="h-6 w-6 text-muted-foreground" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col h-full">
                <div className="flex items-center space-x-2 py-4">
                  <img src={MainLogo} alt="Logo" className="w-8 h-8" />
                  <span className="text-lg font-bold eco-text-gradient">ECOFLY</span>
                </div>

                <nav className="flex flex-col space-y-3 mt-8">
                  {menuItems.map((item) => (
                    <SheetClose asChild key={item.href}>
                      <Link
                        to={item.href}
                        className={`text-base font-medium transition-colors hover:text-primary px-4 py-2 rounded-lg flex items-center justify-between ${
                          isActive(item.href)
                            ? 'text-primary bg-primary/10'
                            : 'text-muted-foreground hover:bg-accent'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {React.cloneElement(item.icon, {
                            className: `h-4 w-4 ${
                              item.href === '/favoritos' && favoritesCount > 0
                                ? 'text-red-500'
                                : 'text-muted-foreground hover:text-primary'
                            }`,
                          })}
                          {item.label}
                        </span>
                        {item.href === '/favoritos' && favoritesCount > 0 && (
                          <Badge className="h-5 w-5 p-0 flex items-center justify-center text-xs">
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
