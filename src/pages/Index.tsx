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
import logoBranca from '@/assets/icone-monobranca-ti-express-5de1a.png'

export default function Index() {
  const navigate = useNavigate()
  const { setLeadData, leadData } = useChecklist()
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      const lead = await upsertLead({
        ...formData,
        status: 'novo',
      })

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
    <div className="flex flex-col min-h-screen bg-[#041024] text-slate-50 font-sans font-light">
      {/* Hero Section */}
      <section className="relative pt-32 pb-28 overflow-hidden flex flex-col items-center justify-center min-h-[75vh]">
        {/* Background gradient effect - Institutional CNJ style */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0D284C] via-[#041024] to-[#041024]" />

        <div className="container px-4 mx-auto text-center relative z-10">
          <div className="mb-12 flex flex-col items-center justify-center animate-fade-in-up">
            <img src={logoBranca} alt="Tiexpress" className="h-12 mb-3 opacity-90" />
            <span className="text-[#89A3C2] text-sm tracking-[0.2em] font-medium uppercase">
              Expresse seu negócio
            </span>
          </div>

          <div
            className="max-w-4xl mx-auto space-y-10 animate-fade-in-up"
            style={{ animationDelay: '0.1s' }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0B203D]/60 text-[#A0C0E5] font-medium text-sm border border-[#153055]/80 shadow-sm backdrop-blur-sm">
              <ShieldCheck className="h-5 w-5 text-orange-500" />
              <span>Adequação Regulatória CNJ</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium text-white tracking-tight leading-tight">
              Provimento CNJ 213/2026: sua serventia está em conformidade?
            </h1>

            <p className="text-lg md:text-xl text-[#89A3C2] font-light leading-relaxed max-w-3xl mx-auto">
              Novos padrões de tecnologia e segurança da informação para cartórios. Etapas
              sequenciais e cumulativas. Prazo regulatório em vigor.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-6">
              <Button
                size="lg"
                onClick={scrollToDiagnostico}
                className="w-full sm:w-auto h-14 px-8 text-base font-medium bg-orange-600 hover:bg-orange-700 text-white rounded-md shadow-lg shadow-orange-600/20 transition-all"
              >
                Fazer Diagnóstico Gratuito
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="w-full sm:w-auto h-14 px-8 text-base font-medium border-[#153055] bg-transparent text-[#A0C0E5] hover:bg-[#0B203D] hover:text-white"
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

      {/* Institutional Divider */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent relative z-20" />

      {/* Alert Banner */}
      <section className="bg-red-700/95 text-white py-5 relative z-20 shadow-lg border-y border-red-600/50">
        <div className="container px-4 mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm md:text-base font-normal">
          <div className="flex items-start md:items-center gap-3">
            <AlertTriangle className="h-6 w-6 shrink-0 text-red-200" />
            <p className="leading-snug">
              Atenção: o Provimento 213/2026 revoga o Provimento 74. As etapas de conformidade são
              sequenciais — a Etapa 2 só pode ser declarada após 100% da Etapa 1.
            </p>
          </div>
          <div className="flex items-center gap-2 font-medium bg-black/20 px-5 py-2.5 rounded-full shrink-0 whitespace-nowrap">
            <Clock className="h-4 w-4 text-red-200" />
            <span>Prazo de adequação em vigor — não perca a jornada de conformidade</span>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section id="diagnostico" className="py-32 bg-[#020815] relative">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="lg:w-1/2 space-y-10 animate-fade-in-up">
              <h2 className="text-3xl lg:text-4xl font-medium text-white leading-tight">
                Inicie sua jornada de adequação agora mesmo.
              </h2>
              <p className="text-lg text-[#89A3C2] font-light leading-relaxed">
                Avalie o nível de maturidade da infraestrutura e segurança da informação da sua
                serventia. Descubra os pontos críticos que precisam de adequação imediata.
              </p>
              <ul className="space-y-6">
                {[
                  'Análise de Hardware e Software EOL',
                  'Políticas de Backup e Recuperação',
                  'Proteção de Dados e Firewall',
                  'Relatório detalhado com plano de ação',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-[#A0C0E5] font-light">
                    <CheckCircle2 className="h-6 w-6 text-orange-500 shrink-0" />
                    <span className="text-lg">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="lg:w-1/2 w-full max-w-lg animate-fade-in-up"
              style={{ animationDelay: '0.2s' }}
            >
              <Card className="border-[#153055] bg-[#0A1E3F]/80 backdrop-blur-md shadow-2xl shadow-black/50">
                <CardHeader className="pb-6">
                  <CardTitle className="text-2xl font-medium text-white">
                    Diagnóstico Gratuito
                  </CardTitle>
                  <CardDescription className="text-[#89A3C2] font-light text-base mt-2">
                    Preencha os dados abaixo para iniciar a avaliação da sua serventia.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleStart} className="space-y-5">
                    <div className="space-y-2.5">
                      <label htmlFor="nome" className="text-sm font-medium text-[#A0C0E5]">
                        Nome Completo
                      </label>
                      <Input
                        id="nome"
                        placeholder="Seu nome"
                        value={formData.nome ?? ''}
                        onChange={(e) => handleChange('nome', e.target.value)}
                        required
                        className="h-12 bg-[#041024] border-[#153055] text-white placeholder:text-[#4A6482] focus-visible:ring-orange-500 font-light"
                      />
                    </div>
                    <div className="space-y-2.5">
                      <label htmlFor="email" className="text-sm font-medium text-[#A0C0E5]">
                        E-mail
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="contato@cartorio.com.br"
                        value={formData.email ?? ''}
                        onChange={(e) => handleChange('email', e.target.value)}
                        required
                        className="h-12 bg-[#041024] border-[#153055] text-white placeholder:text-[#4A6482] focus-visible:ring-orange-500 font-light"
                      />
                    </div>
                    <div className="space-y-2.5">
                      <label htmlFor="telefone" className="text-sm font-medium text-[#A0C0E5]">
                        WhatsApp / Telefone
                      </label>
                      <Input
                        id="telefone"
                        placeholder="(00) 00000-0000"
                        value={formData.telefone ?? ''}
                        onChange={(e) => handleChange('telefone', e.target.value)}
                        required
                        className="h-12 bg-[#041024] border-[#153055] text-white placeholder:text-[#4A6482] focus-visible:ring-orange-500 font-light"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2.5">
                        <label htmlFor="cartorio" className="text-sm font-medium text-[#A0C0E5]">
                          Cartório
                        </label>
                        <Input
                          id="cartorio"
                          placeholder="Nome da Serventia"
                          value={formData.cartorio ?? ''}
                          onChange={(e) => handleChange('cartorio', e.target.value)}
                          required
                          className="h-12 bg-[#041024] border-[#153055] text-white placeholder:text-[#4A6482] focus-visible:ring-orange-500 font-light"
                        />
                      </div>
                      <div className="space-y-2.5">
                        <label htmlFor="cnpj" className="text-sm font-medium text-[#A0C0E5]">
                          CNPJ
                        </label>
                        <Input
                          id="cnpj"
                          placeholder="00.000.000/0000-00"
                          value={formData.cnpj ?? ''}
                          onChange={(e) => handleChange('cnpj', e.target.value)}
                          required
                          className="h-12 bg-[#041024] border-[#153055] text-white placeholder:text-[#4A6482] focus-visible:ring-orange-500 font-light"
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full h-14 mt-6 group bg-orange-600 hover:bg-orange-700 text-white font-medium shadow-md shadow-orange-600/20"
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

      {/* Footer / Final Divider */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent" />
      <footer className="bg-[#020815] py-8 text-center text-sm text-[#4A6482] font-light">
        <p>© {new Date().getFullYear()} Tiexpress. Expresse seu negócio.</p>
      </footer>
    </div>
  )
}
