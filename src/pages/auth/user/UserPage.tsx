// src/pages/auth/user/UserPage.tsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, ShoppingCart, Package, MapPin,
  ArrowLeft, Pencil, Trash2, Plus, Minus, Clock,
  Truck, CheckCircle, XCircle, Star,
  Eye, EyeOff, Edit, Camera, X as XIcon
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { toast as sonnerToast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

// ========== TIPOS ==========
interface Profile {
  avatar_url?: string | null;
  display_name?: string | null;
  phone?: string | null;
  birth_date?: string | null;
}

interface Address {
  id: string;
  label: string;
  recipient_name: string;
  street: string;
  number: string;
  complement?: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  is_default: boolean;
}

interface CartItem {
  id: string;
  quantity: number;
  items: {
    name: string;
    price: number;
    images?: { url: string }[];
  };
}

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  items?: any[];
}

const TAB_KEY = "user_active_tab";
type Tab = "profile" | "cart" | "orders" | "address";

export default function UserPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>(() => (localStorage.getItem(TAB_KEY) as Tab) || "profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Perfil
  const [editUser, setEditUser] = useState({ name: "", email: "", phone: "", birthDate: "" });
  const [showPass, setShowPass] = useState(false);
  const [pass, setPass] = useState({ current: "", password: "", confirm: "" });
  const [seePwd, setSeePwd] = useState(false);
  const [seeConfirm, setSeeConfirm] = useState(false);

  // Carrinho
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showDeleteItem, setShowDeleteItem] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState("");

  // Endereços
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddr, setShowAddr] = useState(false);
  const [showEditAddr, setShowEditAddr] = useState(false);
  const [showDeleteAddr, setShowDeleteAddr] = useState(false);
  const [addrToEdit, setAddrToEdit] = useState<Address | null>(null);
  const [addrToDelete, setAddrToDelete] = useState("");
  const [formAddr, setFormAddr] = useState<Partial<Address>>({
    label: "Casa", recipient_name: "", street: "", number: "", complement: "",
    neighborhood: "", city: "", state: "", zip_code: "", is_default: true
  });
  const [cepProgress, setCepProgress] = useState(0);

  // Pedidos
  const [orders, setOrders] = useState<Order[]>([]);

  // ========== CARREGAMENTO ==========
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session?.user) {
          sonnerToast.error("Faça login para acessar esta página.");
          navigate("/login");
          return;
        }

        const user = session.user;
        setUserId(user.id);

        // Dados básicos do auth
        const name = user.user_metadata?.display_name || user.email?.split("@")[0] || "Usuário";
        const email = user.email || "";
        const phone = user.phone?.replace("+55", "") || "";
        setUserPhone(phone);
        setEditUser({ name, email, phone, birthDate: "" });
        setFormAddr(prev => ({ ...prev, recipient_name: name }));

        // Perfil do banco
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("avatar_url, display_name, phone, birth_date")
          .eq("id", user.id)
          .single<Profile>();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error("Erro ao carregar perfil:", profileError);
        }

        const safeProfile = profile ?? {};

        setEditUser(prev => ({
          name: safeProfile.display_name || name,
          email,
          phone: safeProfile.phone?.replace("+55", "") || phone,
          birthDate: safeProfile.birth_date || "",
        }));

        if (safeProfile.avatar_url) {
          const { data } = supabase.storage.from("profile_pics").getPublicUrl(safeProfile.avatar_url);
          setProfilePic(`${data.publicUrl}?t=${Date.now()}`);
        }

        // Dados paralelos
        const [cartRes, addrRes, ordRes] = await Promise.all([
          supabase.from("cart").select("*, items(name, images, price)").eq("user_id", user.id),
          supabase.from("user_addresses").select("*").eq("user_id", user.id).order("is_default", { ascending: false }),
          supabase.from("user_orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
        ]);

        setCart(cartRes.data || []);
        setAddresses(addrRes.data || []);
        setOrders(ordRes.data || []);

        setLoading(false);
      } catch (err: any) {
        console.error("Erro crítico:", err);
        sonnerToast.error("Erro ao carregar página do usuário.");
        setLoading(false);
      }
    };

    initializeUser();
  }, [navigate]);

  useEffect(() => localStorage.setItem(TAB_KEY, tab), [tab]);

  // ========== FOTO DE PERFIL ==========
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) return sonnerToast.error("Apenas imagens!");
    if (file.size > 5 * 1024 * 1024) return sonnerToast.error("Máximo 5MB");

    setSaving(true);
    const fileExt = file.name.split(".").pop();
    const filePath = `${userId}/${userId}.${fileExt}`;

    try {
      const { error } = await supabase.storage
        .from("profile_pics")
        .upload(filePath, file, { upsert: true });

      if (error) throw error;

      const { data } = supabase.storage.from("profile_pics").getPublicUrl(filePath);

      await supabase.from("profiles").upsert({ id: userId, avatar_url: filePath });

      setProfilePic(`${data.publicUrl}?t=${Date.now()}`);
      sonnerToast.success("Foto atualizada!");
    } catch (err: any) {
      sonnerToast.error(err.message || "Erro ao enviar imagem");
    } finally {
      setSaving(false);
    }
  };

  const removeProfilePic = async () => {
    setSaving(true);
    try {
      await supabase.storage.from("profile_pics").remove([`${userId}/${userId}.*`]);
      await supabase.from("profiles").update({ avatar_url: null }).eq("id", userId);
      setProfilePic(null);
      sonnerToast.success("Foto removida");
    } catch {
      sonnerToast.error("Erro ao remover foto");
    } finally {
      setSaving(false);
    }
  };

  // ========== PERFIL ==========
  const saveProfile = async () => {
    const phoneRaw = editUser.phone.replace(/\D/g, "");
    if (!phoneRaw.match(/^\d{10,11}$/)) return sonnerToast.error("Celular inválido (10 ou 11 dígitos)");

    setSaving(true);
    try {
      await supabase.auth.updateUser({ phone: `+55${phoneRaw}` });
      await supabase.from("profiles").upsert({
        id: userId,
        display_name: editUser.name,
        phone: `+55${phoneRaw}`,
        birth_date: editUser.birthDate || null,
      });
      sonnerToast.success("Perfil atualizado com sucesso!");
    } catch (err: any) {
      sonnerToast.error(err.message || "Erro ao salvar perfil");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (!pass.current || !pass.password || !pass.confirm)
      return sonnerToast.error("Preencha todos os campos.");
    if (pass.password !== pass.confirm)
      return sonnerToast.error("As novas senhas não coincidem.");
    if (pass.password.length < 6)
      return sonnerToast.error("A nova senha deve ter pelo menos 6 caracteres.");

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error("Usuário não autenticado.");

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: pass.current,
      });
      if (signInError) throw new Error("Senha atual incorreta.");

      const { error } = await supabase.auth.updateUser({ password: pass.password });
      if (error) throw error;

      sonnerToast.success("Senha alterada com sucesso!");
      setPass({ current: "", password: "", confirm: "" });
      setShowPass(false);
    } catch (err: any) {
      sonnerToast.error(err.message || "Erro ao alterar a senha.");
    } finally {
      setSaving(false);
    }
  };

  // ========== CARRINHO ==========
  const changeQty = async (id: string, qty: number) => {
    if (qty < 1) return;
    const { error } = await supabase.from("cart").update({ quantity: qty }).eq("id", id);
    if (error) return sonnerToast.error("Erro ao atualizar quantidade");
    setCart(c => c.map(i => i.id === id ? { ...i, quantity: qty } : i));
  };

  const removeItem = async () => {
    const { error } = await supabase.from("cart").delete().eq("id", deleteItemId);
    if (error) return sonnerToast.error("Erro ao remover item");
    setCart(c => c.filter(i => i.id !== deleteItemId));
    setShowDeleteItem(false);
    sonnerToast.success("Item removido do carrinho!");
  };

  // ========== ENDEREÇOS ==========
  const searchCEP = async (cep: string) => {
    if (cep.length !== 8) return;
    setCepProgress(30);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      setCepProgress(100);
      if (!data.erro) {
        setFormAddr(f => ({
          ...f,
          street: data.logradouro || "",
          neighborhood: data.bairro || "",
          city: data.localidade || "",
          state: data.uf || ""
        }));
        sonnerToast.success("CEP encontrado!");
      } else {
        sonnerToast.error("CEP inválido");
      }
    } catch {
      sonnerToast.error("Erro na busca do CEP");
    } finally {
      setTimeout(() => setCepProgress(0), 600);
    }
  };

  const saveAddress = async () => {
    if ((formAddr.zip_code?.length || 0) !== 8) return sonnerToast.error("CEP precisa ter 8 dígitos");

    try {
      if (formAddr.is_default) {
        await supabase.from("user_addresses").update({ is_default: false }).eq("user_id", userId);
      }

      const { data, error } = await supabase.from("user_addresses").upsert({
        ...(addrToEdit ? { id: addrToEdit.id } : {}),
        user_id: userId,
        ...formAddr,
        recipient_name: formAddr.recipient_name || editUser.name
      }).select().single<Address>();

      if (error) throw error;

      setAddresses(prev => addrToEdit
        ? prev.map(a => a.id === data.id ? data : a)
        : [...prev, data]
      );

      closeAddr();
      sonnerToast.success(addrToEdit ? "Endereço atualizado!" : "Endereço salvo!");
    } catch (err: any) {
      sonnerToast.error(err.message || "Erro ao salvar endereço");
    }
  };

  const deleteAddress = async () => {
    const { error } = await supabase.from("user_addresses").delete().eq("id", addrToDelete);
    if (error) return sonnerToast.error("Erro ao excluir");
    setAddresses(a => a.filter(x => x.id !== addrToDelete));
    setShowDeleteAddr(false);
    sonnerToast.success("Endereço excluído!");
  };

  const setDefault = async (id: string) => {
    await supabase.from("user_addresses").update({ is_default: false }).eq("user_id", userId);
    const { error } = await supabase.from("user_addresses").update({ is_default: true }).eq("id", id);
    if (error) return sonnerToast.error("Erro ao definir padrão");
    setAddresses(a => a.map(x => ({ ...x, is_default: x.id === id })));
    sonnerToast.success("Endereço padrão alterado!");
  };

  const openAdd = () => {
    setFormAddr({
      label: "Casa",
      recipient_name: editUser.name,
      street: "", number: "", complement: "",
      neighborhood: "", city: "", state: "", zip_code: "",
      is_default: addresses.length === 0
    });
    setShowAddr(true);
  };

  const openEdit = (a: Address) => {
    setAddrToEdit(a);
    setFormAddr(a);
    setShowEditAddr(true);
  };

  const closeAddr = () => {
    setShowAddr(false);
    setShowEditAddr(false);
    setShowDeleteAddr(false);
    setAddrToEdit(null);
    setFormAddr({ label: "Casa", recipient_name: editUser.name, is_default: true });
  };

  // ========== UI ==========
  const nav = [
    { id: "profile", label: "Perfil", icon: User },
    { id: "cart", label: "Carrinho", icon: ShoppingCart },
    { id: "orders", label: "Pedidos", icon: Package },
    { id: "address", label: "Endereços", icon: MapPin }
  ];

  const statusBadge = (s: Order["status"]) => {
    const map: Record<string, { icon: any; color: string; text: string }> = {
      pending: { icon: Clock, color: "bg-yellow-500", text: "Pendente" },
      processing: { icon: Package, color: "bg-blue-500", text: "Processando" },
      shipped: { icon: Truck, color: "bg-primary", text: "Enviado" },
      delivered: { icon: CheckCircle, color: "bg-green-500", text: "Entregue" },
      cancelled: { icon: XCircle, color: "bg-destructive", text: "Cancelado" }
    };
    const { icon: Icon, color, text } = map[s] || { icon: Clock, color: "bg-gray-500", text: "Desconhecido" };
    return <Badge className={`${color} text-white`}><Icon className="w-3 h-3 mr-1" />{text}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-background backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/home")}
              className="flex items-center gap-2 text-slate-600 dark:text-slate-200 hover:text-emerald-600 transition-colors group">
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition" />
              <span className="font-medium">Voltar</span>
            </motion.button>
            <div className="h-6 w-px bg-slate-300 dark:bg-slate-700" />
            <h1 className="text-2xl font-bold eco-text-gradient">Área do Usuário</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* SIDEBAR */}
          <aside>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="bg-card rounded-2xl border p-6 shadow-sm">
              <h3 className="font-semibold flex items-center gap-2 mb-4 text-slate-800 dark:text-slate-100">
                <User className="h-5 w-5 text-emerald-500" /> Navegação
              </h3>
              <nav className="space-y-2">
                {nav.map(item => {
                  const Icon = item.icon;
                  const active = tab === item.id;
                  return (
                    <motion.button key={item.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => setTab(item.id as Tab)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        active
                          ? `bg-emerald-100/80 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 shadow-sm`
                          : "text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-emerald-900/20"
                      }`}>
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </motion.button>
                  );
                })}
              </nav>
            </motion.div>
          </aside>

          {/* CONTEÚDO */}
          <main className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                {/* PERFIL */}
                {tab === "profile" && (
                  <Card className="rounded-2xl border shadow-sm">
                    <CardContent className="p-8">
                      <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start">
                        {/* Foto */}
                        <div className="flex flex-col items-center">
                          <div className="relative group">
                            <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-emerald-100 dark:ring-emerald-900/50 shadow-lg">
                              {profilePic ? (
                                <img src={profilePic} alt="Perfil" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-5xl font-bold">
                                  {editUser.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="absolute bottom-1 right-1 p-2 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition"
                            >
                              <Camera className="h-4 w-4" />
                            </button>
                            {profilePic && (
                              <button
                                onClick={removeProfilePic}
                                className="absolute top-1 right-1 p-2 rounded-full bg-destructive text-white hover:bg-red-700 transition"
                              >
                                <XIcon className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                          <h2 className="text-2xl font-bold mt-4">{editUser.name}</h2>
                          <p className="text-sm text-muted-foreground">{editUser.email}</p>
                        </div>

                        {/* Formulário */}
                        {loading ? (
                          <p className="text-center py-8">Carregando...</p>
                        ) : (
                          <form onSubmit={(e) => { e.preventDefault(); saveProfile(); }} className="flex-1 space-y-6">
                            <div>
                              <Label>Nome Completo *</Label>
                              <Input value={editUser.name} onChange={e => setEditUser({ ...editUser, name: e.target.value })} placeholder="Seu nome" />
                            </div>
                            <div>
                              <Label>Telefone *</Label>
                              <Input value={editUser.phone} onChange={e => setEditUser({ ...editUser, phone: e.target.value })} placeholder="(00) 00000-0000" />
                            </div>
                            <div className="relative">
                              <Label>Data de Nascimento</Label>
                              <DatePicker
                                selected={editUser.birthDate ? new Date(editUser.birthDate) : null}
                                onChange={(date: Date | null) => setEditUser({ ...editUser, birthDate: date ? date.toISOString().split("T")[0] : "" })}
                                dateFormat="dd/MM/yyyy"
                                placeholderText="Selecione"
                                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500"
                                wrapperClassName="w-full"
                                locale="pt-BR"
                                maxDate={new Date()}
                              />
                              <Calendar className="absolute right-3 top-9 h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                              <Button type="submit" disabled={saving} className="eco-gradient text-white">
                                {saving ? "Salvando..." : "Salvar Alterações"}
                              </Button>
                              <Button type="button" variant="outline" onClick={() => setShowPass(true)} className="border-emerald-500 text-emerald-600">
                                Alterar Senha
                              </Button>
                            </div>
                          </form>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* CARRINHO */}
                {tab === "cart" && (
                  <Card className="rounded-2xl border shadow-sm">
                    <CardContent className="p-8">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 eco-gradient rounded-xl"><ShoppingCart className="h-6 w-6 text-white" /></div>
                        <h2 className="text-2xl font-bold">Carrinho</h2>
                      </div>
                      {cart.length === 0 ? (
                        <p className="text-center py-12 text-muted-foreground">Seu carrinho está vazio</p>
                      ) : (
                        <div className="space-y-6">
                          {cart.map(item => (
                            <div key={item.id} className="flex gap-4 p-4 border rounded-xl items-center">
                              <img src={item.items?.images?.[0]?.url || "https://via.placeholder.com/80"} alt={item.items.name} className="w-20 h-20 rounded-lg object-cover" />
                              <div className="flex-1">
                                <h3 className="font-semibold">{item.items.name}</h3>
                                <p className="text-sm text-muted-foreground">R$ {item.items.price.toFixed(2)}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button size="icon" variant="outline" onClick={() => changeQty(item.id, item.quantity - 1)}><Minus /></Button>
                                <span className="w-8 text-center font-medium">{item.quantity}</span>
                                <Button size="icon" variant="outline" onClick={() => changeQty(item.id, item.quantity + 1)}><Plus /></Button>
                              </div>
                              <Button size="icon" variant="destructive" onClick={() => { setDeleteItemId(item.id); setShowDeleteItem(true); }}>
                                <Trash2 className="h-5 w-5" />
                              </Button>
                            </div>
                          ))}
                          <div className="border-t pt-6">
                            <div className="flex justify-between text-2xl font-bold mb-6">
                              <span>Total</span>
                              <span className="text-emerald-600">
                                R$ {cart.reduce((s, i) => s + i.items.price * i.quantity, 0).toFixed(2)}
                              </span>
                            </div>
                            <Button className="w-full eco-gradient text-white font-semibold text-lg py-6">
                              Finalizar Compra
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* PEDIDOS */}
                {tab === "orders" && (
                  <Card className="rounded-2xl border shadow-sm">
                    <CardContent className="p-8">
                      <h2 className="text-2xl font-bold mb-8">Meus Pedidos</h2>
                      {orders.length === 0 ? (
                        <p className="text-center py-12 text-muted-foreground">Nenhum pedido ainda</p>
                      ) : (
                        <div className="space-y-4">
                          {orders.map(o => (
                            <div key={o.id} className="border rounded-xl p-5">
                              <div className="flex justify-between mb-3">
                                <div>
                                  <p className="font-bold">#{o.order_number}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(o.created_at).toLocaleDateString("pt-BR")}
                                  </p>
                                </div>
                                {statusBadge(o.status)}
                              </div>
                              <div className="flex justify-between">
                                <p className="text-sm text-muted-foreground">{o.items?.length || 0} itens</p>
                                <p className="font-bold text-xl text-emerald-600">R$ {o.total.toFixed(2)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* ENDEREÇOS */}
                {tab === "address" && (
                  <Card className="rounded-2xl border shadow-sm">
                    <CardContent className="p-8">
                      <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-bold">Endereços</h2>
                        <Button onClick={openAdd} className="eco-gradient text-white">
                          <Plus className="h-4 w-4 mr-2" /> Novo
                        </Button>
                      </div>
                      {addresses.length === 0 ? (
                        <p className="text-center py-12 text-muted-foreground">Nenhum endereço cadastrado</p>
                      ) : (
                        <div className="grid gap-5">
                          {addresses.map(a => (
                            <div key={a.id} className="border rounded-xl p-5 hover:border-emerald-500 transition">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold">{a.label}</h3>
                                    {a.is_default && <Badge className="bg-emerald-500 text-white"><Star className="h-3 w-3 mr-1" /> Padrão</Badge>}
                                  </div>
                                  <p className="text-sm text-muted-foreground">{a.recipient_name}</p>
                                  <p className="text-sm">{a.street}, {a.number}{a.complement && ` - ${a.complement}`}</p>
                                  <p className="text-sm">{a.neighborhood} • {a.city}/{a.state} • CEP {a.zip_code.replace(/(\d{5})(\d{3})/, "$1-$2")}</p>
                                </div>
                                <div className="flex gap-2">
                                  {!a.is_default && <Button size="sm" variant="outline" onClick={() => setDefault(a.id)}>Padrão</Button>}
                                  <Button size="icon" variant="ghost" onClick={() => openEdit(a)}><Edit className="h-4 w-4" /></Button>
                                  <Button size="icon" variant="destructive" onClick={() => { setAddrToDelete(a.id); setShowDeleteAddr(true); }}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* MODAIS */}
      <Dialog open={showPass} onOpenChange={setShowPass}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Alterar Senha</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Senha Atual *</Label>
              <Input type={seePwd ? "text" : "password"} value={pass.current} onChange={e => setPass({ ...pass, current: e.target.value })} />
            </div>
            <div>
              <Label>Nova Senha *</Label>
              <Input type={seePwd ? "text" : "password"} value={pass.password} onChange={e => setPass({ ...pass, password: e.target.value })} />
            </div>
            <div>
              <Label>Confirmar Nova Senha *</Label>
              <Input type={seeConfirm ? "text" : "password"} value={pass.confirm} onChange={e => setPass({ ...pass, confirm: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowPass(false)}>Cancelar</Button>
            <Button onClick={changePassword} className="eco-gradient text-white">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteItem} onOpenChange={setShowDeleteItem}>
        <DialogContent><DialogHeader><DialogTitle>Remover item?</DialogTitle></DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowDeleteItem(false)}>Cancelar</Button>
            <Button onClick={removeItem} className="bg-destructive text-white">Remover</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddr || showEditAddr} onOpenChange={closeAddr}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{showEditAddr ? "Editar" : "Novo"} Endereço</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>CEP *</Label>
              <Input placeholder="00000000" value={formAddr.zip_code || ""} onChange={e => {
                const cep = e.target.value.replace(/\D/g, "").slice(0, 8);
                setFormAddr({ ...formAddr, zip_code: cep });
                searchCEP(cep);
              }} />
              {cepProgress > 0 && (
                <div className="mt-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <motion.div className="bg-emerald-500 h-2 rounded-full" initial={{ width: 0 }} animate={{ width: `${cepProgress}%` }} />
                </div>
              )}
            </div>
            <div><Label>Apelido</Label><Input value={formAddr.label || ""} onChange={e => setFormAddr({ ...formAddr, label: e.target.value })} /></div>
            <div className="col-span-2"><Label>Rua</Label><Input value={formAddr.street || ""} onChange={e => setFormAddr({ ...formAddr, street: e.target.value })} /></div>
            <div><Label>Número</Label><Input value={formAddr.number || ""} onChange={e => setFormAddr({ ...formAddr, number: e.target.value })} /></div>
            <div><Label>Complemento</Label><Input value={formAddr.complement || ""} onChange={e => setFormAddr({ ...formAddr, complement: e.target.value })} /></div>
            <div className="col-span-2"><Label>Bairro</Label><Input value={formAddr.neighborhood || ""} onChange={e => setFormAddr({ ...formAddr, neighborhood: e.target.value })} /></div>
            <div><Label>Cidade</Label><Input value={formAddr.city || ""} onChange={e => setFormAddr({ ...formAddr, city: e.target.value })} /></div>
            <div><Label>Estado</Label><Input value={formAddr.state || ""} onChange={e => setFormAddr({ ...formAddr, state: e.target.value })} maxLength={2} /></div>
            <div className="col-span-2"><Label>Destinatário</Label><Input value={formAddr.recipient_name || ""} onChange={e => setFormAddr({ ...formAddr, recipient_name: e.target.value })} /></div>
            <div className="col-span-2 flex items-center gap-3">
              <Switch checked={!!formAddr.is_default} onCheckedChange={v => setFormAddr({ ...formAddr, is_default: v })} />
              <Label className="cursor-pointer">Endereço padrão</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={closeAddr}>Cancelar</Button>
            <Button onClick={saveAddress} className="eco-gradient text-white">
              {showEditAddr ? "Salvar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteAddr} onOpenChange={setShowDeleteAddr}>
        <DialogContent><DialogHeader><DialogTitle>Excluir endereço?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Esta ação não pode ser desfeita.</p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowDeleteAddr(false)}>Cancelar</Button>
            <Button onClick={deleteAddress} className="bg-destructive text-white">Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}