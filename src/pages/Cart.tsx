import React, { useEffect, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Trash2, Package, CreditCard } from 'lucide-react';
import { Button } from '../components/ui/button';
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

type CartState = {
  items: CartItem[];
  loading: boolean;
  userLoggedIn: boolean;
};

type CartAction =
  | { type: 'SET_ITEMS'; payload: CartItem[] }
  | { type: 'UPDATE_QUANTITY'; payload: { itemId: number; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER_LOGGED_IN'; payload: boolean };

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_ITEMS':
      return { ...state, items: action.payload };
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.item_id === action.payload.itemId
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.item_id !== action.payload),
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_USER_LOGGED_IN':
      return { ...state, userLoggedIn: action.payload, items: action.payload ? state.items : [] };
    default:
      return state;
  }
};

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { updateQuantity, removeFromCart } = useCart();
  const [state, dispatch] = useReducer(cartReducer, { items: [], loading: true, userLoggedIn: false });

  useEffect(() => {
    const fetchCartItems = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          dispatch({ type: 'SET_USER_LOGGED_IN', payload: false });
          dispatch({ type: 'SET_ITEMS', payload: [] });
          return;
        }

        dispatch({ type: 'SET_USER_LOGGED_IN', payload: true });

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

        if (cartError) throw cartError;

        const formattedCartItems: CartItem[] = cartData.map((item: any) => ({
          id: item.id,
          user_id: item.user_id,
          item_id: item.item_id,
          quantity: item.quantity,
          name: item.items.name,
          price: item.items.price || 0,
          category: item.items.category,
          image: item.items.images[0]?.url || 'https://via.placeholder.com/100',
          inStock: true
        }));

        dispatch({ type: 'SET_ITEMS', payload: formattedCartItems });
      } catch (error) {
        console.error('Error fetching user_cart:', error);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    fetchCartItems();

    // Ouvir mudanças de sessão para atualizar login/logout
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      dispatch({ type: 'SET_USER_LOGGED_IN', payload: !!session?.user });
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleUpdateQuantity = async (itemId: number, quantity: number) => {
    if (quantity < 1 || !state.userLoggedIn) return;
    dispatch({ type: 'UPDATE_QUANTITY', payload: { itemId, quantity } });
    await updateQuantity(itemId, quantity);
  };

  const handleRemove = async (itemId: number) => {
    if (!state.userLoggedIn) return;
    dispatch({ type: 'REMOVE_ITEM', payload: itemId });
    await removeFromCart(itemId);
  };

  const getTotal = () =>
    state.items.reduce((total, item) => total + item.price * item.quantity, 0);

  const formatPrice = (price: number) =>
    price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  if (state.loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center">
        <ShoppingCart className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="rounded-lg border overflow-hidden">
        <div className="bg-background p-4 flex items-center gap-3">
          <div className="rounded-full p-2 bg-emerald-100 dark:bg-emerald-900/30">
            <ShoppingCart className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Meu Carrinho</h2>
            <p className="text-sm text-muted-foreground">
              Gerencie seus itens e finalize sua compra
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {!state.userLoggedIn ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-4">
                Só usuários logados podem adicionar itens ao carrinho
              </h3>
              <Button
                className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 hover:scale-[1.02] transform transition-all duration-300 text-white"
                onClick={() => navigate('/login')}
              >
                Fazer Login
              </Button>
            </div>
          ) : state.items.length > 0 ? (
            <div className="space-y-4">
              {state.items.map(item => (
                <div
                  key={item.id}
                  className="flex items-center sm:items-start gap-3 sm:gap-4 p-3 border rounded-lg bg-card"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-md object-cover"
                  />
                  <div className="flex flex-col w-full">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-semibold leading-tight">
                          {item.name}
                        </h3>
                        <p className="text-xs text-gray-500">{item.category}</p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRemove(item.item_id)}
                        className="text-red-600 hover:text-red-700 p-1"
                        disabled={!state.userLoggedIn}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-2">
                      <p className="text-sm font-semibold mt-2">
                        {formatPrice(item.price)}
                      </p>
                      <div className='flex items-center justify-between gap-2 mt-2'>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleUpdateQuantity(item.item_id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1 || !state.userLoggedIn}
                          className="h-7 w-7 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleUpdateQuantity(item.item_id, item.quantity + 1)
                          }
                          disabled={!state.userLoggedIn}
                          className="h-7 w-7 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="border-t pt-6">
                <div className="p-4 rounded-lg">
                  <div className="flex flex-col sm:flex-row justify-end items-end mb-4 text-center sm:text-left">
                    <span className="text-lg font-semibold mb-2 sm:mb-0">
                      Total: {formatPrice(getTotal())}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="w-full hover:text-muted dark:hover:text-muted-foreground"
                      disabled={!state.userLoggedIn}
                    >
                      <Package className="h-4 w-4 mr-2" />
                      Calcular Frete
                    </Button>
                    <Button
                      className="w-full bg-green-600 text-white hover:bg-green-500"
                      disabled={!state.userLoggedIn}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Finalizar Compra
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
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
