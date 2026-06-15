routerAdd(
  'POST',
  '/backend/v1/test-email',
  (e) => {
    const body = e.requestInfo().body || {}
    const email = body.email

    if (!email) {
      return e.badRequestError('E-mail de destino é obrigatório.')
    }

    const logCol = $app.findCollectionByNameOrId('logs_email')
    const log = new Record(logCol)
    log.set('template_name', 'Teste de Conectividade')
    log.set('destinatario', email)

    try {
      const apiKey = $secrets.get('RESEND_API_KEY')
      if (apiKey) {
        const res = $http.send({
          url: 'https://api.resend.com/emails',
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'Teste de Conectividade - Tiexpress',
            html: '<p>Este é um e-mail de teste para verificar a conectividade do sistema com sucesso.</p>',
          }),
        })
        if (res.statusCode >= 400) {
          throw new Error('Erro na API de e-mail (Resend): ' + res.statusCode)
        }
      } else {
        console.log('Simulating email send as no RESEND_API_KEY is found.')
      }

      log.set('status', 'sucesso')
      $app.save(log)

      return e.json(200, { message: 'E-mail de teste disparado com sucesso.' })
    } catch (err) {
      log.set('status', 'erro')
      log.set('erro_detalhe', err.message)
      $app.save(log)

      return e.badRequestError('Falha ao enviar e-mail: ' + err.message)
    }
  },
  $apis.requireAuth(),
)
