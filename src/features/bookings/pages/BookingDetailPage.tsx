import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Phone, Mail, Calendar, Clock, Users, MapPin, User, CreditCard, Building2, MessageCircle } from 'lucide-react'
import { getBookingById } from '../api'
import { Button } from '@shared/components/Button'
import { openWhatsApp } from '@shared/lib/whatsapp'

export function BookingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', id],
    queryFn: () => getBookingById(id!),
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

  const handleWhatsAppGuide = () => {
    if (booking?.guide.phone) {
      openWhatsApp(booking.guide.phone, `Olá ${booking.guide.name}! Gostaria de falar sobre a reserva ${booking.id}.`)
    }
  }

  const handleWhatsAppTourist = () => {
    if (booking?.tourist.phone) {
      openWhatsApp(booking.tourist.phone, `Olá! Gostaria de falar sobre minha reserva ${booking.id}.`)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Carregando detalhes da reserva...</div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Reserva não encontrada</h2>
          <p className="text-gray-600 mb-4">A reserva solicitada não existe ou foi removida.</p>
          <Button onClick={() => navigate('/dashboard/bookings')}>Voltar para Reservas</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/dashboard/bookings')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Detalhes da Reserva</h1>
          <p className="text-gray-600 mt-1">ID: {booking.id}</p>
        </div>
        <span
          className={`inline-flex px-4 py-2 text-sm font-semibold rounded-lg ${getStatusBadgeColor(
            booking.status
          )}`}
        >
          {booking.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Informações do Tour</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Tour</p>
                  <p className="text-base font-medium text-gray-900">{booking.tour_title}</p>
                  <p className="text-sm text-gray-600">Slug: {booking.tour_slug}</p>
                </div>
              </div>
              {booking.city_name && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Cidade</p>
                    <p className="text-base font-medium text-gray-900">{booking.city_name}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Data</p>
                  <p className="text-base font-medium text-gray-900">{formatDate(booking.date)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Horário de Início</p>
                  <p className="text-base font-medium text-gray-900">{formatTime(booking.start_time)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Duração</p>
                  <p className="text-base font-medium text-gray-900">{booking.duration_min} minutos</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Número de Pessoas</p>
                  <p className="text-base font-medium text-gray-900">{booking.people_count}</p>
                </div>
              </div>
              {booking.language && (
                <div className="flex items-start gap-3">
                  <MessageCircle className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Idioma</p>
                    <p className="text-base font-medium text-gray-900">{booking.language}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Guia</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Nome</p>
                  <p className="text-base font-medium text-gray-900">{booking.guide.name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Credencial</p>
                  <p className="text-base font-medium text-gray-900">{booking.guide.credential}</p>
                </div>
              </div>
              {booking.guide.email && (
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-base font-medium text-gray-900">{booking.guide.email}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Telefone</p>
                  <p className="text-base font-medium text-gray-900">{booking.guide.phone}</p>
                  <Button
                    variant="outline"
                    onClick={handleWhatsAppGuide}
                    className="mt-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Abrir WhatsApp
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Turista</h2>
            <div className="space-y-4">
              {booking.tourist.name && (
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Nome</p>
                    <p className="text-base font-medium text-gray-900">{booking.tourist.name}</p>
                  </div>
                </div>
              )}
              {booking.tourist.email && (
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-base font-medium text-gray-900">{booking.tourist.email}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Telefone</p>
                  <p className="text-base font-medium text-gray-900">{booking.tourist.phone}</p>
                  <Button
                    variant="outline"
                    onClick={handleWhatsAppTourist}
                    className="mt-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Abrir WhatsApp
                  </Button>
                </div>
              </div>
              {booking.tourist.cpf && (
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">CPF</p>
                    <p className="text-base font-medium text-gray-900">{booking.tourist.cpf}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Valores</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Por pessoa</span>
                <span className="text-base font-medium text-gray-900">
                  {formatPrice(booking.price_per_person_cents)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <span className="text-base font-semibold text-gray-900">Total</span>
                <span className="text-xl font-bold text-primary">
                  {formatPrice(booking.total_price_cents)}
                </span>
              </div>
            </div>
          </div>

          {booking.payment && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Pagamento</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Status</p>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${getStatusBadgeColor(
                        booking.payment.status
                      )}`}
                    >
                      {booking.payment.status}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Valor</span>
                  <span className="text-base font-medium text-gray-900">
                    {formatPrice(booking.payment.amount_cents)}
                  </span>
                </div>
                {booking.payment.order_id && (
                  <div>
                    <p className="text-sm text-gray-500">Order ID</p>
                    <p className="text-sm font-medium text-gray-900">{booking.payment.order_id}</p>
                  </div>
                )}
                {booking.payment.charge_id && (
                  <div>
                    <p className="text-sm text-gray-500">Charge ID</p>
                    <p className="text-sm font-medium text-gray-900">{booking.payment.charge_id}</p>
                  </div>
                )}
                {booking.payment.paid_at && (
                  <div>
                    <p className="text-sm text-gray-500">Pago em</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDateTime(booking.payment.paid_at)}
                    </p>
                  </div>
                )}
                {booking.payment.canceled_at && (
                  <div>
                    <p className="text-sm text-gray-500">Cancelado em</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDateTime(booking.payment.canceled_at)}
                    </p>
                  </div>
                )}
                {booking.payment.refunded_at && (
                  <div>
                    <p className="text-sm text-gray-500">Reembolsado em</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDateTime(booking.payment.refunded_at)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {booking.bank_account && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Conta Bancária</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Titular</p>
                    <p className="text-base font-medium text-gray-900">
                      {booking.bank_account.holder_name}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tipo</p>
                  <p className="text-sm font-medium text-gray-900">{booking.bank_account.holder_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Documento</p>
                  <p className="text-sm font-medium text-gray-900">
                    {booking.bank_account.holder_document}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Banco</p>
                  <p className="text-sm font-medium text-gray-900">{booking.bank_account.bank}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Agência</p>
                  <p className="text-sm font-medium text-gray-900">
                    {booking.bank_account.branch_number}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Conta</p>
                  <p className="text-sm font-medium text-gray-900">
                    {booking.bank_account.account_number}-{booking.bank_account.account_check_digit}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tipo de Conta</p>
                  <p className="text-sm font-medium text-gray-900">{booking.bank_account.account_type}</p>
                </div>
                <div className="flex items-center gap-4 pt-2 border-t border-gray-200">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      booking.bank_account.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {booking.bank_account.is_active ? 'Ativa' : 'Inativa'}
                  </span>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      booking.bank_account.is_verified
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {booking.bank_account.is_verified ? 'Verificada' : 'Não verificada'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

