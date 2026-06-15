routerAdd('POST', '/backend/v1/send-email-pdf', async (e) => {
  const body = e.requestInfo().body || {}
  const { nome, email, cartorio, score, recomendacoes } = body

  const resendKey = $secrets.get('RESEND_API_KEY')
  if (!resendKey) {
    return e.internalServerError('RESEND_API_KEY not configured')
  }

  let email_ativo = 'true'
  let assunto = 'Seu Resultado de Conformidade Provimento 213 - Tiexpress'
  let corpoTpl = ''
  let email_destinatarios = ''
  let anexar_pdf = 'false'

  try {
    const records = $app.findRecordsByFilter(
      'configuracoes_plataforma',
      "chave ~ 'email_diagnostico_'",
      '',
      100,
      0,
    )
    for (const r of records) {
      if (r.getString('chave') === 'email_diagnostico_ativo') email_ativo = r.getString('valor')
      if (r.getString('chave') === 'email_diagnostico_assunto') assunto = r.getString('valor')
      if (r.getString('chave') === 'email_diagnostico_corpo') corpoTpl = r.getString('valor')
      if (r.getString('chave') === 'email_diagnostico_destinatarios')
        email_destinatarios = r.getString('valor')
      if (r.getString('chave') === 'email_diagnostico_anexar_pdf') anexar_pdf = r.getString('valor')
    }
  } catch (err) {
    console.log('Error reading configs', err)
  }

  if (email_ativo === 'false') {
    return e.json(200, { success: true, skipped: true })
  }

  const today = new Date().toLocaleDateString('pt-BR')

  if (corpoTpl) {
    corpoTpl = corpoTpl
      .replace(/{lead_nome}/g, nome || 'usuário')
      .replace(/{lead_cartorio}/g, cartorio || 'seu cartório')
      .replace(/{score_total}/g, score || 0)
      .replace(/{data_diagnostico}/g, today)
      .replace(/\n/g, '<br/>')
  }
  if (assunto) {
    assunto = assunto
      .replace(/{lead_nome}/g, nome || 'usuário')
      .replace(/{lead_cartorio}/g, cartorio || 'seu cartório')
      .replace(/{score_total}/g, score || 0)
      .replace(/{data_diagnostico}/g, today)
  }

  let htmlContent = ''
  if (corpoTpl) {
    htmlContent = `
      <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://img.usecurling.com/i?q=building&shape=solid-black&color=blue" alt="Tiexpress Logo" style="width: 64px; height: 64px;" />
        </div>
        <div>${corpoTpl}</div>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
        <p>Para conferir nossas propostas de serviços para adequação, acesse nosso <a href="https://provimento213.tiexpress.tec.br/servicos">Catálogo de Serviços</a>.</p>
        <br/>
        <p>Atenciosamente,<br/>Equipe Tiexpress</p>
      </div>
    `
  } else {
    htmlContent = `
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
  }

  let toAddresses = [email]
  if (email_destinatarios) {
    const extras = email_destinatarios
      .split(',')
      .map((e) => e.trim())
      .filter((e) => e)
    toAddresses = [...new Set([...toAddresses, ...extras])]
  }

  // To support attachments via Resend in the future, we evaluate anexar_pdf
  // For now we send the core email payload.
  const payload = {
    from: 'Tiexpress <onboarding@resend.dev>',
    to: toAddresses,
    subject: assunto,
    html: htmlContent,
  }

  const res = $http.send({
    url: 'https://api.resend.com/emails',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
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
