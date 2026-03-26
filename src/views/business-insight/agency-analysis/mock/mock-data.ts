import type {
  AgencyAnalysisMockPayload,
  AgencyAnalysisCharts,
  AgencyExpandData,
  AgencyRow,
  CampaignRow,
  DailyRow,
  KpiCardItem
} from '../types'

const KPI_CARDS: KpiCardItem[] = [
  {
    label: '代投总消耗',
    value: '$284,520',
    changeText: '↑12.3% vs昨日',
    changeUp: true,
    highlighted: true,
    sparkPoints: '0,32 12,28 24,25 36,22 48,20 60,16 72,14 84,10 96,8',
    sparkColor: '#00d4b4'
  },
  {
    label: '代投安装数',
    value: '8,642',
    changeText: '↑8.7%',
    changeUp: true,
    highlighted: true,
    sparkPoints: '0,30 12,27 24,25 36,22 48,18 60,16 72,13 84,10 96,8',
    sparkColor: '#00d4b4'
  },
  {
    label: '平均CPI',
    value: '$2.41',
    changeText: '↓3.2%',
    changeUp: false,
    highlighted: true,
    sparkPoints: '0,10 12,12 24,14 36,18 48,20 60,22 72,25 84,28 96,30',
    sparkColor: '#ef4444'
  },
  { label: '代投应用数', value: '6个', changeText: '', changeUp: null, highlighted: false },
  { label: '代投渠道数', value: '4个', changeText: '', changeUp: null, highlighted: false },
  { label: '代投方数量', value: '3个', changeText: '', changeUp: null, highlighted: false }
]

const AGENCIES: AgencyRow[] = [
  {
    id: 'gatherone',
    name: 'GatherOne',
    appCount: 3,
    channelCount: 2,
    spend: 198420,
    installs: 5842,
    cpi: 2.38,
    cpa: 33.96,
    roi: 96,
    budgetRate: 92,
    status: 'normal'
  },
  {
    id: 'kuainiao',
    name: '快鸟',
    nameColor: '#00d4b4',
    appCount: 2,
    channelCount: 1,
    spend: 52680,
    installs: 1845,
    cpi: 2.35,
    cpa: 28.56,
    roi: 103,
    budgetRate: 88,
    status: 'normal'
  },
  {
    id: 'xingtumedia',
    name: '星图传媒',
    nameColor: '#f59e0b',
    hasWarning: true,
    appCount: 1,
    channelCount: 1,
    spend: 33420,
    installs: 955,
    cpi: 2.51,
    cpa: 35.02,
    roi: 88,
    budgetRate: 76,
    status: 'low'
  }
]

const AGENCY_DETAIL_MAP: Record<string, AgencyExpandData> = {
  gatherone: {
    appCount: '10/3个',
    channelCount: '2/2个',
    totalSpend: 198420,
    totalInstalls: 5842,
    roi: 96,
    roiTarget: 90,
    weeklySpend: 1241580,
    weeklyRoi: 97,
    weeklyInstalls: 36421,
    weeklyApps: 3,
    weeklyAccounts: 8,
    weeklyCampaigns: 42,
    weeklyCountries: 12,
    weeklyDays: 7,
    accounts: [
      {
        app: 'PhoneTracker2',
        platform: '安卓',
        adPlatform: 'Facebook',
        accountId: '7519055062153461761',
        accountName: 'panda-VEGOO-PT-02',
        spend: '$502',
        roi: 104,
        cpa: '--',
        cpi: '0.19',
        installs: 2649
      }
    ],
    campaigns: [
      {
        name: 'PT_761_VO_WW_IL_0228',
        budget: 200,
        spend: '$33.2',
        cpa: '--',
        cpi: '0.21',
        installs: 173,
        roi34: 116,
        roi33: 121,
        roi32: 93
      },
      {
        name: 'PT_761_VO_WW_IL_0208_2_03',
        budget: 300,
        spend: '$18.9',
        cpa: '--',
        cpi: '0.14',
        installs: 132,
        roi34: 148,
        roi33: 106,
        roi32: 95
      }
    ]
  },
  kuainiao: {
    appCount: '5/2个',
    channelCount: '1/1个',
    totalSpend: 52680,
    totalInstalls: 1845,
    roi: 103,
    roiTarget: 90,
    weeklySpend: 284500,
    weeklyRoi: 103,
    weeklyInstalls: 12840,
    weeklyApps: 2,
    weeklyAccounts: 3,
    weeklyCampaigns: 18,
    weeklyCountries: 5,
    weeklyDays: 7,
    accounts: [
      {
        app: 'PhoneTracker2',
        platform: '安卓',
        adPlatform: 'TikTok',
        accountId: '7519055062153461100',
        accountName: 'kuainiao-TK-PT-01',
        spend: '$320',
        roi: 105,
        cpa: '--',
        cpi: '0.20',
        installs: 1124
      }
    ],
    campaigns: [
      {
        name: 'KN_TK_WW_0228_01',
        budget: 300,
        spend: '$32.5',
        cpa: '--',
        cpi: '0.20',
        installs: 164,
        roi34: 108,
        roi33: 112,
        roi32: 98
      }
    ]
  },
  xingtumedia: {
    appCount: '3/1个',
    channelCount: '1/1个',
    totalSpend: 33420,
    totalInstalls: 955,
    roi: 88,
    roiTarget: 90,
    weeklySpend: 196400,
    weeklyRoi: 85,
    weeklyInstalls: 6820,
    weeklyApps: 1,
    weeklyAccounts: 2,
    weeklyCampaigns: 12,
    weeklyCountries: 3,
    weeklyDays: 7,
    accounts: [
      {
        app: 'SpyApp',
        platform: '安卓',
        adPlatform: 'Meta',
        accountId: '7519055062153461300',
        accountName: 'xingtumedia-Meta-01',
        spend: '$210',
        roi: 88,
        cpa: '--',
        cpi: '0.25',
        installs: 955
      }
    ],
    campaigns: [
      {
        name: 'XTM_Meta_WW_0228_01',
        budget: 500,
        spend: '$33.4',
        cpa: '--',
        cpi: '0.25',
        installs: 136,
        roi34: 88,
        roi33: 82,
        roi32: 90
      }
    ]
  }
}

