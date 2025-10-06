export interface Item {
  id: number;
  name: string;
  category: string;
  description: string;
  images: { url: string; alt: string }[];
  created_at?: string; // Opcional, incluído para alinhar com o padrão do Supabase
}