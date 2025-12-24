import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Save, RefreshCw } from 'lucide-react'
import {
  getPaymentsConfig,
  updatePaymentsConfig,
} from '../api/adminPayments'
import type {
  PaymentProvidersConfigDTO,
  UpdatePaymentProvidersConfigDTO,
} from '../../../types/adminPayments'
import { PaymentProvidersCard } from '../components/PaymentProvidersCard'
import { CardFallbackCard } from '../components/CardFallbackCard'
import { PlatformFeeCard } from '../components/PlatformFeeCard'
import { showToast } from '@shared/components/Toast'

export function PaymentsSettingsPage() {
  const queryClient = useQueryClient()
  const [localConfig, setLocalConfig] = useState<PaymentProvidersConfigDTO | null>(null)
  const [errors, setErrors] = useState<string[]>([])

  const { data: config, isLoading: isLoadingConfig, refetch: refetchConfig } = useQuery({
    queryKey: ['payments-config'],
    queryFn: getPaymentsConfig,
  })

  const updateConfigMutation = useMutation({
    mutationFn: updatePaymentsConfig,
    onSuccess: (data) => {
      queryClient.setQueryData(['payments-config'], data)
      setLocalConfig(data)
      setErrors([])
      showToast('Configurações salvas com sucesso', 'success')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erro ao salvar configurações'
      showToast(message, 'error')
    },
  })

  useEffect(() => {
    if (config) {
      setLocalConfig(config)
    }
  }, [config])

  const handleConfigChange = (updates: Partial<UpdatePaymentProvidersConfigDTO>) => {
    if (!localConfig) return
    setLocalConfig({ ...localConfig, ...updates })
    setErrors([])
  }

  const validateConfig = (cfg: PaymentProvidersConfigDTO): string[] => {
    const validationErrors: string[] = []

    if (cfg.primary_provider === 'PAGARME' && !cfg.enabled_pagarme) {
      validationErrors.push('O provider primário (Pagarme) precisa estar habilitado')
    }

    if (cfg.primary_provider === 'ABACATEPAY' && !cfg.enabled_abacatepay) {
      validationErrors.push('O provider primário (AbacatePay) precisa estar habilitado')
    }

    if (cfg.allow_card_fallback_to_pagarme && !cfg.enabled_pagarme) {
      validationErrors.push('Para usar fallback, Pagarme precisa estar habilitado')
    }

    return validationErrors
  }

  const handleSave = () => {
    if (!localConfig) return

    const validationErrors = validateConfig(localConfig)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    const payload: UpdatePaymentProvidersConfigDTO = {
      primary_provider: localConfig.primary_provider,
      enabled_pagarme: localConfig.enabled_pagarme,
      enabled_abacatepay: localConfig.enabled_abacatepay,
      allow_card_fallback_to_pagarme: localConfig.allow_card_fallback_to_pagarme,
      card_fallback_provider_code: localConfig.allow_card_fallback_to_pagarme
        ? 'PAGARME'
        : null,
      tenant_id: localConfig.tenant_id,
      platform_fee_percent: localConfig.platform_fee_percent,
    }

    updateConfigMutation.mutate(payload)
  }

  const isDirty =
    localConfig &&
    config &&
    JSON.stringify(localConfig) !== JSON.stringify(config)

  if (isLoadingConfig || !localConfig) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Carregando configurações...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cards de Configuração */}
      <div className="space-y-6">
        <PaymentProvidersCard
          config={localConfig}
          onChange={handleConfigChange}
          errors={errors}
        />

        <CardFallbackCard config={localConfig} onChange={handleConfigChange} />

        <PlatformFeeCard config={localConfig} onChange={handleConfigChange} />

        {/* Botões de ação */}
        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <button
            onClick={() => refetchConfig()}
            disabled={isLoadingConfig}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingConfig ? 'animate-spin' : ''}`} />
            Recarregar
          </button>

          <button
            onClick={handleSave}
            disabled={!isDirty || updateConfigMutation.isPending}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {updateConfigMutation.isPending ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>
      </div>
    </div>
  )
}

