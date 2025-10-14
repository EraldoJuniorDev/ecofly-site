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
      console.log('Fetching data for user:', user.id);

      // Fetch cart
      const { data: cartData, error: cartError } = await supabase
        .from('cart')
        .select('quantity')
        .eq('user_id', user.id);
      if (cartError) {
        console.error('Error fetching cart:', cartError.message, cartError.code);
        setCartCount(0);
      } else {
        const totalCartCount = cartData.reduce((sum, item) => sum + item.quantity, 0);
        console.log('Cart count:', totalCartCount);
        setCartCount(totalCartCount);
      }

      // Fetch wishlist
      const { data: wishlistData, error: wishlistError } = await supabase
        .from('wishlist')
        .select('id')
        .eq('user_id', user.id);
      if (wishlistError) {
        console.error('Error fetching wishlist:', wishlistError.message, wishlistError.code);
        setWishlistCount(0);
      } else {
        console.log('Wishlist count:', wishlistData.length);
        setWishlistCount(wishlistData.length);
      }
    };

    fetchUserAndData();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      setUserId(session?.user?.id || null);
      fetchUserAndData();
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

  const updateQuantity = async (itemId: number, quantity: number) => {
    if (!userId) {
      toast.error('Por favor, faça login para atualizar o carrinho.');
      return;
    }
    if (quantity < 1) {
      await removeFromCart(itemId);
      return;
    }

    try {
      console.log('Updating cart quantity:', { userId, itemId, quantity });
      const { error } = await supabase
        .from('cart')
        .update({ quantity })
        .eq('user_id', userId)
        .eq('item_id', itemId);
      if (error) {
        console.error('Cart update error:', error.message, error.code);
        throw error;
      }
      setCartCount((prev) => {
        const currentItem = cartCount - (prev || 0) + quantity;
        return currentItem;
      });
      toast.success('Quantidade atualizada!');
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Erro ao atualizar quantidade.');
    }
  };

  const addToWishlist = async (itemId: number) => {
    if (!userId) {
      toast.error('Por favor, faça login para adicionar aos favoritos.');
      return;
    }

    try {
      console.log('Adding to wishlist:', { userId, itemId });
      const { error } = await supabase
        .from('wishlist')
        .insert({ user_id: userId, item_id: itemId });
      if (error) {
        console.error('Wishlist insert error:', error.message, error.code);
        throw error;
      }
      setWishlistCount((prev) => prev + 1);
      toast.success('Item adicionado aos favoritos!');
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast.error('Erro ao adicionar item aos favoritos.');
    }
  };

  const removeFromWishlist = async (itemId: number) => {
    if (!userId) {
      toast.error('Por favor, faça login para remover dos favoritos.');
      return;
    }

    try {
      console.log('Removing from wishlist:', { userId, itemId });
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', userId)
        .eq('item_id', itemId);
      if (error) {
        console.error('Wishlist delete error:', error.message, error.code);
        throw error;
      }
      setWishlistCount((prev) => prev - 1);
      toast.success('Item removido dos favoritos!');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Erro ao remover item dos favoritos.');
    }
  };

  const moveToWishlist = async (itemId: number) => {
    if (!userId) {
      toast.error('Por favor, faça login para mover aos favoritos.');
      return;
    }

    try {
      console.log('Moving to wishlist:', { userId, itemId });
      await addToWishlist(itemId);
      await removeFromCart(itemId);
    } catch (error) {
      console.error('Error moving to wishlist:', error);
      toast.error('Erro ao mover item para favoritos.');
    }
  };

  const moveToCart = async (itemId: number) => {
    if (!userId) {
      toast.error('Por favor, faça login para mover ao carrinho.');
      return;
    }

    try {
      console.log('Moving to cart:', { userId, itemId });
      await addToCart(itemId);
      await removeFromWishlist(itemId);
    } catch (error) {
      console.error('Error moving to cart:', error);
      toast.error('Erro ao mover item para o carrinho.');
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
    <CartContext.Provider value={{
      cartCount,
      wishlistCount,
      addToCart,
      removeFromCart,
      clearCart,
      updateQuantity,
      addToWishlist,
      removeFromWishlist,
      moveToWishlist,
      moveToCart
    }}>
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