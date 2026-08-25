routerAdd('GET', '/backend/v1/crm-discovery', (e) => {
  const crmUrl = ($os.getenv('CRM_DESTINO_URL') || '').replace(/\/$/, '')
  const crmToken = $os.getenv('CRM_DESTINO_TOKEN') || ''

  try {
    const resCollections = $http.send({
      url: crmUrl + '/api/collections?page=1&perPage=100',
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + crmToken,
      },
      timeout: 10,
    })

    const collections = resCollections.json

    let leadsCol = null
    let contatosCol = null

    if (collections && collections.items) {
      for (let i = 0; i < collections.items.length; i++) {
        const item = collections.items[i]
        if (item.name === 'leads') {
          leadsCol = item
        }
        if (item.name === 'contatos') {
          contatosCol = item
        }
      }
    }

    return e.json(200, {
      statusCode: resCollections.statusCode,
      collectionsList: collections
        ? collections.items
          ? collections.items.map(function (c) {
              return c.name
            })
          : collections
        : null,
      leadsCol: leadsCol,
      contatosCol: contatosCol,
    })
  } catch (err) {
    return e.json(500, {
      error: String(err),
    })
  }
})
