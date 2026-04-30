/**
 * 实时数据接口通用筛选（契约 01～04）。
 * 筛选项下拉请读 `useCockpitMetaFilterStore().data`（`@/store/modules/cockpit-meta-filter`，`ensureLoaded`），
 * 形态见 `CockpitMetaFilterOptionsData`（`@/types/cockpit-meta-filter`）。
 *
 * 「全部应用」等：请求入参用空数组 `[]`，勿传字面量 `all`。
 * 与公用 cockpit 及应用筛选统一约定对齐：应用维度请求键名为 **`appIds`**（`string[]`）。
 */
export interface RealtimeDataQueryParams {
  /** 应用筛选；不限 []，单选 ['appId'] */
  appIds: string[]
  /** 广告平台（筛选维度键名统一为 source）；`''` 表示不限；一律 string（如 `1`、`7`），勿用 JSON number */
  source: string
}

export interface ChannelData {
  name: string
  iconColor: string
  spend: number
  cpi: number
  roi: number
  /** 广告平台枚举，string（如 `1`），与请求入参 `source` 一致 */
  n_source?: string
}

export interface AppDetailData {
  id: string
  name: string
  iconText: string
  iconBg: string
  spend: number
  installs: number
  cpi: number
  roi1d: number
  roi3d: number
  estimatedProfit: number
  activeSeries: number
  balance: number
  ctr: number
  cvr: number
  budgetProgress: number
  budgetDaysLeft: string
  channels: ChannelData[]
  hourlyData: number[]
  hourlyRoi: number[]
}

/** 看板应用卡片列表项（不含详情；详情见 app-detail 接口）。对应 mock/backend-api/02-table-app-cards.json */
export type RealtimeAppCardRow = Omit<AppCard, 'detail'>

/** 底部小时消耗对比（推荐接口形态）。对应 mock/backend-api/04-overview-hourly-spend-comparison.json */
export interface RealtimeHourlyBarSeriesItem {
  s_app_id: string
  name: string
  color: string
  /** 与 hourLabels 等长的今日各时段花费（与数据字典 cost 语义一致，单位 USD） */
  costSeries: number[]
}

export interface RealtimeHourlySpendComparison {
  hourLabels: string[]
  series: RealtimeHourlyBarSeriesItem[]
  /** 与 hourLabels 等长，ROI 百分比数值（如 94 表示 94%） */
  roiPercentSeries: number[]
}

/** 看板单应用卡片（含详情弹窗所需 detail） */
export interface AppCard {
  id: string
  name: string
  iconText: string
  iconBg: string
  isLive: boolean
  hasWarning: boolean
  warningBadge?: string
  launchLabel: string
  spend: number
  spendChange?: string
  spendUp?: boolean
  installs: number
  cpi: number
  cpiChange?: string
  cpiUp?: boolean
  activeSeries: number
  roi: number
  roiGood: boolean
  roiColor: string
  chartData: number[]
  chartColor: string
  actionTag?: string
  actionTagType?: 'cyan' | 'orange' | 'gray' | 'red'
  detail: AppDetailData
}

/** 顶部 KPI 汇总 */
export interface RealtimeKpiSummary {
  onlineApps: number
  totalApps: number
  todaySpend: number
  spendChange: string
  roiAvg: number
  roiTarget: number
  warningApps: number
}

/** 契约 02-table-app-cards 响应体 */
export interface RealtimeAppCardsTableBody {
  items: RealtimeAppCardRow[]
}

/** 详情弹窗：目标应用为 `appId`；`source` 与列表筛选一致（`''` 为不限）。勿把列表「应用筛选」与当前卡片 id 混在一个字段里重复覆盖。 */
export interface RealtimeAppDetailRequestBody {
  appId: string
  source: string
}

/** 契约 03-app-detail 响应体 */
export interface RealtimeAppDetailBody {
  detail: AppDetailData
}

/** 底部「实时小时消耗对比」柱状序列（含 ROI 折线；旧版图表数据结构，接入 04 后推荐映射自 RealtimeHourlySpendComparison） */
export interface RealtimeBottomSeries {
  weather5: number[]
  phonetracker: number[]
  bloodsugar2: number[]
  phonetracker2: number[]
  roi: number[]
}
