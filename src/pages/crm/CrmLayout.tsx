import { useEffect } from 'react'
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { ShieldCheck, LogOut, LayoutDashboard, Users, FileText, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CrmLayout() {
  const { isAuthenticated, loading, signOut, user } = useAuth()
  const navigate = useNavigate()

  const location = useLocation()

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        navigate('/vendedor/login')
      } else if (user?.role !== 'admin' && user?.role !== 'vendedor') {
        navigate('/crm/acesso-negado')
      }
    }
  }, [isAuthenticated, loading, navigate, user])

  // Session Timeout: 30 minutes
  useEffect(() => {
    if (!isAuthenticated) return

    let timeout: NodeJS.Timeout
    const resetTimeout = () => {
      clearTimeout(timeout)
      timeout = setTimeout(
        () => {
          signOut()
          navigate('/vendedor/login')
        },
        30 * 60 * 1000,
      )
    }

    window.addEventListener('mousemove', resetTimeout)
    window.addEventListener('keypress', resetTimeout)
    window.addEventListener('scroll', resetTimeout)
    window.addEventListener('click', resetTimeout)
    resetTimeout()

    return () => {
      clearTimeout(timeout)
      window.removeEventListener('mousemove', resetTimeout)
      window.removeEventListener('keypress', resetTimeout)
      window.removeEventListener('scroll', resetTimeout)
      window.removeEventListener('click', resetTimeout)
    }
  }, [isAuthenticated, signOut, navigate])

  if (loading || !isAuthenticated) return null

  const handleSignOut = () => {
    signOut()
    navigate('/vendedor/login')
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <ShieldCheck className="h-6 w-6 text-primary mr-2" />
          <span className="font-bold text-white tracking-tight">Tiexpress CRM</span>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-2">
          <Link
            to="/crm"
            className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-colors ${location.pathname === '/crm' ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            to="/crm/leads"
            className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-colors ${location.pathname.startsWith('/crm/leads') ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <Users className="h-4 w-4" />
            Meus Leads
          </Link>
          <Link
            to="/crm/propostas"
            className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-colors ${location.pathname.startsWith('/crm/propostas') ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <FileText className="h-4 w-4" />
            Minhas Propostas
          </Link>
          {user?.role === 'admin' && (
            <Link
              to="/crm/servicos"
              className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-colors ${location.pathname === '/crm/servicos' ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              <Settings className="h-4 w-4" />
              Serviços e Preços
            </Link>
          )}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-sm font-bold text-white">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="text-sm">
              <p className="text-white font-medium">{user?.name || 'Admin'}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <LogOut className="h-4 w-4 mr-2" /> Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="h-16 border-b border-slate-800 flex items-center px-8 bg-slate-950 sticky top-0 z-10">
          <h1 className="text-xl font-semibold text-white">Dashboard Geral</h1>
        </header>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