const CAMPAIGNS: CampaignRow[] = [
  {
    id: 'c1',
    agency: 'GatherOne',
    name: 'PhoneTracker2_US_Facebook_001',
    channel: 'Facebook',
    app: 'PhoneTracker2',
    spend: 68420,
    installs: 1842,
    cpi: 2.36,
    ctr: 3.8,
    cvr: 5.2,
    ipm: 18.4,
    budget: 75000,
    execRate: 91,
    trend: 'up'
  },
  {
    id: 'c2',
    agency: '快鸟',
    agencyColor: '#00d4b4',
    name: 'PhoneTracker2_CA_TikTok_001',
    channel: 'TikTok',
    app: 'PhoneTracker2',
    spend: 32480,
    installs: 1124,
    cpi: 2.39,
    ctr: 2.9,
    cvr: 4.5,
    ipm: 15.6,
    budget: 38000,
    execRate: 85,
    trend: 'up'
  },
  {
    id: 'c3',
    agency: '星图传媒',
    agencyColor: '#f59e0b',
    name: 'SpyApp_JP_Meta_001',
    channel: 'Meta',
    app: 'SpyApp',
    spend: 33420,
    installs: 955,
    cpi: 2.51,
    ctr: 2.4,
    cvr: 3.9,
    ipm: 12.8,
    budget: 44000,
    execRate: 76,
    trend: 'down'
  }
]

const DAILY_ROWS: DailyRow[] = [
  {
    date: '2026-03-07',
    agency: 'GatherOne',
    spend: 198420,
    installs: 5842,
    cpi: 2.38,
    cpa: 33.96,
    spendChange: 14.3,
    installsChange: 11.2
  },
  {
    date: '2026-03-07',
    agency: '快鸟',
    agencyColor: '#00d4b4',
    spend: 52680,
    installs: 1845,
    cpi: 2.35,
    cpa: 28.56,
    spendChange: 24.0,
    installsChange: 18.6
  },
  {
    date: '2026-03-07',
    agency: '星图传媒',
    agencyColor: '#f59e0b',
    spend: 33420,
    installs: 955,
    cpi: 2.51,
    cpa: 35.02,
    spendChange: 18.2,
    installsChange: 12.4
  }
]

const CHARTS: AgencyAnalysisCharts = {
  donut: [
    { name: 'GatherOne', value: 198420, color: '#3b82f6' },
    { name: '快鸟', value: 52680, color: '#00d4b4' },
    { name: '星图传媒', value: 33420, color: '#f59e0b' }
  ],
  channelDistribution: {
    categories: ['Facebook', 'Google', 'TikTok', 'Meta'],
    series: [
      { name: 'GatherOne', values: [159000, 39000, 0, 0], color: '#3b82f6' },
      { name: '快鸟', values: [0, 0, 52680, 0], color: '#00d4b4' },
      { name: '星图传媒', values: [0, 0, 0, 33420], color: '#f59e0b' }
    ]
  },
  countryTop8: [
    { s_country_code: 'FR', spend: 12580, sharePct: 4.4 },
    { s_country_code: 'DE', spend: 18420, sharePct: 6.5 },
    { s_country_code: 'JP', spend: 33420, sharePct: 11.8 },
    { s_country_code: 'IN', spend: 20200, sharePct: 7.1 },
    { s_country_code: 'AU', spend: 38650, sharePct: 13.6 },
    { s_country_code: 'CA', spend: 52680, sharePct: 18.5 },
    { s_country_code: 'UK', spend: 68180, sharePct: 24.0 },
    { s_country_code: 'US', spend: 98420, sharePct: 34.6 }
  ],
  spendTrend30d: {
    dates: ['Mar 06', 'Mar 07', 'Mar 08', 'Mar 09', 'Mar 10', 'Mar 11', 'Mar 12'],
    series: [
      {
        name: 'GatherOne',
        color: '#3b82f6',
        values: [120000, 140000, 160000, 175000, 185000, 195000, 198420]
      },
      {
        name: '快鸟',
        color: '#00d4b4',
        values: [28000, 32000, 38000, 42000, 46000, 50000, 52680]
      },
      {
        name: '星图传媒',
        color: '#f59e0b',
        values: [25000, 30000, 32000, 34000, 35000, 36000, 33420]
      }
    ]
  }
}

export async function mockFetchAgencyAnalysisData(): Promise<AgencyAnalysisMockPayload> {
  await new Promise((resolve) => setTimeout(resolve, 700))
  return {
    kpiCards: KPI_CARDS,
    agencies: AGENCIES,
    agencyDetailMap: AGENCY_DETAIL_MAP,
    campaigns: CAMPAIGNS,
    dailyRows: DAILY_ROWS,
    charts: CHARTS
  }
}
