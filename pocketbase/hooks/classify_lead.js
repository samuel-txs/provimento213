onRecordAfterCreateSuccess((e) => {
  try {
    const leadId = e.record.getString('lead_id')
    if (!leadId) {
      console.log('[Classify Lead] Nenhum lead_id no registro de diagnosticos_historico.')
      e.next()
      return
    }

    let leadRecord
    try {
      leadRecord = $app.findFirstRecordByData('leads', 'id', leadId)
    } catch (err) {
      console.log('[Classify Lead] Lead não encontrado para id:', leadId, String(err))
      e.next()
      return
    }

    // 3. ANTI-LOOP: Se lead.getString('classe') já está preenchido (não vazio), retornar imediatamente
    const currentClasse = leadRecord.getString('classe')
    if (currentClasse && currentClasse.trim() !== '') {
      console.log('[Classify Lead] Lead já classificado como:', currentClasse, '- ignorando.')
      e.next()
      return
    }

    // 4. Ler respostas_json do diagnosticos_historico
    const rawRespostas = e.record.get('respostas_json')
    let respostas = []
    if (Array.isArray(rawRespostas)) {
      respostas = rawRespostas
    } else if (typeof rawRespostas === 'string') {
      try {
        respostas = JSON.parse(rawRespostas)
      } catch (parseErr) {
        console.log('[Classify Lead] Erro ao parsear respostas_json:', String(parseErr))
      }
    }

    // 5. Encontrar a resposta cujo pergunta_id === 'ikKVDvueWwZMD7K' (Pergunta 1 — Classe)
    let respostaP1 = null
    for (let i = 0; i < respostas.length; i++) {
      const r = respostas[i]
      if (r && (r.pergunta_id === 'ikKVDvueWwZMD7K' || r.perguntaId === 'ikKVDvueWwZMD7K')) {
        respostaP1 = r
        break
      }
    }

    if (!respostaP1) {
      console.log(
        '[Classify Lead] [WARN] Pergunta 1 (ikKVDvueWwZMD7K) não encontrada em respostas_json.',
      )
      e.next()
      return
    }

    const opcaoId = respostaP1.opcao_id || respostaP1.opcaoId || ''

    // 6. Identificar classe, template_key e configuração de tarefas
    let determinedClasse = ''
    let templateKey = ''
    let taskTitulo = ''
    let taskCategoria = ''
    let taskResponsavelKey = ''
    let taskPrazoHours = 0 // horas a somar na data atual

    const leadCartorio = leadRecord.getString('cartorio') || 'Cartório'
    const leadNome = leadRecord.getString('nome') || 'Cliente'
    const leadEmail = leadRecord.getString('email') || ''
    const scoreTotal = e.record.getInt('score_total') || 0

    if (opcaoId === 'CfAvt3zbeoqb8FP') {
      // Até R$ 300 mil
      determinedClasse = 'Classe-1-Essencial'
      templateKey = 'email_template_classe1'
      taskTitulo = 'Contato via WhatsApp — ' + leadCartorio
      taskCategoria = 'Classe 1 — Essencial'
      taskResponsavelKey = '' // vazio
      taskPrazoHours = 48 // hoje + 2 dias
    } else if (opcaoId === '0h9do5zYQev6ZYU') {
      // R$ 300 mil a R$ 1,5 milhão
      determinedClasse = 'Classe-2-Avancado'
      templateKey = 'email_template_classe2'
      taskTitulo = 'Qualificar lead — ' + leadCartorio
      taskCategoria = 'Pipeline CNJ 213'
      taskResponsavelKey = 'vendedor_n1_user_id'
      taskPrazoHours = 72 // hoje + 3 dias
    } else if (opcaoId === '9q8naoKWioXaPN3') {
      // Acima de R$ 1,5 milhão
      determinedClasse = 'Classe-3-Enterprise'
      templateKey = 'email_template_classe2'
      taskTitulo = 'Contato Consultivo Imediato — Conta Enterprise'
      taskCategoria = 'Classe 3 — Enterprise'
      taskResponsavelKey = 'consultor_executivo_user_id'
      taskPrazoHours = 2 // hoje + 2 horas
    } else {
      console.log('[Classify Lead] [WARN] opcao_id desconhecido para Pergunta 1:', opcaoId)
      e.next()
      return
    }

    // Obter responsavel_id de configuracoes_plataforma se aplicável
    let taskResponsavel = ''
    if (taskResponsavelKey) {
      try {
        const cfgRec = $app.findFirstRecordByData(
          'configuracoes_plataforma',
          'chave',
          taskResponsavelKey,
        )
        taskResponsavel = cfgRec ? cfgRec.getString('valor') : ''
      } catch (cfgErr) {
        console.log(
          '[Classify Lead] Config não encontrada para',
          taskResponsavelKey,
          String(cfgErr),
        )
      }
    }

    // Envio de E-mail (não bloqueante / com try-catch independente)
    if (leadEmail && templateKey) {
      try {
        let rawTpl = ''
        try {
          const tplRec = $app.findFirstRecordByData(
            'configuracoes_plataforma',
            'chave',
            templateKey,
          )
          if (tplRec) {
            rawTpl = tplRec.getString('valor') || ''
          }
        } catch (tplErr) {
          console.log(
            '[Classify Lead] Template não encontrado no banco:',
            templateKey,
            String(tplErr),
          )
        }

        if (rawTpl) {
          // Extrair SUBJECT e BODY usando split
          let subject = 'Tiexpress — Diagnóstico de Conformidade Provimento 213'
          let bodyHtml = rawTpl

          if (rawTpl.includes('---SUBJECT---') && rawTpl.includes('---BODY---')) {
            const parts = rawTpl.split('---BODY---')
            const subjPart = parts[0].replace('---SUBJECT---', '').trim()
            if (subjPart) subject = subjPart
            bodyHtml = parts[1] ? parts[1].trim() : ''
          }

          // Substituir variáveis
          const replaceVars = (str) => {
            return str
              .replace(/{nome}/g, leadNome)
              .replace(/{cartorio}/g, leadCartorio)
              .replace(/{score}/g, String(scoreTotal))
              .replace(/{classe}/g, determinedClasse)
              .replace(/{email}/g, leadEmail)
          }

          subject = replaceVars(subject)
          bodyHtml = replaceVars(bodyHtml)

          // Chamar $http.send para /backend/v1/send-email interno
          let instanceUrl = $secrets.get('PB_INSTANCE_URL') || $os.getenv('PB_INSTANCE_URL') || ''
          if (!instanceUrl) {
            instanceUrl = 'https://landing-page-cartorios-cnj-0e353.shrd00.internal.goskip.dev'
          }
          if (instanceUrl.endsWith('/')) {
            instanceUrl = instanceUrl.slice(0, -1)
          }

          const superuserToken =
            $secrets.get('PB_SUPERUSER_TOKEN') || $os.getenv('PB_SUPERUSER_TOKEN') || ''
          const headers = {
            'Content-Type': 'application/json',
          }
          if (superuserToken) {
            headers['Authorization'] = 'Bearer ' + superuserToken
          }

          const sendEmailRes = $http.send({
            url: instanceUrl + '/backend/v1/send-email',
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
              to: leadEmail,
              subject: subject,
              html: bodyHtml,
            }),
            timeout: 15,
          })

          const isSuccess =
            sendEmailRes && sendEmailRes.statusCode >= 200 && sendEmailRes.statusCode < 300
          let errorMsg = ''
          if (!isSuccess) {
            errorMsg =
              'HTTP ' +
              (sendEmailRes ? sendEmailRes.statusCode : 'sem resposta') +
              ': ' +
              JSON.stringify(sendEmailRes ? sendEmailRes.json : '')
          }

          // Registrar em logs_email
          try {
            const logsCol = $app.findCollectionByNameOrId('logs_email')
            const logRec = new Record(logsCol)
            logRec.set('template_name', determinedClasse)
            logRec.set('destinatario', leadEmail)
            logRec.set('status', isSuccess ? 'sucesso' : 'erro')
            if (!isSuccess) {
              logRec.set('erro_detalhe', errorMsg.slice(0, 5000))
            }
            $app.save(logRec)
          } catch (logErr) {
            console.log('[Classify Lead] Erro ao salvar log de email:', String(logErr))
          }
        }
      } catch (emailErr) {
        console.log('[Classify Lead] Falha no fluxo de envio de email:', String(emailErr))
        try {
          const logsCol = $app.findCollectionByNameOrId('logs_email')
          const logRec = new Record(logsCol)
          logRec.set('template_name', determinedClasse)
          logRec.set('destinatario', leadEmail)
          logRec.set('status', 'erro')
          logRec.set('erro_detalhe', String(emailErr).slice(0, 5000))
          $app.save(logRec)
        } catch (_) {}
      }
    } else {
      console.log(
        '[Classify Lead] Lead sem e-mail ou template não definido. Pulando envio de e-mail.',
      )
    }

    // Criar tarefa em checklist_tarefas
    try {
      const tarefasCol = $app.findCollectionByNameOrId('checklist_tarefas')
      const tarefaRec = new Record(tarefasCol)
      tarefaRec.set('lead_id', leadRecord.id)
      tarefaRec.set('titulo', taskTitulo)
      tarefaRec.set('categoria', taskCategoria)
      tarefaRec.set('responsavel', taskResponsavel)
      tarefaRec.set('concluido', false)

      const prazoDate = new Date(Date.now() + taskPrazoHours * 60 * 60 * 1000)
      tarefaRec.set('prazo', prazoDate.toISOString())

      $app.save(tarefaRec)
      console.log('[Classify Lead] Tarefa criada com sucesso:', taskTitulo)
    } catch (taskErr) {
      console.log('[Classify Lead] Erro ao criar checklist_tarefa:', String(taskErr))
    }

    // 7. Atualizar lead.classe com o valor determinado
    // 8. Salvar lead ($app.save)
    try {
      leadRecord.set('classe', determinedClasse)
      $app.save(leadRecord)
      console.log('[Classify Lead] Lead classificado e salvo com sucesso como:', determinedClasse)
    } catch (saveErr) {
      console.log('[Classify Lead] Erro ao salvar classe no lead:', String(saveErr))
    }
  } catch (globalErr) {
    console.log('[Classify Lead] Erro geral no hook classify_lead:', String(globalErr))
  }

  e.next()
}, 'diagnosticos_historico')
