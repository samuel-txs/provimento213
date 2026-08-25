import React, { useState, useEffect, useMemo, useRef } from 'react'
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
import { Pencil, Trash2, Plus, Loader2, GripVertical, Download, Upload } from 'lucide-react'
import { toast } from 'sonner'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'

interface OptionItem {
  id: string
  pergunta_id: string
  texto_opcao: string
  valor: string
  ordem?: number
  [key: string]: any
}

function getOptionBadgeStyle(valor: string) {
  switch (valor) {
    case 'não':
      return {
        badge:
          'bg-red-900/40 text-red-300 border-red-800/50 hover:bg-red-900/60 hover:border-red-700',
        input:
          'bg-red-950/80 text-red-200 border-red-700/80 focus:border-red-500 focus:ring-1 focus:ring-red-500',
      }
    case 'parcial':
      return {
        badge:
          'bg-yellow-900/40 text-yellow-300 border-yellow-800/50 hover:bg-yellow-900/60 hover:border-yellow-700',
        input:
          'bg-yellow-950/80 text-yellow-200 border-yellow-700/80 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500',
      }
    case 'completo':
      return {
        badge:
          'bg-green-900/40 text-green-300 border-green-800/50 hover:bg-green-900/60 hover:border-green-700',
        input:
          'bg-green-950/80 text-green-200 border-green-700/80 focus:border-green-500 focus:ring-1 focus:ring-green-500',
      }
    case 'nao_sei':
      return {
        badge:
          'bg-slate-700/40 text-slate-300 border-slate-600/50 hover:bg-slate-700/60 hover:border-slate-500',
        input:
          'bg-slate-900 text-slate-200 border-slate-600 focus:border-slate-400 focus:ring-1 focus:ring-slate-400',
      }
    default:
      return {
        badge:
          'bg-slate-800/60 text-slate-300 border-slate-700 hover:bg-slate-800 hover:border-slate-600',
        input:
          'bg-slate-900 text-slate-200 border-slate-700 focus:border-slate-500 focus:ring-1 focus:ring-slate-500',
      }
  }
}

interface InlineEditableOptionBadgeProps {
  option: OptionItem
  onUpdateSuccess: (updatedOption: OptionItem) => void
}

function InlineEditableOptionBadge({ option, onUpdateSuccess }: InlineEditableOptionBadgeProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(option.texto_opcao)
  const [isSaving, setIsSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const isSubmittingRef = useRef(false)

  // Sync with prop when not editing
  useEffect(() => {
    if (!isEditing) {
      setValue(option.texto_opcao)
    }
  }, [option.texto_opcao, isEditing])

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [isEditing])

  const styles = getOptionBadgeStyle(option.valor)

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    setValue(option.texto_opcao)
    setIsEditing(true)
  }

  const handleSave = async () => {
    if (isSubmittingRef.current) return
    const trimmed = value.trim()

    // If text didn't change or is empty, revert / cancel
    if (!trimmed || trimmed === option.texto_opcao) {
      setValue(option.texto_opcao)
      setIsEditing(false)
      return
    }

    isSubmittingRef.current = true
    setIsSaving(true)

    try {
      const updated = await pb.collection('opcoes_resposta').update(option.id, {
        texto_opcao: trimmed,
      })
      toast.success('Opção atualizada com sucesso.')
      onUpdateSuccess({ ...option, texto_opcao: trimmed, ...updated })
      setIsEditing(false)
    } catch (error) {
      console.error('Erro ao atualizar opção:', error)
      toast.error('Erro ao salvar opção. Revertendo alterações.')
      setValue(option.texto_opcao)
      setIsEditing(false)
    } finally {
      setIsSaving(false)
      isSubmittingRef.current = false
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      e.stopPropagation()
      handleSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      setValue(option.texto_opcao)
      setIsEditing(false)
    }
  }

  if (isEditing) {
    return (
      <div
        className="inline-flex items-center relative my-0.5"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        draggable={false}
      >
        <input
          ref={inputRef}
          type="text"
          value={value}
          disabled={isSaving}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className={cn(
            'text-xs font-medium px-2 py-0.5 rounded border outline-none transition-all shadow-sm',
            'min-w-[90px] max-w-[260px]',
            styles.input,
            isSaving && 'opacity-70 pr-6',
          )}
        />
        {isSaving && (
          <span className="absolute right-1.5 flex items-center pointer-events-none">
            <Loader2 className="w-3 h-3 animate-spin text-slate-300" />
          </span>
        )}
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={handleStartEdit}
      onMouseDown={(e) => e.stopPropagation()}
      title="Clique para editar o texto desta opção"
      className={cn(
        'group inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border text-left cursor-pointer transition-all select-none',
        styles.badge,
      )}
    >
      <span>{option.texto_opcao}</span>
      <Pencil className="w-2.5 h-2.5 opacity-0 group-hover:opacity-70 transition-opacity shrink-0" />
    </button>
  )
}

