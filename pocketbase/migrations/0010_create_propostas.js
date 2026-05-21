migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    const leads = app.findCollectionByNameOrId('leads')

    const propostas = new Collection({
      name: 'propostas',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'vendedor_id',
          type: 'relation',
          required: true,
          collectionId: users.id,
          maxSelect: 1,
        },
        { name: 'lead_id', type: 'relation', required: true, collectionId: leads.id, maxSelect: 1 },
        { name: 'servicos', type: 'json', required: true },
        { name: 'valor_total', type: 'number', required: true },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['Enviada', 'Visualizada', 'Aceita', 'Rejeitada'],
          maxSelect: 1,
        },
        { name: 'pdf_url', type: 'url' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(propostas)
  },
  (app) => {
    const propostas = app.findCollectionByNameOrId('propostas')
    app.delete(propostas)
  },
)
