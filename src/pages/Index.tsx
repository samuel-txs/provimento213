import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react'
import { useChecklist } from '@/hooks/use-checklist'

export default function Index() {
  const navigate = useNavigate()
  const { setLeadData } = useChecklist()

  // State initialization fixed to prevent uncontrolled input warnings
  // All state variables linked to input fields are properly initialized with an empty string ("")
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [cartorio, setCartorio] = useState('')
  const [cnpj, setCnpj] = useState('')

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault()
    setLeadData({ nome, email, telefone, cartorio, cnpj })
    navigate('/checklist')
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden flex-1 flex items-center">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 space-y-8 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm">
                <ShieldCheck className="h-4 w-4" />
                <span>Adequação ao Provimento 213 CNJ</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Diagnóstico de Conformidade para <span className="text-primary">Cartórios</span>
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed max-w-lg">
                Avalie o nível de maturidade da infraestrutura e segurança da informação da sua
                serventia. Descubra os pontos críticos que precisam de adequação imediata.
              </p>
              <ul className="space-y-3">
                {[
                  'Análise de Hardware e Software EOL',
                  'Políticas de Backup e Recuperação',
                  'Proteção de Dados e Firewall',
                  'Relatório detalhado com plano de ação',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="lg:w-1/2 w-full max-w-md animate-fade-in-up"
              style={{ animationDelay: '0.2s' }}
            >
              <Card className="border-none shadow-elevation">
                <CardHeader>
                  <CardTitle className="text-2xl">Iniciar Diagnóstico Gratuito</CardTitle>
                  <CardDescription>
                    Preencha os dados abaixo para iniciar a avaliação da sua serventia.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleStart} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="nome" className="text-sm font-medium text-slate-700">
                        Nome Completo
                      </label>
                      <Input
                        id="nome"
                        placeholder="Seu nome"
                        value={nome ?? ''}
                        onChange={(e) => setNome(e.target.value)}
                        required
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-slate-700">
                        E-mail
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="contato@cartorio.com.br"
                        value={email ?? ''}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="telefone" className="text-sm font-medium text-slate-700">
                        WhatsApp / Telefone
                      </label>
                      <Input
                        id="telefone"
                        placeholder="(00) 00000-0000"
                        value={telefone ?? ''}
                        onChange={(e) => setTelefone(e.target.value)}
                        required
                        className="h-11"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="cartorio" className="text-sm font-medium text-slate-700">
                          Cartório
                        </label>
                        <Input
                          id="cartorio"
                          placeholder="Nome da Serventia"
                          value={cartorio ?? ''}
                          onChange={(e) => setCartorio(e.target.value)}
                          required
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="cnpj" className="text-sm font-medium text-slate-700">
                          CNPJ
                        </label>
                        <Input
                          id="cnpj"
                          placeholder="00.000.000/0000-00"
                          value={cnpj ?? ''}
                          onChange={(e) => setCnpj(e.target.value)}
                          required
                          className="h-11"
                        />
                      </div>
                    </div>
                    <Button type="submit" size="lg" className="w-full h-12 mt-2 group">
                      Começar Avaliação
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
