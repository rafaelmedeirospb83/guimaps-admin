import React from 'react'
import type { PaymentProvidersConfigDTO, UpdatePaymentProvidersConfigDTO } from '../../../types/adminPayments'

interface Props {
  config: PaymentProvidersConfigDTO
  onChange: (updates: Partial<UpdatePaymentProvidersConfigDTO>) => void
}

export function PlatformFeeCard({ config, onChange }: Props) {
  const platformFeePercent = config.platform_fee_percent ?? 0

  const handlePercentChange = (value: string) => {
    const numValue = value === '' ? null : parseFloat(value)
    onChange({ platform_fee_percent: numValue })
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Taxa da Plataforma</h2>
        <p className="text-sm text-gray-500 mt-1">
          Configure o percentual de taxa cobrado pela plataforma nos splits de pagamento
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Percentual da Taxa (%)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={platformFeePercent}
              onChange={(e) => handlePercentChange(e.target.value)}
              placeholder="0.00"
              className="w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <span className="text-sm text-gray-600">%</span>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Este percentual será aplicado sobre o valor bruto para calcular a taxa da plataforma.
            Exemplo: 10% sobre R$ 100,00 = R$ 10,00 de taxa.
          </p>
        </div>

        {/* Preview do cálculo */}
        {platformFeePercent && platformFeePercent > 0 && (
          <div className="rounded-lg border border-primary-200 bg-primary-50 p-4">
            <p className="text-xs font-medium text-primary-700 mb-2">Exemplo de cálculo:</p>
            <div className="space-y-1 text-sm text-primary-900">
              <div className="flex justify-between">
                <span>Valor bruto:</span>
                <span className="font-mono">R$ 100,00</span>
              </div>
              <div className="flex justify-between">
                <span>Taxa da plataforma ({platformFeePercent}%):</span>
                <span className="font-mono font-semibold">
                  R$ {((100 * platformFeePercent) / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between border-t border-primary-200 pt-1 mt-1">
                <span>Valor para parceiro:</span>
                <span className="font-mono font-bold">
                  R$ {(100 - (100 * platformFeePercent) / 100).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {platformFeePercent === null || platformFeePercent === 0 ? (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
            <p className="text-sm text-yellow-800">
              ⚠️ Taxa configurada em 0%. A plataforma não receberá taxa dos splits.
            </p>
          </div>
        ) : platformFeePercent > 50 ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-800">
              ⚠️ Taxa muito alta (acima de 50%). Verifique se este valor está correto.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}

