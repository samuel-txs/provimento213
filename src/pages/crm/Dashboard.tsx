import { useEffect, useState, useMemo } from 'react'
import { getLeads, getMinhasPropostas } from '@/services/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
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
import { Loader2, TrendingUp, Users, DollarSign, FileText } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { Link } from 'react-router-dom'

type Lead = {
  id: string
  score: number
  status: string
  receita_potencial?: number
}

export default function Dashboard() {
  const { user } = useAuth()
  const [leads, setLeads] = useState<Lead[]>([])
  const [propostasCount, setPropostasCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return
      try {
        const vendedorId = user.role !== 'admin' ? user.id : undefined
        const [leadsData, propostasData] = await Promise.all([
          getLeads(vendedorId),
          getMinhasPropostas(vendedorId),
        ])
        setLeads(leadsData as any)
        setPropostasCount(propostasData.filter((p: any) => p.status !== 'Rejeitada').length)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user])

  const { funnelData, metrics } = useMemo(() => {
    const counts = { novo: 0, contatado: 0, negociando: 0, convertido: 0 }
    let totalReceita = 0
    let totalConvertido = 0

    leads.forEach((l) => {
      if (l.status in counts) counts[l.status as keyof typeof counts]++
      const isConv = l.status === 'convertido'
      if (isConv) totalConvertido++
      totalReceita += l.receita_potencial || 0
    })

    const funnel = [
      { name: 'Novos', count: counts.novo, color: '#3b82f6' },
      { name: 'Contatados', count: counts.contatado, color: '#f59e0b' },
      { name: 'Negociando', count: counts.negociando, color: '#8b5cf6' },
      { name: 'Convertidos', count: counts.convertido, color: '#10b981' },
    ]

    return {
      funnelData: funnel,
      metrics: {
        receita: totalReceita,
        convertidos: totalConvertido,
        ativos: counts.novo + counts.contatado + counts.negociando,
      },
    }
  }, [leads])

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
        <h2 className="text-2xl font-bold text-white">Meu Desempenho</h2>
        <Button asChild>
          <Link to="/crm/leads">Ir para Meus Leads</Link>
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Users className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Leads Ativos</p>
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
              <p className="text-sm text-slate-400">Convertidos</p>
              <h3 className="text-2xl font-bold">{metrics.convertidos}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-amber-500/20 rounded-lg">
              <FileText className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Propostas Ativas</p>
              <h3 className="text-2xl font-bold">{propostasCount}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Valor em Pipeline</p>
              <h3
                className="text-xl font-bold truncate"
                title={`R$ ${metrics.receita.toLocaleString('pt-BR')}`}
              >
                R$ {metrics.receita.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <Card className="bg-slate-900 border-slate-800 text-white md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Volume do Funil (Meus Leads)</CardTitle>
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
      </div>
    </div>
  )
}
