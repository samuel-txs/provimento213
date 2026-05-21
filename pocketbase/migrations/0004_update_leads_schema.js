migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('leads')
    col.fields.add(new NumberField({ name: 'receita_potencial' }))
    col.fields.add(new DateField({ name: 'data_ultima_negociacao' }))
    col.fields.add(new TextField({ name: 'status_eol' }))
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('leads')
    col.fields.removeByName('receita_potencial')
    col.fields.removeByName('data_ultima_negociacao')
    col.fields.removeByName('status_eol')
    app.save(col)
  },
)
