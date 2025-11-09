// src/components/features/ProfileForm.tsx
import { useState } from 'react';
import { User, Phone, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import DatePicker from 'react-datepicker';
import { ptBR } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';

interface ProfileFormProps {
    editUser: { name: string; phone: string; birthDate: string };
    setEditUser: React.Dispatch<React.SetStateAction<any>>;
    onSave: () => Promise<void>;
    loading: boolean;
}

export default function ProfileForm({
    editUser,
    setEditUser,
    onSave,
    loading,
}: ProfileFormProps) {
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave();
    };

    return (
        <Card className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <CardHeader>
                <CardTitle className="text-2xl">Editar Perfil</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Nome */}
                        <div className="space-y-2">
                            <Label htmlFor="name" className="flex items-center gap-2">
                                <User className="w-4 h-4 text-primary" />
                                Nome Completo
                            </Label>
                            <Input
                                id="name"
                                value={editUser.name}
                                onChange={e => setEditUser(p => ({ ...p, name: e.target.value }))}
                                placeholder="Digite seu nome completo"
                                className="h-12"
                            />
                        </div>

                        {/* Telefone */}
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-primary" />
                                Telefone
                            </Label>
                            <Input
                                id="phone"
                                value={editUser.phone}
                                onChange={e => setEditUser(p => ({ ...p, phone: e.target.value }))}
                                placeholder="(00) 00000-0000"
                                className="h-12"
                            />
                        </div>

                        {/* Data de Nascimento */}
                        <div className="space-y-2">
                            <Label htmlFor="birthdate" className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-primary" />
                                Data de Nascimento
                            </Label>
                            <DatePicker
                                selected={editUser.birthDate ? new Date(editUser.birthDate) : null}
                                onChange={(date: Date | null) => {
                                    const formatted = date ? date.toISOString().split('T')[0] : '';
                                    setEditUser(p => ({ ...p, birthDate: formatted }));
                                }}
                                dateFormat="dd/MM/yyyy"
                                placeholderText="Selecione sua data"
                                className="w-full h-12 px-3 bg-background text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                wrapperClassName="w-full"
                                locale={ptBR}
                                maxDate={new Date()}
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        size="lg"
                        disabled={loading}
                        className="w-full md:w-auto bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 hover:scale-[1.02] transform transition-all duration-300 text-white"
                    >
                        {loading ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}