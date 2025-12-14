import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@shared/contexts/AuthContext'
import { 
  LayoutDashboard, 
  Users, 
  MapPin, 
  Calendar, 
  Settings, 
  LogOut,
  Menu,
  X,
  Route,
  Building2
} from 'lucide-react'
import { useState } from 'react'
import { showToast } from '@shared/components/Toast'

export function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    showToast('Logout realizado com sucesso', 'success')
    navigate('/login', { replace: true })
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Route, label: 'Tours', path: '/dashboard/tours' },
    { icon: Users, label: 'Usuários', path: '/dashboard/users' },
    { icon: MapPin, label: 'Guias', path: '/dashboard/guides' },
    { icon: Calendar, label: 'Reservas', path: '/dashboard/bookings' },
    { icon: Building2, label: 'Parceiros', path: '/dashboard/partners' },
    { icon: Settings, label: 'Configurações', path: '/dashboard/settings' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen overflow-hidden">
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:static lg:translate-x-0`}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg font-bold">GM</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">GuiMaps</h1>
                  <p className="text-xs text-gray-500">Admin</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path || 
                  (item.path !== '/dashboard' && location.pathname.startsWith(item.path + '/'))
                return (
                  <a
                    key={item.path}
                    href={item.path}
                    onClick={(e) => {
                      e.preventDefault()
                      navigate(item.path)
                      setSidebarOpen(false)
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary font-semibold'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </a>
                )
              })}
            </nav>

            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center gap-3 px-4 py-3 mb-2">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary font-semibold text-sm">
                    {user?.name?.charAt(0).toUpperCase() || 'A'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
          <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex-1" />
          </header>

          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

