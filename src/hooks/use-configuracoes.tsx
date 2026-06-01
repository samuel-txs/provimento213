import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'

interface ConfigContextType {
  configs: Record<string, string>
  loading: boolean
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined)

export function hexToHsl(hex: string) {
  let r = 0,
    g = 0,
    b = 0
  hex = hex.replace('#', '')
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16)
    g = parseInt(hex[1] + hex[1], 16)
    b = parseInt(hex[2] + hex[2], 16)
  } else if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16)
    g = parseInt(hex.substring(2, 4), 16)
    b = parseInt(hex.substring(4, 6), 16)
  }
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b)
  let h = 0,
    s = 0,
    l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [configs, setConfigs] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  const loadConfigs = async () => {
    try {
      const records = await pb.collection('configuracoes_plataforma').getFullList()
      const confs: Record<string, string> = {}
      records.forEach((r) => (confs[r.chave] = r.valor))
      setConfigs(confs)

      if (confs['cor_primaria']) {
        const hsl = hexToHsl(confs['cor_primaria'])
        document.documentElement.style.setProperty('--primary', hsl)
        document.documentElement.style.setProperty('--ring', hsl)
      }
      if (confs['cor_secundaria']) {
        const hsl = hexToHsl(confs['cor_secundaria'])
        document.documentElement.style.setProperty('--secondary', hsl)
      }
    } catch (e) {
      console.error('Failed to load platform configs', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadConfigs()
  }, [])

  useRealtime('configuracoes_plataforma', () => {
    loadConfigs()
  })

  return <ConfigContext.Provider value={{ configs, loading }}>{children}</ConfigContext.Provider>
}

export function useConfiguracoes() {
  const ctx = useContext(ConfigContext)
  if (!ctx) throw new Error('useConfiguracoes must be used within ConfigProvider')
  return ctx
}
