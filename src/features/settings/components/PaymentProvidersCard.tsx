import type { PaymentProvidersConfigDTO, UpdatePaymentProvidersConfigDTO } from '../../../types/adminPayments'

interface Props {
  config: PaymentProvidersConfigDTO
  onChange: (updates: Partial<UpdatePaymentProvidersConfigDTO>) => void
  errors?: string[]
}

export function PaymentProvidersCard({ config, onChange, errors }: Props) {
  const hasError =
    (config.primary_provider === 'PAGARME' && !config.enabled_pagarme) ||
    (config.primary_provider === 'ABACATEPAY' && !config.enabled_abacatepay)

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Provedores de Pagamento</h2>
        <p className="text-sm text-gray-500 mt-1">
          Configure quais provedores estão habilitados e qual é o primário
        </p>
      </div>

      {errors && errors.length > 0 && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3">
          {errors.map((error, idx) => (
            <p key={idx} className="text-sm text-red-700">
              {error}
            </p>
          ))}
        </div>
      )}

      {/* Provider Primário */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Provider Primário
        </label>
        <select
          value={config.primary_provider}
          onChange={(e) =>
            onChange({ primary_provider: e.target.value as 'PAGARME' | 'ABACATEPAY' })
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="PAGARME">Pagarme</option>
          <option value="ABACATEPAY">AbacatePay</option>
        </select>
      </div>

      {/* Toggle Pagarme */}
      <div className="mb-4">
        <label className="flex items-center justify-between cursor-pointer">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-700">Habilitar Pagarme</span>
            <span className="text-xs text-gray-500 mt-0.5">
              Permite processamento de pagamentos via Pagarme
            </span>
          </div>
          <button
            type="button"
            onClick={() => onChange({ enabled_pagarme: !config.enabled_pagarme })}
            className={`
              relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
              transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
              ${config.enabled_pagarme ? 'bg-primary' : 'bg-gray-200'}
            `}
          >
            <span
              className={`
                pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0
                transition duration-200 ease-in-out
                ${config.enabled_pagarme ? 'translate-x-5' : 'translate-x-0'}
              `}
            />
          </button>
        </label>
      </div>

      {/* Toggle AbacatePay */}
      <div className="mb-4">
        <label className="flex items-center justify-between cursor-pointer">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-700">Habilitar AbacatePay</span>
            <span className="text-xs text-gray-500 mt-0.5">
              Permite processamento de pagamentos via AbacatePay
            </span>
          </div>
          <button
            type="button"
            onClick={() => onChange({ enabled_abacatepay: !config.enabled_abacatepay })}
            className={`
              relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
              transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
              ${config.enabled_abacatepay ? 'bg-primary' : 'bg-gray-200'}
            `}
          >
            <span
              className={`
                pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0
                transition duration-200 ease-in-out
                ${config.enabled_abacatepay ? 'translate-x-5' : 'translate-x-0'}
              `}
            />
          </button>
        </label>
      </div>

      {/* Warning se provider primário desabilitado */}
      {hasError && (
        <div className="mt-4 rounded-lg bg-yellow-50 border border-yellow-200 p-3">
          <p className="text-sm text-yellow-800">
            ⚠️ O provider primário está desativado. Pagamentos podem falhar até que seja habilitado.
          </p>
        </div>
      )}

      {/* Warning se ambos desabilitados */}
      {!config.enabled_pagarme && !config.enabled_abacatepay && (
        <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3">
          <p className="text-sm text-red-800">
            ⚠️ Nenhum provedor está habilitado. Não será possível processar pagamentos.
          </p>
        </div>
      )}
    </div>
  )
}

