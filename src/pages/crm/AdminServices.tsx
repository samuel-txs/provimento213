import { useEffect, useState } from 'react'
import {
  getServicos,
  getPrecos,
  createServico,
  updateServico,
  deleteServico,
} from '@/services/servicos'
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
import { Plus, Edit, Trash2, DollarSign } from 'lucide-react'
import { toast } from 'sonner'
import { useRealtime } from '@/hooks/use-realtime'

export default function AdminServices() {
  const [servicos, setServicos] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isPricesOpen, setIsPricesOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    categoria: '',
    icone_url: '',
  })
  const [pricesData, setPricesData] = useState<any[]>([])

  const loadData = () => {
    getServicos().then(setServicos)
    getPrecos().then(setPricesData)
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('servicos', loadData)
  useRealtime('precos_servicos', loadData)

  const handleSave = async () => {
    try {
      if (editingId) {
        await updateServico(editingId, formData)
        toast.success('Serviço atualizado!')
      } else {
        await createServico(formData)
        toast.success('Serviço criado!')
      }
      setIsOpen(false)
      setEditingId(null)
      setFormData({ nome: '', descricao: '', categoria: '', icone_url: '' })
    } catch (e) {
      toast.error('Erro ao salvar serviço')
    }
  }

  const handleEdit = (s: any) => {
    setFormData({
      nome: s.nome,
      descricao: s.descricao,
      categoria: s.categoria,
      icone_url: s.icone_url,
    })
    setEditingId(s.id)
    setIsOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza?')) {
      try {
        await deleteServico(id)
        toast.success('Deletado com sucesso')
      } catch (e) {
        toast.error('Erro ao deletar')
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Catálogo de Serviços</h2>
          <p className="text-slate-400">Gerencie os serviços disponíveis para propostas.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingId(null)
                setFormData({ nome: '', descricao: '', categoria: '', icone_url: '' })
              }}
            >
              <Plus className="h-4 w-4 mr-2" /> Novo Serviço
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 text-white border-slate-700">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar Serviço' : 'Novo Serviço'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(v) => setFormData({ ...formData, categoria: v })}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Diagnóstico">Diagnóstico</SelectItem>
                    <SelectItem value="Implementação">Implementação</SelectItem>
                    <SelectItem value="Suporte">Suporte</SelectItem>
                    <SelectItem value="Treinamento">Treinamento</SelectItem>
                    <SelectItem value="Consultoria">Consultoria</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ícone (Nome Lucide)</Label>
                <Input
                  value={formData.icone_url}
                  onChange={(e) => setFormData({ ...formData, icone_url: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                  placeholder="ex: shield-check"
                />
              </div>
              <Button onClick={handleSave} className="w-full mt-4">
                Salvar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-950/50">
            <TableRow className="border-slate-800 hover:bg-transparent">
              <TableHead className="text-slate-400">Nome</TableHead>
              <TableHead className="text-slate-400">Categoria</TableHead>
              <TableHead className="text-slate-400">Ícone</TableHead>
              <TableHead className="text-right text-slate-400">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {servicos.map((s) => (
              <TableRow key={s.id} className="border-slate-800 hover:bg-slate-800/50">
                <TableCell className="font-medium text-slate-200">{s.nome}</TableCell>
                <TableCell className="text-slate-400">
                  <span className="px-2 py-1 rounded-full bg-slate-800 text-xs">{s.categoria}</span>
                </TableCell>
                <TableCell className="text-slate-400 text-sm">{s.icone_url}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingId(s.id)
                        setIsPricesOpen(true)
                      }}
                      className="text-green-400 hover:text-green-300"
                      title="Preços"
                    >
                      <DollarSign className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(s)}
                      className="text-slate-400 hover:text-white"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(s.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {servicos.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                  Nenhum serviço cadastrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isPricesOpen} onOpenChange={setIsPricesOpen}>
        <DialogContent className="bg-slate-900 text-white border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle>Preços por Porte</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {['Pequeno', 'Médio', 'Grande'].map((porte) => {
              const p =
                pricesData.find((x) => x.servico_id === editingId && x.porte === porte) || {}
              return (
                <div key={porte} className="flex gap-4 items-end bg-slate-800 p-4 rounded-md">
                  <div className="w-32">
                    <Label className="text-lg">{porte}</Label>
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label>Projeto (R$)</Label>
                    <Input
                      type="number"
                      defaultValue={p.valor_projeto || 0}
                      className="bg-slate-900 border-slate-700"
                      onBlur={async (e) => {
                        const val = Number(e.target.value)
                        if (p.id)
                          await import('@/services/servicos').then((m) =>
                            m.updatePreco(p.id, { valor_projeto: val }),
                          )
                        else
                          await import('@/services/servicos').then((m) =>
                            m.createPreco({
                              servico_id: editingId,
                              porte,
                              valor_projeto: val,
                              valor_mensal: 0,
                            }),
                          )
                        loadData()
                      }}
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label>Mensal (R$)</Label>
                    <Input
                      type="number"
                      defaultValue={p.valor_mensal || 0}
                      className="bg-slate-900 border-slate-700"
                      onBlur={async (e) => {
                        const val = Number(e.target.value)
                        if (p.id)
                          await import('@/services/servicos').then((m) =>
                            m.updatePreco(p.id, { valor_mensal: val }),
                          )
                        else
                          await import('@/services/servicos').then((m) =>
                            m.createPreco({
                              servico_id: editingId,
                              porte,
                              valor_mensal: val,
                              valor_projeto: p.valor_projeto || 0,
                            }),
                          )
                        loadData()
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
