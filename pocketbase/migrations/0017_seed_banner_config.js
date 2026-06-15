migrate(
  (app) => {
    const configs = [
      { chave: 'banner_ativo', valor: 'true' },
      {
        chave: 'banner_texto',
        valor:
          'Prazo de adequação ao Provimento 213 do CNJ em vigor — serventias não adequadas estão sujeitas a sanções administrativas',
      },
      { chave: 'banner_botao_texto', valor: 'Verificar Status da Minha Serventia' },
      { chave: 'banner_cor', valor: '#b91c1c' },
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
  (app) => {
    const keys = ['banner_ativo', 'banner_texto', 'banner_botao_texto', 'banner_cor']
    for (const k of keys) {
      try {
        const record = app.findFirstRecordByData('configuracoes_plataforma', 'chave', k)
        app.delete(record)
      } catch (_) {}
    }
  },
)
