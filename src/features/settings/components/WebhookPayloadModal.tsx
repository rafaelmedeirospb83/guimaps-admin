import React from 'react'
import { X } from 'lucide-react'
import type { PaymentWebhookEventDTO } from '../../../types/adminPayments'

interface Props {
  webhook: PaymentWebhookEventDTO | null
  isOpen: boolean
  onClose: () => void
}

export function WebhookPayloadModal({ webhook, isOpen, onClose }: Props) {
  if (!isOpen || !webhook) return null

  const formattedPayload = webhook.payload_json
    ? JSON.stringify(webhook.payload_json, null, 2)
    : '{}'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-3xl max-h-[90vh] rounded-xl bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold">Payload do Webhook</h2>
            <p className="text-xs text-gray-500 mt-1">ID: {webhook.id}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="mb-4 space-y-2 text-sm">
            <div>
              <span className="font-medium text-gray-700">Provider:</span>{' '}
              <span className="text-gray-900">{webhook.provider}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Event Type:</span>{' '}
              <span className="text-gray-900">{webhook.event_type || '-'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Provider Event ID:</span>{' '}
              <span className="text-gray-900 font-mono text-xs">{webhook.provider_event_id}</span>
            </div>
            {webhook.provider_payment_id && (
              <div>
                <span className="font-medium text-gray-700">Provider Payment ID:</span>{' '}
                <span className="text-gray-900 font-mono text-xs">{webhook.provider_payment_id}</span>
              </div>
            )}
            {webhook.error_message && (
              <div>
                <span className="font-medium text-red-700">Error:</span>{' '}
                <span className="text-red-900">{webhook.error_message}</span>
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Payload JSON:</label>
            <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs overflow-auto max-h-96">
              <code>{formattedPayload}</code>
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}

