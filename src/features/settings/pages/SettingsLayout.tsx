import { Outlet, useNavigate, useLocation } from 'react-router-dom'

const tabs = [
  { id: 'payments', label: 'Pagamentos', path: '/dashboard/settings/payments' },
  { id: 'splits', label: 'Splits & Payouts', path: '/dashboard/settings/payments/splits' },
  { id: 'webhooks', label: 'Webhooks', path: '/dashboard/settings/payments/webhooks' },
]

export function SettingsLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600 mt-1">Gerencie as configurações do sistema</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = location.pathname.startsWith(tab.path)
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    isActive
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Content */}
      <Outlet />
    </div>
  )
}

