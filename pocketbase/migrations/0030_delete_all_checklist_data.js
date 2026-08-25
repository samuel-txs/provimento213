migrate(
  (app) => {
    // Ordem de deleção para preservar integridade referencial:
    // 1. checklist_tarefas (depende de leads)
    // 2. formularios_respostas (depende de leads e perguntas)
    // 3. scores_resultado (depende de leads)
    // 4. diagnosticos_historico (depende de leads)
    // 5. opcoes_resposta (depende de perguntas_checklist)
    // 6. perguntas_checklist (tabela principal do novo checklist)
    // 7. perguntas_formulario (tabela antiga/deprecated do checklist)

    app.db().newQuery('DELETE FROM checklist_tarefas').execute()
    app.db().newQuery('DELETE FROM formularios_respostas').execute()
    app.db().newQuery('DELETE FROM scores_resultado').execute()
    app.db().newQuery('DELETE FROM diagnosticos_historico').execute()
    app.db().newQuery('DELETE FROM opcoes_resposta').execute()
    app.db().newQuery('DELETE FROM perguntas_checklist').execute()
    app.db().newQuery('DELETE FROM perguntas_formulario').execute()
  },
  (app) => {
    // Operação de limpeza irreversível no rollback
  },
)
