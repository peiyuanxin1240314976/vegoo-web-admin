/**
 * 订单退款分析 - 页面与接口共用类型（与 mock/backend-api 契约一致）
 */

export interface RefundFilters {
  app: string
  dateRange: [string, string]
  compareType: string
  country: string
  platform: string
}

/** 与页内 `ora-kpi-card--*` 修饰符一致，对齐广告成效 KPI 主题色 */
export type OrderRefundKpiThemeKey = 'refund' | 'rate' | 'orders' | 'avg' | 'loss'

export interface KpiCard {
  label: string
  value: string
  change?: string
  themeKey: OrderRefundKpiThemeKey
  /** 与广告成效一致：is-up 绿 / is-down 红 */
  compareClass?: 'is-up' | 'is-down'
}

export interface TrendPoint {
  date: string
  refundAmount: number
  ma7: number
}

export interface CountryRate {
  /** ISO 3166-1 alpha-2 小写，与契约一致 */
  countryCode: string
  rate: number
  level: 'good' | 'warning' | 'danger' | 'critical'
  badge?: string
}

export interface OrderRecord {
  orderId: string
  user: string
  amount: number
  reason: string
  platform: string
  date: string
  status: 'refunded' | 'processing' | 'pending'
}

export interface OrderRefundKpiBlock {
  totalAmount: number
  totalAmountChange: number
  refundRate: number
  refundRateChange: number
  orderCount: number
  orderCountChange: number
  avgAmount: number
  revenueRatio: number
}

/** 看板聚合（单接口返回） */
export interface DashboardPayload {
  kpi: OrderRefundKpiBlock
  trend: TrendPoint[]
  reasonData: { name: string; value: number }[]
  countryData: CountryRate[]
  orderData: OrderRecord[]
  alertMessage: string
}

/** POST /overview/dashboard 请求体（与 mock/backend-api/01-dashboard.json 一致，camelCase） */
export interface OrderRefundDashboardParams {
  /** 应用 ID；UI「全部」映射为 `""` */
  appId: string
  startDate: string
  endDate: string
  compareType: string
  /** ISO 3166-1 alpha-2 小写；UI「全部」映射为 `""` */
  countryCode: string
  /** 支付平台筛选项值；「全部」映射为 `""` */
  paymentPlatform: string
}
