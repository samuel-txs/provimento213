import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ShieldAlert } from 'lucide-react'

export default function AccessDenied() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="mb-8 flex flex-col items-center">
        <ShieldAlert className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-3xl font-bold text-white tracking-tight">Acesso Negado</h1>
        <p className="text-slate-400 mt-2 text-center max-w-md">
          Você não tem permissão para acessar esta área. Esta seção é exclusiva para administradores
          e vendedores da Tiexpress.
        </p>
      </div>
      <Button asChild>
        <Link to="/vendedor/login">Voltar para o Login</Link>
      </Button>
    </div>
  )
}
