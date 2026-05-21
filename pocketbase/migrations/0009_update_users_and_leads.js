migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    if (!users.fields.getByName('role')) {
      users.fields.add(
        new SelectField({ name: 'role', values: ['admin', 'vendedor', 'consultor'], maxSelect: 1 }),
      )
    }
    app.save(users)

    const leads = app.findCollectionByNameOrId('leads')
    if (!leads.fields.getByName('vendedor_id')) {
      leads.fields.add(
        new RelationField({ name: 'vendedor_id', collectionId: users.id, maxSelect: 1 }),
      )
    }
    app.save(leads)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    users.fields.removeByName('role')
    app.save(users)

    const leads = app.findCollectionByNameOrId('leads')
    leads.fields.removeByName('vendedor_id')
    app.save(leads)
  },
)
