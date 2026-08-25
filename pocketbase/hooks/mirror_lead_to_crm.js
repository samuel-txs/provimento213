onRecordAfterCreateSuccess((e) => {
  try {
    const crmUrl = (
      $os.getenv('CRM_DESTINO_URL') ||
      'https://site-institucional-tiexpress-9af50.shrd00.internal.goskip.dev'
    ).replace(/\/$/, '')
    const crmToken =
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
    const rawStatus = e.record.getString('status') || 'novo'
    const score = e.record.getInt('score') || 0
    const rawNotas = e.record.getString('notas') || ''
    const receitaPotencial = e.record.getFloat('receita_potencial') || 0

    // Mapeamento de status: o destino aceita 'Novo' ou 'novo' (capitalize)
    let statusDestino = 'Novo'
    if (rawStatus === 'convertido') statusDestino = 'Convertido'
    else if (rawStatus === 'contatado') statusDestino = 'Contatado'
    else if (rawStatus === 'negociando') statusDestino = 'Negociando'
    else if (rawStatus === 'novo') statusDestino = 'Novo'

    // Compor notas com dados contextuais do Provimento 213
    let notesContent = rawNotas
    const extras = []
    if (cartorio) extras.push('Cartório: ' + cartorio)
    if (cnpj) extras.push('CNPJ: ' + cnpj)
    if (score > 0) extras.push('Score Provimento 213: ' + score + '/100')
    if (receitaPotencial > 0) extras.push('Receita Potencial: R$ ' + receitaPotencial)

    if (extras.length > 0) {
      const extraBlock = '[Origem: App Provimento 213]\n' + extras.join('\n')
      notesContent = notesContent ? notesContent + '\n\n' + extraBlock : extraBlock
    }

    const payload = {
      name: nome,
      email: email,
      phone: telefone,
      company: cartorio,
      status: statusDestino,
      notes: notesContent,
      service: 'Provimento 213 CNJ',
    }

    // 1. Verificar se lead já existe no CRM de destino pelo email
    const safeEmail = email.replace(/'/g, "\\'")
    const checkRes = $http.send({
      url:
        crmUrl +
        '/api/collections/leads/records?filter=' +
        encodeURIComponent("(email='" + safeEmail + "')"),
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + crmToken,
      },
      timeout: 10,
    })

    let existingId = null
    if (
      checkRes &&
      checkRes.statusCode === 200 &&
      checkRes.json &&
      checkRes.json.items &&
      checkRes.json.items.length > 0
    ) {
      existingId = checkRes.json.items[0].id
    }

    if (existingId) {
      // 2. Atualizar registro existente (PATCH)
      const updateRes = $http.send({
        url: crmUrl + '/api/collections/leads/records/' + existingId,
        method: 'PATCH',
        headers: {
          Authorization: 'Bearer ' + crmToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        timeout: 10,
      })
      console.log(
        '[CRM Mirror Create Hook -> Update] Lead atualizado no CRM:',
        email,
        'status HTTP:',
        updateRes.statusCode,
      )
    } else {
      // 3. Criar novo registro (POST)
      const createRes = $http.send({
        url: crmUrl + '/api/collections/leads/records',
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + crmToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        timeout: 10,
      })
      console.log(
        '[CRM Mirror Create Hook -> Create] Lead criado no CRM:',
        email,
        'status HTTP:',
        createRes.statusCode,
      )
    }
  } catch (err) {
    console.log('[CRM Mirror Create Hook Error]', String(err))
  }

  e.next()
}, 'leads')

onRecordAfterUpdateSuccess((e) => {
  try {
    const crmUrl = (
      $os.getenv('CRM_DESTINO_URL') ||
      'https://site-institucional-tiexpress-9af50.shrd00.internal.goskip.dev'
    ).replace(/\/$/, '')
    const crmToken =
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
    const rawStatus = e.record.getString('status') || 'novo'
    const score = e.record.getInt('score') || 0
    const rawNotas = e.record.getString('notas') || ''
    const receitaPotencial = e.record.getFloat('receita_potencial') || 0

    let statusDestino = 'Novo'
    if (rawStatus === 'convertido') statusDestino = 'Convertido'
    else if (rawStatus === 'contatado') statusDestino = 'Contatado'
    else if (rawStatus === 'negociando') statusDestino = 'Negociando'
    else if (rawStatus === 'novo') statusDestino = 'Novo'

    let notesContent = rawNotas
    const extras = []
    if (cartorio) extras.push('Cartório: ' + cartorio)
    if (cnpj) extras.push('CNPJ: ' + cnpj)
    if (score > 0) extras.push('Score Provimento 213: ' + score + '/100')
    if (receitaPotencial > 0) extras.push('Receita Potencial: R$ ' + receitaPotencial)

    if (extras.length > 0) {
      const extraBlock = '[Origem: App Provimento 213]\n' + extras.join('\n')
      notesContent = notesContent ? notesContent + '\n\n' + extraBlock : extraBlock
    }

    const payload = {
      name: nome,
      email: email,
      phone: telefone,
      company: cartorio,
      status: statusDestino,
      notes: notesContent,
      service: 'Provimento 213 CNJ',
    }

    const safeEmail = email.replace(/'/g, "\\'")
    const checkRes = $http.send({
      url:
        crmUrl +
        '/api/collections/leads/records?filter=' +
        encodeURIComponent("(email='" + safeEmail + "')"),
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + crmToken,
      },
      timeout: 10,
    })

    let existingId = null
    if (
      checkRes &&
      checkRes.statusCode === 200 &&
      checkRes.json &&
      checkRes.json.items &&
      checkRes.json.items.length > 0
    ) {
      existingId = checkRes.json.items[0].id
    }

    if (existingId) {
      const updateRes = $http.send({
        url: crmUrl + '/api/collections/leads/records/' + existingId,
        method: 'PATCH',
        headers: {
          Authorization: 'Bearer ' + crmToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        timeout: 10,
      })
      console.log(
        '[CRM Mirror Update Hook -> Update] Lead atualizado no CRM:',
        email,
        'status HTTP:',
        updateRes.statusCode,
      )
    } else {
      const createRes = $http.send({
        url: crmUrl + '/api/collections/leads/records',
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + crmToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        timeout: 10,
      })
      console.log(
        '[CRM Mirror Update Hook -> Create] Lead criado no CRM:',
        email,
        'status HTTP:',
        createRes.statusCode,
      )
    }
  } catch (err) {
    console.log('[CRM Mirror Update Hook Error]', String(err))
  }

  e.next()
}, 'leads')
