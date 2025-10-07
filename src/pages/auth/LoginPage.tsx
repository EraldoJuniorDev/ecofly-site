import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { toast } from 'sonner';

const LoginPage = () => {
  console.log('LoginPage rendering');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        throw new Error('Credenciais inválidas');
      }
      console.log('Login response:', data);
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Session after login:', session);
      toast.success('Login bem-sucedido!');
      await supabase.auth.refreshSession();
      navigate('/admin', { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  console.log('LoginPage JSX rendering');

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
          <Link to="/" className="inline-flex items-center text-green-600 hover:text-green-800 pt-5 pl-5">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para a página inicial
          </Link>
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center eco-text-gradient">
            Login
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu email"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full eco-gradient text-white"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;