migrate(
  (app) => {
    const collection = new Collection({
      name: 'diagnosticos_historico',
      type: 'base',
      listRule: "@request.auth.role = 'admin' || @request.auth.role = 'vendedor'",
      viewRule: "@request.auth.role = 'admin' || @request.auth.role = 'vendedor'",
      createRule: '',
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: 'lead_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('leads').id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'score_total', type: 'number', required: true },
        { name: 'data_diagnostico', type: 'date', required: true },
        { name: 'respostas_json', type: 'json', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
    collection.addIndex('idx_diagnosticos_lead', false, 'lead_id', '')
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('diagnosticos_historico')
    app.delete(collection)
  },
)
