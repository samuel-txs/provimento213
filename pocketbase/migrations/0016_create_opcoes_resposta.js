migrate(
  (app) => {
    const collection = new Collection({
      name: 'opcoes_resposta',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: "@request.auth.role = 'admin'",
      updateRule: "@request.auth.role = 'admin'",
      deleteRule: "@request.auth.role = 'admin'",
      fields: [
        {
          name: 'pergunta_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('perguntas_checklist').id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'texto_opcao', type: 'text', required: true },
        {
          name: 'valor',
          type: 'select',
          required: true,
          values: ['não', 'parcial', 'completo', 'nao_sei'],
          maxSelect: 1,
        },
        { name: 'ordem', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('opcoes_resposta')
    app.delete(collection)
  },
)
