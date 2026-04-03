/**
 * 付费分析页契约对齐类型（与 mock/backend-api 一致；网关若包裹 { code, message, data } 则在业务层解包为下列形态）
 */

import type { CockpitMetaFilterOptionsData } from '@/types/cockpit-meta-filter'

/** 顶栏 / Tab 公共筛选 POST body */
export interface PaidAnalysisFilterBody {
  startDate: string
  endDate: string
  /** 应用包名或业务约定 id；UI「全部」对应 '' */
  app?: string
  /** 终端平台：'' | 'android' | 'ios'（小写，与 UI 映射一致） */
  platform?: string
  /** 国家 ISO alpha-2 小写；「全部」为 '' */
  s_country_code?: string
  /** 广告平台枚举 string；「全部」为 '' */
  n_source?: string
  /**
   * 商品排行排序维度：留空则前端本地排序；若后端接管排序则传 revenue | orders | retention | country
   */
  productRankingMode?: '' | 'revenue' | 'orders' | 'retention' | 'country'
}

/** 与公用 meta 响应体相同；说明见 `mock/backend-api/README.md` 附录 A。 */
export type PaidAnalysisMetaFilterOptionsData = CockpitMetaFilterOptionsData

export interface PaidAnalysisChannelKpiItem {
  label: string
  value: string
  trendUp: boolean
  trendVal: string
  sub: string
  color: string
  sparkData: number[]
  sparkType: 'line' | 'bar'
}

export interface PaidAnalysisChannelRow {
  /** 广告平台展示名 */
  channelName: string
  /** IAP 收入（USD，数值或预格式文案由后端约定；示例用数字） */
  iapRevenue: number
  /** 占比 0–100 */
  revenueSharePercent: number
  /** 付费人数 */
  payingUsers: number
  /** ARPPU USD */
  arppu: number
  /** 首次付费周期（天） */
  firstPayPeriodDays: number
  /** 续费率 0–100 */
  retentionPercent: number
  /** 质量评分文案，如 ★A+ */
  qualityScore: string
}

export interface PaidAnalysisRoiCohortRow {
  periodLabel: string
  roiPercent: number
  cpaPercent: number
  paidRevenue: number
  paidUsers: number
  renewRatePercent: number
  iapRevenue: number
  iapSharePercent: number
  iapOrders: number
  iapUsers: number
}

export interface PaidAnalysisChannelRetentionRow {
  channelName: string
  month1Bucket: string
  month2Bucket: string
  month5Bucket: string
}

/** Tab channel · POST .../tab-channel/overview · 契约 `02-tab-channel-overview.json` */
export interface PaidAnalysisChannelTabOverviewData {
  kpis: PaidAnalysisChannelKpiItem[]
  aiTips: { id: number; color: string; text: string }[]
}

/** Tab channel · POST .../tab-channel/tables · 契约 `02-tab-channel-tables.json` */
export interface PaidAnalysisChannelTabTablesData {
  channelRows: PaidAnalysisChannelRow[]
  roiCohortRows: PaidAnalysisRoiCohortRow[]
  retentionRows: PaidAnalysisChannelRetentionRow[]
}

/** Tab channel · POST .../tab-channel/charts · 契约 `02-tab-channel-charts.json` */
export interface PaidAnalysisChannelTabChartsData {
  trendSeries: { name: string; color: string; points: { t_date: string; revenue: number }[] }[]
  arppuBar: { channelName: string; percentOfMax: number; arppu: number }[]
  productMixDonut: { name: string; value: number; color: string }[]
  donutCenterRevenueUsd: number
}

/** 合并形态：并行请求三段后在客户端拼装。 */
export type PaidAnalysisChannelTabData = PaidAnalysisChannelTabOverviewData &
  PaidAnalysisChannelTabTablesData &
  PaidAnalysisChannelTabChartsData

/** 商品收入排行表单行 */
export interface PaidAnalysisProductRankingRow {
  skuName: string
  priceUsd: number
  productKind: string
  productKindKey: 'year_sub' | 'month_sub' | 'lifetime' | 'coin' | 'other'
  revenueUsd: number
  sharePercent: number
  orderCount: number
  arppuUsd: number
  retentionPercent: number | null
  topCountries: string[]
  trendPoints: number[]
}

