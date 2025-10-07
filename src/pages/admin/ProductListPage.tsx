import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { supabase } from '../../lib/supabaseClient';
import { toast } from 'sonner';

const ProductListPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Erro ao buscar produtos: ${error.message}`);
      }

      setProducts(data || []);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, imageUrl) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      setLoading(true);
      
      // Extract file name from image URL
      const fileName = imageUrl.split('/').pop();
      if (fileName) {
        const { error: storageError } = await supabase.storage
          .from('item-images')
          .remove([`images/${fileName}`]);

        if (storageError) {
          throw new Error(`Erro ao remover imagem: ${storageError.message}`);
        }
      }

      const { error: deleteError } = await supabase
        .from('items')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw new Error(`Erro ao excluir produto: ${deleteError.message}`);
      }

      toast.success('Produto excluído com sucesso!');
      setProducts(products.filter(product => product.id !== id));
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    navigate(`/edit-product/${id}`);
  };

  const handleGoBack = () => {
    navigate('/admin');
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={handleGoBack}
          className="mb-4 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all duration-300"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Adicionar Produto
        </Button>
        <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent mb-2">
          Produtos Cadastrados
        </h1>
        <p className="text-slate-400 text-center">
          Visualize, edite ou exclua os produtos cadastrados no sistema
        </p>
      </div>

      <Card className="glass-morphism border-white/10 animate-slide-up">
        <CardHeader>
          <CardTitle className="text-2xl text-slate-100 flex items-center space-x-2">
            <span>Lista de Produtos</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
            </div>
          ) : products.length === 0 ? (
            <p className="text-slate-400 text-center">Nenhum produto cadastrado.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-600">
                  <TableHead className="text-slate-200">Imagem</TableHead>
                  <TableHead className="text-slate-200">Nome</TableHead>
                  <TableHead className="text-slate-200">Categoria</TableHead>
                  <TableHead className="text-slate-200">Preço</TableHead>
                  <TableHead className="text-slate-200">Estoque</TableHead>
                  <TableHead className="text-slate-200">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id} className="border-slate-600 hover:bg-slate-800/20">
                    <TableCell>
                      {product.images?.[0]?.url ? (
                        <img
                          src={product.images[0].url}
                          alt={product.images[0].alt || 'Produto'}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <span className="text-slate-400">Sem imagem</span>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-100">{product.name}</TableCell>
                    <TableCell className="text-slate-100">{product.category}</TableCell>
                    <TableCell className="text-slate-100">
                      {product.price ? `R$ ${product.price.toFixed(2)}` : '-'}
                    </TableCell>
                    <TableCell className="text-slate-100">{product.stock ?? '-'}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(product.id)}
                          className="border-slate-600 text-emerald-400 hover:bg-emerald-500/20"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(product.id, product.images?.[0]?.url)}
                          className="border-slate-600 text-red-400 hover:bg-red-500/20"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductListPage;