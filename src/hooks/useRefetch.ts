import { useEffect, useCallback, useRef } from 'react'
import { useStoreStore } from '../store/storeStore'
import { useSettingsStore } from '../store/settingsStore'
import { useAuthStore } from '../store/authStore'

export function useRefetch() {
  const { fetchActiveStores, fetchAllStores, fetchMyStore } = useStoreStore()
  const { fetchSettings } = useSettingsStore()
  const { refreshSession } = useAuthStore()
  const isRefreshing = useRef(false)

  const refreshAll = useCallback(async () => {
    if (isRefreshing.current) return
    
    try {
      isRefreshing.current = true
      console.log('[Refetch] Re-sincronizando dados com o banco...')
      
      // Refresh auth/session first
      await refreshSession()
      
      // Get the LATEST user after refresh
      const currentUser = useAuthStore.getState().user
      
      // Refresh common data
      const promises: Promise<any>[] = [
        fetchActiveStores(),
        fetchSettings(),
      ]

      // If CEO, refresh all stores
      if (currentUser?.role === 'ceo') {
        promises.push(fetchAllStores())
      }

      // If Admin/Lojista, refresh their specific stores
      if (currentUser?.id) {
        promises.push(fetchMyStore(currentUser.id))
      }

      await Promise.all(promises)
      console.log('[Refetch] Sincronização concluída com sucesso.')
    } catch (err) {
      console.error('[Refetch] Erro ao sincronizar dados:', err)
    } finally {
      isRefreshing.current = false
    }
  }, [fetchActiveStores, fetchAllStores, fetchMyStore, fetchSettings, refreshSession])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshAll()
      }
    }

    const handleFocus = () => {
      refreshAll()
    }

    window.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    // Também dispara um refetch inicial para garantir que o estado esteja ok
    refreshAll()

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [refreshAll])
}
