import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Eye, Calendar, Filter } from 'lucide-react'
import { listBookings, type BookingListItemResponse } from '../api'
import { Button } from '@shared/components/Button'
import { Input } from '@shared/components/Input'

export function BookingsListPage() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [fromDateFilter, setFromDateFilter] = useState<string>('')

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['bookings', statusFilter, fromDateFilter],
    queryFn: () =>
      listBookings({
        status: statusFilter || null,
        from: fromDateFilter || null,
      }),
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {bookings && bookings.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma reserva encontrada</h3>
          <p className="text-gray-600">Não há reservas que correspondam aos filtros selecionados.</p>
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
                {bookings?.map((booking) => (
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

