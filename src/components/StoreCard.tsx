import { MapPin, Phone, Instagram, MessageCircle, ArrowUpRight } from 'lucide-react'
import type { Store } from '../lib/supabase'
import { CATEGORY_ICONS, CATEGORY_LABELS } from '../lib/supabase'

interface StoreCardProps {
  store: Store
  onClick?: () => void
  selected?: boolean
  compact?: boolean
}

export default function StoreCard({ store, onClick, selected, compact }: StoreCardProps) {
  const categoryIcon = CATEGORY_ICONS[store.category as keyof typeof CATEGORY_ICONS] ?? '📦'
  const categoryLabel = CATEGORY_LABELS[store.category as keyof typeof CATEGORY_LABELS] ?? store.category

  if (compact) {
    return (
      <div
        onClick={onClick}
        className={`
          flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300 group
          ${selected
            ? 'bg-palmas-blue text-white shadow-lg shadow-palmas-blue/20 scale-[1.02]'
            : 'bg-white border border-gray-100 hover:border-palmas-blue/30 hover:bg-palmas-blue/5'}
        `}
      >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 shadow-sm transition-transform group-hover:scale-110 ${selected ? 'bg-white/20' : 'bg-gray-50'}`}>
          {store.logo_url ? (
            <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover rounded-xl" />
          ) : (
            categoryIcon
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className={`font-bold text-sm truncate ${selected ? 'text-white' : 'text-gray-900'}`}>{store.name}</div>
          <div className={`text-[10px] font-medium flex items-center gap-1.5 mt-0.5 ${selected ? 'text-white/70' : 'text-gray-500'}`}>
            <MapPin size={10} />
            Banca {store.booth_label}
          </div>
        </div>
        {!selected && (
          <ArrowUpRight size={14} className="text-gray-300 group-hover:text-palmas-blue transition-colors" />
        )}
      </div>
    )
  }

  return (
    <div
      onClick={onClick}
      className={`
        card overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl group relative
        ${selected ? 'ring-2 ring-palmas-blue shadow-xl' : ''}
      `}
    >
      {/* Banner */}
      <div className="h-32 bg-gray-100 relative overflow-hidden">
        {store.banner_url ? (
          <img src={store.banner_url} alt={store.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-6xl opacity-10 group-hover:opacity-20 transition-opacity">
            {categoryIcon}
          </div>
        )}
        <div className="absolute top-3 right-3">
          <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-black text-gray-800 shadow-xl flex items-center gap-1.5 border border-white/50">
            <MapPin size={10} className="text-palmas-blue" /> BANCA {store.booth_label}
          </div>
        </div>
      </div>

      {/* Logo + info */}
      <div className="p-5 relative">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 -mt-10 border-4 border-white shadow-xl z-10 transition-transform duration-500 group-hover:rotate-3 group-hover:scale-110">
            {store.logo_url ? (
              <img src={store.logo_url} alt="" className="w-full h-full object-cover rounded-xl" />
            ) : (
              categoryIcon
            )}
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h3 className="font-bold text-gray-900 truncate text-lg group-hover:text-palmas-blue transition-colors">{store.name}</h3>
            <span className="text-xs font-bold text-palmas-blue uppercase tracking-widest">{categoryLabel}</span>
          </div>
        </div>

        {store.description && (
          <p className="text-sm text-gray-500 mt-4 line-clamp-2 leading-relaxed h-10">{store.description}</p>
        )}

        {/* Contact icons */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-50">
          <div className="flex items-center gap-4">
            {store.phone && (
              <a href={`tel:${store.phone}`} onClick={e => e.stopPropagation()}
                className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-palmas-blue hover:text-white transition-all">
                <Phone size={14} />
              </a>
            )}
            {store.whatsapp && (
              <a href={`https://wa.me/${store.whatsapp}`} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-green-500 hover:text-white transition-all">
                <MessageCircle size={14} />
              </a>
            )}
            {store.instagram && (
              <a href={`https://instagram.com/${store.instagram}`} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-pink-500 hover:text-white transition-all">
                <Instagram size={14} />
              </a>
            )}
          </div>
          <div className="text-[10px] font-black text-palmas-blue uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            Ver Detalhes <ArrowUpRight size={10} />
          </div>
        </div>
      </div>
    </div>
  )
}

