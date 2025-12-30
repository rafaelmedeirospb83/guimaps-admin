import { useState, useEffect } from 'react'
import { X, AlertTriangle } from 'lucide-react'
import type { CreatePayoutRequest, PaymentSplitDetail } from '../../../types/adminPayments'
import { formatMoneyFromCents } from '../lib/utils'

interface Props {
  split: PaymentSplitDetail
  isOpen: boolean
  onClose: () => void
  onSubmit: (payload: CreatePayoutRequest) => Promise<void>
}

type ModalStep = 'form' | 'confirm'

export function CreatePayoutModal({ split, isOpen, onClose, onSubmit }: Props) {
  const [step, setStep] = useState<ModalStep>('form')
  const [amountCents, setAmountCents] = useState<string>(
    split.recipient_amount_cents.toString(),
  )
  const [destinationOverrideId, setDestinationOverrideId] = useState('')
  const [notes, setNotes] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setStep('form')
      setAmountCents(split.recipient_amount_cents.toString())
      setDestinationOverrideId('')
      setNotes('')
      setShowAdvanced(false)
    }
  }, [isOpen, split.recipient_amount_cents])

  if (!isOpen) return null

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (split.status !== 'READY_TO_PAY') {
      alert('Apenas splits com status READY_TO_PAY podem receber payout.')
      return
    }
    
    setStep('confirm')
  }

  const handleConfirm = async () => {
    if (split.status !== 'READY_TO_PAY') {
      alert('Apenas splits com status READY_TO_PAY podem receber payout.')
      setStep('form')
      return
    }
    
    setIsSubmitting(true)

    try {
      const payload: CreatePayoutRequest = {
        amount_cents: amountCents ? parseInt(amountCents, 10) : null,
        destination_override_id: destinationOverrideId || null,
        notes: notes || null,
      }

      await onSubmit(payload)
      onClose()
    } catch (error) {
      console.error('Error creating payout:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    setStep('form')
  }

  const defaultAmount = formatMoneyFromCents(split.recipient_amount_cents)
  const finalAmountCents = amountCents ? parseInt(amountCents, 10) : split.recipient_amount_cents
  const finalAmount = formatMoneyFromCents(finalAmountCents)

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

        {/* Content */}
        <div className="p-6">
          {step === 'form' ? (
            <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor (centavos)
            </label>
            <input
              type="number"
              value={amountCents}
              onChange={(e) => setAmountCents(e.target.value)}
              placeholder={split.recipient_amount_cents.toString()}
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
                  Continuar
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {/* Confirmação */}
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-800 mb-2">Confirme os detalhes do payout</p>
                    <div className="space-y-2 text-sm text-amber-700">
                      <div>
                        <span className="font-medium">Valor:</span> {finalAmount}
                      </div>
                      {destinationOverrideId && (
                        <div>
                          <span className="font-medium">Destination Override:</span> {destinationOverrideId}
                        </div>
                      )}
                      {notes && (
                        <div>
                          <span className="font-medium">Observações:</span> {notes}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Recipient:</span> {split.partner_name || split.recipient_type}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={isSubmitting}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Processando...' : 'Confirmar e Executar Payout'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


