import { useState, useEffect } from 'react'
import { X, MapPin, Phone, Instagram, MessageCircle, Clock, Image, Package, Maximize } from 'lucide-react'
import { supabase, type Store, type Product } from '../lib/supabase'
import { CATEGORY_ICONS } from '../lib/supabase'
import { getStoreStatus } from '../lib/hours'

interface StoreModalProps {
  store: Store | null
  onClose: () => void
  onShowOnMap?: (store: Store) => void
}

export default function StoreModal({ store, onClose, onShowOnMap }: StoreModalProps) {
  const [showHours, setShowHours] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [showProducts, setShowProducts] = useState(false)
  const [showGallery, setShowGallery] = useState(false)

  useEffect(() => {
    if (store?.id) {
      const fetchStoreProducts = async () => {
        setLoadingProducts(true)
        const { data } = await supabase
          .from('products')
          .select('*')
          .eq('store_id', store.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
        
        setProducts(data || [])
        setLoadingProducts(false)
      }
      fetchStoreProducts()
    }
  }, [store?.id])
  
  if (!store) return null

  const categoryIcon = CATEGORY_ICONS[store.category as keyof typeof CATEGORY_ICONS] ?? '📦'
  const statusInfo = getStoreStatus(store.business_hours)

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-fade-in"
      onClick={onClose}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-palmas-dark/60 backdrop-blur-md" />

      {/* Modal Container */}
      <div
        className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl animate-scale-in overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Section (Banner + Basic Info) */}
        <div className="relative flex-shrink-0">
          <div className="h-40 bg-gray-100 relative">
            {store.banner_url ? (
              <img src={store.banner_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-palmas-blue/20 to-palmas-dark/20 flex items-center justify-center text-8xl opacity-30">
                {categoryIcon}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all border border-white/30 z-20"
            >
              <X size={20} />
            </button>
          </div>

          <div className="px-8 pb-4 -mt-12 relative z-10">
            <div className="flex items-end gap-5">
              <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center text-5xl flex-shrink-0 border-4 border-white shadow-2xl overflow-hidden">
                {store.logo_url ? (
                  <img src={store.logo_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  categoryIcon
                )}
              </div>
              <div className="flex-1 pb-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className={`text-[9px] font-black uppercase tracking-widest ${statusInfo.color} bg-white px-2 py-0.5 rounded-md shadow-sm border ${statusInfo.borderColor} border-opacity-50`}>
                    {statusInfo.label}
                  </span>
                  {onShowOnMap && (
                    <button
                      onClick={() => onShowOnMap(store)}
                      className="flex items-center gap-1.5 px-3 py-1 bg-palmas-blue hover:bg-palmas-dark text-white rounded-md text-[10px] font-black uppercase tracking-widest transition-all border border-white shadow-lg"
                    >
                      <MapPin size={10} /> Localizar no Mapa
                    </button>
                  )}
                </div>
                <h2 className="font-display text-2xl font-bold text-gray-900 truncate leading-tight">{store.name}</h2>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">

          {/* Description */}
          <div className="mb-4">
            <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 px-1">Sobre a Banca</h4>
            <p className="text-gray-600 text-[13px] leading-relaxed bg-gray-50/50 p-3 rounded-2xl border border-dashed border-gray-200">
              {store.description || 'Esta loja ainda não adicionou uma descrição detalhada.'}
            </p>
          </div>


          {/* Action Buttons (Catalog, Gallery, Hours) */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            {(products.length > 0 || loadingProducts) && (
              <button
                onClick={() => setShowProducts(true)}
                className="flex flex-col items-center justify-center gap-2 p-3 bg-palmas-blue/5 hover:bg-palmas-blue/10 rounded-2xl transition-all border border-palmas-blue/10 group"
              >
                <div className="w-9 h-9 bg-palmas-blue rounded-xl flex items-center justify-center text-white shadow-lg shadow-palmas-blue/20 group-hover:scale-110 transition-transform">
                  <Package size={18} />
                </div>
                <div className="text-center">
                  <div className="text-[8px] font-black text-palmas-blue uppercase tracking-widest leading-none mb-1">Produtos</div>
                  <div className="text-[10px] font-bold text-palmas-text">Catálogo</div>
                </div>
              </button>
            )}

            {store.business_hours && (
              <button
                onClick={() => setShowHours(true)}
                className="flex flex-col items-center justify-center gap-2 p-3 bg-amber-50 hover:bg-amber-100 rounded-2xl transition-all border border-amber-100 group"
              >
                <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
                  <Clock size={18} />
                </div>
                <div className="text-center">
                  <div className="text-[8px] font-black text-amber-700 uppercase tracking-widest leading-none mb-1">Horário</div>
                  <div className="text-[10px] font-bold text-amber-900">Agenda</div>
                </div>
              </button>
            )}

            {store.gallery && store.gallery.length > 0 && (
              <button
                onClick={() => setShowGallery(true)}
                className="flex flex-col items-center justify-center gap-2 p-3 bg-purple-50 hover:bg-purple-100 rounded-2xl transition-all border border-purple-100 group"
              >
                <div className="w-9 h-9 bg-purple-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                  <Image size={18} />
                </div>
                <div className="text-center">
                  <div className="text-[8px] font-black text-purple-700 uppercase tracking-widest leading-none mb-1">Galeria</div>
                  <div className="text-[10px] font-bold text-purple-900">Fotos</div>
                </div>
              </button>
            )}
          </div>

          {/* Contact Section */}
          <div className="pt-2 border-t border-gray-100/50">
            <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1 text-center">Fale com o Expositor</h4>
            <div className="flex flex-wrap justify-center gap-3">
              {store.whatsapp && (
                <a
                  href={`https://wa.me/${store.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-500/20 hover:scale-110 transition-transform"
                  title="WhatsApp"
                >
                  <MessageCircle size={22} />
                </a>
              )}
              {store.instagram && (
                <a
                  href={`https://instagram.com/${store.instagram}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-12 h-12 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-pink-500/20 hover:scale-110 transition-transform"
                  title="Instagram"
                >
                  <Instagram size={22} />
                </a>
              )}
              {store.phone && (
                <a
                  href={`tel:${store.phone}`}
                  className="w-12 h-12 bg-palmas-blue rounded-2xl flex items-center justify-center text-white shadow-lg shadow-palmas-blue/20 hover:scale-110 transition-transform"
                  title="Telefone"
                >
                  <Phone size={22} />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex-shrink-0">
          <button 
            onClick={onClose}
            className="w-full py-4 rounded-2xl bg-gray-900 text-white font-bold text-sm hover:bg-black transition-all shadow-xl shadow-gray-200"
          >
            Fechar Perfil
          </button>
        </div>

        {/* Inner Popups (Gallery/Products) remain as fixed overlays */}
        {showProducts && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-palmas-dark/60 backdrop-blur-md animate-fade-in" onClick={() => setShowProducts(false)}>
            <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-palmas-blue rounded-xl flex items-center justify-center text-white"><Package size={20} /></div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Produtos Disponíveis</h3>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{store.name}</p>
                  </div>
                </div>
                <button onClick={() => setShowProducts(false)} className="p-2 hover:bg-gray-200 rounded-full text-gray-400 transition-colors"><X size={20} /></button>
              </div>
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                <div className="grid grid-cols-1 gap-4">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-white shadow-sm flex-shrink-0">
                        {product.image_url ? <img src={product.image_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-200"><Package size={24} /></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <h5 className="text-sm font-bold text-gray-900 truncate">{product.name}</h5>
                          <span className="text-sm font-black text-palmas-blue">R$ {product.price.toFixed(2)}</span>
                        </div>
                        {product.description && <p className="text-[11px] text-gray-500 line-clamp-2 mt-1 leading-relaxed">{product.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex-shrink-0">
                <button onClick={() => setShowProducts(false)} className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold text-xs hover:bg-black transition-all">Voltar para Perfil</button>
              </div>
            </div>
          </div>
        )}

        {showGallery && store.gallery && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-palmas-dark/60 backdrop-blur-md animate-fade-in" onClick={() => setShowGallery(false)}>
            <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center text-white"><Image size={20} /></div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Galeria de Fotos</h3>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{store.name}</p>
                  </div>
                </div>
                <button onClick={() => setShowGallery(false)} className="p-2 hover:bg-gray-200 rounded-full text-gray-400 transition-colors"><X size={20} /></button>
              </div>
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                <div className="grid grid-cols-2 gap-4">
                  {store.gallery.map((url, i) => (
                    <div key={i} className="aspect-square rounded-2xl overflow-hidden shadow-sm border border-gray-100 group relative cursor-pointer" onClick={() => setSelectedImage(url)}>
                      <img src={url} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Maximize size={24} className="text-white" /></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex-shrink-0">
                <button onClick={() => setShowGallery(false)} className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold text-xs hover:bg-black transition-all">Voltar para Perfil</button>
              </div>
            </div>
          </div>
        )}

        {/* Business Hours Popup */}
        {showHours && store.business_hours && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-palmas-dark/60 backdrop-blur-md animate-fade-in" onClick={() => setShowHours(false)}>
            <div className="relative w-full max-w-xs bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-scale-in flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white"><Clock size={20} /></div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Horários</h3>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{store.name}</p>
                  </div>
                </div>
                <button onClick={() => setShowHours(false)} className="p-2 hover:bg-gray-200 rounded-full text-gray-400 transition-colors"><X size={20} /></button>
              </div>
              <div className="p-6">
                <div className="grid gap-3">
                  {JSON.parse(store.business_hours).map((h: any) => (
                    <div key={h.day} className="flex justify-between items-center py-1 border-b border-gray-50 last:border-0">
                      <span className="text-[11px] text-gray-500 font-bold uppercase tracking-tighter">{h.day}</span>
                      <span className={`text-xs font-black ${h.closed ? 'text-red-500' : 'text-gray-900'}`}>
                        {h.closed ? 'FECHADO' : `${h.open} - ${h.close}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex-shrink-0">
                <button onClick={() => setShowHours(false)} className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold text-xs hover:bg-black transition-all">Voltar para Perfil</button>
              </div>
            </div>
          </div>
        )}

        {/* Lightbox */}
        {selectedImage && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fade-in" onClick={() => setSelectedImage(null)}>
            <button className="absolute top-6 right-6 text-white hover:text-gray-300 p-2"><X size={32} /></button>
            <img src={selectedImage} alt="" className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl animate-scale-in object-contain" onClick={e => e.stopPropagation()} />
          </div>
        )}
      </div>
    </div>
  )
}

