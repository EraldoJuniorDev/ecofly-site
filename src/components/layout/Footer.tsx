import React from 'react'
import { Link } from 'react-router-dom'
import { Leaf, MessageCircle, Mail, Instagram } from 'lucide-react'

const Footer = () => {
  console.log('Footer component rendered')

  return (
    <footer className="border-t bg-card">
      <div className="container px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo e Descrição */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-full eco-gradient">
                <Leaf className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold eco-text-gradient">ECOFLY</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              EcoBags personalizadas e produtos artesanais sustentáveis. 
              Transforme sua rotina com estilo e consciência ambiental.
            </p>
          </div>

          {/* Links Rápidos */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Links Rápidos</h3>
            <div className="flex flex-col space-y-2">
              <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Início
              </Link>
              <Link to="/loja" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Loja
              </Link>
              <Link to="/ecobags" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                EcoBags
              </Link>
              <Link to="/cinzeiros" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Cinzeiros
              </Link>
              <Link to="/mini-telas" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Mini Telas
              </Link>
              <Link to="/favoritos" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Favoritos
              </Link>
              <Link to="/feedback" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Feedback
              </Link>
              <Link to="/contato" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Contato
              </Link>
            </div>
          </div>

          {/* Contato */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contato</h3>
            <div className="flex flex-col space-y-3">
              <a 
                href="https://wa.me/5511999999999" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp</span>
              </a>
              <a 
                href="mailto:contato@ecofly.com.br"
                className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="h-4 w-4" />
                <span>contato@ecofly.com.br</span>
              </a>
              <a 
                href="https://instagram.com/_ecofly_" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Instagram className="h-4 w-4" />
                <span>@_ecofly_</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 ECOFLY. Todos os direitos reservados. Feito com 💚 para um mundo mais sustentável.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer