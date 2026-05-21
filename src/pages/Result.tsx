import { useEffect } from 'react'
import { useChecklist } from '@/hooks/use-checklist'
import { Navigate, Link } from 'react-router-dom'
import { GaugeChart } from '@/components/GaugeChart'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { QUESTIONS, CATEGORIES } from '@/lib/questions'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  FileText,
  ArrowLeft,
  Send,
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function Result() {
  const { leadData, score, answers, reset, questions } = useChecklist()

  // Simulate API Call for persistence
  useEffect(() => {
    if (!leadData) return
    console.log('Mock: Saving lead and score to DB...', { leadData, score, answers })
    toast({
      title: 'Diagnóstico Concluído!',
      description: 'Seus resultados foram gerados com sucesso.',
    })
  }, [leadData, score, answers])

  if (!leadData) {
    return <Navigate to="/" replace />
  }

  const getStatus = (s: number) => {
    if (s >= 91)
      return {
        label: 'Excelente',
        color: 'bg-secondary',
        textColor: 'text-secondary',
        icon: CheckCircle2,
        message: 'Sua serventia apresenta um nível excepcional de adequação.',
      }
    if (s >= 71)
      return {
        label: 'Adequado',
        color: 'bg-blue-600',
        textColor: 'text-blue-600',
        icon: CheckCircle2,
        message: 'Bom nível de conformidade, mas alguns pontos podem ser melhorados.',
      }
    if (s >= 41)
      return {
        label: 'Atenção',
        color: 'bg-accent',
        textColor: 'text-accent',
        icon: AlertTriangle,
        message: 'Requer atenção. Há diversos pontos importantes que precisam ser ajustados.',
      }
    return {
      label: 'Crítico',
      color: 'bg-destructive',
      textColor: 'text-destructive',
      icon: XCircle,
      message: 'Risco Alto. Sua infraestrutura necessita de adequação urgente.',
    }
  }

  const status = getStatus(score)
  const StatusIcon = status.icon

  const itemsToImprove = questions.filter(
    (q) => answers[q.id] === 'nao' || answers[q.id] === 'naosei' || answers[q.id] === 'parcial',
  )

  const cats = Array.from(new Set(itemsToImprove.map((i) => i.categoria)))
  const groupedItems = cats.map((cat) => ({
    title: cat,
    items: itemsToImprove.filter((i) => i.categoria === cat),
  }))

  const handleDownloadMock = () => {
    toast({
      title: 'Gerando PDF...',
      description: 'O download iniciará em instantes. (Funcionalidade simulada)',
    })
  }

  return (
    <div className="flex-1 bg-muted/20 py-12 px-4 animate-fade-in">
      <div className="container max-w-4xl mx-auto space-y-8">
        {/* Header Results */}
        <div className="text-center space-y-2 animate-slide-down">
          <h1 className="text-3xl font-bold text-slate-900">Relatório de Conformidade</h1>
          <p className="text-slate-500">
            Serventia: <span className="font-semibold text-slate-700">{leadData.cartorio}</span>
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Score Card */}
          <Card className="border-none shadow-elevation animate-slide-up overflow-hidden">
            <CardHeader className="bg-slate-50 border-b pb-4">
              <CardTitle className="text-center">Índice de Adequação</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 pb-8 flex flex-col items-center">
              <GaugeChart score={score} />

              <div className="mt-8 flex flex-col items-center text-center space-y-3">
                <Badge
                  variant="outline"
                  className={`px-4 py-1.5 text-sm uppercase font-bold border-2 flex items-center gap-2 ${status.textColor} border-current bg-background`}
                >
                  <StatusIcon className="h-4 w-4" />
                  {status.label}
                </Badge>
                <p className="text-slate-600 max-w-[250px]">{status.message}</p>
              </div>
            </CardContent>
          </Card>

          {/* Action Card */}
          <Card
            className="border-none shadow-elevation animate-slide-up"
            style={{ animationDelay: '0.1s' }}
          >
            <CardHeader>
              <CardTitle>Próximos Passos</CardTitle>
              <CardDescription>O que fazer com este resultado?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Button
                  onClick={() => window.print()}
                  variant="outline"
                  className="w-full h-14 justify-start text-left px-6 text-base print:hidden"
                >
                  <Download className="mr-4 h-5 w-5 text-primary" />
                  <div>
                    <div className="font-semibold text-slate-800">Baixar Relatório em PDF</div>
                    <div className="text-xs text-slate-500 font-normal">
                      Guarde para seus registros
                    </div>
                  </div>
                </Button>

                <Button className="w-full h-14 justify-start text-left px-6 text-base bg-emerald-600 hover:bg-emerald-700 text-white print:hidden">
                  <Send className="mr-4 h-5 w-5" />
                  <div>
                    <div className="font-semibold">Falar com Especialista</div>
                    <div className="text-xs opacity-90 font-normal">Tire dúvidas no WhatsApp</div>
                  </div>
                </Button>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800 leading-relaxed">
                  Lembre-se: O não cumprimento integral do Provimento 213 pode acarretar em sanções
                  disciplinares pela Corregedoria.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Advanced EOL Matrix (Printable) */}
        <Card className="border-none shadow-elevation mt-8 animate-slide-up bg-white print:block">
          <CardHeader className="bg-slate-50 border-b print:bg-transparent">
            <CardTitle>Matriz EOL & Adequação</CardTitle>
            <CardDescription>
              Resumo da infraestrutura de Hardware e Software baseada nas respostas do diagnóstico.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-slate-800 mb-3 border-b pb-2">
                  Hardware / Infraestrutura
                </h4>
                <ul className="space-y-2 text-sm">
                  {answers['q_hardware_eol'] === 'nao' ? (
                    <li className="flex justify-between items-center">
                      <span className="text-slate-600">Servidores Legados</span>{' '}
                      <Badge variant="destructive">Crítico</Badge>
                    </li>
                  ) : (
                    <li className="flex justify-between items-center">
                      <span className="text-slate-600">Servidores / Storages</span>{' '}
                      <Badge className="bg-emerald-500 text-white">Adequado</Badge>
                    </li>
                  )}

                  {answers['q_backup'] === 'nao' || answers['q_backup'] === 'parcial' ? (
                    <li className="flex justify-between items-center">
                      <span className="text-slate-600">Solução de Backup</span>{' '}
                      <Badge className="bg-amber-500 text-white">Revisar</Badge>
                    </li>
                  ) : (
                    <li className="flex justify-between items-center">
                      <span className="text-slate-600">Rotinas de Backup</span>{' '}
                      <Badge className="bg-emerald-500 text-white">Adequado</Badge>
                    </li>
                  )}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 mb-3 border-b pb-2">
                  Software / Segurança
                </h4>
                <ul className="space-y-2 text-sm">
                  {answers['q_software_eol'] === 'nao' ? (
                    <li className="flex justify-between items-center">
                      <span className="text-slate-600">
                        Sistemas Operacionais (Ex: Win Server 2012)
                      </span>{' '}
                      <Badge variant="destructive">Substituir</Badge>
                    </li>
                  ) : (
                    <li className="flex justify-between items-center">
                      <span className="text-slate-600">Sistemas Operacionais</span>{' '}
                      <Badge className="bg-emerald-500 text-white">Atualizados</Badge>
                    </li>
                  )}

                  {answers['q_firewall'] === 'nao' ? (
                    <li className="flex justify-between items-center">
                      <span className="text-slate-600">Firewall e Proteção Perimetral</span>{' '}
                      <Badge className="bg-amber-500 text-white">Implementar</Badge>
                    </li>
                  ) : (
                    <li className="flex justify-between items-center">
                      <span className="text-slate-600">Firewall de Borda</span>{' '}
                      <Badge className="bg-emerald-500 text-white">Configurado</Badge>
                    </li>
                  )}
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t">
              <h4 className="font-semibold text-slate-800 mb-4">Timeline Recomendada</h4>
              <div className="flex flex-col md:flex-row gap-4 justify-between relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 md:before:translate-y-6 before:h-full md:before:h-0.5 md:before:w-full before:w-0.5 before:bg-slate-200">
                <div className="relative z-10 flex flex-row md:flex-col items-center gap-4 text-center">
                  <div className="h-10 w-10 rounded-full bg-red-100 text-red-600 font-bold flex items-center justify-center shrink-0 border-2 border-white shadow">
                    1
                  </div>
                  <div className="text-left md:text-center">
                    <h5 className="font-semibold text-slate-800">Urgente (Imediato)</h5>
                    <p className="text-xs text-slate-500 max-w-[150px]">
                      Ativos Críticos EOL (Sem suporte)
                    </p>
                  </div>
                </div>
                <div className="relative z-10 flex flex-row md:flex-col items-center gap-4 text-center">
                  <div className="h-10 w-10 rounded-full bg-amber-100 text-amber-600 font-bold flex items-center justify-center shrink-0 border-2 border-white shadow">
                    2
                  </div>
                  <div className="text-left md:text-center">
                    <h5 className="font-semibold text-slate-800">Curto Prazo (30d)</h5>
                    <p className="text-xs text-slate-500 max-w-[150px]">
                      Políticas, Backup e Antivírus
                    </p>
                  </div>
                </div>
                <div className="relative z-10 flex flex-row md:flex-col items-center gap-4 text-center">
                  <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center shrink-0 border-2 border-white shadow">
                    3
                  </div>
                  <div className="text-left md:text-center">
                    <h5 className="font-semibold text-slate-800">Médio Prazo (90d)</h5>
                    <p className="text-xs text-slate-500 max-w-[150px]">
                      Renovação de Licenças e Treinamento
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Breakdown */}
        {itemsToImprove.length > 0 ? (
          <Card
            className="border-none shadow-elevation mt-8 animate-slide-up print:block"
            style={{ animationDelay: '0.2s' }}
          >
            <CardHeader className="bg-slate-50 border-b">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle>Plano de Ação Sugerido</CardTitle>
              </div>
              <CardDescription>
                Baseado nas suas respostas, aqui estão as recomendações para atingir a conformidade
                total.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Accordion type="multiple" className="w-full space-y-4">
                {groupedItems.map((group, idx) => (
                  <AccordionItem
                    value={`item-${idx}`}
                    key={group.id}
                    className="border rounded-lg px-4 bg-white"
                  >
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-center gap-3 text-left">
                        <div className="bg-primary/10 text-primary font-bold h-8 w-8 rounded-full flex items-center justify-center text-sm shrink-0">
                          {group.items.length}
                        </div>
                        <span className="font-semibold text-slate-800 text-lg">{group.title}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-6 space-y-6">
                      {group.items.map((item) => (
                        <div key={item.id} className="pl-11 relative">
                          {/* Timeline dot */}
                          <div className="absolute left-4 top-2 h-2 w-2 rounded-full bg-accent" />
                          <div className="absolute left-[19px] top-4 bottom-[-16px] w-px bg-border last:hidden" />

                          <div className="mb-2">
                            <span className="text-sm font-medium text-slate-500 block mb-1">
                              Requisito:
                            </span>
                            <p className="text-slate-800">{item.texto_pergunta}</p>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-md border-l-4 border-l-primary mt-2">
                            <span className="text-sm font-semibold text-primary block mb-1">
                              Recomendação:
                            </span>
                            <p className="text-sm text-slate-700">
                              Verifique esta exigência e implemente as medidas necessárias para
                              garantir a conformidade técnica, entrando em contato com especialistas
                              se necessário.
                            </p>
                          </div>
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-none shadow-elevation bg-secondary/10 border border-secondary/20 mt-8 animate-slide-up">
            <CardContent className="pt-6 pb-6 flex flex-col items-center text-center">
              <div className="bg-secondary p-3 rounded-full mb-4">
                <CheckCircle2 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Parabéns!</h3>
              <p className="text-slate-700 max-w-lg">
                Sua serventia atendeu a todos os requisitos básicos listados neste diagnóstico do
                Provimento 213. Continue mantendo suas políticas de segurança atualizadas.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-center pt-8 pb-4 print:hidden">
          <Button
            variant="ghost"
            asChild
            onClick={reset}
            className="text-slate-500 hover:text-slate-800 print:hidden"
          >
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Início
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
