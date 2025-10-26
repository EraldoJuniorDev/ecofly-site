import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';

interface CartItem {
  id: string;
  user_id: string;
  item_id: number;
  quantity: number;
}

interface WishlistItem {
  id: string;
  user_id: string;
  item_id: number;
  added_at: string;
}

interface CartContextType {
  cartCount: number;
  wishlistCount: number;
  addToCart: (itemId: number, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  addToWishlist: (itemId: number) => Promise<void>;
  removeFromWishlist: (itemId: number) => Promise<void>;
  moveToWishlist: (itemId: number) => Promise<void>;
  moveToCart: (itemId: number) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartCount, setCartCount] = useState<number>(0);
  const [wishlistCount, setWishlistCount] = useState<number>(0);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAndData = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('User fetch error:', userError);
        setUserId(null);
        setCartCount(0);
        setWishlistCount(0);
        return;
      }
      setUserId(user.id);

      // Carrinho
      const { data: cartData, error: cartError } = await supabase
        .from('cart')
        .select('quantity')
        .eq('user_id', user.id);
      if (!cartError && cartData) {
        const totalCart = cartData.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(totalCart);
      }

      // Wishlist
      const { data: wishlistData, error: wishlistError } = await supabase
        .from('wishlist')
        .select('id')
        .eq('user_id', user.id);
      if (!wishlistError && wishlistData) {
        setWishlistCount(wishlistData.length);
      }
    };

    fetchUserAndData();

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id || null);
      fetchUserAndData();
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const addToCart = async (itemId: number, quantity: number = 1): Promise<void> => {
    if (!userId) {
      toast.error('Faça login para adicionar ao carrinho.');
      return;
    }

    try {
      const { data: existingItem, error: fetchError } = await supabase
        .from('cart')
        .select('id, quantity')
        .eq('user_id', userId)
        .eq('item_id', itemId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      if (existingItem) {
        const { error: updateError } = await supabase
          .from('cart')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('id', existingItem.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('cart')
          .insert({ user_id: userId, item_id: itemId, quantity });
        if (insertError) throw insertError;
      }

      setCartCount(prev => prev + quantity);
      toast.success('Item adicionado ao carrinho!');
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error('Erro ao adicionar item ao carrinho.');
    }
  };

  const removeFromCart = async (itemId: number): Promise<void> => {
    if (!userId) {
      toast.error('Faça login para remover do carrinho.');
      return;
    }

    try {
      const { data: item, error: fetchError } = await supabase
        .from('cart')
        .select('quantity')
        .eq('user_id', userId)
        .eq('item_id', itemId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
      if (!item) return;

      const { error: deleteError } = await supabase
        .from('cart')
        .delete()
        .eq('user_id', userId)
        .eq('item_id', itemId);
      if (deleteError) throw deleteError;

      setCartCount(prev => prev - item.quantity);
      toast.success('Item removido do carrinho!');
    } catch (error) {
      console.error('Remove from cart error:', error);
      toast.error('Erro ao remover item do carrinho.');
    }
  };

  const updateQuantity = async (itemId: number, quantity: number): Promise<void> => {
    if (!userId) {
      toast.error('Faça login para atualizar o carrinho.');
      return;
    }
    if (quantity < 1) {
      await removeFromCart(itemId);
      return;
    }

    try {
      const { error } = await supabase
        .from('cart')
        .update({ quantity })
        .eq('user_id', userId)
        .eq('item_id', itemId);
      if (error) throw error;

      // Atualiza apenas o total do carrinho
      const { data: cartData } = await supabase
        .from('cart')
        .select('quantity')
        .eq('user_id', userId);
      if (cartData) {
        const total = cartData.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(total);
      }
      toast.success('Quantidade atualizada!');
    } catch (error) {
      console.error('Update quantity error:', error);
      toast.error('Erro ao atualizar quantidade.');
    }
  };

  const clearCart = async (): Promise<void> => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('user_id', userId);
      if (error) throw error;

      setCartCount(0);
      toast.success('Carrinho limpo!');
    } catch (error) {
      console.error('Clear cart error:', error);
      toast.error('Erro ao limpar o carrinho.');
    }
  };

  const addToWishlist = async (itemId: number): Promise<void> => {
    if (!userId) {
      toast.error('Faça login para adicionar aos favoritos.');
      return;
    }

    try {
      const { error } = await supabase
        .from('wishlist')
        .insert({ user_id: userId, item_id: itemId });
      if (error) throw error;

      setWishlistCount(prev => prev + 1);
      toast.success('Item adicionado aos favoritos!');
    } catch (error) {
      console.error('Add to wishlist error:', error);
      toast.error('Erro ao adicionar aos favoritos.');
    }
  };

  const removeFromWishlist = async (itemId: number): Promise<void> => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', userId)
        .eq('item_id', itemId);
      if (error) throw error;

      setWishlistCount(prev => prev - 1);
      toast.success('Item removido dos favoritos!');
    } catch (error) {
      console.error('Remove from wishlist error:', error);
      toast.error('Erro ao remover dos favoritos.');
    }
  };

  const moveToWishlist = async (itemId: number): Promise<void> => {
    await addToWishlist(itemId);
    await removeFromCart(itemId);
  };

  const moveToCart = async (itemId: number): Promise<void> => {
    await addToCart(itemId);
    await removeFromWishlist(itemId);
  };

  return (
    <CartContext.Provider
      value={{
        cartCount,
        wishlistCount,
        addToCart,
        removeFromCart,
        clearCart,
        updateQuantity,
        addToWishlist,
        removeFromWishlist,
        moveToWishlist,
        moveToCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
