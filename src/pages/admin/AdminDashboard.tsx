import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Store, AlertCircle, CheckCircle, Clock, ArrowRight, Phone, Instagram } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useStoreStore } from '../../store/storeStore'
import { CATEGORY_ICONS } from '../../lib/supabase'

export default function AdminDashboard() {
  const { user } = useAuthStore()
  const { myStore, fetchMyStore } = useStoreStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) { navigate('/admin/login'); return }
    fetchMyStore(user.id)
  }, [user, fetchMyStore, navigate])

  const statusConfig = {
    pending: { label: 'Aguardando aprovação', icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30' },
    active: { label: 'Loja ativa', icon: CheckCircle, color: 'text-white', bg: 'bg-green-600 border-green-600' },
    suspended: { label: 'Loja suspensa', icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' },
  }

  const status = myStore ? statusConfig[myStore.status] : null

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-palmas-text">
          Olá, {user?.full_name?.split(' ')[0] ?? 'Lojista'} 👋
        </h1>
        <p className="text-gray-600 mt-1">Gerencie sua presença na feira digital</p>
      </div>

      {!myStore ? (
        /* No store yet */
        <div className="card p-12 text-center border-dashed border-2 border-gray-200">
          <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Store size={32} className="text-gray-400" />
          </div>
          <h2 className="font-display text-2xl font-bold text-gray-800 mb-3">
            Sua jornada começa aqui
          </h2>
          <p className="text-gray-500 text-sm mb-8 max-w-xs mx-auto leading-relaxed">
            Configure sua loja digital para ficar visível para milhares de visitantes da feira.
          </p>
          <Link to="/admin/store" className="btn-primary inline-flex items-center gap-2 px-8 py-3">
            <Store size={18} />
            Criar minha banca
          </Link>
        </div>
      ) : (
        <div className="space-y-6 pb-12">
          {/* Status card */}
          {status && (
            <div className={`flex items-center justify-between p-5 rounded-xl border-2 shadow-sm ${status.bg} transition-all hover:shadow-md`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-white shadow-inner`}>
                  <status.icon size={24} className={myStore.status === 'active' ? 'text-green-500' : status.color} />
                </div>
                <div>
                  <div className={`font-bold text-lg uppercase tracking-tight ${status.color}`}>{status.label}</div>
                  {myStore.status === 'pending' && (
                    <div className="text-xs text-gray-600 font-medium">Aguardando revisão da administração</div>
                  )}
                  {myStore.status === 'active' && (
                    <div className="text-xs text-white/90 font-medium">Sua loja está visível para o público!</div>
                  )}
                </div>
              </div>
              {/* Ver no site removido a pedido do usuário */}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Store preview card */}
            <div className="card overflow-hidden h-full flex flex-col">
              <div className="h-32 bg-gradient-to-br from-palmas-blue to-palmas-dark relative overflow-hidden">
                {myStore.banner_url ? (
                  <img src={myStore.banner_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center opacity-10">
                    <Store size={80} className="text-white" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute bottom-3 left-4 right-4 flex items-end gap-3">
                  <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center text-3xl shadow-lg border-2 border-white flex-shrink-0 overflow-hidden">
                    {myStore.logo_url ? (
                      <img src={myStore.logo_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      CATEGORY_ICONS[myStore.category as keyof typeof CATEGORY_ICONS] || '📦'
                    )}
                  </div>
                  <div className="pb-1">
                    <h3 className="font-bold text-white text-lg leading-none drop-shadow-md">{myStore.name}</h3>
                    <div className="text-[10px] text-white/90 font-bold uppercase mt-1">Banca {myStore.booth_label}</div>
                  </div>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed flex-1 italic">
                  "{myStore.description || 'Sem descrição cadastrada...'}"
                </p>
                <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-gray-100">
                  {myStore.instagram && (
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-700">
                      <Instagram size={14} className="text-pink-500" /> @{myStore.instagram}
                    </div>
                  )}
                  {myStore.phone && (
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-700">
                      <Phone size={14} className="text-palmas-blue" /> {myStore.phone}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* QR Code / Quick Tools */}
            <div className="space-y-4">
              <div className="card p-6 bg-gradient-to-br from-gray-50 to-white flex flex-col items-center text-center">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-4 group cursor-pointer">
                  <div className="w-28 h-28 bg-gray-100 rounded flex items-center justify-center border-2 border-dashed border-gray-300 relative">
                    <div className="font-mono text-[8px] text-gray-400">QR CODE MOCKUP</div>
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight size={24} className="text-palmas-blue" />
                    </div>
                  </div>
                </div>
                <h4 className="font-bold text-gray-800 text-sm">Divulgue sua banca</h4>
                <p className="text-[11px] text-gray-500 mt-1 mb-4">Imprima seu QR Code e coloque na sua banca física para os clientes te seguirem.</p>
                <button className="btn-secondary w-full py-2 text-xs font-bold border-2">Baixar QR Code</button>
              </div>

              <Link
                to="/admin/store"
                className="flex items-center justify-between p-5 card hover:bg-palmas-blue group hover:border-palmas-blue transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-palmas-blue/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
                    <Store size={20} className="text-palmas-blue group-hover:text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-800 text-sm group-hover:text-white transition-colors">Editar Loja</div>
                    <div className="text-[11px] text-gray-500 group-hover:text-white/80 transition-colors">Alterar fotos, textos e mapa</div>
                  </div>
                </div>
                <ArrowRight size={18} className="text-gray-400 group-hover:text-white transition-all group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
