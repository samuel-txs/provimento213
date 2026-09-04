migrate(
  (app) => {
    const leadsCol = app.findCollectionByNameOrId('leads')
    const probeRecord = new Record(leadsCol)
    probeRecord.set('nome', 'Probe Test Lead CRM Internal')
    probeRecord.set('email', 'probe_crm_test_internal@tiexpress.tec.br')
    probeRecord.set('telefone', '11999997777')
    probeRecord.set('cartorio', 'Cartorio Teste CNJ Interno')
    probeRecord.set('cnpj', '12.345.678/0001-90')
    probeRecord.set('score', 90)
    probeRecord.set('receita_potencial', 2000)
    probeRecord.set('status', 'novo')
    probeRecord.set(
      'notas',
      'Lead probe para validacao da nova URL interna do hook mirror_lead_to_crm',
    )
    app.save(probeRecord)
  },
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
)
