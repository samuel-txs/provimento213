import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { getCart, addToCart, updateCartItem, removeFromCart } from '@/services/servicos'
import { useRealtime } from './use-realtime'

interface CartItem {
  id: string
  sessao_id: string
  servico_id: string
  porte: string
  quantidade: number
  expand?: {
    servico_id: {
      id: string
      nome: string
      descricao: string
      categoria: string
      icone_url: string
    }
  }
}

interface CartContextType {
  sessaoId: string
  porte: string
  setPorte: (porte: string) => void
  items: CartItem[]
  addItem: (servicoId: string) => Promise<void>
  updateQuantity: (id: string, quantidade: number) => Promise<void>
  removeItem: (id: string) => Promise<void>
  loading: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within a CartProvider')
  return context
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [sessaoId] = useState(() => {
    let id = localStorage.getItem('cart_sessao_id')
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem('cart_sessao_id', id)
    }
    return id
  })

  const [porte, setPorteState] = useState(() => localStorage.getItem('cart_porte') || 'Pequeno')
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  const setPorte = (p: string) => {
    setPorteState(p)
    localStorage.setItem('cart_porte', p)
  }

  const loadCart = async () => {
    try {
      const data = await getCart(sessaoId)
      setItems(data as any[])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCart()
  }, [sessaoId])

  useRealtime('carrinho_servicos', () => {
    loadCart()
  })

  const addItem = async (servicoId: string) => {
    const existing = items.find((i) => i.servico_id === servicoId && i.porte === porte)
    if (existing) {
      await updateCartItem(existing.id, { quantidade: existing.quantidade + 1 })
    } else {
      await addToCart({ sessao_id: sessaoId, servico_id: servicoId, porte, quantidade: 1 })
    }
  }

  const updateQuantity = async (id: string, quantidade: number) => {
    if (quantidade <= 0) {
      await removeFromCart(id)
    } else {
      await updateCartItem(id, { quantidade })
    }
  }

  const removeItem = async (id: string) => {
    await removeFromCart(id)
  }

  return (
    <CartContext.Provider
      value={{ sessaoId, porte, setPorte, items, addItem, updateQuantity, removeItem, loading }}
    >
      {children}
    </CartContext.Provider>
  )
}
