/**
 * 达标 / 最低要求展示：ROI 接口可为小数比率（如 0.65），列表需按百分比展示并 ×100；
 * Mock / 表单历史上也可能已为「百分点」整数（如 53），此时不再乘 100。
 */
export function roiRequirementPercentPoints(rate: number): number {
  if (!Number.isFinite(rate)) return 0
  return Math.abs(rate) <= 1 ? rate * 100 : rate
}

const EN_US_NUM = 'en-US' as const

function formatOptionalDecimals(n: number): string {
  return n.toLocaleString(EN_US_NUM, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

export function formatPerfRequirementDisplay(evalMethod: string, rate: number): string {
  if (!Number.isFinite(rate)) return '—'
  if (evalMethod === 'ROI') {
    const pct = roiRequirementPercentPoints(rate)
    return `${formatOptionalDecimals(pct)}%`
  }
  return `$${formatOptionalDecimals(rate)}`
}
