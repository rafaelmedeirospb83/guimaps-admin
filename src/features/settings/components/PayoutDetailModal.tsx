import { X } from 'lucide-react'
import type { PayoutListItem } from '../../../types/adminPayments'
import { formatMoneyFromCents, formatDateTime } from '../lib/utils'
import { PayoutStatusBadge } from './PayoutStatusBadge'
import { ProviderBadge } from './ProviderBadge'

interface Props {
  payout: PayoutListItem | null
  isOpen: boolean
  onClose: () => void
  isLoading?: boolean
}

/**
 * Modal para exibir detalhes completos de um payout
 */
export function PayoutDetailModal({ payout, isOpen, onClose, isLoading }: Props) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-2xl rounded-xl bg-white shadow-xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold">Detalhes do Payout</h2>
            {payout && (
              <p className="text-xs text-gray-500 mt-1">ID: {payout.id}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto px-6 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-600">Carregando detalhes...</div>
            </div>
          ) : payout ? (
            <div className="space-y-4">
              {/* Resumo */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs text-gray-500 mb-1">Valor</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatMoneyFromCents(payout.amount_cents)} {payout.currency}
                  </p>
                </div>

                <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <div className="mt-1">
                    <PayoutStatusBadge status={payout.status} />
                  </div>
                </div>

                <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs text-gray-500 mb-1">Provider</p>
                  <div className="mt-1">
                    <ProviderBadge provider={payout.provider_code} />
                  </div>
                </div>

                <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs text-gray-500 mb-1">Provider Payout ID</p>
                  <p className="text-sm font-mono text-gray-900 break-all">
                    {payout.provider_payout_id || '-'}
                  </p>
                </div>
              </div>

              {/* Detalhes */}
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Informações do Payout</p>
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-500">Payment Split ID: </span>
                      <span className="text-gray-900 font-mono text-xs">{payout.payment_split_id}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Payment ID: </span>
                      <span className="text-gray-900 font-mono text-xs">{payout.payment_id}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Booking ID: </span>
                      <span className="text-gray-900 font-mono text-xs">{payout.booking_id}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Destination Type: </span>
                      <span className="text-gray-900">{payout.destination_type}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Destination ID: </span>
                      <span className="text-gray-900 font-mono text-xs">{payout.destination_id}</span>
                    </div>
                    {payout.requested_by_admin_id && (
                      <div>
                        <span className="text-gray-500">Requested By Admin: </span>
                        <span className="text-gray-900 font-mono text-xs">{payout.requested_by_admin_id}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Datas */}
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Datas</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Solicitado em: </span>
                    <span className="text-gray-900">{formatDateTime(payout.requested_at)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Processado em: </span>
                    <span className="text-gray-900">{formatDateTime(payout.processed_at)}</span>
                  </div>
                </div>
              </div>

              {/* Erro (se houver) */}
              {payout.error_message && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="text-sm font-medium text-red-800 mb-1">Mensagem de Erro</p>
                  <p className="text-sm text-red-700 whitespace-pre-wrap">{payout.error_message}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-600">Nenhum dado disponível</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

