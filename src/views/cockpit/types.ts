/**
 * 驾驶舱数据类型定义
 * 与后端接口约定一致，便于后续对接真实 API 时直接复用
 */

/** 日期范围 */
export type CockpitDateRange = 'today' | 'yesterday' | 'week' | 'month'

/** 请求参数：按日期范围拉取驾驶舱数据 */
export interface CockpitOverviewParams {
  dateRange?: CockpitDateRange
}

/** 经营驾驶舱「第一排总数据」接口：单周期指标（last / now 结构相同） */
export interface CockpitOverallPeriodItem {
  activeSubscription: number
  dAdRevenue: number
  dCost: number
  dIapRevenue: number
  dau: number
  ninstalls: number
  nNatural: number
  nNewUserCount: number
  payRevenue: number
  profit: number
  proxyCost: number
  totalRevenue: number
}

/** 经营驾驶舱第一排总数据接口响应（/api/v1/datacenter/analysis/cockpit/overall）旧结构，保留兼容 */
export interface CockpitOverallResponse {
  last: CockpitOverallPeriodItem
  now: CockpitOverallPeriodItem
}

/** 经营驾驶舱 overall 新接口：单周期指标（展示用 now） */
export interface CockpitOverallDataPeriod {
  activeSubscription: number
  adAccountCount?: number
  adCost?: number
  adRevenue?: number
  dCost: number
  dnu?: number
  dau: number
  installCount?: number
  newUsers?: number
  payRevenue: number
  profit: number
  totalRevenue: number
  /** 自然量（警示摘要用） */
  naturalCount?: number
  /** 买量应用数（警示摘要用，单位：个） */
  initialCount?: number
  /** 广告系列数（警示摘要用，单位：个） */
  adGroupCount?: number
}

/** 折线统计单项（后端 *List 元素，可能是数值或带日期） */
export type CockpitOverallSeriesItem = number | { value?: number; date?: string }

/** 经营驾驶舱 overall 新接口：data 主体（同一接口供 KPI 卡片 + 警示使用） */
export interface CockpitOverallData {
  /** 当前周期汇总，展示用 */
  now: CockpitOverallDataPeriod
  /** 上一周期汇总 */
  last: CockpitOverallDataPeriod
  /** 变化量（后端已算好，直接用于升降展示） */
  activeSubscriptionChange?: number
  adAccountCountChange?: number
  adCostChange?: number
  dauChange?: number
  dnuChange?: number
  installCountChange?: number
  payRevenueChange?: number
  profitChange?: number
  totalRevenueChange?: number
  /** 自然量变化（警示摘要用） */
  naturalCountChange?: number
  /** 广告系列数变化（警示摘要用） */
  adGroupCountChange?: number
  /** 第一排折线统计：运营成本/广告支出 */
  dCostList?: CockpitOverallSeriesItem[]
  /** 有效订阅明细 */
  activeSubscriptionList?: CockpitOverallSeriesItem[]
  /** DAU 明细 */
  dauList?: CockpitOverallSeriesItem[]
  /** 付费收入明细 */
  payRevenueList?: CockpitOverallSeriesItem[]
  /** 利润明细 */
  profitList?: CockpitOverallSeriesItem[]
  /** 总收入明细 */
  totalRevenueList?: CockpitOverallSeriesItem[]
  /** 可选：同一接口返回的警示摘要与横幅 */
  alertSummaryMetrics?: CockpitAlertSummaryMetric[]
  alertBanners?: CockpitAlertBanner[]
  /** 后端警示列表：type 1=warning 2=opportunity 3=risk，msg 为展示文案 */
  warnList?: CockpitWarnListItem[]
}

/** overall 接口返回的警示项：type 1=warning 2=opportunity 3=risk */
export interface CockpitWarnListItem {
  type: 1 | 2 | 3
  msg: string
}

/** 经营驾驶舱 overall 新接口：HTTP 响应（code/message/data） */
export interface CockpitOverallApiResponse {
  code: number
  message?: string
  data?: CockpitOverallData
}

