migrate(
  (app) => {
    try {
      const rec = app.findFirstRecordByData(
        'leads',
        'email',
        'probe_crm_test_internal@tiexpress.tec.br',
      )
      app.delete(rec)
    } catch (_) {}
  },
  (app) => {},
)
