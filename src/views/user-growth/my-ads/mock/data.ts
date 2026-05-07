/**
 * 我的广告页 Mock 数据。接口就绪后可用同结构的请求结果替换。
 */
import type {
  MyAdsMockBundle,
  MyAdsPageHeaderMock,
  MyAdsSummaryTabMock,
  MyAdsPlatformTabMock,
  MyAdsCampaignRowMock
} from '../types'

const pageHeader: MyAdsPageHeaderMock = {
  staffList: [
    { id: '1', name: '张三' },
    { id: '2', name: '李四' },
    { id: '3', name: '王五' }
  ],
  defaultStaffId: '1',
  dateRange: ['2026-02-23', '2026-03-01'],
  userCard: {
    avatarLetter: '张',
    name: '张三',
    role: '高级优化师',
    appsLine: '负责应用：Weather5、BloodSugar2、PhoneTracker'
  },
  metrics: [
    {
      label: '广告支出',
      value: '$12,200',
      sub: '↑ 8.5%',
      subColor: '#10b981',
      valueColor: '#ffffff'
    },
    {
      label: '预算',
      value: '$11,480',
      sub: '差异 -$720',
      subColor: '#f97316',
      valueColor: '#f97316'
    },
    {
      label: '代投消耗',
      value: '$8,960',
      sub: '占比73.4%',
      subColor: '#9ca3af',
      valueColor: '#f59e0b'
    },
    {
      label: '首日ROI',
      value: '38.2%',
      sub: '目标 35% ↑',
      subColor: '#10b981',
      valueColor: '#f59e0b'
    },
    {
      label: '预估利润',
      value: '$4,660',
      sub: '利润率0.2%',
      subColor: '#9ca3af',
      valueColor: '#10b981'
    },
    {
      label: '最低利润',
      value: '$2,100',
      sub: '安全边界',
      subColor: '#9ca3af',
      valueColor: '#a78bfa'
    }
  ]
}

const summaryTab: MyAdsSummaryTabMock = {
  chartPieTitle: '各广告平台支出占比',
  pieCenterTitle: '总支出',
  pieCenterValue: '$12,200',
  trend: {
    days: ['2/23', '2/24', '2/25', '2/26', '2/27', '2/28', '3/1'],
    spend: [1650, 1720, 1580, 1890, 1760, 1840, 1760],
    profit: [620, 680, 590, 720, 680, 710, 660],
    roiPct: [36, 39, 35, 41, 38, 40, 38]
  },
  sourcePie: [
    { value: 5200, name: '谷歌', color: '#3b82f6' },
    { value: 3400, name: 'Meta', color: '#60a5fa' },
    { value: 1700, name: 'TikTok', color: '#10b981' },
    { value: 1220, name: 'ASA', color: '#f59e0b' },
    { value: 680, name: '其他', color: '#4b5563' }
  ],
  statCards: {
    spend: {
      main: '$12,200',
      budget: '$11,480',
      diff: '-$720',
      diffColor: '#f97316',
      prevLine: '上期 $11,250',
      momLine: '环比 +8.5%',
      momColor: '#10b981',
      borderColor: '#0d9488',
      mainColor: '#10b981'
    },
    agencyRatio: {
      main: '73.4%',
      mainColor: '#60a5fa',
      agency: '$8,960',
      direct: '$2,520',
      prevLine: '上期占比 71.3%',
      momLine: '环比 +2.1%',
      momColor: '#10b981',
      borderColor: '#2563eb'
    },
    roi: {
      main: '38.2%',
      target: '35.0%',
      overTarget: '+3.2%',
      prevLine: '上期 36.1%',
      momLine: '环比 +2.1pp',
      momColor: '#10b981',
      borderColor: '#d97706',
      mainColor: '#f59e0b'
    },
    estProfit: {
      main: '$4,660',
      minProfit: '$2,100',
      margin: '38.2%',
      borderColor: '#059669',
      mainColor: '#10b981'
    }
  },
  appBars: [
    {
      label: '天气预报',
      widthPct: 59,
      barColor: '#10b981',
      pct: '59%',
      amt: '$7,300',
      roiText: '首日ROI 39.2% ▲',
      roiColor: '#10b981'
    },
    {
      label: '血糖监测',
      widthPct: 26,
      barColor: '#60a5fa',
      pct: '26%',
      amt: '$3,200',
      roiText: '首日ROI 29.4% ▼',
      roiColor: '#ef4444'
    },
    {
      label: '手机追踪',
      widthPct: 15,
      barColor: '#a78bfa',
      pct: '15%',
      amt: '$1,700',
      roiText: '首日ROI 36.5% ▲',
      roiColor: '#10b981'
    }
  ],
  progressList: [
    {
      id: '6906353663222',
      name: 'PT_FB_639_ZZW_VO_BR_0128',
      platformIcon: 'f',
      spend: '2323.85',
      budget: '700.00',
      progress: 331.98,
      statusType: null,
      roi1: 36.31
    },
    {
      name: 'Weather5 US Google',
      spend: '$5,200',
      budget: '$6,500',
      progress: 80,
      roi: '41.2%',
      status: '正常',
      statusType: 'ok'
    },
    {
      name: 'Weather5 JP Meta',
      spend: '$2,100',
      budget: '$2,800',
      progress: 75,
      roi: '35.8%',
      status: '正常',
      statusType: 'ok'
    },
    {
      name: 'BloodSugar2 UK Google',
      spend: '$3,200',
      budget: '$3,500',
      progress: 91,
      roi: '29.4%',
      status: '超预算',
      statusType: 'warn'
    },
    {
      name: 'PhoneTracker CA TikTok',
      spend: '$1,700',
      budget: '$2,200',
      progress: 77,
      roi: '36.5%',
      status: '正常',
      statusType: 'ok'
    },
    {
      name: 'Weather5 AU Google',
      spend: '$0',
      budget: '$1,000',
      progress: 0,
      roi: '--',
      status: '未启动',
      statusType: 'inactive'
    }
  ]
}

