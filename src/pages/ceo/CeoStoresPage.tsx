import { useEffect, useState } from 'react'
import { Search, CheckCircle, Clock, Trash2, Eye, Star } from 'lucide-react'
import { useStoreStore } from '../../store/storeStore'
import StoreModal from '../../components/StoreModal'
import type { Store } from '../../lib/supabase'
import { CATEGORY_ICONS, CATEGORY_LABELS } from '../../lib/supabase'

type StatusFilter = 'all' | 'pending' | 'active' | 'suspended'

export default function CeoStoresPage() {
  const { stores, loading, fetchAllStores, updateStoreStatus, updateStore, deleteStore } = useStoreStore()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [viewStore, setViewStore] = useState<Store | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  useEffect(() => { fetchAllStores() }, [fetchAllStores])

  const filtered = stores.filter(s => {
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || s.status === statusFilter
    const matchCategory = categoryFilter === 'all' || s.category === categoryFilter
    return matchSearch && matchStatus && matchCategory
  })

  async function handleStatus(id: string, status: Store['status']) {
    await updateStoreStatus(id, status)
    fetchAllStores()
  }

  async function handleToggleFeatured(id: string, is_featured: boolean) {
    await updateStore(id, { is_featured })
    fetchAllStores()
  }

  async function handleDelete(id: string) {
    try {
      const { error } = await deleteStore(id)
      if (error) throw new Error(error)
      
      alert('Loja excluída com sucesso!')
      setConfirmDelete(null)
      fetchAllStores()
    } catch (err) {
      console.error('Error deleting store:', err)
      alert('Erro ao excluir loja. Verifique suas permissões.')
      setConfirmDelete(null)
    }
  }

  const counts = {
    all: stores.length,
    pending: stores.filter(s => s.status === 'pending').length,
    active: stores.filter(s => s.status === 'active').length,
    suspended: stores.filter(s => s.status === 'suspended').length,
  }

  return (
    <div className="animate-fade-in pb-10">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-palmas-text">Lojas</h1>
        <p className="text-gray-600 mt-1 text-sm">Gerencie todas as lojas da feira</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar loja pelo nome..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-11"
          />
        </div>
        
        {/* Category filter */}
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="input-field sm:w-48 text-xs font-medium"
        >
          <option value="all">Todas categorias</option>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>

        <div className="flex gap-1 p-1 bg-white rounded-md border border-gray-200">
          {(['all', 'pending', 'active', 'suspended'] as StatusFilter[]).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                statusFilter === s ? 'bg-palmas-blue text-white shadow-sm' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {s === 'all' ? 'Todas' : s === 'pending' ? 'Pendentes' : s === 'active' ? 'Ativas' : 'Suspensas'}
              <span className={`px-1.5 py-0.5 rounded text-[10px] ${statusFilter === s ? 'bg-white/20' : 'bg-gray-100'}`}>
                {counts[s]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading && stores.length === 0 ? (
          <div className="p-8 text-center text-gray-500 flex flex-col items-center gap-4">
            <Clock className="animate-spin text-palmas-blue" size={24} />
            <p>Carregando lojas...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-3">🏪</div>
            <p>Nenhuma loja encontrada</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/30">
                  <th className="text-left px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Loja</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest hidden sm:table-cell">Categoria</th>
                  <th className="text-center px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Destaque</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="text-right px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(store => (
                  <tr key={store.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform overflow-hidden">
                          {store.logo_url ? (
                            <img src={store.logo_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            CATEGORY_ICONS[store.category as keyof typeof CATEGORY_ICONS] || '📦'
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-sm">{store.name}</div>
                          <div className="text-[10px] text-gray-400 font-medium uppercase tracking-tight">{store.profiles?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-100 px-2 py-1 rounded-md">
                        {CATEGORY_LABELS[store.category as keyof typeof CATEGORY_LABELS]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleToggleFeatured(store.id, !store.is_featured)}
                        className={`transition-all hover:scale-125 ${store.is_featured ? 'text-yellow-400' : 'text-gray-200 hover:text-gray-400'}`}
                      >
                        <Star size={18} fill={store.is_featured ? 'currentColor' : 'none'} />
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        store.status === 'active' ? 'bg-green-50 text-green-600 border-green-100' :
                        store.status === 'pending' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                        'bg-red-50 text-red-600 border-red-100'
                      }`}>
                        {store.status === 'active' ? 'Ativa' : store.status === 'pending' ? 'Pendente' : 'Suspensa'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setViewStore(store)}
                          className="p-2 bg-gray-50 text-gray-400 hover:text-palmas-blue hover:bg-palmas-blue/10 rounded-xl transition-all"
                          title="Ver detalhes"
                        >
                          <Eye size={16} />
                        </button>
                        {store.status !== 'active' && (
                          <button
                            onClick={() => handleStatus(store.id, 'active')}
                            className="p-2 bg-green-50 text-green-500 hover:bg-green-500 hover:text-white rounded-xl transition-all shadow-sm"
                            title="Aprovar"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                        {store.status !== 'suspended' && (
                          <button
                            onClick={() => handleStatus(store.id, 'suspended')}
                            className="p-2 bg-orange-50 text-orange-500 hover:bg-orange-500 hover:text-white rounded-xl transition-all shadow-sm"
                            title="Suspender"
                          >
                            <Clock size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => setConfirmDelete(store.id)}
                          className="p-2 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View modal */}
      <StoreModal store={viewStore} onClose={() => setViewStore(null)} />

      {/* Delete confirm modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-palmas-dark/40 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
          <div className="relative bg-white p-8 max-w-sm w-full rounded-[2.5rem] shadow-2xl animate-fade-in-up">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <h3 className="font-display text-xl font-bold text-palmas-text mb-2">Confirmar exclusão</h3>
              <p className="text-gray-500 text-sm mb-8 leading-relaxed">Esta ação é irreversível. A loja e todos os seus dados serão removidos permanentemente.</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)} className="flex-1 py-4 px-6 bg-gray-50 hover:bg-gray-100 text-gray-500 font-bold rounded-2xl transition-all">Cancelar</button>
                <button onClick={() => handleDelete(confirmDelete)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-4 rounded-2xl transition-all shadow-xl shadow-red-200">
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
