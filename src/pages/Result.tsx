import { useEffect, useState } from 'react'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { QUESTIONS } from '@/lib/questions'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  FileText,
  ArrowLeft,
  Send,
  Building2,
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { upsertLead, sendEmailPdf } from '@/services/api'

export default function Result() {
  const { leadData, score, answers, reset, questions } = useChecklist()
  const [leadId, setLeadId] = useState<string | null>(null)

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cartorio: '',
    cnpj: '',
  })
  const [authorized, setAuthorized] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // API Call for persistence
  useEffect(() => {
    if (!leadData) return

    const saveLead = async () => {
      try {
        const record = await upsertLead({
          nome: leadData.nome,
          email: leadData.email,
          telefone: leadData.telefone,
          cartorio: leadData.cartorio,
          cnpj: leadData.cnpj,
          score: score,
        })
        setLeadId(record.id)
        setFormData({
          nome: record.nome || leadData.nome || '',
          email: record.email || leadData.email || '',
          telefone: record.telefone || leadData.telefone || '',
          cartorio: record.cartorio || leadData.cartorio || '',
          cnpj: record.cnpj || leadData.cnpj || '',
        })
        toast({
          title: 'Diagnóstico Concluído!',
          description: 'Seus resultados foram gerados e salvos com sucesso.',
        })
      } catch (error) {
        console.error('Error saving lead:', error)
      }
    }

    saveLead()
  }, [leadData, score])

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

  const handleDownloadClick = () => {
    setIsModalOpen(true)
  }

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!authorized) {
      toast({
        title: 'Autorização necessária',
        description: 'Por favor, marque a caixa de autorização para continuar.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    try {
      await upsertLead({
        ...formData,
        score,
        notas: 'Lead autorizou contato ao baixar PDF.',
      })

      const htmlContent = `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://img.usecurling.com/i?q=building&shape=solid-black&color=blue" alt="Tiexpress Logo" style="width: 64px; height: 64px; margin-bottom: 10px;" />
            <h1 style="color: #1e293b; margin: 0;">Relatório de Conformidade</h1>
            <h2 style="color: #475569; margin: 5px 0;">Provimento 213 CNJ</h2>
          </div>
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px; border: 1px solid #e2e8f0;">
            <h3 style="margin: 0; color: #64748b; font-size: 16px;">Seu Score de Adequação:</h3>
            <p style="font-size: 36px; font-weight: bold; color: ${
              score >= 71 ? '#059669' : score >= 41 ? '#d97706' : '#dc2626'
            }; margin: 10px 0;">${score}%</p>
          </div>
          <div>
            <h3 style="color: #334155; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; margin-bottom: 15px;">Principais Recomendações:</h3>
            <ul style="padding-left: 20px; color: #475569; margin: 0; line-height: 1.6;">
              ${
                itemsToImprove.length > 0
                  ? itemsToImprove
                      .slice(0, 5)
                      .map(
                        (item) => `
                      <li style="margin-bottom: 12px;">
                        <strong>${item.categoria}:</strong> ${item.recomendacao || QUESTIONS.find((q) => q.id === item.id)?.recommendation || 'Verifique esta exigência e implemente as medidas necessárias.'}
                      </li>
                    `,
                      )
                      .join('') +
                    (itemsToImprove.length > 5
                      ? `<li style="margin-bottom: 12px;"><em>E outras ${itemsToImprove.length - 5} recomendações descritas no seu PDF.</em></li>`
                      : '')
                  : '<li style="margin-bottom: 10px;">Parabéns! Sua serventia demonstrou estar em total conformidade com os requisitos avaliados.</li>'
              }
            </ul>
          </div>
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
            <p style="margin: 0;"><strong>Tiexpress Soluções em TI</strong></p>
            <p style="margin: 4px 0;">Especialistas em adequação ao Provimento 213 CNJ</p>
            <p style="margin: 0;">Contato: (62) 98477-8861 | <a href="https://www.tiexpress.tec.br" style="color: #2563eb; text-decoration: none;">www.tiexpress.tec.br</a></p>
          </div>
        </div>
      `

      try {
        await sendEmailPdf({
          nome: formData.nome,
          email: formData.email,
          cartorio: formData.cartorio,
          score: score,
          recomendacoes: itemsToImprove.slice(0, 10).map((item) => ({
            categoria: item.categoria,
            texto:
              item.recomendacao ||
              QUESTIONS.find((q) => q.id === item.id)?.recommendation ||
              'Verifique esta exigência.',
          })),
        })
        toast({
          title: 'Email enviado com sucesso!',
          description: 'Enviamos uma cópia do relatório para o seu e-mail.',
        })
      } catch (err) {
        console.error('Failed to send email:', err)
        toast({
          title: 'Aviso',
          description: 'O PDF será baixado, mas não foi possível enviar o email no momento.',
          variant: 'destructive',
        })
      }

      setIsModalOpen(false)

      // Give time for modal to close before printing
      setTimeout(() => {
        const originalTitle = document.title
        document.title = `Relatorio_Conformidade_Provimento213_${formData.cartorio.replace(/[^a-zA-Z0-9]/g, '_')}`
        window.print()
        // Restore title after print dialog closes
        setTimeout(() => {
          document.title = originalTitle
        }, 1000)
      }, 500)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Houve um problema ao processar sua requisição.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const printDate = new Date().toLocaleDateString('pt-BR')

  return (
    <div className="flex-1 bg-muted/20 py-12 px-4 animate-fade-in print:bg-white print:py-0">
      <div className="container max-w-4xl mx-auto space-y-8 print:space-y-6">
        {/* PDF Header - Only visible when printing */}
        <div className="hidden print:flex flex-col items-center justify-center border-b pb-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary p-2 rounded-lg">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Tiexpress</h1>
          </div>
          <h2 className="text-xl font-bold text-slate-800">
            Relatório de Conformidade - Provimento 213 CNJ
          </h2>
          <div className="flex flex-col items-center mt-4 text-sm text-slate-600">
            <p>
              <strong>Cartório:</strong> {formData.cartorio || leadData.cartorio}
            </p>
            <p>
              <strong>CNPJ:</strong> {formData.cnpj || leadData.cnpj}
            </p>
            <p>
              <strong>Data de Emissão:</strong> {printDate}
            </p>
          </div>
        </div>

        {/* Header Results (Screen) */}
        <div className="text-center space-y-2 animate-slide-down print:hidden">
          <h1 className="text-3xl font-bold text-slate-900">Relatório de Conformidade</h1>
          <p className="text-slate-500">
            Serventia: <span className="font-semibold text-slate-700">{leadData.cartorio}</span>
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 print:grid-cols-1 print:gap-4">
          {/* Score Card */}
          <Card className="border-none shadow-elevation animate-slide-up overflow-hidden print:shadow-none print:border print:break-inside-avoid">
            <CardHeader className="bg-slate-50 border-b pb-4 print:bg-transparent">
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

          {/* Action Card (Screen only) */}
          <Card
            className="border-none shadow-elevation animate-slide-up print:hidden"
            style={{ animationDelay: '0.1s' }}
          >
            <CardHeader>
              <CardTitle>Próximos Passos</CardTitle>
              <CardDescription>O que fazer com este resultado?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Button
                  onClick={handleDownloadClick}
                  variant="outline"
                  className="w-full h-14 justify-start text-left px-6 text-base"
                >
                  <Download className="mr-4 h-5 w-5 text-primary" />
                  <div>
                    <div className="font-semibold text-slate-800">Baixar Relatório em PDF</div>
                    <div className="text-xs text-slate-500 font-normal">
                      Guarde para seus registros
                    </div>
                  </div>
                </Button>

                <Button
                  className="w-full h-14 justify-start text-left px-6 text-base bg-emerald-600 hover:bg-emerald-700 text-white"
                  asChild
                >
                  <a
                    href={`https://wa.me/5562984778861?text=Olá,%20acabei%20de%20fazer%20o%20diagnóstico%20do%20Provimento%20213%20e%20meu%20score%20foi%20${score}%25.%20Gostaria%20de%20ajuda.`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Send className="mr-4 h-5 w-5" />
                    <div>
                      <div className="font-semibold">Falar com Especialista</div>
                      <div className="text-xs opacity-90 font-normal">Tire dúvidas no WhatsApp</div>
                    </div>
                  </a>
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
        <Card className="border-none shadow-elevation mt-8 animate-slide-up bg-white print:shadow-none print:border print:mt-4 print:break-inside-avoid">
          <CardHeader className="bg-slate-50 border-b print:bg-transparent print:py-3">
            <CardTitle>Matriz EOL & Adequação</CardTitle>
            <CardDescription className="print:hidden">
              Resumo da infraestrutura de Hardware e Software baseada nas respostas do diagnóstico.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 print:pt-4">
            <div className="grid md:grid-cols-2 gap-8 print:gap-4">
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
                      <span className="text-slate-600">Sistemas Operacionais</span>{' '}
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

            <div className="mt-8 pt-6 border-t print:mt-4 print:pt-4">
              <h4 className="font-semibold text-slate-800 mb-4 print:mb-2">Timeline Recomendada</h4>
              <div className="flex flex-col md:flex-row gap-4 justify-between relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 md:before:translate-y-6 before:h-full md:before:h-0.5 md:before:w-full before:w-0.5 before:bg-slate-200 print:before:hidden">
                <div className="relative z-10 flex flex-row md:flex-col items-center gap-4 text-center">
                  <div className="h-10 w-10 rounded-full bg-red-100 text-red-600 font-bold flex items-center justify-center shrink-0 border-2 border-white shadow print:border-red-600">
                    1
                  </div>
                  <div className="text-left md:text-center">
                    <h5 className="font-semibold text-slate-800">Urgente (Imediato)</h5>
                    <p className="text-xs text-slate-500 max-w-[150px] print:max-w-none">
                      Ativos Críticos EOL
                    </p>
                  </div>
                </div>
                <div className="relative z-10 flex flex-row md:flex-col items-center gap-4 text-center">
                  <div className="h-10 w-10 rounded-full bg-amber-100 text-amber-600 font-bold flex items-center justify-center shrink-0 border-2 border-white shadow print:border-amber-600">
                    2
                  </div>
                  <div className="text-left md:text-center">
                    <h5 className="font-semibold text-slate-800">Curto Prazo (30d)</h5>
                    <p className="text-xs text-slate-500 max-w-[150px] print:max-w-none">
                      Políticas, Backup e Antivírus
                    </p>
                  </div>
                </div>
                <div className="relative z-10 flex flex-row md:flex-col items-center gap-4 text-center">
                  <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center shrink-0 border-2 border-white shadow print:border-blue-600">
                    3
                  </div>
                  <div className="text-left md:text-center">
                    <h5 className="font-semibold text-slate-800">Médio Prazo (90d)</h5>
                    <p className="text-xs text-slate-500 max-w-[150px] print:max-w-none">
                      Renovação de Licenças
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
            className="border-none shadow-elevation mt-8 animate-slide-up print:shadow-none print:border print:mt-4"
            style={{ animationDelay: '0.2s' }}
          >
            <CardHeader className="bg-slate-50 border-b print:bg-transparent print:py-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary print:hidden" />
                <CardTitle>Plano de Ação Sugerido</CardTitle>
              </div>
              <CardDescription className="print:hidden">
                Baseado nas suas respostas, aqui estão as recomendações para atingir a conformidade
                total.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 print:pt-4">
              {/* Screen Version (Accordion) */}
              <Accordion type="multiple" className="w-full space-y-4 print:hidden">
                {groupedItems.map((group, idx) => (
                  <AccordionItem
                    value={`item-${idx}`}
                    key={idx}
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
                          <div className="absolute left-4 top-2 h-2 w-2 rounded-full bg-accent" />
                          <div className="absolute left-[19px] top-4 bottom-[-16px] w-px bg-border last:hidden" />

                          <div className="mb-2">
                            <span className="text-sm font-medium text-slate-500 block mb-1">
                              Requisito:
                            </span>
                            <p className="text-slate-800">
                              {item.texto_pergunta || QUESTIONS.find((q) => q.id === item.id)?.text}
                            </p>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-md border-l-4 border-l-primary mt-2">
                            <span className="text-sm font-semibold text-primary block mb-1">
                              Recomendação:
                            </span>
                            <p className="text-sm text-slate-700">
                              {item.recomendacao ||
                                QUESTIONS.find((q) => q.id === item.id)?.recommendation ||
                                'Verifique esta exigência e implemente as medidas necessárias para garantir a conformidade técnica, entrando em contato com especialistas se necessário.'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              {/* Print Version (Expanded) */}
              <div className="hidden print:block w-full space-y-6">
                {groupedItems.map((group, idx) => (
                  <div key={idx} className="bg-white">
                    <div className="py-2 border-b-2 border-slate-800 mb-4">
                      <div className="flex items-center gap-3 text-left">
                        <div className="font-bold h-8 w-8 flex items-center justify-center text-sm shrink-0 border border-primary text-primary rounded-full">
                          {group.items.length}
                        </div>
                        <span className="font-semibold text-slate-800 text-lg">{group.title}</span>
                      </div>
                    </div>
                    <div className="space-y-6">
                      {group.items.map((item) => (
                        <div key={item.id} className="pl-4 mb-4 break-inside-avoid">
                          <div className="mb-2">
                            <span className="text-sm font-medium text-slate-500 block mb-1">
                              Requisito:
                            </span>
                            <p className="text-slate-800 font-medium">
                              {item.texto_pergunta || QUESTIONS.find((q) => q.id === item.id)?.text}
                            </p>
                          </div>
                          <div className="p-4 rounded-md border border-slate-300 mt-2">
                            <span className="text-sm font-semibold text-primary block mb-1">
                              Recomendação:
                            </span>
                            <p className="text-sm text-slate-700">
                              {item.recomendacao ||
                                QUESTIONS.find((q) => q.id === item.id)?.recommendation ||
                                'Verifique esta exigência e implemente as medidas necessárias para garantir a conformidade técnica, entrando em contato com especialistas se necessário.'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-none shadow-elevation bg-secondary/10 border border-secondary/20 mt-8 animate-slide-up print:bg-transparent print:border-secondary">
            <CardContent className="pt-6 pb-6 flex flex-col items-center text-center">
              <div className="bg-secondary p-3 rounded-full mb-4 print:border print:border-secondary print:bg-transparent print:text-secondary">
                <CheckCircle2 className="h-8 w-8 text-white print:text-secondary" />
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
            className="text-slate-500 hover:text-slate-800"
          >
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Início
            </Link>
          </Button>
        </div>

        {/* PDF Footer - Only visible when printing */}
        <div className="hidden print:block mt-12 pt-6 border-t text-center text-sm text-slate-500">
          <p className="font-semibold text-slate-700">Tiexpress Soluções em TI</p>
          <p>Especialistas em adequação ao Provimento 213 CNJ</p>
          <p>Contato: (62) 98477-8861 | www.tiexpress.tec.br</p>
        </div>
      </div>

      {/* Modal / Dialog for Contact Authorization */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleModalSubmit}>
            <DialogHeader>
              <DialogTitle>Baixar Relatório em PDF</DialogTitle>
              <DialogDescription>
                Confirme seus dados para gerar o relatório profissional da sua serventia.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">E-mail Corporativo</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="telefone">WhatsApp / Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cnpj">CNPJ da Serventia</Label>
                  <Input
                    id="cnpj"
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cartorio">Nome da Serventia</Label>
                <Input
                  id="cartorio"
                  value={formData.cartorio}
                  onChange={(e) => setFormData({ ...formData, cartorio: e.target.value })}
                  required
                />
              </div>

              <div className="flex items-start space-x-3 mt-4 bg-muted/50 p-3 rounded-lg border">
                <Checkbox
                  id="authorized"
                  checked={authorized}
                  onCheckedChange={(checked) => setAuthorized(checked as boolean)}
                  className="mt-1"
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="authorized"
                    className="text-sm font-medium leading-tight cursor-pointer"
                  >
                    Autorizo a Tiexpress Soluções a entrar em contato para apresentar soluções de
                    conformidade ao Provimento 213.
                  </Label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting || !authorized}>
                {isSubmitting ? 'Gerando...' : 'Confirmar e Baixar PDF'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
