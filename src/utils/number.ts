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
}

function toFiniteNumber(value: unknown): number | null {
  const num = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(num) ? num : null
}

function trimTrailingZeros(text: string): string {
  return text.replace(/\.?0+$/, '')
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
  const num = toFiniteNumber(value)
  if (num === null) return '--'

  const threshold = options.threshold ?? 10000
  const unit = options.unit ?? '万'
  const fractionDigits = options.fractionDigits ?? 2

  if (Math.abs(num) < threshold) {
    return trimTrailingZeros(num.toFixed(fractionDigits))
  }

  const converted = num / threshold
  return `${trimTrailingZeros(converted.toFixed(fractionDigits))}${unit}`
}
