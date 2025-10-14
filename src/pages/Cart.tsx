import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, Package, CreditCard } from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { supabase } from '../lib/supabaseClient';
import { useCart } from '../context/CartContext';

interface CartItem {
  id: string;
  user_id: string;
  item_id: number;
  quantity: number;
  name: string;
  price: number;
  category: string;
  image: string;
  inStock: boolean;
}

const Cart = () => {
  const { updateQuantity, removeFromCart, cartCount } = useCart();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCartItems = async () => {
      setLoading(true);
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          console.error('User fetch error:', userError);
          setCartItems([]);
          setLoading(false);
          return;
        }

        const { data: cartData, error: cartError } = await supabase
          .from('cart')
          .select(`
            id,
            user_id,
            item_id,
            quantity,
            items (
              id,
              name,
              price,
              category,
              images
            )
          `)
          .eq('user_id', user.id);
        if (cartError) {
          console.error('Cart fetch error:', cartError.message, cartError.code);
          throw cartError;
        }
        const formattedCartItems: CartItem[] = cartData.map((item: any) => ({
          id: item.id,
          user_id: item.user_id,
          item_id: item.item_id,
          quantity: item.quantity,
          name: item.items.name,
          price: item.items.price || 0,
          category: item.items.category,
          image: item.items.images[0]?.url || 'https://via.placeholder.com/100',
          inStock: true // Assume in stock for now
        }));
        setCartItems(formattedCartItems);
      } catch (error) {
        console.error('Error fetching cart:', error);
        toast.error('Erro ao carregar o carrinho.');
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [cartCount]);

  const getTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center">
        <ShoppingCart className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="rounded-lg border overflow-hidden">
        <div className="bg-background p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full p-2">
              <ShoppingCart className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Meu Carrinho</h2>
              <p className="text-sm">
                Gerencie seus itens e finalize sua compra
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {cartItems.length > 0 ? (
            <div className="space-y-6">
              {/* Cart Items */}
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.category}</p>
                      <p className="text-lg font-semibold">
                        {formatPrice(item.price)}
                      </p>
                      {!item.inStock && (
                        <p className="text-sm text-red-500">Fora de estoque</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.item_id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.item_id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeFromCart(item.item_id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="border-t pt-6">
                <div className="p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold text-gray-900">
                      Total: {formatPrice(getTotal())}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Button variant="outline" className="w-full">
                      <Package className="h-4 w-4 mr-2" />
                      Calcular Frete
                    </Button>
                    <Button className="w-full bg-green-600 text-muted dark:text-muted-foreground hover:bg-green-500">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Finalizar Compra
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Seu carrinho está vazio
              </h3>
              <p className="text-gray-500">
                Adicione produtos para continuar com sua compra.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;