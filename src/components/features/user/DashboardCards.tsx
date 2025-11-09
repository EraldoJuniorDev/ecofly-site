// src/components/features/DashboardCards.tsx
import { ShoppingCart, MapPin, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DashboardCardsProps {
  cart: any[];
  addresses: any[];
  orders: any[];
}

export default function DashboardCards({ cart, addresses, orders }: DashboardCardsProps) {
  const defaultAddr = addresses.find((a: any) => a.is_default);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Carrinho */}
      <Card className="animate-scale-in card-hover" style={{ animationDelay: '0.2s' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-primary" />
            </div>
            Meu Carrinho
            <Badge variant="secondary" className="ml-auto">
              {cart.reduce((s, i) => s + i.quantity, 0)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {cart.length === 0 ? (
            <>
              <p className="text-muted-foreground text-sm">Carrinho vazio</p>
              <p className="text-xs text-muted-foreground mt-2">
                Adicione produtos ao seu carrinho para começar suas compras.
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              {cart.length} produto(s) no carrinho
            </p>
          )}
        </CardContent>
      </Card>

      {/* Endereços */}
      <Card className="animate-scale-in card-hover" style={{ animationDelay: '0.3s' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-accent" />
            </div>
            Endereços
          </CardTitle>
        </CardHeader>
        <CardContent>
          {defaultAddr ? (
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-sm">{defaultAddr.street}</p>
                  <p className="text-xs text-muted-foreground">
                    {defaultAddr.city} - {defaultAddr.state}
                  </p>
                </div>
                <Badge className="bg-primary text-primary-foreground">Padrão</Badge>
              </div>
            </div>
          ) : (
            <>
              <p className="text-muted-foreground text-sm">Nenhum endereço padrão</p>
              <p className="text-xs text-muted-foreground mt-2">
                Cadastre um endereço para agilizar suas compras.
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Pedidos */}
      <Card className="animate-scale-in card-hover" style={{ animationDelay: '0.4s' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <Package className="w-5 h-5 text-secondary-foreground" />
            </div>
            Últimos Pedidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <>
              <p className="text-muted-foreground text-sm">Sem pedidos</p>
              <p className="text-xs text-muted-foreground mt-2">
                Você ainda não realizou nenhum pedido.
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              {orders.length} pedido(s) registrado(s)
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}