/** 经营驾驶舱第一排总数据请求体 */
export interface CockpitOverallParams {
  startTime: string
  endTime: string
}

/** 情景模拟接口请求体 POST /api/v1/datacenter/analysis/cockpit/appSimulation */
export interface CockpitAppSimulationParams {
  /** 广告预算变化百分比（对应 Meta Ads 预算调整） */
  adsChange: number
  /** CPI 变化百分比（对应 Google Ads CPI） */
  cplChange: number
  /** eCPM 变化百分比（对应 Admob eCPM） */
  eCpmChange: number
  /** 留存率变化百分比 */
  retentionChange: number
}

/** 情景模拟-单项指标（predict 当前预测 / result 模拟结果 / change 变化值） */
export interface CockpitAppSimulationInfluenceItem {
  predict: number
  result: number
  change: number
}

/** 情景模拟-预测影响 */
export interface CockpitAppSimulationPredictInfluence {
  endMouthRevenue: CockpitAppSimulationInfluenceItem
  endMouthCost: CockpitAppSimulationInfluenceItem
  endMouthRoi: CockpitAppSimulationInfluenceItem
  endMouthProfit: CockpitAppSimulationInfluenceItem
}

/** 情景模拟接口响应 data */
export interface CockpitAppSimulationData {
  predictInfluence: CockpitAppSimulationPredictInfluence
  revenueComparisonCost: {
    cost: number[]
    revenue: number[]
  }
}

/** 情景模拟接口 HTTP 响应 */
export interface CockpitAppSimulationResponse {
  code: number
  message?: string
  data?: CockpitAppSimulationData
}

/** 国家详情第一排总数据 - 单周期（last/now 结构） */
export interface CountryInfoOverallPeriod {
  arpu: number
  cost: number
  cpl: number
  dAdRevenue: number
  dCost: number
  dau: number
  eCpm: number
  Install: number
  nNewUserCount: number
  roas: number
  roi: number
  /** 内购收入（变现分析-收入构成） */
  dIapRevenue?: number
  /** 广告充展率（变现分析-指标） */
  adExpansionRate?: number
  /** 仅 last 可能返回 */
  nNewUserCountChange?: number
}

/** 国家详情第一排总数据 - data 主体 */
export interface CountryInfoOverallData {
  arpuChange?: number
  dAdRevenueChange?: number
  dCostChange?: number
  dauChange?: number
  eCpmChange?: number
  roiChange?: number
  nNewUserCountChange?: number
  last: CountryInfoOverallPeriod
  now: CountryInfoOverallPeriod
}

/** 国家详情第一排总数据接口响应 /api/v1/datacenter/analysis/countryInfo/overall */
export interface CountryInfoOverallApiResponse {
  code: number
  message?: string
  data?: CountryInfoOverallData
}

/** 国家详情当前投放中 Campaign Top5 接口 data 单项 /api/v1/datacenter/analysis/countryInfo/top5Campaign */
export interface CountryInfoTop5CampaignItem {
  /** 消耗 */
  cost: number
  /** 安装量 */
  install: number
  /** ROI */
  roi: number
  /** 活动名称 */
  campaign?: string
  /** 状态（若后端返回） */
  status?: string
}

/** 国家详情渠道投放效果对比 - 单条 data 的 now/last 结构 */
export interface CountryInfoChannelLaunchPeriod {
  cost?: number
  install?: number
  roi?: number
  cpl?: number
  roas?: number
  arpu?: number
  dAdRevenue?: number
  dCost?: number
  dau?: number
  eCpm?: number
  nNewUserCount?: number
}

/** 国家详情渠道投放效果对比 data 数组单项 /api/v1/datacenter/analysis/countryInfo/channelLaunch */
export interface CountryInfoChannelLaunchItem {
  now: CountryInfoChannelLaunchPeriod
  last: CountryInfoChannelLaunchPeriod
  /** CPL 变化趋势，用于展示箭头：>0 上箭头绿，=0 右箭头灰，<0 下箭头红，null 显示 '-' 灰 */
  cplChange: number | null
  /** 渠道名称（若后端返回） */
  channel?: string
}

