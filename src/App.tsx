import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './lib/theme-provider';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import BackToTop from './components/layout/BackToTop';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Cart from './pages/Cart';
import Feedback from './pages/Feedback';
import Contact from './pages/Contact';
import AdminPage from './pages/auth/admin/AdminPage';
import LoginPage from './pages/auth/LoginPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import UserPage from './pages/auth/user/UserPage';
import ProductDetail from './components/ProductDetail';
import { Toaster } from './components/ui/sonner';
import { CartProvider } from './context/CartContext';
import { supabase } from './lib/supabaseClient';
import RegisterPage from './pages/auth/RegisterPage';

const ProtectedRoute = ({ children, requireAdmin = false }: { children: JSX.Element; requireAdmin?: boolean }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          setIsAuthenticated(false);
          setIsAdmin(false);
          return;
        }

        setIsAuthenticated(true);

        if (requireAdmin) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()
            .then(({ data, error }) => {
              if (error) return { data: null };
              return { data };
            });

          setIsAdmin(profile?.role === 'admin');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
    };

    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user);
      if (event === 'SIGNED_OUT') {
        setIsAdmin(false);
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, [requireAdmin]);

  if (isAuthenticated === null || (requireAdmin && isAdmin === null)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || (requireAdmin && !isAdmin)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="ecofly-ui-theme">
      <CartProvider>
        <Router future={{ v7_startTransition: true }}>
          <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/catalogo" element={<Catalog />} />
                <Route path="/carrinho" element={<Cart />} />
                <Route path="/feedback" element={<Feedback />} />
                <Route path="/contato" element={<Contact />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/user"
                  element={
                    <ProtectedRoute>
                      <UserPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/produto/:slug" element={<ProductDetail />} />
              </Routes>
            </main>
            <Footer />
            <BackToTop />
            <Toaster />
          </div>
        </Router>
      </CartProvider>
    </ThemeProvider>
  );
}

export default App;