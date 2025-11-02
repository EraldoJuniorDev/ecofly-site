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
  ChevronDown,
  Settings,
} from 'lucide-react'
import { Button } from '../ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '../ui/sheet'
import { Badge } from '../ui/badge'
import ThemeToggle from './ThemeToggle'
import { useCart } from '../../context/CartContext'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'

const Header = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [loadingLogout, setLoadingLogout] = useState(false)
  const location = useLocation()
  const { cartCount } = useCart()

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
          .from('profiles')
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
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile, error }) => {
            setIsAdmin(profile?.role === 'admin')
          })
      } else if (event === 'SIGNED_OUT') {
        setIsAdmin(false)
      }
    })

    return () => authListener.subscription.unsubscribe()
  }, [])

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

  // Componente do botão de perfil com dropdown
  const ProfileButton = ({ mobile = false }: { mobile?: boolean }) => {
    const [open, setOpen] = useState(false)

    return (
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={`
            relative flex items-center h-10 px-3 rounded-xl
            hover:bg-emerald-500/10 hover:text-emerald-600
            focus-visible:ring-2 focus-visible:ring-emerald-500
            transition-all duration-200
            ${mobile ? 'w-full justify-start' : 'w-10'}
          `}
          >
            <User className="h-5 w-5" />
            {mobile && <span className="ml-2 text-sm font-medium">Minha Conta</span>}
            <ChevronDown
              className={`h-4 w-4 ml-2 transition-transform duration-300
              ${open ? 'rotate-180' : ''}`}
            />
            <span className="sr-only">Menu do usuário</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-64 mt-2">
          {/* Cabeçalho */}
          <DropdownMenuLabel className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
              {user?.user_metadata?.display_name?.[0]?.toUpperCase() ||
                user?.email?.[0]?.toUpperCase() ||
                'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">
                {user?.user_metadata?.display_name ||
                  user?.email?.split('@')[0] ||
                  'Usuário'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          {/* Perfil */}
          <DropdownMenuItem className="cursor-pointer hover:!bg-emerald-600 hover:!text-white focus:!bg-emerald-600 focus:!text-white transition-colors">
            <Link to="/user" className="flex w-full items-center">
              <User className="mr-2 h-4 w-4" />
              Perfil
            </Link>
          </DropdownMenuItem>

          {/* Admin */}
          {isAdmin && (
            <DropdownMenuItem
              className="group cursor-pointer focus:!bg-emerald-600"
              onSelect={(e) => e.preventDefault()} // impede fechamento ao clicar
            >
              <Link
                to="/admin"
                className="flex w-full items-center justify-between font-medium transition-colors
                 group-hover:text-white
                 group-focus:text-white"
              >
                <div className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  Painel Admin
                </div>
              </Link>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {/* Sair */}
          <DropdownMenuItem
            className="text-red-600 hover:bg-red-600 focus:bg-red-600 focus:text-muted dark:text-muted-foreground cursor-pointer"
            onSelect={() => setShowLogoutDialog(true)}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <>
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
                className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary relative ${isActive(item.href)
                  ? 'text-primary border-b-2 border-primary pb-1'
                  : 'text-muted-foreground'
                  }`}
              >
                {React.cloneElement(item.icon, {
                  className: 'h-4 w-4',
                })}
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Ações Desktop */}
          <div className="hidden lg:flex items-center gap-2">
            {user ? (
              <>
                <ProfileButton />
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
              </>
            ) : (
              <Link to="/login">
                <Button variant="ghost" size="icon" title="Entrar">
                  <LogIn className="h-5 w-5" />
                </Button>
              </Link>
            )}
            <ThemeToggle />
          </div>

          {/* Mobile */}
          {/* Mobile - Perfil + Tema + Menu */}
          <div className="flex items-center gap-2 lg:hidden">
            {user && <ProfileButton mobile={false} />}

            <ThemeToggle />

            {/* Menu hambúrguer */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
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
                          className={`text-base font-medium transition-colors hover:text-primary px-4 py-2 rounded-lg flex items-center justify-between ${isActive(item.href)
                            ? 'text-primary bg-primary/10'
                            : 'text-muted-foreground hover:bg-accent'
                            }`}
                        >
                          <span className="flex items-center gap-2">
                            {React.cloneElement(item.icon, {
                              className: `h-4 w-4 ${item.href === '/carrinho' && cartCount > 0
                                ? 'text-emerald-500'
                                : ''
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

                    {!user && (
                      <SheetClose asChild>
                        <Link
                          to="/login"
                          className="text-base font-medium text-muted-foreground hover:text-primary px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-accent"
                        >
                          <LogIn className="h-4 w-4" />
                          Entrar
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

      {/* Dialog de logout */}
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
              {loadingLogout ? 'Saindo...' : 'Sair'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default Header