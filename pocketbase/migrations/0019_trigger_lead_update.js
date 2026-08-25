migrate(
  (app) => {
    const leadsCol = app.findCollectionByNameOrId('leads')
    const testRec = app.findFirstRecordByData('leads', 'id', 'u29pe3x0rygielk')
    testRec.set('score', 40)
    app.save(testRec)
  },
  (app) => {},
)
