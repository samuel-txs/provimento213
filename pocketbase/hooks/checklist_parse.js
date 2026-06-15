routerAdd(
  'POST',
  '/backend/v1/checklist/parse',
  (e) => {
    const body = e.requestInfo().body
    if (!body || !body.csvText) {
      return e.badRequestError('Arquivo não enviado')
    }

    try {
      const text = body.csvText.replace(/^\uFEFF/, '')
      const rows = []
      let currentRow = []
      let currentCell = ''
      let inQuotes = false

      for (let i = 0; i < text.length; i++) {
        const char = text[i]
        const nextChar = text[i + 1]

        if (inQuotes) {
          if (char === '"' && nextChar === '"') {
            currentCell += '"'
            i++
          } else if (char === '"') {
            inQuotes = false
          } else {
            currentCell += char
          }
        } else {
          if (char === '"') {
            inQuotes = true
          } else if (char === ',') {
            currentRow.push(currentCell)
            currentCell = ''
          } else if (char === '\n' || (char === '\r' && nextChar === '\n')) {
            if (char === '\r') i++
            currentRow.push(currentCell)
            rows.push(currentRow)
            currentRow = []
            currentCell = ''
          } else {
            currentCell += char
          }
        }
      }
      if (currentCell !== '' || currentRow.length > 0) {
        currentRow.push(currentCell)
        rows.push(currentRow)
      }

      if (rows.length < 2) return e.badRequestError('O arquivo está vazio ou inválido.')

      const headers = rows[0].map((h) => h.trim())
      const data = []
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i]
        if (row.length === 1 && row[0].trim() === '') continue
        const obj = {}
        for (let j = 0; j < headers.length; j++) {
          const header = headers[j]
          if (header) {
            obj[header] = row[j] || ''
          }
        }
        data.push(obj)
      }

      return e.json(200, { rows: data })
    } catch (err) {
      $app.logger().error('Erro ao analisar CSV', 'error', err.message)
      return e.badRequestError('Erro ao ler o arquivo CSV. Verifique o formato.')
    }
  },
  $apis.requireAuth(),
)
