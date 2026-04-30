/**
 * 数字格式化工具
 * - 大于等于 10000 的数值转为“万”单位
 * - 最多保留 2 位小数
 * - 小数末尾 0 自动去除（如 1.20 => 1.2，1.00 => 1）
 */

export interface FormatWithWanOptions {
  threshold?: number
  unit?: string
  fractionDigits?: number
  fallback?: string
}

function toFiniteNumber(value: unknown): number | null {
  const num = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(num) ? num : null
}

function trimTrailingZeros(text: string): string {
  return text.replace(/\.?0+$/, '')
}

function normalizeFractionDigits(value: number): number {
  if (!Number.isFinite(value)) return 2
  return Math.min(20, Math.max(0, Math.trunc(value)))
}

/**
 * 避免 toFixed 的浮点误差（如 1.005 => 1.01）
 */
function roundToPrecision(value: number, fractionDigits: number): number {
  const factor = 10 ** fractionDigits
  const offset = Number.EPSILON * (value >= 0 ? 1 : -1)
  return Math.round((value + offset) * factor) / factor
}

function formatNumber(value: number, fractionDigits: number): string {
  const rounded = roundToPrecision(value, fractionDigits)
  return trimTrailingZeros(rounded.toFixed(fractionDigits))
}

function formatNumericCore(num: number, options: FormatWithWanOptions): string {
  const threshold = options.threshold ?? 10000
  const unit = options.unit ?? '万'
  const fractionDigits = normalizeFractionDigits(options.fractionDigits ?? 2)

  if (Math.abs(num) < threshold) {
    return formatNumber(num, fractionDigits)
  }

  const converted = num / threshold
  return `${formatNumber(converted, fractionDigits)}${unit}`
}

function tryExtractNumericText(
  value: string
): { prefix: string; numberPart: string; suffix: string } | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const match = trimmed.match(/^([^0-9+-]*[+-]?[^0-9]*)?(\d[\d,]*(?:\.\d+)?)([^0-9]*)$/)
  if (!match) return null
  return {
    prefix: match[1] ?? '',
    numberPart: match[2].replaceAll(',', ''),
    suffix: match[3] ?? ''
  }
}

/**
 * 按“万”单位格式化数值
 *
 * @example
 * formatNumberWithWan(12345) // '1.23万'
 * formatNumberWithWan(10000) // '1万'
 * formatNumberWithWan(9999) // '9999'
 * formatNumberWithWan(12000.5) // '1.2万'
 */
export function formatNumberWithWan(value: unknown, options: FormatWithWanOptions = {}): string {
  const fallback = options.fallback ?? '--'

  if (typeof value === 'number') {
    return Number.isFinite(value) ? formatNumericCore(value, options) : fallback
  }

  if (typeof value === 'string') {
    const extracted = tryExtractNumericText(value)
    if (!extracted) {
      return value.trim() ? value : fallback
    }
    const num = toFiniteNumber(extracted.numberPart)
    if (num === null) return value
    return `${extracted.prefix}${formatNumericCore(num, options)}${extracted.suffix}`
  }

  const num = toFiniteNumber(value)
  if (num === null) return fallback
  return formatNumericCore(num, options)
}
