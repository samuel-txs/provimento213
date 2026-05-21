import pb from '@/lib/pocketbase/client'

export const getServicos = async () => {
  return pb.collection('servicos').getFullList({ sort: 'categoria,nome' })
}

export const getPrecos = async () => {
  return pb.collection('precos_servicos').getFullList()
}

export const getCart = async (sessaoId: string) => {
  return pb.collection('carrinho_servicos').getFullList({
    filter: `sessao_id = "${sessaoId}"`,
    expand: 'servico_id',
    sort: 'created',
  })
}

export const addToCart = async (data: any) => {
  return pb.collection('carrinho_servicos').create(data)
}

export const updateCartItem = async (id: string, data: any) => {
  return pb.collection('carrinho_servicos').update(id, data)
}

export const removeFromCart = async (id: string) => {
  return pb.collection('carrinho_servicos').delete(id)
}

export const sendProposal = async (data: { email: string; sessao_id: string; total: number }) => {
  return pb.send('/backend/v1/proposals/send', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })
}

export const createServico = async (data: any) => {
  return pb.collection('servicos').create(data)
}

export const updateServico = async (id: string, data: any) => {
  return pb.collection('servicos').update(id, data)
}

export const deleteServico = async (id: string) => {
  return pb.collection('servicos').delete(id)
}

export const createPreco = async (data: any) => {
  return pb.collection('precos_servicos').create(data)
}

export const updatePreco = async (id: string, data: any) => {
  return pb.collection('precos_servicos').update(id, data)
}
