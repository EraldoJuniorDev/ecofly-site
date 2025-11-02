// src/components/Header.tsx
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
  const [profilePic, setProfilePic] = useState<string | null>(null)
  const location = useLocation()
  const { cartCount } = useCart()

  // Carrega usuário + foto
  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        setUser(null)
        setIsAdmin(false)
        setProfilePic(null)
        return
      }

      setUser(user)

      // Busca foto de perfil
      const { data: profile } = await supabase
        .from('profiles')
        .select('avatar_url, role')
        .eq('id', user.id)
        .single()

      if (profile?.avatar_url) {
        const { data } = supabase.storage
          .from('profile_pics')
          .getPublicUrl(profile.avatar_url)
        setProfilePic(data.publicUrl + `?t=${Date.now()}`)
      }

      setIsAdmin(profile?.role === 'admin')
    }

    getUser()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const loggedUser = session?.user || null
      setUser(loggedUser)

      if (loggedUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('avatar_url, role')
          .eq('id', loggedUser.id)
          .single()

        if (profile?.avatar_url) {
          const { data } = supabase.storage.from('profile_pics').getPublicUrl(profile.avatar_url)
          setProfilePic(data.publicUrl + `?t=${Date.now()}`)
        } else {
          setProfilePic(null)
        }
        setIsAdmin(profile?.role === 'admin')
      } else {
        setProfilePic(null)
        setIsAdmin(false)
      }
    })

    return () => authListener.subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    setLoadingLogout(true)
    try {
      await supabase.auth.signOut()
      toast.success("Logout realizado com sucesso!")
      setShowLogoutDialog(false)
    } catch (error) {
      toast.error("Erro ao sair.")
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

  // Componente do botão de perfil com foto
  const ProfileButton = ({ mobile = false }: { mobile?: boolean }) => {
    const [open, setOpen] = useState(false)
    const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Usuário'

    return (
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={`flex items-center gap-2 h-10 px-3 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-600 transition-all ${mobile ? 'w-full justify-start' : ''}`}
          >
            <div className="relative">
              {profilePic ? (
                <img
                  src={profilePic}
                  alt="Perfil"
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/20"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {displayName[0].toUpperCase()}
                </div>
              )}
            </div>
            {!mobile && (
              <span className="text-sm font-medium truncate max-w-32">
                {displayName}
              </span>
            )}
            <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-64 mt-2">
          <DropdownMenuLabel className="flex items-center gap-3">
            <div className="relative">
              {profilePic ? (
                <img src={profilePic} alt="Perfil" className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-500/30" />
              ) : (
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg">
                  {displayName[0].toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link to="/user" className="flex items-center cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              Perfil
            </Link>
          </DropdownMenuItem>

          {isAdmin && (
            <DropdownMenuItem asChild>
              <Link to="/admin" className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  Painel Admin
                </div>
              </Link>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="text-red-600 focus:bg-red-600 focus:text-white cursor-pointer"
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
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition">
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

          {/* Desktop Menu */}
          <nav className="hidden lg:flex items-center space-x-6">
            {menuItems.slice(0, 4).map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary relative ${
                  isActive(item.href) ? 'text-primary border-b-2 border-primary pb-1' : 'text-muted-foreground'
                }`}
              >
                {React.cloneElement(item.icon, { className: 'h-4 w-4' })}
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <>
                <ProfileButton />
                <Link to="/carrinho">
                  <Button variant="ghost" size="icon" className="relative">
                    <ShoppingCart className="h-5 w-5 text-emerald-500" />
                    {cartCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs text-white bg-emerald-600">
                        {cartCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
              </>
            ) : (
              <Link to="/login">
                <Button variant="ghost" size="icon">
                  <LogIn className="h-5 w-5" />
                </Button>
              </Link>
            )}
            <ThemeToggle />
          </div>

          {/* Mobile */}
          <div className="flex items-center gap-2 lg:hidden">
            {user && <ProfileButton mobile />}
            <ThemeToggle />

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <div className="flex flex-col h-full">
                  <div className="flex items-center space-x-2 py-4 border-b">
                    <img src="https://euxlnqarxvbyaaqofyqh.supabase.co/storage/v1/object/public/item-images/images/logo/favicon.ico" alt="Logo" className="w-8 h-8" />
                    <span className="text-lg font-bold eco-text-gradient">ECOFLY</span>
                  </div>

                  <nav className="flex flex-col space-y-2 mt-6">
                    {menuItems.map((item) => (
                      <SheetClose asChild key={item.href}>
                        <Link
                          to={item.href}
                          className={`flex items-center justify-between px-4 py-3 rounded-lg transition ${
                            isActive(item.href)
                              ? 'bg-emerald-100 text-emerald-700 font-medium'
                              : 'text-muted-foreground hover:bg-accent'
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            {React.cloneElement(item.icon, {
                              className: `h-5 w-5 ${item.href === '/carrinho' && cartCount > 0 ? 'text-emerald-600' : ''}`,
                            })}
                            {item.label}
                          </span>
                          {item.href === '/carrinho' && cartCount > 0 && (
                            <Badge className="bg-emerald-600 text-white text-xs h-5 w-5 flex items-center justify-center">
                              {cartCount}
                            </Badge>
                          )}
                        </Link>
                      </SheetClose>
                    ))}

                    {!user && (
                      <SheetClose asChild>
                        <Link to="/login" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent">
                          <LogIn className="h-5 w-5" />
                          <span>Entrar</span>
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

      {/* Logout Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar saída</DialogTitle>
            <DialogDescription>Tem certeza que deseja sair?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleLogout} disabled={loadingLogout}>
              {loadingLogout ? 'Saindo...' : 'Sair'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default Header