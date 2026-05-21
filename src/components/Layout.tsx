import { useState, useEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import logoImg from '@/assets/logo-fundopreto-ti-express-tagline-5e290.png'

export function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  const navLinks = [
    { name: 'O Provimento', path: '/#provimento' },
    { name: 'Serviços', path: '/servicos' },
    { name: 'Benefícios', path: '/#beneficios' },
    { name: 'Contato', path: '#contato' },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-black text-white shadow-subtle">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <img
              src={logoImg}
              alt="Provimento 213 TXS"
              className="h-10 object-contain group-hover:scale-105 transition-transform duration-300"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6 text-sm font-medium text-slate-300">
              {navLinks.map((link) => (
                <a key={link.name} href={link.path} className="hover:text-white transition-colors">
                  {link.name}
                </a>
              ))}
            </div>
            <Button
              asChild
              variant="outline"
              className="rounded-full px-6 font-semibold bg-transparent border-slate-700 text-white hover:bg-slate-800 hover:text-white"
            >
              <Link to="/carrinho">Carrinho</Link>
            </Button>
            <Button asChild className="rounded-full px-6 font-semibold shadow-elevation text-white">
              <Link to="/checklist">Fazer Diagnóstico</Link>
            </Button>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        <div
          className={cn(
            'md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-black border-b border-slate-800',
            isMobileMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0',
          )}
        >
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.path}
                className="text-base font-medium text-white py-2 border-b border-slate-800"
              >
                {link.name}
              </a>
            ))}
            <Button
              asChild
              variant="outline"
              className="w-full mt-2 bg-transparent border-slate-700 text-white hover:bg-slate-800 hover:text-white"
            >
              <Link to="/carrinho">Ver Carrinho</Link>
            </Button>
            <Button asChild className="w-full mt-2 text-white">
              <Link to="/checklist">Fazer Diagnóstico Gratuito</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* Footer */}
      <footer id="contato" className="bg-black text-slate-300 py-12 border-t border-slate-900">
        <div className="container mx-auto px-4 grid md:grid-cols-3 gap-8">
          <div>
            <Link
              to="/"
              className="flex items-center gap-2 mb-4 opacity-90 hover:opacity-100 transition-opacity"
            >
              <img src={logoImg} alt="Provimento 213 TXS" className="h-10 object-contain" />
            </Link>
            <p className="text-sm text-slate-400 max-w-xs mt-4">
              Plataforma independente de avaliação de conformidade de infraestrutura de TI para
              serventias extrajudiciais baseada no Provimento 213 do CNJ.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Links Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/checklist" className="hover:text-white transition-colors">
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
              asChild
              className="border-slate-700 text-white hover:text-slate-900 hover:bg-slate-100 w-full sm:w-auto"
            >
              <a href="https://wa.me/5562984778861" target="_blank" rel="noopener noreferrer">
                WhatsApp: 62 98477-8861
              </a>
            </Button>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Provimento 213 TXS. Todos os direitos reservados.</p>
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
