migrate(
  (app) => {
    const configs = [
      { chave: 'nome_empresa', valor: 'Tiexpress Soluções' },
      { chave: 'logo_url', valor: '' },
      { chave: 'email_contato', valor: 'contato@tiexpress.tec.br' },
      { chave: 'telefone', valor: '62984778861' },
      { chave: 'endereco', valor: 'Goiânia, GO' },
      { chave: 'cor_primaria', valor: '#eb5e28' },
      { chave: 'cor_secundaria', valor: '#0fb781' },
      {
        chave: 'mensagem_boas_vindas',
        valor: 'Sua serventia em conformidade com o Provimento 213 do CNJ.',
      },
      {
        chave: 'mensagem_sucesso',
        valor: 'Diagnóstico concluído com sucesso! Em breve um especialista entrará em contato.',
      },
      {
        chave: 'termos_consentimento',
        valor:
          'Ao prosseguir, você concorda com nossos termos de uso e política de privacidade conforme as diretrizes da LGPD.',
      },
    ]

    const col = app.findCollectionByNameOrId('configuracoes_plataforma')
    for (const c of configs) {
      try {
        app.findFirstRecordByData('configuracoes_plataforma', 'chave', c.chave)
      } catch (_) {
        const record = new Record(col)
        record.set('chave', c.chave)
        record.set('valor', c.valor)
        app.save(record)
      }
    }
  },
  (app) => {},
)
