import { useEffect, useState, useMemo } from 'react'
import { getLeads } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Link, Navigate } from 'react-router-dom'
import { format, isAfter, isBefore, parseISO } from 'date-fns'
import { useAuth } from '@/hooks/use-auth'
import { Loader2, Search, ArrowRight } from 'lucide-react'

export default function AdminDashboard() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [filterLevel, setFilterLevel] = useState('todos')
  const [minScore, setMinScore] = useState('')
  const [maxScore, setMaxScore] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!isAuthenticated) return
    const fetchLeads = async () => {
      try {
        const data = await getLeads()
        setLeads(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchLeads()
  }, [isAuthenticated])

  const getComplianceLevel = (score: number) => {
    if (score >= 91) return { label: 'Excelente', color: 'bg-emerald-500/20 text-emerald-400' }
    if (score >= 71) return { label: 'Adequado', color: 'bg-blue-500/20 text-blue-400' }
    if (score >= 41) return { label: 'Atenção', color: 'bg-amber-500/20 text-amber-400' }
    return { label: 'Crítico', color: 'bg-red-500/20 text-red-400' }
  }

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (filterLevel !== 'todos') {
        const level = getComplianceLevel(lead.score || 0).label.toLowerCase()
        if (level !== filterLevel.toLowerCase()) return false
      }
      if (minScore && (lead.score || 0) < parseInt(minScore)) return false
      if (maxScore && (lead.score || 0) > parseInt(maxScore)) return false
      if (startDate && isBefore(parseISO(lead.created), parseISO(startDate))) return false
      if (endDate && isAfter(parseISO(lead.created), parseISO(endDate))) return false
      if (
        search &&
        !lead.cartorio.toLowerCase().includes(search.toLowerCase()) &&
        !lead.nome.toLowerCase().includes(search.toLowerCase())
      ) {
        return false
      }
      return true
    })
  }, [leads, filterLevel, minScore, maxScore, startDate, endDate, search])

  if (authLoading)
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'vendedor')) {
    return <Navigate to="/crm/acesso-negado" />
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8">
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-slate-400 mt-1">Gestão centralizada de leads e diagnósticos.</p>
          </div>
          <Button
            asChild
            variant="outline"
            className="border-slate-700 text-slate-300 hover:text-white"
          >
            <Link to="/crm">Voltar ao CRM</Link>
          </Button>
        </div>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Filtros Avançados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Busca</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    placeholder="Cartório, Nome..."
                    className="pl-9 bg-slate-950 border-slate-700 text-white"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Nível de Conformidade</label>
                <Select value={filterLevel} onValueChange={setFilterLevel}>
                  <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="excelente">Excelente</SelectItem>
                    <SelectItem value="adequado">Adequado</SelectItem>
                    <SelectItem value="atenção">Atenção</SelectItem>
                    <SelectItem value="crítico">Crítico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-slate-400 mb-1 block">Score Min</label>
                  <Input
                    type="number"
                    placeholder="0"
                    className="bg-slate-950 border-slate-700 text-white"
                    value={minScore}
                    onChange={(e) => setMinScore(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-slate-400 mb-1 block">Score Max</label>
                  <Input
                    type="number"
                    placeholder="100"
                    className="bg-slate-950 border-slate-700 text-white"
                    value={maxScore}
                    onChange={(e) => setMaxScore(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Data Inicial</label>
                <Input
                  type="date"
                  className="bg-slate-950 border-slate-700 text-white"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Data Final</label>
                <Input
                  type="date"
                  className="bg-slate-950 border-slate-700 text-white"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-0 overflow-x-auto">
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-950/50">
                  <TableRow className="border-slate-800">
                    <TableHead className="text-slate-400">Cartório</TableHead>
                    <TableHead className="text-slate-400">Contato</TableHead>
                    <TableHead className="text-slate-400 text-center">Score</TableHead>
                    <TableHead className="text-slate-400">Nível</TableHead>
                    <TableHead className="text-slate-400">Data Captura</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-slate-400 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                        Nenhum lead encontrado com os filtros atuais.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLeads.map((lead) => {
                      const level = getComplianceLevel(lead.score || 0)
                      return (
                        <TableRow
                          key={lead.id}
                          className="border-slate-800 hover:bg-slate-800/50 transition-colors"
                        >
                          <TableCell className="font-medium text-slate-200">
                            {lead.cartorio}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-slate-300">{lead.nome}</div>
                            <div className="text-xs text-slate-500">{lead.email}</div>
                            <div className="text-xs text-slate-500">{lead.telefone}</div>
                          </TableCell>
                          <TableCell className="text-center font-bold text-slate-300">
                            {lead.score || 0}%
                          </TableCell>
                          <TableCell>
                            <Badge className={level.color}>{level.label}</Badge>
                          </TableCell>
                          <TableCell className="text-slate-400 text-sm">
                            {format(new Date(lead.created), 'dd/MM/yyyy')}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="border-slate-700 text-slate-300 capitalize"
                            >
                              {lead.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button asChild size="sm" variant="secondary">
                              <Link to={`/crm/leads/${lead.id}`}>
                                Detalhes <ArrowRight className="ml-2 h-4 w-4" />
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
