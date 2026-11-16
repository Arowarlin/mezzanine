import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api } from '../lib/api'
import type { Settings } from '../lib/types'

type SettingsContextValue = {
  settings: Settings | null
  loading: boolean
  currency: string
  restaurantName: string
  whatsapp: string
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    api<{ settings: Settings }>('/api/public/settings')
      .then((data) => {
        if (active) setSettings(data.settings)
      })
      .catch(() => {
        if (active) setSettings(null)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      loading,
      currency: settings?.currency ?? 'DOP',
      restaurantName: settings?.restaurant_name ?? 'Casa Veranda',
      whatsapp: settings?.whatsapp ?? '18095550142',
    }),
    [settings, loading],
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext)
  if (!context) throw new Error('useSettings debe usarse dentro de SettingsProvider')
  return context
}
