import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Share2, Star, Plus, Minus, ShoppingCart } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { useToast } from '../components/ui/use-toast';
import { supabase } from '../lib/supabaseClient';
import { useCart } from '../context/CartContext';
import { WHATSAPP_LINK } from '../constants';

interface ProductImage {
  url: string;
  alt: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  images: ProductImage[];
  category: string;
  slug: string;
  price: number;
  stock?: number;
  features?: string[];
  full_description?: string;
}

interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  user: {
    display_name: string;
  };
}

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart, removeFromCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInCart, setIsInCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [userRating, setUserRating] = useState<number>(0);
  const [userComment, setUserComment] = useState<string>('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProductAndReviews = async () => {
      if (!slug) {
        console.error('Slug is undefined');
        setError('Slug do produto não fornecido.');
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        // Fetch product
        const { data: productData, error: productError } = await supabase
          .from('items')
          .select('id,name,description,images,category,slug,price,stock,features,full_description')
          .eq('slug', slug)
          .single();
        if (productError) {
          console.error('Product fetch error:', productError.message, productError.code);
          throw productError;
        }
        if (!productData) throw new Error('Produto não encontrado.');
        console.log('Product fetched:', { id: productData.id, slug: productData.slug });
        setProduct(productData);

        // Fetch reviews without join
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select('id,user_id,rating,comment,created_at')
          .eq('item_id', productData.id)
          .order('created_at', { ascending: false });
        if (reviewsError) {
          console.error('Reviews fetch error:', reviewsError.message, reviewsError.code);
          throw reviewsError;
        }

        // Fetch user display names from profiles table
        const userIds = reviewsData?.map(review => review.user_id) || [];
        let formattedReviews: Review[] = [];
        if (userIds.length > 0) {
          const { data: usersData, error: usersError } = await supabase
            .from('profiles')
            .select('id,display_name')
            .in('id', userIds);
          if (usersError) {
            console.error('Users fetch error:', usersError.message, usersError.code);
            throw usersError;
          }
          // Fallback if usersData is empty
          const usersMap = new Map(usersData?.map(user => [user.id, user.display_name]) || []);
          formattedReviews = reviewsData?.map(review => ({
            id: review.id,
            user_id: review.user_id,
            rating: review.rating,
            comment: review.comment,
            created_at: review.created_at,
            user: {
              display_name: usersMap.get(review.user_id) || 'Anônimo'
            }
          })) || [];
        } else {
          formattedReviews = reviewsData?.map(review => ({
            id: review.id,
            user_id: review.user_id,
            rating: review.rating,
            comment: review.comment,
            created_at: review.created_at,
            user: {
              display_name: 'Anônimo'
            }
          })) || [];
        }
        setReviews(formattedReviews);

      } catch (err: any) {
        console.error('Error fetching data:', err.message, err.code);
        setError('Erro ao carregar o produto ou avaliações.');
        toast({ description: 'Erro ao carregar o produto ou avaliações.' });
      } finally {
        setLoading(false);
      }
    };

    const checkAuthStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };

    fetchProductAndReviews();
    checkAuthStatus();
  }, [slug, toast]);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        console.log('Checking status for user:', user?.id, 'item_id:', product?.id);
        if (user && product) {
          // Check cart with maybeSingle to handle empty results
          const { data: cartItem, error: cartError } = await supabase
            .from('cart')
            .select('id')
            .eq('user_id', user.id)
            .eq('item_id', product.id)
            .maybeSingle();
          if (cartError && cartError.code !== 'PGRST116') {
            console.error('Cart query error:', cartError.message, cartError.code);
            throw cartError;
          }
          setIsInCart(!!cartItem);
        }
      } catch (error) {
        console.error('Error checking cart status:', error);
        toast({ description: 'Erro ao verificar o status do carrinho.' });
      }
    };

    if (product) {
      checkStatus();
    }
  }, [product, toast]);

  const handleCartToggle = async () => {
    if (!product) return;
    try {
      if (isInCart) {
        await removeFromCart(product.id);
        setIsInCart(false);
        toast({ description: `${product.name} removido do carrinho` });
      } else {
        await addToCart(product.id, quantity);
        setIsInCart(true);
        toast({ description: `${product.name} adicionado ao carrinho` });
      }
    } catch (error) {
      console.error('Error toggling cart item:', error);
      toast({ description: 'Erro ao atualizar o carrinho.' });
    }
  };

  const handleWhatsAppContact = () => {
    if (!product) return;
    if (!isAuthenticated) {
      toast({ description: 'Você precisa estar logado para enviar uma mensagem no WhatsApp.' });
      return;
    }
    const message = `Olá! Tenho interesse no produto: ${product.name}. Poderia me dar mais informações?`;
    const whatsappUrl = `${WHATSAPP_LINK}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleShare = () => {
    if (!product) return;
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ description: 'Link copiado para área de transferência' });
    }
  };

  const handleReviewSubmit = async () => {
    if (!product || !isAuthenticated) {
      toast({ description: 'Você precisa estar logado para deixar uma avaliação.' });
      return;
    }
    if (!userRating || userRating < 1 || userRating > 5) {
      toast({ description: 'Por favor, selecione uma pontuação entre 1 e 5 estrelas.' });
      return;
    }
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ description: 'Usuário não autenticado.' });
        return;
      }
      const { error } = await supabase
        .from('reviews')
        .insert({
          item_id: product.id,
          user_id: user.id,
          rating: userRating,
          comment: userComment.trim() || null,
        });
      if (error) {
        console.error('Review submit error:', error.message, error.code);
        throw error;
      }
      toast({ description: 'Avaliação enviada com sucesso!' });
      setUserRating(0);
      setUserComment('');
      // Refresh reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('id,user_id,rating,comment,created_at')
        .eq('item_id', product.id)
        .order('created_at', { ascending: false });
      if (reviewsError) {
        console.error('Reviews refresh error:', reviewsError.message, reviewsError.code);
        throw reviewsError;
      }

      const userIds = reviewsData?.map(review => review.user_id) || [];
      let formattedReviews: Review[] = [];
      if (userIds.length > 0) {
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('id,display_name')
          .in('id', userIds);
        if (usersError) {
          console.error('Users refresh error:', usersError.message, usersError.code);
          throw usersError;
        }
        const usersMap = new Map(usersData?.map(user => [user.id, user.display_name]) || []);
        formattedReviews = reviewsData?.map(review => ({
          id: review.id,
          user_id: review.user_id,
          rating: review.rating,
          comment: review.comment,
          created_at: review.created_at,
          user: {
            display_name: usersMap.get(review.user_id) || 'Anônimo'
          }
        })) || [];
      } else {
        formattedReviews = reviewsData?.map(review => ({
          id: review.id,
          user_id: review.user_id,
          rating: review.rating,
          comment: review.comment,
          created_at: review.created_at,
          user: {
            display_name: 'Anônimo'
          }
        })) || [];
      }
      setReviews(formattedReviews);
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({ description: 'Erro ao enviar a avaliação.' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex justify-center items-center">
        <ShoppingCart className="h-8 w-8 animate-spin text-background" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center">
        <p className="muted-foreground mb-4">{error || 'Produto não encontrado.'}</p>
        <Button asChild variant="outline">
          <Link to="/catalogo">Voltar ao Catálogo</Link>
        </Button>
      </div>
    );
  }

  const fullDescription = product.description;
 
  const originalPrice = product.price * 1.3;
  const rating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 'N/A';
  const reviewsCount = reviews.length;

  return (
    <div className="min-h-screen bg-background">
      <div className="border bg-background shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
            <Link to="/catalogo">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleShare}
              className="muted-foreground"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            {product.images.length > 0 ? (
              <div className="relative aspect-square overflow-hidden rounded-lg shadow-md">
                <img
                  src={product.images[0].url}
                  alt={product.images[0].alt || product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="relative aspect-square overflow-hidden rounded-lg shadow-md bg-background">
                <img
                  src="https://via.placeholder.com/600"
                  alt="Placeholder"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 border-transparent hover:border-gray-300 transition-all duration-200"
                  >
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-3">
                {product.category}
              </Badge>
              <h1 className="text-3xl font-bold text-muted-foreground mb-2">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{rating}</span>
                  <span className="text-sm text-muted-foreground">({reviewsCount} avaliações)</span>
                </div>
              </div>
            </div>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">Sobre do Produto:</h3>
                <p className="muted-foreground mb-4">{fullDescription}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl font-bold text-green-600">
                    R$ {product.price.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="text-lg text-muted-foreground line-through">
                    R$ {originalPrice.toFixed(2).replace('.', ',')}
                  </span>
                  <Badge variant="destructive">
                    -{Math.round((1 - product.price / originalPrice) * 100)}%
                  </Badge>
                </div>

                <div className="flex items-center justify-between mb-6">
                  <span className="font-medium">Quantidade:</span>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setQuantity(Math.min(product.stock || 15, quantity + 1))}
                      disabled={quantity >= (product.stock || 15)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid gap-3">
                  <Button 
                    className="w-full text-muted-foreground bg-green-600 hover:bg-green-700"
                    onClick={handleWhatsAppContact}
                    disabled={!isAuthenticated}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Consultar no WhatsApp
                  </Button>
                  <Button 
                    variant={isInCart ? "destructive" : "outline"} 
                    className="w-full"
                    onClick={handleCartToggle}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {isInCart ? 'Remover do Carrinho' : 'Adicionar ao Carrinho'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">Avaliações do Produto</h3>
                {isAuthenticated ? (
                  <div className="mb-6">
                    <h4 className="font-medium mb-2">Deixe sua avaliação</h4>
                    <div className="flex items-center gap-2 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setUserRating(star)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= userRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={userComment}
                      onChange={(e) => setUserComment(e.target.value)}
                      placeholder="Escreva sua avaliação aqui..."
                      className="w-full p-2 border bg-background rounded-md text-sm muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500"
                      rows={4}
                    />
                    <Button
                      onClick={handleReviewSubmit}
                      className="mt-3 text-muted-foreground bg-green-600 hover:bg-green-700"
                    >
                      Enviar Avaliação
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm muted-foreground mb-4">
                    Faça login para deixar uma avaliação.
                  </p>
                )}
                <Separator className="my-4" />
                <h4 className="font-medium mb-3">Avaliações ({reviewsCount})</h4>
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.id} className="mb-4">
                      <p className="text-sm font-medium text-muted-foreground mb-1">{review.user.display_name}</p>
                      <div className="flex items-center gap-2 mb-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm muted-foreground">
                        {review.comment || 'Sem comentário.'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(review.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm muted-foreground">Nenhuma avaliação ainda.</p>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl mb-2">🚚</div>
                  <h4 className="font-medium text-sm mb-1">Entrega Rápida</h4>
                  <p className="text-xs muted-foreground">Em até 3 dias úteis</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl mb-2">🛡️</div>
                  <h4 className="font-medium text-sm mb-1">Garantia</h4>
                  <p className="text-xs muted-foreground">30 dias</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;