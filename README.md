🛍️ ECOFLY - Loja de EcoBags Personalizadas

<img alt="Ecofly Banner" src="https://euxlnqarxvbyaaqofyqh.supabase.co/storage/v1/object/public/site-images/logo_transparent.png">

🌱 Sobre o Projeto

O ECOFLY é um site de e-commerce focado em eco bags personalizadas e sustentáveis, oferecendo aos usuários uma experiência de compra moderna e intuitiva. O projeto foi desenvolvido com foco em:

Performance e responsividade

Boa experiência do usuário (UX)

Código limpo e modular

Facilidade para manutenção e expansão futura

O site é ideal para quem deseja aprender boas práticas de desenvolvimento frontend usando React + Vite + TypeScript e ferramentas modernas de estilização como Tailwind CSS.

🎯 Funcionalidades

Catálogo de produtos com categorias

Visualização detalhada de cada produto

Sistema de favoritos

Formulário de contato

Links diretos para WhatsApp e Instagram da loja

Responsividade para dispositivos móveis e desktops

Uso de TypeScript para tipagem e segurança

🛠 Tecnologias Utilizadas

Frontend: React + Vite

Estilização: Tailwind CSS + CSS Modules

Tipagem: TypeScript

Gerenciamento de estado: useState, useEffect (React Hooks)

Ferramentas de desenvolvimento:

ESLint + Prettier

PostCSS

Vite para bundling rápido e eficiente

Controle de versão: Git + GitHub

🏗 Estrutura do Projeto
src/
├── components/                  # Componentes reutilizáveis
│   ├── layout/                  # Componentes de layout da aplicação
│   │   ├── BackToTop.tsx        # Botão para voltar ao topo da página
│   │   ├── Footer.tsx           # Rodapé do site
│   │   ├── Header.tsx           # Cabeçalho do site
│   │   └── ThemeToggle.tsx      # Componente para alternar tema claro/escuro
│   │
│   ├── ui/                      # Componentes de interface do usuário
│   │   ├── FeedbackForm.js      # Formulário de feedback
│   │   ├── FeedbackList.js      # Lista de feedbacks
│   │   └── ProductCard.tsx      # Card de produtos
│
├── context/                     # Contextos do React para estado global
│   └── FavoritesContext.tsx     # Contexto para gerenciar favoritos
│
├── data/                        # Dados e configuração do cliente Supabase
│   └── supabaseClient.js        # Inicialização do cliente Supabase (JS)
│
├── hooks/                       # Hooks customizados
│   ├── use-mobile.tsx           # Hook para detectar mobile
│   ├── use-toast.ts             # Hook para notificações
│   └── useFeedback.ts           # Hook para gerenciar feedback
│
├── lib/                         # Bibliotecas auxiliares do projeto
│   ├── supabaseClient.ts        # Cliente Supabase (TS)
│   ├── theme-provider.tsx       # Provider para tema claro/escuro
│   └── utils.ts                 # Funções utilitárias
│
├── pages/                       # Páginas da aplicação
│   ├── admin/                   # Páginas de administração
│   │   ├── AdminPage.tsx        # Dashboard/Admin principal
│   │   ├── EditProductPage.tsx  # Página para editar produtos
│   │   └── ProductListPage.tsx  # Página para listar produtos
│   │
│   ├── auth/                    # Páginas de autenticação
│   │   ├── LoginPage.css        # Estilos do login
│   │   └── LoginPage.tsx        # Página de login
│   │
│   ├── public/                  # Páginas acessíveis ao público
│   │   └── Feedback.tsx         # Página de feedback
│   │
│   └── user/                    # Páginas para usuários logados/visitantes
│       ├── Catalog.tsx          # Catálogo de produtos
│       ├── Contact.tsx          # Página de contato
│       ├── Contact_backup.tsx   # Backup da página de contato
│       ├── Favorites.tsx        # Página de favoritos
│       ├── Home.tsx             # Página inicial
│       └── Index.tsx            # Página de entrada (rota principal)

🔹 Explicação das Pastas e Arquivos

components/layout/

Componentes que estruturam a aplicação e aparecem em várias páginas, como cabeçalho, rodapé, botão de voltar ao topo e alternador de tema.

components/ui/

Componentes de interface reutilizáveis, como cards de produtos e formulários de feedback.

context/

Contém contexts do React para estado global, como FavoritesContext para gerenciar produtos favoritos.

data/

Armazena dados estáticos e inicializações de clientes externos (Supabase neste caso).

hooks/

Hooks customizados para lógica reutilizável: detectar dispositivos móveis, gerenciar feedbacks e exibir notificações.

lib/

Bibliotecas auxiliares e funções utilitárias, incluindo cliente Supabase em TypeScript e provedor de tema.

pages/admin/

Páginas do painel administrativo para gerenciar produtos.

pages/auth/

Páginas de autenticação, como login.

pages/public/

Páginas públicas acessíveis sem login, como feedback.

pages/user/

Páginas voltadas ao usuário, incluindo catálogo, favoritos, contato e página inicial.

🚀 Instalação e Execução Local

Clone o repositório:

git clone https://github.com/EraldoJuniorDev/ecofly-site.git


Acesse o diretório do projeto:

cd ecofly-site


Instale as dependências:

npm install


Execute o servidor de desenvolvimento:

npm run dev


Abra o navegador em http://localhost:5173
 (porta padrão do Vite).

Para gerar uma versão de produção:

npm run build


Para pré-visualizar a build:

npm run preview

📦 Scripts Disponíveis
Script	Descrição
npm run dev	Inicializa o servidor de desenvolvimento
npm run build	Gera build otimizada para produção
npm run preview	Pré-visualiza a versão de produção localmente
npm run lint	Executa ESLint para verificação de código
npm run format	Formata o código usando Prettier
🔍 Exemplos de Uso

Adicionar produtos aos favoritos

Navegar entre categorias e produtos

Abrir links diretos para WhatsApp e Instagram da loja

Enviar mensagens de contato

🌐 Acesso Online

O site está disponível online em:
https://ecofly-site.vercel.app