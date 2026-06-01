migrate(
  (app) => {
    const collection = new Collection({
      name: 'perguntas_checklist',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: "@request.auth.role = 'admin'",
      updateRule: "@request.auth.role = 'admin'",
      deleteRule: "@request.auth.role = 'admin'",
      fields: [
        { name: 'categoria', type: 'text', required: true },
        { name: 'texto_pergunta', type: 'text', required: true },
        { name: 'ordem', type: 'number', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)

    const records = [
      {
        categoria: 'Redes e Internet',
        texto_pergunta:
          'A serventia possui dois ou mais links de internet de provedores distintos?',
        ordem: 10,
      },
      {
        categoria: 'Segurança',
        texto_pergunta: 'Existe firewall físico ou lógico configurado na rede?',
        ordem: 20,
      },
      {
        categoria: 'Backup',
        texto_pergunta: 'Há rotina de backup em nuvem e local diária?',
        ordem: 30,
      },
    ]

    const savedCol = app.findCollectionByNameOrId('perguntas_checklist')
    for (const r of records) {
      const rec = new Record(savedCol)
      rec.set('categoria', r.categoria)
      rec.set('texto_pergunta', r.texto_pergunta)
      rec.set('ordem', r.ordem)
      app.save(rec)
    }
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('perguntas_checklist')
    app.delete(collection)
  },
)
