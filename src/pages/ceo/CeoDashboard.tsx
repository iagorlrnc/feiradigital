import { useEffect } from "react"
import { Link } from "react-router-dom"
import {
  Store,
  Users,
  Map,
  Clock,
  CheckCircle,
  ArrowRight,
  Star,
} from "lucide-react"
import { useStoreStore } from "../../store/storeStore"
import { CATEGORY_ICONS } from "../../lib/supabase"

export default function CeoDashboard() {
  const { stores, loading, fetchAllStores } = useStoreStore()

  useEffect(() => {
    fetchAllStores()
  }, [fetchAllStores])

  const total = stores.length
  const active = stores.filter((s) => s.status === "active").length
  const featured = stores.filter((s) => s.is_featured).length
  const pending = stores.filter((s) => s.status === "pending").length

  const stats = [
    {
      label: "Total de lojas",
      value: total,
      icon: Store,
      color: "text-palmas-blue",
      bg: "bg-palmas-blue/10",
    },
    {
      label: "Em Destaque",
      value: featured,
      icon: Star,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
    },
    {
      label: "Ativas",
      value: active,
      icon: CheckCircle,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      label: "Pendentes",
      value: pending,
      icon: Clock,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
    },
  ]

  const recentStores = [...stores]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 5)

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-palmas-text">
          Dashboard
        </h1>
        <p className="text-gray-600 mt-1">Visão geral da plataforma</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-5 group hover:border-palmas-blue/50 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-xs mb-2 uppercase tracking-wider font-semibold">{label}</p>
                <p className={`font-display text-3xl font-bold ${color}`}>
                  {loading ? "—" : value}
                </p>
              </div>
              <div
                className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}
              >
                <Icon size={18} className={color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        {/* Category Distribution */}
        <div className="lg:col-span-1 card p-6">
          <h2 className="font-display text-lg font-semibold text-palmas-text mb-6 flex items-center gap-2">
            📊 Por Categoria
          </h2>
          <div className="space-y-4">
            {Object.entries(
              stores.reduce((acc, s) => {
                acc[s.category] = (acc[s.category] || 0) + 1
                return acc
              }, {} as Record<string, number>)
            ).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
              <div key={cat}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-600 font-medium capitalize">{cat}</span>
                  <span className="text-palmas-blue font-bold">{count}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-palmas-blue h-full rounded-full transition-all duration-1000" 
                    style={{ width: `${(count / total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {total === 0 && <p className="text-center text-gray-400 text-sm py-4">Sem dados</p>}
          </div>
        </div>

        {/* Quick actions */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-display text-lg font-semibold text-palmas-text mb-2 flex items-center gap-2">
            ⚡ Ações Rápidas
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                to: "/ceo/stores",
                icon: Store,
                label: "Gerenciar lojas",
                desc: "Aprovar, suspender, editar",
                color: "feira",
              },
              {
                to: "/ceo/map",
                icon: Map,
                label: "Mapa da feira",
                desc: "Visualizar ocupação",
                color: "sage",
              },
              {
                to: "/ceo/accounts",
                icon: Users,
                label: "Contas admin",
                desc: "Controlar acessos",
                color: "earth",
              },
            ].map(({ to, icon: Icon, label, desc }) => (
              <Link
                key={to}
                to={to}
                className="card p-5 hover:bg-gray-100 transition-all group flex items-center gap-4"
              >
                <div
                  className={`w-12 h-12 bg-palmas-blue/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-palmas-blue group-hover:text-white transition-colors`}
                >
                  <Icon size={22} className="group-hover:text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-800 text-sm">{label}</div>
                  <div className="text-xs text-gray-500">{desc}</div>
                </div>
                <ArrowRight
                  size={15}
                  className="text-gray-400 group-hover:text-palmas-blue group-hover:translate-x-1 transition-all"
                />
              </Link>
            ))}
          </div>
          
          {/* Pending approval highlight */}
          {pending > 0 && (
            <div className="p-5 bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 border border-yellow-500/30 rounded-xl flex items-center justify-between shadow-sm animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                  <Clock size={20} className="text-white" />
                </div>
                <div>
                  <div className="font-bold text-yellow-600 text-sm">
                    {pending} loja{pending > 1 ? "s" : ""} pendente{pending > 1 ? "s" : ""}
                  </div>
                  <div className="text-xs text-gray-600 font-medium">
                    Revise para publicar na plataforma
                  </div>
                </div>
              </div>
              <Link
                to="/ceo/stores"
                className="btn-primary py-2 px-4 text-xs font-bold"
              >
                Analisar
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent stores */}
      <div className="card shadow-sm border-gray-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-display text-lg font-semibold text-palmas-text flex items-center gap-2">
            🆕 Lojas Recentes
          </h2>
          <Link
            to="/ceo/stores"
            className="text-xs font-bold text-palmas-blue hover:underline flex items-center gap-1"
          >
            Ver catálogo completo <ArrowRight size={12} />
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {recentStores.length === 0 ? (
            <div className="p-12 text-center text-gray-500 text-sm">
              Nenhuma loja cadastrada no sistema
            </div>
          ) : (
            recentStores.map((store) => (
              <div
                key={store.id}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors"
              >
                <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-xl shadow-sm overflow-hidden">
                  {store.logo_url ? (
                    <img src={store.logo_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    CATEGORY_ICONS[store.category as keyof typeof CATEGORY_ICONS] || '📦'
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-900 text-sm">
                    {store.name}
                  </div>
                  <div className="text-xs text-gray-500 font-medium">
                    {new Date(store.created_at).toLocaleDateString("pt-BR")} às {new Date(store.created_at).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })} · Banca {store.booth_label}
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    store.status === "active"
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : store.status === "pending"
                        ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                        : "bg-red-100 text-red-700 border border-red-200"
                  }`}
                >
                  {store.status === "active"
                    ? "Ativa"
                    : store.status === "pending"
                      ? "Pendente"
                      : "Suspensa"}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
