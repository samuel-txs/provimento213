migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    try {
      app.findAuthRecordByEmail('_pb_users_auth_', 'samuel@tiexpress.tec.br')
      return
    } catch (_) {}
    const record = new Record(users)
    record.setEmail('samuel@tiexpress.tec.br')
    record.setPassword('Skip@Pass')
    record.setVerified(true)
    record.set('name', 'Samuel Admin')
    app.save(record)
  },
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('_pb_users_auth_', 'samuel@tiexpress.tec.br')
      app.delete(record)
    } catch (_) {}
  },
)
