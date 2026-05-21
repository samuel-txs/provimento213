import { useEffect, useState, useMemo } from 'react'
import { getLeads } from '@/services/api'
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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { format } from 'date-fns'
import { Eye, Loader2, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'

export default function MeusLeads() {
  const { user } = useAuth()
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterScore, setFilterScore] = useState('all')

  useEffect(() => {
    const fetchLeads = async () => {
      if (!user) return
      try {
        const vendedorId = user.role !== 'admin' ? user.id : undefined
        const data = await getLeads(vendedorId)
        setLeads(data as any[])
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchLeads()
  }, [user])

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const matchSearch =
        l.nome.toLowerCase().includes(search.toLowerCase()) ||
        l.cartorio.toLowerCase().includes(search.toLowerCase())
      const matchStatus = filterStatus === 'all' || l.status === filterStatus
      let matchScore = true
      if (filterScore === 'critico') matchScore = l.score < 40
      if (filterScore === 'atencao') matchScore = l.score >= 40 && l.score <= 70
      if (filterScore === 'adequado') matchScore = l.score > 70

      return matchSearch && matchStatus && matchScore
    })
  }, [leads, search, filterStatus, filterScore])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'novo':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Novo</Badge>
      case 'contatado':
        return (
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Contatado</Badge>
        )
      case 'negociando':
        return (
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
            Negociando
          </Badge>
        )
      case 'convertido':
        return (
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
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
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por nome ou cartório..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-slate-900 border-slate-800 text-white w-full"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full md:w-[180px] bg-slate-900 border-slate-800 text-white">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="novo">Novo</SelectItem>
            <SelectItem value="contatado">Contatado</SelectItem>
            <SelectItem value="negociando">Negociando</SelectItem>
            <SelectItem value="convertido">Convertido</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterScore} onValueChange={setFilterScore}>
          <SelectTrigger className="w-full md:w-[180px] bg-slate-900 border-slate-800 text-white">
            <SelectValue placeholder="Score" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Scores</SelectItem>
            <SelectItem value="critico">Crítico (&lt;40%)</SelectItem>
            <SelectItem value="atencao">Atenção (40-70%)</SelectItem>
            <SelectItem value="adequado">Adequado (&gt;70%)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardHeader>
          <CardTitle className="text-lg">Meus Leads</CardTitle>
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
              {filteredLeads.length === 0 && (
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                    Nenhum lead encontrado com estes filtros.
                  </TableCell>
                </TableRow>
              )}
              {filteredLeads.map((lead) => (
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
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="h-8 w-8 p-0 text-slate-400 hover:text-primary"
                    >
                      <Link to={`/crm/leads/${lead.id}`}>
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
    </div>
  )
}
