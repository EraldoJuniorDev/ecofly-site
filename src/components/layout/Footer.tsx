import React from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, Mail, Instagram } from 'lucide-react'
import MainLogo from '../../../public/favicon.ico'
import { WHATSAPP_LINK, INSTAGRAM_LINK, INSTAGRAM_USER }   from "../../constants";

const Footer = () => {
  console.log('Footer component rendered')

  return (
    <footer className="border-t bg-card">
      <div className="container px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo e Descrição */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
                <img src={MainLogo} alt="Logo"  className='w-14'/>
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
              <Link to="/catalogo" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Catálogo
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
                href={WHATSAPP_LINK} 
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
                <span>ecoflybags@gmail.com</span>
              </a>
              <a 
                href={INSTAGRAM_LINK} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Instagram className="h-4 w-4" />
                <span>@{INSTAGRAM_USER}</span>
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