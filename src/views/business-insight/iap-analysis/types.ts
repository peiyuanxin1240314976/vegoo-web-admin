/**
 * IAP 分析 - 页面与接口类型
 * 与 mock/backend-api 契约、backend-fields 对齐
 */

/** 下拉选项项 */
export interface IapSelectOption {
  label: string
  value: string
}

/** 全局筛选状态（与 backend-fields：platform、countryCode、appId 等一致） */
export interface IapFilterState {
  startDate: string
  endDate: string
  /** 应用筛选（单选）；「全部」由 UI 侧用 all 表示，提交接口时映射为 "" */
  appId?: string
  /** 国家代码（ISO 3166-1 alpha-2 小写）；「全部」由 UI 侧用 all 表示，提交接口时映射为 "" */
  countryCode?: string
  platform: string
  /**
   * 兼容旧字段（snake_case），部分页面/Mock 仍在使用。
   * 后续可逐步迁移为 appId / countryCode。
   */
  s_app_id?: string
  s_country_code?: string
}

/** 筛选下拉选项（meta-filter-options 响应） */
export interface IapFilterOptions {
  appOptions: IapSelectOption[]
  platformOptions: IapSelectOption[]
  countryOptions: IapSelectOption[]
  productTypeOptions: IapSelectOption[]
  /** 快捷时间范围（若后端暂未提供，可由前端 mock 注入） */
  timeRangeOptions?: IapSelectOption[]
}

/** Dashboard/Detail 用 KPI 卡片项 */
export interface IapKpiCard {
  label: string
  value: string
  change: string
  up: boolean
  warn?: boolean
  borderColor: string
  sparkColor?: string
  sparklineValues?: number[]
}

/** 趋势图 - 订单 vs 收入 */
export interface IapTrendOrdersRevenue {
  dates: string[]
  orders: number[]
  revenue: number[]
}

/** 趋势图 - 单指标（转化率 / ARPU） */
export interface IapTrendSingle {
  dates: string[]
  values: number[]
}

/** Overview 趋势三块聚合 */
export interface IapOverviewTrend {
  ordersRevenue: IapTrendOrdersRevenue
  conversion: IapTrendSingle
  arpu: IapTrendSingle
}

/** 应用卡片（Dashboard 应用分析区块） */
export interface IapAppCard {
  name: string
  appId: string
  platform: string
  orders: string
  revenue: string
  arpu: string
  change: string
  up: boolean
  icon: string
  iconBg: string
}

/** 国家/地区收入分布行（countryCode 遵循数据字典，ISO 3166-1 alpha-2 小写） */
export interface IapCountryRow {
  countryCode?: string
  country: string
  orders: number
  revenue: string
  ratio: string
  arpu: string
  /** 兼容旧字段（snake_case），用于历史 mock 数据。 */
  s_country_code?: string
  /** 国旗（emoji） */
  flag?: string
  barWidth?: string
  barColor?: string
}

/** 产品类型甜甜圈项（内购/订阅） */
export interface IapProductTypeDonutItem {
  name: string
  value: number
  percent: number
  amount?: string
}

/** 平台对比（iOS/Android 维度） */
export interface IapPlatformCompare {
  dimensions: string[]
  ios: number[]
  android: number[]
}

/** Detail - 产品 SKU 表行 */
export interface IapSkuRow {
  name: string
  type: string
  orders: number
  revenue: string
  ratio: string
  arpu: string
  conversion: string
  retention: string
  churn: string
  trend: string
  trendUp: boolean
  sparklineValues?: number[]
}

/** Detail - 用户分层项 */
export interface IapUserSegment {
  label: string
  count: string
  pct: string
  arpu: string
  color: string
}

/** Detail - 订阅周期甜甜圈项 */
export interface IapSubscriptionDonutItem {
  name: string
  pct: string
  value?: number
  color?: string
}

/** Detail - 续费周期图数据 */
export interface IapRenewChart {
  categories: string[]
  counts: number[]
  rates?: number[]
}

/** Detail - 产品 Tab 聚合 */
export interface IapDetailProduct {
  skuList: IapSkuRow[]
  userSegments: IapUserSegment[]
  subscriptionDonut: IapSubscriptionDonutItem[]
  subscriptionTotal?: string
  renewChart: IapRenewChart
}

/** Detail - 用户价值表行 */
export interface IapUserValueRow {
  segment: string
  count: string
  ratio: string
  arpu: string
  conversion: string
  retention: string
  churn: string
}

/** Detail - 用户 Tab 聚合 */
export interface IapDetailUser {
  userValueTable: IapUserValueRow[]
  countryChartData?: { countries: string[]; counts: number[]; arpu: number[] }
  userCompareData?: { categories: string[]; conversion: number[]; arpu: number[] }
  firstPayData?: { categories: string[]; values: number[] }
}

/** Detail - 趋势 Tab 聚合 */
export interface IapDetailTrend {
  ordersRevenue: IapTrendOrdersRevenue
  arpuTrend: IapTrendSingle
  conversionRetention: { dates: string[]; conversion: number[]; retention: number[] }
  churnTrend: IapTrendSingle
  churnThreshold?: number
}
