import { useEffect, useState } from 'react'
import { MapPin, CheckCircle, Clock, RefreshCw } from 'lucide-react'
import { useStoreStore } from '../../store/storeStore'
import { CATEGORY_ICONS } from '../../lib/supabase'
import FairMap from '../../components/FairMap'
import StoreModal from '../../components/StoreModal'
import type { Store } from '../../lib/supabase'

export default function CeoMapPage() {
  const { stores, loading, fetchAllStores } = useStoreStore()
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending'>('all')

  useEffect(() => { fetchAllStores() }, [fetchAllStores])

  const filtered = stores.filter(s =>
    statusFilter === 'all' ? true :
    statusFilter === 'active' ? s.status === 'active' :
    s.status === 'pending'
  )

  const occupiedCount = stores.length
  const TOTAL_CELLS = 12 * 8 - (2 * 8) - (1 * 12) // minus aisles
  const occupancyPct = Math.round((occupiedCount / TOTAL_CELLS) * 100)

  return (
    <div className="animate-fade-in">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-palmas-text">Mapa da Feira</h1>
          <p className="text-gray-600 mt-1 text-sm">Visualização completa da ocupação das bancas</p>
        </div>
        <button onClick={fetchAllStores} className="btn-ghost flex items-center gap-2">
          <RefreshCw size={15} /> Atualizar
        </button>
      </div>

      {/* Occupancy stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card p-4 text-center">
          <div className="font-display text-2xl font-bold text-palmas-blue">{stores.filter(s => s.status === 'active').length}</div>
          <div className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1">
            <CheckCircle size={11} className="text-green-500" /> Ativas
          </div>
        </div>
        <div className="card p-4 text-center">
          <div className="font-display text-2xl font-bold text-yellow-400">{stores.filter(s => s.status === 'pending').length}</div>
          <div className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1">
            <Clock size={11} className="text-yellow-400" /> Pendentes
          </div>
        </div>
        <div className="card p-4 text-center">
          <div className="font-display text-2xl font-bold text-gray-700">{occupancyPct}%</div>
          <div className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1">
            <MapPin size={11} /> Ocupação
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-1 p-1 bg-white rounded-md border border-gray-200 mb-6 w-fit">
        {(['all', 'active', 'pending'] as const).map(f => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              statusFilter === f ? 'bg-palmas-blue text-white' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {f === 'all' ? 'Todas' : f === 'active' ? 'Ativas' : 'Pendentes'}
          </button>
        ))}
      </div>

      {/* Map */}
      <div className="card p-6">
        {loading ? (
          <div className="h-64 flex items-center justify-center text-gray-500">Carregando mapa...</div>
        ) : (
          <FairMap
            stores={filtered}
            selectedStore={selectedStore}
            onSelectStore={store => {
              setSelectedStore(store)
            }}
          />
        )}
      </div>

      {/* Store list beside map */}
      {filtered.length > 0 && (
        <div className="mt-6">
          <h2 className="font-display text-lg font-semibold text-gray-800 mb-3">
            Bancas ocupadas ({filtered.length})
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(store => (
              <div
                key={store.id}
                onClick={() => setSelectedStore(selectedStore?.id === store.id ? null : store)}
                className={`flex items-center gap-3 p-3 rounded-md cursor-pointer transition-all ${
                  selectedStore?.id === store.id
                    ? 'bg-palmas-blue border border-palmas-blue'
                    : 'bg-white border border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-9 h-9 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-lg flex-shrink-0 overflow-hidden">
                  {store.logo_url ? (
                    <img src={store.logo_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    CATEGORY_ICONS[store.category as keyof typeof CATEGORY_ICONS] || '📦'
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-palmas-text text-sm truncate">{store.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-500 font-mono">Banca {store.booth_label}</span>
                    <span className={`w-1.5 h-1.5 rounded-lg ${
                      store.status === 'active' ? 'bg-green-500' :
                      store.status === 'pending' ? 'bg-yellow-400' : 'bg-red-400'
                    }`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <StoreModal store={selectedStore} onClose={() => setSelectedStore(null)} />
    </div>
  )
}
