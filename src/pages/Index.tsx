import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ShieldCheck, CheckCircle2, ArrowRight, Loader2, AlertTriangle, Clock } from 'lucide-react'
import { useChecklist } from '@/hooks/use-checklist'
import { upsertLead } from '@/services/api'
import { toast } from '@/hooks/use-toast'
import { getErrorMessage } from '@/lib/pocketbase/errors'

export default function Index() {
  const navigate = useNavigate()
  const { setLeadData, leadData } = useChecklist()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // State initialization fixed to prevent uncontrolled input warnings
  // All state variables linked to input fields are properly initialized with an empty string ("")
  const [formData, setFormData] = useState({
    nome: leadData?.nome ?? '',
    email: leadData?.email ?? '',
    telefone: leadData?.telefone ?? '',
    cartorio: leadData?.cartorio ?? '',
    cnpj: leadData?.cnpj ?? '',
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Create/Upsert the lead directly in the database as "novo" before navigating
      const lead = await upsertLead({
        ...formData,
        status: 'novo',
      })

      // Store the persisted DB ID so it can be updated later
      setLeadData({ ...formData, id: lead.id })
      navigate('/checklist')
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro ao iniciar',
        description:
          getErrorMessage(err) || 'Verifique se os dados estão corretos e tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const scrollToDiagnostico = () => {
    document.getElementById('diagnostico')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-50 font-sans">
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden flex flex-col items-center justify-center min-h-[70vh]">
        {/* Background gradient effect */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-900/20 via-slate-950 to-slate-950" />

        <div className="container px-4 mx-auto text-center relative z-10">
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 text-orange-500 font-semibold text-sm border border-orange-500/20">
              <ShieldCheck className="h-5 w-5" />
              <span>Adequação Regulatória CNJ</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
              Provimento CNJ 213/2026: sua serventia está em conformidade?
            </h1>

            <p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-3xl mx-auto">
              Novos padrões de tecnologia e segurança da informação para cartórios. Etapas
              sequenciais e cumulativas. Prazo regulatório em vigor.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button
                size="lg"
                onClick={scrollToDiagnostico}
                className="w-full sm:w-auto h-14 px-8 text-base font-bold bg-orange-600 hover:bg-orange-700 text-white rounded-md shadow-lg shadow-orange-600/20 transition-all"
              >
                Fazer Diagnóstico Gratuito
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="w-full sm:w-auto h-14 px-8 text-base font-bold border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white"
              >
                <a
                  href="https://wa.me/5511999999999?text=Olá,%20gostaria%20de%20falar%20com%20um%20especialista%20sobre%20o%20Provimento%20CNJ%20213"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Falar com Especialista
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Alert Banner */}
      <section className="bg-red-600/90 text-white py-4 relative z-20 shadow-lg border-y border-red-500">
        <div className="container px-4 mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm md:text-base font-medium">
          <div className="flex items-start md:items-center gap-3">
            <AlertTriangle className="h-6 w-6 shrink-0 text-red-200" />
            <p className="leading-snug">
              Atenção: o Provimento 213/2026 revoga o Provimento 74. As etapas de conformidade são
              sequenciais — a Etapa 2 só pode ser declarada após 100% da Etapa 1.
            </p>
          </div>
          <div className="flex items-center gap-2 font-bold bg-black/20 px-4 py-2 rounded-full shrink-0 whitespace-nowrap">
            <Clock className="h-4 w-4 text-red-200" />
            <span>Prazo de adequação em vigor — não perca a jornada de conformidade</span>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section id="diagnostico" className="py-24 bg-slate-900 relative">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 space-y-8 animate-fade-in-up">
              <h2 className="text-3xl lg:text-4xl font-bold text-white leading-tight">
                Inicie sua jornada de adequação agora mesmo.
              </h2>
              <p className="text-lg text-slate-400">
                Avalie o nível de maturidade da infraestrutura e segurança da informação da sua
                serventia. Descubra os pontos críticos que precisam de adequação imediata.
              </p>
              <ul className="space-y-4">
                {[
                  'Análise de Hardware e Software EOL',
                  'Políticas de Backup e Recuperação',
                  'Proteção de Dados e Firewall',
                  'Relatório detalhado com plano de ação',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300 font-medium">
                    <CheckCircle2 className="h-6 w-6 text-orange-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="lg:w-1/2 w-full max-w-lg animate-fade-in-up"
              style={{ animationDelay: '0.2s' }}
            >
              <Card className="border-slate-800 bg-slate-950/50 backdrop-blur-sm shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-2xl text-white">Diagnóstico Gratuito</CardTitle>
                  <CardDescription className="text-slate-400">
                    Preencha os dados abaixo para iniciar a avaliação da sua serventia.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleStart} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="nome" className="text-sm font-medium text-slate-300">
                        Nome Completo
                      </label>
                      <Input
                        id="nome"
                        placeholder="Seu nome"
                        value={formData.nome ?? ''}
                        onChange={(e) => handleChange('nome', e.target.value)}
                        required
                        className="h-11 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-orange-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-slate-300">
                        E-mail
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="contato@cartorio.com.br"
                        value={formData.email ?? ''}
                        onChange={(e) => handleChange('email', e.target.value)}
                        required
                        className="h-11 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-orange-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="telefone" className="text-sm font-medium text-slate-300">
                        WhatsApp / Telefone
                      </label>
                      <Input
                        id="telefone"
                        placeholder="(00) 00000-0000"
                        value={formData.telefone ?? ''}
                        onChange={(e) => handleChange('telefone', e.target.value)}
                        required
                        className="h-11 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-orange-500"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="cartorio" className="text-sm font-medium text-slate-300">
                          Cartório
                        </label>
                        <Input
                          id="cartorio"
                          placeholder="Nome da Serventia"
                          value={formData.cartorio ?? ''}
                          onChange={(e) => handleChange('cartorio', e.target.value)}
                          required
                          className="h-11 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-orange-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="cnpj" className="text-sm font-medium text-slate-300">
                          CNPJ
                        </label>
                        <Input
                          id="cnpj"
                          placeholder="00.000.000/0000-00"
                          value={formData.cnpj ?? ''}
                          onChange={(e) => handleChange('cnpj', e.target.value)}
                          required
                          className="h-11 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-orange-500"
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full h-12 mt-4 group bg-orange-600 hover:bg-orange-700 text-white font-bold"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          Começar Avaliação
                          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
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
