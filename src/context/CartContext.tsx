import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';

interface CartItem {
  id: string;
  user_id: string;
  item_id: number; // Changed to number to match cart.item_id (bigint)
  quantity: number;
}

interface CartContextType {
  cartCount: number;
  addToCart: (itemId: number, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartCount, setCartCount] = useState<number>(0);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAndCart = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('User fetch error:', userError);
        setUserId(null);
        setCartCount(0);
        return;
      }
      setUserId(user.id);
      console.log('Fetching cart for user:', user.id);

      const { data, error } = await supabase
        .from('cart')
        .select('quantity')
        .eq('user_id', user.id);
      if (error) {
        console.error('Error fetching cart:', error.message, error.code);
        setCartCount(0);
        return;
      }
      const totalCount = data.reduce((sum, item) => sum + item.quantity, 0);
      console.log('Cart count:', totalCount);
      setCartCount(totalCount);
    };

    fetchUserAndCart();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      setUserId(session?.user?.id || null);
      fetchUserAndCart();
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const addToCart = async (itemId: number, quantity: number = 1) => {
    if (!userId) {
      toast.error('Por favor, faça login para adicionar itens ao carrinho.');
      return;
    }

    try {
      console.log('Adding to cart:', { userId, itemId, quantity });
      const { data: existingItem, error: fetchError } = await supabase
        .from('cart')
        .select('id, quantity')
        .eq('user_id', userId)
        .eq('item_id', itemId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Cart fetch error:', fetchError.message, fetchError.code);
        throw fetchError;
      }

      if (existingItem) {
        const { error: updateError } = await supabase
          .from('cart')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('id', existingItem.id);
        if (updateError) {
          console.error('Cart update error:', updateError.message, updateError.code);
          throw updateError;
        }
      } else {
        const { error: insertError } = await supabase
          .from('cart')
          .insert({ user_id: userId, item_id: itemId, quantity });
        if (insertError) {
          console.error('Cart insert error:', insertError.message, insertError.code);
          throw insertError;
        }
      }

      setCartCount((prev) => prev + quantity);
      toast.success('Item adicionado ao carrinho!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Erro ao adicionar item ao carrinho.');
    }
  };

  const removeFromCart = async (itemId: number) => {
    if (!userId) {
      toast.error('Por favor, faça login para remover itens do carrinho.');
      return;
    }

    try {
      console.log('Removing from cart:', { userId, itemId });
      const { data: item, error: fetchError } = await supabase
        .from('cart')
        .select('quantity')
        .eq('user_id', userId)
        .eq('item_id', itemId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Cart fetch error:', fetchError.message, fetchError.code);
        throw fetchError;
      }

      if (!item) {
        console.warn('No cart item found for:', { userId, itemId });
        return;
      }

      const { error: deleteError } = await supabase
        .from('cart')
        .delete()
        .eq('user_id', userId)
        .eq('item_id', itemId);

      if (deleteError) {
        console.error('Cart delete error:', deleteError.message, deleteError.code);
        throw deleteError;
      }

      setCartCount((prev) => prev - item.quantity);
      toast.success('Item removido do carrinho!');
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Erro ao remover item do carrinho.');
    }
  };

  const clearCart = async () => {
    if (!userId) {
      toast.error('Por favor, faça login para limpar o carrinho.');
      return;
    }

    try {
      console.log('Clearing cart for user:', userId);
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('Cart clear error:', error.message, error.code);
        throw error;
      }

      setCartCount(0);
      toast.success('Carrinho limpo com sucesso!');
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Erro ao limpar o carrinho.');
    }
  };

  return (
    <CartContext.Provider value={{ cartCount, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};