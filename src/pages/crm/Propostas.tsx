import { useEffect, useState } from 'react'
import {
  getMinhasPropostas,
  getLeads,
  getServicos,
  getPrecosServicos,
  createProposta,
  sendPropostaEmail,
} from '@/services/api'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { format } from 'date-fns'
import { FileText, Loader2, Plus, Send, Mail } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'

export default function Propostas() {
  const { user } = useAuth()
  const [propostas, setPropostas] = useState<any[]>([])
  const [leads, setLeads] = useState<any[]>([])
  const [servicos, setServicos] = useState<any[]>([])
  const [precos, setPrecos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // New Proposal Form
  const [selectedLead, setSelectedLead] = useState('')
  const [selectedPorte, setSelectedPorte] = useState('Pequeno')
  const [selectedServicos, setSelectedServicos] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return
      try {
        const vendedorId = user.role !== 'admin' ? user.id : undefined
        const [propsData, leadsData, servsData, precosData] = await Promise.all([
          getMinhasPropostas(vendedorId),
          getLeads(vendedorId),
          getServicos(),
          getPrecosServicos(),
        ])
        setPropostas(propsData)
        setLeads(leadsData)
        setServicos(servsData)
        setPrecos(precosData)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user])

  const calculateTotal = () => {
    let total = 0
    selectedServicos.forEach((srvId) => {
      const precoMatch = precos.find((p) => p.servico_id === srvId && p.porte === selectedPorte)
      if (precoMatch && precoMatch.valor_projeto) {
        total += precoMatch.valor_projeto
      }
    })
    return total
  }

  const handleCreateProposta = async () => {
    if (!selectedLead || selectedServicos.length === 0 || !user) {
      toast({ title: 'Preencha os campos obrigatórios', variant: 'destructive' })
      return
    }

    setIsSubmitting(true)
    const valorTotal = calculateTotal()
    const lead = leads.find((l) => l.id === selectedLead)

    try {
      const novaProposta = await createProposta({
        vendedor_id: user.id,
        lead_id: selectedLead,
        servicos: selectedServicos,
        valor_total: valorTotal,
        status: 'Enviada',
      })

      if (lead?.email) {
        await sendPropostaEmail(lead.email, selectedLead)
        toast({ title: 'Proposta gerada e enviada ao cliente!' })
      } else {
        toast({ title: 'Proposta gerada, mas o lead não possui email.' })
      }

      setPropostas([{ ...novaProposta, expand: { lead_id: lead } }, ...propostas])
      setIsModalOpen(false)
      setSelectedLead('')
      setSelectedServicos([])
    } catch (err) {
      toast({ title: 'Erro ao gerar proposta', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Enviada':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Enviada</Badge>
      case 'Visualizada':
        return (
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
            Visualizada
          </Badge>
        )
      case 'Aceita':
        return (
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Aceita</Badge>
        )
      case 'Rejeitada':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Rejeitada</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Minhas Propostas</h2>
          <p className="text-slate-400 text-sm mt-1">
            Gere e envie propostas para seus leads baseadas no diagnóstico.
          </p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Nova Proposta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl bg-slate-900 border-slate-800 text-white max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Gerador de Propostas</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Selecionar Lead</Label>
                <Select value={selectedLead} onValueChange={setSelectedLead}>
                  <SelectTrigger className="w-full bg-slate-950 border-slate-800">
                    <SelectValue placeholder="Selecione o lead..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {leads.map((lead) => (
                      <SelectItem key={lead.id} value={lead.id}>
                        {lead.nome} ({lead.cartorio})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Porte do Cartório</Label>
                <Select value={selectedPorte} onValueChange={setSelectedPorte}>
                  <SelectTrigger className="w-full bg-slate-950 border-slate-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pequeno">Pequeno</SelectItem>
                    <SelectItem value="Médio">Médio</SelectItem>
                    <SelectItem value="Grande">Grande</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-slate-300">Serviços Inclusos na Proposta</Label>
                <div className="grid gap-3 bg-slate-950 p-4 rounded-lg border border-slate-800 max-h-64 overflow-y-auto">
                  {servicos.map((srv) => {
                    const priceMatch = precos.find(
                      (p) => p.servico_id === srv.id && p.porte === selectedPorte,
                    )
                    const priceDisplay = priceMatch?.valor_projeto
                      ? `+ R$ ${priceMatch.valor_projeto.toLocaleString('pt-BR')}`
                      : 'Preço sob consulta'
                    return (
                      <div key={srv.id} className="flex items-start space-x-3">
                        <Checkbox
                          id={`srv-${srv.id}`}
                          checked={selectedServicos.includes(srv.id)}
                          onCheckedChange={(checked) => {
                            if (checked) setSelectedServicos([...selectedServicos, srv.id])
                            else setSelectedServicos(selectedServicos.filter((id) => id !== srv.id))
                          }}
                          className="mt-1 border-slate-600 data-[state=checked]:bg-primary"
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor={`srv-${srv.id}`}
                            className="text-sm font-medium leading-none cursor-pointer text-slate-200"
                          >
                            {srv.nome}
                          </label>
                          <p className="text-xs text-slate-500">{priceDisplay}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex justify-between items-center">
                <span className="text-sm text-primary font-medium">Valor Total Estimado:</span>
                <span className="text-lg font-bold text-white">
                  R$ {calculateTotal().toLocaleString('pt-BR')}
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="ghost"
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400"
                >
                  Cancelar
                </Button>
                <Button onClick={handleCreateProposta} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Gerar e Enviar Email
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="border-slate-800">
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-slate-400">Data</TableHead>
                <TableHead className="text-slate-400">Cliente / Lead</TableHead>
                <TableHead className="text-slate-400">Valor Total</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400 text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {propostas.length === 0 && (
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                    Você ainda não gerou nenhuma proposta.
                  </TableCell>
                </TableRow>
              )}
              {propostas.map((prop) => (
                <TableRow key={prop.id} className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell className="text-slate-300">
                    {format(new Date(prop.created), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-slate-200">{prop.expand?.lead_id?.nome}</div>
                    <div className="text-xs text-slate-500">{prop.expand?.lead_id?.cartorio}</div>
                  </TableCell>
                  <TableCell className="font-medium">
                    R$ {prop.valor_total.toLocaleString('pt-BR')}
                  </TableCell>
                  <TableCell>{getStatusBadge(prop.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                      title="Reenviar E-mail"
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
