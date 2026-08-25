migrate(
  (app) => {
    // 1. Limpar dados anteriores para garantir estado limpo e idempotência
    app.db().newQuery('DELETE FROM opcoes_resposta').execute()
    app.db().newQuery('DELETE FROM perguntas_checklist').execute()

    const now = new Date().toISOString()

    const questionsData = [
      {
        categoria: 'Classe',
        texto_pergunta: 'Qual é a faixa de faturamento semestral da sua serventia?',
        ordem: 1,
        opcoes: [
          { texto_opcao: 'Até R$ 300 mil', valor: 'não', ordem: 1 },
          { texto_opcao: 'R$ 300 mil a R$ 1,5 milhão', valor: 'parcial', ordem: 2 },
          { texto_opcao: 'Acima de R$ 1,5 milhão', valor: 'completo', ordem: 3 },
        ],
      },
      {
        categoria: 'Backup',
        texto_pergunta: 'Como são executados os backups e os testes de restauração?',
        ordem: 2,
        opcoes: [
          { texto_opcao: 'Manual em HD externo', valor: 'não', ordem: 1 },
          { texto_opcao: 'Automático em nuvem comum', valor: 'parcial', ordem: 2 },
          {
            texto_opcao: 'Automático em nuvem imutável com atas documentadas',
            valor: 'completo',
            ordem: 3,
          },
        ],
      },
      {
        categoria: 'Segurança',
        texto_pergunta: 'Qual o nível de proteção de rede e computadores?',
        ordem: 3,
        opcoes: [
          { texto_opcao: 'Antivírus gratuito/comum', valor: 'não', ordem: 1 },
          {
            texto_opcao: 'Antivírus corporativo sem monitoramento ativo',
            valor: 'parcial',
            ordem: 2,
          },
          { texto_opcao: 'EDR avançado com firewall gerenciado', valor: 'completo', ordem: 3 },
        ],
      },
      {
        categoria: 'DPO',
        texto_pergunta: 'Como comprova a conformidade de proteção de dados?',
        ordem: 4,
        opcoes: [
          { texto_opcao: 'Sem políticas formais ou DPO', valor: 'não', ordem: 1 },
          {
            texto_opcao: 'Políticas avulsas em Word/PDF sem integração',
            valor: 'parcial',
            ordem: 2,
          },
          {
            texto_opcao: 'DPO ativo com dossiê estruturado criptograficamente',
            valor: 'completo',
            ordem: 3,
          },
        ],
      },
    ]

    for (const q of questionsData) {
      const qId = $security.randomString(15)

      // Inserir pergunta via app.db().newQuery()
      app
        .db()
        .newQuery(
          'INSERT INTO perguntas_checklist (id, categoria, texto_pergunta, ordem, created, updated) VALUES ({:id}, {:categoria}, {:texto_pergunta}, {:ordem}, {:created}, {:updated})',
        )
        .bind({
          id: qId,
          categoria: q.categoria,
          texto_pergunta: q.texto_pergunta,
          ordem: q.ordem,
          created: now,
          updated: now,
        })
        .execute()

      // Inserir as 3 opções vinculadas ao ID da pergunta
      for (const opt of q.opcoes) {
        const optId = $security.randomString(15)
        app
          .db()
          .newQuery(
            'INSERT INTO opcoes_resposta (id, pergunta_id, texto_opcao, valor, ordem, created, updated) VALUES ({:id}, {:pergunta_id}, {:texto_opcao}, {:valor}, {:ordem}, {:created}, {:updated})',
          )
          .bind({
            id: optId,
            pergunta_id: qId,
            texto_opcao: opt.texto_opcao,
            valor: opt.valor,
            ordem: opt.ordem,
            created: now,
            updated: now,
          })
          .execute()
      }
    }
  },
  (app) => {
    app.db().newQuery('DELETE FROM opcoes_resposta').execute()
    app.db().newQuery('DELETE FROM perguntas_checklist').execute()
  },
)
