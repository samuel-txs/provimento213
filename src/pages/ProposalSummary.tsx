import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '@/hooks/use-cart'
import { getPrecos, sendProposal } from '@/services/servicos'
import { getLeads } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FileDown, Mail, ShieldCheck, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function ProposalSummary() {
  const { items, sessaoId } = useCart()
  const [precos, setPrecos] = useState<any[]>([])
  const [leads, setLeads] = useState<any[]>([])
  const [selectedLead, setSelectedLead] = useState<string>('guest')
  const [customEmail, setCustomEmail] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [sent, setSent] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    getPrecos().then(setPrecos)
    getLeads()
      .then(setLeads)
      .catch(() => {})
  }, [])

  const getPrice = (servicoId: string, itemPorte: string) => {
    return precos.find((p) => p.servico_id === servicoId && p.porte === itemPorte)
  }

  const totals = items.reduce(
    (acc, item) => {
      const price = getPrice(item.servico_id, item.porte)
      if (price) {
        acc.projeto += (price.valor_projeto || 0) * item.quantidade
        acc.mensal += (price.valor_mensal || 0) * item.quantidade
      }
      return acc
    },
    { projeto: 0, mensal: 0 },
  )

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  const handleSend = async () => {
    let email = customEmail
    if (selectedLead !== 'guest') {
      const lead = leads.find((l) => l.id === selectedLead)
      if (lead) email = lead.email
    }

    if (!email) {
      toast.error('Informe um e-mail para envio.')
      return
    }

    setIsSending(true)
    try {
      await sendProposal({ email, sessao_id: sessaoId, total: totals.projeto })
      setSent(true)
      toast.success('Proposta enviada com sucesso!')
    } catch (e) {
      toast.error('Erro ao enviar proposta.')
    } finally {
      setIsSending(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto py-24 text-center">
        Carrinho vazio.{' '}
        <Button variant="link" onClick={() => navigate('/servicos')}>
          Voltar aos serviços
        </Button>
      </div>
    )
  }

  if (sent) {
    return (
      <div className="container mx-auto py-24 text-center max-w-md">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
        <h2 className="text-3xl font-bold mb-4">Proposta Enviada!</h2>
        <p className="text-slate-600 mb-8">
          A proposta comercial foi gerada e enviada para o e-mail informado. Nossa equipe entrará em
          contato em breve.
        </p>
        <Button onClick={() => navigate('/')} className="w-full">
          Voltar ao Início
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8 pb-6 border-b">
          <ShieldCheck className="h-10 w-10 text-primary" />
          <div>
            <h1 className="text-3xl font-display font-bold">Resumo da Proposta</h1>
            <p className="text-slate-500">Documento base para prestação de serviços Tiexpress</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-lg border-b pb-2">Dados do Cliente</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Vincular a um Lead (Opcional)</Label>
                  <Select value={selectedLead} onValueChange={setSelectedLead}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um lead" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="guest">Sem vínculo (Convidado)</SelectItem>
                      {leads.map((l) => (
                        <SelectItem key={l.id} value={l.id}>
                          {l.cartorio} - {l.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedLead === 'guest' && (
                  <div className="space-y-2">
                    <Label>E-mail para envio</Label>
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-50 border-none">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg border-b pb-2 mb-4">Ações da Proposta</h3>
              <div className="space-y-3">
                <Button
                  className="w-full justify-start gap-3"
                  onClick={handleSend}
                  disabled={isSending}
                >
                  <Mail className="h-5 w-5" />
                  {isSending ? 'Enviando...' : 'Enviar por E-mail'}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3"
                  onClick={() => window.print()}
                >
                  <FileDown className="h-5 w-5" />
                  Salvar PDF (Imprimir)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="print:shadow-none print:border-none">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">Proposta Comercial - Adequação CNJ 213</h2>
              <p className="text-slate-500">Tiexpress - Expresse seu negócio!</p>
            </div>

            <table className="w-full mb-8 text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="py-3 font-semibold">Serviço</th>
                  <th className="py-3 font-semibold text-center">Qtd</th>
                  <th className="py-3 font-semibold text-right">Projeto</th>
                  <th className="py-3 font-semibold text-right">Mensal</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const s = item.expand?.servico_id
                  const p = getPrice(item.servico_id, item.porte)
                  return (
                    <tr key={item.id} className="border-b border-slate-100">
                      <td className="py-4">
                        <div className="font-medium">{s?.nome}</div>
                        <div className="text-sm text-slate-500">Porte: {item.porte}</div>
                      </td>
                      <td className="py-4 text-center">{item.quantidade}</td>
                      <td className="py-4 text-right">
                        {p?.valor_projeto ? formatCurrency(p.valor_projeto * item.quantidade) : '-'}
                      </td>
                      <td className="py-4 text-right text-primary">
                        {p?.valor_mensal ? formatCurrency(p.valor_mensal * item.quantidade) : '-'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 font-bold">
                  <td colSpan={2} className="py-4 px-4 text-right">
                    Totais:
                  </td>
                  <td className="py-4 px-4 text-right text-lg">{formatCurrency(totals.projeto)}</td>
                  <td className="py-4 px-4 text-right text-lg text-primary">
                    {formatCurrency(totals.mensal)}/mês
                  </td>
                </tr>
              </tfoot>
            </table>

            <div className="text-sm text-slate-500 mt-12 pt-8 border-t text-center">
              <p>Proposta válida por 15 dias a partir da data de emissão.</p>
              <p>Os valores podem sofrer alterações após avaliação técnica in loco.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
