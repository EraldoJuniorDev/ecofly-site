import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Share2, Star, Plus, Minus, ShoppingCart, Filter, ThumbsUp, MoreVertical, X, Upload, ChevronLeft, ChevronRight } from 'lucide-react';
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
  original_price: number | null;
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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { toast } = useToast();
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);

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
          .select('id,name,description,images,category,slug,price,original_price,stock,features,full_description')
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
          .select('id,user_id,rating,comment,created_at,images')
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
            images: review.images || [],
            user: {
              display_name: usersMap.get(review.user_id) || 'Anônimo'
            },
            avatar: undefined,
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
            images: review.images || [],
            user: {
              display_name: 'Anônimo'
            },
            avatar: undefined,
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

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!product) return;
      setLoadingSuggestions(true);
      try {
        const { data: suggestionsData, error: suggestionsError } = await supabase
          .from('items')
          .select('id,name,description,images,category,slug,price,original_price,stock')
          .eq('category', product.category)
          .neq('id', product.id)
          .limit(4);
        if (suggestionsError) throw suggestionsError;
        setSuggestedProducts(suggestionsData || []);
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    if (product) {
      fetchSuggestions();
    }
  }, [product]);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validTypes = ['image/jpeg', 'image/png', 'video/mp4', 'video/webm'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const maxFiles = 3;

    const validFiles = files.filter(file => {
      if (!validTypes.includes(file.type)) {
        toast({ description: `Arquivo ${file.name} inválido. Use JPEG, PNG, MP4 ou WebM.` });
        return false;
      }
      if (file.size > maxSize) {
        toast({ description: `Arquivo ${file.name} excede 5MB.` });
        return false;
      }
      return true;
    });

    if (validFiles.length + selectedFiles.length > maxFiles) {
      toast({ description: `Você pode enviar até ${maxFiles} arquivos.` });
      setSelectedFiles([...selectedFiles, ...validFiles].slice(0, maxFiles));
    } else {
      setSelectedFiles([...selectedFiles, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
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
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ description: 'Usuário não autenticado.' });
        throw new Error('Usuário não autenticado');
      }

      // Upload files to Supabase Storage
      const uploadedUrls: string[] = [];
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
          console.log('Uploading file:', fileName, 'Type:', file.type, 'Size:', file.size);
          const { data, error: uploadError } = await supabase.storage
            .from('review-media')
            .upload(fileName, file, { upsert: false });
          if (uploadError) {
            console.error('File upload error:', uploadError);
            toast({ description: `Erro ao fazer upload do arquivo ${file.name}: ${uploadError.message}` });
            throw new Error(`Erro ao fazer upload do arquivo ${file.name}`);
          }
          console.log('File uploaded:', data?.path);
          const { data: urlData } = supabase.storage
            .from('review-media')
            .getPublicUrl(fileName);
          if (!urlData?.publicUrl) {
            console.error('Failed to get public URL for file:', fileName);
            toast({ description: `Erro ao obter URL do arquivo ${file.name}` });
            throw new Error(`Erro ao obter URL do arquivo ${file.name}`);
          }
          console.log('Public URL:', urlData.publicUrl);
          uploadedUrls.push(urlData.publicUrl);
        }
      }

      // Insert review with file URLs
      console.log('Inserting review:', { item_id: product.id, user_id: user.id, rating: userRating, comment: userComment, images: uploadedUrls });
      const { data: insertData, error } = await supabase
        .from('reviews')
        .insert({
          item_id: product.id,
          user_id: user.id,
          rating: userRating,
          comment: userComment.trim() || null,
          images: uploadedUrls.length > 0 ? uploadedUrls : [],
        });
      if (error) {
        console.error('Review insert error:', error.message, 'Code:', error.code);
        toast({ description: `Erro ao inserir avaliação: ${error.message}` });
        throw error;
      }
      console.log('Review inserted:', insertData);
      toast({ description: 'Avaliação enviada com sucesso!' });
      setUserRating(0);
      setUserComment('');
      setSelectedFiles([]);
    } catch (error: any) {
      console.error('Error submitting review:', error.message, 'Code:', error.code);
      toast({ description: `Erro ao enviar a avaliação: ${error.message}` });
    } finally {
      setSubmitting(false);
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
            className={`${starSize} ${star <= rating
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

  const isVideo = (url: string) => {
    return url.endsWith('.mp4') || url.endsWith('.webm');
  };

  const handleMediaClick = (url: string) => {
    setSelectedMedia(url);
  };

  const closeLightbox = () => {
    setSelectedMedia(null);
  };

  const handlePrevImage = () => {
    if (product && product.images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }
  };

  const handleNextImage = () => {
    if (product && product.images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handleDotClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  const calculateDiscount = (price: number, original_price: number | null) => {
    if (!original_price || original_price <= price) return null;
    return Math.round((1 - price / original_price) * 100);
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

  const discountPercentage = calculateDiscount(product.price, product.original_price);

  return (
    <div className="min-h-screen bg-background">
      <div className="border bg-background shadow-sm top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
            <Link to="/catalogo">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Link>
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-8 mb-4">
          <div className="space-y-4">
            {product.images.length > 0 ? (
              <div className="relative aspect-square overflow-hidden rounded-lg shadow-md">
                <img
                  src={product.images[currentImageIndex].url}
                  alt={product.images[currentImageIndex].alt || product.name}
                  className="w-full h-full object-cover transition-opacity duration-300"
                />
                {product.images.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white hover:bg-opacity-75"
                      onClick={handlePrevImage}
                      aria-label="Imagem anterior"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white hover:bg-opacity-75"
                      onClick={handleNextImage}
                      aria-label="Próxima imagem"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </Button>
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                      {product.images.map((_, index) => (
                        <button
                          key={index}
                          className={`w-2 h-2 rounded-full transition-all duration-200 ${index === currentImageIndex
                            ? 'bg-white scale-125'
                            : 'bg-gray-400 hover:bg-gray-200'
                            }`}
                          onClick={() => handleDotClick(index)}
                          aria-label={`Ir para imagem ${index + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
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
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => handleThumbnailClick(index)}
                    className={`flex-shrink-0 w-20 h-20 border-2 rounded-md overflow-hidden transition-all ${index === currentImageIndex
                      ? 'border-primary opacity-100'
                      : 'border-gray-300 opacity-70 hover:opacity-100'
                      }`}
                  >
                    <img
                      src={image.url}
                      alt={image.alt || `${product.name} - Miniatura ${index + 1}`}
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
              <h1 className="text-3xl Capsule font-bold text-muted-foreground mb-2">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  {renderStars(averageRating, 'md')}
                  <span className="text-sm font-medium">{averageRating.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">({totalReviews} avaliações)</span>
                </div>
              </div>
            </div>



            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl font-bold text-green-600">
                    R$ {product.price.toFixed(2).replace('.', ',')}
                  </span>
                  {product.original_price && product.original_price > product.price && (
                    <>
                      <span className="text-lg text-muted-foreground line-through">
                        R$ {product.original_price.toFixed(2).replace('.', ',')}
                      </span>
                      <Badge variant="destructive">
                        -{discountPercentage}%
                      </Badge>
                    </>
                  )}
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
                    className="w-full foreground dark:text-muted-foreground  bg-green-600 hover:bg-green-700"
                    onClick={handleWhatsAppContact}
                    disabled={!isAuthenticated}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Consultar no WhatsApp
                  </Button>
                  <Button
                    variant={isInCart ? "destructive" : "outline"}
                    className="w-full hover:text-muted dark:text-muted-foreground"
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

        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">Descrição do Produto:</h3>
            <p className="muted-foreground mb-4">{product.description}</p>
          </CardContent>
        </Card>

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

              <Separator className="mb-6" />

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="flex justify-center items-center flex-col text-center space-y-2">
                  <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
                  {renderStars(averageRating, 'md')}
                  <p className="text-muted-foreground text-sm">Baseado em {totalReviews} avaliações</p>
                </div>
                <div className="space-y-2">
                  {ratingDistribution.map(({ rating, count, percentage }) => (
                    <div key={rating} className="flex items-center gap-3">
                      <span className="text-sm font-medium w-8">{rating}★</span>
                      <Progress value={percentage} className="flex-1 h-2" />
                      <span className="text-sm text-muted-foreground w-8">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="mb-6" />

              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
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
                    <div key={review.id} className="border-b border-border last:border-0 pb-6 last:pb-0">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={review.avatar} />
                          <AvatarFallback>
                            {review.user.display_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col gap-3 flex-1 space-y-3">
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
                                <span className="text-sm text-muted-foreground">
                                  {formatDate(review.created_at)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="text-muted-foreground leading-relaxed">{review.comment || 'Sem comentário.'}</p>
                          {review.images && review.images.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto">
                              {review.images.map((url, index) => (
                                <div key={index} className="relative">
                                  {isVideo(url) ? (
                                    <video
                                      src={url}
                                      controls
                                      className="w-20 h-20 object-cover rounded-lg border cursor-pointer"
                                      onClick={() => handleMediaClick(url)}
                                    />
                                  ) : (
                                    <img
                                      src={url}
                                      alt={`Foto da avaliação ${index + 1}`}
                                      className="w-20 h-20 object-cover rounded-lg border cursor-pointer"
                                      onClick={() => handleMediaClick(url)}
                                    />
                                  )}
                                </div>
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

              <Separator className="my-6" />

              {isAuthenticated ? (
                <div id="review-form" className="mb-6 space-y-4">
                  <h4 className="font-medium">Deixe sua avaliação</h4>
                  <div className="flex items-center gap-2 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setUserRating(star)}
                        className="focus:outline-none"
                        disabled={submitting}
                      >
                        <Star
                          className={`w-6 h-6 ${star <= userRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
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
                    disabled={submitting}
                  />
                  <div className="space-y-2">
                    <div className={`border-2 border-dashed border-slate-300 300 dark:border-slate-700 rounded-xl p-8 text-center hover:border-emerald-400 hover:bg-emerald-50/10 transition-all duration-300 cursor-pointer group ${submitting ? 'opacity-50  pointer-events-none' : ''}`}>
                      <label htmlFor="media-upload" className="-Cursor-pointer block">
                        <div className="space-4">
                          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                            <Upload className="h-8 w-8 text-white" />
                          </div>
                          <div>
                            <p className="text-base sm:text-lg font-semibold">Adicionar Fotos ou Vídeos</p>
                            <p className="text-xs sm:text-sm text-muted-foreground">JPEG, PNG, MP4, WebM até 5MB cada (máximo 3 arquivos)</p>
                          </div>
                        </div>
                        <input
                          id="media-upload"
                          type="file"
                          accept="image/jpeg,image/png,video/mp4,video/webm"
                          multiple
                          onChange={handleFileChange}
                          className="hidden"
                          disabled={submitting}
                        />
                      </label>
                    </div>
                    {selectedFiles.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="relative">
                            {file.type.startsWith('image/') ? (
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Prévia ${index + 1}`}
                                className="w-20 h-20 object-cover rounded-lg border"
                              />
                            ) : (
                              <video
                                src={URL.createObjectURL(file)}
                                controls
                                className="w-20 h-20 object-cover rounded-lg border"
                              />
                            )}
                            <Button
                              variant="destructive"
                              size="sm"
                              className="absolute top-0 right-0 w-6 h-6 p-0 flex items-center justify-center"
                              onClick={() => removeFile(index)}
                              disabled={submitting}
                            >
                              &times;
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={handleReviewSubmit}
                    className="bg-green-600 hover:bg-green-500 text-white"
                    disabled={submitting}
                  >
                    {submitting ? 'Enviando...' : 'Enviar Avaliação'}
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mb-6">
                  Faça login para deixar uma avaliação.
                </p>
              )}

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

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Produtos Sugeridos</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingSuggestions ? (
                <p className="text-muted-foreground">Carregando sugestões...</p>
              ) : suggestedProducts.length > 0 ? (
                <div className="grid md:grid-cols-4 gap-4">
                  {suggestedProducts.map((suggestion) => (
                    <SuggestionProductCard
                      key={suggestion.id}
                      id={suggestion.id}
                      name={suggestion.name}
                      category={suggestion.category}
                      images={suggestion.images}
                      description={suggestion.description}
                      slug={suggestion.slug}
                      price={suggestion.price}
                      original_price={suggestion.original_price}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhuma sugestão disponível.</p>
              )}
            </CardContent>
          </Card>
        </div>
        

        {selectedMedia && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="relative max-w-4xl w-full">
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 text-white"
                onClick={closeLightbox}
              >
                <X className="w-6 h-6" />
              </Button>
              {isVideo(selectedMedia) ? (
                <video
                  src={selectedMedia}
                  controls
                  autoPlay
                  className="w-full h-auto max-h-[80vh] object-contain"
                />
              ) : (
                <img
                  src={selectedMedia}
                  alt="Media preview"
                  className="w-full h-auto max-h-[80vh] object-contain"
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  
    
  );
};

interface SuggestionProductCardProps {
  id: number;
  name: string;
  category: string;
  images: ProductImage[];
  description: string;
  slug: string;
  price: number;
  original_price: number | null;
}

const SuggestionProductCard: React.FC<SuggestionProductCardProps> = ({
  id,
  name,
  category,
  images,
  description,
  slug,
  price,
  original_price,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isInCart, setIsInCart] = useState(false);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const { addToCart, removeFromCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: cartItem } = await supabase
            .from('cart')
            .select('id')
            .eq('user_id', user.id)
            .eq('item_id', id)
            .single();
          setIsInCart(!!cartItem);
        }

        const { data: reviews, error: reviewsError } = await supabase
          .from('reviews')
          .select('rating')
          .eq('item_id', id);

        if (!reviewsError && reviews && reviews.length > 0) {
          const total = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
          const avg = total / reviews.length;
          setAverageRating(avg);
          setReviewCount(reviews.length);
        } else {
          setAverageRating(null);
          setReviewCount(0);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do produto sugerido:', error);
      }
    };
    fetchData();
  }, [id]);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleCartToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (isInCart) {
        await removeFromCart(id);
        setIsInCart(false);
        toast({ description: `${name} removido do carrinho` });
      } else {
        await addToCart(id, 1);
        setIsInCart(true);
        toast({ description: `${name} adicionado ao carrinho` });
      }
    } catch (error) {
      console.error('Error toggling cart item:', error);
      toast({ description: 'Erro ao atualizar o carrinho.' });
    }
  };

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const message = `Olá! Tenho interesse no produto: ${name}. Poderia me dar mais informações?`;
    const whatsappUrl = `${WHATSAPP_LINK}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (!slug) return null;

  const hasDiscount = original_price !== null && original_price > price;
  const discountPercent = hasDiscount ? Math.round(((original_price - price) / original_price) * 100) : 0;

  return (
    <Card className="group overflow-hidden card-hover glass-subtle border-0 relative animate-fade-in-up">
      <div className="relative aspect-square overflow-hidden bg-muted/20">
        <img
          src={images[currentImageIndex]?.url || images[0]?.url || 'https://via.placeholder.com/300'}
          alt={images[currentImageIndex]?.alt || name}
          className="w-full h-full object-cover transition-all duration-500 hover:scale-105"
        />
        {images.length > 1 && (
          <>
            <button
              onClick={nextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 text-gray-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={prevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 text-gray-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </>
        )}
        {hasDiscount && (
          <div className="absolute top-3 left-3 bg-red-600 text-white text-xs px-2 py-1 rounded-md shadow-md">
            -{discountPercent}%
          </div>
        )}
      </div>

      <CardContent className="p-5 space-y-3">
        <div className="flex items-start justify-between">
          <Badge variant="secondary" className="text-xs">
            {category}
          </Badge>

          {averageRating !== null ? (
            <div className="flex items-center gap-1 text-yellow-500 text-sm mt-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i <= Math.round(averageRating) ? 'fill-current' : 'opacity-30'}`}
                />
              ))}
              <span className="text-muted-foreground text-xs ml-1">
                ({reviewCount})
              </span>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground mt-1">Sem avaliações</p>
          )}
        </div>

        <Link to={`/produto/${slug}`} className="block">
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors duration-200">
            {name}
          </h3>

          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {description}
          </p>

          <div className="flex items-center gap-2 mt-1">
            {hasDiscount ? (
              <>
                <p className="text-2xl font-bold text-primary">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)}
                </p>
                <p className="text-sm text-muted-foreground line-through">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(original_price!)}
                </p>
              </>
            ) : (
              <p className="text-lg font-bold text-primary">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)}
              </p>
            )}
          </div>
        </Link>

        <div className="flex justify-center items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleWhatsAppClick}
            className="w-full hover:text-white"
          >
            Consultar no WhatsApp
          </Button>
          <Button
            onClick={handleCartToggle}
            variant="outline"
            size="sm"
            className={`hover:bg-emerald-400 transition-all duration-200 ${
              isInCart
                ? 'bg-emerald-500 text-white hover:text-emerald-600'
                : 'text-muted-foreground hover:text-emerald-500'
            }`}
          >
            <ShoppingCart className={`w-4 h-4 ${isInCart ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductDetail;