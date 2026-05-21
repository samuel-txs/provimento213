import pb from '@/lib/pocketbase/client'

export const getPerguntas = async () => {
  return pb.collection('perguntas_formulario').getFullList({ sort: 'ordem' })
}

export const createLead = async (data: any) => {
  return pb.collection('leads').create(data)
}

export const updateLeadStatus = async (id: string, status: string, notas: string) => {
  return pb.collection('leads').update(id, { status, notas })
}

export const updateLead = async (id: string, data: any) => {
  return pb.collection('leads').update(id, data)
}

export const getLeads = async () => {
  return pb.collection('leads').getFullList({ sort: '-created' })
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
