import { useState } from 'react'
import { X, CheckCircle, ArrowRightCircle, RefreshCw, Eye } from 'lucide-react'
import type { PaymentSplitDetail } from '../../../types/adminPayments'
import { formatMoneyFromCents, formatDateTime } from '../lib/utils'
import { PaymentSplitStatusBadge } from './PaymentSplitStatusBadge'
import { ProviderBadge } from './ProviderBadge'
import { PayoutStatusBadge } from './PayoutStatusBadge'
import { CreatePayoutModal } from './CreatePayoutModal'
import { PayoutDetailModal } from './PayoutDetailModal'
import { useQuery } from '@tanstack/react-query'
import { getPayoutDetail } from '../api/paymentSplitsApi'

interface Props {
  split: PaymentSplitDetail | null
  isOpen: boolean
  onClose: () => void
  onMarkReady: () => Promise<void>
  onCreatePayout: (payload: import('../../../types/adminPayments').CreatePayoutRequest) => Promise<void>
  onRetryPayout: (payoutId: string) => Promise<void>
  isLoading?: boolean
  isMarkingReady?: boolean
  isCreatingPayout?: boolean
  isRetryingPayout?: boolean
  lastPayoutError?: string | null
}

export function SplitDetailDrawer({
  split,
  isOpen,
  onClose,
  onMarkReady,
  onCreatePayout,
  onRetryPayout,
  isLoading,
  isMarkingReady: isMarkingReadyProp = false,
  isCreatingPayout: isCreatingPayoutProp = false,
  isRetryingPayout: isRetryingPayoutProp = false,
  lastPayoutError,
}: Props) {
  const [showPayoutModal, setShowPayoutModal] = useState(false)
  const [localMarkingReady, setLocalMarkingReady] = useState(false)
  const [retryingPayoutId, setRetryingPayoutId] = useState<string | null>(null)
  const [viewingPayoutId, setViewingPayoutId] = useState<string | null>(null)
  
  const isMarkingReady = isMarkingReadyProp || localMarkingReady

  const { data: viewingPayout, isLoading: isLoadingPayoutDetail } = useQuery({
    queryKey: ['payout-detail', viewingPayoutId],
    queryFn: () => getPayoutDetail(viewingPayoutId!),
    enabled: !!viewingPayoutId,
  })

  if (!isOpen || !split) return null

  const canMarkReady = split.status === 'PENDING_EVENT'
  const canCreatePayout = split.status === 'READY_TO_PAY'

  const handleMarkReady = async () => {
    setLocalMarkingReady(true)
    try {
      await onMarkReady()
    } catch (error) {
      console.error('Error in handleMarkReady:', error)
    } finally {
      setLocalMarkingReady(false)
    }
  }

  const handleRetryPayout = async (payoutId: string) => {
    setRetryingPayoutId(payoutId)
    try {
      await onRetryPayout(payoutId)
      setRetryingPayoutId(null)
    } catch (error) {
      setRetryingPayoutId(null)
      throw error
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-40 flex justify-end bg-black/20" onClick={onClose}>
        <div
          className="h-full w-full max-w-3xl bg-white shadow-xl flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold">Detalhes do Split</h2>
              <p className="text-xs text-gray-500 mt-1">ID: {split.id}</p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1 text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto px-6 py-4 space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-600">Carregando detalhes...</div>
              </div>
            ) : (
              <>
                {/* Resumo */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                    <p className="text-xs text-gray-500 mb-1">Booking</p>
                    <p className="text-sm font-medium text-gray-900">
                      {split.booking_title || split.booking_id}
                    </p>
                    <p className="text-xs text-gray-500 font-mono mt-1">{split.booking_id}</p>
                  </div>

                  <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                    <p className="text-xs text-gray-500 mb-1">Provider</p>
                    <div className="mt-1">
                      <ProviderBadge provider={split.provider_code} />
                    </div>
                  </div>

                  <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                    <p className="text-xs text-gray-500 mb-1">Valor Bruto</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatMoneyFromCents(split.gross_amount_cents)}
                    </p>
                  </div>

                  <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                    <p className="text-xs text-gray-500 mb-1">Taxa da Plataforma</p>
                    <p className="text-lg font-semibold text-gray-700">
                      {formatMoneyFromCents(split.platform_fee_cents)}
                    </p>
                  </div>

                  <div className="rounded-lg border border-gray-100 bg-primary-50 p-4">
                    <p className="text-xs text-primary-700 mb-1">Valor do Recipient</p>
                    <p className="text-xl font-bold text-primary">
                      {formatMoneyFromCents(split.recipient_amount_cents)}
                    </p>
                  </div>

                  <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                    <p className="text-xs text-gray-500 mb-1">Status</p>
                    <div className="mt-1">
                      <PaymentSplitStatusBadge status={split.status} />
                    </div>
                  </div>
                </div>

                {/* Recipient Info */}
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Recipient</p>
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="text-gray-500">Nome: </span>
                      <span className="text-gray-900">{split.partner_name || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Tipo: </span>
                      <span className="text-gray-900">{split.recipient_type}</span>
                    </div>
                    {split.guide_user_id && (
                      <div>
                        <span className="text-gray-500">Guide User ID: </span>
                        <span className="text-gray-900 font-mono text-xs">{split.guide_user_id}</span>
                      </div>
                    )}
                    {split.partner_id && (
                      <div>
                        <span className="text-gray-500">Partner ID: </span>
                        <span className="text-gray-900 font-mono text-xs">{split.partner_id}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Info */}
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Status Adicionais</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Booking: </span>
                      <span className="text-gray-900">{split.booking_status || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Payment: </span>
                      <span className="text-gray-900">{split.payment_status || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Criado em: </span>
                      <span className="text-gray-900">{formatDateTime(split.created_at)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Atualizado em: </span>
                      <span className="text-gray-900">{formatDateTime(split.updated_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Banner de Erro (quando payout falhar) */}
                {lastPayoutError && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-amber-800">Aviso sobre o último payout</p>
                        <p className="text-sm text-amber-700 mt-1">{lastPayoutError}</p>
                        {lastPayoutError.toLowerCase().includes('not implemented') || 
                         lastPayoutError.toLowerCase().includes('não implementado') || 
                         lastPayoutError.toLowerCase().includes('não suportado') ? (
                          <p className="text-xs text-amber-600 mt-2">
                            Este provider pode ainda não suportar transferências automáticas. Verifique o status do payout no histórico abaixo.
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )}

                {/* Ações */}
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">Ações</p>
                  <div className="flex gap-2">
                    {canMarkReady && (
                      <button
                        onClick={handleMarkReady}
                        disabled={isMarkingReady}
                        className="flex items-center gap-2 rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-2 text-sm font-medium text-yellow-700 hover:bg-yellow-100 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {isMarkingReady ? 'Marcando...' : 'Marcar como READY_TO_PAY'}
                      </button>
                    )}

                    {canCreatePayout && (
                      <button
                        onClick={() => setShowPayoutModal(true)}
                        disabled={isCreatingPayoutProp}
                        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <ArrowRightCircle className="w-4 h-4" />
                        {isCreatingPayoutProp ? 'Processando...' : 'Executar Payout'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Histórico de Payouts */}
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Histórico de Payouts ({split.payout_history.length})
                  </p>

                  {split.payout_history.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Nenhum payout realizado ainda
                    </p>
                  ) : (
                    <div className="overflow-auto">
                      <table className="min-w-full text-sm">
                        <thead className="border-b text-xs uppercase tracking-wide text-gray-500">
                          <tr>
                            <th className="py-2 pr-4 text-left">Data</th>
                            <th className="py-2 pr-4 text-left">Valor</th>
                            <th className="py-2 pr-4 text-left">Status</th>
                            <th className="py-2 pr-4 text-left">Provider Payout ID</th>
                            <th className="py-2 pr-4 text-left">Erro</th>
                            <th className="py-2 pr-4 text-right">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {split.payout_history
                            .sort((a, b) => {
                              return new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime()
                            })
                            .map((payout) => {
                            const isFailed = payout.status === 'FAILED' || !!payout.error_message
                            const isRetrying = retryingPayoutId === payout.id || (isRetryingPayoutProp && retryingPayoutId === payout.id)

                            return (
                              <tr
                                key={payout.id}
                                className="border-b last:border-0 hover:bg-gray-50"
                              >
                                <td className="py-2 pr-4 text-xs text-gray-700">
                                  {formatDateTime(payout.requested_at)}
                                </td>
                                <td className="py-2 pr-4 text-xs font-medium text-gray-900">
                                  {formatMoneyFromCents(payout.amount_cents)} {payout.currency}
                                </td>
                                <td className="py-2 pr-4">
                                  <PayoutStatusBadge status={payout.status} />
                                </td>
                                <td className="py-2 pr-4 text-xs text-gray-700 font-mono">
                                  {payout.provider_payout_id || '-'}
                                </td>
                                <td className="py-2 pr-4 text-xs text-red-700 max-w-xs">
                                  <div className="truncate" title={payout.error_message || undefined}>
                                    {payout.error_message || '-'}
                                  </div>
                                </td>
                                <td className="py-2 pr-4 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => setViewingPayoutId(payout.id)}
                                      className="flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900"
                                      title="Ver detalhes"
                                    >
                                      <Eye className="w-3 h-3" />
                                      Ver
                                    </button>
                                    {isFailed && (
                                      <button
                                        onClick={() => handleRetryPayout(payout.id)}
                                        disabled={isRetrying}
                                        className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 disabled:opacity-60 disabled:cursor-not-allowed"
                                      >
                                        <RefreshCw className={`w-3 h-3 ${isRetrying ? 'animate-spin' : ''}`} />
                                        {isRetrying ? 'Reprocessando...' : 'Reprocessar'}
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showPayoutModal && split && (
        <CreatePayoutModal
          split={split}
          isOpen={showPayoutModal}
          onClose={() => setShowPayoutModal(false)}
          onSubmit={onCreatePayout}
        />
      )}

      <PayoutDetailModal
        payout={viewingPayout || null}
        isOpen={!!viewingPayoutId}
        onClose={() => setViewingPayoutId(null)}
        isLoading={isLoadingPayoutDetail}
      />
    </>
  )
}

