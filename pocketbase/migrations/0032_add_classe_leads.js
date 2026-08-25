migrate(
  (app) => {
    // 1. Adicionar campo classe na collection leads
    const leads = app.findCollectionByNameOrId('leads')
    if (!leads.fields.getByName('classe')) {
      leads.fields.add(
        new SelectField({
          name: 'classe',
          values: ['Classe-1-Essencial', 'Classe-2-Avancado', 'Classe-3-Enterprise'],
          maxSelect: 1,
          required: false,
        }),
      )
    }
    app.save(leads)

    // 2. Seeds em configuracoes_plataforma
    const configCol = app.findCollectionByNameOrId('configuracoes_plataforma')

    const emailTemplateClasse1 = `---SUBJECT---
Sua serventia está no caminho certo — Tiexpress Provimento 213
---BODY---
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h1 style="color: #0f172a; font-size: 22px; margin: 0 0 8px 0;">Plano Essencial de Conformidade</h1>
    <p style="color: #64748b; font-size: 14px; margin: 0;">Provimento 213 do CNJ para Serventias Extrajudiciais</p>
  </div>
  <p>Olá, <strong>{nome}</strong>,</p>
  <p>Agradecemos por realizar o diagnóstico de conformidade para o <strong>{cartorio}</strong>. Sua serventia foi classificada como <strong>{classe}</strong> com pontuação de <strong>{score}/100</strong>.</p>
  <p>Para atender com eficiência e baixo custo aos requisitos normativos essenciais, a Tiexpress desenvolveu soluções simplificadas e acessíveis, ideais para a infraestrutura da sua serventia:</p>
  <ul style="padding-left: 20px; color: #334155; line-height: 1.6;">
    <li>Rotina de backup automatizado e seguro;</li>
    <li>Proteção essencial de rede e estações de trabalho;</li>
    <li>Adequação simplificada aos requisitos do Provimento 213.</li>
  </ul>
  <p>Nossa equipe entrará em contato em breve para apresentar opções sob medida com excelente custo-benefício.</p>
  <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #64748b; text-align: center;">
    <p style="margin: 0;">Tiexpress — Tecnologia e Governança Cartorária</p>
    <p style="margin: 4px 0 0 0;">contato@tiexpress.tec.br</p>
  </div>
</div>`

    const emailTemplateClasse2 = `---SUBJECT---
Proteja sua serventia com governança avançada — Tiexpress Provimento 213
---BODY---
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h1 style="color: #0f172a; font-size: 22px; margin: 0 0 8px 0;">Governança e Segurança Avançada</h1>
    <p style="color: #64748b; font-size: 14px; margin: 0;">Conformidade Estratégica com o Provimento 213 do CNJ</p>
  </div>
  <p>Olá, <strong>{nome}</strong>,</p>
  <p>Analisamos o diagnóstico do <strong>{cartorio}</strong>, enquadrado na categoria <strong>{classe}</strong> com pontuação alcançada de <strong>{score}/100</strong>.</p>
  <p>Serventias desse porte exigem mecanismos rigorosos de governança, blindagem digital e conformidade contínua para mitigar riscos regulatórios e operacionais:</p>
  <ul style="padding-left: 20px; color: #334155; line-height: 1.6;">
    <li><strong>Dossiê Criptográfico e Rastreabilidade:</strong> Evidências técnicas invioláveis prontas para auditorias e correições;</li>
    <li><strong>Segurança Avançada (EDR + Firewall Gerenciado):</strong> Proteção ativa contra ameaças cibernéticas e sequestro de dados;</li>
    <li><strong>Nuvem Imutável e Alta Disponibilidade:</strong> Continuidade de negócios com testes periódicos de restauração.</li>
  </ul>
  <p>Um de nossos especialistas executivos entrará em contato para agendar uma apresentação detalhada e consultiva.</p>
  <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #64748b; text-align: center;">
    <p style="margin: 0;">Tiexpress — Tecnologia e Governança Cartorária</p>
    <p style="margin: 4px 0 0 0;">contato@tiexpress.tec.br</p>
  </div>
</div>`

    const seedConfigs = [
      {
        chave: 'email_template_classe1',
        valor: emailTemplateClasse1,
      },
      {
        chave: 'email_template_classe2',
        valor: emailTemplateClasse2,
      },
      {
        chave: 'vendedor_n1_user_id',
        valor: 'elk90bvcq9inslc',
      },
      {
        chave: 'consultor_executivo_user_id',
        valor: 'elk90bvcq9inslc',
      },
    ]

    for (const cfg of seedConfigs) {
      try {
        const existing = app.findFirstRecordByData('configuracoes_plataforma', 'chave', cfg.chave)
        existing.set('valor', cfg.valor)
        app.save(existing)
      } catch (_) {
        const record = new Record(configCol)
        record.set('chave', cfg.chave)
        record.set('valor', cfg.valor)
        app.save(record)
      }
    }
  },
  (app) => {
    const leads = app.findCollectionByNameOrId('leads')
    if (leads.fields.getByName('classe')) {
      leads.fields.removeByName('classe')
      app.save(leads)
    }

    const keysToDelete = [
      'email_template_classe1',
      'email_template_classe2',
      'vendedor_n1_user_id',
      'consultor_executivo_user_id',
    ]

    for (const key of keysToDelete) {
      try {
        const record = app.findFirstRecordByData('configuracoes_plataforma', 'chave', key)
        app.delete(record)
      } catch (_) {}
    }
  },
)
