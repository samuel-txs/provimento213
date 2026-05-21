migrate(
  (app) => {
    const servicosCol = app.findCollectionByNameOrId('servicos')
    const precosCol = app.findCollectionByNameOrId('precos_servicos')

    const s1 = new Record(servicosCol)
    s1.set('nome', 'Diagnóstico LGPD Completo')
    s1.set(
      'descricao',
      'Avaliação detalhada da conformidade do cartório com a Lei Geral de Proteção de Dados e Provimento 213 do CNJ.',
    )
    s1.set('categoria', 'Diagnóstico')
    s1.set('icone_url', 'search')
    app.save(s1)

    const s2 = new Record(servicosCol)
    s2.set('nome', 'Adequação Provimento 213 (Pacote Base)')
    s2.set(
      'descricao',
      'Implementação das diretrizes de segurança da informação exigidas para serventias extrajudiciais.',
    )
    s2.set('categoria', 'Implementação')
    s2.set('icone_url', 'shield-check')
    app.save(s2)

    const s3 = new Record(servicosCol)
    s3.set('nome', 'Suporte Contínuo Nível 1')
    s3.set(
      'descricao',
      'Assistência técnica para dúvidas e pequenos incidentes de segurança cibernética e infraestrutura.',
    )
    s3.set('categoria', 'Suporte')
    s3.set('icone_url', 'headset')
    app.save(s3)

    const s4 = new Record(servicosCol)
    s4.set('nome', 'Treinamento de Equipe em SI')
    s4.set(
      'descricao',
      'Capacitação presencial ou remota para os funcionários sobre boas práticas de segurança e privacidade.',
    )
    s4.set('categoria', 'Treinamento')
    s4.set('icone_url', 'users')
    app.save(s4)

    const s5 = new Record(servicosCol)
    s5.set('nome', 'Consultoria Estratégica TI')
    s5.set(
      'descricao',
      'Acompanhamento estratégico para planejamento de evolução do parque tecnológico do cartório.',
    )
    s5.set('categoria', 'Consultoria')
    s5.set('icone_url', 'line-chart')
    app.save(s5)

    const portes = ['Pequeno', 'Médio', 'Grande']
    const multiplier = { Pequeno: 1, Médio: 1.5, Grande: 2 }

    ;[s1, s2, s3, s4, s5].forEach((s) => {
      let baseProjeto = 1500
      let baseMensal = 0

      if (s.getString('categoria') === 'Suporte') {
        baseProjeto = 0
        baseMensal = 500
      } else if (s.getString('categoria') === 'Consultoria') {
        baseProjeto = 0
        baseMensal = 800
      }

      portes.forEach((porte) => {
        const p = new Record(precosCol)
        p.set('servico_id', s.id)
        p.set('porte', porte)
        p.set('valor_projeto', baseProjeto * multiplier[porte])
        p.set('valor_mensal', baseMensal * multiplier[porte])
        app.save(p)
      })
    })
  },
  (app) => {
    // Can truncate if needed, but safe to leave for downgrade
  },
)
