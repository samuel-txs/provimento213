import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '@/hooks/use-cart'
import { getPrecos } from '@/services/servicos'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Trash2, ArrowRight, Plus, Minus, FileText } from 'lucide-react'
import { DynamicIcon } from '@/components/DynamicIcon'

export default function Cart() {
  const { items, porte, updateQuantity, removeItem, loading } = useCart()
  const [precos, setPrecos] = useState<any[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    getPrecos().then(setPrecos)
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

  if (loading) {
    return <div className="container mx-auto py-24 text-center">Carregando carrinho...</div>
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto py-24 text-center max-w-md">
        <div className="bg-slate-100 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
          <FileText className="h-10 w-10 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold mb-4">Seu carrinho está vazio</h2>
        <p className="text-slate-600 mb-8">
          Navegue pelo nosso catálogo de serviços para montar sua proposta comercial.
        </p>
        <Button asChild className="w-full">
          <Link to="/servicos">Ver Catálogo de Serviços</Link>
        </Button>
      </div>
    )
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-display font-bold text-slate-900 mb-8">Carrinho de Serviços</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const servico = item.expand?.servico_id
            const price = getPrice(item.servico_id, item.porte)

            return (
              <Card key={item.id} className="overflow-hidden border-slate-200">
                <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="p-3 bg-slate-100 text-slate-600 rounded-lg shrink-0">
                    <DynamicIcon name={servico?.icone_url || 'box'} className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{servico?.nome}</h3>
                    <p className="text-sm text-slate-500 mb-2">Porte selecionado: {item.porte}</p>
                    {price && (
                      <div className="flex flex-wrap gap-4 text-sm font-medium">
                        {price.valor_projeto > 0 && (
                          <span className="text-slate-700">
                            Projeto: {formatCurrency(price.valor_projeto)}/un
                          </span>
                        )}
                        {price.valor_mensal > 0 && (
                          <span className="text-primary">
                            Mensal: {formatCurrency(price.valor_mensal)}/un
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-6 mt-4 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-4 sm:pt-0">
                    <div className="flex items-center border rounded-md">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantidade - 1)}
                        className="p-2 hover:bg-slate-50 text-slate-600"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-10 text-center font-medium">{item.quantidade}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantidade + 1)}
                        className="p-2 hover:bg-slate-50 text-slate-600"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                      title="Remover"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24 border-primary/20 shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4">Resumo da Proposta</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-slate-600">
                  <span>Itens no carrinho:</span>
                  <span className="font-medium">{items.length}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-600">Total Projeto:</span>
                    <span className="font-semibold">{formatCurrency(totals.projeto)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Mensalidades:</span>
                    <span className="font-bold text-primary">
                      {formatCurrency(totals.mensal)}/mês
                    </span>
                  </div>
                </div>
              </div>

              <Button onClick={() => navigate('/proposta')} className="w-full gap-2 text-base h-12">
                Gerar Proposta Comercial
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button asChild variant="ghost" className="w-full mt-2">
                <Link to="/servicos">Continuar Adicionando</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
