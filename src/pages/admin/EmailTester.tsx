import { useState, useEffect } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Loader2, Send, Eye, RefreshCw, ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

const TEMPLATES = [
  {
    id: 'boas_vindas',
    name: 'Boas-vindas (Pós-diagnóstico)',
    description: 'Enviado após o lead terminar o assessment inicial.',
    html: '<div style="font-family: sans-serif; color: #1f2937;"><h1 style="color: #f97316;">Boas-vindas</h1><p>Este é um e-mail de teste de boas-vindas pós-diagnóstico.</p></div>',
  },
  {
    id: 'resultado',
    name: 'Resultado de Conformidade',
    description: 'Breakdown detalhado do status do Provimento 213.',
    html: '<div style="font-family: sans-serif; color: #1f2937;"><h1 style="color: #f97316;">Resultado</h1><p>Este é um e-mail de teste com seu resultado de conformidade.</p></div>',
  },
  {
    id: 'contato',
    name: 'Contato Recebido',
    description: 'Confirmação enviada quando é solicitado "Falar com Especialista".',
    html: '<div style="font-family: sans-serif; color: #1f2937;"><h1 style="color: #f97316;">Contato</h1><p>Este é um e-mail de teste confirmando o recebimento de contato.</p></div>',
  },
  {
    id: 'proposta',
    name: 'Proposta Enviada',
    description: 'Notificação a respeito da proposta comercial.',
    html: '<div style="font-family: sans-serif; color: #1f2937;"><h1 style="color: #f97316;">Proposta</h1><p>Este é um e-mail de teste de envio de proposta.</p></div>',
  },
  {
    id: 'followup',
    name: 'Follow-up',
    description: 'E-mail automático de reengajamento.',
    html: '<div style="font-family: sans-serif; color: #1f2937;"><h1 style="color: #f97316;">Follow-up</h1><p>Este é um e-mail de teste de follow-up.</p></div>',
  },
]

export default function EmailTester() {
  const { user, isAuthenticated, loading } = useAuth()
  const { toast } = useToast()

  const [targetEmail, setTargetEmail] = useState('')
  const [sending, setSending] = useState<string | null>(null)
  const [logs, setLogs] = useState<any[]>([])
  const [loadingLogs, setLoadingLogs] = useState(false)

  const fetchLogs = async () => {
    setLoadingLogs(true)
    try {
      const records = await pb.collection('logs_email').getList(1, 50, {
        sort: '-created',
      })
      setLogs(records.items)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingLogs(false)
    }
  }

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchLogs()
      setTargetEmail(user.email || '')
    }
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/vendedor/login" replace />
  }

  const handleTestSend = async (templateId: string) => {
    if (!targetEmail || !targetEmail.includes('@')) {
      toast({
        title: 'Atenção',
        description: 'Informe um e-mail de destino válido.',
        variant: 'destructive',
      })
      return
    }

    setSending(templateId)
    try {
      await pb.send('/backend/v1/test-email', {
        method: 'POST',
        body: JSON.stringify({ templateId, targetEmail }),
      })
      toast({ title: 'Sucesso', description: 'E-mail de teste enviado com sucesso.' })
      fetchLogs()
    } catch (err) {
      toast({ title: 'Erro', description: getErrorMessage(err), variant: 'destructive' })
      fetchLogs()
    } finally {
      setSending(null)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 shrink-0"
          >
            <Link to="/admin/dashboard">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-zinc-100">Testador de E-mails</h1>
            <p className="text-zinc-400 mt-2">
              Valide o conteúdo e o envio dos e-mails transacionais do sistema.
            </p>
          </div>
        </div>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100">Configuração Global</CardTitle>
            <CardDescription className="text-zinc-400">
              Defina o endereço que receberá os testes abaixo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-sm space-y-2">
              <Label htmlFor="targetEmail" className="text-zinc-300">
                E-mail de Destino do Teste
              </Label>
              <Input
                id="targetEmail"
                type="email"
                placeholder="seu-email@dominio.com"
                value={targetEmail}
                onChange={(e) => setTargetEmail(e.target.value)}
                className="bg-zinc-950 border-zinc-800 text-zinc-50 placeholder:text-zinc-600 focus-visible:ring-primary"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((tpl) => (
            <Card key={tpl.id} className="bg-zinc-900 border-zinc-800 flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg text-zinc-100">{tpl.name}</CardTitle>
                <CardDescription className="h-10 text-zinc-400">{tpl.description}</CardDescription>
              </CardHeader>
              <CardFooter className="mt-auto flex justify-between gap-2 pt-4 border-t border-zinc-800/50">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-zinc-50 hover:bg-zinc-700"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-50 max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-zinc-100">Preview HTML: {tpl.name}</DialogTitle>
                      <DialogDescription className="text-zinc-400">
                        Como o e-mail será renderizado pelo cliente de e-mail.
                      </DialogDescription>
                    </DialogHeader>
                    <div
                      className="mt-4 p-6 bg-white text-black rounded-md overflow-auto max-h-[60vh] shadow-inner"
                      dangerouslySetInnerHTML={{ __html: tpl.html }}
                    />
                  </DialogContent>
                </Dialog>

                <Button
                  size="sm"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => handleTestSend(tpl.id)}
                  disabled={sending === tpl.id}
                >
                  {sending === tpl.id ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Enviar Teste
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-zinc-100">Logs de Envios Recentes</CardTitle>
              <CardDescription className="text-zinc-400">
                Histórico de testes enviados a partir desta interface
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={fetchLogs}
              disabled={loadingLogs}
              className="bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800"
            >
              <RefreshCw className={cn('w-4 h-4', loadingLogs && 'animate-spin')} />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-zinc-800 overflow-hidden bg-zinc-950">
              <Table>
                <TableHeader className="bg-zinc-900/50">
                  <TableRow className="border-zinc-800 hover:bg-zinc-900/50">
                    <TableHead className="text-zinc-400">Data/Hora</TableHead>
                    <TableHead className="text-zinc-400">Template</TableHead>
                    <TableHead className="text-zinc-400">Destinatário</TableHead>
                    <TableHead className="text-zinc-400">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.length === 0 ? (
                    <TableRow className="border-zinc-800 hover:bg-zinc-900/50">
                      <TableCell colSpan={4} className="text-center text-zinc-500 py-8">
                        Nenhum envio registrado recentemente.
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.map((log) => (
                      <TableRow key={log.id} className="border-zinc-800 hover:bg-zinc-900/50">
                        <TableCell className="text-zinc-300 font-medium">
                          {format(new Date(log.created), 'dd/MM/yyyy HH:mm:ss')}
                        </TableCell>
                        <TableCell className="text-zinc-300">
                          {TEMPLATES.find((t) => t.id === log.template_name)?.name ||
                            log.template_name}
                        </TableCell>
                        <TableCell className="text-zinc-400">{log.destinatario}</TableCell>
                        <TableCell>
                          {log.status === 'sucesso' ? (
                            <Badge
                              variant="outline"
                              className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20"
                            >
                              Sucesso
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20"
                              title={log.erro_detalhe}
                            >
                              Erro
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