/** 按付费日订单汇总局单行 */
export interface PaidAnalysisProductPaidDateSummaryRow {
  t_date: string
  totalSubscriptions: number
  orderPaid: number
  orderSub: number
  orderIap: number
  orderRenew: number
  orderRefund: number
  orderCancel: number
  revPaidUsd: number
  revSubUsd: number
  revIapUsd: number
  revRenewUsd: number
}

/** Tab product · POST .../tab-product/overview · 契约 `03-tab-product-overview.json` */
export interface PaidAnalysisProductTabOverviewData {
  kpis: PaidAnalysisChannelKpiItem[]
}

/** Tab product · POST .../tab-product/ranking · 契约 `03-tab-product-ranking.json` */
export interface PaidAnalysisProductTabRankingData {
  productRows: PaidAnalysisProductRankingRow[]
}

/** Tab product · POST .../tab-product/charts · 契约 `03-tab-product-charts.json` */
export interface PaidAnalysisProductTabChartsData {
  mixLegend: { name: string; pct: number; revenueUsd: number; color: string }[]
  paidDateSummaryRows: PaidAnalysisProductPaidDateSummaryRow[]
  revenueTrend30d: { t_date: string; revenue: number }[]
  subscriptionRetentionMatrix: {
    skuName: string
    m1: number
    m2: number
    m3: number
    m4: number
    m5: number
  }[]
  countryBarTop: { s_country_code: string; segments: { kind: string; revenue: number }[] }[]
}

/** 合并形态：并行请求三段后在客户端拼装。 */
export type PaidAnalysisProductTabData = PaidAnalysisProductTabOverviewData &
  PaidAnalysisProductTabRankingData &
  PaidAnalysisProductTabChartsData

export interface PaidAnalysisOrderTabSummaryData {
  kpis: {
    label: string
    value: string
    trendUp: boolean
    trendRef: string
    subNotes: string
    color: string
  }[]
  appPlatformRows: {
    appName: string
    platform: string
    totalSubscriptions: string
    paid: string
    sub: string
    iap: number
    renew: number
    refund: number
    cancel: number
    rPaid: string
    rSub: string
    rIap: string
    rRenew: string
  }[]
  dailyRows: {
    t_date: string
    paidRevenueLabel: string
    paidUsers: number
    payRateLabel: string
    orders: number
    adSpendLabel: string
    cpa: number
    newUsers: number
    renewRateLabel: string
  }[]
  hourAmounts: number[]
  productTypeShare: { name: string; percent: number; color: string }[]
}

export interface PaidAnalysisOrderListParams extends PaidAnalysisFilterBody {
  current?: number
  size?: number
  keyword?: string
  productSku?: string
  /** 订单状态筛选项值，与 status 行字段同源；「全部」'' */
  orderStatus?: string
}

export interface PaidAnalysisOrderListItem {
  s_order_id: string
  user_display_id: string
  appName: string
  productBrief: string
  amountLabel: string
  sourceLabel: string
  s_country_code: string
  orderTimeLabel: string
  paymentMethod: string
  status: 'success' | 'refund' | 'fail'
}

export interface PaidAnalysisOrderListData {
  records: PaidAnalysisOrderListItem[]
  total: number
  current: number
  size: number
}

export interface PaidAnalysisOrderDetailData {
  s_order_id: string
  user_display_id: string
  appName: string
  platform: string
  skuName: string
  skuId: string
  priceLabel: string
  paymentPlatform: string
  source: string
  s_country_code: string
  timezoneLabel: string
  currency: string
  orderTime: string
  payTime: string
  subStartDate: string
  subEndDate: string
  isFirstPay: boolean
  firstPayCycleDays: number
  subTypeLabel: string
  autoRenewOn: boolean
  renewCountLabel: string
  nextRenewDate: string
  attrSource: string
  campaignName: string
  adGroupName: string
  attrModel: string
}
