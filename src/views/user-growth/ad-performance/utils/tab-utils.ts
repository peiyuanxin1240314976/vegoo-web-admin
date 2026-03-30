/**
 * 广告成效 Tab 共享工具：常量 + 纯函数，模块级定义避免每次调用重新分配对象
 */

export const CHANNEL_SHORT_MAP: Record<string, string> = {
  google: 'G',
  facebook: 'F',
  tiktok: 'T',
  meta: 'M',
  kwai: 'K',
  mintegral: 'Mi'
}

export const COUNTRY_FLAG_MAP: Record<string, string> = {
  US: '🇺🇸',
  UK: '🇬🇧',
  CA: '🇨🇦',
  JP: '🇯🇵',
  BR: '🇧🇷',
  MX: '🇲🇽',
  CO: '🇨🇴',
  AR: '🇦🇷',
  TH: '🇹🇭',
  VN: '🇻🇳',
  ES: '🇪🇸'
}

export const COUNTRY_LABEL_MAP: Record<string, string> = {
  US: '美国(US)',
  UK: '英国(UK)',
  CA: '加拿大(CA)',
  JP: '日本(JP)',
  BR: '巴西(BR)',
  MX: '墨西哥(MX)',
  CO: '哥伦比亚(CO)',
  AR: '阿根廷(AR)',
  TH: '泰国(TH)',
  VN: '越南(VN)',
  ES: '西班牙(ES)'
}

export const LEVEL_ACCENT_COLORS: Record<string, string> = {
  google: '#3B82F6',
  facebook: '#2563EB',
  tiktok: '#10B981',
  meta: '#8B5CF6',
  kwai: '#F97316',
  mintegral: '#EC4899'
}

export function channelShort(channel: string | null | undefined): string {
  const ch = String(channel ?? '')
  return CHANNEL_SHORT_MAP[ch] ?? ch.slice(0, 1).toUpperCase()
}

export function countryFlag(country: string | null | undefined): string {
  const c = String(country ?? '').toUpperCase()
  return COUNTRY_FLAG_MAP[c] ?? c
}

export function countryLabel(country: string | null | undefined): string {
  const c = String(country ?? '').toUpperCase()
  return COUNTRY_LABEL_MAP[c] ?? c
}

export function formatMoney(n: number | null | undefined, digits: 0 | 2 = 0): string {
  if (n == null) return '--'
  return (
    '$' +
    n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })
  )
}

export function roiClass(roi: number | null | undefined): string {
  return (roi ?? 0) >= 80 ? 'ad-performance-table__roi--up' : 'ad-performance-table__roi--down'
}

export function profitClass(profit: number | null | undefined): string {
  return (profit ?? 0) >= 0
    ? 'ad-performance-table__profit--up'
    : 'ad-performance-table__profit--down'
}

export function accentColor(channel: string | null | undefined): string {
  return LEVEL_ACCENT_COLORS[String(channel ?? '')] ?? 'var(--art-success)'
}
