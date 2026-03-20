/**
 * 我的广告页：与 mock 及后续接口对齐的页面类型（UI 展示结构）
 */

export type MyAdsStaffOption = {
  id: string
  name: string
}

export type MyAdsMetricStripItem = {
  label: string
  value: string
  sub: string
  subColor: string
  valueColor: string
}

export type MyAdsUserCardMock = {
  avatarLetter: string
  name: string
  role: string
  appsLine: string
}

export type MyAdsPageHeaderMock = {
  staffList: MyAdsStaffOption[]
  defaultStaffId: string
  dateRange: [string, string]
  userCard: MyAdsUserCardMock
  metrics: MyAdsMetricStripItem[]
}

/** 汇总 Tab：折线图（与 ECharts 一致，ROI 为百分比数值） */
export type MyAdsSummaryTrendMock = {
  days: string[]
  spend: number[]
  profit: number[]
  roiPct: number[]
}

/** 汇总 Tab：广告平台分布（饼图） */
export type MyAdsSourcePieItemMock = {
  value: number
  name: string
  color: string
}

/** 汇总 Tab：统计卡 */
export type MyAdsSummaryStatCardsMock = {
  spend: {
    main: string
    budget: string
    diff: string
    diffColor: string
    prevLine: string
    momLine: string
    momColor: string
    borderColor: string
    mainColor: string
  }
  agencyRatio: {
    main: string
    mainColor: string
    agency: string
    direct: string
    prevLine: string
    momLine: string
    momColor: string
    borderColor: string
  }
  roi: {
    main: string
    target: string
    overTarget: string
    prevLine: string
    momLine: string
    momColor: string
    borderColor: string
    mainColor: string
  }
  estProfit: {
    main: string
    minProfit: string
    margin: string
    borderColor: string
    mainColor: string
  }
}

export type MyAdsSummaryProgressRowMock = {
  name: string
  spend: string
  budget: string
  progress: number
  roi: string
  status: string
  statusType: 'ok' | 'warn' | 'inactive'
}

export type MyAdsSummaryAppBarMock = {
  label: string
  widthPct: number
  barColor: string
  pct: string
  amt: string
  roiText: string
  roiColor: string
}

export type MyAdsSummaryTabMock = {
  chartPieTitle: string
  pieCenterTitle: string
  pieCenterValue: string
  trend: MyAdsSummaryTrendMock
  sourcePie: MyAdsSourcePieItemMock[]
  statCards: MyAdsSummaryStatCardsMock
  appBars: MyAdsSummaryAppBarMock[]
  progressList: MyAdsSummaryProgressRowMock[]
}

export type MyAdsPlatformCampaignCardMock = {
  platform: string
  platformIcon: string
  status: 'active' | 'warn'
  spend: string
  budget: string
  roi: string
  roiTarget: string
  progress: number
  minSpend: string
  cpi: string
  warn?: string
}

export type MyAdsPlatformAppGroupMock = {
  name: string
  nameEn: string
  icon: string
  color: string
  totalSpend: string
  avgRoi: string
  platformCount: number
  campaigns: MyAdsPlatformCampaignCardMock[]
}

export type MyAdsPlatformFooterMock = {
  appCount: number
  campaignCount: number
  totalSpend: string
  overBudgetCount: number
  roiBelowTargetCount: number
  avgRoi: string
  estTotalProfit: string
  minTotalProfit: string
}

export type MyAdsPlatformTabMock = {
  appGroups: MyAdsPlatformAppGroupMock[]
  footer: MyAdsPlatformFooterMock
}

export type MyAdsCampaignRowMock = {
  id: string
  appIcon: string
  appName: string
  name: string
  platform: string
  platformIcon: string
  /** ISO 3166-1 alpha-2，如 US、GB；国旗由前端用 flag-icons 映射，接口不返回 emoji */
  s_country_code: string
  status: 'active' | 'inactive' | 'warn'
  spend: number
  budget: number
  calcSpend: number
  agencySpend: number
  roi: number | null
  minSpend: number
  estProfit: number | null
  minProfit: number | null
  cpi: number | null
  trend: 'up' | 'down' | 'flat' | 'none'
}

export type MyAdsMockBundle = {
  pageHeader: MyAdsPageHeaderMock
  summary: MyAdsSummaryTabMock
  platform: MyAdsPlatformTabMock
  campaignRows: MyAdsCampaignRowMock[]
}
