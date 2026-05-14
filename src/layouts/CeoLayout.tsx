import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, Store, Map, Users, LogOut, Menu, Crown } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../store/authStore'

export default function CeoLayout() {
  const { user, signOut } = useAuthStore()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isAuthPage = location.pathname.includes('/login')

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/ceo/login'
  }

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-palmas-bg">
        <Outlet />
      </div>
    )
  }

  const navItems = [
    { to: '/ceo/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/ceo/stores', icon: Store, label: 'Lojas' },
    { to: '/ceo/map', icon: Map, label: 'Mapa da Feira' },
    { to: '/ceo/accounts', icon: Users, label: 'Contas Admin' },
    { to: '/ceo/settings', icon: Crown, label: 'Configurações' },
  ]

  return (
    <div className="min-h-screen bg-palmas-bg flex">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 flex flex-col
        bg-gradient-to-b from-gray-200 to-gray-200 border-r border-gray-200
        transform transition-transform duration-300
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-palmas-blue to-palmas-dark rounded-md flex items-center justify-center shadow-lg shadow-md">
              <Crown size={18} className="text-white" />
            </div>
            <div>
              <div className="font-display text-lg font-bold text-palmas-text">FeiraTech</div>
              <div className="text-xs text-palmas-blue font-medium">CEO Panel</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-palmas-blue text-white shadow-md'
                    : 'text-gray-600 hover:text-palmas-text hover:bg-gray-100'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-gray-200">
          {user && (
            <div className="mb-3 px-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="badge bg-palmas-blue text-white">CEO</span>
              </div>
              <div className="text-sm font-medium text-gray-800 truncate">{user.full_name || user.email}</div>
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

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center justify-between px-4 h-14 border-b border-gray-200 bg-white">
          <button onClick={() => setMobileOpen(true)} className="text-gray-600 hover:text-palmas-text">
            <Menu size={22} />
          </button>
          <span className="font-display font-bold text-palmas-text">CEO Panel</span>
          <div className="w-8" />
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
