routerAdd('POST', '/backend/v1/send-email', (e) => {
  const body = e.requestInfo().body || {}
  const { to, subject, html } = body

  if (!to || !subject || !html) {
    return e.badRequestError('Missing required fields: to, subject, html')
  }

  const apiKey = $secrets.get('RESEND_API_KEY')
  if (!apiKey) {
    return e.internalServerError('Email service not configured')
  }

  const res = $http.send({
    url: 'https://api.resend.com/emails',
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Tiexpress <nao-responda@tiexpress.tec.br>',
      to: [to],
      subject: subject,
      html: html,
    }),
    timeout: 15,
  })

  if (res.statusCode >= 200 && res.statusCode < 300) {
    return e.json(200, { success: true, messageId: res.json?.id || 'sent' })
  } else {
    $app
      .logger()
      .error(
        'Failed to send email via Resend',
        'status',
        res.statusCode,
        'response',
        JSON.stringify(res.json),
      )
    return e.json(res.statusCode, {
      success: false,
      error: res.json?.message || 'Failed to send email',
    })
  }
})
