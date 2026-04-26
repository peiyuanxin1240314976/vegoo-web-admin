import type {
  AgencyAnalysisMockPayload,
  AgencyAnalysisCharts,
  AgencyAnalysisAvailableSourceItem,
  AgencyAnalysisFilterOptionsPayload,
  AgencySubTabAccountSummaryPayload,
  AgencySubTabAccountSummaryRow,
  AgencySubTabRecentSummaryPayload,
  AgencySubTabRecentSummaryRow,
  AgencySubTabKpiPayload,
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
    label: '代投买量用户数',
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
        id: 'c1',
        appId: 'com.vegoo.phonetracker2',
        appName: 'PhoneTracker2_US_Facebook_001',
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
        id: 'c-g1-2',
        appId: 'com.vegoo.phonetracker2',
        appName: 'PhoneTracker2_US_Facebook_002',
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
        id: 'c2',
        appId: 'com.vegoo.phonetracker2',
        appName: 'PhoneTracker2_CA_TikTok_001',
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
        id: 'c3',
        appId: 'com.vegoo.spyapp',
        appName: 'SpyApp_JP_Meta_001',
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
    appId: 'com.vegoo.phonetracker2',
    appName: 'PhoneTracker2_US_Facebook_001',
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
    appId: 'com.vegoo.phonetracker2',
    appName: 'PhoneTracker2_CA_TikTok_001',
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
    appId: 'com.vegoo.spyapp',
    appName: 'SpyApp_JP_Meta_001',
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

const FILTER_OPTIONS: AgencyAnalysisFilterOptionsPayload = {
  appOptions: [
    { label: '全部应用', value: 'all' },
    { label: 'Solitaire Classic', value: 'app_solitaire_classic' },
    { label: 'Mahjong Master', value: 'app_mahjong_master' }
  ],
  agencyOptions: [
    { label: '全部代投方', value: 'all' },
    { label: 'GatherOne', value: 'agency_gatherone' },
    { label: 'BluePeak', value: 'agency_bluepeak' }
  ],
  sourceOptions: [
    { label: '全部广告平台', value: 'all' },
    { label: 'Google', value: '1' },
    { label: 'Facebook', value: '2' },
    { label: 'Unity', value: '3' },
    { label: 'AppLovin', value: '4' }
  ]
}

export async function mockFetchAgencyAnalysisFilterOptions(): Promise<AgencyAnalysisFilterOptionsPayload> {
  return { ...FILTER_OPTIONS }
}

export async function mockFetchAgencyAnalysisAvailableSources(): Promise<
  AgencyAnalysisAvailableSourceItem[]
> {
  return FILTER_OPTIONS.agencyOptions
    .filter((item) => item.value !== 'all')
    .map((item) => ({ ...item }))
}

export async function mockFetchAgencyOverview(): Promise<{ kpiCards: KpiCardItem[] }> {
  return { kpiCards: [...KPI_CARDS] }
}

export async function mockFetchAgencyAgencySummary(): Promise<{
  agencies: AgencyRow[]
  agencyDetailMap: Record<string, AgencyExpandData>
}> {
  return { agencies: [...AGENCIES], agencyDetailMap: { ...AGENCY_DETAIL_MAP } }
}

export async function mockFetchAgencyCampaignTable(): Promise<{ campaigns: CampaignRow[] }> {
  return { campaigns: [...CAMPAIGNS] }
}

export async function mockFetchAgencyDailyComparison(): Promise<{ dailyRows: DailyRow[] }> {
  return { dailyRows: [...DAILY_ROWS] }
}

export async function mockFetchAgencyDonutSpendShare(): Promise<{
  donut: AgencyAnalysisCharts['donut']
}> {
  return { donut: [...CHARTS.donut] }
}

export async function mockFetchAgencyChannelDistribution(): Promise<{
  categories: string[]
  series: AgencyAnalysisCharts['channelDistribution']['series']
}> {
  return {
    categories: [...CHARTS.channelDistribution.categories],
    series: CHARTS.channelDistribution.series.map((s) => ({ ...s, values: [...s.values] }))
  }
}

export async function mockFetchAgencyCountryTop8(): Promise<{
  countryTop8: AgencyAnalysisCharts['countryTop8']
}> {
  return { countryTop8: [...CHARTS.countryTop8] }
}

export async function mockFetchAgencySpendTrend30d(): Promise<
  AgencyAnalysisCharts['spendTrend30d']
> {
  return {
    dates: [...CHARTS.spendTrend30d.dates],
    series: CHARTS.spendTrend30d.series.map((s) => ({ ...s, values: [...s.values] }))
  }
}

type AgencySubTabMockKey = 'gatherone' | 'kuainiao' | 'chuhai'

type AgencySubTabMockQuery = {
  /** 兼容前端入参：后端动态返回的 tab key */
  agencyTab: AgencySubTabMockKey | string
  /** YYYY-MM-DD */
  date?: string
  startDate?: string
  endDate?: string
}

function ymdToUtcDate(ymd: string): Date {
  const [y, m, d] = ymd.split('-').map((x) => parseInt(x, 10))
  return new Date(Date.UTC(y, m - 1, d))
}

function inclusiveDaysBetweenYmd(start: string, end: string): number {
  const a = ymdToUtcDate(start).getTime()
  const b = ymdToUtcDate(end).getTime()
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 1
  const diff = Math.round((b - a) / 86400000)
  return Math.max(1, diff + 1)
}

function parseMoneyToNumber(s: string): number {
  const n = Number(String(s).replace(/[^0-9.]/g, ''))
  return Number.isFinite(n) ? n : 0
}

function formatUsd(n: number): string {
  const rounded = Math.round(n)
  return `$${rounded.toLocaleString('en-US')}`
}

function bumpRoiPctString(s: string, add: number): string {
  const n = Number(String(s).replace(/[^0-9.]/g, ''))
  if (!Number.isFinite(n)) return s
  const next = Math.max(0, Math.min(300, Math.round(n + add)))
  return `${next}%`
}

function ymdToCnLabel(ymd: string | undefined): string {
  if (!ymd || ymd.length < 10) return '当日'
  const m = Number(ymd.slice(5, 7))
  const d = Number(ymd.slice(8, 10))
  if (!Number.isFinite(m) || !Number.isFinite(d)) return ymd
  return `${m}月${d}日`
}

function subTabMockVariant(tab: AgencySubTabMockKey | string) {
  switch (tab) {
    case 'kuainiao':
      return {
        last7: {
          spend: '$2,860',
          roi1: '118%',
          installs: '41208',
          appCount: '2',
          accountCount: '4',
          campaignCount: '11',
          adsetCount: '18',
          countryCount: '9',
          days: '7'
        },
        day: {
          spend: '$412',
          roi1: '141%',
          installs: '6021',
          appCount: '2',
          accountCount: '2',
          campaignCount: '11',
          adsetCount: '18',
          countryCount: '9',
          days: '1'
        },
        recent: [
          {
            app: 'PhoneCleaner',
            platform: 'iOS',
            source: 'TikTok',
            accountId: '7519055062153461100',
            accountName: 'KN_TK_PC1_US_01',
            spend: '$520',
            budget: '$480',
            cpa: '-',
            cpi: '0.11',
            installs: '4720',
            roiTrend: ['112%', '108%', '121%']
          },
          {
            app: 'PhoneCleaner',
            platform: 'iOS',
            source: 'TikTok',
            accountId: '7519055062153461101',
            accountName: 'KN_TK_PC1_US_02',
            spend: '$188',
            budget: '$160',
            cpa: '-',
            cpi: '0.08',
            installs: '2350',
            roiTrend: ['104%', '99%', '115%']
          },
          {
            app: 'PhoneCleaner',
            platform: 'iOS',
            source: 'TikTok',
            accountId: '7519055062153461102',
            accountName: 'KN_TK_PC1_US_03',
            spend: '$96',
            budget: '$90',
            cpa: '-',
            cpi: '0.06',
            installs: '1600',
            roiTrend: ['96%', '101%', '109%']
          }
        ] as const,
        account: [
          {
            app: 'PhoneCleaner',
            platform: 'iOS',
            source: 'TikTok',
            accountId: '7519055062153461100',
            accountName: 'KN_TK_PC1_US_01',
            spend: '$6120',
            roi1: '116%',
            cpa: '-',
            cpi: '0.10',
            installs: '61200'
          },
          {
            app: 'PhoneCleaner',
            platform: 'iOS',
            source: 'TikTok',
            accountId: '7519055062153461101',
            accountName: 'KN_TK_PC1_US_02',
            spend: '$980',
            roi1: '109%',
            cpa: '-',
            cpi: '0.07',
            installs: '14000'
          },
          {
            app: 'PhoneCleaner',
            platform: 'iOS',
            source: 'TikTok',
            accountId: '7519055062153461102',
            accountName: 'KN_TK_PC1_US_03',
            spend: '$240',
            roi1: '103%',
            cpa: '-',
            cpi: '0.05',
            installs: '4800'
          }
        ] as const
      }
    case 'chuhai':
      return {
        last7: {
          spend: '$3,420',
          roi1: '96%',
          installs: '28840',
          appCount: '3',
          accountCount: '6',
          campaignCount: '14',
          adsetCount: '22',
          countryCount: '18',
          days: '7'
        },
        day: {
          spend: '$510',
          roi1: '88%',
          installs: '4310',
          appCount: '3',
          accountCount: '3',
          campaignCount: '14',
          adsetCount: '22',
          countryCount: '18',
          days: '1'
        },
        recent: [
          {
            app: 'SpyApp',
            platform: '安卓',
            source: 'Google',
            accountId: '8822113344556677',
            accountName: 'CH_GO_SA1_EU_01',
            spend: '$640',
            budget: '$600',
            cpa: '-',
            cpi: '0.14',
            installs: '4580',
            roiTrend: ['92%', '89%', '95%']
          },
          {
            app: 'SpyApp',
            platform: '安卓',
            source: 'Google',
            accountId: '8822113344556678',
            accountName: 'CH_GO_SA1_EU_02',
            spend: '$210',
            budget: '$190',
            cpa: '-',
            cpi: '0.09',
            installs: '2330',
            roiTrend: ['88%', '90%', '93%']
          },
          {
            app: 'SpyApp',
            platform: '安卓',
            source: 'Google',
            accountId: '8822113344556679',
            accountName: 'CH_GO_SA1_EU_03',
            spend: '$120',
            budget: '$110',
            cpa: '-',
            cpi: '0.07',
            installs: '1710',
            roiTrend: ['84%', '86%', '91%']
          }
        ] as const,
        account: [
          {
            app: 'SpyApp',
            platform: '安卓',
            source: 'Google',
            accountId: '8822113344556677',
            accountName: 'CH_GO_SA1_EU_01',
            spend: '$7420',
            roi1: '94%',
            cpa: '-',
            cpi: '0.13',
            installs: '57100'
          },
          {
            app: 'SpyApp',
            platform: '安卓',
            source: 'Google',
            accountId: '8822113344556678',
            accountName: 'CH_GO_SA1_EU_02',
            spend: '$1320',
            roi1: '90%',
            cpa: '-',
            cpi: '0.08',
            installs: '16500'
          },
          {
            app: 'SpyApp',
            platform: '安卓',
            source: 'Google',
            accountId: '8822113344556679',
            accountName: 'CH_GO_SA1_EU_03',
            spend: '$410',
            roi1: '86%',
            cpa: '-',
            cpi: '0.06',
            installs: '6830'
          }
        ] as const
      }
    case 'gatherone':
    default:
      return {
        last7: {
          spend: '$1,945',
          roi1: '102%',
          installs: '31984',
          appCount: '1',
          accountCount: '2',
          campaignCount: '8',
          adsetCount: '15',
          countryCount: '21',
          days: '7'
        },
        day: {
          spend: '$288',
          roi1: '130%',
          installs: '4719',
          appCount: '1',
          accountCount: '1',
          campaignCount: '8',
          adsetCount: '15',
          countryCount: '21',
          days: '1'
        },
        recent: [
          {
            app: 'FileRecovery',
            platform: '安卓',
            source: 'Facebook',
            accountId: '1196169169136013',
            accountName: 'GO_FB_FR1_ZL_PG03',
            spend: '$218',
            budget: '$196',
            cpa: '-',
            cpi: '0.09',
            installs: '2553',
            roiTrend: ['101%', '95%', '131%']
          },
          {
            app: 'FileRecovery',
            platform: '安卓',
            source: 'Facebook',
            accountId: '1643261666838590',
            accountName: 'GO_FB_FR1_ZL_PG04',
            spend: '$70.4',
            budget: '$56.0',
            cpa: '-',
            cpi: '0.03',
            installs: '2166',
            roiTrend: ['98%', '102%', '128%']
          },
          {
            app: 'FileRecovery',
            platform: '安卓',
            source: 'Facebook',
            accountId: '1196169169136014',
            accountName: 'GO_FB_FR1_ZL_PG05',
            spend: '$42.1',
            budget: '$40.0',
            cpa: '-',
            cpi: '0.02',
            installs: '2105',
            roiTrend: ['93%', '97%', '105%']
          }
        ] as const,
        account: [
          {
            app: 'FileRecovery',
            platform: '安卓',
            source: 'Facebook',
            accountId: '1196169169136013',
            accountName: 'GO_FB_FR1_ZL_PG03',
            spend: '$2259',
            roi1: '101%',
            cpa: '-',
            cpi: '0.09',
            installs: '26526'
          },
          {
            app: 'FileRecovery',
            platform: '安卓',
            source: 'Facebook',
            accountId: '1643261666838590',
            accountName: 'GO_FB_FR1_ZL_PG04',
            spend: '$586',
            roi1: '100%',
            cpa: '-',
            cpi: '0.03',
            installs: '21926'
          },
          {
            app: 'FileRecovery',
            platform: '安卓',
            source: 'Facebook',
            accountId: '1196169169136014',
            accountName: 'GO_FB_FR1_ZL_PG05',
            spend: '$312',
            roi1: '97%',
            cpa: '-',
            cpi: '0.02',
            installs: '15600'
          }
        ] as const
      }
  }
}

export async function mockFetchAgencySubTabKpiLast7(
  q: AgencySubTabMockQuery
): Promise<AgencySubTabKpiPayload> {
  const v = subTabMockVariant(q.agencyTab)
  return {
    periodLabel: '近7天',
    metrics: [
      { key: 'spend', label: '广告支出', value: v.last7.spend },
      { key: 'roi1', label: '首日ROI', value: v.last7.roi1 },
      { key: 'cpa', label: 'CPA', value: '-' },
      { key: 'installs', label: '代投买量用户数', value: v.last7.installs },
      { key: 'appCount', label: '在投应用数', value: v.last7.appCount },
      { key: 'accountCount', label: '广告账户数', value: v.last7.accountCount },
      { key: 'campaignCount', label: '广告系列数', value: v.last7.campaignCount },
      { key: 'adsetCount', label: '广告组数', value: v.last7.adsetCount },
      { key: 'countryCount', label: '投放国家数', value: v.last7.countryCount },
      { key: 'days', label: '投放天数', value: v.last7.days }
    ]
  }
}

export async function mockFetchAgencySubTabKpiDay(
  q: AgencySubTabMockQuery
): Promise<AgencySubTabKpiPayload> {
  const v = subTabMockVariant(q.agencyTab)
  return {
    periodLabel: ymdToCnLabel(q.date),
    metrics: [
      { key: 'spend', label: '广告支出', value: v.day.spend },
      { key: 'roi1', label: '首日ROI', value: v.day.roi1 },
      { key: 'cpa', label: 'CPA', value: '-' },
      { key: 'installs', label: '代投买量用户数', value: v.day.installs },
      { key: 'appCount', label: '在投应用数', value: v.day.appCount },
      { key: 'accountCount', label: '广告账户数', value: v.day.accountCount },
      { key: 'campaignCount', label: '广告系列数', value: v.day.campaignCount },
      { key: 'adsetCount', label: '广告组数', value: v.day.adsetCount },
      { key: 'countryCount', label: '投放国家数', value: v.day.countryCount },
      { key: 'days', label: '投放天数', value: v.day.days }
    ]
  }
}

export async function mockFetchAgencySubTabRecentSummary(
  q: AgencySubTabMockQuery
): Promise<AgencySubTabRecentSummaryPayload> {
  const v = subTabMockVariant(q.agencyTab)
  const start = q.startDate ?? ''
  const end = q.endDate ?? ''
  const days = start && end ? inclusiveDaysBetweenYmd(start, end) : 3
  const tag = start && end ? `${start}~${end}` : 'range'

  const rows: AgencySubTabRecentSummaryRow[] = v.recent.map((r, idx) => {
    const baseSpend = parseMoneyToNumber(r.spend)
    const baseBudget = parseMoneyToNumber(r.budget)
    const mult = 0.9 + Math.min(1.2, days / 7) + idx * 0.02
    const spend = formatUsd(baseSpend * mult)
    const budget = formatUsd(baseBudget * mult)
    const installsNum = Number(String(r.installs).replace(/[^0-9]/g, '')) || 0
    const installs = String(Math.max(0, Math.round(installsNum * mult)))
    return {
      ...r,
      accountName: `${r.accountName}（${tag}）`,
      spend,
      budget,
      installs,
      roiTrend: r.roiTrend.map((x) => bumpRoiPctString(x, (days % 3) - 1 + idx))
    }
  })

  return { rows }
}

export async function mockFetchAgencySubTabAccountSummary(
  q: AgencySubTabMockQuery
): Promise<AgencySubTabAccountSummaryPayload> {
  const v = subTabMockVariant(q.agencyTab)
  const start = q.startDate ?? ''
  const end = q.endDate ?? ''
  const days = start && end ? inclusiveDaysBetweenYmd(start, end) : 7
  const tag = start && end ? `${start}~${end}` : 'range'

  const rows: AgencySubTabAccountSummaryRow[] = v.account.map((r, idx) => {
    const baseSpend = parseMoneyToNumber(r.spend)
    const mult = 0.85 + Math.min(1.35, days / 14) + idx * 0.03
    const spend = formatUsd(baseSpend * mult)
    const installsNum = Number(String(r.installs).replace(/[^0-9]/g, '')) || 0
    const installs = String(Math.max(0, Math.round(installsNum * mult)))
    return {
      ...r,
      accountName: `${r.accountName}（${tag}）`,
      spend,
      roi1: bumpRoiPctString(r.roi1, (days % 5) - 2 + idx),
      installs
    }
  })

  return { rows }
}
