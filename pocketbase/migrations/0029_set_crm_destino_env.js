migrate(
  (app) => {
    // Configura os secrets / variáveis de ambiente via os.setenv caso disponível no runtime
    try {
      if (typeof $os !== 'undefined' && typeof $os.setenv === 'function') {
        $os.setenv(
          'CRM_DESTINO_URL',
          'https://site-institucional-tiexpress-9af50.shrd00.internal.goskip.dev',
        )
        $os.setenv(
          'CRM_DESTINO_TOKEN',
          'T0i29z7DghW5yhxYni6n5ESoWAXGRWFcgwXx86wILsboSi6lJeFsdjwfbqq4tpYeEqqjJSTn844HOe6cl68LkRVIn3rjRZgDlBpMCUeA5jiJU7R5dZpql9cwZtBelV0K',
        )
      }
    } catch (_) {}
  },
  (app) => {},
)
