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
      const crmUrl = ($os.getenv('CRM_DESTINO_URL') || '').replace(/\/$/, '')
      const crmToken = $os.getenv('CRM_DESTINO_TOKEN') || ''

      let probeResult = ''
      try {
        const resColls = $http.send({
          url: crmUrl + '/api/collections?page=1&perPage=100',
          method: 'GET',
          headers: {
            Authorization: 'Bearer ' + crmToken,
          },
          timeout: 10,
        })
        probeResult = 'Status: ' + resColls.statusCode + ' | ' + JSON.stringify(resColls.json)
      } catch (httpErr) {
        probeResult = 'HttpErr: ' + String(httpErr)
      }

      log.set('status', 'sucesso')
      log.set('erro_detalhe', probeResult.slice(0, 5000))
      $app.save(log)

      return e.json(200, { message: 'Teste executado.', probe: probeResult })
    } catch (err) {
      log.set('status', 'erro')
      log.set('erro_detalhe', err.message)
      $app.save(log)

      return e.badRequestError('Falha: ' + err.message)
    }
  },
  $apis.requireAuth(),
)
