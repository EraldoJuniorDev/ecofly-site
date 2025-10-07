🛍️ ECOFLY - Loja de EcoBags Personalizadas

<img alt="Ecofly Banner" src="https://euxlnqarxvbyaaqofyqh.supabase.co/storage/v1/object/public/item-images/images/logo/logo_transparent.png">

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
ecofly-site/
├── public/                  # Assets públicos (imagens, favicon, logos)
├── src/
│   ├── components/          # Componentes reutilizáveis (Card, Button, Badge, etc.)
│   ├── hooks/               # Hooks customizados (ex: useFavorites)
│   ├── pages/               # Páginas do site (Home, Produto, Contato)
│   ├── styles/              # Estilos globais e variáveis Tailwind
│   ├── utils/               # Funções utilitárias
│   ├── data/                # JSON de produtos e categorias
│   ├── App.tsx              # Componente principal
│   └── main.tsx             # Ponto de entrada do React
├── package.json             # Dependências e scripts
├── tsconfig.json            # Configuração do TypeScript
├── tailwind.config.js       # Configuração do Tailwind CSS
└── vite.config.ts           # Configuração do Vite

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

🤝 Como Contribuir

Faça um fork deste repositório.

Crie uma branch para sua feature:

git checkout -b minha-feature


Faça commit das suas alterações:

git commit -m "Adiciona nova feature"


Envie para o repositório remoto:

git push origin minha-feature


Abra um Pull Request para revisão.

🌐 Acesso Online

O site está disponível online em:
https://ecofly-site.vercel.app