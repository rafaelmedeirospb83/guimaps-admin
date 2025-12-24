import React from 'react'
import type { PaymentProvidersConfigDTO, UpdatePaymentProvidersConfigDTO } from '../../../types/adminPayments'

interface Props {
  config: PaymentProvidersConfigDTO
  onChange: (updates: Partial<UpdatePaymentProvidersConfigDTO>) => void
}

export function CardFallbackCard({ config, onChange }: Props) {
  const isFallbackDisabled = !config.enabled_pagarme

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Fallback de Cartão</h2>
        <p className="text-sm text-gray-500 mt-1">
          Configure o comportamento de fallback quando AbacatePay falhar
        </p>
      </div>

      {/* Toggle Fallback */}
      <div className="mb-4">
        <label className="flex items-center justify-between cursor-pointer">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-700">
              Permitir fallback de cartão (AbacatePay → Pagarme)
            </span>
            <span className="text-xs text-gray-500 mt-0.5">
              Quando AbacatePay falhar para cartão, tenta automaticamente Pagarme
            </span>
          </div>
          <button
            type="button"
            onClick={() =>
              onChange({
                allow_card_fallback_to_pagarme: !config.allow_card_fallback_to_pagarme,
                card_fallback_provider_code:
                  !config.allow_card_fallback_to_pagarme ? 'PAGARME' : null,
              })
            }
            disabled={isFallbackDisabled}
            className={`
              relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
              transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
              ${config.allow_card_fallback_to_pagarme ? 'bg-primary' : 'bg-gray-200'}
              ${isFallbackDisabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <span
              className={`
                pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0
                transition duration-200 ease-in-out
                ${config.allow_card_fallback_to_pagarme ? 'translate-x-5' : 'translate-x-0'}
              `}
            />
          </button>
        </label>
      </div>

      {/* Fallback Provider (read-only quando ativo) */}
      {config.allow_card_fallback_to_pagarme && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Provider de Fallback
          </label>
          <input
            type="text"
            value="PAGARME"
            disabled
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
          />
        </div>
      )}

      {/* Hint quando fallback desabilitado por falta de Pagarme */}
      {isFallbackDisabled && (
        <div className="mt-4 rounded-lg bg-gray-50 border border-gray-200 p-3">
          <p className="text-sm text-gray-600">
            ℹ️ Para o fallback funcionar, Pagarme precisa estar habilitado.
          </p>
        </div>
      )}

      {/* Info quando provider primário é Pagarme */}
      {config.primary_provider === 'PAGARME' && config.allow_card_fallback_to_pagarme && (
        <div className="mt-4 rounded-lg bg-blue-50 border border-blue-200 p-3">
          <p className="text-sm text-blue-800">
            ℹ️ Fallback só é usado quando AbacatePay é o provider primário para cartão.
          </p>
        </div>
      )}
    </div>
  )
}

