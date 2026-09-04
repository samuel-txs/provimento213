migrate(
  (app) => {
    const leadsCol = app.findCollectionByNameOrId('leads')
    const probeRecord = new Record(leadsCol)
    probeRecord.set('nome', 'Probe Test Lead CRM')
    probeRecord.set('email', 'probe_crm_test@tiexpress.tec.br')
    probeRecord.set('telefone', '11999998888')
    probeRecord.set('cartorio', 'Cartorio Teste CNJ')
    probeRecord.set('cnpj', '12.345.678/0001-90')
    probeRecord.set('score', 85)
    probeRecord.set('receita_potencial', 1500)
    probeRecord.set('status', 'novo')
    probeRecord.set('notas', 'Lead probe para validacao do hook mirror_lead_to_crm')
    app.save(probeRecord)

    // Apos salvar (o que engatilha o hook onRecordAfterCreateSuccess apos commit),
    // podemos limpar o registro de teste em um timeout ou em down, ou remove-lo apos um pequeno delay
    // No SQLite/PocketBase, onRecordAfterCreateSuccess dispara depois que a transacao commita.
  },
  (app) => {
    try {
      const rec = app.findFirstRecordByData('leads', 'email', 'probe_crm_test@tiexpress.tec.br')
      app.delete(rec)
    } catch (_) {}
  },
)
