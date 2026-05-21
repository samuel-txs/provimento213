import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import logoImg from '@/assets/logo-fundopreto-ti-express-tagline-5e290.png'

export default function VendedorLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)

    if (error) {
      toast({
        title: 'Acesso Negado',
        description: 'E-mail ou senha incorretos.',
        variant: 'destructive',
      })
    } else {
      navigate('/crm')
    }
  }

  const handleForgotPassword = () => {
    toast({
      title: 'Recuperação de Senha',
      description: 'Entre em contato com o administrador do sistema para redefinir sua senha.',
    })
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="mb-8 flex flex-col items-center">
        <img src={logoImg} alt="Provimento 213 TXS" className="h-16 object-contain mb-6" />
        <h1 className="text-2xl font-bold text-white tracking-tight mt-2">Acesso Restrito</h1>
        <p className="text-slate-400 mt-2">Área do Vendedor / CRM</p>
      </div>
      <Card className="w-full max-w-md bg-slate-900 border-slate-800 text-white shadow-2xl">
        <CardHeader>
          <CardTitle className="text-xl text-center">Autenticação Segura</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-300">
                  Senha
                </Label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-primary hover:underline"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Entrar no CRM'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
