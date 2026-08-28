import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  FileSearch,
  History as HistoryIcon,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/Logo'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/new-screening', label: 'New Screening', icon: FileSearch },
  { to: '/history', label: 'Screening History', icon: HistoryIcon },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
]

export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static z-40 h-full w-64 bg-white border-r border-gray-100 flex flex-col transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center gap-2 px-5 h-[72px] border-b border-gray-100">
          <Logo />
          <button className="ml-auto lg:hidden text-gray-400 hover:text-gray-700" onClick={() => setMobileOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Workspace</p>
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 shadow-[inset_2px_0_0_0_theme(colors.brand.600)]'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} className={isActive ? 'text-brand-600' : 'text-gray-400 group-hover:text-gray-600'} />
                  {label}
                </>
              )}
            </NavLink>
          ))}

          <div className="mt-4 rounded-xl bg-navy-gradient p-4 text-white overflow-hidden relative">
            <Sparkles size={16} className="text-brand-300 mb-2" />
            <p className="text-xs font-semibold leading-snug">AI-powered candidate matching</p>
            <p className="text-[11px] text-white/50 mt-1 leading-snug">Faster, evidence-based screening decisions.</p>
          </div>
        </nav>

        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
            <div className="h-9 w-9 rounded-full bg-brand-gradient text-white flex items-center justify-center font-semibold text-sm shrink-0">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-1 w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-gray-100 bg-white/80 backdrop-blur flex items-center px-4 lg:hidden sticky top-0 z-20">
          <button onClick={() => setMobileOpen(true)} className="text-gray-500">
            <Menu size={22} />
          </button>
          <span className="ml-3 font-bold text-gray-900">
            HireLens <span className="text-brand-500">AI</span>
          </span>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto animate-fadeIn">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
