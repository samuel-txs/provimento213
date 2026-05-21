import { useState, useEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { ShieldCheck, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  const navLinks = [
    { name: 'O Provimento', path: '/#provimento' },
    { name: 'Benefícios', path: '/#beneficios' },
    { name: 'Contato', path: '#contato' },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md shadow-subtle">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg group-hover:scale-105 transition-transform duration-300">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-primary">
              Cartório<span className="font-light text-foreground">Seguro</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.path}
                  className="hover:text-primary transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>
            <Button asChild className="rounded-full px-6 font-semibold shadow-elevation">
              <Link to="/identificacao">Fazer Diagnóstico</Link>
            </Button>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        <div
          className={cn(
            'md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-background border-b',
            isMobileMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0',
          )}
        >
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.path}
                className="text-base font-medium text-foreground py-2 border-b border-border/50"
              >
                {link.name}
              </a>
            ))}
            <Button asChild className="w-full mt-2">
              <Link to="/identificacao">Fazer Diagnóstico Gratuito</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* Footer */}
      <footer id="contato" className="bg-slate-900 text-slate-300 py-12 border-t">
        <div className="container mx-auto px-4 grid md:grid-cols-3 gap-8">
          <div>
            <Link
              to="/"
              className="flex items-center gap-2 mb-4 opacity-90 hover:opacity-100 transition-opacity"
            >
              <ShieldCheck className="h-6 w-6 text-white" />
              <span className="font-display font-bold text-xl text-white">
                Cartório<span className="font-light">Seguro</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-xs">
              Plataforma independente de avaliação de conformidade de infraestrutura de TI para
              serventias extrajudiciais baseada no Provimento 213 do CNJ.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Links Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/identificacao" className="hover:text-white transition-colors">
                  Iniciar Checklist
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Ler o Provimento Oficial (PDF)
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Consultoria Especializada
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Fale Conosco</h3>
            <p className="text-sm mb-2">Precisa de ajuda com sua adequação?</p>
            <Button
              variant="outline"
              className="border-slate-700 text-slate-800 hover:text-slate-900 hover:bg-slate-100 w-full sm:w-auto"
            >
              Chamar no WhatsApp
            </Button>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} CartórioSeguro. Todos os direitos reservados.</p>
          <div className="mt-4 md:mt-0 flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Sistema Atualizado (Provimento 213)
          </div>
        </div>
      </footer>
    </div>
  )
}
