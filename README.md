# ECOFLY - EcoBags Personalizadas Sustentáveis

![ECOFLY Logo](https://ecofly-site.vercel.app/assets/logo_transparent-CYAqbDdT.png)

## 📖 Sobre o Projeto

ECOFLY é um site de e-commerce dedicado à venda de produtos artesanais sustentáveis, com foco em EcoBags personalizadas, cinzeiros artísticos, chaveiros únicos e mini telas criativas. O projeto combina consciência ambiental com arte personalizada, oferecendo produtos únicos feitos com amor e responsabilidade ecológica.

## 🎨 Características do Site

### Design e Experiência do Usuário
- **Design Responsivo**: Totalmente adaptado para desktop, tablet e mobile
- **Identidade Visual Eco-friendly**: Cores verdes e naturais que refletem sustentabilidade
- **Interface Intuitiva**: Navegação simples e acessível
- **Animações Suaves**: Transições elegantes e micro-interações

### Funcionalidades Principais
- **Galeria de Produtos Interativa**: Visualização em múltiplos ângulos
- **Sistema de Zoom**: Modal expandido para examinar detalhes
- **Navegação por Categorias**: Filtros para EcoBags, Cinzeiros, Mini Telas e Chaveiros
- **Integração WhatsApp**: Contato direto para pedidos e consultas
- **Sistema de Feedback**: Área dedicada para avaliações de clientes
- **SEO Otimizado**: Meta tags e estrutura otimizada para buscadores

## 🛍️ Produtos Disponíveis

### EcoBags Personalizadas
- **Mar Doce Lar**: Design inspirado no mar com tipografia criativa
- **Lana Del Rey**: Inspirada na música com cerejas delicadas
- **Olho Místico**: Design esotérico com olho centralizado
- **Borboleta**: Delicadas borboletas em tons suaves
- **Girassol**: Alegria do girassol em ecobags sustentáveis

### Cinzeiros Artísticos
- **Universo Místico**: Design cósmico com olho central e estrelas douradas
- **Rolling Stones**: Logo clássico da banda
- **Homem-Aranha**: Máscara do herói em detalhes
- **Jack Skellington**: Personagem do "Pesadelo Antes do Natal"
- **Batman**: Logo icônico em amarelo sobre fundo escuro
- **Diabinho Fumante**: Design divertido e irreverente
- **Proibido Fumar**: Ironia artística com símbolo proibido
- **Futebol**: Para os apaixonados pelo esporte
- **Bart Simpson**: Personagem em estilo divertido

### Mini Telas e Arte
- **Cósmica**: Universo em miniatura com olho central
- **Espiral Colorida**: Padrões hipnóticos em tons vibrantes

## 🌱 Compromisso Sustentável

### Valores Ambientais
- **100% Materiais Sustentáveis**: Uso exclusivo de materiais eco-friendly
- **Zero Desperdício**: Processo produtivo consciente
- **Reutilização Infinita**: Produtos duráveis e reutilizáveis
- **Produção Artesanal**: Cada peça é única e feita à mão

## 🚀 Tecnologias Utilizadas

### Frontend
- **React 18.3**: Biblioteca JavaScript para interfaces de usuário
- **TypeScript**: Tipagem estática para maior confiabilidade
- **Vite**: Build tool rápido e moderno
- **React Router DOM**: Navegação entre páginas
- **Tailwind CSS**: Framework CSS utilitário

### UI/UX
- **shadcn/ui**: Biblioteca de componentes elegantes
- **Radix UI**: Componentes acessíveis e primitivos
- **Lucide React**: Ícones modernos e consistentes
- **Framer Motion**: Animações suaves (implícito via Tailwind)

### Funcionalidades Avançadas
- **React Query**: Gerenciamento de estado e cache
- **Sonner**: Sistema de notificações toast
- **Zod**: Validação de formulários
- **Class Variance Authority**: Gestão de variantes CSS

## 📱 Estrutura de Páginas

### Página Inicial (`/`)
- Hero Section com call-to-action
- Produtos em destaque com galeria interativa
- Seção de valores sustentáveis
- Estatísticas de impacto ambiental

### Loja (`/loja`)
- Catálogo completo de produtos
- Filtros por categoria
- Cards interativos com múltiplas imagens
- Sistema de zoom e modal

### Feedback (`/feedback`)
- Formulário de avaliação com estrelas
- Depoimentos de clientes
- Sistema de ratings

### Contato (`/contato`)
- Formulário de contato
- Integração com WhatsApp
- Informações de atendimento
- Links para redes sociais

## 🎯 Funcionalidades Especiais

### Sistema de Galeria Avançado
```typescript
// Cada produto pode ter múltiplas imagens
interface ProductImage {
  url: string
  alt: string
}

// Navegação entre imagens com thumbnails
- Setas de navegação
- Thumbnails clicáveis
- Contador de imagens
- Modal expandido com zoom
```

### Integração WhatsApp
```typescript
// Mensagens personalizadas por produto
const handleWhatsApp = (productName: string) => {
  const message = `Olá! Tenho interesse no produto: ${productName}`
  const whatsappUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(message)}`
  window.open(whatsappUrl, '_blank')
}
```

### Sistema de Notificações
- Toast notifications para feedback do usuário
- Confirmações de envio de formulários
- Alertas de erro amigáveis

## 🎨 Design System

### Paleta de Cores
```css
:root {
  --primary: 142 69% 58%;        /* Verde principal */
  --secondary: 160 84% 39%;      /* Verde escuro */
  --accent: 82 84% 67%;          /* Verde claro */
  --background: 120 60% 98%;     /* Fundo claro */
  --muted: 120 60% 96%;          /* Cinza suave */
}
```

### Gradientes Eco-friendly
```css
.eco-gradient {
  background: linear-gradient(135deg, hsl(142 69% 58%) 0%, hsl(160 84% 39%) 100%);
}

