import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Upload } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { supabase } from '../../lib/supabaseClient';
import { toast } from 'sonner';

const categories = [
  'Sustentável',
  'Orgânico',
  'Reciclado'
];

const EditProductPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    image: null,
    existingImage: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(`Erro ao buscar produto: ${error.message}`);
      }

      setFormData({
        name: data.name,
        category: data.category,
        description: data.description,
        image: null,
        existingImage: data.images?.[0] || null,
      });
      setImagePreview(data.images?.[0]?.url || null);
    } catch (error) {
      toast.error(error.message);
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Imagem muito grande. Máximo 5MB.');
        return;
      }

      setFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCategoryChange = (value) => {
    setFormData((prev) => ({ ...prev, category: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.category || !formData.description.trim()) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsSubmitting(true);
    try {
      let imageData = formData.existingImage;
      if (formData.image) {
        // Delete old image if exists
        if (formData.existingImage?.url) {
          const fileName = formData.existingImage.url.split('/').pop();
          if (fileName) {
            await supabase.storage
              .from('item-images')
              .remove([`images/${fileName}`]);
          }
        }

        // Upload new image
        const fileName = `${Date.now()}_${formData.image.name}`;
        const { error: uploadError } = await supabase.storage
          .from('item-images')
          .upload(`images/${fileName}`, formData.image);

        if (uploadError) {
          throw new Error(`Erro ao fazer upload da imagem: ${uploadError.message}`);
        }

        const { publicUrl } = supabase.storage
          .from('item-images')
          .getPublicUrl(`images/${fileName}`).data;

        imageData = { url: publicUrl, alt: formData.image.name };
      }

      const updatedProduct = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        images: imageData ? [imageData] : formData.existingImage ? [formData.existingImage] : [],
      };

      const { error: updateError } = await supabase
        .from('items')
        .update(updatedProduct)
        .eq('id', id);

      if (updateError) {
        throw new Error(`Erro ao atualizar produto: ${updateError.message}`);
      }

      toast.success('Produto atualizado com sucesso!');
      navigate('/products');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    navigate('/products');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={handleGoBack}
          className="mb-4 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all duration-300"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Lista de Produtos
        </Button>
        <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent mb-2">
          Editar Produto
        </h1>
        <p className="text-slate-400 text-center">
          Atualize as informações do produto abaixo
        </p>
      </div>

      <Card className="glass-morphism border-white/10 animate-slide-up">
        <CardHeader>
          <CardTitle className="text-2xl text-slate-100 flex items-center space-x-2">
            <span>Editar Informações do Produto</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-200 font-medium">
                Nome do Produto *
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Digite o nome do produto"
                value={formData.name}
                onChange={handleInputChange}
                className="bg-slate-800/50 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-emerald-400 transition-all duration-300"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-slate-200 font-medium">
                Categoria *
              </Label>
              <Select value={formData.category} onValueChange={handleCategoryChange}>
                <SelectTrigger className="bg-slate-800/50 border-slate-600 text-slate-100 focus:border-emerald-400 transition-all duration-300">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {categories.map((category) => (
                    <SelectItem key={category} value={category} className="text-slate-100 focus:bg-emerald-500/20">
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-slate-200 font-medium">
                Descrição *
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Digite a descrição do produto"
                value={formData.description}
                onChange={handleInputChange}
                className="bg-slate-800/50 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-emerald-400 transition-all duration-300 min-h-[120px] resize-none"
                required
              />
            </div>

            <div className="space-y-4">
              <Label className="text-slate-200 font-medium">
                Imagem do Produto
              </Label>
              <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-emerald-400/50 transition-all duration-300">
                {imagePreview ? (
                  <div className="space-y-4">
                    <div className="relative inline-block">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="max-w-full max-h-48 rounded-lg shadow-lg"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setImagePreview(null);
                        setFormData(prev => ({ ...prev, image: null, existingImage: null }));
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      Remover Imagem
                    </Button>
                  </div>
                ) : (
                  <label htmlFor="image" className="cursor-pointer block">
                    <div className="space-y-3">
                      <Upload className="h-12 w-12 text-slate-400 mx-auto" />
                      <div>
                        <p className="text-slate-300 font-medium">Selecionar Imagem</p>
                        <p className="text-slate-500 text-sm">PNG, JPG até 5MB</p>
                      </div>
                    </div>
                    <input
                      id="image"
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <span>Atualizando Produto...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>Atualizar Produto</span>
                </div>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditProductPage;