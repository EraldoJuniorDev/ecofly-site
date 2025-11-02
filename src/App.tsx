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

console.log('App component loading...');

const ProtectedRoute = ({ children, requireAdmin = false }: { children: JSX.Element; requireAdmin?: boolean }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking authentication in ProtectedRoute...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log('Session:', session, 'Session Error:', sessionError);
        if (sessionError) {
          console.error('Session error:', sessionError);
          setIsAuthenticated(false);
          setIsAdmin(false);
          return;
        }
        if (session) {
          setIsAuthenticated(true);
          if (requireAdmin) {
            const { data: profile, error: profileError } = await supabase
              .from('user_profiles')
              .select('role')
              .eq('id', session.user.id)
              .single();
            console.log('Profile:', profile, 'Profile Error:', profileError);
            if (profileError && profileError.code !== 'PGRST116') {
              console.error('Profile error:', profileError);
              setIsAdmin(false);
            } else {
              setIsAdmin(profile?.role === 'admin');
            }
          } else {
            setIsAdmin(false);
          }
        } else {
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error in ProtectedRoute:', error);
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
    };
    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session);
      setIsAuthenticated(!!session);
      if (event === 'SIGNED_IN' && session && requireAdmin) {
        supabase
          .from('user_profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile, error: profileError }) => {
            console.log('Profile after auth change:', profile, 'Profile Error:', profileError);
            if (profileError && profileError.code !== 'PGRST116') {
              console.error('Profile error:', profileError);
            }
            setIsAdmin(profile?.role === 'admin');
          });
      } else if (event === 'SIGNED_OUT') {
        setIsAdmin(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [requireAdmin]);

  console.log('ProtectedRoute rendering:', { isAuthenticated, isAdmin, requireAdmin });

  if (isAuthenticated === null || (requireAdmin && isAdmin === null)) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (!isAuthenticated || (requireAdmin && !isAdmin)) {
    console.log('Redirecting to /login due to:', { isAuthenticated, isAdmin, requireAdmin });
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  console.log('App component rendered');

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