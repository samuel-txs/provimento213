routerAdd('POST', '/backend/v1/leads/upsert', (e) => {
  const body = e.requestInfo().body
  const email = body.email
  if (!email) {
    return e.badRequestError('Email is required')
  }

  let record
  try {
    record = $app.findFirstRecordByData('leads', 'email', email)
  } catch (_) {
    // Lead not found, will create one
  }

  if (record) {
    if (body.nome) record.set('nome', body.nome)
    if (body.telefone) record.set('telefone', body.telefone)
    if (body.cartorio) record.set('cartorio', body.cartorio)
    if (body.cnpj) record.set('cnpj', body.cnpj)
    if (body.score !== undefined) record.set('score', body.score)

    if (body.autorizacao) {
      const currentNotes = record.getString('notas') || ''
      if (!currentNotes.includes('Autorizou contato')) {
        record.set(
          'notas',
          (currentNotes + '\nAutorizou contato comercial em: ' + new Date().toISOString()).trim(),
        )
      }
    }

    $app.save(record)
    return e.json(200, record)
  } else {
    const collection = $app.findCollectionByNameOrId('leads')
    record = new Record(collection)
    record.set('nome', body.nome || '')
    record.set('email', body.email)
    record.set('telefone', body.telefone || '')
    record.set('cartorio', body.cartorio || '')
    record.set('cnpj', body.cnpj || '')
    record.set('status', 'novo')
    if (body.score !== undefined) record.set('score', body.score)

    if (body.autorizacao) {
      record.set('notas', 'Autorizou contato comercial em: ' + new Date().toISOString())
    }

    $app.save(record)
    return e.json(200, record)
  }
})
