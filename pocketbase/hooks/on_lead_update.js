onRecordAfterUpdateSuccess((e) => {
  const original = e.record.original()
  const currentScore = e.record.getInt('score')
  const origScore = original.getInt('score')

  if (currentScore > 0 && origScore === 0) {
    const leadId = e.record.id
    const checklistCol = $app.findCollectionByNameOrId('checklist_tarefas')

    const tasks = [
      { titulo: 'Instalar Firewall Corporativo', categoria: 'Infraestrutura' },
      { titulo: 'Configurar Rotina de Backup Cloud', categoria: 'Segurança' },
      { titulo: 'Renovar Certificados Digitais', categoria: 'Conformidade' },
      { titulo: 'Atualizar Sistemas Operacionais (EOL)', categoria: 'Infraestrutura' },
    ]

    if (currentScore <= 70) {
      tasks.push({ titulo: 'Contratar Consultoria Diagnóstica', categoria: 'Gestão' })
    }

    for (const t of tasks) {
      const taskRecord = new Record(checklistCol)
      taskRecord.set('lead_id', leadId)
      taskRecord.set('titulo', t.titulo)
      taskRecord.set('categoria', t.categoria)
      taskRecord.set('concluido', false)
      $app.save(taskRecord)
    }
  }
  e.next()
}, 'leads')
