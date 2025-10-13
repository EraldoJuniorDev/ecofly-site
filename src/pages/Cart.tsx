import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import { Trash2, ShoppingCart } from 'lucide-react';

const Cart = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      setIsLoading(true);
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          toast.error('Por favor, faça login para visualizar o carrinho.');
          navigate('/login');
          return;
        }

        const { data, error } = await supabase
          .from('cart')
          .select('*, items(name, images, category, slug)')
          .eq('user_id', user.id);
        if (error) throw error;
        setCartItems(data || []);
      } catch (error) {
        console.error('Error fetching cart:', error);
        toast.error('Erro ao carregar o carrinho.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCart();
  }, [navigate]);

  const handleDeleteCartItem = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('id', deleteTarget.id);
      if (error) throw error;
      toast.success('Item removido do carrinho com sucesso!');
      setCartItems((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      setShowDeleteDialog(false);
      setDeleteTarget(null);
    } catch (error) {
      console.error('Error deleting cart item:', error);
      toast.error('Erro ao remover item do carrinho.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 eco-gradient rounded-xl">
            <ShoppingCart className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold eco-text-gradient">Carrinho de Compras</h2>
            <p className="text-base text-muted-foreground">Gerencie os itens no seu carrinho</p>
          </div>
        </div>
        <Card className="bg-card dark:bg-background rounded-2xl border border-slate-200/60 dark:border-slate-700/40 shadow-sm p-4 sm:p-6">
          {isLoading ? (
            <p className="text-muted-foreground">Carregando carrinho...</p>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Seu carrinho está vazio.{' '}
              <Link to="/catalogo" className="text-primary hover:underline">
                Explore nosso catálogo
              </Link>
              .
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-4 p-4 border rounded-lg"
                >
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.items?.images?.[0]?.url}
                      alt={item.items?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col gap-3 items-start justify-between">
                      <div>
                        <Link to={`/produto/${item.items?.slug}`} className="hover:underline">
                          <h3 className="font-semibold text-slate-800 dark:text-slate-100">{item.items?.name}</h3>
                        </Link>
                        <p className="text-sm text-slate-600 dark:text-slate-300">{item.items?.category}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300">Quantidade: {item.quantity}</p>
                      </div>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          setDeleteTarget(item);
                          setShowDeleteDialog(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>

      <Dialog open={showDeleteDialog && Boolean(deleteTarget)} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="fixed left-[50%] top-[50%] z-50 grid w-[90vw] max-w-[500px] min-w-[280px] translate-x-[-50%] translate-y-[-50%] gap-4 border bg-card dark:bg-background p-4 sm:p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-xl max-h-[80vh] overflow-y-auto">
          <DialogHeader className="text-center sm:text-left mb-4">
            <DialogTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">Confirmar Remoção</DialogTitle>
            <p className="text-sm text-muted-foreground">Tem certeza que deseja remover o item "{deleteTarget?.items?.name}" do carrinho?</p>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                setShowDeleteDialog(false);
                setDeleteTarget(null);
              }}
              className="w-full sm:w-auto text-slate-600 dark:text-slate-200 hover:bg-destructive border"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDeleteCartItem}
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-green-700 text-white"
            >
              {isSubmitting ? 'Removendo...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Cart;