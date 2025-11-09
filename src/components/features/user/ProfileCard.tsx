// src/components/features/ProfileCard.tsx
import { Camera, Mail, Shield, X as XIcon } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProfileCardProps {
  profilePic: string | null;
  name: string;
  email: string;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onRemove: () => Promise<void>;
  loading: boolean;
}

export default function ProfileCard({
  profilePic,
  name,
  email,
  fileInputRef,
  onUpload,
  onRemove,
  loading,
}: ProfileCardProps) {
  return (
    <Card className="p-8 animate-slide-up card-hover">
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Avatar */}
        <div className="relative group">
          <Avatar className="w-32 h-32 border-4 border-primary/20">
            {profilePic ? (
              <img src={profilePic} alt="Perfil" className="object-cover w-full h-full" />
            ) : (
              <AvatarFallback className="bg-gradient-eco text-primary-foreground text-4xl font-bold">
                {name.charAt(0).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>

          <Button
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="absolute bottom-0 right-0 rounded-full bg-accent hover:bg-accent/90 shadow-lg"
          >
            <Camera className="w-4 h-4" />
          </Button>

          {profilePic && (
            <Button
              size="icon"
              onClick={onRemove}
              disabled={loading}
              className="absolute top-0 right-0 rounded-full bg-destructive hover:bg-destructive/90"
            >
              <XIcon className="w-4 h-4" />
            </Button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onUpload}
        />

        {/* Info */}
        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <h2 className="text-3xl font-bold text-foreground">{name}</h2>
            <Badge variant="secondary" className="gap-1 w-fit mx-auto md:mx-0">
              <Shield className="w-3 h-3" />
              Administrador
            </Badge>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground">
            <Mail className="w-4 h-4" />
            <span>{email}</span>
          </div>

          <p className="text-sm text-muted-foreground max-w-2xl">
            Bem-vindo ao painel de usuário. Gerencie seu perfil, pedidos e preferências.
          </p>
        </div>
      </div>
    </Card>
  );
}