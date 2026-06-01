import pb from '@/lib/pocketbase/client'

export const getPerguntas = async () => {
  return pb.collection('perguntas_formulario').getFullList({ sort: 'ordem' })
}

export const createLead = async (data: any) => {
  return pb.collection('leads').create(data)
}

export const upsertLead = async (data: any) => {
  return pb.send('/backend/v1/leads/upsert', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })
}

export const updateLeadStatus = async (id: string, status: string, notas: string) => {
  return pb.collection('leads').update(id, { status, notas })
}

export const updateLead = async (id: string, data: any) => {
  return pb.collection('leads').update(id, data)
}

export const getLeads = async (vendedorId?: string) => {
  const filter = vendedorId ? `vendedor_id = "${vendedorId}"` : undefined
  return pb.collection('leads').getFullList({ sort: '-created', filter })
}

export const getNotas = async (leadId: string) => {
  return pb
    .collection('notas_lead')
    .getFullList({ filter: `lead_id = "${leadId}"`, sort: '-created', expand: 'vendedor_id' })
}

export const addNota = async (data: { lead_id: string; vendedor_id: string; conteudo: string }) => {
  return pb.collection('notas_lead').create(data)
}

export const getMinhasPropostas = async (vendedorId?: string) => {
  const filter = vendedorId ? `vendedor_id = "${vendedorId}"` : undefined
  return pb.collection('propostas').getFullList({ filter, sort: '-created', expand: 'lead_id' })
}

export const createProposta = async (data: any) => {
  return pb.collection('propostas').create(data)
}

export const updateProposta = async (id: string, data: any) => {
  return pb.collection('propostas').update(id, data)
}

export const sendPropostaEmail = async (email: string, lead_id: string) => {
  return pb.send('/backend/v1/propostas/send', {
    method: 'POST',
    body: JSON.stringify({ email, lead_id }),
    headers: { 'Content-Type': 'application/json' },
  })
}

export const getServicos = async () => {
  return pb.collection('servicos').getFullList()
}

export const getPrecosServicos = async () => {
  return pb.collection('precos_servicos').getFullList({ expand: 'servico_id' })
}

export const getLeadById = async (id: string) => {
  return pb.collection('leads').getOne(id)
}

export const getChecklistTarefas = async (leadId: string) => {
  return pb.collection('checklist_tarefas').getFullList({ filter: `lead_id = "${leadId}"` })
}

export const createChecklistTarefa = async (data: any) => {
  return pb.collection('checklist_tarefas').create(data)
}

export const updateChecklistTarefa = async (id: string, data: any) => {
  return pb.collection('checklist_tarefas').update(id, data)
}

export const getDocumentos = async (leadId: string) => {
  return pb.collection('documentos_cartorio').getFullList({ filter: `lead_id = "${leadId}"` })
}

export const uploadDocumento = async (data: FormData) => {
  return pb.collection('documentos_cartorio').create(data)
}

export const createResposta = async (data: any) => {
  return pb.collection('formularios_respostas').create(data)
}

export const createScore = async (data: any) => {
  return pb.collection('scores_resultado').create(data)
}
