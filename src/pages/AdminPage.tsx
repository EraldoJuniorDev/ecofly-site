import React, { useState, useRef } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient'; // Importa o cliente Supabase

const AdminPage = () => {
  const [product, setProduct] = useState({
    name: '',
    category: '',
    description: '',
    images: [{ file: null as File | null, alt: '' }],
  });
  const [loading, setLoading] = useState(false); // Estado para controle de carregamento
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Depuração
  console.log('AdminAddProduct rendered', product);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (index: number, field: string, value: File | string) => {
    const newImages = [...product.images];
    newImages[index][field] = value;
    setProduct((prev) => ({ ...prev, images: newImages }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && fileInputRef.current) {
      const previewUrl = URL.createObjectURL(file);
      const newImages = [...product.images, { file, alt: '', preview: previewUrl }];
      setProduct((prev) => ({ ...prev, images: newImages }));
      fileInputRef.current.value = ''; // Limpa o input para permitir nova seleção
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...product.images];
    if (newImages[index].preview) {
      URL.revokeObjectURL(newImages[index].preview); // Libera a URL do blob
    }
    newImages.splice(index, 1);
    setProduct((prev) => ({ ...prev, images: newImages }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validação: pelo menos uma imagem com texto alternativo
      const validImages = product.images.filter((img) => img.file && img.alt.trim() !== '');
      if (validImages.length === 0) {
        alert('Por favor, adicione pelo menos uma imagem com texto alternativo.');
        setLoading(false);
        return;
      }

      // Fazer upload das imagens para o Supabase Storage
      const uploadedImages = await Promise.all(
        validImages.map(async (img, index) => {
          const fileName = `${Date.now()}_${index}_${encodeURIComponent(img.file!.name)}`; // Nome único para a imagem
          const { error: uploadError } = await supabase.storage
            .from('item-images') // Nome do bucket
            .upload(`images/${fileName}`, img.file!);
          if (uploadError) {
            throw new Error(`Erro ao fazer upload da imagem: ${uploadError.message}`);
          }
          // Obter a URL pública da imagem
          const { data: urlData } = supabase.storage
            .from('item-images')
            .getPublicUrl(`images/${fileName}`);
          return {
            url: urlData.publicUrl,
            alt: img.alt,
          };
        })
      );

      // Criar o objeto do produto para salvar no Supabase
      const newProduct = {
        name: product.name,
        category: product.category,
        description: product.description,
        images: uploadedImages,
      };

      // Inserir o produto na tabela 'items' do Supabase
      const { error: insertError } = await supabase
        .from('items')
        .insert([newProduct]);

      if (insertError) {
        throw new Error(`Erro ao salvar o produto: ${insertError.message}`);
      }

      alert('Produto adicionado com sucesso com ' + uploadedImages.length + ' imagem(es)!');
      setProduct({ name: '', category: '', description: '', images: [{ file: null, alt: '' }] });
      product.images.forEach((img) => img.preview && URL.revokeObjectURL(img.preview)); // Libera todas as URLs
    } catch (error: any) {
      console.error('Erro:', error.message);
      alert('Erro ao adicionar o produto: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 py-16" style={{ opacity: 1, visibility: 'visible' }}>
      <div className="container px-4">
        <Link to="/" className="inline-flex items-center text-primary mb-6 hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Link>
        <Card className="max-w-2xl mx-auto border-none glass-subtle shadow-lg" style={{ opacity: 1 }}>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center eco-text-gradient">Adicionar Novo Produto</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-muted-foreground">Nome</label>
                <input
                  type="text"
                  name="name"
                  value={product.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md bg-white/50 focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-muted-foreground">Categoria</label>
                <select
                  name="category"
                  value={product.category}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md bg-white/50 focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  <option value="Ecobags">Ecobags</option>
                  <option value="Cinzeiros">Cinzeiros</option>
                  <option value="Mini Telas">Mini Telas</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-muted-foreground">Descrição</label>
                <textarea
                  name="description"
                  value={product.description}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md bg-white/50 focus:ring-2 focus:ring-primary"
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-muted-foreground">Imagens</label>
                {product.images.map((image, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    {image.file && (
                      <div className="relative w-32 h-32 mr-2">
                        <img
                          src={image.preview || ''}
                          alt={image.alt || `Pré-visualização ${index + 1}`}
                          className="w-full h-full object-cover rounded border-2 border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-0 right-0 bg-red-500 text-white text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                          title="Remover imagem"
                        >
                          X
                        </button>
                      </div>
                    )}
                    {image.file && (
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Texto alternativo"
                          value={image.alt}
                          onChange={(e) => handleImageChange(index, 'alt', e.target.value)}
                          className="w-full p-2 border rounded-md bg-white/50 focus:ring-2 focus:ring-primary"
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
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 text-primary border-primary hover:bg-primary/10"
                  disabled={loading}
                >
                  <Plus className="mr-2 h-4 w-4" /> Adicionar outra imagem
                </Button>
              </div>

              <Button
                type="submit"
                className="w-full eco-gradient text-white btn-smooth"
                disabled={loading}
              >
                {loading ? 'Salvando...' : 'Salvar Produto'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPage;