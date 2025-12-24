import React, { useState } from 'react'
import { RefreshCw, Search, Eye } from 'lucide-react'
import type { PaymentWebhookEventDTO, PaymentProviderCode } from '../../../types/adminPayments'
import { WebhookPayloadModal } from './WebhookPayloadModal'

interface Props {
  webhooks: PaymentWebhookEventDTO[]
  isLoading?: boolean
  onRefresh: () => void
  onReprocess: (webhookEventId: string) => Promise<void>
}

export function FailedWebhooksTable({ webhooks, isLoading, onRefresh, onReprocess }: Props) {
  const [searchQuery, setSearchQuery] = useState('')
  const [providerFilter, setProviderFilter] = useState<PaymentProviderCode | 'ALL'>('ALL')
  const [selectedWebhook, setSelectedWebhook] = useState<PaymentWebhookEventDTO | null>(null)
  const [reprocessingIds, setReprocessingIds] = useState<Set<string>>(new Set())

  const filteredWebhooks = webhooks.filter((webhook) => {
    const matchesSearch =
      webhook.provider_event_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      webhook.provider_payment_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      false
    const matchesProvider = providerFilter === 'ALL' || webhook.provider === providerFilter
    return matchesSearch && matchesProvider
  })

  const handleReprocess = async (webhookEventId: string) => {
    setReprocessingIds((prev) => new Set(prev).add(webhookEventId))
    try {
      await onReprocess(webhookEventId)
    } finally {
      setReprocessingIds((prev) => {
        const next = new Set(prev)
        next.delete(webhookEventId)
        return next
      })
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const truncateText = (text: string | null | undefined, maxLength: number = 50) => {
    if (!text) return '-'
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
  }

  return (
    <>
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Webhooks com Falha</h2>
            <p className="text-sm text-gray-500 mt-1">
              Gerencie webhooks que falharam no processamento
            </p>
          </div>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>

        {/* Filtros */}
        <div className="mb-4 flex gap-3">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por event ID ou payment ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value as PaymentProviderCode | 'ALL')}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="ALL">Todos os providers</option>
            <option value="PAGARME">Pagarme</option>
            <option value="ABACATEPAY">AbacatePay</option>
          </select>
        </div>

        {/* Tabela */}
        {isLoading && webhooks.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-600">Carregando webhooks...</div>
          </div>
        ) : filteredWebhooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="text-4xl mb-2">🎉</div>
            <p className="text-gray-600 font-medium">
              {searchQuery || providerFilter !== 'ALL'
                ? 'Nenhum webhook encontrado com os filtros aplicados'
                : 'Nenhum webhook com falha'}
            </p>
          </div>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="py-2 pr-4">Data</th>
                  <th className="py-2 pr-4">Provider</th>
                  <th className="py-2 pr-4">Event Type</th>
                  <th className="py-2 pr-4">Provider Event ID</th>
                  <th className="py-2 pr-4">Provider Payment ID</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Erro</th>
                  <th className="py-2 pr-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredWebhooks.map((webhook) => {
                  const isReprocessing = reprocessingIds.has(webhook.id)
                  return (
                    <tr
                      key={webhook.id}
                      className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 pr-4 text-xs text-gray-700 whitespace-nowrap">
                        {formatDate(webhook.created_at)}
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            webhook.provider === 'PAGARME'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {webhook.provider}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-xs text-gray-700">
                        {webhook.event_type || '-'}
                      </td>
                      <td className="py-3 pr-4 text-xs text-gray-700 font-mono">
                        {truncateText(webhook.provider_event_id, 30)}
                      </td>
                      <td className="py-3 pr-4 text-xs text-gray-700 font-mono">
                        {truncateText(webhook.provider_payment_id, 30)}
                      </td>
                      <td className="py-3 pr-4">
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800">
                          {webhook.process_status}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-xs text-gray-700 max-w-xs">
                        <div className="truncate" title={webhook.error_message || undefined}>
                          {truncateText(webhook.error_message, 50)}
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedWebhook(webhook)}
                            className="text-primary hover:text-primary/80 text-xs font-medium flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            Ver payload
                          </button>
                          <button
                            onClick={() => handleReprocess(webhook.id)}
                            disabled={isReprocessing}
                            className="text-primary hover:text-primary/80 text-xs font-medium disabled:opacity-60"
                          >
                            {isReprocessing ? 'Reprocessando...' : 'Reprocessar'}
                          </button>
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

      <WebhookPayloadModal
        webhook={selectedWebhook}
        isOpen={!!selectedWebhook}
        onClose={() => setSelectedWebhook(null)}
      />
    </>
  )
}

