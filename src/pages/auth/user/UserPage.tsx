import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingCart,
  User,
  Settings,
  Trash2,
  Pencil,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../../lib/supabaseClient";
import { toast } from "sonner";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";

const LOCAL_STORAGE_TAB_KEY = "user_active_tab";

const UserPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window === "undefined") return "cart";
    return localStorage.getItem(LOCAL_STORAGE_TAB_KEY) || "cart";
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [editForm, setEditForm] = useState({ displayName: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({ password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Persist active tab
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_TAB_KEY, activeTab);
    } catch {
      // Ignore
    }
  }, [activeTab]);

  // Fetch user and cart data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch user data
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error("Usuário não autenticado. Redirecionando para login...");
          navigate("/login");
          return;
        }
        setUser(user);
        setEditForm({
          displayName: user.user_metadata?.display_name || "",
          email: user.email || "",
        });

        // Fetch cart items (assumes 'cart' table with columns: id, user_id, item_id, quantity)
        const { data: cartData, error: cartError } = await supabase
          .from("cart")
          .select("*, items(name, images, category)")
          .eq("user_id", user.id);
        if (cartError) throw cartError;
        setCartItems(cartData || []);
      } catch (err) {
        console.error("fetchData error:", err);
        toast.error(err?.message || "Erro ao carregar dados do usuário");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleGoBack = () => navigate("/home");

  // Handle personal info edit
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async () => {
    if (!editForm.displayName.trim() || !editForm.email.trim()) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }
    if (!editForm.email.includes("@")) {
      toast.error("Por favor, insira um email válido.");
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({
        email: editForm.email,
        data: { display_name: editForm.displayName }
      });
      if (error) throw error;
      toast.success("Informações pessoais atualizadas com sucesso!");
      setShowEditDialog(false);
      setUser((prev) => ({
        ...prev,
        email: editForm.email,
        user_metadata: { ...prev.user_metadata, display_name: editForm.displayName },
      }));
    } catch (err) {
      console.error("handleEditSubmit error:", err);
      toast.error(err?.message || "Erro ao atualizar informações");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle password update
  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async () => {
    if (!passwordForm.password.trim() || !passwordForm.confirmPassword.trim()) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }
    if (passwordForm.password !== passwordForm.confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }
    if (passwordForm.password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.password,
      });
      if (error) throw error;
      toast.success("Senha atualizada com sucesso!");
      setShowPasswordDialog(false);
      setPasswordForm({ password: "", confirmPassword: "" });
    } catch (err) {
      console.error("handlePasswordSubmit error:", err);
      toast.error(err?.message || "Erro ao atualizar senha");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cart item deletion
  const handleDeleteCartItem = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("cart")
        .delete()
        .eq("id", deleteTarget.id);
      if (error) throw error;
      toast.success("Item removido do carrinho com sucesso!");
      setCartItems((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      setShowDeleteDialog(false);
      setDeleteTarget(null);
    } catch (err) {
      console.error("handleDeleteCartItem error:", err);
      toast.error(err?.message || "Erro ao remover item do carrinho");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Deslogado com sucesso!");
      navigate("/login");
    } catch (err) {
      console.error("handleLogout error:", err);
      toast.error(err?.message || "Erro ao deslogar");
    } finally {
      setIsSubmitting(false);
    }
  };

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
              <h1 className="text-2xl font-bold eco-text-gradient">Área do Usuário</h1>
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
                <User className="h-5 w-5 text-emerald-500" />
                Navegação
              </h3>
              <nav className="space-y-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab("cart")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    activeTab === "cart"
                      ? "bg-emerald-100/80 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                      : "text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-emerald-700 hover:text-slate-800 dark:hover:text-slate-50"
                  }`}
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span className="font-medium">Carrinho</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab("info")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    activeTab === "info"
                      ? "bg-blue-100/80 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                      : "text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-emerald-700 hover:text-slate-800 dark:hover:text-slate-50"
                  }`}
                >
                  <User className="h-5 w-5" />
                  <span className="font-medium">Informações Pessoais</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab("settings")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    activeTab === "settings"
                      ? "bg-red-100/80 dark:bg-red-900/30 text-destructive dark:text-red-400"
                      : "text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-emerald-700 hover:text-slate-800 dark:hover:text-slate-50"
                  }`}
                >
                  <Settings className="h-5 w-5" />
                  <span className="font-medium">Configurações da Conta</span>
                </motion.button>
              </nav>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold">Minha Conta</h2>
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(String(v))} className="space-y-6">
                  {/* Cart Tab */}
                  <TabsContent value="cart">
                    <motion.div
                      key="cart"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="bg-card dark:bg-background rounded-2xl border border-slate-200/60 dark:border-slate-700/40 shadow-sm p-4 sm:p-6"
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 eco-gradient rounded-xl">
                          <ShoppingCart className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-xl sm:text-2xl font-bold">Carrinho de Compras</h2>
                          <p className="text-sm sm:text-base text-muted-foreground">Gerencie os itens no seu carrinho</p>
                        </div>
                      </div>
                      {isLoading ? (
                        <p className="text-muted-foreground">Carregando carrinho...</p>
                      ) : cartItems.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">Seu carrinho está vazio.</div>
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
                                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">{item.items?.name}</h3>
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
                              {isSubmitting ? "Removendo..." : "Confirmar"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </motion.div>
                  </TabsContent>

                  {/* Personal Info Tab */}
                  <TabsContent value="info">
                    <motion.div
                      key="info"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="bg-card dark:bg-background rounded-2xl border border-slate-200/60 dark:border-slate-700/40 shadow-sm p-4 sm:p-6"
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 eco-gradient rounded-xl">
                          <User className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-xl sm:text-2xl font-bold">Informações Pessoais</h2>
                          <p className="text-sm sm:text-base text-muted-foreground">Visualize e edite suas informações pessoais</p>
                        </div>
                      </div>
                      {isLoading ? (
                        <p className="text-muted-foreground">Carregando informações...</p>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center border p-4 rounded-lg">
                            <div>
                              <p className="text-sm text-muted-foreground">Nome de Exibição</p>
                              <p className="font-semibold text-slate-800 dark:text-slate-100">{user?.user_metadata?.display_name}</p>
                            </div>
                          </div>
                          <div className="flex justify-between items-center border p-4 rounded-lg">
                            <div>
                              <p className="text-sm text-muted-foreground">Email</p>
                              <p className="font-semibold text-slate-800 dark:text-slate-100">{user?.email}</p>
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <Button
                              onClick={() => setShowEditDialog(true)}
                              className="eco-gradient text-white"
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Editar
                            </Button>
                          </div>
                        </div>
                      )}
                      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                        <DialogContent className="fixed left-[50%] top-[50%] z-50 grid w-[90vw] max-w-[500px] min-w-[280px] translate-x-[-50%] translate-y-[-50%] gap-4 border bg-card dark:bg-background p-4 sm:p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader className="text-center sm:text-left mb-4">
                            <DialogTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">Editar Informações</DialogTitle>
                            <p className="text-sm text-muted-foreground">Atualize suas informações pessoais.</p>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="displayName">Nome de Exibição</Label>
                              <Input
                                id="displayName"
                                name="displayName"
                                value={editForm.displayName}
                                onChange={handleEditInputChange}
                                className="w-full"
                              />
                            </div>
                            <div>
                              <Label htmlFor="email">Email</Label>
                              <Input
                                id="email"
                                name="email"
                                type="email"
                                value={editForm.email}
                                onChange={handleEditInputChange}
                                className="w-full"
                              />
                            </div>
                            <DialogFooter className="flex flex-col sm:flex-row justify-end gap-3">
                              <Button
                                variant="ghost"
                                onClick={() => setShowEditDialog(false)}
                                className="w-full sm:w-auto text-slate-600 dark:text-slate-200 hover:bg-destructive border"
                              >
                                Cancelar
                              </Button>
                              <Button
                                onClick={handleEditSubmit}
                                disabled={isSubmitting}
                                className="w-full sm:w-auto eco-gradient text-white font-semibold"
                              >
                                {isSubmitting ? "Salvando..." : "Salvar"}
                              </Button>
                            </DialogFooter>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </motion.div>
                  </TabsContent>

                  {/* Account Settings Tab */}
                  <TabsContent value="settings">
                    <motion.div
                      key="settings"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="bg-card dark:bg-background rounded-2xl border border-slate-200/60 dark:border-slate-700/40 shadow-sm p-4 sm:p-6"
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 eco-gradient rounded-xl">
                          <Settings className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-xl sm:text-2xl font-bold">Configurações da Conta</h2>
                          <p className="text-sm sm:text-base text-muted-foreground">Gerencie as configurações da sua conta</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <Button
                          onClick={() => setShowPasswordDialog(true)}
                          className="eco-gradient text-white w-full sm:w-auto"
                        >
                          <Lock className="h-4 w-4 mr-2" />
                          Alterar Senha
                        </Button>
                        <Button
                          onClick={handleLogout}
                          disabled={isSubmitting}
                          className="bg-red-600 text-white w-full sm:w-auto hover:bg-red-700"
                        >
                          {isSubmitting ? "Deslogando..." : "Sair da Conta"}
                        </Button>
                      </div>
                      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                        <DialogContent className="fixed left-[50%] top-[50%] z-50 grid w-[90vw] max-w-[500px] min-w-[280px] translate-x-[-50%] translate-y-[-50%] gap-4 border bg-card dark:bg-background p-4 sm:p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader className="text-center sm:text-left mb-4">
                            <DialogTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">Alterar Senha</DialogTitle>
                            <p className="text-sm text-muted-foreground">Digite sua nova senha.</p>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="password">Nova Senha</Label>
                              <div className="relative">
                                <Input
                                  id="password"
                                  name="password"
                                  type={showPassword ? "text" : "password"}
                                  value={passwordForm.password}
                                  onChange={handlePasswordInputChange}
                                  className="w-full"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 text-gray-500 dark:text-slate-300 hover:text-gray-700 dark:hover:text-slate-100 hover:bg-gray-200 dark:hover:bg-slate-700/50 transition-colors duration-500"
                                >
                                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                              <div className="relative">
                                <Input
                                  id="confirmPassword"
                                  name="confirmPassword"
                                  type={showConfirmPassword ? "text" : "password"}
                                  value={passwordForm.confirmPassword}
                                  onChange={handlePasswordInputChange}
                                  className="w-full"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 text-gray-500 dark:text-slate-300 hover:text-gray-700 dark:hover:text-slate-100 hover:bg-gray-200 dark:hover:bg-slate-700/50 transition-colors duration-500"
                                >
                                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                              </div>
                            </div>
                            <DialogFooter className="flex flex-col sm:flex-row justify-end gap-3">
                              <Button
                                variant="ghost"
                                onClick={() => setShowPasswordDialog(false)}
                                className="w-full sm:w-auto text-slate-600 dark:text-slate-200 hover:bg-destructive border"
                              >
                                Cancelar
                              </Button>
                              <Button
                                onClick={handlePasswordSubmit}
                                disabled={isSubmitting}
                                className="w-full sm:w-auto eco-gradient text-white font-semibold"
                              >
                                {isSubmitting ? "Salvando..." : "Salvar"}
                              </Button>
                            </DialogFooter>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </motion.div>
                  </TabsContent>
                </Tabs>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPage;