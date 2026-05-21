migrate(
  (app) => {
    const col = new Collection({
      name: 'documentos_cartorio',
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
        { name: 'nome', type: 'text', required: true },
        {
          name: 'tipo',
          type: 'select',
          required: true,
          values: ['laudo', 'certificado', 'contrato', 'auditoria'],
          maxSelect: 1,
        },
        { name: 'arquivo', type: 'file', maxSelect: 1, maxSize: 52428800 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('documentos_cartorio')
    app.delete(col)
  },
)
