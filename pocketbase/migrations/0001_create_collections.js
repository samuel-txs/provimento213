migrate(
  (app) => {
    const leads = new Collection({
      name: 'leads',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: '',
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'nome', type: 'text', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'telefone', type: 'text', required: true },
        { name: 'cartorio', type: 'text', required: true },
        { name: 'cnpj', type: 'text', required: true },
        {
          name: 'status',
          type: 'select',
          values: ['novo', 'contatado', 'negociando', 'convertido'],
          required: true,
          maxSelect: 1,
        },
        { name: 'notas', type: 'text' },
        { name: 'score', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(leads)

    const perguntas = new Collection({
      name: 'perguntas_formulario',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: 'categoria', type: 'text', required: true },
        { name: 'texto_pergunta', type: 'text', required: true },
        { name: 'ordem', type: 'number', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(perguntas)

    const respostas = new Collection({
      name: 'formularios_respostas',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: '',
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: 'lead_id', type: 'relation', required: true, collectionId: leads.id, maxSelect: 1 },
        { name: 'pergunta_id', type: 'text', required: true },
        { name: 'resposta', type: 'text', required: true },
        { name: 'categoria', type: 'text', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(respostas)

    const scores = new Collection({
      name: 'scores_resultado',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: '',
      createRule: '',
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: 'lead_id', type: 'relation', required: true, collectionId: leads.id, maxSelect: 1 },
        { name: 'score_total', type: 'number', required: true },
        { name: 'resultado_pdf_url', type: 'url' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(scores)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('scores_resultado'))
    app.delete(app.findCollectionByNameOrId('formularios_respostas'))
    app.delete(app.findCollectionByNameOrId('perguntas_formulario'))
    app.delete(app.findCollectionByNameOrId('leads'))
  },
)
