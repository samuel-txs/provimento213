onRecordAfterCreateSuccess((e) => {
  try {
    const crmUrl =
      $os.getenv('CRM_DESTINO_URL') || 'https://crm-txs.goskip.app/backend/v1/leads/create'

    const apiKey =
      $os.getenv('CRM_API_KEY') || 'txs_lead_live_8f3d9b4c6e1a72054b3e89a1c62f4e0b7a95d13e'

    const email = e.record.getString('email')
    if (!email) {
      console.log('[CRM Mirror] Lead criado sem email, ignorando espelhamento.')
      e.next()
      return
    }

    const leadName = e.record.getString('nome') || email.split('@')[0]
    const leadPhone = e.record.getString('telefone') || ''
    const leadCompany = e.record.getString('cartorio') || ''
    const leadCnpj = e.record.getString('cnpj') || ''
    const rawNotas = e.record.getString('notas') || ''
    const score = e.record.getInt('score') || 0
    const receitaPotencial = e.record.getFloat('receita_potencial') || 0

    // Compor mensagem com dados contextuais do Provimento 213 se disponíveis
    let messageContent = rawNotas
    const extras = []
    if (leadCompany) extras.push('Cartório: ' + leadCompany)
    if (leadCnpj) extras.push('CNPJ: ' + leadCnpj)
    if (score > 0) extras.push('Score Provimento 213: ' + score + '/100')
    if (receitaPotencial > 0) extras.push('Receita Potencial: R$ ' + receitaPotencial)

    if (extras.length > 0) {
      const extraBlock = '[Origem: App Provimento 213]\n' + extras.join('\n')
      messageContent = messageContent ? messageContent + '\n\n' + extraBlock : extraBlock
    }

    // usersCount e conversationId podem ser extraídos caso existam no schema ou virão com padrão
    let usersCount = 0
    try {
      usersCount = e.record.getInt('users_count') || 0
    } catch (_) {
      usersCount = 0
    }

    let conversationId = ''
    try {
      conversationId = e.record.getString('conversationId') || ''
    } catch (_) {
      conversationId = ''
    }

    const payload = {
      name: leadName,
      email: email,
      phone: leadPhone,
      message: messageContent,
      service: 'Provimento 213 CNJ',
      company: leadCompany,
      usersCount: usersCount,
      conversationId: conversationId,
    }

    const headers = {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
    }

    const res = $http.send({
      url: crmUrl,
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload),
      timeout: 15,
    })

    let responseBody = ''
    try {
      responseBody = res.raw ? String(res.raw) : JSON.stringify(res.json)
    } catch (_) {
      responseBody = ''
    }

    console.log(
      '[CRM Mirror Create Hook] Lead enviado para CRM:',
      email,
      'status HTTP:',
      res.statusCode,
      'resposta:',
      responseBody ? responseBody.slice(0, 300) : '',
    )
  } catch (err) {
    console.log('[CRM Mirror Create Hook Error]', String(err))
  }

  e.next()
}, 'leads')
