import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './lib/theme-provider';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import BackToTop from './components/layout/BackToTop';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Favorites from './pages/Favorites';
import Feedback from './pages/Feedback';
import Contact from './pages/Contact';
import AdminPage from './pages/admin/AdminPage';
import LoginPage from './pages/auth/LoginPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage'; // Nova importação
import { Toaster } from './components/ui/sonner';
import { FavoritesProvider } from './context/FavoritesContext';
import { supabase } from './lib/supabaseClient';

console.log('App component loading...');

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
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
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
          console.log('Profile:', profile, 'Profile Error:', profileError);
          if (profileError) {
            console.error('Profile error:', profileError);
            setIsAdmin(false);
          } else {
            setIsAdmin(profile?.role === 'admin');
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
      if (event === 'SIGNED_IN' && session) {
        supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile, error: profileError }) => {
            console.log('Profile after auth change:', profile, 'Profile Error:', profileError);
            setIsAdmin(profile?.role === 'admin');
          });
      } else if (event === 'SIGNED_OUT') {
        setIsAdmin(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  console.log('ProtectedRoute rendering:', { isAuthenticated, isAdmin });

  if (isAuthenticated === null || isAdmin === null) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (!isAuthenticated || !isAdmin) {
    console.log('Redirecting to /login due to:', { isAuthenticated, isAdmin });
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  console.log('App component rendered');

  return (
    <ThemeProvider defaultTheme="system" storageKey="ecofly-ui-theme">
      <FavoritesProvider>
        <Router future={{ v7_startTransition: true }}>
          <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/catalogo" element={<Catalog />} />
                <Route path="/favoritos" element={<Favorites />} />
                <Route path="/feedback" element={<Feedback />} />
                <Route path="/contato" element={<Contact />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} /> {/* Nova rota */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
            <Footer />
            <BackToTop />
            <Toaster />
          </div>
        </Router>
      </FavoritesProvider>
    </ThemeProvider>
  );
}

export default App;