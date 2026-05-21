import { useEffect, useState, useMemo } from 'react'
import { getLeads, updateLeadStatus } from '@/services/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { format } from 'date-fns'
import { Edit, Loader2, Eye, TrendingUp, Users, DollarSign, Clock } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { Link } from 'react-router-dom'

type Lead = {
  id: string
  nome: string
  cartorio: string
  score: number
  status: string
  notas: string
  created: string
  email: string
  telefone: string
  receita_potencial?: number
  data_ultima_negociacao?: string
}

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)

  // Edit form state
  const [editStatus, setEditStatus] = useState('')
  const [editNotas, setEditNotas] = useState('')

  const fetchLeads = async () => {
    try {
      const data = await getLeads()
      setLeads(data as any)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads()
  }, [])

  const handleEditClick = (lead: Lead) => {
    setEditingLead(lead)
    setEditStatus(lead.status)
    setEditNotas(lead.notas || '')
  }

  const handleSaveEdit = async () => {
    if (!editingLead) return
    try {
      await updateLeadStatus(editingLead.id, editStatus, editNotas)
      toast({ title: 'Lead atualizado com sucesso' })
      setEditingLead(null)
      fetchLeads()
    } catch (err) {
      toast({ title: 'Erro ao atualizar', variant: 'destructive' })
    }
  }

  const { funnelData, scoreData, metrics } = useMemo(() => {
    const counts = { novo: 0, contatado: 0, negociando: 0, convertido: 0 }
    const scoreBuckets = {
      alto: { total: 0, conv: 0 },
      medio: { total: 0, conv: 0 },
      baixo: { total: 0, conv: 0 },
    }
    let totalReceita = 0
    let totalConvertido = 0

    leads.forEach((l) => {
      if (l.status in counts) counts[l.status as keyof typeof counts]++

      const s = l.score || 0
      const isConv = l.status === 'convertido'
      if (isConv) totalConvertido++

      totalReceita += l.receita_potencial || 0

      if (s >= 71) {
        scoreBuckets.alto.total++
        if (isConv) scoreBuckets.alto.conv++
      } else if (s >= 41) {
        scoreBuckets.medio.total++
        if (isConv) scoreBuckets.medio.conv++
      } else {
        scoreBuckets.baixo.total++
        if (isConv) scoreBuckets.baixo.conv++
      }
    })

    const funnel = [
      { name: 'Novos', count: counts.novo, color: '#3b82f6' },
      { name: 'Contatados', count: counts.contatado, color: '#f59e0b' },
      { name: 'Negociando', count: counts.negociando, color: '#8b5cf6' },
      { name: 'Convertidos', count: counts.convertido, color: '#10b981' },
    ]

    const scores = [
      {
        name: 'Baixo (<40)',
        rate: scoreBuckets.baixo.total
          ? Math.round((scoreBuckets.baixo.conv / scoreBuckets.baixo.total) * 100)
          : 0,
        fill: '#ef4444',
      },
      {
        name: 'Médio (41-70)',
        rate: scoreBuckets.medio.total
          ? Math.round((scoreBuckets.medio.conv / scoreBuckets.medio.total) * 100)
          : 0,
        fill: '#f59e0b',
      },
      {
        name: 'Alto (>70)',
        rate: scoreBuckets.alto.total
          ? Math.round((scoreBuckets.alto.conv / scoreBuckets.alto.total) * 100)
          : 0,
        fill: '#10b981',
      },
    ]

    return {
      funnelData: funnel,
      scoreData: scores,
      metrics: {
        receita: totalReceita,
        taxaGeral: leads.length ? Math.round((totalConvertido / leads.length) * 100) : 0,
        ativos: counts.novo + counts.contatado + counts.negociando,
      },
    }
  }, [leads])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'novo':
        return (
          <Badge className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border-blue-500/30">
            Novo
          </Badge>
        )
      case 'contatado':
        return (
          <Badge className="bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border-amber-500/30">
            Contatado
          </Badge>
        )
      case 'negociando':
        return (
          <Badge className="bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border-purple-500/30">
            Negociando
          </Badge>
        )
      case 'convertido':
        return (
          <Badge className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border-emerald-500/30">
            Convertido
          </Badge>
        )
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
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Users className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Leads Ativos (Pipeline)</p>
              <h3 className="text-2xl font-bold">{metrics.ativos}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-emerald-500/20 rounded-lg">
              <TrendingUp className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Taxa de Conversão Global</p>
              <h3 className="text-2xl font-bold">{metrics.taxaGeral}%</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Receita Potencial (Pipeline)</p>
              <h3 className="text-2xl font-bold">R$ {metrics.receita.toLocaleString('pt-BR')}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Funnel Chart */}
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader>
            <CardTitle className="text-lg">Volume do Funil</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <RechartsTooltip
                    cursor={{ fill: '#1e293b' }}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      color: '#fff',
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={60}>
                    {funnelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Score Conversion Chart */}
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader>
            <CardTitle className="text-lg">Conversão por Score Diagnóstico</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={scoreData}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 40, bottom: 0 }}
                >
                  <XAxis
                    type="number"
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    unit="%"
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <RechartsTooltip
                    cursor={{ fill: '#1e293b' }}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      color: '#fff',
                    }}
                  />
                  <Bar dataKey="rate" radius={[0, 4, 4, 0]} maxBarSize={40}>
                    {scoreData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leads Table */}
      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardHeader>
          <CardTitle className="text-lg">Leads Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="border-slate-800">
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-slate-400">Data</TableHead>
                <TableHead className="text-slate-400">Nome / Cartório</TableHead>
                <TableHead className="text-slate-400">Score</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400 text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.length === 0 && (
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                    Nenhum lead encontrado.
                  </TableCell>
                </TableRow>
              )}
              {leads.map((lead) => (
                <TableRow key={lead.id} className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell className="text-slate-300">
                    {format(new Date(lead.created), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{lead.nome}</div>
                    <div className="text-xs text-slate-500">{lead.cartorio}</div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        'font-bold',
                        lead.score >= 71
                          ? 'text-emerald-400'
                          : lead.score >= 41
                            ? 'text-amber-400'
                            : 'text-red-400',
                      )}
                    >
                      {lead.score}%
                    </span>
                  </TableCell>
                  <TableCell>{getStatusBadge(lead.status)}</TableCell>
                  <TableCell className="text-right flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                      onClick={() => handleEditClick(lead)}
                      title="Edição Rápida"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="h-8 w-8 p-0 text-slate-400 hover:text-primary"
                      title="Ver Detalhes"
                    >
                      <Link to={`/admin/leads/${lead.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Modal (Custom) */}
      {editingLead && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg bg-slate-900 border-slate-700 text-white animate-fade-in-up">
            <CardHeader className="border-b border-slate-800">
              <CardTitle>Editar Lead</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm mb-4 bg-slate-950 p-4 rounded-lg">
                <div>
                  <span className="text-slate-500">Nome:</span> {editingLead.nome}
                </div>
                <div>
                  <span className="text-slate-500">Email:</span> {editingLead.email}
                </div>
                <div>
                  <span className="text-slate-500">Telefone:</span> {editingLead.telefone}
                </div>
                <div>
                  <span className="text-slate-500">Score:</span> {editingLead.score}%
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-400">Status do Lead</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-white outline-none focus:border-primary"
                >
                  <option value="novo">Novo</option>
                  <option value="contatado">Contatado</option>
                  <option value="negociando">Negociando</option>
                  <option value="convertido">Convertido</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-400">Notas Internas</label>
                <textarea
                  value={editNotas}
                  onChange={(e) => setEditNotas(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-white outline-none focus:border-primary resize-none"
                  placeholder="Anotações sobre a negociação..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="ghost"
                  onClick={() => setEditingLead(null)}
                  className="text-slate-400 hover:text-white"
                >
                  Cancelar
                </Button>
                <Button onClick={handleSaveEdit}>Salvar Alterações</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