/** 国家详情 LTV 预测接口 data /api/v1/datacenter/analysis/countryInfo/ltv */
export interface CountryInfoLtvData {
  d7: number
  d30: number
  d90: number
  d180: number
  /** 预计回收周期天数 */
  days: number
}

/** 国家详情用户留存曲线单条（currentCountry / globalAvg） */
export interface CountryInfoRemainDataItem {
  day1: number | null
  day3: number | null
  day7: number | null
  day14: number | null
  day30: number | null
}

/** 国家详情用户留存曲线接口 data /api/v1/datacenter/analysis/countryInfo/remain */
export interface CountryInfoRemainData {
  /** 当前国家留存 */
  currentCountry: CountryInfoRemainDataItem
  /** 全局平均留存 */
  globalAvg: CountryInfoRemainDataItem
}

/** 国家详情用户分层接口 data /api/v1/datacenter/analysis/countryInfo/userPayLaunch */
export interface CountryInfoUserPayLaunchData {
  /** 活跃免费用户 */
  freeAndActiveUserCount: number
  /** 免费用户 */
  freeUserCount: number
  /** 付费用户 */
  payUserCount: number
  /** 付费转换率 */
  payConversionRate: number
  /** 全局付费转换率 */
  payConversionGlobalAvgRate: number
}

/** KPI 卡片类型：总收入、付费收入、广告支出、有效订阅、DAU、预估利润 */
export type CockpitKpiCardType =
  | 'income' // 总收入
  | 'paidRevenue' // 付费收入
  | 'adSpend' // 广告支出
  | 'subscriptions' // 有效订阅
  | 'dau' // DAU
  | 'profit' // 预估利润

/** KPI 卡片单项 */
export interface CockpitKpiCard {
  type: CockpitKpiCardType
  label: string
  value: string
  detail?: string
  sub?: string
  /** 较上期等对比文案，可由后端 *Change 直接生成 */
  compare?: string
  compareUp?: boolean
  progressPercent?: number
  /** 第一排折线数据（来自 *List），有则用真实数据绘图，无则按 compareUp 兜底 */
  chartData?: number[]
}

/** 顶部警示/机会/风险条 */
export interface CockpitAlertBanner {
  type: 'warning' | 'opportunity' | 'risk'
  text: string
  suggestion: string
}

/** 警示模块左侧摘要指标单项（带升降趋势） */
export interface CockpitAlertSummaryMetric {
  label: string
  value: string
  /** 变化数值，与 trend 同时存在时显示箭头与数字 */
  change?: number
  trend?: 'up' | 'down'
}

/** 收入与成本趋势图 */
export interface CockpitRevenueCostTrend {
  dates: string[]
  revenue: number[]
  cost: number[]
}

/** 渠道 ROI&安装量表格行：近7日为折线图数据 */
export interface CockpitChannelRoiInstallItem {
  channel: string
  spend: number
  installs: number
  cpi: number
  /** 近7日趋势，用于最后一列迷你折线图 */
  trend: number[]
}

/** 渠道 ROI&安装量接口：单日数据（list 中每个元素，接口可能返回 null） */
export interface CockpitChannelRoiInstallDayItem {
  cost?: number | null
  cpl?: number | null
  install?: number | null
}

/** 渠道 ROI&安装量接口：单渠道（data 数组中每个元素，list 为近 7 日数据） */
export interface CockpitChannelRoiInstallApiItem {
  channel: string
  list: CockpitChannelRoiInstallDayItem[]
}

/** 渠道 ROI&安装量接口响应（/api/v1/datacenter/analysis/cockpit/installAndRoiOfChannel） */
export type CockpitChannelRoiInstallResponse = CockpitChannelRoiInstallApiItem[]

/** 用户质量仪表盘单项 */
export interface CockpitUserQualityItem {
  key: string
  label: string
  value: string
  status: string
  statusClass: 'good' | 'avg' | 'high'
  /** 仪表盘数值 0-100，用于图表 */
  gaugeValue: number
}

