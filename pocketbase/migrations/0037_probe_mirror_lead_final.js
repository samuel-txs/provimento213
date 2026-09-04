migrate(
  (app) => {
    const leadsCol = app.findCollectionByNameOrId('leads')
    const probeRecord = new Record(leadsCol)
    probeRecord.set('nome', 'Probe Final CRM Test')
    probeRecord.set('email', 'probe_crm_final@tiexpress.tec.br')
    probeRecord.set('telefone', '11999998888')
    probeRecord.set('cartorio', 'Cartorio Teste CNJ Final')
    probeRecord.set('cnpj', '12.345.678/0001-99')
    probeRecord.set('score', 85)
    probeRecord.set('receita_potencial', 1500)
    probeRecord.set('status', 'novo')
    probeRecord.set(
      'notas',
      'Lead probe final para validacao da chave de API txs_lead_live no CRM destino',
    )
    app.save(probeRecord)
  },
  (app) => {
    try {
      const rec = app.findFirstRecordByData('leads', 'email', 'probe_crm_final@tiexpress.tec.br')
      app.delete(rec)
    } catch (_) {}
  },
)
