// src/pages/auth/user/UserPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, ShoppingCart, Package, MapPin, Settings,
  ArrowLeft, Pencil, Trash2, Plus, Minus, Clock,
  Truck, CheckCircle, XCircle, Star, Lock, Bell,
  Eye, EyeOff, Edit, Upload, X
} from "lucide-react";

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

const TAB_KEY = "user_active_tab";
type Tab = "profile" | "cart" | "orders" | "address" | "settings";

interface Address { id: string; label: string; recipient_name: string; street: string; number: string; complement?: string; neighborhood: string; city: string; state: string; zip_code: string; is_default: boolean; }
interface Order { id: string; order_number: string; created_at: string; status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"; total: number; items: any[]; }
interface Settings { email_notifications: boolean; order_updates: boolean; promotions: boolean; newsletter: boolean; }

export default function UserPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>(() => (localStorage.getItem(TAB_KEY) as Tab) || "profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState("");
  const [userPhone, setUserPhone] = useState("");

  // Perfil
  const [editUser, setEditUser] = useState({ name: "", email: "", phone: "" });
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [pass, setPass] = useState({ password: "", confirm: "" });
  const [seePwd, setSeePwd] = useState(false);
  const [seeConfirm, setSeeConfirm] = useState(false);

  // Carrinho
  const [cart, setCart] = useState<any[]>([]);
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

  // Configurações
  const [settings, setSettings] = useState<Settings>({
    email_notifications: true, order_updates: true, promotions: false, newsletter: true
  });

  // ---------- Carregamento ----------
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { sonnerToast.error("Faça login!"); navigate("/login"); return; }

      setUserId(user.id);
      const name = user.user_metadata?.display_name || user.email?.split("@")[0] || "";
      const email = user.email || "";
      const phone = user.phone?.replace("+55", "") || user.user_metadata?.phone || "";
      setUserPhone(phone);
      setEditUser({ name, email, phone });
      setFormAddr(prev => ({ ...prev, recipient_name: name }));

      const [cartRes, addrRes, ordRes, cfgRes] = await Promise.all([
        supabase.from("cart").select("*, items(name, images, price)").eq("user_id", user.id),
        supabase.from("user_addresses").select("*").eq("user_id", user.id).order("is_default", { ascending: false }),
        supabase.from("user_orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("user_settings").select("*").eq("user_id", user.id).single()
      ]);

      setCart(cartRes.data || []);
      setAddresses(addrRes.data || []);
      setOrders(ordRes.data || []);
      if (cfgRes.data) setSettings(cfgRes.data);
      else await supabase.from("user_settings").insert({ user_id: user.id });

      setLoading(false);
    })();
  }, [navigate]);

  useEffect(() => localStorage.setItem(TAB_KEY, tab), [tab]);

  // ---------- Perfil ----------
  const saveProfile = async () => {
    const phoneRaw = editUser.phone.replace(/\D/g, "");
    if (!phoneRaw.match(/^\d{10,11}$/)) return sonnerToast.error("Celular inválido (ex: 11999999999)");

    setSaving(true);
    try {
      await supabase.auth.updateUser({ phone: `+55${phoneRaw}` });
      await supabase.from("profiles").update({ display_name: editUser.name, phone: `+55${phoneRaw}` }).eq("id", userId);
      setUserPhone(phoneRaw);
      sonnerToast.success("Perfil atualizado!");
      setShowEditProfile(false);
    } catch { sonnerToast.error("Erro ao salvar"); }
    setSaving(false);
  };

  const changePassword = async () => {
    if (pass.password !== pass.confirm) return sonnerToast.error("Senhas diferentes");
    setSaving(true);
    try {
      await supabase.auth.updateUser({ password: pass.password });
      sonnerToast.success("Senha alterada!");
      setShowPass(false); setPass({ password: "", confirm: "" });
    } catch { sonnerToast.error("Erro"); }
    setSaving(false);
  };

  // ---------- Carrinho ----------
  const changeQty = async (id: string, qty: number) => {
    if (qty < 1) return;
    await supabase.from("cart").update({ quantity: qty }).eq("id", id);
    setCart(c => c.map(i => i.id === id ? { ...i, quantity: qty } : i));
  };

  const removeItem = async () => {
    await supabase.from("cart").delete().eq("id", deleteItemId);
    setCart(c => c.filter(i => i.id !== deleteItemId));
    setShowDeleteItem(false);
    sonnerToast.success("Item removido!");
  };

  // ---------- Endereços ----------
  const searchCEP = async (cep: string) => {
    if (cep.length !== 8) return;
    setCepProgress(30);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      setCepProgress(100);
      if (!data.erro) {
        setFormAddr(f => ({
          ...f, street: data.logradouro || "", neighborhood: data.bairro || "",
          city: data.localidade || "", state: data.uf || ""
        }));
        sonnerToast.success("CEP encontrado!");
      } else sonnerToast.error("CEP não encontrado");
    } catch { sonnerToast.error("Erro na busca"); }
    setTimeout(() => setCepProgress(0), 600);
  };

  const saveAddress = async () => {
    if ((formAddr.zip_code?.length || 0) !== 8) return sonnerToast.error("CEP precisa ter 8 dígitos");
    try {
      if (formAddr.is_default) await supabase.from("user_addresses").update({ is_default: false }).eq("user_id", userId);
      const { data } = await supabase.from("user_addresses").upsert({
        ...(addrToEdit ? { id: addrToEdit.id } : {}),
        user_id: userId, ...formAddr,
        recipient_name: formAddr.recipient_name || editUser.name
      }).select().single();

      setAddresses(prev => addrToEdit
        ? prev.map(a => a.id === data.id ? data : a)
        : [...prev, data]
      );
      closeAddr();
      sonnerToast.success(addrToEdit ? "Endereço atualizado!" : "Endereço salvo!");
    } catch { sonnerToast.error("Erro ao salvar"); }
  };

  const deleteAddress = async () => {
    await supabase.from("user_addresses").delete().eq("id", addrToDelete);
    setAddresses(a => a.filter(x => x.id !== addrToDelete));
    setShowDeleteAddr(false);
    sonnerToast.success("Endereço excluído!");
  };

  const setDefault = async (id: string) => {
    await supabase.from("user_addresses").update({ is_default: false }).eq("user_id", userId);
    await supabase.from("user_addresses").update({ is_default: true }).eq("id", id);
    setAddresses(a => a.map(x => ({ ...x, is_default: x.id === id })));
    sonnerToast.success("Padrão alterado!");
  };

  const openAdd = () => {
    setFormAddr({
      label: "Casa", recipient_name: editUser.name, street: "", number: "", complement: "",
      neighborhood: "", city: "", state: "", zip_code: "", is_default: addresses.length === 0
    });
    setShowAddr(true);
  };
  const openEdit = (a: Address) => { setAddrToEdit(a); setFormAddr(a); setShowEditAddr(true); };
  const closeAddr = () => { setShowAddr(false); setShowEditAddr(false); setShowDeleteAddr(false); setAddrToEdit(null); };

  // ---------- Configs ----------
  const toggleSetting = async (key: keyof Settings) => {
    const val = !settings[key];
    setSettings(s => ({ ...s, [key]: val }));
    await supabase.from("user_settings").update({ [key]: val }).eq("user_id", userId);
    sonnerToast.success("Configuração salva!");
  };

  const logout = async () => { await supabase.auth.signOut(); navigate("/login"); };

  // ---------- UI ----------
  const nav = [
    { id: "profile", label: "Perfil", icon: User, color: "emerald" },
    { id: "cart", label: "Carrinho", icon: ShoppingCart, color: "blue" },
    { id: "orders", label: "Pedidos", icon: Package, color: "purple" },
    { id: "address", label: "Endereços", icon: MapPin, color: "orange" },
    { id: "settings", label: "Configurações", icon: Settings, color: "red" }
  ];

  const statusBadge = (s: Order["status"]) => {
    const map: Record<string, { icon: any; color: string; text: string }> = {
      pending: { icon: Clock, color: "bg-yellow-500", text: "Pendente" },
      processing: { icon: Package, color: "bg-blue-500", text: "Processando" },
      shipped: { icon: Truck, color: "bg-primary", text: "Enviado" },
      delivered: { icon: CheckCircle, color: "bg-green-500", text: "Entregue" },
      cancelled: { icon: XCircle, color: "bg-destructive", text: "Cancelado" }
    };
    const { icon: Icon, color, text } = map[s];
    return <Badge className={`${color} text-white`}><Icon className="w-3 h-3 mr-1" />{text}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-background backdrop-blur-sm border-b border-slate-200/60 dark:border-slate-700/40">
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
              className="bg-card dark:bg-background rounded-2xl border border-slate-200/60 dark:border-slate-700/40 p-6 shadow-sm">
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
                          ? `bg-${item.color}-100/80 dark:bg-${item.color}-900/30 text-${item.color}-600 dark:text-${item.color}-400 shadow-sm`
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
                  <Card className="rounded-2xl border border-slate-200/60 dark:border-slate-700/40 shadow-sm">
                    <CardContent className="p-8">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 eco-gradient rounded-xl"><User className="h-6 w-6 text-white" /></div>
                        <div>
                          <h2 className="text-2xl font-bold">Perfil</h2>
                          <p className="text-sm text-muted-foreground">Seus dados pessoais</p>
                        </div>
                      </div>
                      {loading ? <p className="text-muted-foreground">Carregando...</p> : (
                        <div className="space-y-6">
                          <div><Label>Nome</Label><p className="text-lg font-medium">{editUser.name}</p></div>
                          <div><Label>E-mail</Label><p className="text-lg font-medium">{editUser.email}</p></div>
                          <div><Label>Telefone</Label>
                            <p className="text-lg font-medium">
                              {userPhone ? `(${userPhone.slice(0,2)}) ${userPhone.slice(2,7)}-${userPhone.slice(7)}` : "Não informado"}
                            </p>
                          </div>
                          <Button onClick={() => setShowEditProfile(true)}
                            className="w-full eco-gradient text-white font-semibold">
                            <Pencil className="h-4 w-4 mr-2" /> Editar Perfil
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* CARRINHO */}
                {tab === "cart" && (
                  <Card className="rounded-2xl border border-slate-200/60 dark:border-slate-700/40 shadow-sm">
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
                            <div key={item.id} className="flex gap-4 p-4 border rounded-xl">
                              <img src={item.items?.images?.[0]?.url || "https://via.placeholder.com/80"}
                                alt={item.items.name} className="w-20 h-20 rounded-lg object-cover" />
                              <div className="flex-1">
                                <h3 className="font-semibold">{item.items.name}</h3>
                                <p className="text-sm text-muted-foreground">R$ {item.items.price.toFixed(2)}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button size="icon" variant="outline" onClick={() => changeQty(item.id, item.quantity - 1)}><Minus className="h-4 w-4" /></Button>
                                <span className="w-8 text-center font-medium">{item.quantity}</span>
                                <Button size="icon" variant="outline" onClick={() => changeQty(item.id, item.quantity + 1)}><Plus className="h-4 w-4" /></Button>
                              </div>
                              <Button size="icon" variant="ghost" onClick={() => { setDeleteItemId(item.id); setShowDeleteItem(true); }}>
                                <Trash2 className="h-5 w-5 text-destructive" />
                              </Button>
                            </div>
                          ))}
                          <div className="border-t pt-6">
                            <div className="flex justify-between text-2xl font-bold">
                              <span>Total</span>
                              <span className="text-emerald-600">
                                R$ {cart.reduce((s, i) => s + i.items.price * i.quantity, 0).toFixed(2)}
                              </span>
                            </div>
                            <Button className="w-full mt-6 eco-gradient text-white font-semibold text-lg py-6">
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
                  <Card className="rounded-2xl border border-slate-200/60 dark:border-slate-700/40 shadow-sm">
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
                  <Card className="rounded-2xl border border-slate-200/60 dark:border-slate-700/40 shadow-sm">
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
                                    {a.is_default && <Badge className="bg-emerald-500 text-white"><Star className="h-3 w-3 mr-1 fill-current" /> Padrão</Badge>}
                                  </div>
                                  <p className="text-sm text-muted-foreground">{a.recipient_name}</p>
                                  <p className="text-sm">{a.street}, {a.number}{a.complement && ` - ${a.complement}`}</p>
                                  <p className="text-sm">{a.neighborhood} • {a.city}/{a.state} • CEP {a.zip_code.replace(/(\d{5})(\d{3})/, "$1-$2")}</p>
                                </div>
                                <div className="flex gap-2">
                                  {!a.is_default && <Button size="sm" variant="outline" onClick={() => setDefault(a.id)}>Padrão</Button>}
                                  <Button size="icon" variant="ghost" onClick={() => openEdit(a)}><Edit className="h-4 w-4 text-mute" /></Button>
                                  <Button size="icon" variant="ghost" onClick={() => { setAddrToDelete(a.id); setShowDeleteAddr(true); }}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
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

                {/* CONFIGURAÇÕES */}
                {tab === "settings" && (
                  <Card className="rounded-2xl border border-slate-200/60 dark:border-slate-700/40 shadow-sm">
                    <CardContent className="p-8">
                      <h2 className="text-2xl font-bold mb-8">Configurações</h2>
                      <div className="space-y-8">
                        <div>
                          <h3 className="font-semibold flex items-center gap-2 mb-4"><Lock className="h-5 w-5" /> Segurança</h3>
                          <Button onClick={() => setShowPass(true)} className="w-full justify-start eco-gradient text-white">
                            Alterar Senha
                          </Button>
                        </div>
                        <div>
                          <h3 className="font-semibold flex items-center gap-2 mb-4"><Bell className="h-5 w-5" /> Notificações</h3>
                          <div className="space-y-4">
                            {Object.entries(settings).map(([k, v]) => (
                              <div key={k} className="flex justify-between items-center">
                                <Label className="cursor-pointer capitalize">{k.replace(/_/g, " ")}</Label>
                                <Switch checked={v} onCheckedChange={() => toggleSetting(k as keyof Settings)} />
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="pt-6 border-t">
                          <Button onClick={logout} variant="destructive" className="w-full">Sair da Conta</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* DIÁLOGOS */}
      {/* Editar Perfil */}
      <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Editar Perfil</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Nome</Label><Input value={editUser.name} onChange={e => setEditUser({ ...editUser, name: e.target.value })} /></div>
            <div><Label>E-mail</Label><Input type="email" value={editUser.email} readOnly /></div>
            <div><Label>Telefone</Label><Input value={editUser.phone} onChange={e => setEditUser({ ...editUser, phone: e.target.value.replace(/\D/g, "").slice(0,11) })} placeholder="11999999999" /></div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowEditProfile(false)}>Cancelar</Button>
            <Button onClick={saveProfile} disabled={saving} className="eco-gradient text-white">
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alterar Senha */}
      <Dialog open={showPass} onOpenChange={setShowPass}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Nova Senha</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Label>Senha</Label>
              <Input type={seePwd ? "text" : "password"} value={pass.password} onChange={e => setPass({ ...pass, password: e.target.value })} />
              <Button size="icon" variant="ghost" className="absolute right-2 top-8" onClick={() => setSeePwd(!seePwd)}>
                {seePwd ? <EyeOff /> : <Eye />}
              </Button>
            </div>
            <div className="relative">
              <Label>Confirmar</Label>
              <Input type={seeConfirm ? "text" : "password"} value={pass.confirm} onChange={e => setPass({ ...pass, confirm: e.target.value })} />
              <Button size="icon" variant="ghost" className="absolute right-2 top-8" onClick={() => setSeeConfirm(!seeConfirm)}>
                {seeConfirm ? <EyeOff /> : <Eye />}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowPass(false)}>Cancelar</Button>
            <Button onClick={changePassword} disabled={saving} className="eco-gradient text-white">
              {saving ? "Alterando..." : "Alterar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remover Item Carrinho */}
      <Dialog open={showDeleteItem} onOpenChange={setShowDeleteItem}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Remover item?</DialogTitle></DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowDeleteItem(false)}>Cancelar</Button>
            <Button onClick={removeItem} className="bg-destructive text-white">Remover</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Endereço */}
      <Dialog open={showAddr || showEditAddr} onOpenChange={closeAddr}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{showEditAddr ? "Editar" : "Novo"} Endereço</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>CEP *</Label>
              <Input placeholder="00000000" value={formAddr.zip_code || ""} onChange={e => {
                const cep = e.target.value.replace(/\D/g, "").slice(0,8);
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
              {showEditAddr ? "Salvar Alterações" : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Excluir Endereço */}
      <Dialog open={showDeleteAddr} onOpenChange={setShowDeleteAddr}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Excluir endereço?</DialogTitle></DialogHeader>
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