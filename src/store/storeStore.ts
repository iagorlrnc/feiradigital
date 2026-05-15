import { create } from "zustand"
import { supabase, type Store } from "../lib/supabase"

interface StoreState {
  stores: Store[]
  myStore: Store | null
  loading: boolean
  fetchActiveStores: () => Promise<void>
  fetchMyStore: (ownerId: string) => Promise<void>
  fetchAllStores: () => Promise<void>
  createStore: (data: Partial<Store>) => Promise<{ error: string | null }>
  updateStore: (
    id: string,
    data: Partial<Store>,
  ) => Promise<{ error: string | null }>
  updateStoreStatus: (
    id: string,
    status: Store["status"],
  ) => Promise<{ error: string | null }>
  deleteStore: (id: string) => Promise<{ error: string | null }>
  updateFlashOffer: (
    id: string,
    offerExpiresAt: string | null,
    cooldownExpiresAt: string | null
  ) => Promise<{ error: string | null }>
  subscribeToStores: () => () => void
}

export const useStoreStore = create<StoreState>((set) => ({
  stores: [],
  myStore: null,
  loading: false,

  fetchActiveStores: async () => {
    set({ loading: true })
    try {
      const { data, error } = await supabase
        .from("stores")
        .select("*, profiles(full_name, email, phone)")
        .eq("status", "active")
        .order("name")
      if (error) throw error
      set({ stores: data ?? [] })
    } catch (err) {
      console.error("Error fetching active stores:", err)
    } finally {
      set({ loading: false })
    }
  },

  fetchMyStore: async (ownerId) => {
    try {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("owner_id", ownerId)
        .single()
      if (error && error.code !== 'PGRST116') throw error // PGRST116 is 'no rows returned'
      set({ myStore: data ?? null })
    } catch (err) {
      console.error("Error fetching my store:", err)
    }
  },

  fetchAllStores: async () => {
    set({ loading: true })
    try {
      const { data } = await supabase
        .from("stores")
        .select("*, profiles(full_name, email, phone)")
        .order("created_at", { ascending: false })
      set({ stores: data ?? [], loading: false })
    } catch (err) {
      set({ loading: false })
    }
  },

  createStore: async (storeData) => {
    try {
      const { error } = await supabase.from("stores").insert([storeData])
      return { error: error?.message ?? null }
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : "Erro inesperado ao criar loja",
      }
    }
  },

  updateStore: async (id, storeData) => {
    try {
      const { error } = await supabase.from("stores").update(storeData).eq("id", id)
      return { error: error?.message ?? null }
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : "Erro inesperado ao atualizar loja",
      }
    }
  },

  updateStoreStatus: async (id, status) => {
    try {
      const { error } = await supabase.from("stores").update({ status }).eq("id", id)
      return { error: error?.message ?? null }
    } catch (err) {
      return {
        error:
          err instanceof Error
            ? err.message
            : "Erro inesperado ao atualizar status",
      }
    }
  },

  deleteStore: async (id) => {
    try {
      const { error } = await supabase.from("stores").delete().eq("id", id)
      return { error: error?.message ?? null }
    } catch (err) {
      return {
        error:
          err instanceof Error
            ? err.message
            : "Erro inesperado ao excluir loja",
      }
    }
  },

  updateFlashOffer: async (id, offerExpiresAt, cooldownExpiresAt) => {
    try {
      const { error } = await supabase
        .from("stores")
        .update({
          offer_expires_at: offerExpiresAt,
          cooldown_expires_at: cooldownExpiresAt,
        })
        .eq("id", id)
      return { error: error?.message ?? null }
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : "Erro ao atualizar oferta relâmpago",
      }
    }
  },

  subscribeToStores: () => {
    const channel = supabase
      .channel('stores-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'stores' },
        (payload) => {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const updatedStore = payload.new as Store
            set((state) => ({
              stores: state.stores.map((s) =>
                s.id === updatedStore.id ? { ...s, ...updatedStore } : s
              ),
              myStore: state.myStore?.id === updatedStore.id ? { ...state.myStore, ...updatedStore } : state.myStore
            }))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  },
}))