.eco-text-gradient {
  background: linear-gradient(135deg, hsl(142 69% 58%) 0%, hsl(160 84% 39%) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

## 📊 SEO e Performance

### Otimizações Implementadas
- **Meta Tags Completas**: Title, description, keywords
- **Open Graph**: Compartilhamento otimizado em redes sociais
- **Twitter Cards**: Visualização aprimorada no Twitter
- **Schema.org**: Estrutura de dados estruturados
- **Lazy Loading**: Carregamento otimizado de imagens
- **Code Splitting**: Divisão inteligente do código

### Meta Tags Exemplo
```html
<title>ECOFLY - EcoBags Personalizadas Sustentáveis</title>
<meta name="description" content="EcoBags personalizadas, cinzeiros artesanais, chaveiros únicos e mini telas criativas. Produtos sustentáveis e artesanais da ECOFLY com designs exclusivos.">
<meta property="og:image" content="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&h=630&fit=crop">
```

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js 18+ ou Bun
- Git

### Instalação
```bash
# Clone o repositório
git clone [repository-url]
cd ecofly-website

# Instale as dependências
npm install
# ou
bun install

# Execute o projeto em desenvolvimento
npm run dev
# ou
bun dev

# Build para produção
npm run build
# ou
bun run build
```

### Variáveis de Ambiente
```env
# Criar arquivo .env na raiz do projeto
VITE_WHATSAPP_NUMBER=5511999999999
VITE_EMAIL_CONTACT=contato@ecofly.com.br
VITE_INSTAGRAM_HANDLE=_ecofly_
```

## 📱 Responsividade

### Breakpoints Tailwind
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px
- **Large Desktop**: > 1400px

### Grid Responsivo
```typescript
// Cards de produtos adaptáveis
grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
```

## 🔧 Estrutura de Arquivos

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes base (shadcn/ui)
│   ├── layout/         # Header, Footer, navegação
│   └── ProductCard.tsx # Card de produto com galeria
├── pages/              # Páginas da aplicação
│   ├── Home.tsx        # Página inicial
│   ├── Store.tsx       # Loja/catálogo
│   ├── Feedback.tsx    # Avaliações
│   └── Contact.tsx     # Contato
├── lib/                # Utilitários e configurações
│   └── utils.ts        # Funções auxiliares
└── types/              # Definições TypeScript
```

## 🌐 Deploy e Hospedagem

### Plataformas Compatíveis
- **Vercel**: Deploy automático via Git
- **Netlify**: Integração contínua
- **AWS S3 + CloudFront**: Hospedagem estática
- **GitHub Pages**: Deploy gratuito

### Configuração de Build
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

## 📈 Métricas e Analytics

### Performance
- **Lighthouse Score**: 90+ em todas as métricas
- **Core Web Vitals**: Otimizado
- **Bundle Size**: Minimizado com tree-shaking

### Acessibilidade
- **WCAG 2.1**: Conformidade AA
- **Screen Readers**: Compatível
- **Keyboard Navigation**: Totalmente navegável

## 🤝 Contribuição

### Como Contribuir
1. Fork o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

### Padrões de Código
- **ESLint**: Linting automatizado
- **Prettier**: Formatação de código
- **Conventional Commits**: Padrão de commits
- **TypeScript**: Tipagem obrigatória

## 📞 Contato e Suporte

### ECOFLY
- **WhatsApp**: +55 (11) 99999-9999
- **Email**: contato@ecofly.com.br
- **Instagram**: [@_ecofly_](https://instagram.com/_ecofly_)
- **Horário**: Segunda a Sexta, 9h às 18h | Sábado, 9h às 14h

### Desenvolvedores
- **Plataforma**: OnSpace.AI
- **Tecnologia**: React + TypeScript + Tailwind CSS
- **Suporte**: Integração completa com WhatsApp Business

## 📄 Licença

Este projeto é propriedade da ECOFLY. Todos os direitos reservados.

---

**Feito com 💚 para um mundo mais sustentável** 🌱

*Transforme sua rotina com produtos únicos e conscientes da ECOFLY*