import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { ShoppingBag, LayoutDashboard, Store, Clock, LogOut, Menu, Zap, Plus } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useStoreStore } from '../store/storeStore'

export default function AdminLayout() {
  const { user, signOut } = useAuthStore()
  const { myStores, activeStoreId, setActiveStoreId, resetActiveStoreId } = useStoreStore()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isAuthPage = location.pathname.includes('/login') || location.pathname.includes('/register')

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/'
  }

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-palmas-bg">
        <Outlet />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-palmas-bg flex">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col
        transform transition-transform duration-300
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:z-auto overflow-y-auto
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-palmas-blue rounded-md flex items-center justify-center shadow-lg shadow-md">
              <ShoppingBag size={18} className="text-white" />
            </div>
            <div>
              <div className="font-display text-lg font-bold text-palmas-text">FeiraTech</div>
              <div className="text-xs text-gray-600">Painel do Lojista</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all ${isActive
                ? 'bg-palmas-blue text-white shadow-md'
                : 'text-gray-600 hover:text-palmas-text hover:bg-gray-100'
              }`
            }
          >
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>
          <NavLink
            to="/store"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all ${isActive
                ? 'bg-palmas-blue text-white shadow-md'
                : 'text-gray-600 hover:text-palmas-text hover:bg-gray-100'
              }`
            }
          >
            <Store size={18} />
            Minha Loja
          </NavLink>
          <NavLink
            to="/hours"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all ${isActive
                ? 'bg-palmas-blue text-white shadow-md'
                : 'text-gray-600 hover:text-palmas-text hover:bg-gray-100'
              }`
            }
          >
            <Clock size={18} />
            Horário
          </NavLink>
          <NavLink
            to="/plans"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all ${isActive
                ? 'bg-palmas-blue text-white shadow-md'
                : 'text-gray-600 hover:text-palmas-text hover:bg-gray-100'
              }`
            }
          >
            <Zap size={18} />
            Planos
          </NavLink>
        </nav>

        {/* Store Switcher */}
        {myStores.length > 1 && (
          <div className="px-4 py-4 border-t border-gray-200">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 px-2">Trocar Loja</p>
            <div className="space-y-1">
              {myStores.map(s => (
                <button
                  key={s.id}
                  onClick={() => setActiveStoreId(s.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-xs font-bold transition-all ${
                    activeStoreId === s.id
                      ? 'bg-palmas-blue/10 text-palmas-blue'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${activeStoreId === s.id ? 'bg-palmas-blue animate-pulse' : 'bg-gray-300'}`} />
                  <span className="truncate">{s.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {myStores.length === 1 && (
          <div className="px-4 py-4 border-t border-gray-200">
            <NavLink
              to="/store"
              onClick={() => resetActiveStoreId()}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-md text-xs font-bold text-gray-400 hover:text-palmas-blue hover:bg-gray-50 transition-all border border-dashed border-gray-200"
            >
              <Plus size={14} />
              <span>Adicionar Loja</span>
            </NavLink>
          </div>
        )}

        {/* User */}
        <div className="p-4 border-t border-gray-200">
          {user && (
            <div className="mb-3 px-2">
              <div className="text-sm font-medium text-gray-800 truncate">{user.full_name || user.email}</div>
              <div className="text-xs text-gray-500 truncate">{user.email}</div>
            </div>
          )}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-md text-sm text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-all"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between px-4 h-14 border-b border-gray-200 bg-white">
          <button onClick={() => setMobileOpen(true)} className="text-gray-600 hover:text-palmas-text">
            <Menu size={22} />
          </button>
          <span className="font-display font-bold text-palmas-text">FeiraTech Admin</span>
          <div className="w-8" />
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
