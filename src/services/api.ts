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

export const getLeads = async () => {
  return pb.collection('leads').getFullList({ sort: '-created' })
}

export const createResposta = async (data: any) => {
  return pb.collection('formularios_respostas').create(data)
}

export const createScore = async (data: any) => {
  return pb.collection('scores_resultado').create(data)
}
