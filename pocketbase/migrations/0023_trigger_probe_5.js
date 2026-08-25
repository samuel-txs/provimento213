migrate(
  (app) => {
    const testRec = app.findFirstRecordByData('leads', 'id', 'u29pe3x0rygielk')
    testRec.set('score', 44)
    app.save(testRec)
  },
  (app) => {},
)
