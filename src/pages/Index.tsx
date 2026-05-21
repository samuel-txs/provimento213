import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  ShieldAlert,
  Server,
  Lock,
  Activity,
  CheckCircle2,
  ArrowRight,
  FileText,
} from 'lucide-react'

export default function Index() {
  return (
    <div className="flex flex-col animate-fade-in">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden bg-primary/5">
        <div className="absolute inset-0 z-0 bg-grid-slate-200/[0.04] bg-[size:32px_32px]"></div>
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent to-background"></div>

        <div className="container relative z-10 mx-auto px-4 text-center max-w-4xl animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 rounded-full bg-secondary/10 text-secondary font-medium text-sm border border-secondary/20 shadow-sm">
            <ShieldAlert className="h-4 w-4" />
            Prazo de adequação em vigor
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
            Sua serventia em conformidade com o{' '}
            <span className="text-primary">Provimento 213 do CNJ.</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Realize agora um diagnóstico gratuito da sua infraestrutura de TI e evite sanções.
            Rapidez, segurança e adequação total às normas do Conselho Nacional de Justiça.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              asChild
              className="w-full sm:w-auto text-base rounded-full px-8 shadow-elevation h-14"
            >
              <Link to="/checklist">
                Iniciar Diagnóstico Gratuito
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto text-base rounded-full px-8 h-14 bg-white hover:bg-slate-50"
            >
              Falar com Especialista
            </Button>
          </div>
        </div>

        {/* Hero Image / Illustration */}
        <div
          className="container relative z-10 mx-auto px-4 mt-16 animate-slide-up"
          style={{ animationDelay: '0.2s' }}
        >
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border bg-white aspect-[21/9] max-w-5xl mx-auto flex items-center justify-center">
            <img
              src="https://img.usecurling.com/p/1200/500?q=server%20room&color=blue"
              alt="Infraestrutura de TI segura"
              className="object-cover w-full h-full opacity-90 hover:scale-105 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex items-end p-8">
              <div className="bg-white/90 backdrop-blur rounded-xl p-4 shadow-lg flex items-center gap-4 animate-float">
                <div className="bg-green-100 p-2 rounded-full">
                  <CheckCircle2 className="text-green-600 h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Análise Concluída</p>
                  <p className="text-xs text-slate-600">Serventia 100% adequada ao CNJ</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Context Section */}
      <section id="provimento" className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">O que é o Provimento 213?</h2>
            <p className="text-lg text-slate-600">
              O Provimento nº 213 do CNJ estabelece os requisitos mínimos de segurança da informação
              e infraestrutura tecnológica para os serviços notariais e de registro de todo o
              Brasil, garantindo a proteção e integridade dos dados dos cidadãos.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Activity,
                title: 'Redundância de Links',
                desc: 'Exigência de múltiplos links de internet de diferentes provedores.',
              },
              {
                icon: FileText,
                title: 'Backup Seguro',
                desc: 'Rotinas rigorosas de backup local e em nuvem, com testes periódicos de restore.',
              },
              {
                icon: Lock,
                title: 'Segurança de Perímetro',
                desc: 'Uso obrigatório de firewalls, controle de acesso e VPN para trabalho remoto.',
              },
              {
                icon: Server,
                title: 'Infraestrutura Elétrica',
                desc: 'Estabilidade energética com uso de no-breaks dimensionados para os servidores.',
              },
              {
                icon: ShieldAlert,
                title: 'Monitoramento',
                desc: 'Gestão de logs e proteção avançada com antivírus (Endpoint) em todas as máquinas.',
              },
              {
                icon: CheckCircle2,
                title: 'Compliance',
                desc: 'Adequação legal evita multas, paralisação dos serviços e perda da delegação.',
              },
            ].map((feature, i) => (
              <Card
                key={i}
                className="border-none shadow-subtle hover:shadow-elevation transition-shadow duration-300 group"
              >
                <CardContent className="p-8">
                  <div className="bg-primary/5 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    <feature.icon className="h-7 w-7 text-primary group-hover:text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & CTA Section */}
      <section id="beneficios" className="py-24 bg-slate-900 text-white">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Não corra riscos desnecessários.</h2>
          <p className="text-lg text-slate-300 mb-10">
            Descubra em menos de 5 minutos o nível de adequação tecnológica do seu cartório e receba
            um relatório com as ações necessárias para atingir a conformidade total.
          </p>
          <Button
            size="lg"
            asChild
            className="rounded-full px-10 h-14 text-lg bg-secondary hover:bg-secondary/90 text-white shadow-lg shadow-secondary/25 border-none"
          >
            <Link to="/checklist">Começar Meu Diagnóstico Agora</Link>
          </Button>
          <p className="text-sm text-slate-400 mt-6 flex items-center justify-center gap-2">
            <Lock className="h-4 w-4" /> Seus dados estão 100% seguros e não serão compartilhados.
          </p>
        </div>
      </section>
    </div>
  )
}
