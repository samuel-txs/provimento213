migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    const leads = app.findCollectionByNameOrId('leads')

    const notas_lead = new Collection({
      name: 'notas_lead',
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
        { name: 'conteudo', type: 'text', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(notas_lead)
  },
  (app) => {
    const notas_lead = app.findCollectionByNameOrId('notas_lead')
    app.delete(notas_lead)
  },
)
