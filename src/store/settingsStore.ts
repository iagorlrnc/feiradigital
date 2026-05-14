import { create } from 'zustand'
import { supabase, type FairSettings } from '../lib/supabase'

interface SettingsState {
  settings: FairSettings | null
  loading: boolean
  fetchSettings: () => Promise<void>
  updateSettings: (data: Partial<FairSettings>) => Promise<{ error: string | null }>
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: null,
  loading: false,

  fetchSettings: async () => {
    set({ loading: true })
    const { data } = await supabase
      .from('fair_settings')
      .select('*')
      .single()
    
    set({ settings: data, loading: false })
  },

  updateSettings: async (data) => {
    try {
      const { data: current } = await supabase.from('fair_settings').select('id').single()
      if (!current) throw new Error('Configurações não encontradas')

      const { error } = await supabase
        .from('fair_settings')
        .update(data)
        .eq('id', current.id)
      
      if (!error) {
        set(state => ({ 
          settings: state.settings ? { ...state.settings, ...data } : null 
        }))
      }
      return { error: error?.message ?? null }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Erro ao atualizar configurações' }
    }
  }
}))
