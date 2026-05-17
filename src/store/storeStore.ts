import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { supabase, type Store, type Product } from "../lib/supabase"

interface StoreState {
  stores: Store[]
  allStores: Store[] // Para CEO
  myStores: Store[] // Para Admin/Lojista
  activeStoreId: string | null
  loadingActive: boolean
  loadingAll: boolean
  loadingMy: boolean
  fetchActiveStores: () => Promise<void>
  fetchAllStores: () => Promise<void>
  fetchMyStore: (ownerId: string) => Promise<void>
  fetchStoreProducts: (storeId: string) => Promise<Product[]>
  createStore: (data: Partial<Store>) => Promise<{ data: Store | null; error: string | null }>
  updateStore: (id: string, data: Partial<Store>) => Promise<{ data: Store | null; error: string | null }>
  deleteStore: (id: string) => Promise<{ error: string | null }>
  setActiveStoreId: (id: string) => void
  resetActiveStoreId: () => void
  updateFlashOffer: (id: string, expiresAt: string | null, cooldownAt: string | null) => Promise<{ error: string | null }>
  subscribeToStores: () => () => void
  products: Product[]
  fetchProducts: (storeId: string) => Promise<void>
  createProduct: (data: Partial<Product>) => Promise<{ error: string | null }>
  updateProduct: (id: string, data: Partial<Product>) => Promise<{ error: string | null }>
  deleteProduct: (id: string) => Promise<{ error: string | null }>
}