/** 消耗节奏监控接口：单条（proxy/self 元素结构相同） */
export interface CockpitConsumptionRhythmItem {
  channel: string
  status: string
  total: number
  used: number
}

/** 消耗节奏监控接口响应（/api/v1/datacenter/analysis/cockpit/consumptionRhythmMonitoring） */
export interface CockpitConsumptionRhythmResponse {
  proxy: CockpitConsumptionRhythmItem[]
  self: CockpitConsumptionRhythmItem[]
}

/** 消耗节奏监控单项（组件展示用） */
export interface CockpitSpendPaceItem {
  name: string
  current: number
  budget: number
  percent: number
  status: string
  tagType: 'success' | 'warning' | 'danger'
  /** 进度条颜色，可选，不传时可由 tagType 推导 */
  color?: string
  /** 平台标识，用于展示图标：google | facebook | tiktok | mintefral | kwai | newsbreak 等 */
  platform?: string
  /** 是否归入「代投」区块 */
  section?: 'default' | 'managed'
}

/** 业务分布地图：国家数据（nameEn 需与 GeoJSON 一致） */
export interface CockpitMapCountry {
  nameEn: string
  name: string
  revenue: number
  spend: number
  user: number
  trend: string
  color?: string
  /** 国家 ISO 3166-1 alpha-2 代码（可选，用于悬浮显示国旗） */
  code?: string
  /** 新增用户（可选，用于悬浮详情） */
  newUser?: number
  newUserTrend?: string
  /** 广告支出变化（可选，用于悬浮 tooltip 消耗） */
  spendTrend?: string
  /** 活跃用户数量变化（可选，用于悬浮 tooltip 用户） */
  userTrend?: string
  /** eCPM（可选） */
  ecpm?: number
  ecpmTrend?: string
}

/** 地图图例项 */
export interface CockpitMapLegendItem {
  name: string
  value: string
  trend: string
  color: string
}

/** 业务分布地图接口：last/now 周期内单指标 */
export interface CockpitBusinessMapPeriodItem {
  dAdRevenue: number
  dCost: number
  eCPM: number
  nActiveUserCount: number
  nNewUserCount: number
}

/** 业务分布地图接口：后端返回单项（与 mock mapCountries 转换用） */
export interface CockpitBusinessMapApiItem {
  country: string
  dAdRevenueChange?: number
  dCostChange?: number
  eCPMChange?: number
  nActiveUserCountChange?: number
  nNewUserCountChange?: number
  last: CockpitBusinessMapPeriodItem
  now: CockpitBusinessMapPeriodItem
}

/** Top3 接口：收入应用单项（app 数组元素） */
export interface CockpitTop3AppItem {
  sAppName: string
  last: { dAdRevenue: number; roas: number }
  now: { dAdRevenue: number; roas: number }
}

/** Top3 接口：差评产品单项（badApp 数组元素） */
export interface CockpitTop3BadAppItem {
  sAppName: string
  cplChange: number
  dauChange: number
  roiChange: number
  last: { cpl: number; dau: number; roi: number; note: string }
  now: { cpl: number; dau: number; roi: number }
}

/** Top3 接口：用户增长单项（user 数组元素） */
export interface CockpitTop3UserItem {
  sAppName: string
  dauChange: number
  last: { dau: number }
  now: { dau: number }
}

/** Top3 接口响应（/api/v1/datacenter/analysis/cockpit/top3） */
export interface CockpitTop3Response {
  app: CockpitTop3AppItem[]
  badApp: CockpitTop3BadAppItem[]
  user: CockpitTop3UserItem[]
}

/** Top3 收入应用（组件展示用） */
export interface CockpitTopRevenueItem {
  name: string
  /** 收入金额展示，如 '$580K' */
  revenue?: string
  /** 收入趋势百分比，如 '+8%'、'+5%' */
  trendPercent?: string
  /** 兼容旧字段 */
  roas?: string
}

