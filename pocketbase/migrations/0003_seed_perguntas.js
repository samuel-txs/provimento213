migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('perguntas_formulario')

    const perguntas = [
      {
        cat: 'Segurança',
        txt: 'A serventia possui antivírus corporativo gerenciado instalado em todos os computadores?',
        ord: 1,
      },
      {
        cat: 'Segurança',
        txt: 'Existe um firewall físico ou lógico implementado para proteção da rede interna?',
        ord: 2,
      },
      {
        cat: 'Segurança',
        txt: 'O software de endpoint protection está configurado para atualizações automáticas?',
        ord: 3,
      },
      {
        cat: 'Backup',
        txt: 'Os backups dos dados da serventia são realizados de forma híbrida (local e em nuvem)?',
        ord: 4,
      },
      {
        cat: 'Backup',
        txt: 'Existe uma rotina documentada e testes periódicos de restauração (restore) do backup?',
        ord: 5,
      },
      {
        cat: 'Backup',
        txt: 'O backup está protegido contra ransomwares e possui versionamento imutável?',
        ord: 6,
      },
      {
        cat: 'Redes',
        txt: 'A serventia possui redundância de links de internet (mínimo dois provedores distintos)?',
        ord: 7,
      },
      {
        cat: 'Redes',
        txt: 'A rede Wi-Fi para convidados é totalmente isolada da rede corporativa da serventia?',
        ord: 8,
      },
      {
        cat: 'Redes',
        txt: 'Os equipamentos de rede e servidores estão protegidos por no-breaks dimensionados corretamente?',
        ord: 9,
      },
      {
        cat: 'Acesso',
        txt: 'O acesso aos sistemas do cartório exige senhas fortes e trocas periódicas?',
        ord: 10,
      },
      {
        cat: 'Acesso',
        txt: 'O trabalho remoto (home office) é realizado exclusivamente através de VPN segura?',
        ord: 11,
      },
      {
        cat: 'Acesso',
        txt: 'Cada usuário possui credenciais individuais (sem compartilhamento de contas)?',
        ord: 12,
      },
      {
        cat: 'Acesso',
        txt: 'Existe controle de acesso físico (catracas, biometria) para a sala de servidores?',
        ord: 13,
      },
      {
        cat: 'Documentação',
        txt: 'A serventia possui uma Política de Segurança da Informação (PSI) formalizada e assinada por todos?',
        ord: 14,
      },
      {
        cat: 'Documentação',
        txt: 'Existe um plano de continuidade de negócios e recuperação de desastres (PCN/PRD) documentado?',
        ord: 15,
      },
      {
        cat: 'Documentação',
        txt: 'A adequação à LGPD (Política de Privacidade, Termos de Consentimento) está formalizada?',
        ord: 16,
      },
    ]

    perguntas.forEach((p) => {
      try {
        app.findFirstRecordByData('perguntas_formulario', 'texto_pergunta', p.txt)
      } catch (_) {
        const record = new Record(col)
        record.set('categoria', p.cat)
        record.set('texto_pergunta', p.txt)
        record.set('ordem', p.ord)
        app.save(record)
      }
    })
  },
  (app) => {
    const col = app.findCollectionByNameOrId('perguntas_formulario')
    const records = app.findRecordsByFilter(col.id, '1=1', '', 100)
    records.forEach((r) => app.delete(r))
  },
)
