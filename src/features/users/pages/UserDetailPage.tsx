import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Phone, Mail, User, CreditCard, CheckCircle, XCircle } from 'lucide-react'
import { getUserById } from '../api'
import { Button } from '@shared/components/Button'

const BOOKINGS_PER_PAGE = 20

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-user-detail', id],
    queryFn: () => getUserById(id!, { bookings_limit: BOOKINGS_PER_PAGE, bookings_offset: 0 }),
    enabled: !!id,
  })

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5)
  }

  const getRoleLabel = (role: string) => {
    const roleMap: Record<string, string> = {
      tourist: 'Turista',
      guide: 'Guia',
      admin: 'Administrador',
    }
    return roleMap[role] || role
  }

  const getRoleBadgeColor = (role: string) => {
    if (role === 'admin') return 'bg-purple-100 text-purple-800'
    if (role === 'guide') return 'bg-blue-100 text-blue-800'
    return 'bg-gray-100 text-gray-800'
  }

  const getStatusBadgeColor = (isActive: boolean) => {
    return isActive
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800'
  }

  const getBookingStatusBadgeColor = (status: string) => {
    const statusLower = status.toLowerCase()
    if (statusLower === 'confirmed' || statusLower === 'completed') {
      return 'bg-green-100 text-green-800'
    }
    if (statusLower === 'cancelled') {
      return 'bg-red-100 text-red-800'
    }
    return 'bg-yellow-100 text-yellow-800'
  }

  const getPaymentStatusBadgeColor = (status: string | null) => {
    if (!status) return 'bg-gray-100 text-gray-800'
    const statusLower = status.toLowerCase()
    if (statusLower === 'paid') {
      return 'bg-green-100 text-green-800'
    }
    if (statusLower === 'refunded' || statusLower === 'cancelled') {
      return 'bg-red-100 text-red-800'
    }
    if (statusLower === 'failed') {
      return 'bg-red-100 text-red-800'
    }
    return 'bg-yellow-100 text-yellow-800'
  }

  const getCardBrandLabel = (brand: string | null) => {
    if (!brand) return 'Cartão'
    const brandMap: Record<string, string> = {
      visa: 'Visa',
      mastercard: 'Mastercard',
      elo: 'Elo',
      amex: 'American Express',
    }
    return brandMap[brand.toLowerCase()] || brand
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Carregando detalhes do usuário...</div>
      </div>
    )
  }

  if (!data || !data.user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Usuário não encontrado</h2>
          <p className="text-gray-600 mb-4">O usuário solicitado não existe ou foi removido.</p>
          <Button onClick={() => navigate('/dashboard/users')}>Voltar para Usuários</Button>
        </div>
      </div>
    )
  }

  const { user, bookings, cards } = data

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/dashboard/users')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Detalhes do Usuário</h1>
          <p className="text-gray-600 mt-1">ID: {user.id}</p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex px-4 py-2 text-sm font-semibold rounded-lg ${getRoleBadgeColor(
              user.role
            )}`}
          >
            {getRoleLabel(user.role)}
          </span>
          <span
            className={`inline-flex px-4 py-2 text-sm font-semibold rounded-lg ${getStatusBadgeColor(
              user.is_active
            )}`}
          >
            {user.is_active ? 'Ativo' : 'Inativo'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Informações Pessoais</h2>
            <div className="space-y-4">
              {user.name && (
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Nome</p>
                    <p className="text-base font-medium text-gray-900">{user.name}</p>
                  </div>
                </div>
              )}
              {user.email && (
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-base font-medium text-gray-900">{user.email}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Telefone</p>
                  <p className="text-base font-medium text-gray-900">{user.phone}</p>
                </div>
              </div>
              {user.cpf && (
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">CPF</p>
                    <p className="text-base font-medium text-gray-900">{user.cpf}</p>
                  </div>
                </div>
              )}
              {user.accepted_terms_at && (
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Termos aceitos em</p>
                    <p className="text-base font-medium text-gray-900">
                      {formatDateTime(user.accepted_terms_at)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Reservas ({bookings.total})
            </h2>
            {bookings.items.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhuma reserva encontrada
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Data
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Horário
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Valor
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Pagamento
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {bookings.items.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(booking.date)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {formatTime(booking.start_time)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatPrice(booking.total_price_cents)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBookingStatusBadgeColor(
                              booking.status
                            )}`}
                          >
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {booking.payment_status ? (
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusBadgeColor(
                                booking.payment_status
                              )}`}
                            >
                              {booking.payment_status}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                          <Button
                            variant="ghost"
                            onClick={() => navigate(`/dashboard/bookings/${booking.id}`)}
                          >
                            Ver
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Informações do Sistema</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Criado em</p>
                <p className="text-base font-medium text-gray-900">
                  {formatDateTime(user.created_at)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Atualizado em</p>
                <p className="text-base font-medium text-gray-900">
                  {formatDateTime(user.updated_at)}
                </p>
              </div>
              {user.pagarme_customer_id && (
                <div>
                  <p className="text-sm text-gray-500">Pagarme Customer ID</p>
                  <p className="text-sm font-medium text-gray-900 font-mono">
                    {user.pagarme_customer_id}
                  </p>
                </div>
              )}
              {user.pagarme_recipient_id && (
                <div>
                  <p className="text-sm text-gray-500">Pagarme Recipient ID</p>
                  <p className="text-sm font-medium text-gray-900 font-mono">
                    {user.pagarme_recipient_id}
                  </p>
                </div>
              )}
            </div>
          </div>

          {cards.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Cartões Cadastrados ({cards.length})
              </h2>
              <div className="space-y-3">
                {cards.map((card) => (
                  <div
                    key={card.id}
                    className="border border-gray-200 rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {getCardBrandLabel(card.brand)}
                        </span>
                        {card.last_four && (
                          <span className="text-sm text-gray-600">**** {card.last_four}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {card.is_default && (
                          <span className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded">
                            Padrão
                          </span>
                        )}
                        {card.is_active ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Cadastrado em {formatDateTime(card.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

