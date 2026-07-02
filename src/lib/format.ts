/**
 * Currency & formatting utilities (Arabic localized)
 */

export const CURRENCY = 'EGP'
export const CURRENCY_SYMBOL = 'ج.م'

export function formatPrice(value: number, currency: string = CURRENCY): string {
  const formatted = new Intl.NumberFormat('ar-EG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(value))
  return `${formatted} ${currency === 'EGP' ? CURRENCY_SYMBOL : currency}`
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('ar-EG').format(value)
}

export function formatCompact(value: number): string {
  return new Intl.NumberFormat('ar-EG', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d)
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function timeAgo(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000)
  if (seconds < 60) return 'الآن'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `منذ ${minutes} دقيقة`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `منذ ${hours} ساعة`
  const days = Math.floor(hours / 24)
  if (days < 30) return `منذ ${days} يوم`
  const months = Math.floor(days / 30)
  if (months < 12) return `منذ ${months} شهر`
  return `منذ ${Math.floor(months / 12)} سنة`
}
