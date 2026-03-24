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

export interface KpiCard {
  label: string
  value: string
  change?: string
  theme: string
  valueClass?: string
  changeClass?: string
}

export interface TrendPoint {
  date: string
  refundAmount: number
  ma7: number
}

export interface CountryRate {
  country: string
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

/** POST /overview/dashboard 请求体 */
export interface OrderRefundDashboardParams {
  /** 应用筛选，all 表示全部 */
  app: string
  startDate: string
  endDate: string
  compareType: string
  country: string
  /** 支付平台（数据字典：payment_platform） */
  payment_platform: string
}
