import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Upload, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { supabase } from '../../lib/supabaseClient';
import { toast } from 'sonner';

const categories = ['Ecobag', 'Cinzeiro', 'Mini Tela'];

const AdminPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    images: [] as File[],
  });
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    // Verifica tamanho individual
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`A imagem "${file.name}" excede 5MB.`);
        return;
      }
    }

    // Atualiza estado com novas imagens
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...files],
    }));

    // Cria pré-visualizações
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.category || !formData.description.trim()) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (formData.images.length === 0) {
      toast.error('Por favor, selecione pelo menos uma imagem.');
      return;
    }

    setIsSubmitting(true);
    try {
      const imageUrls: { url: string; alt: string }[] = [];

      for (const file of formData.images) {
        const fileName = `${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('item-images')
          .upload(`images/${fileName}`, file);

        if (uploadError) throw new Error(uploadError.message);

        const { publicUrl } = supabase.storage
          .from('item-images')
          .getPublicUrl(`images/${fileName}`).data;

        imageUrls.push({ url: publicUrl, alt: file.name });
      }

      const newProduct = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        images: imageUrls,
      };

      const { error: insertError } = await supabase.from('items').insert([newProduct]);
      if (insertError) throw new Error(insertError.message);

      toast.success('Produto adicionado com sucesso!');
      setFormData({ name: '', category: '', description: '', images: [] });
      setImagePreviews([]);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => navigate(-1);

  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={handleGoBack}
          className="mb-4 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10 transition-all duration-300"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para a página inicial
        </Button>

        <h1 className="text-4xl font-bold text-center eco-text-gradient mb-2">
          Adicionar Novo Produto
        </h1>
        <p className="text-muted-foreground text-center">
          Preencha as informações abaixo para adicionar um novo produto ao sistema
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Plus className="h-6 w-6 text-emerald-500" />
            <span>Informações do Produto</span>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Produto *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Digite o nome do produto"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Categoria */}
            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
              <Select value={formData.category} onValueChange={handleCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="description">Descrição *</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Digite a descrição do produto"
                value={formData.description}
                onChange={handleInputChange}
                rows={5}
                required
              />
            </div>

            {/* Upload de Imagens */}
            <div className="space-y-2">
              <Label>Imagens do Produto *</Label>
              <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center hover:border-emerald-400/50 transition-all duration-300">
                {imagePreviews.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {imagePreviews.map((src, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={src}
                          alt={`Preview ${index + 1}`}
                          className="rounded-md shadow-sm object-cover w-full h-32"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <label htmlFor="images" className="cursor-pointer block">
                    <div className="space-y-3">
                      <Upload className="h-10 w-10 text-muted-foreground mx-auto" />
                      <p className="font-medium">Selecionar Imagens</p>
                      <p className="text-sm text-muted-foreground">PNG, JPG até 5MB (você pode escolher várias)</p>
                    </div>
                    <input
                      id="images"
                      type="file"
                      accept="image/*"
                      multiple
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {imagePreviews.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setImagePreviews([]);
                    setFormData((prev) => ({ ...prev, images: [] }));
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="mt-3"
                >
                  Remover todas as imagens
                </Button>
              )}
            </div>

            {/* Botão de envio */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full eco-gradient text-white hover:opacity-90 transition-all"
            >
              {isSubmitting ? 'Adicionando Produto...' : (
                <div className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  <span>Adicionar Produto</span>
                </div>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPage;
