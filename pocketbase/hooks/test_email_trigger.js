routerAdd(
  'POST',
  '/backend/v1/test-email',
  (e) => {
    const auth = e.auth
    if (!auth || auth.getString('role') !== 'admin') {
      return e.unauthorizedError('Only admins can test emails')
    }

    const body = e.requestInfo().body
    const templateId = body.templateId
    const targetEmail = body.targetEmail

    if (!templateId || !targetEmail) {
      return e.badRequestError('templateId and targetEmail are required')
    }

    const apiKey = $secrets.get('RESEND_API_KEY')
    if (!apiKey) {
      return e.internalServerError('Missing RESEND_API_KEY')
    }

    let subject = 'Teste'
    let html = ''

    switch (templateId) {
      case 'boas_vindas':
        subject = 'Boas-vindas ao Tiexpress Provimento 213'
        html =
          '<div style="font-family: sans-serif; color: #1f2937;"><h1 style="color: #f97316;">Boas-vindas</h1><p>Este é um e-mail de teste de boas-vindas pós-diagnóstico.</p></div>'
        break
      case 'resultado':
        subject = 'Seu Resultado de Conformidade'
        html =
          '<div style="font-family: sans-serif; color: #1f2937;"><h1 style="color: #f97316;">Resultado</h1><p>Este é um e-mail de teste com seu resultado de conformidade.</p></div>'
        break
      case 'contato':
        subject = 'Contato Recebido'
        html =
          '<div style="font-family: sans-serif; color: #1f2937;"><h1 style="color: #f97316;">Contato</h1><p>Este é um e-mail de teste confirmando o recebimento de contato.</p></div>'
        break
      case 'proposta':
        subject = 'Nova Proposta Comercial'
        html =
          '<div style="font-family: sans-serif; color: #1f2937;"><h1 style="color: #f97316;">Proposta</h1><p>Este é um e-mail de teste de envio de proposta.</p></div>'
        break
      case 'followup':
        subject = 'Como podemos ajudar?'
        html =
          '<div style="font-family: sans-serif; color: #1f2937;"><h1 style="color: #f97316;">Follow-up</h1><p>Este é um e-mail de teste de follow-up.</p></div>'
        break
      default:
        return e.badRequestError('Invalid templateId')
    }

    try {
      const res = $http.send({
        url: 'https://api.resend.com/emails',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'TI Express <no-reply@tiexpress.tec.br>',
          to: [targetEmail],
          subject: subject,
          html: html,
        }),
      })

      const logsCol = $app.findCollectionByNameOrId('logs_email')
      const record = new Record(logsCol)
      record.set('template_name', templateId)
      record.set('destinatario', targetEmail)

      if (res.statusCode >= 200 && res.statusCode < 300) {
        record.set('status', 'sucesso')
        $app.save(record)
        return e.json(200, { success: true })
      } else {
        record.set('status', 'erro')
        record.set('erro_detalhe', JSON.stringify(res.json))
        $app.save(record)
        return e.badRequestError('Failed to send email: ' + JSON.stringify(res.json))
      }
    } catch (err) {
      const logsCol = $app.findCollectionByNameOrId('logs_email')
      const record = new Record(logsCol)
      record.set('template_name', templateId)
      record.set('destinatario', targetEmail)
      record.set('status', 'erro')
      record.set('erro_detalhe', err.message)
      $app.save(record)
      return e.internalServerError('Email transport error')
    }
  },
  $apis.requireAuth(),
)
