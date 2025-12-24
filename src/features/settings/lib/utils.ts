/**
 * Formata centavos para formato monetário BRL
 */
export function formatMoneyFromCents(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100)
}

/**
 * Formata data/hora ISO para formato PT-BR curto
 */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '-'
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Retorna cores e labels para status de split
 */
export function getSplitStatusConfig(status: string) {
  const statusLower = status.toLowerCase()
  
  if (statusLower.includes('ready') || statusLower.includes('ready_to_pay')) {
    return { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Pronto para Pagar' }
  }
  if (statusLower.includes('paid') || statusLower.includes('paid_out')) {
    return { bg: 'bg-green-100', text: 'text-green-800', label: 'Pago' }
  }
  if (statusLower.includes('fail') || statusLower.includes('failed')) {
    return { bg: 'bg-red-100', text: 'text-red-800', label: 'Falhou' }
  }
  if (statusLower.includes('created') || statusLower.includes('waiting')) {
    return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Criado' }
  }
  
  return { bg: 'bg-gray-100', text: 'text-gray-800', label: status }
}

/**
 * Retorna cores e labels para status de payout
 */
export function getPayoutStatusConfig(status: string) {
  const statusLower = status.toLowerCase()
  
  if (statusLower.includes('process') && !statusLower.includes('failed')) {
    return { bg: 'bg-green-100', text: 'text-green-800', label: 'Processado' }
  }
  if (statusLower.includes('request') || statusLower.includes('pending')) {
    return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Solicitado' }
  }
  if (statusLower.includes('fail')) {
    return { bg: 'bg-red-100', text: 'text-red-800', label: 'Falhou' }
  }
  
  return { bg: 'bg-gray-100', text: 'text-gray-800', label: status }
}

/**
 * Retorna cores para provider
 */
export function getProviderBadgeConfig(provider: string) {
  const providerLower = provider.toLowerCase()
  
  if (providerLower.includes('pagarme')) {
    return { bg: 'bg-purple-100', text: 'text-purple-800' }
  }
  if (providerLower.includes('abacate')) {
    return { bg: 'bg-blue-100', text: 'text-blue-800' }
  }
  
  return { bg: 'bg-gray-100', text: 'text-gray-800' }
}

