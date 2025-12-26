import { Eye } from 'lucide-react'
import type { PaymentSplitListItem } from '../../../types/adminPayments'
import { formatMoneyFromCents, formatDateTime } from '../lib/utils'
import { PaymentSplitStatusBadge } from './PaymentSplitStatusBadge'
import { ProviderBadge } from './ProviderBadge'

interface Props {
  splits: PaymentSplitListItem[]
  isLoading?: boolean
  onViewSplit: (splitId: string) => void
  onMarkReady?: (splitId: string) => void
  onPayNow?: (splitId: string) => void
}

export function SplitsTable({
  splits,
  isLoading,
  onViewSplit,
  onMarkReady,
  onPayNow,
}: Props) {
  if (isLoading && splits.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Carregando splits...</div>
      </div>
    )
  }

  if (splits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="text-4xl mb-2">📊</div>
        <p className="text-gray-600 font-medium">Nenhum split encontrado</p>
      </div>
    )
  }

  return (
    <div className="overflow-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b text-xs uppercase tracking-wide text-gray-500">
          <tr>
            <th className="py-2 pr-4">Booking</th>
            <th className="py-2 pr-4">Provider</th>
            <th className="py-2 pr-4">Bruto</th>
            <th className="py-2 pr-4">Taxa</th>
            <th className="py-2 pr-4">Recipient</th>
            <th className="py-2 pr-4">Tipo</th>
            <th className="py-2 pr-4">Status</th>
            <th className="py-2 pr-4">Atualizado</th>
            <th className="py-2 pr-4 text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {splits.map((split) => {
            const canMarkReady = split.status === 'PENDING_EVENT' && onMarkReady
            const canPayNow = split.status === 'READY_TO_PAY' && onPayNow

            return (
              <tr
                key={split.id}
                className="border-b last:border-0 hover:bg-gray-50 transition-colors"
              >
                <td className="py-3 pr-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-mono text-gray-600">{split.booking_id}</span>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <ProviderBadge provider={split.provider_code} />
                </td>
                <td className="py-3 pr-4 text-xs text-gray-700">
                  {formatMoneyFromCents(split.gross_amount_cents)}
                </td>
                <td className="py-3 pr-4 text-xs text-gray-700">
                  {formatMoneyFromCents(split.platform_fee_cents)}
                </td>
                <td className="py-3 pr-4 text-xs font-medium text-gray-900">
                  {formatMoneyFromCents(split.recipient_amount_cents)}
                </td>
                <td className="py-3 pr-4">
                  <div className="flex flex-col text-xs">
                    {split.guide_user_id && (
                      <span className="text-gray-700 font-mono">{split.guide_user_id.substring(0, 8)}...</span>
                    )}
                    {split.partner_id && (
                      <span className="text-gray-700 font-mono">{split.partner_id.substring(0, 8)}...</span>
                    )}
                    {!split.guide_user_id && !split.partner_id && (
                      <span className="text-gray-400">-</span>
                    )}
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <span className="text-xs text-gray-700">
                    {split.recipient_type === 'GUIDE_USER' ? 'Guia' : 
                     split.recipient_type === 'PARTNER' ? 'Parceiro' : 
                     split.recipient_type === 'PLATFORM' ? 'Plataforma' : 
                     split.recipient_type}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <PaymentSplitStatusBadge status={split.status} />
                </td>
                <td className="py-3 pr-4 text-xs text-gray-700 whitespace-nowrap">
                  {formatDateTime(split.updated_at)}
                </td>
                <td className="py-3 pr-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onViewSplit(split.id)}
                      className="text-primary hover:text-primary/80 text-xs font-medium flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      Ver
                    </button>
                    {canMarkReady && (
                      <button
                        onClick={() => onMarkReady(split.id)}
                        className="text-yellow-600 hover:text-yellow-800 text-xs font-medium"
                      >
                        Marcar READY
                      </button>
                    )}
                    {canPayNow && (
                      <button
                        onClick={() => onPayNow(split.id)}
                        className="text-green-600 hover:text-green-800 text-xs font-medium"
                      >
                        Pagar agora
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
  )
}

