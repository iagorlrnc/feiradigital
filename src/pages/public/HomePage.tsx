import { useState, useEffect } from 'react'
import { Search, MapPin, Grid3X3, List, X, Star, Instagram, Facebook, Twitter } from 'lucide-react'
import { useStoreStore } from '../../store/storeStore'
import { useSettingsStore } from '../../store/settingsStore'
import StoreCard from '../../components/StoreCard'
import StoreModal from '../../components/StoreModal'
import FairMap from '../../components/FairMap'
import type { Store } from '../../lib/supabase'
import { CATEGORY_LABELS, CATEGORY_ICONS } from '../../lib/supabase'
import { getStoreStatus } from '../../lib/hours'

type ViewMode = 'grid' | 'list' | 'map'

export default function HomePage() {
  const { stores, loadingActive: loading, fetchActiveStores, subscribeToStores } = useStoreStore()
  const { settings, fetchSettings } = useSettingsStore()
  const [view, setView] = useState<ViewMode>('map')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)
  const [modalStore, setModalStore] = useState<Store | null>(null)

  useEffect(() => {
    fetchActiveStores()
    fetchSettings()
    
    const unsubscribe = subscribeToStores()
    return () => unsubscribe()
  }, [fetchActiveStores, fetchSettings, subscribeToStores])

  const safeStores = stores || []
  const filtered = safeStores.filter(s => {
    const searchLower = search.toLowerCase()
    const matchSearch = !search || 
      s.name.toLowerCase().includes(searchLower) ||
      s.description?.toLowerCase().includes(searchLower) ||
      s.products?.some(p => p.name.toLowerCase().includes(searchLower))
    
    const matchCat = !categoryFilter || s.category === categoryFilter
    return matchSearch && matchCat
  })

  const categories = [...new Set(stores.map(s => s.category))]
  
  // Dynamic featured stores
  const featuredStores = stores.filter(s => s.status === 'active' && s.is_featured)
  // Fallback to latest stores if none marked as featured
  const displayFeatured = featuredStores.length > 0 ? featuredStores : stores.filter(s => s.status === 'active').slice(0, 3)

  function handleMapSelect(store: Store | null) {
    setSelectedStore(store)
    if (store) setModalStore(store)
  }

  function handleShowOnMap(store: Store) {
    setModalStore(null)
    setView('map')
    setSelectedStore(store)
    // Small timeout to ensure the map is rendered before scrolling/focusing
    setTimeout(() => {
      const element = document.getElementById(`booth-${store.id}`)
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
  }

  const formatDateRange = () => {
    if (!settings?.start_date || !settings?.end_date) return '304 Sul'
    const start = new Date(settings.start_date)
    const end = new Date(settings.end_date)
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' }
    return `${start.toLocaleDateString('pt-BR', { day: 'numeric' })} a ${end.toLocaleDateString('pt-BR', options)}`
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Hero */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-palmas-blue/10 text-palmas-blue border border-palmas-blue/20 mb-6 text-xs font-bold tracking-wide uppercase">
            <MapPin size={14} className="animate-pulse" />
            {formatDateRange()}
          </div>
          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold text-palmas-text leading-tight tracking-tight">
            Bem vindo à{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-palmas-blue via-palmas-dark to-palmas-blue bg-[length:200%_auto] animate-gradient">
              Feira Digital
            </span>
          </h1>
          <p className="mt-6 text-gray-500 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Uma plataforma de conexão entre expositores e visitantes.
          </p>
        </div>


        {/* Stats bar */}
        <div className="grid grid-cols-2 gap-6 mb-12 max-w-xl mx-auto">
          {[
            { label: 'Expositores', val: stores.length, color: 'text-palmas-blue' },
            { label: 'Categorias', val: categories.length, color: 'text-green-500' },
          ].map((stat) => (
            <div key={stat.label} className="card p-6 text-center border-none shadow-sm hover:shadow-md transition-shadow">
              <div className={`font-display text-3xl font-bold ${stat.color} mb-1`}>{stat.val}</div>
              <div className="text-[10px] text-gray-400 uppercase font-black tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Featured Section */}
        {!search && !categoryFilter && (
          <div className="mb-12 animate-fade-in">
            <div className="flex items-center justify-between mb-6 px-1">
              <h2 className="font-display text-2xl font-bold text-palmas-text flex items-center gap-3">
                <Star className="text-yellow-400 fill-yellow-400" size={24} />
                Lojas em Destaque
              </h2>
              <div className="h-px flex-1 bg-gray-100 mx-6 hidden sm:block" />
            </div>            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayFeatured.map(store => {
                const status = getStoreStatus(store.business_hours);
                return (
                  <div 
                    key={store.id} 
                    className="group cursor-pointer relative bg-white rounded-[2rem] border border-gray-100 hover:border-palmas-blue/20 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all duration-500 overflow-hidden"
                    onClick={() => setModalStore(store)}
                  >
                    {/* Banner with overlay */}
                    <div className="h-28 bg-gray-50 relative overflow-hidden">
                      {store.banner_url ? (
                        <img src={store.banner_url} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-palmas-blue/10 to-palmas-dark/10" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                      
                      {/* Glassmorphism Category Tag */}
                      <div className="absolute top-3 right-3 px-2 py-1 bg-white/30 backdrop-blur-md rounded-lg text-[8px] font-black text-white uppercase tracking-widest border border-white/20 shadow-sm">
                        {CATEGORY_LABELS[store.category as keyof typeof CATEGORY_LABELS] || store.category}
                      </div>

                      {/* Status Pulse */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 bg-black/20 backdrop-blur-md rounded-lg border border-white/10">
                        <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${status.status === 'open' ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'bg-red-400'}`} />
                        <span className="text-[8px] font-black text-white uppercase tracking-tighter">
                          {status.status === 'open' ? 'Aberto' : 'Fechado'}
                        </span>
                      </div>
                    </div>

                    {/* Info Section */}
                    <div className="px-6 pb-6 -mt-8 relative z-10">
                      <div className="flex items-end gap-4">
                        <div className="w-16 h-16 bg-white rounded-[1.25rem] flex items-center justify-center text-3xl shadow-xl border-4 border-white overflow-hidden flex-shrink-0 group-hover:-translate-y-1 transition-transform duration-300">
                          {store.logo_url ? (
                            <img src={store.logo_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            CATEGORY_ICONS[store.category as keyof typeof CATEGORY_ICONS] || '📦'
                          )}
                        </div>
                        <div className="flex-1 min-w-0 pb-1">
                          <div className="inline-block px-3 py-1 bg-white rounded-xl shadow-sm border border-gray-50 mb-1">
                            <h3 className="font-display font-bold text-gray-900 truncate text-base group-hover:text-palmas-blue transition-colors duration-300">
                              {store.name}
                            </h3>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Hover Decoration */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-palmas-blue to-palmas-dark transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm items-center">
          {/* View toggle */}
          <div className="flex p-1 bg-gray-100 rounded-2xl flex-shrink-0 w-full lg:w-auto">
            {(['map', 'list', 'grid'] as ViewMode[]).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  view === v ? 'bg-white text-palmas-blue shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {v === 'grid' && <Grid3X3 size={14} />}
                {v === 'list' && <List size={14} />}
                {v === 'map' && <MapPin size={14} />}
                <span className="capitalize">{v === 'map' ? 'Mapa' : v === 'grid' ? 'Grade' : 'Lista'}</span>
              </button>
            ))}
          </div>

          {/* Search & Category Group */}
          <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Pesquisar loja, produtos..."
                value={search}
                onChange={e => {
                  setSearch(e.target.value)
                  if (e.target.value.length > 0 && view === 'map') {
                    setView('list')
                  }
                }}
                className="w-full bg-gray-50 border-transparent focus:bg-white focus:border-palmas-blue/30 focus:ring-4 focus:ring-palmas-blue/5 rounded-2xl pl-12 pr-12 py-3.5 text-sm transition-all"
              />
              {search && (
                <button 
                  onClick={() => {
                    setSearch('')
                  }} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-all"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="bg-gray-50 border-transparent focus:bg-white focus:border-palmas-blue/30 focus:ring-4 focus:ring-palmas-blue/5 rounded-2xl px-6 py-3.5 text-sm font-bold text-gray-600 cursor-pointer transition-all sm:w-56"
            >
              <option value="">Todas Categorias</option>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card h-64 shimmer rounded-3xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={32} className="text-gray-300" />
            </div>
            <p className="text-xl font-bold text-gray-900">Ops! Nenhuma banca encontrada</p>
            <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">Tente usar termos mais genéricos ou mude a categoria de busca.</p>
            <button onClick={() => { setSearch(''); setCategoryFilter('') }} className="mt-8 text-palmas-blue font-bold hover:underline">
              Limpar todos os filtros
            </button>
          </div>
        ) : view === 'map' ? (
          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 space-y-6">
              <div className="card p-6 overflow-hidden">
                <FairMap
                  stores={filtered}
                  selectedStore={selectedStore}
                  onSelectStore={handleMapSelect}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="font-bold text-gray-900 text-sm">
                  {selectedStore ? 'Selecionada' : `${filtered.length} Bancas`}
                </h3>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Lista Rápida</span>
              </div>
              <div className="space-y-3 max-h-[560px] overflow-y-auto pr-2 custom-scrollbar">
                {filtered.map(store => (
                  <StoreCard
                    key={store.id}
                    store={store}
                    compact
                    selected={selectedStore?.id === store.id}
                    onClick={() => handleMapSelect(selectedStore?.id === store.id ? null : store)}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(store => (
              <StoreCard
                key={store.id}
                store={store}
                onClick={() => setModalStore(store)}
              />
            ))}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-4">
            {filtered.map(store => (
              <StoreCard
                key={store.id}
                store={store}
                compact
                onClick={() => setModalStore(store)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 pt-16 pb-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-palmas-blue rounded-xl flex items-center justify-center shadow-lg shadow-palmas-blue/20">
                  <MapPin size={20} className="text-white" />
                </div>
                <span className="font-display text-2xl font-black text-palmas-text">Feira<span className="text-palmas-blue">Tech</span></span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed max-w-sm mb-6">
                A plataforma definitiva para digitalização de feiras municipais. Conectando produtores locais a milhares de clientes de forma moderna e eficiente.
              </p>
              <div className="flex gap-4">
                {[Instagram, Facebook, Twitter].map((Icon, i) => (
                  <a key={i} href="#" className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-palmas-blue hover:text-white transition-all">
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-6">Links Rápidos</h4>
              <ul className="space-y-4 text-sm text-gray-500">
                <li><a href="#" className="hover:text-palmas-blue transition-colors">Início</a></li>
                <li><a href="#" className="hover:text-palmas-blue transition-colors">Mapa da Feira</a></li>
                <li><a href="#" className="hover:text-palmas-blue transition-colors">Lista de Expositores</a></li>
                <li><a href="#" className="hover:text-palmas-blue transition-colors">Como Participar</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-6">Suporte</h4>
              <ul className="space-y-4 text-sm text-gray-500">
                <li><a href="#" className="hover:text-palmas-blue transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-palmas-blue transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-palmas-blue transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-palmas-blue transition-colors">Privacidade</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-400">© 2026 FeiraTech Palmas. Todos os direitos reservados.</p>
            <div className="flex items-center gap-2 text-[10px] font-black text-gray-300 uppercase tracking-widest">
              Desenvolvido com <span className="text-red-400 animate-pulse">❤️</span> para empreendedores
            </div>
          </div>
        </div>
      </footer>



      {/* Store Modal */}
      <StoreModal 
        store={modalStore} 
        onClose={() => setModalStore(null)} 
        onShowOnMap={handleShowOnMap}
      />
    </div>
  )
}
