import React from 'react'
import type { GuideApprovalStatus } from '../../../types/adminGuides'

interface Props {
  status: GuideApprovalStatus
}

const colorsByStatus: Record<
  GuideApprovalStatus,
  { bg: string; text: string; label: string }
> = {
  pending: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    label: 'Pendente',
  },
  approved: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    label: 'Aprovado',
  },
  rejected: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    label: 'Reprovado',
  },
}

export const GuideStatusBadge: React.FC<Props> = ({ status }) => {
  const config = colorsByStatus[status]

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  )
}

