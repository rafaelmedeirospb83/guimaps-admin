import { getProviderBadgeConfig } from '../lib/utils'

interface Props {
  provider: string
}

export function ProviderBadge({ provider }: Props) {
  const config = getProviderBadgeConfig(provider)

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}
    >
      {provider.toUpperCase()}
    </span>
  )
}

