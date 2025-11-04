import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';

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
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id ?? null);
    };
    init();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!userId) {
        setCartCount(0);
        setWishlistCount(0);
        return;
      }

      const { data: cart } = await supabase
        .from('cart')
        .select('quantity')
        .eq('user_id', userId);

      setCartCount(cart?.reduce((s, i) => s + i.quantity, 0) ?? 0);

      const { data: wl } = await supabase
        .from('wishlist')
        .select('id')
        .eq('user_id', userId);

      setWishlistCount(wl?.length ?? 0);
    };

    load();
  }, [userId]);

  const addToCart = async (itemId: number, quantity: number = 1): Promise<void> => {
    if (!userId) {
      toast.error('Faça login para adicionar ao carrinho.');
      return;
    }

    try {
      const { data: existing } = await supabase
        .from('cart')
        .select('id, quantity')
        .eq('user_id', userId)
        .eq('item_id', itemId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('cart')
          .update({ quantity: existing.quantity + quantity })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('cart')
          .insert({ user_id: userId, item_id: itemId, quantity });
      }

      setCartCount(prev => prev + quantity);
      toast.success('Adicionado ao carrinho!');
    } catch (error: any) {
      console.error('Add to cart error:', error);
      toast.error('Erro ao adicionar item.');
    }
  };

  const removeFromCart = async (itemId: number): Promise<void> => {
    if (!userId) return;

    try {
      const { data: item } = await supabase
        .from('cart')
        .select('quantity')
        .eq('user_id', userId)
        .eq('item_id', itemId)
        .maybeSingle();

      if (!item) return;

      await supabase
        .from('cart')
        .delete()
        .eq('user_id', userId)
        .eq('item_id', itemId);

      setCartCount(prev => prev - item.quantity);
      toast.success('Removido do carrinho!');
    } catch (error: any) {
      console.error('Remove error:', error);
      toast.error('Erro ao remover.');
    }
  };

  const updateQuantity = async (itemId: number, quantity: number): Promise<void> => {
    if (!userId || quantity < 1) return;

    try {
      await supabase
        .from('cart')
        .update({ quantity })
        .eq('user_id', userId)
        .eq('item_id', itemId);

      const { data } = await supabase
        .from('cart')
        .select('quantity')
        .eq('user_id', userId);
      setCartCount(data?.reduce((s, i) => s + i.quantity, 0) ?? 0);

      toast.success('Quantidade atualizada!');
    } catch (error: any) {
      toast.error('Erro ao atualizar.');
    }
  };

  const clearCart = async (): Promise<void> => {
    if (!userId) return;
    try {
      await supabase.from('cart').delete().eq('user_id', userId);
      setCartCount(0);
      toast.success('Carrinho limpo!');
    } catch {
      toast.error('Erro ao limpar.');
    }
  };

  const addToWishlist = async (itemId: number): Promise<void> => {
    if (!userId) {
      toast.error('Faça login.');
      return;
    }
    try {
      const { error } = await supabase
        .from('wishlist')
        .insert({ user_id: userId, item_id: itemId });

      if (error?.code === '23505') {
        toast.info('Já está na wishlist.');
        return;
      }
      if (error) throw error;

      setWishlistCount(prev => prev + 1);
      toast.success('Adicionado aos favoritos!');
    } catch {
      toast.error('Erro ao adicionar.');
    }
  };

  const removeFromWishlist = async (itemId: number): Promise<void> => {
    if (!userId) return;
    try {
      await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', userId)
        .eq('item_id', itemId);
      setWishlistCount(prev => prev - 1);
      toast.success('Removido dos favoritos!');
    } catch {
      toast.error('Erro ao remover.');
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
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};