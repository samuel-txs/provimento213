import { useState, useEffect } from 'react'
import { getServicos, getPrecos } from '@/services/servicos'
import { useCart } from '@/hooks/use-cart'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Search, ShoppingCart } from 'lucide-react'
import { DynamicIcon } from '@/components/DynamicIcon'
import { toast } from 'sonner'

export default function ServiceCatalog() {
  const { porte, setPorte, addItem } = useCart()
  const [servicos, setServicos] = useState<any[]>([])
  const [precos, setPrecos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [category, setCategory] = useState('all')

  useEffect(() => {
    Promise.all([getServicos(), getPrecos()]).then(([servs, precs]) => {
      setServicos(servs)
      setPrecos(precs)
      setLoading(false)
    })
  }, [])

  const filteredServicos = servicos.filter((s) => {
    const matchesSearch =
      s.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.descricao.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = category === 'all' || s.categoria === category
    return matchesSearch && matchesCategory
  })

  const getPriceForService = (servicoId: string) => {
    return precos.find((p) => p.servico_id === servicoId && p.porte === porte)
  }

  const handleAddToCart = async (servicoId: string) => {
    try {
      await addItem(servicoId)
      toast.success('Serviço adicionado ao carrinho')
    } catch (e) {
      toast.error('Erro ao adicionar serviço')
    }
  }

  if (loading) {
    return <div className="container mx-auto py-24 text-center">Carregando serviços...</div>
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-display font-bold text-slate-900 mb-2">
            Catálogo de Serviços Tiexpress
          </h1>
          <p className="text-slate-600 max-w-2xl">
            Soluções completas para adequação de cartórios ao Provimento 213 do CNJ. Selecione o
            porte do seu cartório para ver os preços.
          </p>
        </div>
        <div className="flex flex-col gap-2 min-w-[200px]">
          <label className="text-sm font-semibold text-slate-700">Porte do Cartório</label>
          <Select value={porte} onValueChange={setPorte}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o porte" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pequeno">Pequeno (Até 5 computadores)</SelectItem>
              <SelectItem value="Médio">Médio (6 a 20 computadores)</SelectItem>
              <SelectItem value="Grande">Grande (Mais de 20 computadores)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar serviços..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full md:w-[250px]">
            <SelectValue placeholder="Todas as categorias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Categorias</SelectItem>
            <SelectItem value="Diagnóstico">Diagnóstico</SelectItem>
            <SelectItem value="Implementação">Implementação</SelectItem>
            <SelectItem value="Suporte">Suporte</SelectItem>
            <SelectItem value="Treinamento">Treinamento</SelectItem>
            <SelectItem value="Consultoria">Consultoria</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServicos.map((s) => {
          const price = getPriceForService(s.id)
          return (
            <Card
              key={s.id}
              className="flex flex-col h-full border-slate-200 shadow-sm hover:shadow-md transition-all"
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 text-primary rounded-lg">
                    <DynamicIcon name={s.icone_url || 'box'} className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
                    {s.categoria}
                  </span>
                </div>
                <CardTitle className="text-xl leading-tight">{s.nome}</CardTitle>
                <CardDescription className="line-clamp-3">{s.descricao}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-end">
                {price ? (
                  <div className="space-y-1 mt-4">
                    {price.valor_projeto > 0 && (
                      <div className="flex justify-between items-end border-b border-slate-100 pb-2">
                        <span className="text-sm text-slate-500">Valor Projeto</span>
                        <span className="font-bold text-lg text-slate-900">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(price.valor_projeto)}
                        </span>
                      </div>
                    )}
                    {price.valor_mensal > 0 && (
                      <div className="flex justify-between items-end pt-2">
                        <span className="text-sm text-slate-500">Mensalidade</span>
                        <span className="font-bold text-lg text-primary">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(price.valor_mensal)}
                          /mês
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">
                    Preço sob consulta para este porte.
                  </p>
                )}
              </CardContent>
              <CardFooter className="pt-4 border-t border-slate-100">
                <Button
                  onClick={() => handleAddToCart(s.id)}
                  className="w-full gap-2"
                  disabled={!price}
                >
                  <ShoppingCart className="h-4 w-4" />
                  Adicionar ao Carrinho
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {filteredServicos.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          Nenhum serviço encontrado com os filtros atuais.
        </div>
      )}
    </div>
  )
}
