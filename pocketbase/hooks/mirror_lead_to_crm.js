onRecordAfterCreateSuccess((e) => {
  try {
    const crmUrl =
      $os.getenv('CRM_DESTINO_URL') ||
      'https://site-institucional-tiexpress-copy-e3bff.shrd00.internal.goskip.dev/backend/v1/leads/create'

    const apiKey =
      $os.getenv('CRM_API_KEY') ||
      $os.getenv('CRM_DESTINO_TOKEN') ||
      'T0i29z7DghW5yhxYni6n5ESoWAXGRWFcgwXx86wILsboSi6lJeFsdjwfbqq4tpYeEqqjJSTn844HOe6cl68LkRVIn3rjRZgDlBpMCUeA5jiJU7R5dZpql9cwZtBelV0K'

    const email = e.record.getString('email')
    if (!email) {
      console.log('[CRM Mirror] Lead criado sem email, ignorando espelhamento.')
      e.next()
      return
    }

    const nome = e.record.getString('nome') || email.split('@')[0]
    const telefone = e.record.getString('telefone') || ''
    const cartorio = e.record.getString('cartorio') || ''
    const cnpj = e.record.getString('cnpj') || ''
    const rawNotas = e.record.getString('notas') || ''
    const score = e.record.getInt('score') || 0
    const receitaPotencial = e.record.getFloat('receita_potencial') || 0

    // Compor mensagem com dados contextuais do Provimento 213
    let messageContent = rawNotas
    const extras = []
    if (cartorio) extras.push('Cartório: ' + cartorio)
    if (cnpj) extras.push('CNPJ: ' + cnpj)
    if (score > 0) extras.push('Score Provimento 213: ' + score + '/100')
    if (receitaPotencial > 0) extras.push('Receita Potencial: R$ ' + receitaPotencial)

    if (extras.length > 0) {
      const extraBlock = '[Origem: App Provimento 213]\n' + extras.join('\n')
      messageContent = messageContent ? messageContent + '\n\n' + extraBlock : extraBlock
    }

    const payload = {
      name: nome,
      email: email,
      phone: telefone,
      message: messageContent,
      service: 'Provimento 213 CNJ',
      company: cartorio,
      usersCount: 0,
      conversationId: '',
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

    console.log(
      '[CRM Mirror Create Hook] Lead enviado para CRM:',
      email,
      'status HTTP:',
      res.statusCode,
    )
  } catch (err) {
    console.log('[CRM Mirror Create Hook Error]', String(err))
  }

  e.next()
}, 'leads')

onRecordAfterUpdateSuccess((e) => {
  try {
    const crmUrl =
      $os.getenv('CRM_DESTINO_URL') ||
      'https://site-institucional-tiexpress-copy-e3bff.shrd00.internal.goskip.dev/backend/v1/leads/create'

    const apiKey =
      $os.getenv('CRM_API_KEY') ||
      $os.getenv('CRM_DESTINO_TOKEN') ||
      'T0i29z7DghW5yhxYni6n5ESoWAXGRWFcgwXx86wILsboSi6lJeFsdjwfbqq4tpYeEqqjJSTn844HOe6cl68LkRVIn3rjRZgDlBpMCUeA5jiJU7R5dZpql9cwZtBelV0K'

    const email = e.record.getString('email')
    if (!email) {
      console.log('[CRM Mirror Update Hook] Lead sem email, ignorando.')
      e.next()
      return
    }

    const nome = e.record.getString('nome') || email.split('@')[0]
    const telefone = e.record.getString('telefone') || ''
    const cartorio = e.record.getString('cartorio') || ''
    const cnpj = e.record.getString('cnpj') || ''
    const rawNotas = e.record.getString('notas') || ''
    const score = e.record.getInt('score') || 0
    const receitaPotencial = e.record.getFloat('receita_potencial') || 0

    let messageContent = rawNotas
    const extras = []
    if (cartorio) extras.push('Cartório: ' + cartorio)
    if (cnpj) extras.push('CNPJ: ' + cnpj)
    if (score > 0) extras.push('Score Provimento 213: ' + score + '/100')
    if (receitaPotencial > 0) extras.push('Receita Potencial: R$ ' + receitaPotencial)

    if (extras.length > 0) {
      const extraBlock = '[Origem: App Provimento 213]\n' + extras.join('\n')
      messageContent = messageContent ? messageContent + '\n\n' + extraBlock : extraBlock
    }

    const payload = {
      name: nome,
      email: email,
      phone: telefone,
      message: messageContent,
      service: 'Provimento 213 CNJ',
      company: cartorio,
      usersCount: 0,
      conversationId: '',
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

    console.log(
      '[CRM Mirror Update Hook] Lead enviado para CRM:',
      email,
      'status HTTP:',
      res.statusCode,
    )
  } catch (err) {
    console.log('[CRM Mirror Update Hook Error]', String(err))
  }

  e.next()
}, 'leads')
