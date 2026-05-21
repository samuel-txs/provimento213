routerAdd('POST', '/backend/v1/proposals/send', (e) => {
  const body = e.requestInfo().body || {}
  if (!body.email) {
    return e.badRequestError('Email é obrigatório para o envio da proposta.')
  }

  // Simulating an email dispatch via Skip Cloud Edge Function equivalent
  $app.logger().info('Email proposal sent', 'to', body.email, 'sessao_id', body.sessao_id)

  return e.json(200, { success: true, message: 'Proposta enviada por e-mail.' })
})
