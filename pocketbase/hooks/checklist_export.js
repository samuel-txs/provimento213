routerAdd(
  'GET',
  '/backend/v1/checklist/export',
  (e) => {
    const perguntas = $app.findRecordsByFilter('perguntas_checklist', "id != ''", 'ordem', 10000, 0)

    let csv = 'Ordem,Categoria,Pergunta,Opção_1,Opção_2,Opção_3,Opção_4\n'

    const escapeCsv = (str) => {
      if (!str) return '""'
      const s = String(str)
      if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
        return `"${s.replace(/"/g, '""')}"`
      }
      return s
    }

    for (const p of perguntas) {
      const ordem = p.getInt('ordem') || 0
      const categoria = p.getString('categoria') || ''
      const pergunta = p.getString('texto_pergunta') || ''

      csv += `${ordem},${escapeCsv(categoria)},${escapeCsv(pergunta)},Não,Parcial,Completo,Não Sei Informar\n`
    }

    const now = new Date()
    const dateStr = now.toISOString().split('T')[0]
    const filename = `Checklist_Tiexpress_${dateStr}.csv`

    return e.json(200, { csvText: csv, filename: filename })
  },
  $apis.requireAuth(),
)
