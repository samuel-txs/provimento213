import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  getLeadById,
  getChecklistTarefas,
  updateChecklistTarefa,
  createChecklistTarefa,
  getDocumentos,
  uploadDocumento,
  updateLead,
  getNotas,
  addNota,
} from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { getDiagnosticosHistorico } from '@/services/api'
import { QUESTIONS } from '@/lib/questions'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { format } from 'date-fns'
import {
  ArrowLeft,
  Calendar,
  Mail,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Download,
  Loader2,
  Plus,
  Briefcase,
  FileSignature,
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'

export default function LeadDetail() {
  const { id } = useParams()
  const [lead, setLead] = useState<any>(null)
  const [checklist, setChecklist] = useState<any[]>([])
  const [documentos, setDocumentos] = useState<any[]>([])
  const [notas, setNotas] = useState<any[]>([])
  const [historico, setHistorico] = useState<any[]>([])
  const [novaNota, setNovaNota] = useState('')
  const [loading, setLoading] = useState(true)
  const [compareIdx1, setCompareIdx1] = useState<string>('')
  const [compareIdx2, setCompareIdx2] = useState<string>('')
  const { user } = useAuth()

  // New task state
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskCategory, setNewTaskCategory] = useState('Infraestrutura')

  // File upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadType, setUploadType] = useState('laudo')

  const fetchData = async () => {
    if (!id) return
    try {
      const [leadData, tasksData, docsData, notasData, histData] = await Promise.all([
        getLeadById(id),
        getChecklistTarefas(id),
        getDocumentos(id),
        getNotas(id),
        getDiagnosticosHistorico(id),
      ])
      setLead(leadData)
      setChecklist(tasksData)
      setDocumentos(docsData)
      setNotas(notasData)
      setHistorico(histData)
    } catch (err) {
      toast({ title: 'Erro ao carregar dados', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [id])

  const handleToggleTask = async (taskId: string, current: boolean) => {
    try {
      await updateChecklistTarefa(taskId, { concluido: !current })
      setChecklist((prev) => prev.map((t) => (t.id === taskId ? { ...t, concluido: !current } : t)))
    } catch (err) {
      toast({ title: 'Erro ao atualizar tarefa', variant: 'destructive' })
    }
  }

  const handleAddTask = async () => {
    if (!newTaskTitle) return
    try {
      const task = await createChecklistTarefa({
        lead_id: id,
        titulo: newTaskTitle,
        categoria: newTaskCategory,
        concluido: false,
      })
      setChecklist([...checklist, task])
      setNewTaskTitle('')
      toast({ title: 'Tarefa adicionada' })
    } catch (err) {
      toast({ title: 'Erro ao criar tarefa', variant: 'destructive' })
    }
  }

  const handleUpload = async () => {
    if (!uploadFile || !id) return
    try {
      const formData = new FormData()
      formData.append('lead_id', id)
      formData.append('nome', uploadFile.name)
      formData.append('tipo', uploadType)
      formData.append('arquivo', uploadFile)

      const doc = await uploadDocumento(formData)
      setDocumentos([...documentos, doc])
      setUploadFile(null)
      toast({ title: 'Documento enviado' })
    } catch (err) {
      toast({ title: 'Erro ao enviar documento', variant: 'destructive' })
    }
  }

  const handleGenerateDefaultChecklist = async () => {
    try {
      const tasks = [
        { titulo: 'Instalar Firewall Corporativo', categoria: 'Infraestrutura' },
        { titulo: 'Configurar Rotina de Backup Cloud', categoria: 'Segurança' },
        { titulo: 'Renovar Certificados Digitais', categoria: 'Conformidade' },
        { titulo: 'Atualizar Sistemas Operacionais (EOL)', categoria: 'Infraestrutura' },
      ]
      if (lead.score <= 70) {
        tasks.push({ titulo: 'Contratar Consultoria Diagnóstica', categoria: 'Gestão' })
      }

      for (const t of tasks) {
        await createChecklistTarefa({
          lead_id: id,
          titulo: t.titulo,
          categoria: t.categoria,
          concluido: false,
        })
      }
      fetchData()
      toast({ title: 'Checklist padrão gerado' })
    } catch (err) {
      toast({ title: 'Erro', variant: 'destructive' })
    }
  }

  const handleUpdateReceita = async (val: string) => {
    if (!id) return
    const num = parseFloat(val)
    if (isNaN(num)) return
    try {
      await updateLead(id, { receita_potencial: num })
      setLead({ ...lead, receita_potencial: num })
      toast({ title: 'Receita atualizada' })
    } catch (err) {
      toast({ title: 'Erro', variant: 'destructive' })
    }
  }

  const handleAddNota = async () => {
    if (!novaNota.trim() || !id || !user) return
    try {
      const nota = await addNota({ lead_id: id, vendedor_id: user.id, conteudo: novaNota })
      setNotas([{ ...nota, expand: { vendedor_id: user } }, ...notas])
      setNovaNota('')
      toast({ title: 'Nota adicionada' })
    } catch (err) {
      toast({ title: 'Erro ao adicionar nota', variant: 'destructive' })
    }
  }

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  if (!lead) return <div>Lead não encontrado.</div>

  const getFileUrl = (doc: any) => {
    return `${pb.baseUrl}/api/files/documentos_cartorio/${doc.id}/${doc.arquivo}`
  }

  const getComplianceLevel = (score: number) => {
    if (score >= 91) return { label: 'Excelente', color: 'bg-emerald-500/20 text-emerald-400' }
    if (score >= 71) return { label: 'Adequado', color: 'bg-blue-500/20 text-blue-400' }
    if (score >= 41) return { label: 'Atenção', color: 'bg-amber-500/20 text-amber-400' }
    return { label: 'Crítico', color: 'bg-red-500/20 text-red-400' }
  }

  const EolMatrix = () => (
    <div className="grid grid-cols-2 gap-4 mt-4">
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-slate-300">Hardware EOL</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-slate-400">
            <li className="flex justify-between border-b border-slate-800 pb-1">
              <span>Servidores Legados</span>
              <Badge variant="destructive">Crítico</Badge>
            </li>
            <li className="flex justify-between pb-1">
              <span>Roteadores Antigos</span>
              <Badge className="bg-amber-500/20 text-amber-500 hover:bg-amber-500/30">
                Atenção
              </Badge>
            </li>
          </ul>
        </CardContent>
      </Card>
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-slate-300">Software EOL</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-slate-400">
            <li className="flex justify-between border-b border-slate-800 pb-1">
              <span>Windows Server 2012</span>
              <Badge variant="destructive">Substituir</Badge>
            </li>
            <li className="flex justify-between pb-1">
              <span>SGBD Legado</span>
              <Badge className="bg-amber-500/20 text-amber-500 hover:bg-amber-500/30">
                Atualizar
              </Badge>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild className="p-0 hover:bg-transparent">
          <Link to="/crm/leads">
            <ArrowLeft className="h-5 w-5 mr-2" /> Voltar aos Leads
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Detalhes do Lead</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 bg-slate-900 border-slate-800 text-white">
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{lead.cartorio}</CardTitle>
              <CardDescription className="text-slate-400 mt-1">
                Contato: {lead.nome}
              </CardDescription>
            </div>
            <Badge
              className={
                lead.status === 'novo'
                  ? 'bg-blue-500/20 text-blue-400'
                  : lead.status === 'contatado'
                    ? 'bg-amber-500/20 text-amber-400'
                    : lead.status === 'negociando'
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'bg-emerald-500/20 text-emerald-400'
              }
            >
              {lead.status.toUpperCase()}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-4 border-b border-slate-800 pb-6">
              <Button asChild className="flex-1 bg-primary hover:bg-primary/90">
                <Link to="/crm/propostas">
                  <FileText className="h-4 w-4 mr-2" /> Criar Proposta
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="flex-1 border-slate-700 text-slate-800 hover:text-slate-900 bg-white"
              >
                <a
                  href="https://calendar.google.com/calendar/r/eventedit"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Calendar className="h-4 w-4 mr-2" /> Agendar Reunião
                </a>
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm text-slate-300">
              <div>
                <span className="text-slate-500 block mb-1">Email</span>
                {lead.email}
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Telefone</span>
                {lead.telefone}
              </div>
              <div>
                <span className="text-slate-500 block mb-1">CNPJ</span>
                {lead.cnpj}
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Data de Criação</span>
                {format(new Date(lead.created), 'dd/MM/yyyy HH:mm')}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader>
            <CardTitle className="text-lg">Inteligência Comercial</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-950 p-4 rounded-lg flex items-center justify-between border border-slate-800">
              <div>
                <div className="text-slate-500 text-sm mb-1">Score Diagnóstico</div>
                <div
                  className={`text-2xl font-bold ${lead.score >= 71 ? 'text-emerald-400' : lead.score >= 41 ? 'text-amber-400' : 'text-red-400'}`}
                >
                  {lead.score || 0}%
                </div>
              </div>
              <Briefcase className="h-8 w-8 text-slate-700" />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-400">Receita Potencial (R$)</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  defaultValue={lead.receita_potencial || ''}
                  onBlur={(e) => handleUpdateReceita(e.target.value)}
                  className="bg-slate-950 border-slate-700 text-white"
                  placeholder="0.00"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-slate-900 border border-slate-800">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400"
          >
            Resumo & EOL
          </TabsTrigger>
          <TabsTrigger
            value="timeline"
            className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400"
          >
            Timeline & Notas
          </TabsTrigger>
          <TabsTrigger
            value="checklist"
            className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400"
          >
            Checklist de Implementação
          </TabsTrigger>
          <TabsTrigger
            value="documentos"
            className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400"
          >
            Documentos
          </TabsTrigger>
          <TabsTrigger
            value="evolucao"
            className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400"
          >
            Evolução
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card className="bg-slate-900 border-slate-800 text-white">
            <CardHeader>
              <CardTitle>Matriz EOL (End of Life)</CardTitle>
              <CardDescription className="text-slate-400">
                Análise de obsolescência com base no diagnóstico do Provimento 213.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EolMatrix />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="mt-4">
          <Card className="bg-slate-900 border-slate-800 text-white">
            <CardHeader>
              <CardTitle>Histórico de Interações</CardTitle>
              <CardDescription className="text-slate-400">
                Notas, contatos e propostas enviadas para este lead.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                <div className="flex gap-2">
                  <Input
                    value={novaNota}
                    onChange={(e) => setNovaNota(e.target.value)}
                    placeholder="Adicionar uma nova nota..."
                    className="bg-slate-950 border-slate-700 text-white flex-1"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddNota()}
                  />
                  <Button onClick={handleAddNota} variant="secondary">
                    Adicionar
                  </Button>
                </div>
              </div>

              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-800 before:to-transparent">
                {notas.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4 relative z-10">
                    Nenhum histórico registrado.
                  </p>
                ) : (
                  notas.map((nota) => (
                    <div
                      key={nota.id}
                      className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-800 bg-slate-900 group-[.is-active]:bg-primary group-[.is-active]:border-primary shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10 text-white">
                        <FileSignature className="h-4 w-4" />
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-lg bg-slate-950 border border-slate-800 shadow relative z-10">
                        <div className="flex items-center justify-between space-x-2 mb-1">
                          <div className="font-bold text-slate-200 text-sm">
                            {nota.expand?.vendedor_id?.name || 'Vendedor'}
                          </div>
                          <time className="text-xs text-slate-500">
                            {format(new Date(nota.created), 'dd/MM HH:mm')}
                          </time>
                        </div>
                        <div className="text-slate-400 text-sm whitespace-pre-wrap">
                          {nota.conteudo}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checklist" className="mt-4">
          <Card className="bg-slate-900 border-slate-800 text-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Roadmap de Implementação</CardTitle>
                <CardDescription className="text-slate-400">
                  Acompanhamento das tarefas de adequação técnica.
                </CardDescription>
              </div>
              {checklist.length === 0 && (
                <Button onClick={handleGenerateDefaultChecklist} size="sm" variant="secondary">
                  Gerar Checklist Padrão
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {checklist.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800"
                  >
                    <Checkbox
                      checked={task.concluido}
                      onCheckedChange={() => handleToggleTask(task.id, task.concluido)}
                      className="border-slate-600 data-[state=checked]:bg-emerald-500 data-[state=checked]:text-white"
                    />
                    <div className="flex-1">
                      <p
                        className={`text-sm ${task.concluido ? 'line-through text-slate-500' : 'text-slate-200'}`}
                      >
                        {task.titulo}
                      </p>
                      <p className="text-xs text-slate-500">{task.categoria}</p>
                    </div>
                  </div>
                ))}

                <div className="flex gap-2 pt-4 border-t border-slate-800 mt-4">
                  <Input
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Nova tarefa..."
                    className="flex-1 bg-slate-950 border-slate-700 text-white"
                  />
                  <Select value={newTaskCategory} onValueChange={setNewTaskCategory}>
                    <SelectTrigger className="w-[150px] bg-slate-950 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Infraestrutura">Infraestrutura</SelectItem>
                      <SelectItem value="Segurança">Segurança</SelectItem>
                      <SelectItem value="Conformidade">Conformidade</SelectItem>
                      <SelectItem value="Gestão">Gestão</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleAddTask} variant="secondary">
                    Adicionar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentos" className="mt-4">
          <Card className="bg-slate-900 border-slate-800 text-white">
            <CardHeader>
              <CardTitle>Repositório de Documentos</CardTitle>
              <CardDescription className="text-slate-400">
                Laudos, certificados, contratos e auditorias associados a este cartório.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-sm font-semibold text-slate-300 mb-4">Arquivos Enviados</h4>
                  {documentos.length === 0 ? (
                    <p className="text-sm text-slate-500">Nenhum documento encontrado.</p>
                  ) : (
                    <div className="space-y-3">
                      {documentos.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-primary" />
                            <div>
                              <p className="text-sm font-medium text-slate-200">{doc.nome}</p>
                              <Badge
                                variant="outline"
                                className="mt-1 text-[10px] border-slate-700 text-slate-300"
                              >
                                {doc.tipo.toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            asChild
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-slate-400 hover:text-white"
                          >
                            <a
                              href={getFileUrl(doc)}
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 h-fit">
                  <h4 className="text-sm font-semibold text-slate-300 mb-4">Novo Documento</h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-slate-400">Tipo de Documento</Label>
                      <Select value={uploadType} onValueChange={setUploadType}>
                        <SelectTrigger className="w-full bg-slate-900 border-slate-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="laudo">Laudo Técnico</SelectItem>
                          <SelectItem value="certificado">Certificado</SelectItem>
                          <SelectItem value="contrato">Contrato</SelectItem>
                          <SelectItem value="auditoria">Auditoria</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-400">Arquivo</Label>
                      <Input
                        type="file"
                        onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                        className="bg-slate-900 border-slate-700 cursor-pointer file:text-white text-slate-300"
                      />
                    </div>
                    <Button onClick={handleUpload} disabled={!uploadFile} className="w-full">
                      <Upload className="h-4 w-4 mr-2" /> Enviar Arquivo
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="evolucao" className="mt-4">
          <Card className="bg-slate-900 border-slate-800 text-white">
            <CardHeader>
              <CardTitle>Histórico de Diagnósticos</CardTitle>
              <CardDescription className="text-slate-400">
                Acompanhe a evolução do score ao longo do tempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              {historico.length > 0 ? (
                <>
                  <div className="h-[300px] w-full mb-8">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={historico.map((h) => ({
                          date: format(new Date(h.data_diagnostico), 'dd/MM/yy'),
                          score: h.score_total,
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="date" stroke="#64748b" />
                        <YAxis stroke="#64748b" domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            borderColor: '#1e293b',
                            color: '#fff',
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="score"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-8 border-t border-slate-800 pt-8">
                    <h4 className="text-lg font-semibold mb-4 text-slate-200">
                      Comparar Diagnósticos
                    </h4>
                    {historico.length >= 2 ? (
                      <div className="space-y-4">
                        <div className="flex gap-4">
                          <Select value={compareIdx1} onValueChange={setCompareIdx1}>
                            <SelectTrigger className="w-1/2 bg-slate-950 border-slate-700 text-white">
                              <SelectValue placeholder="Selecione o Diagnóstico 1" />
                            </SelectTrigger>
                            <SelectContent>
                              {historico.map((h, idx) => (
                                <SelectItem key={h.id} value={idx.toString()}>
                                  {format(new Date(h.data_diagnostico), 'dd/MM/yy HH:mm')} -{' '}
                                  {h.score_total}%
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select value={compareIdx2} onValueChange={setCompareIdx2}>
                            <SelectTrigger className="w-1/2 bg-slate-950 border-slate-700 text-white">
                              <SelectValue placeholder="Selecione o Diagnóstico 2" />
                            </SelectTrigger>
                            <SelectContent>
                              {historico.map((h, idx) => (
                                <SelectItem key={h.id} value={idx.toString()}>
                                  {format(new Date(h.data_diagnostico), 'dd/MM/yy HH:mm')} -{' '}
                                  {h.score_total}%
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {compareIdx1 && compareIdx2 && (
                          <div className="mt-4 bg-slate-950 rounded-lg border border-slate-800 overflow-hidden">
                            <table className="w-full text-sm text-left">
                              <thead className="bg-slate-900 border-b border-slate-800 text-slate-300">
                                <tr>
                                  <th className="p-3">Critério / Pergunta</th>
                                  <th className="p-3">Diag 1</th>
                                  <th className="p-3">Diag 2</th>
                                  <th className="p-3 text-center">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-800/50">
                                {QUESTIONS.map((q) => {
                                  const r1 =
                                    historico[parseInt(compareIdx1)]?.respostas_json?.[q.id]
                                  const r2 =
                                    historico[parseInt(compareIdx2)]?.respostas_json?.[q.id]
                                  if (!r1 && !r2) return null

                                  const getAnswerLabel = (v: string) =>
                                    v === 'sim'
                                      ? 'Sim'
                                      : v === 'nao'
                                        ? 'Não'
                                        : v === 'parcial'
                                          ? 'Parcial'
                                          : 'Não sei'
                                  const isBetter =
                                    (r1 !== 'sim' && r2 === 'sim') ||
                                    (r1 === 'nao' && r2 === 'parcial')
                                  const isWorse =
                                    (r1 === 'sim' && r2 !== 'sim') ||
                                    (r1 === 'parcial' && r2 === 'nao')

                                  return (
                                    <tr key={q.id}>
                                      <td
                                        className="p-3 text-slate-300 max-w-[200px] truncate"
                                        title={q.text}
                                      >
                                        {q.text}
                                      </td>
                                      <td className="p-3 text-slate-400">{getAnswerLabel(r1)}</td>
                                      <td className="p-3 text-slate-400">{getAnswerLabel(r2)}</td>
                                      <td className="p-3 text-center">
                                        {isBetter ? (
                                          <Badge className="bg-emerald-500/20 text-emerald-400">
                                            Melhorou
                                          </Badge>
                                        ) : isWorse ? (
                                          <Badge className="bg-red-500/20 text-red-400">
                                            Piorou
                                          </Badge>
                                        ) : (
                                          <span className="text-slate-600">-</span>
                                        )}
                                      </td>
                                    </tr>
                                  )
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">
                        São necessários pelo menos 2 diagnósticos para comparar.
                      </p>
                    )}
                  </div>

                  <h4 className="text-lg font-semibold mb-4 mt-8 text-slate-200">
                    Registro de Avaliações
                  </h4>
                  <div className="space-y-4">
                    {historico.map((h, i) => {
                      const prev = i > 0 ? historico[i - 1] : null
                      const diff = prev ? h.score_total - prev.score_total : 0
                      return (
                        <div
                          key={h.id}
                          className="flex items-center justify-between p-4 bg-slate-950 rounded-lg border border-slate-800"
                        >
                          <div>
                            <p className="font-semibold text-slate-200">
                              {format(new Date(h.data_diagnostico), 'dd/MM/yyyy HH:mm')}
                            </p>
                            <Badge className={`mt-1 ${getComplianceLevel(h.score_total).color}`}>
                              {getComplianceLevel(h.score_total).label}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">{h.score_total}%</p>
                            {prev && (
                              <p
                                className={`text-sm ${diff >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
                              >
                                {diff >= 0 ? '+' : ''}
                                {diff}% vs anterior
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-500 py-8 text-center">
                  Nenhum histórico de diagnóstico encontrado.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
