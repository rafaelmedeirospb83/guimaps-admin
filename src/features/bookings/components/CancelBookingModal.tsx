import { useState, useEffect } from 'react'
import { X, AlertTriangle } from 'lucide-react'
import type { CancelBookingRequest } from '../../../types/adminBookingCancel'
import { Button } from '@shared/components/Button'

interface Props {
  bookingId: string
  isOpen: boolean
  onClose: () => void
  onSubmit: (payload: CancelBookingRequest) => Promise<void>
  isSubmitting?: boolean
}

const MAX_REASON_LENGTH = 500

export function CancelBookingModal({
  bookingId,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}: Props) {
  const [reason, setReason] = useState('')

  useEffect(() => {
    if (!isOpen) {
      setReason('')
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, isSubmitting, onClose])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload: CancelBookingRequest = {
      booking_id: bookingId,
      reason: reason.trim() || null,
    }

    await onSubmit(payload)
  }

  const remainingChars = MAX_REASON_LENGTH - reason.length

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-booking-title"
    >
      <div
        className="w-full max-w-md rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 id="cancel-booking-title" className="text-lg font-semibold">
              Cancelar Reserva
            </h2>
            <p className="text-xs text-gray-500 mt-1">ID: {bookingId}</p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-60"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800">
                  Esta ação não pode ser desfeita
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  A reserva será cancelada e o reembolso será processado automaticamente, se
                  aplicável.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="cancel-reason" className="block text-sm font-medium text-gray-700 mb-1">
              Motivo do cancelamento (opcional)
            </label>
            <textarea
              id="cancel-reason"
              value={reason}
              onChange={(e) => {
                if (e.target.value.length <= MAX_REASON_LENGTH) {
                  setReason(e.target.value)
                }
              }}
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60 disabled:cursor-not-allowed"
              placeholder="Descreva o motivo do cancelamento..."
              disabled={isSubmitting}
              aria-describedby="reason-char-count"
            />
            <div className="flex justify-between items-center mt-1">
              <span id="reason-char-count" className="text-xs text-gray-500">
                {remainingChars} caracteres restantes
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
              aria-label="Cancelar"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              aria-label="Confirmar cancelamento"
            >
              {isSubmitting ? 'Cancelando...' : 'Confirmar Cancelamento'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

