routerAdd('GET', '/backend/v1/crm-discovery', (e) => {
  const crmUrl = (
    $os.getenv('CRM_DESTINO_URL') ||
    'https://site-institucional-tiexpress-9af50.shrd00.internal.goskip.dev'
  ).replace(/\/$/, '')
  const crmToken =
    $os.getenv('CRM_DESTINO_TOKEN') ||
    'T0i29z7DghW5yhxYni6n5ESoWAXGRWFcgwXx86wILsboSi6lJeFsdjwfbqq4tpYeEqqjJSTn844HOe6cl68LkRVIn3rjRZgDlBpMCUeA5jiJU7R5dZpql9cwZtBelV0K'

  try {
    const resLeads = $http.send({
      url: crmUrl + '/api/collections/leads/records?page=1&perPage=5',
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + crmToken,
      },
      timeout: 10,
    })

    return e.json(200, {
      status: 'ok',
      crmUrl: crmUrl,
      leadsResponseStatus: resLeads.statusCode,
      leadsData: resLeads.json,
    })
  } catch (err) {
    return e.json(500, {
      status: 'error',
      crmUrl: crmUrl,
      error: String(err),
    })
  }
})