export const useStoreStore = create<StoreState>()(
  persist(
    (set, get) => ({
      stores: [],
      allStores: [],
      myStores: [],
      activeStoreId: null,
      loadingActive: false,
      loadingAll: false,
      loadingMy: false,

      fetchActiveStores: async () => {
        if (get().loadingActive) return
        set({ loadingActive: true })
        try {
          const { data, error } = await supabase
            .from("stores")
            .select("*, products(*)")
            .eq("status", "active")
            .order("is_featured", { ascending: false })
            .order("name")
          
          if (error) throw error
          set({ stores: data ?? [] })
        } catch (err) {
          console.error("Error fetching active stores:", err)
        } finally {
          set({ loadingActive: false })
        }
      },

      fetchAllStores: async () => {
        if (get().loadingAll) return
        set({ loadingAll: true })
        try {
          const { data, error } = await supabase
            .from("stores")
            .select("*, profiles(full_name, email)")
            .order("created_at", { ascending: false })
          
          if (error) throw error
          set({ allStores: data ?? [] })
        } catch (err) {
          console.error("Error fetching all stores:", err)
        } finally {
          set({ loadingAll: false })
        }
      },

      fetchMyStore: async (ownerId) => {
        if (!ownerId) return
        if (get().loadingMy) return
        set({ loadingMy: true })
        try {
          const { data, error } = await supabase
            .from("stores")
            .select("*")
            .eq("owner_id", ownerId)
          
          if (error) throw error
          
          const stores = data ?? []
          set({ myStores: stores })
          
          // Gerenciamento de loja ativa
          const currentActiveId = get().activeStoreId
          if (stores.length > 0) {
            const stillExists = stores.find(s => s.id === currentActiveId)
            if (!currentActiveId || !stillExists) {
              set({ activeStoreId: stores[0].id })
            }
          } else {
            set({ activeStoreId: null })
          }
        } catch (err) {
          console.error("Error fetching my stores:", err)
        } finally {
          set({ loadingMy: false })
        }
      },

      fetchStoreProducts: async (storeId) => {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("store_id", storeId)
          .eq("is_active", true)
        
        if (error) {
          console.error("Error fetching products:", error)
          return []
        }
        return data ?? []
      },

      createStore: async (data) => {
        const { data: store, error } = await supabase
          .from("stores")
          .insert(data)
          .select()
          .single()
        
        if (!error && store) {
          set((state) => ({ 
            myStores: [...state.myStores, store],
            activeStoreId: store.id 
          }))
        }
        return { data: store, error: error?.message ?? null }
      },

      updateStore: async (id, data) => {
        const { data: store, error } = await supabase
          .from("stores")
          .update(data)
          .eq("id", id)
          .select()
          .single()
        
        if (!error && store) {
          set((state) => ({
            myStores: state.myStores.map((s) => (s.id === id ? store : s)),
            stores: state.stores.map((s) => (s.id === id ? store : s)),
          }))
        }
        return { data: store, error: error?.message ?? null }
      },

      deleteStore: async (id) => {
        const { error } = await supabase.from("stores").delete().eq("id", id)
        if (!error) {
          set((state) => ({
            myStores: state.myStores.filter((s) => s.id !== id),
            stores: state.stores.filter((s) => s.id !== id),
            activeStoreId: state.activeStoreId === id ? (state.myStores[0]?.id ?? null) : state.activeStoreId
          }))
        }
        return { error: error?.message ?? null }
      },

      setActiveStoreId: (id) => set({ activeStoreId: id }),
      resetActiveStoreId: () => set({ activeStoreId: null }),

      updateFlashOffer: async (id, expiresAt, cooldownAt) => {
        const { error } = await supabase
          .from("stores")
          .update({ 
            offer_expires_at: expiresAt,
            cooldown_expires_at: cooldownAt 
          })
          .eq("id", id)
        
        if (!error) {
          set((state) => ({
            myStores: state.myStores.map((s) => 
              s.id === id ? { ...s, offer_expires_at: expiresAt ?? undefined, cooldown_expires_at: cooldownAt ?? undefined } : s
            ),
            stores: state.stores.map((s) => 
              s.id === id ? { ...s, offer_expires_at: expiresAt ?? undefined, cooldown_expires_at: cooldownAt ?? undefined } : s
            ),
          }))
        }
        return { error: error?.message ?? null }
      },

      products: [],

      fetchProducts: async (storeId: string) => {
        try {
          const { data, error } = await supabase
            .from("products")
            .select("*")
            .eq("store_id", storeId)
            .order("created_at", { ascending: false })
          
          if (error) throw error
          set({ products: data ?? [] })
        } catch (err) {
          console.error("Error fetching products:", err)
        }
      },

      createProduct: async (productData) => {
        try {
          const { error } = await supabase.from("products").insert([productData])
          return { error: error?.message ?? null }
        } catch (err) {
          return { error: err instanceof Error ? err.message : "Erro ao criar produto" }
        }
      },

      updateProduct: async (id, productData) => {
        try {
          const { error } = await supabase.from("products").update(productData).eq("id", id)
          return { error: error?.message ?? null }
        } catch (err) {
          return { error: err instanceof Error ? err.message : "Erro ao atualizar produto" }
        }
      },

      deleteProduct: async (id) => {
        try {
          const { error } = await supabase.from("products").delete().eq("id", id)
          return { error: error?.message ?? null }
        } catch (err) {
          return { error: err instanceof Error ? err.message : "Erro ao excluir produto" }
        }
      },

      subscribeToStores: () => {
        const channel = supabase
          .channel('stores-realtime')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'stores' },
            (payload) => {
              console.log('[Realtime] Mudança detectada:', payload.eventType)
              if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
                const updatedStore = payload.new as Store
                set((state) => ({
                  stores: state.stores.map((s) =>
                    s.id === updatedStore.id ? { ...s, ...updatedStore } : s
                  ),
                  myStores: state.myStores.map((s) =>
                    s.id === updatedStore.id ? { ...s, ...updatedStore } : s
                  )
                }))
              }
            }
          )
          .subscribe((status) => {
            console.log('[Realtime] Status da subscrição:', status)
          })

        return () => {
          supabase.removeChannel(channel)
        }
      },
    }),
    {
      name: "store-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ activeStoreId: state.activeStoreId }),
    }
  )
)