/** Top3 消耗渠道（保留兼容） */
export interface CockpitTopSpendItem {
  name: string
  roi: string
}

/** Top3 差评产品 */
export interface CockpitTopBadReviewItem {
  name: string
  /** 差评原因标签，如 '变现下降18%'、'安装成本过高'、'用户流失' */
  reasonTag: string
  /** 指标文案，如 'DAU ↓ 12%'、'CPI ↑ 23%'、'留存 ↓ 15%' */
  metric: string
  /** 指标趋势：上升/下降，用于箭头颜色 */
  trend: 'up' | 'down'
}

/** Top3 用户增长 */
export interface CockpitTopUserItem {
  name: string
  /** 增长数值展示，如 '+8,200'、'+6,200' */
  growth?: string
  /** 增长趋势百分比，如 '+8%'、'+5%' */
  trendPercent?: string
  /** 兼容旧字段 */
  dau?: string
}

/** 智能预警单项 */
export interface CockpitSmartAlertItem {
  type: 'risk' | 'warning' | 'growth'
  msg: string
}

/** 收入 Top5 应用 */
export interface CockpitTop5AppItem {
  name: string
  revenue: string
  roas: string
}

/** 近7日收入结构流向 - 桑基图节点 */
export interface CockpitRevenueStructureNode {
  name: string
  depth?: number
  value?: number
  /** 节点内显示的金额文案，如 '$41,353'、'$1.03M' */
  valueDisplay?: string
  /** 节点内显示的占比，如 '89.5%' */
  percent?: string
  /** 图标：Unicode 字符（如 emoji、图标字体）或简单符号 */
  icon?: string
  /** 节点内图标/图片 URL，显示在文字上方或左侧 */
  iconImage?: string
  /** 国家 ISO 3166-1 alpha-2 代码（小写），用于显示 flag-icons 国旗，如 'us'、'jp' */
  code?: string
  label?: { formatter?: string }
  itemStyle?: { color?: string; borderRadius?: number }
}

/** 近7日收入结构流向 - 桑基图连线 */
export interface CockpitRevenueStructureLink {
  source: string
  target: string
  value: number
}

/** 近7日收入结构流向 - 底部洞察项 */
export interface CockpitRevenueStructureInsight {
  color: string
  text: string
}

/** 近7日收入结构流向（桑基图 + 洞察） */
export interface CockpitRevenueStructureFlow {
  nodes: CockpitRevenueStructureNode[]
  links: CockpitRevenueStructureLink[]
  insights: CockpitRevenueStructureInsight[]
}

/** Top10 Campaign 行 */
export interface CockpitTop10CampaignItem {
  campaign: string
  channel: string
  spend: string
  revenue: string
  roi: string
}

/** 驾驶舱全量数据（与后端 /api/cockpit/overview 返回结构对齐） */
export interface CockpitOverview {
  kpi: CockpitKpiCard[]
  /** 警示模块左侧：运营摘要指标（DNU、自然量、买量应用等） */
  alertSummaryMetrics?: CockpitAlertSummaryMetric[]
  alertBanners: CockpitAlertBanner[]
  revenueCostTrend: CockpitRevenueCostTrend
  /** 渠道 ROI&安装量表格数据 */
  channelRoiInstall?: CockpitChannelRoiInstallItem[]
  userQuality: CockpitUserQualityItem[]
  spendPace: CockpitSpendPaceItem[]
  mapCountries: CockpitMapCountry[]
  mapLegend: CockpitMapLegendItem[]
  topRevenue: CockpitTopRevenueItem[]
  topSpend: CockpitTopSpendItem[]
  /** Top3 差评产品（差评原因 + 指标趋势） */
  topBadReview?: CockpitTopBadReviewItem[]
  topUser: CockpitTopUserItem[]
  smartAlerts: CockpitSmartAlertItem[]
  top5Apps: CockpitTop5AppItem[]
  /** 近7日收入结构流向（桑基图） */
  revenueStructureFlow?: CockpitRevenueStructureFlow
  top10Campaigns: CockpitTop10CampaignItem[]
}
