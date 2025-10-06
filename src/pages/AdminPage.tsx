import React, { useState, useRef } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ArrowLeft, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import ThemeToggle from '../components/layout/ThemeToggle';

// Definindo a interface para o objeto image
interface Image {
  file: File | null;
  alt: string;
  preview?: string;
}

const AdminPage = () => {
  const [product, setProduct] = useState({
    name: '',
    category: '',
    description: '',
    images: [{ file: null, alt: '', preview: undefined }] as Image[],
  });
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  console.log('AdminAddProduct rendered', product);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setProduct((prev) => ({ ...prev, category: value }));
  };

  const handleImageChange = (index: number, field: keyof Image, value: File | string) => {
    const newImages = [...product.images];
    if (field === 'file' && value instanceof File) {
      newImages[index].file = value;
    } else if (field === 'alt' && typeof value === 'string') {
      newImages[index].alt = value;
    } else if (field === 'preview' && typeof value === 'string') {
      newImages[index].preview = value;
    }
    setProduct((prev) => ({ ...prev, images: newImages }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && fileInputRef.current) {
      const previewUrl = URL.createObjectURL(file);
      const newImages = [...product.images, { file, alt: '', preview: previewUrl }];
      setProduct((prev) => ({ ...prev, images: newImages }));
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...product.images];
    if (newImages[index].preview) {
      URL.revokeObjectURL(newImages[index].preview);
    }
    newImages.splice(index, 1);
    setProduct((prev) => ({ ...prev, images: newImages }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validImages = product.images.filter((img) => img.file && img.alt.trim() !== '');
      if (validImages.length === 0) {
        alert('Por favor, adicione pelo menos uma imagem com texto alternativo.');
        setLoading(false);
        return;
      }

      const uploadedImages = await Promise.all(
        validImages.map(async (img, index) => {
          const fileName = `${Date.now()}_${index}_${encodeURIComponent(img.file!.name)}`;
          const { error: uploadError } = await supabase.storage
            .from('item-images')
            .upload(`images/${fileName}`, img.file!);
          if (uploadError) {
            throw new Error(`Erro ao fazer upload da imagem: ${uploadError.message}`);
          }
          const { data: urlData } = supabase.storage
            .from('item-images')
            .getPublicUrl(`images/${fileName}`);
          return {
            url: urlData.publicUrl,
            alt: img.alt,
          };
        })
      );

      const newProduct = {
        name: product.name,
        category: product.category,
        description: product.description,
        images: uploadedImages,
      };

      const { error: insertError } = await supabase
        .from('items')
        .insert([newProduct]);

      if (insertError) {
        throw new Error(`Erro ao salvar o produto: ${insertError.message}`);
      }

      alert('Produto adicionado com sucesso com ' + uploadedImages.length + ' imagem(es)!');
      setProduct({ name: '', category: '', description: '', images: [{ file: null, alt: '', preview: undefined }] });
      product.images.forEach((img) => img.preview && URL.revokeObjectURL(img.preview));
    } catch (error: any) {
      console.error('Erro:', error.message);
      alert('Erro ao adicionar o produto: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-12">
        <Link to="/" className="inline-flex items-center text-primary hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Link>
        <ThemeToggle />
      </div>

      {/* Main Content */}
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-4xl md:text-5xl font-bold text-center eco-text-gradient">
            Adicionar Novo Produto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                name="name"
                value={product.name}
                onChange={handleInputChange}
                placeholder="Nome do produto"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
              <Select value={product.category} onValueChange={handleSelectChange} required>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ecobags">Ecobags</SelectItem>
                  <SelectItem value="Cinzeiros">Cinzeiros</SelectItem>
                  <SelectItem value="Mini Telas">Mini Telas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição *</Label>
              <Input
                id="description"
                name="description"
                value={product.description}
                onChange={handleInputChange}
                placeholder="Descrição do produto"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Imagens *</Label>
              {product.images.map((image, index) => (
                <div key={index} className="flex items-center space-x-2">
                  {image.file && (
                    <div className="relative w-32 h-32 mr-2">
                      <img
                        src={image.preview || ''}
                        alt={image.alt || `Pré-visualização ${index + 1}`}
                        className="w-full h-full object-cover rounded border-2 border-blue-500"
                      />
                      <Button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold hover:bg-red-700 p-0"
                        title="Remover imagem"
                        aria-label="Remover imagem"
                      >
                        X
                      </Button>
                    </div>
                  )}
                  {image.file && (
                    <div className="flex-1">
                      <Input
                        type="text"
                        placeholder="Texto alternativo"
                        value={image.alt}
                        onChange={(e) => handleImageChange(index, 'alt', e.target.value)}
                        required
                      />
                    </div>
                  )}
                </div>
              ))}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
              />
              <Button
                type="button"
                className="mt-2 eco-gradient text-white"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
              >
                <Plus className="mr-2 h-4 w-4" /> Adicionar outra imagem
              </Button>
            </div>

            <Button
              type="submit"
              className="w-full eco-gradient text-white"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar Produto'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPage;