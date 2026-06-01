routerAdd('POST', '/backend/v1/send-email-pdf', async (e) => {
  const body = e.requestInfo().body || {}
  const { nome, email, cartorio, score, recomendacoes } = body

  const resendKey = $secrets.get('RESEND_API_KEY')
  if (!resendKey) {
    return e.internalServerError('RESEND_API_KEY not configured')
  }

  const htmlContent = `
    <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://img.usecurling.com/i?q=building&shape=solid-black&color=blue" alt="Tiexpress Logo" style="width: 64px; height: 64px;" />
      </div>
      <h2 style="text-align: center; color: #1e293b;">Relatório de Conformidade</h2>
      <p>Olá ${nome || 'usuário'},</p>
      <p>A análise de conformidade do <strong>${cartorio || 'seu cartório'}</strong> resultou em um score de ${score || 0}%.</p>
      
      ${
        recomendacoes && recomendacoes.length > 0
          ? `
      <h3>Principais Recomendações:</h3>
      <ul>
        ${recomendacoes.map((rec) => `<li><strong>${rec.categoria}:</strong> ${rec.texto}</li>`).join('')}
      </ul>
      `
          : '<p>Sua serventia atendeu aos requisitos básicos de forma excelente.</p>'
      }
      
      <p>Para conferir nossas propostas de serviços para adequação, acesse nosso <a href="https://provimento213.tiexpress.tec.br/servicos">Catálogo de Serviços</a>.</p>
      <br/>
      <p>Atenciosamente,<br/>Equipe Tiexpress</p>
    </div>
  `

  const res = $http.send({
    url: 'https://api.resend.com/emails',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Tiexpress <onboarding@resend.dev>',
      to: email,
      subject: 'Seu Resultado de Conformidade Provimento 213 - Tiexpress',
      html: htmlContent,
    }),
  })

  if (res.statusCode >= 400) {
    let errBody = ''
    try {
      errBody = new TextDecoder().decode(res.body)
    } catch (_) {}
    $app.logger().error('Resend error', 'status', res.statusCode, 'body', errBody)
    return e.internalServerError('Failed to send email')
  }

  return e.json(200, { success: true })
})
