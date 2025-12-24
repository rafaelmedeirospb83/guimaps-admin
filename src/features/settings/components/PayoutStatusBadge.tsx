import { getPayoutStatusConfig } from '../lib/utils'

interface Props {
  status: string
}

export function PayoutStatusBadge({ status }: Props) {
  const config = getPayoutStatusConfig(status)

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  )
}

