import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Store, AlertCircle, CheckCircle, Clock, ArrowRight, Phone, Instagram, Flame, Timer, Zap, Lock } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useStoreStore } from '../../store/storeStore'
import { CATEGORY_ICONS } from '../../lib/supabase'

export default function AdminDashboard() {
  const { user } = useAuthStore()
  const { myStore, fetchMyStore, updateFlashOffer, subscribeToStores } = useStoreStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate('/')
      return
    }
    
    fetchMyStore(user.id)
    const unsubscribe = subscribeToStores()
    return () => unsubscribe()
  }, [user, fetchMyStore, subscribeToStores, navigate])

  const statusConfig = {
    pending: { label: 'Aguardando aprovação', icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30' },
    active: { label: 'Loja ativa', icon: CheckCircle, color: 'text-white', bg: 'bg-green-600 border-green-600' },
    suspended: { label: 'Loja suspensa', icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' },
  }

  const status = myStore ? statusConfig[myStore.status] : null

  const [offerState, setOfferState] = useState<'idle' | 'active' | 'cooldown'>('idle')
  const [timeLeft, setTimeLeft] = useState(0)

  // Sync state with database on load/store update
  useEffect(() => {
    if (myStore) {
      const now = new Date()
      const offerEnd = myStore.offer_expires_at ? new Date(myStore.offer_expires_at) : null
      const cooldownEnd = myStore.cooldown_expires_at ? new Date(myStore.cooldown_expires_at) : null

      if (offerEnd && offerEnd > now) {
        setOfferState('active')
        setTimeLeft(Math.floor((offerEnd.getTime() - now.getTime()) / 1000))
      } else if (offerEnd && offerEnd <= now) {
        const calculatedCooldownEnd = new Date(offerEnd.getTime() + 600000)
        if (calculatedCooldownEnd > now) {
          setOfferState('cooldown')
          setTimeLeft(Math.floor((calculatedCooldownEnd.getTime() - now.getTime()) / 1000))
          updateFlashOffer(myStore.id, null, calculatedCooldownEnd.toISOString())
        } else {
          setOfferState('idle')
          setTimeLeft(0)
          updateFlashOffer(myStore.id, null, null)
        }
      } else if (cooldownEnd && cooldownEnd > now) {
        setOfferState('cooldown')
        setTimeLeft(Math.floor((cooldownEnd.getTime() - now.getTime()) / 1000))
      } else {
        setOfferState('idle')
        setTimeLeft(0)
      }
    }
  }, [myStore])

  useEffect(() => {
    let interval: any
    if (offerState !== 'idle' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0 && offerState !== 'idle') {
      if (offerState === 'active' && myStore) {
        const cooldownAt = new Date(Date.now() + 600000).toISOString()
        updateFlashOffer(myStore.id, null, cooldownAt)
        setOfferState('cooldown')
        setTimeLeft(600)
      } else if (offerState === 'cooldown' && myStore) {
        updateFlashOffer(myStore.id, null, null)
        setOfferState('idle')
      }
    }
    return () => clearInterval(interval)
  }, [offerState, timeLeft, myStore])

  const handleActivate = async () => {
    if (!myStore) return
    const expiresAt = new Date(Date.now() + 600000).toISOString()
    const { error } = await updateFlashOffer(myStore.id, expiresAt, null)
    if (!error) {
      setOfferState('active')
      setTimeLeft(600)
    }
  }

  const handleEndActive = async () => {
    if (!myStore) return
    const cooldownAt = new Date(Date.now() + 600000).toISOString()
    const { error } = await updateFlashOffer(myStore.id, null, cooldownAt)
    if (!error) {
      setOfferState('cooldown')
      setTimeLeft(600)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-palmas-text">
          Olá, {user?.full_name?.split(' ')[0] ?? 'Lojista'}
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
          <Link to="/store" className="btn-primary inline-flex items-center gap-2 px-8 py-3">
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
              <div className={`card overflow-hidden border-2 transition-all duration-500 flex flex-col ${
                offerState === 'active' ? 'border-orange-500 shadow-orange-200 shadow-xl scale-[1.02]' : 
                offerState === 'cooldown' ? 'border-gray-200 opacity-70 bg-gray-50' : 
                'border-gray-100 opacity-90'
              }`}>
                <div className={`p-4 flex items-center justify-between ${
                  offerState === 'active' ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white' : 
                  offerState === 'cooldown' ? 'bg-gray-200 text-gray-500' : 
                  'bg-gray-50 text-gray-500'
                }`}>
                  <div className="flex items-center gap-2">
                    {offerState === 'active' ? <Flame size={18} className="animate-bounce" /> : <Zap size={18} />}
                    <h4 className="font-bold text-xs uppercase tracking-widest">
                      {offerState === 'cooldown' ? 'Recarregando...' : 'Oferta Relâmpago'}
                    </h4>
                  </div>
                  {offerState !== 'idle' && (
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${offerState === 'active' ? 'bg-white/20' : 'bg-gray-300/50'}`}>
                      {offerState === 'active' ? <Timer size={14} className="animate-pulse" /> : <Lock size={14} />}
                      <span className="text-[11px] font-mono font-bold">{formatTime(timeLeft)}</span>
                    </div>
                  )}
                </div>

                <div className="p-6 flex-1 flex flex-col items-center text-center">
                  {offerState === 'idle' && (
                    <>
                      <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4 text-orange-500">
                        <Zap size={32} />
                      </div>
                      <h5 className="font-bold text-gray-800 text-sm mb-2">Impulsione suas vendas!</h5>
                      <p className="text-[11px] text-gray-500 mb-6 leading-relaxed">
                        Ative uma oferta por 10 minutos e ganhe destaque visual.
                      </p>
                    </>
                  )}

                  {offerState === 'active' && (
                    <>
                      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 text-red-500 relative">
                        <Flame size={32} className="animate-pulse" />
                        <div className="absolute inset-0 bg-red-400/20 rounded-full animate-ping" />
                      </div>
                      <h5 className="font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 text-sm mb-2 uppercase italic">Banca em Brasa! 🔥</h5>
                      <p className="text-[11px] text-gray-600 font-medium mb-6">
                        Sua banca está brilhando no mapa por 10 min!
                      </p>
                    </>
                  )}

                  {offerState === 'cooldown' && (
                    <>
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                        <Lock size={32} />
                      </div>
                      <h5 className="font-bold text-gray-500 text-sm mb-2">Aguarde o Cooldown</h5>
                      <p className="text-[11px] text-gray-400 mb-6">
                        A oferta poderá ser ativada novamente em breve.
                      </p>
                    </>
                  )}

                  <button 
                    disabled={offerState === 'cooldown'}
                    onClick={() => {
                      if (offerState === 'idle') {
                        handleActivate();
                      } else if (offerState === 'active') {
                        handleEndActive();
                      }
                    }}
                    className={`w-full py-3 rounded-xl font-bold text-xs transition-all shadow-md ${
                      offerState === 'active' ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 
                      offerState === 'cooldown' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 
                      'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:scale-105'
                    }`}
                  >
                    {offerState === 'active' ? 'Encerrar Agora' : 
                     offerState === 'cooldown' ? 'Indisponível' : 
                     'Ativar Agora'}
                  </button>
                </div>
              </div>

              <Link
                to="/store"
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
