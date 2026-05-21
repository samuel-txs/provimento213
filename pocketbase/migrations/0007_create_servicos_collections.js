migrate(
  (app) => {
    const servicos = new Collection({
      name: 'servicos',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'nome', type: 'text', required: true },
        { name: 'descricao', type: 'text', required: true },
        {
          name: 'categoria',
          type: 'select',
          required: true,
          values: ['Diagnóstico', 'Implementação', 'Suporte', 'Treinamento', 'Consultoria'],
        },
        { name: 'icone_url', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(servicos)

    const precos = new Collection({
      name: 'precos_servicos',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'servico_id',
          type: 'relation',
          required: true,
          collectionId: servicos.id,
          maxSelect: 1,
        },
        { name: 'porte', type: 'select', required: true, values: ['Pequeno', 'Médio', 'Grande'] },
        { name: 'valor_mensal', type: 'number' },
        { name: 'valor_projeto', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(precos)

    const leadsCol = app.findCollectionByNameOrId('leads')

    const carrinho = new Collection({
      name: 'carrinho_servicos',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
      fields: [
        { name: 'sessao_id', type: 'text', required: true },
        {
          name: 'servico_id',
          type: 'relation',
          required: true,
          collectionId: servicos.id,
          maxSelect: 1,
        },
        { name: 'porte', type: 'text' },
        { name: 'quantidade', type: 'number', min: 1 },
        { name: 'lead_id', type: 'relation', collectionId: leadsCol.id, maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(carrinho)
  },
  (app) => {
    const carrinho = app.findCollectionByNameOrId('carrinho_servicos')
    app.delete(carrinho)
    const precos = app.findCollectionByNameOrId('precos_servicos')
    app.delete(precos)
    const servicos = app.findCollectionByNameOrId('servicos')
    app.delete(servicos)
  },
)
