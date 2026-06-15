migrate(
  (app) => {
    const collection = new Collection({
      name: 'logs_email',
      type: 'base',
      listRule: "@request.auth.role = 'admin'",
      viewRule: "@request.auth.role = 'admin'",
      createRule: "@request.auth.role = 'admin'",
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: 'template_name', type: 'text', required: true },
        { name: 'destinatario', type: 'text', required: true },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['sucesso', 'erro'],
          maxSelect: 1,
        },
        { name: 'erro_detalhe', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('logs_email')
    app.delete(collection)
  },
)
