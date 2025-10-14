import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Share2, Star, Plus, Minus, ShoppingCart, Filter, ThumbsUp, MoreVertical } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { useToast } from '../components/ui/use-toast';
import { supabase } from '../lib/supabaseClient';
import { useCart } from '../context/CartContext';
import { WHATSAPP_LINK } from '../constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Progress } from '../components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Textarea } from '../components/ui/textarea';

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
  avatar?: string;
  images?: string[];
  verified?: boolean;
  helpful?: number;
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
  const [sortBy, setSortBy] = useState<'recent' | 'helpful' | 'rating-high' | 'rating-low'>('recent');
  const [filterRating, setFilterRating] = useState<string>('all');
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

        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select('id,user_id,rating,comment,created_at')
          .eq('item_id', productData.id)
          .order('created_at', { ascending: false });
        if (reviewsError) {
          console.error('Reviews fetch error:', reviewsError.message, reviewsError.code);
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
            console.error('Users fetch error:', usersError.message, usersError.code);
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
            },
            avatar: undefined,
            images: [],
            verified: false,
            helpful: 0,
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
            },
            avatar: undefined,
            images: [],
            verified: false,
            helpful: 0,
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
          },
          avatar: undefined,
          images: [],
          verified: false,
          helpful: 0,
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
          },
          avatar: undefined,
          images: [],
          verified: false,
          helpful: 0,
        })) || [];
      }
      setReviews(formattedReviews);
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({ description: 'Erro ao enviar a avaliação.' });
    }
  };

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews : 0;
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => {
    const count = reviews.filter(review => review.rating === rating).length;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { rating, count, percentage };
  });

  const filteredReviews = filterRating === 'all' 
    ? reviews 
    : reviews.filter(review => review.rating === parseInt(filterRating));
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else if (sortBy === 'helpful') {
      return (b.helpful || 0) - (a.helpful || 0);
    } else if (sortBy === 'rating-high') {
      return b.rating - a.rating;
    } else {
      return a.rating - b.rating;
    }
  });

  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const starSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
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
                  {renderStars(averageRating, 'md')}
                  <span className="text-sm font-medium">{averageRating.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">({totalReviews} avaliações)</span>
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

        <div className="mt-8 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Avaliações dos Clientes</span>
                <Badge variant="secondary">
                  {totalReviews} avaliações
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isAuthenticated ? (
                <div id="review-form" className="mb-6 space-y-4">
                  <h4 className="font-medium">Deixe sua avaliação</h4>
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
                  <Textarea
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                    placeholder="Escreva sua avaliação aqui..."
                    className="w-full p-2 border bg-background rounded-md text-sm text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows={4}
                  />
                  <Button
                    onClick={handleReviewSubmit}
                    className="bg-green-600 hover:bg-blue-700 text-white"
                  >
                    Enviar Avaliação
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mb-6">
                  Faça login para deixar uma avaliação.
                </p>
              )}
              <Separator className="mb-6" />

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="text-center space-y-2">
                  <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
                  {renderStars(averageRating, 'md')}
                  <p className="text-gray-600 text-sm">Baseado em {totalReviews} avaliações</p>
                </div>
                <div className="space-y-2">
                  {ratingDistribution.map(({ rating, count, percentage }) => (
                    <div key={rating} className="flex items-center gap-3">
                      <span className="text-sm font-medium w-8">{rating}★</span>
                      <Progress value={percentage} className="flex-1 h-2" />
                      <span className="text-sm text-gray-600 w-8">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="mb-6" />

              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">Filtrar por:</span>
                  <Select value={filterRating} onValueChange={setFilterRating}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="5">5 estrelas</SelectItem>
                      <SelectItem value="4">4 estrelas</SelectItem>
                      <SelectItem value="3">3 estrelas</SelectItem>
                      <SelectItem value="2">2 estrelas</SelectItem>
                      <SelectItem value="1">1 estrela</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Ordenar por:</span>
                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Mais recentes</SelectItem>
                      <SelectItem value="helpful">Mais úteis</SelectItem>
                      <SelectItem value="rating-high">Maior nota</SelectItem>
                      <SelectItem value="rating-low">Menor nota</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-6">
                {sortedReviews.length > 0 ? (
                  sortedReviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={review.avatar} />
                          <AvatarFallback>
                            {review.user.display_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{review.user.display_name}</h4>
                                {review.verified && (
                                  <Badge variant="secondary" className="text-xs">
                                    Compra verificada
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                {renderStars(review.rating)}
                                <span className="text-sm text-gray-500">
                                  {formatDate(review.created_at)}
                                </span>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </div>
                          <p className="text-gray-700 leading-relaxed">{review.comment || 'Sem comentário.'}</p>
                          {review.images && review.images.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto">
                              {review.images.map((image, index) => (
                                <img
                                  key={index}
                                  src={image}
                                  alt={`Foto da avaliação ${index + 1}`}
                                  className="w-20 h-20 object-cover rounded-lg border"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhuma avaliação encontrada.</p>
                )}
              </div>

              {sortedReviews.length < totalReviews && (
                <div className="text-center pt-6">
                  <Button variant="outline">
                    Ver mais avaliações ({totalReviews - sortedReviews.length} restantes)
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;