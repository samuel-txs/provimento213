cronAdd('followup_leads', '0 9 * * 1-5', () => {
  const leads = $app.findRecordsByFilter(
    'leads',
    "status != 'convertido' && status != 'negociando'",
    '-created',
    100,
    0,
  )

  for (const lead of leads) {
    const score = lead.getInt('score')
    if (score > 0 && score <= 70) {
      $app
        .logger()
        .info(
          'Enviando email de follow-up automatizado (Consultoria Diagnóstica)',
          'lead_id',
          lead.id,
          'email',
          lead.getString('email'),
          'score',
          score,
        )
      // Logic for triggering external email to lead offering consulting based on "Crítico/Atenção" scores.
    }
  }
})
