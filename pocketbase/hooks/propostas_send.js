routerAdd(
  'POST',
  '/backend/v1/propostas/send',
  (e) => {
    const body = e.requestInfo().body || {}
    if (!body.email) {
      return e.badRequestError('Email é obrigatório para o envio da proposta.')
    }

    // Simulated PDF generation and email dispatch
    $app.logger().info('Email proposal sent', 'to', body.email, 'lead_id', body.lead_id)

    return e.json(200, {
      success: true,
      message: 'Proposta gerada e enviada por e-mail com sucesso.',
    })
  },
  $apis.requireAuth(),
)
