import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Upload,
  X,
  Trash2,
  Pencil,
  Settings,
  BarChart3,
  Grid3X3,
  List as ListIcon,
  Eye,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabaseClient";
import { toast } from "sonner";

import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";

const categories = ["Ecobag", "Cinzeiro", "Mini Tela"];
const LOCAL_STORAGE_TAB_KEY = "admin_active_tab";
type ImageObj = { url: string; alt?: string };

const AdminPage: React.FC = () => {
  const navigate = useNavigate();

  // general
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // tab control (persisted)
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window === "undefined") return "add";
    return localStorage.getItem(LOCAL_STORAGE_TAB_KEY) || "add";
  });
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_TAB_KEY, activeTab);
    } catch {
      // ignore
    }
  }, [activeTab]);

  // add product
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    images: [] as File[],
  });
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);

  // edit product (full editor in Edit tab)
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    category: "",
    description: "",
    images: [] as ImageObj[],
    newImages: [] as File[],
  });
  const [editPreviews, setEditPreviews] = useState<string[]>([]);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showEditConfirmDialog, setShowEditConfirmDialog] = useState(false);

  // quick edit (for List cards) - simplified modal
  const [quickEditProduct, setQuickEditProduct] = useState<any>(null);
  const [quickEditForm, setQuickEditForm] = useState({ name: "", category: "", description: "" });
  const [showQuickEditDialog, setShowQuickEditDialog] = useState(false);
  const [showQuickEditConfirmDialog, setShowQuickEditConfirmDialog] = useState(false);

  // delete (shared)
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // list tab: filter & view
  const [listCategory, setListCategory] = useState<string>("Todos");
  const [listSearch, setListSearch] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // fetch products
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.from("items").select("*");
      if (error) throw error;
      setProducts(data || []);
    } catch (err: any) {
      console.error("fetchProducts error:", err);
      toast.error(err?.message || "Erro ao carregar produtos");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchProducts();
  }, []);

  const handleGoBack = () => navigate(-1);

  // --- Add helpers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };
  const handleCategoryChange = (value: string) => {
    setFormData((p) => ({ ...p, category: value }));
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`A imagem "${file.name}" excede 5MB.`);
        return;
      }
    }
    setFormData((p) => ({ ...p, images: [...p.images, ...files] }));
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setImagePreviews((p) => [...p, ...newPreviews]);
  };
  const handleRemoveImage = (index: number) => {
    setFormData((p) => ({ ...p, images: p.images.filter((_, i) => i !== index) }));
    setImagePreviews((p) => p.filter((_, i) => i !== index));
  };

  // upload helper (bucket: item-images)
  const uploadFileToStorage = async (file: File) => {
    const fileName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
    const bucket = supabase.storage.from("item-images");
    const { error: uploadError } = await bucket.upload(`images/${fileName}`, file);
    if (uploadError) throw uploadError;
    const { data: publicData } = bucket.getPublicUrl(`images/${fileName}`);
    return publicData.publicUrl as string;
  };

  const handleAddProduct = async () => {
    if (!formData.name.trim() || !formData.category || !formData.description.trim()) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    if (formData.images.length === 0) {
      toast.error("Por favor, selecione pelo menos uma imagem.");
      return;
    }
    setShowAddDialog(false);
    setIsSubmitting(true);
    try {
      const imageObjs: ImageObj[] = [];
      for (const file of formData.images) {
        const url = await uploadFileToStorage(file);
        imageObjs.push({ url, alt: file.name });
      }
      const newProduct = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        images: imageObjs,
      };
      const { error: insertError } = await supabase.from("items").insert([newProduct]);
      if (insertError) throw insertError;
      toast.success("Produto adicionado com sucesso!");
      setFormData({ name: "", category: "", description: "", images: [] });
      setImagePreviews([]);
      fetchProducts();
    } catch (err: any) {
      console.error("handleAddProduct error:", err);
      toast.error(err?.message || "Erro ao adicionar produto");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Full Edit (Edit tab) ---
  const handleStartEdit = (product: any) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      category: product.category,
      description: product.description,
      images: product.images || [],
      newImages: [],
    });
    setEditPreviews((product.images || []).map((img: ImageObj) => img.url));
    setShowEditDialog(true);
    setActiveTab("edit");
  };
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm((p) => ({ ...p, [name]: value }));
  };
  const handleEditCategoryChange = (value: string) => {
    setEditForm((p) => ({ ...p, category: value }));
  };
  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`A imagem "${file.name}" excede 5MB.`);
        return;
      }
    }
    setEditForm((p) => ({ ...p, newImages: [...p.newImages, ...files] }));
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setEditPreviews((p) => [...p, ...newPreviews]);
  };
  const handleRemoveEditImage = (index: number) => {
    if (index < editForm.images.length) {
      setEditForm((p) => ({ ...p, images: p.images.filter((_, i) => i !== index) }));
    } else {
      const newIdx = index - editForm.images.length;
      setEditForm((p) => ({ ...p, newImages: p.newImages.filter((_, i) => i !== newIdx) }));
    }
    setEditPreviews((p) => p.filter((_, i) => i !== index));
  };
  const handleEditSubmit = async () => {
    if (!editingProduct) return;
    setShowEditConfirmDialog(false);
    setShowEditDialog(false);
    setIsSubmitting(true);
    try {
      const updatedImages: ImageObj[] = [...editForm.images];
      for (const file of editForm.newImages) {
        const url = await uploadFileToStorage(file);
        updatedImages.push({ url, alt: file.name });
      }
      const { error: updateError } = await supabase
        .from("items")
        .update({
          name: editForm.name,
          category: editForm.category,
          description: editForm.description,
          images: updatedImages,
        })
        .eq("id", editingProduct.id);
      if (updateError) throw updateError;
      toast.success("Produto atualizado com sucesso!");
      setEditingProduct(null);
      setEditForm({ name: "", category: "", description: "", images: [], newImages: [] });
      setEditPreviews([]);
      fetchProducts();
    } catch (err: any) {
      console.error("handleEditSubmit error:", err);
      toast.error(err?.message || "Erro ao atualizar produto");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Quick edit for list cards ---
  const openQuickEditFor = (product: any) => {
    setQuickEditProduct(product);
    setQuickEditForm({ name: product.name || "", category: product.category || "", description: product.description || "" });
    setShowQuickEditDialog(true);
  };

  const handleQuickEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setQuickEditForm((p) => ({ ...p, [name]: value }));
  };

  const handleQuickEditSubmit = async () => {
    if (!quickEditProduct) return;
    setShowQuickEditConfirmDialog(false);
    setShowQuickEditDialog(false);
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("items")
        .update({
          name: quickEditForm.name,
          category: quickEditForm.category,
          description: quickEditForm.description,
          images: quickEditProduct.images,
        })
        .eq("id", quickEditProduct.id);
      if (error) throw error;
      toast.success("Produto atualizado com sucesso!");
      setQuickEditProduct(null);
      setQuickEditForm({ name: "", category: "", description: "" });
      fetchProducts();
    } catch (err: any) {
      console.error("handleQuickEditSubmit error:", err);
      toast.error(err?.message || "Erro ao atualizar produto");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Delete (shared) ---
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setShowDeleteDialog(false);
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("items").delete().eq("id", deleteTarget.id);
      if (error) throw error;
      toast.success("Produto excluído com sucesso!");
      setDeleteTarget(null);
      fetchProducts();
    } catch (err: any) {
      console.error("handleConfirmDelete error:", err);
      toast.error(err?.message || "Erro ao excluir produto");
    } finally {
      setIsSubmitting(false);
    }
  };

  const stats = {
    total: products.length,
    ecobags: products.filter((p) => p.category === "Ecobag").length,
    cinzeiros: products.filter((p) => p.category === "Cinzeiro").length,
    minitelas: products.filter((p) => p.category === "Mini Tela").length,
  };

  // ---- List filtering logic ----
  const listFilteredProducts = products.filter((p) => {
    const matchesCategory = listCategory === "Todos" || p.category === listCategory;
    const q = listSearch.trim().toLowerCase();
    const matchesSearch =
      q === "" ||
      (p.name && String(p.name).toLowerCase().includes(q)) ||
      (p.description && String(p.description).toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="bg-white/80 dark:bg-background backdrop-blur-sm border-b border-slate-200/60 dark:border-slate-700/40 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGoBack}
                className="flex items-center gap-2 text-slate-600 dark:text-slate-200 hover:text-emerald-600 transition-colors duration-300 group"
              >
                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-300" />
                <span className="font-medium">Voltar</span>
              </motion.button>

              <div className="h-6 w-px bg-slate-300 dark:bg-slate-700" />

              <h1 className="text-2xl font-bold eco-text-gradient">Painel Administrativo</h1>
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-slate-500 dark:text-slate-200 hover:text-slate-700 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all duration-200"
              >
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-slate-500 dark:text-slate-200 hover:text-slate-700 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all duration-200"
              >
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Page content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card dark:bg-background rounded-2xl border border-slate-200/60 dark:border-slate-700/40 p-6 shadow-sm"
            >
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-emerald-500" />
                Opções
              </h3>

              <nav className="space-y-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab("list")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === "list"
                      ? "bg-slate-100/80 dark:bg-slate-700/30 text-slate-800 dark:text-slate-50"
                      : "text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-emerald-700 hover:text-slate-800 dark:hover:text-slate-50"
                    }`}
                >
                  <ListIcon className="h-5 w-5" />
                  <span className="font-medium">Lista de Itens</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab("add")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === "add"
                      ? "bg-emerald-100/80 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                      : "text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-emerald-700 hover:text-slate-800 dark:hover:text-slate-50"
                    }`}
                >
                  <Plus className="h-5 w-5" />
                  <span className="font-medium">Adicionar</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab("edit")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === "edit"
                      ? "bg-blue-100/80 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                      : "text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-emerald-700 hover:text-slate-800 dark:hover:text-slate-50"
                    }`}
                >
                  <Pencil className="h-5 w-5" />
                  <span className="font-medium">Editar</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab("delete")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === "delete"
                      ? "bg-red-100/80 dark:bg-red-900/30 text-destructive dark:text-red-400"
                      : "text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-emerald-700 hover:text-slate-800 dark:hover:text-slate-50"
                    }`}
                >
                  <Trash2 className="h-5 w-5" />
                  <span className="font-medium">Excluir</span>
                </motion.button>
              </nav>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card dark:bg-background rounded-2xl border border-slate-200/60 dark:border-slate-700/40 p-6 shadow-sm"
            >
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-emerald-500" />
                Estatísticas
              </h3>

              <div className="space-y-3 text-slate-800 dark:text-slate-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total</span>
                  <span className="font-bold">{stats.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Ecobags</span>
                  <span className="font-semibold">{stats.ecobags}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Cinzeiros</span>
                  <span className="font-semibold">{stats.cinzeiros}</span>
                </div>
                <div className="flex justify-between items-center ">
                  <span className="text-sm">Mini Telas</span>
                  <span className="font-semibold">{stats.minitelas}</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Main */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Gerenciar Produtos</h2>
                </div>

                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(String(v))} className="space-y-6">

                  {/* Add tab */}
                  <TabsContent value="add">
                    <motion.div
                      key="add"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="bg-card dark:bg-background rounded-2xl border border-slate-200/60 dark:border-slate-700/40 shadow-sm"
                    >
                      <div className="p-4 sm:p-8">
                        <div className="flex items-center gap-3 mb-8">
                          <div className="p-3 eco-gradient rounded-xl">
                            <Plus className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h2 className="text-xl sm:text-2xl font-bold">Adicionar Novo Produto</h2>
                            <p className="text-sm sm:text-base text-muted-foreground">Preencha as informações do produto abaixo</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                          <div className="space-y-6">
                            <div>
                              <Label htmlFor="name">Nome do Produto *</Label>
                              <Input id="name" name="name" placeholder="Digite o nome do produto" value={formData.name} onChange={handleInputChange} className="w-full" />
                            </div>

                            <div>
                              <Label>Categoria *</Label>
                              <Select value={formData.category} onValueChange={handleCategoryChange}>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Selecione uma categoria" />
                                </SelectTrigger>
                                <SelectContent>
                                  {categories.map((c) => (
                                    <SelectItem key={c} value={c}>
                                      {c}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label>Descrição *</Label>
                              <Textarea id="description" name="description" placeholder="Digite a descrição do produto" value={formData.description} onChange={handleInputChange} rows={6} className="w-full" />
                            </div>
                          </div>

                          <div className="space-y-6">
                            <Label>Imagens Selecionadas:</Label>
                            <div>
                              {imagePreviews.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                                  {imagePreviews.map((src, i) => (
                                    <div key={i} className="relative group/image">
                                      <img src={src} alt={`Preview ${i + 1}`} className="w-full h-32 object-cover rounded-lg shadow-sm" />
                                      <button type="button" onClick={() => handleRemoveImage(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover/image:opacity-100 transition-opacity duration-200">
                                        <X className="h-4 w-4" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center hover:border-emerald-400 hover:bg-emerald-50/10 transition-all duration-300 cursor-pointer group">
                                <label htmlFor="images" className="cursor-pointer block">
                                  <div className="space-y-4">
                                    <div className="mx-auto w-16 h-16 eco-gradient rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                                      <Upload className="h-8 w-8 text-white" />
                                    </div>

                                    <div>
                                      <p className="text-base sm:text-lg font-semibold">Adicionar Imagens</p>
                                      <p className="text-xs sm:text-sm text-muted-foreground">PNG, JPG até 5MB cada (múltiplas seleções permitidas)</p>
                                    </div>
                                  </div>
                                  <input id="images" type="file" accept="image/*" multiple ref={fileInputRef} onChange={handleImageChange} className="hidden" />
                                </label>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Progresso do produto</span>
                                <span className="font-semibold">
                                  {[formData.name, formData.category, formData.description, imagePreviews.length > 0].filter(Boolean).length}/4
                                </span>
                              </div>
                              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                <div className="bg-gradient-to-r from-emerald-500 to-emerald-500 h-2 rounded-full transition-all duration-300" style={{ width: `${([formData.name, formData.category, formData.description, imagePreviews.length > 0].filter(Boolean).length / 4) * 100}%` }} />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowAddDialog(true)} disabled={isSubmitting} className="px-8 py-3 eco-gradient text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                            {isSubmitting ? (<><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Adicionando...</>) : (<><Plus className="h-5 w-5" />Adicionar Produto</>)}
                          </motion.button>
                        </div>

                        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                          <DialogContent className="fixed left-[50%] top-[50%] z-50 grid w-[90vw] max-w-[500px] min-w-[280px] translate-x-[-50%] translate-y-[-50%] gap-4 border bg-card dark:bg-background p-4 sm:p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader className="text-center sm:text-left mb-4">
                              <DialogTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">Confirmar Adição</DialogTitle>
                              <p className="text-sm text-muted-foreground">Tem certeza que deseja adicionar este produto?</p>
                            </DialogHeader>
                            <DialogFooter className="flex flex-col sm:flex-row justify-end gap-3">
                              <Button
                                variant="ghost"
                                onClick={() => setShowAddDialog(false)}
                                className="w-full sm:w-auto text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-destructive border"
                              >
                                Cancelar
                              </Button>
                              <Button
                                onClick={handleAddProduct}
                                disabled={isSubmitting}
                                className="w-full sm:w-auto eco-gradient text-white font-semibold"
                              >
                                {isSubmitting ? "Adicionando..." : "Confirmar"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </motion.div>
                  </TabsContent>

                  {/* Edit tab (full editor) */}
                  <TabsContent value="edit">
                    <motion.div key="edit" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="bg-card dark:bg-background rounded-2xl border border-slate-200/60 dark:border-slate-700/40 shadow-sm">
                      <div className="p-4 sm:p-8">
                        <div className="flex items-center gap-3 mb-8">
                          <div className="p-3 eco-gradient rounded-xl"><Pencil className="h-6 w-6 text-white" /></div>
                          <div><h2 className="text-xl sm:text-2xl font-bold">Editar Produtos</h2><p className="text-sm sm:text-base text-muted-foreground">Selecione um produto para editar suas informações</p></div>
                        </div>

                        {isLoading ? (<p className="text-muted-foreground">Carregando produtos...</p>) : (
                          <div className="space-y-4">
                            {products.map((product) => (
                              <motion.div key={product.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} whileHover={{ scale: 1.01 }} className="flex justify-between items-center border p-2 rounded-md">
                                <div className="flex items-center gap-2"><img src={product.images?.[0]?.url} alt={product.name} className="w-12 h-12 object-cover rounded" /><span>{product.name}</span></div>
                                <div className="flex gap-2"><Button onClick={() => handleStartEdit(product)} className="eco-gradient text-white">Editar</Button></div>
                              </motion.div>
                            ))}
                          </div>
                        )}

                        <Dialog open={showEditDialog} onOpenChange={(open) => { setShowEditDialog(open); if (!open) setEditingProduct(null); }}>
                          <DialogContent className="fixed left-[50%] top-[50%] z-50 grid w-[90vw] max-w-[600px] min-w-[280px] translate-x-[-50%] translate-y-[-50%] gap-4 border bg-card dark:bg-background p-4 sm:p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader className="text-center sm:text-left mb-4">
                              <DialogTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">Editar Produto</DialogTitle>
                              <p className="text-sm text-muted-foreground">Atualize as informações e confirme.</p>
                            </DialogHeader>
                            {editingProduct && (
                              <div className="space-y-4 mt-4">
                                <div>
                                  <Label htmlFor="edit-name">Nome *</Label>
                                  <Input id="edit-name" name="name" value={editForm.name} onChange={handleEditInputChange} className="w-full" />
                                </div>
                                <div>
                                  <Label>Categoria *</Label>
                                  <Select value={editForm.category} onValueChange={handleEditCategoryChange}>
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Selecione categoria" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {categories.map((c) => (
                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label>Descrição *</Label>
                                  <Textarea name="description" value={editForm.description} onChange={handleEditInputChange} rows={5} className="w-full" />
                                </div>
                                <div>
                                  <Label>Imagens *</Label>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {editPreviews.map((src, idx) => (
                                      <div key={idx} className="relative group">
                                        <img src={src} alt={`Preview ${idx + 1}`} className="w-full h-32 object-cover rounded-md" />
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveEditImage(idx)}
                                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                                        >
                                          <X className="h-4 w-4" />
                                        </button>
                                      </div>
                                    ))}
                                    <label className="cursor-pointer border-2 border-dashed rounded-md flex items-center justify-center p-4 hover:border-emerald-400/50 transition">
                                      <Upload className="h-6 w-6 text-muted-foreground" />
                                      <input type="file" accept="image/*" multiple className="hidden" onChange={handleEditImageChange} />
                                    </label>
                                  </div>
                                </div>
                                <DialogFooter className="flex flex-col sm:flex-row justify-end gap-3">
                                  <Button
                                    variant="ghost"
                                    onClick={() => { setShowEditDialog(false); setEditingProduct(null); }}
                                    className="w-full sm:w-auto text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-destructive border"
                                  >
                                    Cancelar
                                  </Button>
                                  <Button
                                    onClick={() => setShowEditConfirmDialog(true)}
                                    disabled={isSubmitting}
                                    className="w-full sm:w-auto eco-gradient text-white font-semibold"
                                  >
                                    {isSubmitting ? "Atualizando..." : "Confirmar"}
                                  </Button>
                                </DialogFooter>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        <Dialog open={showEditConfirmDialog} onOpenChange={setShowEditConfirmDialog}>
                          <DialogContent className="fixed left-[50%] top-[50%] z-50 grid w-[90vw] max-w-[500px] min-w-[280px] translate-x-[-50%] translate-y-[-50%] gap-4 border bg-card dark:bg-background p-4 sm:p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader className="text-center sm:text-left mb-4">
                              <DialogTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">Confirmar Edição</DialogTitle>
                              <p className="text-sm text-muted-foreground">Tem certeza que deseja salvar as alterações no produto "{editingProduct?.name}"?</p>
                            </DialogHeader>
                            <DialogFooter className="flex flex-col sm:flex-row justify-end gap-3">
                              <Button
                                variant="ghost"
                                onClick={() => setShowEditConfirmDialog(false)}
                                className="w-full sm:w-auto text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-destructive border"
                              >
                                Cancelar
                              </Button>
                              <Button
                                onClick={handleEditSubmit}
                                disabled={isSubmitting}
                                className="w-full sm:w-auto eco-gradient text-white font-semibold"
                              >
                                {isSubmitting ? "Salvando..." : "Confirmar"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </motion.div>
                  </TabsContent>

                  {/* Delete tab (list of products with delete control) */}
                  <TabsContent value="delete">
                    <motion.div key="delete" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="bg-card dark:bg-background rounded-2xl border border-slate-200/60 dark:border-slate-700/40 shadow-sm p-4 sm:p-6">
                      <div className="flex items-center gap-3 mb-6"><div className="p-3 rounded-xl eco-gradient"><Trash2 className="h-6 w-6 text-white" /></div><div><h2 className="text-xl sm:text-2xl font-bold">Excluir Produtos</h2><p className="text-sm sm:text-base text-muted-foreground">Selecione um produto para excluir permanentemente</p></div></div>
                      {isLoading ? (<p className="text-muted-foreground">Carregando produtos...</p>) : (<div className="space-y-4">{products.map((product) => (
                        <div key={product.id} className="flex justify-between items-center border p-2 rounded-md">
                          <div className="flex items-center gap-2"><img src={product.images?.[0]?.url} alt={product.name} className="w-12 h-12 object-cover rounded" /><span>{product.name}</span></div>
                          <div>
                            <Dialog open={showDeleteDialog && deleteTarget?.id === product.id} onOpenChange={setShowDeleteDialog}>
                              <DialogTrigger asChild>
                                <Button variant="destructive" onClick={() => { setDeleteTarget(product); setShowDeleteDialog(true); }}>Excluir</Button>
                              </DialogTrigger>
                              <DialogContent className="fixed left-[50%] top-[50%] z-50 grid w-[90vw] max-w-[500px] min-w-[280px] translate-x-[-50%] translate-y-[-50%] gap-4 border bg-card dark:bg-background p-4 sm:p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader className="text-center sm:text-left mb-4">
                                  <DialogTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">Confirmar Exclusão</DialogTitle>
                                  <p className="text-sm text-muted-foreground">Tem certeza que deseja excluir o produto "{product.name}"?</p>
                                </DialogHeader>
                                <DialogFooter className="flex flex-col sm:flex-row justify-end gap-3">
                                  <Button
                                    variant="ghost"
                                    onClick={() => { setShowDeleteDialog(false); setDeleteTarget(null); }}
                                    className="w-full sm:w-auto text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-destructive border"
                                  >
                                    Cancelar
                                  </Button>
                                  <Button
                                    variant="default"
                                    onClick={handleConfirmDelete}
                                    disabled={isSubmitting}
                                    className="w-full sm:w-auto text-white bg-green-700"
                                  >
                                    {isSubmitting ? "Excluindo..." : "Confirmar"}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      ))}</div>)}
                    </motion.div>
                  </TabsContent>
                </Tabs>

                {/* ===== List tab (separate area) ===== */}
                <AnimatePresence>
                  {activeTab === "list" && (
                    <motion.div key="list" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="bg-card dark:bg-background rounded-2xl border border-slate-200/60 dark:border-slate-700/40 shadow-sm p-4 sm:p-6">
                      {/* filter & search */}
                      <div className="flex items-center justify-between mb-6 gap-4 flex-col md:flex-row">
                        <div className="flex items-center gap-3 sm:w-fit">
                          <div className="flex items-center gap-2 bg-card dark:bg-background rounded-md p-2">
                            <Input placeholder="Buscar por nome ou descrição..." value={listSearch} onChange={(e) => setListSearch(e.target.value)} className="w-full md:w-64" />
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Select value={listCategory} onValueChange={(v) => setListCategory(String(v))}>
                            <SelectTrigger className="w-full md:w-44">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Todos">Todos</SelectItem>
                              {categories.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                            </SelectContent>
                          </Select>

                          <div className="flex items-center gap-2">
                            <button onClick={() => setViewMode("grid")} className={`p-2 rounded-md transition ${viewMode === "grid" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" : "text-muted-foreground"}`}><Grid3X3 className="h-4 w-4" /></button>
                            <button onClick={() => setViewMode("list")} className={`p-2 rounded-md transition ${viewMode === "list" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" : "text-muted-foreground"}`}><ListIcon className="h-4 w-4" /></button>
                          </div>
                        </div>
                      </div>

                      {/* content */}
                      {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {[...Array(6)].map((_, i) => (<div key={i} className="bg-white/70 dark:bg-background rounded-2xl p-6 animate-pulse" />))}
                        </div>
                      ) : listFilteredProducts.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">Nenhum produto encontrado.</div>
                      ) : viewMode === "grid" ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {listFilteredProducts.map((product) => (
                            <motion.div key={product.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white/70 dark:bg-background rounded-2xl border border-slate-200/60 dark:border-slate-700/40 overflow-hidden shadow-sm">
                              <div className="relative h-48 overflow-hidden">
                                <img src={product.images?.[0]?.url} alt={product.name} className="w-full h-full object-cover" />
                                <div className="absolute top-3 right-3 bg-white/90 dark:bg-background px-3 py-1 rounded-full text-xs font-medium text-slate-700 dark:text-slate-200">{product.category}</div>
                              </div>
                              <div className="p-4">
                                <h3 className="font-semibold text-slate-800 dark:text-slate-100">{product.name}</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">{product.description}</p>
                                <div className="flex justify-center items-center mt-4">
                                  <div className="flex items-center gap-5">
                                    <Button className="border" variant="ghost" onClick={() => openQuickEditFor(product)}>
                                      <Pencil className="h-4 w-4" /><span className="ml-2 sm:inline">Editar</span>
                                    </Button>
                                    <Button className="border hover:bg-destructive" variant="ghost" onClick={() => { setDeleteTarget(product); setShowDeleteDialog(true); }}>
                                      <Trash2 className="h-4 w-4" /><span className="ml-2 sm:inline">Excluir</span>
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {listFilteredProducts.map((product) => (
                            <motion.div key={product.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex items-start gap-4 p-4 border rounded-lg">
                              <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0"><img src={product.images?.[0]?.url} alt={product.name} className="w-full h-full object-cover" /></div>
                              <div className="flex-1">
                                <div className="flex flex-col gap-3 items-start justify-between">
                                  <div>
                                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">{product.name}</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">{product.description}</p>
                                    <div className="mt-2 text-xs text-slate-500">{product.category}</div>
                                  </div>
                                  <div className="flex flex-col gap-2 items-end">
                                    <div className="flex gap-2">
                                      <Button onClick={() => openQuickEditFor(product)} className="eco-gradient text-white">
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                      <Button variant="destructive" onClick={() => { setDeleteTarget(product); setShowDeleteDialog(true); }}>
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}

                      {/* Quick Edit Dialog */}
                      <Dialog open={showQuickEditDialog} onOpenChange={setShowQuickEditDialog}>
                        <DialogContent className="fixed left-[50%] top-[50%] z-50 grid w-[90vw] max-w-[600px] min-w-[280px] translate-x-[-50%] translate-y-[-50%] gap-4 border bg-card dark:bg-background p-4 sm:p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader className="text-center sm:text-left mb-4">
                            <DialogTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">Editar Rápido</DialogTitle>
                            <p className="text-sm text-muted-foreground">Edição rápida dos itens do catálogo.</p>
                          </DialogHeader>

                          {quickEditProduct && (
                            <div className="space-y-4 mt-4">
                              <div>
                                <Label htmlFor="qe-name">Nome</Label>
                                <Input id="qe-name" name="name" value={quickEditForm.name} onChange={handleQuickEditChange} className="w-full" />
                              </div>

                              <div>
                                <Label>Categoria</Label>
                                <Select value={quickEditForm.category} onValueChange={(v) => setQuickEditForm((p) => ({ ...p, category: String(v) }))}>
                                  <SelectTrigger className="w-full">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {categories.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label>Descrição</Label>
                                <Textarea name="description" value={quickEditForm.description} onChange={handleQuickEditChange} rows={4} className="w-full" />
                              </div>

                              <div>
                                <Label>Imagens</Label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                  {(quickEditProduct.images || []).map((img: ImageObj, idx: number) => (
                                    <div key={idx} className="relative group">
                                      <img src={img.url} alt={img.alt || `Imagem ${idx + 1}`} className="w-full h-32 object-cover rounded-md" />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newImages = quickEditProduct.images.filter((_: any, i: number) => i !== idx);
                                          setQuickEditProduct((p: any) => ({ ...p, images: newImages }));
                                        }}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                                      >
                                        <X className="h-4 w-4" />
                                      </button>
                                    </div>
                                  ))}
                                  <label className="cursor-pointer border-2 border-dashed rounded-md flex items-center justify-center p-4 hover:border-emerald-400/50 transition">
                                    <Upload className="h-6 w-6 text-muted-foreground" />
                                    <input
                                      type="file"
                                      accept="image/*"
                                      multiple
                                      className="hidden"
                                      onChange={async (e) => {
                                        const files = e.target.files ? Array.from(e.target.files) : [];
                                        if (files.length === 0) return;
                                        const uploadedImages: ImageObj[] = [];
                                        for (const file of files) {
                                          const url = await uploadFileToStorage(file);
                                          uploadedImages.push({ url, alt: file.name });
                                        }
                                        setQuickEditProduct((p: any) => ({ ...p, images: [...(p.images || []), ...uploadedImages] }));
                                      }}
                                    />
                                  </label>
                                </div>
                              </div>

                              <DialogFooter className="flex flex-col sm:flex-row justify-end gap-3">
                                <Button
                                  variant="ghost"
                                  onClick={() => { setShowQuickEditDialog(false); setQuickEditProduct(null); }}
                                  className="w-full sm:w-auto text-slate-600 dark:text-slate-200 hover:bg-destructive border"
                                >
                                  Cancelar
                                </Button>
                                <Button
                                  onClick={() => setShowQuickEditConfirmDialog(true)}
                                  disabled={isSubmitting}
                                  className="w-full sm:w-auto eco-gradient text-white font-semibold"
                                >
                                  {isSubmitting ? "Salvando..." : "Salvar Alterações"}
                                </Button>
                              </DialogFooter>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      {/* Quick Edit Confirm Dialog */}
                      <Dialog open={showQuickEditConfirmDialog} onOpenChange={setShowQuickEditConfirmDialog}>
                        <DialogContent className="fixed left-[50%] top-[50%] z-50 grid w-[90vw] max-w-[500px] min-w-[280px] translate-x-[-50%] translate-y-[-50%] gap-4 border bg-card dark:bg-background p-4 sm:p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader className="text-center sm:text-left mb-4">
                            <DialogTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">Confirmar Edição</DialogTitle>
                            <p className="text-sm text-muted-foreground">Tem certeza que deseja salvar as alterações no produto "{quickEditProduct?.name}"?</p>
                          </DialogHeader>
                          <DialogFooter className="flex flex-col sm:flex-row justify-end gap-3">
                            <Button
                              variant="ghost"
                              onClick={() => setShowQuickEditConfirmDialog(false)}
                              className="w-full sm:w-auto text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-destructive border"
                            >
                              Cancelar
                            </Button>
                            <Button
                              onClick={handleQuickEditSubmit}
                              disabled={isSubmitting}
                              className="w-full sm:w-auto eco-gradient text-white font-semibold"
                            >
                              {isSubmitting ? "Salvando..." : "Confirmar"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      {/* Delete Dialog (used in list and delete tab) */}
                      <Dialog open={showDeleteDialog && Boolean(deleteTarget)} onOpenChange={setShowDeleteDialog}>
                        <DialogContent className="fixed left-[50%] top-[50%] z-50 grid w-[90vw] max-w-[500px] min-w-[280px] translate-x-[-50%] translate-y-[-50%] gap-4 border bg-card dark:bg-background p-4 sm:p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader className="text-center sm:text-left mb-4">
                            <DialogTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">Confirmar Exclusão</DialogTitle>
                            <p className="text-sm text-muted-foreground">Tem certeza que deseja excluir o produto "{deleteTarget?.name}"?</p>
                          </DialogHeader>
                          <DialogFooter className="flex flex-col sm:flex-row justify-end gap-3">
                            <Button
                              variant="ghost"
                              onClick={() => { setShowDeleteDialog(false); setDeleteTarget(null); }}
                              className="w-full sm:w-auto text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-destructive border"
                            >
                              Cancelar
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={handleConfirmDelete}
                              disabled={isSubmitting}
                              className="w-full sm:w-auto bg-green-700"
                            >
                              {isSubmitting ? "Excluindo..." : "Confirmar"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;