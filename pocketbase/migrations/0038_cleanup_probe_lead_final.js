migrate(
  (app) => {
    try {
      const rec = app.findFirstRecordByData('leads', 'email', 'probe_crm_final@tiexpress.tec.br')
      app.delete(rec)
    } catch (_) {}
  },
  (app) => {
    // down: nada a restaurar em cleanup
  },
)
