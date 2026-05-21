migrate(
  (app) => {
    const col = new Collection({
      name: 'checklist_tarefas',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'lead_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('leads').id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'titulo', type: 'text', required: true },
        { name: 'responsavel', type: 'text' },
        { name: 'prazo', type: 'date' },
        { name: 'concluido', type: 'bool' },
        { name: 'categoria', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('checklist_tarefas')
    app.delete(col)
  },
)
