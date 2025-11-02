import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Menu,
  ShoppingCart,
  LogIn,
  LogOut,
  User,
  Home,
  ShoppingBag,
  MessageSquare,
  Phone,
} from 'lucide-react'
import { Button } from '../ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '../ui/sheet'
import { Badge } from '../ui/badge'
import ThemeToggle from './ThemeToggle'
import { useCart } from '../../context/CartContext' // Correct import
import { supabase } from '../../lib/supabaseClient'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog'

const Header = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [loadingLogout, setLoadingLogout] = useState(false)
  const location = useLocation()
  const { cartCount } = useCart() // Correct variable

  // Fetch user and role
  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) {
        console.error('Error fetching user:', userError)
        setUser(null)
        setIsAdmin(false)
        return
      }
      setUser(user)
      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        if (profileError) {
          console.error('Error fetching profile:', profileError)
          setIsAdmin(false)
        } else {
          setIsAdmin(profile?.role === 'admin')
        }
      } else {
        setIsAdmin(false)
      }
    }
    getUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
      if (event === 'SIGNED_IN' && session?.user) {
        supabase
          .from('user_profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile, error: profileError }) => {
            if (profileError) {
              console.error('Error fetching profile on auth change:', profileError)
              setIsAdmin(false)
            } else {
              setIsAdmin(profile?.role === 'admin')
            }
          })
      } else if (event === 'SIGNED_OUT') {
        setIsAdmin(false)
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  // Logout with confirmation dialog
  const handleLogout = async () => {
    setLoadingLogout(true)
    try {
      await supabase.auth.signOut()
      setUser(null)
      setIsAdmin(false)
      toast.success("Logout realizado com sucesso!")
      setShowLogoutDialog(false)
    } catch (error) {
      console.error("Erro ao sair:", error)
      toast.error("Erro ao sair. Tente novamente.")
    } finally {
      setLoadingLogout(false)
    }
  }

  const menuItems = [
    { href: '/', label: 'Início', icon: <Home /> },
    { href: '/catalogo', label: 'Catálogo', icon: <ShoppingBag /> },
    { href: '/feedback', label: 'Feedback', icon: <MessageSquare /> },
    { href: '/contato', label: 'Contato', icon: <Phone /> },
    { href: '/carrinho', label: 'Carrinho', icon: <ShoppingCart /> },
  ]

  const isActive = (href: string) => location.pathname === href

  return (
    <>
      {/* Header principal */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur transition-colors duration-500">
        <div className="container flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <img
              src="https://euxlnqarxvbyaaqofyqh.supabase.co/storage/v1/object/public/item-images/images/logo/favicon.ico"
              alt="Logo"
              className="w-14"
            />
            <div className="flex flex-col">
              <span className="text-xl font-bold eco-text-gradient">ECOFLY</span>
              <span className="text-xs text-muted-foreground -mt-1">ecobags personalizadas</span>
            </div>
          </Link>

          {/* Menu Desktop */}
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
                <Link to={isAdmin ? '/admin' : '/user'}>
                  <Button variant="ghost" size="icon" title={isAdmin ? 'Painel Admin' : 'Perfil'}>
                    <User className="h-5 w-5 text-muted-foreground hover:text-primary" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowLogoutDialog(true)}
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

            {/* Carrinho */}
            <Link to="/carrinho">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5 text-emerald-500" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs text-white">
                    {cartCount}
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
                <Link to={isAdmin ? '/admin' : '/user'}>
                  <Button variant="ghost" size="icon" title={isAdmin ? 'Painel Admin' : 'Perfil'}>
                    <User className="h-5 w-5 text-muted-foreground hover:text-primary" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowLogoutDialog(true)}
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
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6 text-muted-foreground" />
                  <span className="sr-only">Abrir menu</span>
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col h-full">
                  <div className="flex items-center space-x-2 py-4">
                    <img
                      src="https://euxlnqarxvbyaaqofyqh.supabase.co/storage/v1/object/public/item-images/images/logo/favicon.ico"
                      alt="Logo"
                      className="w-8 h-8"
                    />
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
                                item.href === '/carrinho' && cartCount > 0
                                  ? 'text-emerald-500'
                                  : 'text-muted-foreground hover:text-primary'
                              }`,
                            })}
                            {item.label}
                          </span>
                          {item.href === '/carrinho' && cartCount > 0 && (
                            <Badge className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                              {cartCount}
                            </Badge>
                          )}
                        </Link>
                      </SheetClose>
                    ))}
                    {user && (
                      <SheetClose asChild>
                        <Link
                          to={isAdmin ? '/admin' : '/user'}
                          className={`text-base font-medium transition-colors hover:text-primary px-4 py-2 rounded-lg flex items-center justify-between ${
                            isActive(isAdmin ? '/admin' : '/user')
                              ? 'text-primary bg-primary/10'
                              : 'text-muted-foreground hover:bg-accent'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground hover:text-primary" />
                            {isAdmin ? 'Painel Admin' : 'Perfil'}
                          </span>
                        </Link>
                      </SheetClose>
                    )}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Dialog de confirmação de logout */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirmar saída</DialogTitle>
            <DialogDescription>
              Tem certeza de que deseja sair da sua conta?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogout}
              disabled={loadingLogout}
            >
              {loadingLogout ? 'Saindo...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default Header