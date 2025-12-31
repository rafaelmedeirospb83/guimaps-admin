import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Eye, Calendar, Filter, Users as UsersIcon, Search } from 'lucide-react'
import { listBookings } from '../api'
import { Button } from '@shared/components/Button'
import { Input } from '@shared/components/Input'

export function BookingsListPage() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [fromDateFilter, setFromDateFilter] = useState<string>('')
  const [partnerFilter, setPartnerFilter] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['bookings', statusFilter, fromDateFilter],
    queryFn: () =>
      listBookings({
        status: statusFilter || null,
        from: fromDateFilter || null,
      }),
  })

  const partners = useMemo(() => {
    if (!bookings) return []
    const partnerMap = new Map<string, { id: string; name: string }>()
    bookings.forEach((booking) => {
      if (booking.affiliate?.partner_id && booking.affiliate?.partner_name) {
        if (!partnerMap.has(booking.affiliate.partner_id)) {
          partnerMap.set(booking.affiliate.partner_id, {
            id: booking.affiliate.partner_id,
            name: booking.affiliate.partner_name,
          })
        }
      }
    })
    return Array.from(partnerMap.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [bookings])

  const filteredBookings = useMemo(() => {
    if (!bookings) return []
    let filtered = bookings

    if (partnerFilter) {
      filtered = filtered.filter(
        (booking) => booking.affiliate?.partner_id === partnerFilter
      )
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter((booking) => {
        const normalMatch =
          booking.tourist_name?.toLowerCase().includes(term) ||
          booking.tour_title?.toLowerCase().includes(term) ||
          booking.id.toLowerCase().includes(term) ||
          booking.guide_name?.toLowerCase().includes(term)

        const affiliateMatch =
          booking.affiliate?.partner_name?.toLowerCase().includes(term) ||
          booking.affiliate?.affiliate_code?.toLowerCase().includes(term)

        return normalMatch || affiliateMatch
      })
    }

    return filtered
  }, [bookings, partnerFilter, searchTerm])

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

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5)
  }

  const getStatusBadgeColor = (status: string) => {
    const statusLower = status.toLowerCase()
    if (statusLower.includes('confirm') || statusLower.includes('paid')) {
      return 'bg-green-100 text-green-800'
    }
    if (statusLower.includes('cancel') || statusLower.includes('refund')) {
      return 'bg-red-100 text-red-800'
    }
    if (statusLower.includes('pending') || statusLower.includes('waiting')) {
      return 'bg-yellow-100 text-yellow-800'
    }
    return 'bg-gray-100 text-gray-800'
  }

  const getPaymentStatusBadgeColor = (status: string | null) => {
    if (!status) return 'bg-gray-100 text-gray-800'
    const statusLower = status.toLowerCase()
    if (statusLower.includes('paid') || statusLower.includes('pago')) {
      return 'bg-green-100 text-green-800'
    }
    if (statusLower.includes('cancel') || statusLower.includes('refund')) {
      return 'bg-red-100 text-red-800'
    }
    if (statusLower.includes('pending') || statusLower.includes('pendente')) {
      return 'bg-yellow-100 text-yellow-800'
    }
    return 'bg-gray-100 text-gray-800'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Carregando reservas...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reservas</h1>
          <p className="text-gray-600 mt-1">Gerencie todas as reservas do sistema</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          <Filter className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="search"
                type="text"
                placeholder="Buscar por turista, tour, guia, código de afiliado ou parceiro..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">Todos os status</option>
                <option value="pending">Pendente</option>
                <option value="confirmed">Confirmado</option>
                <option value="cancelled">Cancelado</option>
                <option value="completed">Concluído</option>
              </select>
            </div>

            <div>
              <label htmlFor="partner" className="block text-sm font-medium text-gray-700 mb-2">
                Parceiro
              </label>
              <select
                id="partner"
                value={partnerFilter}
                onChange={(e) => setPartnerFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">Todos os parceiros</option>
                {partners.map((partner) => (
                  <option key={partner.id} value={partner.id}>
                    {partner.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="from_date" className="block text-sm font-medium text-gray-700 mb-2">
                A partir de
              </label>
              <Input
                id="from_date"
                type="date"
                value={fromDateFilter}
                onChange={(e) => setFromDateFilter(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {filteredBookings && filteredBookings.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma reserva encontrada</h3>
          <p className="text-gray-600">
            {bookings && bookings.length === 0
              ? 'Não há reservas cadastradas.'
              : 'Não há reservas que correspondam aos filtros selecionados.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data/Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tour
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cidade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Turista
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parceiro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pessoas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pagamento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings?.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(booking.date)}</div>
                      <div className="text-sm text-gray-500">{formatTime(booking.start_time)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{booking.tour_title}</div>
                      <div className="text-sm text-gray-500">{booking.duration_min} min</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{booking.city_name || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{booking.guide_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{booking.tourist_name || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {booking.affiliate ? (
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full w-fit">
                            <UsersIcon className="w-3 h-3" />
                            {booking.affiliate.partner_name}
                          </span>
                          {booking.affiliate.affiliate_code && (
                            <span className="text-xs text-gray-500">
                              Código: {booking.affiliate.affiliate_code}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{booking.people_count}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatPrice(booking.total_price_cents)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        variant="ghost"
                        onClick={() => navigate(`/dashboard/bookings/${booking.id}`)}
                      >
                        <Eye className="w-4 h-4" />
                        Ver
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

