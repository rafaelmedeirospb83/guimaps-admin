import React, { useState } from 'react'
import { X } from 'lucide-react'
import type { CreatePayoutRequest, PaymentSplitDetail } from '../../../types/adminPayments'
import { formatMoneyFromCents } from '../lib/utils'

interface Props {
  split: PaymentSplitDetail
  isOpen: boolean
  onClose: () => void
  onSubmit: (payload: CreatePayoutRequest) => Promise<void>
}

export function CreatePayoutModal({ split, isOpen, onClose, onSubmit }: Props) {
  const [amountCents, setAmountCents] = useState<string>(
    split.partner_amount_cents.toString(),
  )
  const [destinationOverrideId, setDestinationOverrideId] = useState('')
  const [notes, setNotes] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const payload: CreatePayoutRequest = {
        amount_cents: amountCents ? parseInt(amountCents, 10) : null,
        destination_override_id: destinationOverrideId || null,
        notes: notes || null,
      }

      await onSubmit(payload)
      // Reset form
      setAmountCents(split.partner_amount_cents.toString())
      setDestinationOverrideId('')
      setNotes('')
      setShowAdvanced(false)
      onClose()
    } catch (error) {
      console.error('Error creating payout:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const defaultAmount = formatMoneyFromCents(split.partner_amount_cents)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold">Executar Payout</h2>
            <p className="text-xs text-gray-500 mt-1">Valor padrão: {defaultAmount}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100 transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor (centavos)
            </label>
            <input
              type="number"
              value={amountCents}
              onChange={(e) => setAmountCents(e.target.value)}
              placeholder={split.partner_amount_cents.toString()}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              min="0"
            />
            <p className="mt-1 text-xs text-gray-500">
              Deixe vazio para usar o valor padrão ({defaultAmount})
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observações (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Adicione observações sobre este payout..."
            />
          </div>

          {/* Advanced Options */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-primary hover:text-primary/80 font-medium"
            >
              {showAdvanced ? 'Ocultar' : 'Mostrar'} opções avançadas
            </button>

            {showAdvanced && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Destination Override ID (admin only)
                </label>
                <input
                  type="text"
                  value={destinationOverrideId}
                  onChange={(e) => setDestinationOverrideId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Deixe vazio para usar o padrão"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Apenas use em casos especiais de override de destinatário
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60"
            >
              {isSubmitting ? 'Processando...' : 'Executar Payout'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