export default function ChecklistManagement() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [questions, setQuestions] = useState<any[]>([])
  const [options, setOptions] = useState<any[]>([])
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

  // Export / Import State
  const [isExporting, setIsExporting] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importPreview, setImportPreview] = useState<any[]>([])
  const [importError, setImportError] = useState<string | null>(null)
  const [isParsing, setIsParsing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  useEffect(() => {
    if (!authLoading && user?.role !== 'admin') {
      navigate('/crm/acesso-negado')
    }
  }, [user, authLoading, navigate])

  const fetchData = async () => {
    try {
      const [questionsRecords, optionsRecords] = await Promise.all([
        pb.collection('perguntas_checklist').getFullList({ sort: 'ordem' }),
        pb.collection('opcoes_resposta').getFullList({ sort: 'ordem' }),
      ])
      setQuestions(questionsRecords)
      setOptions(optionsRecords)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchData()
    } else if (!authLoading) {
      setLoading(false)
    }
  }, [user, authLoading])

  useRealtime(
    'perguntas_checklist',
    () => {
      fetchData()
    },
    user?.role === 'admin',
  )

  useRealtime(
    'opcoes_resposta',
    () => {
      fetchData()
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

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const perguntas = await pb.collection('perguntas_checklist').getFullList({ sort: 'ordem' })
      const opcoes = await pb.collection('opcoes_resposta').getFullList()

      const lines = []
      lines.push(
        ['Ordem', 'Categoria', 'Pergunta', 'Opção_1', 'Opção_2', 'Opção_3', 'Opção_4'].join(';'),
      )

      for (const p of perguntas) {
        const pOpcoes = opcoes
          .filter((o) => o.pergunta_id === p.id)
          .sort((a, b) => a.ordem - b.ordem)

        const op1 = pOpcoes.find((o) => o.valor === 'não')?.texto_opcao || 'Não'
        const op2 = pOpcoes.find((o) => o.valor === 'parcial')?.texto_opcao || 'Parcial'
        const op3 = pOpcoes.find((o) => o.valor === 'completo')?.texto_opcao || 'Completo'
        const op4 = pOpcoes.find((o) => o.valor === 'nao_sei')?.texto_opcao || 'Não Sei Informar'

        const escapeCSV = (str: string) => `"${String(str).replace(/"/g, '""')}"`

        lines.push(
          [
            p.ordem,
            escapeCSV(p.categoria),
            escapeCSV(p.texto_pergunta),
            escapeCSV(op1),
            escapeCSV(op2),
            escapeCSV(op3),
            escapeCSV(op4),
          ].join(';'),
        )
      }

      const csvText = lines.join('\n')
      const blob = new Blob(['\uFEFF' + csvText], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `Checklist_Tiexpress_${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      URL.revokeObjectURL(link.href)
      toast.success('Checklist exportado com sucesso.')
    } catch (e) {
      toast.error('Erro ao exportar checklist.')
    } finally {
      setIsExporting(false)
    }
  }

  const parseCSVLine = (text: string, separator: string): string[] => {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    for (let i = 0; i < text.length; i++) {
      const char = text[i]
      if (char === '"') {
        if (inQuotes && text[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === separator && !inQuotes) {
        result.push(current)
        current = ''
      } else {
        current += char
      }
    }
    result.push(current)
    return result
  }

  const normalizeHeader = (h: string) => {
    return h
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '_')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImportFile(file)
    setImportError(null)
    setImportPreview([])
    setIsParsing(true)

    const reader = new FileReader()
    reader.onload = async (ev) => {
      try {
        const target = ev.target
        if (!target || typeof target.result !== 'string') {
          throw new Error('Falha ao ler o arquivo')
        }

        // Remove UTF-8 BOM if present
        const text = target.result.replace(/^\uFEFF/, '')

        const lines = text.split(/\r?\n/).filter((line) => line.trim() !== '')
        if (lines.length === 0) {
          setImportError('O arquivo está vazio.')
          setIsParsing(false)
          return
        }

        const separator = lines[0].includes(';') ? ';' : ','
        const headers = parseCSVLine(lines[0], separator).map((h) => h.trim())
        const normalizedHeaders = headers.map(normalizeHeader)

        const rows: any[] = []
        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVLine(lines[i], separator).map((v) => v.trim())
          const row: Record<string, string> = {}
          normalizedHeaders.forEach((h, idx) => {
            row[h] = values[idx] || ''
          })

          if (Object.values(row).some((v) => v !== '')) {
            rows.push(row)
          }
        }

        if (rows.length === 0) {
          setImportError('O arquivo está vazio.')
          setIsParsing(false)
          return
        }

        const firstRow = rows[0]
        const requiredColumns = [
          'ordem',
          'categoria',
          'pergunta',
          'opcao_1',
          'opcao_2',
          'opcao_3',
          'opcao_4',
        ]

        const missingColumns = requiredColumns.filter((col) => !(col in firstRow))

        if (missingColumns.length > 0) {
          const originalNames: Record<string, string> = {
            ordem: 'Ordem',
            categoria: 'Categoria',
            pergunta: 'Pergunta',
            opcao_1: 'Opção 1',
            opcao_2: 'Opção 2',
            opcao_3: 'Opção 3',
            opcao_4: 'Opção 4',
          }
          setImportError(
            `Erro: A coluna ${originalNames[missingColumns[0]] || missingColumns[0]} está faltando ou está mal formatada.`,
          )
          setIsParsing(false)
          return
        }

        setImportPreview(rows)
      } catch (err) {
        setImportError('Erro ao processar arquivo. Verifique se é um arquivo CSV válido.')
      } finally {
        setIsParsing(false)
      }
    }
    reader.onerror = () => {
      setImportError('Erro ao ler o arquivo local.')
      setIsParsing(false)
    }
    reader.readAsText(file)
  }

  const handleConfirmImport = async () => {
    if (importPreview.length === 0) return
    setIsImporting(true)
    try {
      const existingPerguntas = await pb.collection('perguntas_checklist').getFullList()
      let count = 0

      for (const row of importPreview) {
        const ordem = Number(row['ordem']) || (count + 1) * 10
        const categoria = String(row['categoria'] || '').trim()
        const pergunta = String(row['pergunta'] || '').trim()

        if (!categoria || !pergunta) continue

        let pId = ''
        const existing = existingPerguntas.find(
          (p) =>
            p.texto_pergunta.toLowerCase() === pergunta.toLowerCase() &&
            p.categoria.toLowerCase() === categoria.toLowerCase(),
        )

        if (existing) {
          pId = existing.id
          await pb
            .collection('perguntas_checklist')
            .update(pId, { ordem, categoria, texto_pergunta: pergunta })
        } else {
          const nova = await pb.collection('perguntas_checklist').create({
            categoria,
            texto_pergunta: pergunta,
            ordem,
          })
          pId = nova.id
        }

        const defaultOptions = [
          { valor: 'não', texto: String(row['opcao_1'] || 'Não'), ordem: 1 },
          { valor: 'parcial', texto: String(row['opcao_2'] || 'Parcial'), ordem: 2 },
          { valor: 'completo', texto: String(row['opcao_3'] || 'Completo'), ordem: 3 },
          { valor: 'nao_sei', texto: String(row['opcao_4'] || 'Não Sei Informar'), ordem: 4 },
        ]

        try {
          const existingOpts = await pb
            .collection('opcoes_resposta')
            .getFullList({ filter: `pergunta_id="${pId}"` })
          await Promise.all(
            existingOpts.map((opt) => pb.collection('opcoes_resposta').delete(opt.id)),
          )
        } catch {
          /* intentionally ignored */
        }

        await Promise.all(
          defaultOptions.map((opt) =>
            pb.collection('opcoes_resposta').create({
              pergunta_id: pId,
              texto_opcao: opt.texto,
              valor: opt.valor,
              ordem: opt.ordem,
            }),
          ),
        )
        count++
      }

      toast.success(`Sucesso! ${count} perguntas importadas/atualizadas.`)
      setIsImportModalOpen(false)
      setImportPreview([])
      setImportFile(null)
      fetchData()
    } catch (err) {
      console.error(err)
      toast.error('Erro ao importar perguntas.')
    } finally {
      setIsImporting(false)
    }
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
      fetchData()
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
      fetchData()
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
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isExporting}
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Exportar Checklist em CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setIsImportModalOpen(true)
              setImportError(null)
              setImportPreview([])
              setImportFile(null)
            }}
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            <Upload className="w-4 h-4 mr-2" />
            Importar Checklist de CSV
          </Button>
          <Button onClick={() => openNew('')}>
            <Plus className="w-4 h-4 mr-2" /> Nova Categoria
          </Button>
        </div>
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
                      <TableHead className="text-slate-400">Opções de Resposta</TableHead>
                      <TableHead className="text-slate-400 text-right px-6">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {qs.map((q) => {
                      const questionOptions = options
                        .filter((o) => o.pergunta_id === q.id)
                        .sort((a, b) => (a.ordem || 0) - (b.ordem || 0))

                      return (
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
                          <TableCell className="text-slate-300 font-medium px-6">
                            {q.ordem}
                          </TableCell>
                          <TableCell className="text-slate-300 max-w-md py-4">
                            {q.texto_pergunta}
                          </TableCell>
                          <TableCell className="py-4">
                            {questionOptions.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5 items-center">
                                {questionOptions.map((opt) => (
                                  <InlineEditableOptionBadge
                                    key={opt.id}
                                    option={opt}
                                    onUpdateSuccess={(updatedOpt) => {
                                      setOptions((prev) =>
                                        prev.map((o) => (o.id === updatedOpt.id ? updatedOpt : o)),
                                      )
                                    }}
                                  />
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-500 italic">
                                Nenhuma opção vinculada
                              </span>
                            )}
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
                      )
                    })}
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

      {/* Import CSV Dialog */}
      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent className="bg-slate-900 text-slate-200 border-slate-800 sm:max-w-[800px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Importar Checklist de CSV</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-4 pt-4 pr-2">
            {!importPreview.length && !isParsing && (
              <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
                <Input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <Label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                >
                  <Upload className="w-8 h-8 text-slate-400" />
                  <span className="text-slate-300 font-medium">
                    Clique para selecionar um arquivo CSV
                  </span>
                  <span className="text-slate-500 text-sm">Formato CSV suportado</span>
                </Label>
              </div>
            )}

            {isParsing && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <span className="text-slate-400">Analisando arquivo...</span>
              </div>
            )}

            {importError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg">
                {importError}
              </div>
            )}

            {importPreview.length > 0 && !isParsing && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">
                    Pré-visualização ({importPreview.length} perguntas)
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setImportPreview([])
                      setImportFile(null)
                      setImportError(null)
                    }}
                  >
                    Limpar
                  </Button>
                </div>
                <div className="border border-slate-800 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-950">
                      <TableRow className="border-slate-800">
                        <TableHead className="text-slate-400">Ordem</TableHead>
                        <TableHead className="text-slate-400">Categoria</TableHead>
                        <TableHead className="text-slate-400">Pergunta</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {importPreview.slice(0, 5).map((row, idx) => (
                        <TableRow key={idx} className="border-slate-800">
                          <TableCell className="text-slate-300">{row['ordem']}</TableCell>
                          <TableCell className="text-slate-300">{row['categoria']}</TableCell>
                          <TableCell
                            className="text-slate-300 max-w-xs truncate"
                            title={row['pergunta']}
                          >
                            {row['pergunta']}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {importPreview.length > 5 && (
                    <div className="p-3 text-center text-sm text-slate-500 bg-slate-950/50 border-t border-slate-800">
                      E mais {importPreview.length - 5} perguntas...
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="pt-4 border-t border-slate-800 mt-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsImportModalOpen(false)}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
              disabled={isImporting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmImport}
              disabled={importPreview.length === 0 || isImporting}
            >
              {isImporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Confirmar Importação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
