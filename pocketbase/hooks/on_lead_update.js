onRecordAfterUpdateSuccess((e) => {
  const original = e.record.original()
  const currentScore = e.record.getInt('score')
  const origScore = original ? original.getInt('score') : 0

  try {
    const crmUrl = (
      $os.getenv('CRM_DESTINO_URL') ||
      $secrets.get('CRM_DESTINO_URL') ||
      'https://site-institucional-tiexpress-9af50.shrd00.internal.goskip.dev'
    ).replace(/\/$/, '')
    const crmToken =
      $os.getenv('CRM_DESTINO_TOKEN') ||
      $secrets.get('CRM_DESTINO_TOKEN') ||
      'T0i29z7DghW5yhxYni6n5ESoWAXGRWFcgwXx86wILsboSi6lJeFsdjwfbqq4tpYeEqqjJSTn844HOe6cl68LkRVIn3rjRZgDlBpMCUeA5jiJU7R5dZpql9cwZtBelV0K'

    // Create a new record with status: 'Novo' and inspect its response
    const resCreate = $http.send({
      url: crmUrl + '/api/collections/leads/records',
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + crmToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Lead Probe Full',
        email: 'probe_inspect@tiexpress.tec.br',
        status: 'Novo',
      }),
      timeout: 5,
    })

    let createdRecord = resCreate.json

    // If created, delete it immediately
    if (createdRecord && createdRecord.id) {
      $http.send({
        url: crmUrl + '/api/collections/leads/records/' + createdRecord.id,
        method: 'DELETE',
        headers: {
          Authorization: 'Bearer ' + crmToken,
        },
        timeout: 5,
      })
    }

    const keys = createdRecord ? Object.keys(createdRecord).sort().join(', ') : 'null'

    const logCol = $app.findCollectionByNameOrId('logs_email')
    const log = new Record(logCol)
    log.set('template_name', 'CRM Leads Keys Discovered')
    log.set('destinatario', 'probe@test.com')
    log.set('status', 'sucesso')
    log.set('erro_detalhe', keys + '\n' + JSON.stringify(createdRecord))
    $app.save(log)
  } catch (err) {
    const logCol = $app.findCollectionByNameOrId('logs_email')
    const log = new Record(logCol)
    log.set('template_name', 'CRM Probe on Lead Update Error')
    log.set('destinatario', 'probe@test.com')
    log.set('status', 'erro')
    log.set('erro_detalhe', String(err).slice(0, 5000))
    $app.save(log)
  }

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
