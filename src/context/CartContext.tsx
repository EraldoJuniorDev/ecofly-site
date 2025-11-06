// src/context/CartContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';

interface CartContextType {
  addToCart: (itemId: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartCount, setCartCount] = useState(0);

  // Atualiza contagem do carrinho ao logar
  useEffect(() => {
    const updateCartCount = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setCartCount(0);
        return;
      }

      const { count, error } = await supabase
        .from('cart')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao contar carrinho:', error);
        return;
      }

      setCartCount(count || 0);
    };

    updateCartCount();

    // Escuta login/logout
    const { data: listener } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN') await updateCartCount();
      if (event === 'SIGNED_OUT') setCartCount(0);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const addToCart = async (itemId: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { error } = await supabase
      .from('cart')
      .upsert(
        {
          user_id: user.id,
          item_id: itemId,
          quantity: 1,
        },
        {
          onConflict: 'user_id,item_id', // ← ESSENCIAL
        }
      );

    if (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
      throw error;
    }

    setCartCount(prev => prev + 1);
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    if (quantity <= 0) return removeFromCart(itemId);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('cart')
      .update({ quantity })
      .eq('user_id', user.id)
      .eq('item_id', itemId);

    if (error) throw error;
  };

  const removeFromCart = async (itemId: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('user_id', user.id)
      .eq('item_id', itemId);

    if (error) throw error;
    setCartCount(prev => Math.max(0, prev - 1));
  };

  return (
    <CartContext.Provider value={{ addToCart, updateQuantity, removeFromCart, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};