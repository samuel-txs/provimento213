import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  DialogFooter,
} from '@/components/ui/dialog'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Pencil, Trash2, Plus, Loader2, GripVertical } from 'lucide-react'
import { toast } from 'sonner'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'

export default function ChecklistManagement() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isContextualCreate, setIsContextualCreate] = useState(false)

  // Drag & Drop State
  const [draggedItem, setDraggedItem] = useState<{ id: string; categoria: string } | null>(null)
  const [dragOverItem, setDragOverItem] = useState<{ id: string; categoria: string } | null>(null)

  // Bulk Edit State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isBulkMoveOpen, setIsBulkMoveOpen] = useState(false)
  const [bulkTargetCategory, setBulkTargetCategory] = useState('')

  const [formData, setFormData] = useState({
    categoria: '',
    texto_pergunta: '',
    ordem: 0,
  })

  useEffect(() => {
    if (!authLoading && user?.role !== 'admin') {
      navigate('/crm/acesso-negado')
    }
  }, [user, authLoading, navigate])

  const fetchQuestions = async () => {
    try {
      const records = await pb.collection('perguntas_checklist').getFullList({ sort: 'ordem' })
      setQuestions(records)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchQuestions()
    } else if (!authLoading) {
      setLoading(false)
    }
  }, [user, authLoading])

  useRealtime(
    'perguntas_checklist',
    () => {
      fetchQuestions()
    },
    user?.role === 'admin',
  )

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await pb.collection('perguntas_checklist').update(editingId, formData)
        toast.success('Pergunta atualizada com sucesso.')
      } else {
        await pb.collection('perguntas_checklist').create(formData)
        toast.success('Nova pergunta adicionada.')
      }
      setIsModalOpen(false)
    } catch (error) {
      toast.error('Erro ao salvar a pergunta.')
    }
  }

  const handleDelete = async (id: string) => {
    if (
      confirm(
        'Tem certeza que deseja deletar esta pergunta? Ela será removida do formulário público.',
      )
    ) {
      try {
        await pb.collection('perguntas_checklist').delete(id)
        toast.success('Pergunta deletada.')
        setSelectedIds((prev) => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
      } catch (e) {
        toast.error('Erro ao deletar pergunta.')
      }
    }
  }

  const openNew = (categoria: string = '') => {
    setEditingId(null)
    setIsContextualCreate(!!categoria)
    const orderBase = groupedQuestions[categoria]
      ? groupedQuestions[categoria].length
      : questions.length
    setFormData({ categoria, texto_pergunta: '', ordem: (orderBase + 1) * 10 })
    setIsModalOpen(true)
  }

  const openEdit = (q: any) => {
    setEditingId(q.id)
    setIsContextualCreate(false)
    setFormData({ categoria: q.categoria, texto_pergunta: q.texto_pergunta, ordem: q.ordem })
    setIsModalOpen(true)
  }

  // --- Drag and Drop Logic ---
  const handleDragStart = (e: React.DragEvent, id: string, categoria: string) => {
    setDraggedItem({ id, categoria })
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id) // Firefox requirement
  }

  const handleDragOver = (e: React.DragEvent, id: string, categoria: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (draggedItem?.categoria === categoria && dragOverItem?.id !== id) {
      setDragOverItem({ id, categoria })
    }
  }

  const handleDrop = async (e: React.DragEvent, targetId: string, categoria: string) => {
    e.preventDefault()
    if (!draggedItem) return
    if (draggedItem.categoria !== categoria || draggedItem.id === targetId) {
      setDraggedItem(null)
      setDragOverItem(null)
      return
    }

    const qs = groupedQuestions[categoria]
    const draggedIdx = qs.findIndex((q) => q.id === draggedItem.id)
    const targetIdx = qs.findIndex((q) => q.id === targetId)

    if (draggedIdx === -1 || targetIdx === -1) return

    const newQs = [...qs]
    const [removed] = newQs.splice(draggedIdx, 1)
    newQs.splice(targetIdx, 0, removed)

    const updates = newQs.map((q, idx) => ({
      id: q.id,
      ordem: (idx + 1) * 10,
    }))

    // Optimistic Update
    setQuestions((prev) => {
      const next = [...prev]
      updates.forEach((u) => {
        const q = next.find((x) => x.id === u.id)
        if (q) q.ordem = u.ordem
      })
      return next.sort((a, b) => a.ordem - b.ordem)
    })

    setDraggedItem(null)
    setDragOverItem(null)

    // Persist
    try {
      await Promise.all(
        updates.map((u) => pb.collection('perguntas_checklist').update(u.id, { ordem: u.ordem })),
      )
      toast.success('Ordem atualizada.')
    } catch (err) {
      toast.error('Erro ao atualizar a ordem.')
      fetchQuestions()
    }
  }

  // --- Bulk Edit Logic ---
  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const toggleCategorySelection = (categoria: string) => {
    const qs = groupedQuestions[categoria] || []
    const allSelected = qs.every((q) => selectedIds.has(q.id))
    const next = new Set(selectedIds)

    if (allSelected) {
      qs.forEach((q) => next.delete(q.id))
    } else {
      qs.forEach((q) => next.add(q.id))
    }
    setSelectedIds(next)
  }

  const handleBulkMove = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bulkTargetCategory) return

    // Optimistic update
    setQuestions((prev) =>
      prev.map((q) => (selectedIds.has(q.id) ? { ...q, categoria: bulkTargetCategory } : q)),
    )

    try {
      const promises = Array.from(selectedIds).map((id) =>
        pb.collection('perguntas_checklist').update(id, { categoria: bulkTargetCategory }),
      )
      await Promise.all(promises)
      toast.success('Perguntas movidas com sucesso.')
      setIsBulkMoveOpen(false)
      setBulkTargetCategory('')
      setSelectedIds(new Set())
    } catch (err) {
      toast.error('Erro ao mover perguntas.')
      fetchQuestions()
    }
  }

  const groupedQuestions = useMemo(() => {
    const groups: Record<string, any[]> = {}
    const sorted = [...questions].sort((a, b) => a.ordem - b.ordem)
    sorted.forEach((q) => {
      if (!groups[q.categoria]) {
        groups[q.categoria] = []
      }
      groups[q.categoria].push(q)
    })
    return groups
  }, [questions])

  if (authLoading || (loading && questions.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (user?.role !== 'admin') {
    return null
  }

  return (
    <div className="space-y-6 pb-24 relative">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Gestão do Checklist</h2>
        <Button onClick={() => openNew('')}>
          <Plus className="w-4 h-4 mr-2" /> Nova Categoria
        </Button>
      </div>

      {Object.keys(groupedQuestions).length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500">
          Nenhuma pergunta encontrada. Clique em "Nova Categoria" para adicionar a primeira.
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedQuestions).map(([categoria, qs]) => (
            <Card
              key={categoria}
              className="bg-slate-900 border-slate-800 shadow-sm overflow-hidden"
            >
              <CardHeader className="flex flex-row items-center justify-between py-4 px-6 border-b border-slate-800 bg-slate-950/50">
                <CardTitle className="text-lg font-semibold text-slate-200">
                  {categoria}
                  <span className="text-sm font-normal text-slate-400 ml-2">
                    ({qs.length} {qs.length === 1 ? 'pergunta' : 'perguntas'})
                  </span>
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openNew(categoria)}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" /> Adicionar Pergunta
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-slate-950/30">
                    <TableRow className="border-slate-800 hover:bg-transparent">
                      <TableHead className="w-12 px-6">
                        <Checkbox
                          checked={qs.length > 0 && qs.every((q) => selectedIds.has(q.id))}
                          onCheckedChange={() => toggleCategorySelection(categoria)}
                          aria-label="Selecionar todas desta categoria"
                        />
                      </TableHead>
                      <TableHead className="w-8 px-2"></TableHead>
                      <TableHead className="text-slate-400 w-24 px-6">Ordem</TableHead>
                      <TableHead className="text-slate-400">Pergunta</TableHead>
                      <TableHead className="text-slate-400 text-right px-6">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {qs.map((q) => (
                      <TableRow
                        key={q.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, q.id, categoria)}
                        onDragOver={(e) => handleDragOver(e, q.id, categoria)}
                        onDrop={(e) => handleDrop(e, q.id, categoria)}
                        onDragEnd={() => {
                          setDraggedItem(null)
                          setDragOverItem(null)
                        }}
                        className={cn(
                          'border-slate-800 hover:bg-slate-800/50 transition-colors cursor-grab active:cursor-grabbing',
                          draggedItem?.id === q.id && 'opacity-40 bg-slate-800/80',
                          dragOverItem?.id === q.id &&
                            dragOverItem?.id !== draggedItem?.id &&
                            'border-t-2 border-t-primary bg-slate-800/30',
                          selectedIds.has(q.id) && 'bg-slate-800/40',
                        )}
                      >
                        <TableCell className="w-12 px-6">
                          <Checkbox
                            checked={selectedIds.has(q.id)}
                            onCheckedChange={() => toggleSelection(q.id)}
                            aria-label={`Selecionar pergunta ${q.ordem}`}
                          />
                        </TableCell>
                        <TableCell className="w-8 px-2 text-slate-500">
                          <GripVertical className="w-4 h-4 cursor-grab active:cursor-grabbing" />
                        </TableCell>
                        <TableCell className="text-slate-300 font-medium px-6">{q.ordem}</TableCell>
                        <TableCell className="text-slate-300 max-w-2xl py-4">
                          {q.texto_pergunta}
                        </TableCell>
                        <TableCell className="text-right px-6">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(q)}
                            className="text-slate-400 hover:text-white"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(q.id)}
                            className="text-slate-400 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Bulk Actions Menu */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 p-4 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-6 z-40 animate-in slide-in-from-bottom-5">
          <span className="text-sm font-medium text-slate-200">
            {selectedIds.size} pergunta(s) selecionada(s)
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setIsBulkMoveOpen(true)}>
              Mover Categoria
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds(new Set())}
              className="text-slate-400 hover:text-white"
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Edit/New Question Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-slate-900 text-slate-200 border-slate-800 sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Pergunta' : 'Nova Pergunta'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-6 pt-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2 col-span-1">
                <Label htmlFor="ordem" className="text-slate-300">
                  Ordem
                </Label>
                <Input
                  id="ordem"
                  type="number"
                  value={formData.ordem}
                  onChange={(e) => setFormData({ ...formData, ordem: Number(e.target.value) })}
                  className="bg-slate-950 border-slate-800 focus-visible:ring-primary"
                  required
                />
              </div>
              <div className="space-y-2 col-span-3">
                <Label htmlFor="categoria" className="text-slate-300">
                  Categoria
                </Label>
                <Input
                  id="categoria"
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  className={cn(
                    'bg-slate-950 border-slate-800 focus-visible:ring-primary',
                    isContextualCreate && 'opacity-60 cursor-not-allowed focus-visible:ring-0',
                  )}
                  placeholder="Ex: Segurança, Infraestrutura..."
                  required
                  readOnly={isContextualCreate}
                  tabIndex={isContextualCreate ? -1 : 0}
                  list="categorias-existentes-form"
                />
                <datalist id="categorias-existentes-form">
                  {Object.keys(groupedQuestions).map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
                {isContextualCreate && (
                  <p className="text-xs text-slate-500 mt-1">
                    Categoria pré-selecionada baseada no bloco atual.
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="texto" className="text-slate-300">
                Texto da Pergunta
              </Label>
              <Textarea
                id="texto"
                value={formData.texto_pergunta}
                onChange={(e) => setFormData({ ...formData, texto_pergunta: e.target.value })}
                className="bg-slate-950 border-slate-800 focus-visible:ring-primary min-h-[120px] resize-none"
                required
              />
            </div>
            <DialogFooter className="pt-4 border-t border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Cancelar
              </Button>
              <Button type="submit">Salvar Pergunta</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bulk Move Dialog */}
      <Dialog open={isBulkMoveOpen} onOpenChange={setIsBulkMoveOpen}>
        <DialogContent className="bg-slate-900 text-slate-200 border-slate-800 sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Mover Perguntas</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleBulkMove} className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label htmlFor="bulkCategory" className="text-slate-300">
                Nova Categoria
              </Label>
              <Input
                id="bulkCategory"
                value={bulkTargetCategory}
                onChange={(e) => setBulkTargetCategory(e.target.value)}
                className="bg-slate-950 border-slate-800 focus-visible:ring-primary"
                placeholder="Digite ou selecione uma categoria..."
                list="categorias-existentes"
                required
              />
              <datalist id="categorias-existentes">
                {Object.keys(groupedQuestions).map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>
            <DialogFooter className="pt-4 border-t border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsBulkMoveOpen(false)}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Cancelar
              </Button>
              <Button type="submit">Mover</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