const platformTab: MyAdsPlatformTabMock = {
  appGroups: [
    {
      name: '天气预报',
      nameEn: 'Weather5',
      icon: '🌤️',
      color: '#f59e0b',
      totalSpend: '$7,300',
      avgRoi: '39.2%',
      platformCount: 2,
      campaigns: [
        {
          platform: '谷歌广告',
          platformIcon: 'G',
          status: 'active',
          spend: '$5,200',
          budget: '$6,500',
          roi: '41.2%',
          roiTarget: '35%',
          progress: 80,
          minSpend: '$4,100',
          cpi: '$2.37'
        },
        {
          platform: 'Meta广告',
          platformIcon: 'f',
          status: 'active',
          spend: '$2,100',
          budget: '$2,800',
          roi: '35.8%',
          roiTarget: '35%',
          progress: 75,
          minSpend: '$1,680',
          cpi: '$2.38'
        }
      ]
    },
    {
      name: '血糖监测',
      nameEn: 'BloodSugar2',
      icon: '🩸',
      color: '#ef4444',
      totalSpend: '$4,090',
      avgRoi: '33.2%',
      platformCount: 2,
      campaigns: [
        {
          platform: '谷歌广告',
          platformIcon: 'G',
          status: 'warn',
          spend: '$3,200',
          budget: '$3,500',
          roi: '29.4%',
          roiTarget: '35%',
          progress: 91,
          minSpend: '$2,450',
          cpi: '$2.38',
          warn: 'ROI未达标，预估不盈利'
        },
        {
          platform: 'Meta广告',
          platformIcon: 'f',
          status: 'active',
          spend: '$890',
          budget: '$1,200',
          roi: '38.9%',
          roiTarget: '35%',
          progress: 74,
          minSpend: '$670',
          cpi: '$2.41'
        }
      ]
    },
    {
      name: '手机追踪',
      nameEn: 'PhoneTracker',
      icon: '📱',
      color: '#10b981',
      totalSpend: '$1,700',
      avgRoi: '36.5%',
      platformCount: 1,
      campaigns: [
        {
          platform: 'TikTok广告',
          platformIcon: 'T',
          status: 'active',
          spend: '$1,700',
          budget: '$2,200',
          roi: '36.5%',
          roiTarget: '35%',
          progress: 77,
          minSpend: '$1,280',
          cpi: '$2.26'
        }
      ]
    }
  ],
  footer: {
    appCount: 3,
    campaignCount: 5,
    totalSpend: '$12,200',
    overBudgetCount: 1,
    roiBelowTargetCount: 1,
    avgRoi: '38.2%',
    estTotalProfit: '$4,660',
    minTotalProfit: '$2,100'
  }
}

