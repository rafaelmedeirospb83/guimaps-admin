import { Users, MapPin, Calendar, TrendingUp } from 'lucide-react'

export function DashboardPage() {
  const stats = [
    {
      label: 'Total de Usuários',
      value: '1,234',
      change: '+12%',
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      label: 'Guias Ativos',
      value: '89',
      change: '+5%',
      icon: MapPin,
      color: 'bg-green-500',
    },
    {
      label: 'Reservas Hoje',
      value: '24',
      change: '+8%',
      icon: Calendar,
      color: 'bg-primary',
    },
    {
      label: 'Receita Mensal',
      value: 'R$ 45.2k',
      change: '+15%',
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Visão geral do sistema</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-green-600">{stat.change}</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Atividades Recentes</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    Novo usuário cadastrado
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Há {i} minutos</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Reservas Pendentes</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">Reserva #{1000 + i}</p>
                  <p className="text-xs text-gray-500 mt-1">Aguardando aprovação</p>
                </div>
                <button className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors">
                  Ver detalhes
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

