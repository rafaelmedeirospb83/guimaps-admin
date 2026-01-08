export function splitCommaListToArray(input: string): string[] {
  if (!input || !input.trim()) return []
  return input
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export function joinArrayToCommaList(items?: string[] | null): string {
  if (!items || items.length === 0) return ''
  return items.join(', ')
}

export function minutesToHoursMinutes(total: number): { hours: number; minutes: number } {
  const hours = Math.floor(total / 60)
  const minutes = total % 60
  return { hours, minutes }
}

export function hoursMinutesToMinutes(hours: number, minutes: number): number {
  const hoursNum = Number.isNaN(hours) ? 0 : Math.max(0, Math.floor(hours))
  const minutesNum = Number.isNaN(minutes) ? 0 : Math.max(0, Math.min(59, Math.floor(minutes)))
  return hoursNum * 60 + minutesNum
}

export function formatCentsToBRL(cents: number): string {
  const value = cents / 100
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function parseBRLToCents(input: string): number | null {
  if (!input || !input.trim()) return null

  let cleaned = input.trim()

  cleaned = cleaned.replace(/R\$\s*/gi, '')
  cleaned = cleaned.replace(/\s+/g, '')

  if (!cleaned) return null

  const hasDot = cleaned.includes('.')
  const hasComma = cleaned.includes(',')

  let numericValue: string

  if (hasDot && hasComma) {
    const parts = cleaned.split(',')
    if (parts.length === 2) {
      numericValue = cleaned.replace(/\./g, '').replace(',', '.')
    } else {
      const dotParts = cleaned.split('.')
      if (dotParts.length === 2) {
        numericValue = cleaned.replace(/,/g, '')
      } else {
        cleaned = cleaned.replace(/\./g, '').replace(',', '.')
        numericValue = cleaned
      }
    }
  } else if (hasComma) {
    numericValue = cleaned.replace(',', '.')
  } else if (hasDot) {
    const dotParts = cleaned.split('.')
    if (dotParts.length === 2 && dotParts[1].length <= 2) {
      numericValue = cleaned
    } else {
      numericValue = cleaned.replace(/\./g, '')
    }
  } else {
    numericValue = cleaned
  }

  const parsed = parseFloat(numericValue)

  if (Number.isNaN(parsed) || parsed < 0) return null

  const cents = Math.round(parsed * 100)

  return cents
}

export function normalizeLineBreaks(text: string): string {
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
}