const campaignRows: MyAdsCampaignRowMock[] = [
  {
    id: 'CRE001',
    appIcon: '🌤️',
    appName: 'Weather5',
    name: 'Weather5_US_Google_CRE001',
    platform: 'Google',
    platformIcon: 'G',
    s_country_code: 'US',
    status: 'active',
    spend: 5200,
    budget: 6500,
    calcSpend: 4890,
    agencySpend: 3580,
    roi: 41.2,
    minSpend: 4100,
    estProfit: 1640,
    minProfit: 820,
    cpi: 2.37,
    trend: 'up'
  },
  {
    id: 'CRE002',
    appIcon: '🌤️',
    appName: 'Weather5',
    name: 'Weather5_JP_Facebook_CRE002',
    platform: 'Facebook',
    platformIcon: 'f',
    s_country_code: 'JP',
    status: 'active',
    spend: 2100,
    budget: 2800,
    calcSpend: 1980,
    agencySpend: 1450,
    roi: 35.8,
    minSpend: 1680,
    estProfit: 580,
    minProfit: 290,
    cpi: 2.38,
    trend: 'flat'
  },
  {
    id: 'CRE003',
    appIcon: '🩸',
    appName: 'BloodSugar2',
    name: 'BloodSugar2_UK_Google_CRE003',
    platform: 'Google',
    platformIcon: 'G',
    s_country_code: 'GB',
    status: 'warn',
    spend: 3200,
    budget: 3500,
    calcSpend: 3010,
    agencySpend: 2200,
    roi: 29.4,
    minSpend: 2450,
    estProfit: -340,
    minProfit: -680,
    cpi: 2.38,
    trend: 'down'
  },
  {
    id: 'CRE004',
    appIcon: '📱',
    appName: 'PhoneTracker',
    name: 'PhoneTracker_CA_TikTok_CRE004',
    platform: 'TikTok',
    platformIcon: 'T',
    s_country_code: 'CA',
    status: 'active',
    spend: 1700,
    budget: 2200,
    calcSpend: 1600,
    agencySpend: 1170,
    roi: 36.5,
    minSpend: 1280,
    estProfit: 420,
    minProfit: 210,
    cpi: 2.26,
    trend: 'up'
  },
  {
    id: 'CRE005',
    appIcon: '🌤️',
    appName: 'Weather5',
    name: 'Weather5_AU_Google_CRE005',
    platform: 'Google',
    platformIcon: 'G',
    s_country_code: 'AU',
    status: 'inactive',
    spend: 0,
    budget: 1000,
    calcSpend: 0,
    agencySpend: 0,
    roi: null,
    minSpend: 750,
    estProfit: null,
    minProfit: null,
    cpi: null,
    trend: 'none'
  },
  {
    id: 'CRE006',
    appIcon: '🩸',
    appName: 'BloodSugar2',
    name: 'BloodSugar2_US_Meta_CRE006',
    platform: 'Facebook',
    platformIcon: 'f',
    s_country_code: 'US',
    status: 'active',
    spend: 890,
    budget: 1200,
    calcSpend: 840,
    agencySpend: 615,
    roi: 38.9,
    minSpend: 670,
    estProfit: 230,
    minProfit: 115,
    cpi: 2.41,
    trend: 'up'
  }
]

export const MOCK_MY_ADS_PAGE_HEADER = pageHeader
export const MOCK_MY_ADS_SUMMARY_TAB = summaryTab
export const MOCK_MY_ADS_PLATFORM_TAB = platformTab
export const MOCK_MY_ADS_CAMPAIGN_ROWS = campaignRows

/** 聚合导出，便于与 backend-api 契约对照 */
export const MOCK_MY_ADS: MyAdsMockBundle = {
  pageHeader,
  summary: summaryTab,
  platform: platformTab,
  campaignRows
}
