/**
 * 商业洞察 - IAA / IAP 分析 API
 * 接口路径与 mock/backend-api 契约一致，后端就绪后切换为真实 request
 */
/* eslint-disable @typescript-eslint/no-unused-vars -- Mock 接口参数保留供后端联调使用 */
import type {
  IaaFilterOptions,
  IaaKpiCard,
  IaaPlatformTableRow,
  IaaFilterState,
  IaaAdTypeTabData,
  IaaPlatformTabData,
  IaaPlacementTabData,
  IaaAdUnitTabData,
  IaaCountryTabData,
  IaaVersionTabData
} from '@/views/business-insight/iaa-analysis/types'
import type {
  IapFilterOptions,
  IapKpiCard,
  IapOverviewTrend,
  IapAppCard,
  IapCountryRow,
  IapProductTypeDonutItem,
  IapPlatformCompare,
  IapOverviewRow,
  IapOverviewSummary,
  IapDetailProduct,
  IapDetailUser,
  IapDetailTrend
} from '@/views/business-insight/iap-analysis/types'

/** 全局筛选下拉选项（Mock：后端就绪后改为 request.get） */
export function fetchIaaMetaFilterOptions() {
  return Promise.resolve<IaaFilterOptions>({
    appOptions: [
      { label: '全部', value: 'all' },
      { label: 'Weather5', value: 'weather5' }
    ],
    platformOptions: [
      { label: 'Android&iOS', value: 'all' },
      { label: 'Android', value: 'android' },
      { label: 'iOS', value: 'ios' }
    ],
    countryOptions: [
      { label: '全部', value: 'all' },
      { label: '美国', value: 'US' },
      { label: '韩国', value: 'KR' },
      { label: '日本', value: 'JP' }
    ]
  })
  // 后端就绪后改为:
  // return request.get<IaaFilterOptions>({ url: `${IAA_BASE}/meta-filter-options` })
}

/** 当前 Tab 顶部 KPI 卡片（Mock：后端就绪后改为 request.post） */
export function fetchIaaOverviewKpi(_params: {
  tab: string
  s_app_id?: string
  platform?: string
  s_country_code?: string
  t_date: string
}) {
  return Promise.resolve<{ kpis: IaaKpiCard[] }>({
    kpis: [
      {
        id: 'kpi_1',
        title: '广告总收入',
        primaryValue: '$2,768.58',
        subText: '广告平台上报 ↑12.3%',
        trendUp: true,
        accent: 'teal'
      },
      {
        id: 'kpi_2',
        title: '平均ECPM',
        primaryValue: '3.32 / 3.06',
        subText: '预估/真实 | 偏差 +8.5%',
        accent: 'default'
      },
      {
        id: 'kpi_3',
        title: '广告展示次数',
        primaryValue: '833,607',
        subText: '人均展示4.9次',
        accent: 'default'
      },
      {
        id: 'kpi_4',
        title: '广告用户',
        primaryValue: '117,483',
        subText: '渗透率68.6%',
        accent: 'default'
      }
    ]
  })
  // 后端就绪后改为:
  // return request.post<{ kpis: IaaKpiCard[] }>({ url: `${IAA_BASE}/overview-kpi`, data: params })
}

/** 广告平台 Tab - 平台详细对比表（Mock：后端就绪后改为 request.post） */
export function fetchIaaTableAdPlatform(_params: IaaFilterState) {
  return Promise.resolve<{ list: IaaPlatformTableRow[] }>({
    list: [
      {
        sourceName: 'Admob',
        source: 1,
        revenue: 1985.86,
        revenueShare: 71.7,
        impressions: 520000,
        impressionShare: 62.4,
        adUsers: 85000,
        userShare: 72.4,
        ecpmEst: 18.54,
        ecpmReal: 17.2,
        variance: 7.8,
        fillRate: 96.2,
        trend: 'up'
      },
      {
        sourceName: 'Facebook',
        source: 2,
        revenue: 257.5,
        revenueShare: 9.3,
        impressions: 120000,
        impressionShare: 14.4,
        adUsers: 22000,
        userShare: 18.7,
        ecpmEst: 2.14,
        ecpmReal: 2.0,
        variance: 7.0,
        fillRate: 92,
        trend: 'flat'
      }
    ]
  })
  // 后端就绪后改为:
  // return request.post<{ list: IaaPlatformTableRow[] }>({ url: `${IAA_BASE}/table/ad-platform`, data: params })
}

/** 广告类型 Tab - 整页数据（KPI/表格/图表，Mock：后端就绪后改为 request.post） */
export function fetchIaaAdTypeTabData(_params: IaaFilterState) {
  const data: IaaAdTypeTabData = {
    kpi: {
      revenueTotal: 2768.58,
      revenueReal: 1861.23,
      penetrationPct: 68.6,
      adUsers: 117483,
      dau: 171334,
      impressions: 833597,
      impressionsPerUser: 4.9,
      ecpmEst: 3.32,
      ecpmReal: 3.06,
      ecpmVariancePct: 8.5
    },
    compareRows: [
      {
        adTypeName: '插页式广告',
        revenue: 2014,
        revenueShare: 72.8,
        users: 61587,
        ecpm: 19.64,
        impressions: 102551
      },
      {
        adTypeName: '原生广告',
        revenue: 484,
        revenueShare: 17.5,
        users: 88891,
        ecpm: 1.76,
        impressions: 275249
      },
      {
        adTypeName: '横幅广告',
        revenue: 191,
        revenueShare: 6.9,
        users: 99582,
        ecpm: 0.47,
        impressions: 405545
      },
      {
        adTypeName: '开屏广告',
        revenue: 79,
        revenueShare: 2.9,
        users: 38044,
        ecpm: 1.58,
        impressions: 50262
      }
    ],
    radar: {
      indicatorNames: ['插页式', '原生', '横幅', '开屏'],
      maxByMetric: {
        revenue: 2500,
        users: 100000,
        impressions: 450000,
        avgRevenue: 0.05
      },
      values: {
        revenue: [2014, 484, 191, 79],
        users: [61587, 88891, 99582, 38044],
        impressions: [102551, 275249, 405545, 50262],
        avgRevenue: [0.0327, 0.0054, 0.0019, 0.0021]
      }
    },
    platformRanking: [
      { sourceName: 'Admob', revenue: 1985.86, ecpm: 18.54 },
      { sourceName: 'Facebook', revenue: 258.31, ecpm: 15.54 },
      { sourceName: 'Applovin', revenue: 167.1, ecpm: 10.54 },
      { sourceName: 'Vungle', revenue: 102.55, ecpm: 10.01 },
      { sourceName: 'Pangle', revenue: 86.88, ecpm: 8.88 },
      { sourceName: 'Mintegral', revenue: 26.36, ecpm: 10.25 }
    ],
    platformInsight: 'Admob占收入71.7%，建议优先保障Admob广告展示质量',
    placementTop10: [
      { rank: 1, placementName: 'Splash', revenue: 1451.8, percent: 52.4 },
      { rank: 2, placementName: 'HomeResume', revenue: 446.0, percent: 16.1 },
      { rank: 3, placementName: 'Native_AdMainWall', revenue: 391.01, percent: 14.1 },
      { rank: 4, placementName: 'Banner_HomeWeather', revenue: 164.78, percent: 6.0 },
      { rank: 5, placementName: 'DailyDetail', revenue: 62.17, percent: 2.2 },
      { rank: 6, placementName: 'WeatherDetail', revenue: 23.92, percent: 1.2 },
      { rank: 7, placementName: 'SearchResult', revenue: 22.65, percent: 1.2 },
      { rank: 8, placementName: 'ProfilePage', revenue: 12.98, percent: 1.2 },
      { rank: 9, placementName: 'Settings', revenue: 3.92, percent: 0.2 },
      { rank: 10, placementName: 'ExitPopup', revenue: 2.92, percent: 0.2 }
    ],
    trend7d: {
      dates: [
        '2026-02-27',
        '2026-02-28',
        '2026-03-01',
        '2026-03-02',
        '2026-03-04',
        '2026-03-05',
        '2026-03-06'
      ],
      series: [
        {
          name: '插页式',
          color: '#3B82F6',
          data: [62, 66, 63, 69, 73, 75, 77]
        },
        {
          name: '原生',
          color: '#10B981',
          data: [12, 13, 12, 14, 13, 14, 15]
        },
        {
          name: '横幅',
          color: '#8B5CF6',
          data: [5, 5, 5, 6, 6, 6, 6]
        },
        {
          name: '开屏',
          color: '#F59E0B',
          data: [2, 2, 2, 2, 2, 2, 3]
        }
      ]
    },
    userBreakdown: {
      buckets: [
        { installDays: '0天', revenue: 228, activeUsers: 2000 },
        { installDays: '1天', revenue: 185, activeUsers: 9500 },
        { installDays: '2–7天', revenue: 312, activeUsers: 18000 },
        { installDays: '8–30天', revenue: 398, activeUsers: 22000 },
        { installDays: '31–90天', revenue: 425, activeUsers: 24000 },
        { installDays: '91–180天', revenue: 380, activeUsers: 21000 },
        { installDays: '181–360天', revenue: 440, activeUsers: 23000 },
        { installDays: '360+天', revenue: 1380, activeUsers: 55000 }
      ],
      insight: '新用户(0天)广告收入$228.29，占比8.2%，老用户是核心变现群体',
      highlightRevenueSharePct: 49.9
    }
  }
  return Promise.resolve<IaaAdTypeTabData>(data)
  // 后端就绪后改为:
  // return request.post<IaaAdTypeTabData>({ url: `${IAA_BASE}/overview/ad-type-tab`, data: params })
}

/** 广告平台 Tab - 整页数据（Mock：后端就绪后改为 request.post） */
export function fetchIaaPlatformTabData(_params: IaaFilterState) {
  const data: IaaPlatformTabData = {
    kpis: [
      {
        id: '1',
        title: '广告总收入',
        primaryValue: '$2,768.58',
        subText: '广告平台上报 ↑12.3%',
        trendUp: true,
        accent: 'teal'
      },
      {
        id: '2',
        title: '平均ECPM',
        primaryValue: '3.32 / 3.06',
        subText: '预估/真实 | 偏差 +8.5%',
        accent: 'default'
      },
      {
        id: '3',
        title: '广告展示次数',
        primaryValue: '833,607',
        subText: '人均展示4.9次',
        accent: 'default'
      },
      {
        id: '4',
        title: '广告用户',
        primaryValue: '117,483',
        subText: '渗透率68.6%',
        accent: 'default'
      }
    ],
    platformRanking: [
      { sourceName: 'Admob', revenue: 1985.86, ecpm: 18.54 },
      { sourceName: 'Facebook', revenue: 258.31, ecpm: 15.54 },
      { sourceName: 'Applovin', revenue: 167.1, ecpm: 10.54 },
      { sourceName: 'Vungle', revenue: 102.55, ecpm: 10.01 },
      { sourceName: 'Pangle', revenue: 86.88, ecpm: 8.88 },
      { sourceName: 'Mintegral', revenue: 26.36, ecpm: 10.25 }
    ],
    platformInsight: 'Admob收入占71.7%，建议优先保障Admob展示质量',
    tableRows: [
      {
        sourceName: 'Admob',
        source: 1,
        revenue: 1985.86,
        revenueShare: 71.7,
        impressions: 598234,
        impressionShare: 71.8,
        adUsers: 85000,
        userShare: 72.4,
        ecpmEst: 18.54,
        ecpmReal: 17.2,
        variance: 7.8,
        fillRate: 96.2,
        trend: 'up'
      },
      {
        sourceName: 'Facebook',
        source: 2,
        revenue: 258.31,
        revenueShare: 9.3,
        impressions: 108423,
        impressionShare: 13.0,
        adUsers: 22000,
        userShare: 18.7,
        ecpmEst: 2.14,
        ecpmReal: 2.0,
        variance: 7.0,
        fillRate: 92,
        trend: 'flat'
      },
      {
        sourceName: 'Applovin',
        source: 4,
        revenue: 167.1,
        revenueShare: 6.0,
        impressions: 38234,
        impressionShare: 4.6,
        adUsers: 18000,
        userShare: 15.3,
        ecpmEst: 1.75,
        ecpmReal: 1.62,
        variance: 8.0,
        fillRate: 94,
        trend: 'up'
      },
      {
        sourceName: 'Vungle',
        source: 5,
        revenue: 102.55,
        revenueShare: 3.7,
        impressions: 38224,
        impressionShare: 4.6,
        adUsers: 12000,
        userShare: 10.2,
        ecpmEst: 2.61,
        ecpmReal: 2.41,
        variance: 8.3,
        fillRate: 91,
        trend: 'down'
      },
      {
        sourceName: 'Pangle',
        source: 7,
        revenue: 86.88,
        revenueShare: 3.1,
        impressions: 28103,
        impressionShare: 3.4,
        adUsers: 8000,
        userShare: 6.8,
        ecpmEst: 3.09,
        ecpmReal: 2.9,
        variance: 6.6,
        fillRate: 88,
        trend: 'flat'
      },
      {
        sourceName: 'Mintegral',
        source: 8,
        revenue: 26.36,
        revenueShare: 1.0,
        impressions: 7752,
        impressionShare: 0.9,
        adUsers: 4483,
        userShare: 3.8,
        ecpmEst: 3.4,
        ecpmReal: 3.32,
        variance: 2.4,
        fillRate: 82.1,
        trend: 'up'
      }
    ],
    donut: [
      { name: 'Admob', value: 1985.86, percent: 71.7 },
      { name: 'Facebook', value: 258.31, percent: 9.3 },
      { name: 'Applovin', value: 167.1, percent: 6.0 },
      { name: 'Vungle', value: 102.55, percent: 3.7 },
      { name: 'Pangle', value: 86.88, percent: 3.1 },
      { name: 'Other', value: 167.88, percent: 6.2 }
    ],
    ecpmComparison: [
      { name: 'Admob', ecpmEst: 3.32, ecpmReal: 3.06 },
      { name: 'Facebook', ecpmEst: 2.38, ecpmReal: 2.32 },
      { name: 'Applovin', ecpmEst: 3.16, ecpmReal: 3.08 },
      { name: 'Vungle', ecpmEst: 2.68, ecpmReal: 2.61 },
      { name: 'Pangle', ecpmEst: 3.01, ecpmReal: 3.09 },
      { name: 'Mintegral', ecpmEst: 3.32, ecpmReal: 3.4 }
    ],
    trend7d: {
      dates: ['Feb27', 'Feb28', 'Mar1', 'Mar2', 'Mar3', 'Mar4', 'Mar5'],
      series: [
        { name: 'Admob', color: '#26C2AD', data: [420, 480, 450, 520, 580, 610, 620] },
        { name: 'Facebook', color: '#3B82F6', data: [80, 85, 82, 90, 88, 92, 95] },
        { name: 'Applovin', color: '#8B5CF6', data: [42, 45, 43, 48, 50, 52, 53] },
        { name: 'Vungle', color: '#F59E0B', data: [28, 30, 29, 32, 31, 33, 34] },
        { name: 'Pangle', color: '#EF4444', data: [22, 24, 23, 26, 25, 27, 28] },
        { name: 'Mintegral', color: '#94A3B8', data: [6, 7, 7, 8, 8, 8, 7] }
      ]
    }
  }
  return Promise.resolve<IaaPlatformTabData>(data)
  // 后端就绪后改为:
  // return request.post<IaaPlatformTabData>({ url: `${IAA_BASE}/overview/platform-tab`, data: params })
}

/** 广告位 Tab - 整页数据（Mock：后端就绪后改为 request.post） */
export function fetchIaaPlacementTabData(_params: IaaFilterState) {
  const data: IaaPlacementTabData = {
    kpis: [
      {
        id: '1',
        title: '广告位总数',
        primaryValue: '47个',
        subText: '已开启43个 | 关闭4个',
        accent: 'default'
      },
      {
        id: '2',
        title: '广告位总收入',
        primaryValue: '$2,768.58',
        subText: '平均每个$58.91 ↑12.3%',
        trendUp: true,
        accent: 'teal'
      },
      {
        id: '3',
        title: '广告位平均ECPM',
        primaryValue: '3.32',
        subText: 'Top广告位: WeatherRadar 19.16',
        accent: 'default'
      },
      {
        id: '4',
        title: '广告位展示总次',
        primaryValue: '833,607',
        subText: '广告位平均展示17,736次',
        accent: 'default'
      }
    ],
    top10: [
      {
        name: 'Splash',
        revenue: 1451.8,
        impressions: 280000,
        ecpm: 19.16,
        users: 65000,
        percent: 52.4
      },
      {
        name: 'HomeResume',
        revenue: 446.0,
        impressions: 95000,
        ecpm: 4.7,
        users: 42000,
        percent: 16.1
      },
      {
        name: 'Native_AdMainWall',
        revenue: 391.01,
        impressions: 120000,
        ecpm: 2.77,
        users: 38000,
        percent: 14.1
      },
      {
        name: 'Banner_HomeWeather',
        revenue: 164.78,
        impressions: 345234,
        ecpm: 0.48,
        users: 96234,
        percent: 6.0
      },
      {
        name: 'DailyDetail',
        revenue: 62.17,
        impressions: 35000,
        ecpm: 1.78,
        users: 28000,
        percent: 2.2
      },
      {
        name: 'WeatherDetail',
        revenue: 23.92,
        impressions: 18000,
        ecpm: 1.33,
        users: 14000,
        percent: 0.9
      },
      {
        name: 'SearchResult',
        revenue: 22.65,
        impressions: 15000,
        ecpm: 1.51,
        users: 12000,
        percent: 0.8
      },
      {
        name: 'ProfilePage',
        revenue: 12.98,
        impressions: 9500,
        ecpm: 1.37,
        users: 8000,
        percent: 0.5
      },
      { name: 'Settings', revenue: 3.92, impressions: 4200, ecpm: 0.93, users: 3500, percent: 0.2 },
      { name: 'ExitPopup', revenue: 2.92, impressions: 3600, ecpm: 0.81, users: 3000, percent: 0.1 }
    ],
    tableRows: [
      {
        placementName: 'Splash',
        adTypeName: '开屏',
        sourceName: 'Admob',
        revenue: 1451.8,
        impressions: 280000,
        ecpmEst: 19.16,
        ecpmReal: 18.56,
        impressionUsers: 65234,
        fillRate: 97.2,
        status: 'normal'
      },
      {
        placementName: 'HomeResume',
        adTypeName: '插页式',
        sourceName: 'Admob',
        revenue: 446.0,
        impressions: 95000,
        ecpmEst: 4.7,
        ecpmReal: 4.5,
        impressionUsers: 42000,
        fillRate: 95.0,
        status: 'normal'
      },
      {
        placementName: 'Native_AdMainWall',
        adTypeName: '原生',
        sourceName: 'Facebook',
        revenue: 391.01,
        impressions: 120000,
        ecpmEst: 2.77,
        ecpmReal: 2.6,
        impressionUsers: 38000,
        fillRate: 92.0,
        status: 'normal'
      },
      {
        placementName: 'Banner_HomeWeather',
        adTypeName: '横幅',
        sourceName: 'Admob',
        revenue: 164.78,
        impressions: 345234,
        ecpmEst: 0.48,
        ecpmReal: 0.44,
        impressionUsers: 96234,
        fillRate: 94.3,
        status: 'normal'
      },
      {
        placementName: 'DailyDetail',
        adTypeName: '插页式',
        sourceName: 'Facebook',
        revenue: 62.17,
        impressions: 35000,
        ecpmEst: 1.78,
        ecpmReal: 1.65,
        impressionUsers: 28000,
        fillRate: 82.1,
        status: 'low'
      }
    ],
    donut: [
      { name: 'Splash', value: 1451.8, percent: 52.4 },
      { name: 'HomeResume', value: 446.0, percent: 16.1 },
      { name: 'Native_AdMainWall', value: 391.01, percent: 14.1 },
      { name: 'Banner_HomeWeather', value: 164.78, percent: 6.0 },
      { name: '其他', value: 314.99, percent: 11.4 }
    ],
    ecpmRanking: [
      { name: 'WeatherRadar', ecpm: 19.16 },
      { name: 'HourlyForecast', ecpm: 14.02 },
      { name: 'Splash', ecpm: 12.35 },
      { name: 'DailyDetail', ecpm: 9.83 },
      { name: 'HomeResume', ecpm: 8.04 }
    ],
    placementInsight: '插页式广告位普遍ECPM较高，建议优先保障Splash展示频次',
    scatterData: [
      { name: 'Splash', impressions: 280000, revenue: 1451.8 },
      { name: 'HomeResume', impressions: 95000, revenue: 446.0 },
      { name: 'Native_AdMainWall', impressions: 120000, revenue: 391.01 },
      { name: 'Banner_HomeWeather', impressions: 345234, revenue: 164.78 },
      { name: 'DailyDetail', impressions: 35000, revenue: 62.17 }
    ]
  }
  return Promise.resolve<IaaPlacementTabData>(data)
  // 后端就绪后改为:
  // return request.post<IaaPlacementTabData>({ url: `${IAA_BASE}/overview/placement-tab`, data: params })
}

/** 广告单元 Tab - 整页数据（Mock：后端就绪后改为 request.post） */
export function fetchIaaAdUnitTabData(_params: IaaFilterState) {
  const data: IaaAdUnitTabData = {
    kpis: [
      {
        id: '1',
        title: '广告单元总数',
        primaryValue: '284个',
        subText: '已开启256个 | 关闭28个',
        accent: 'default'
      },
      {
        id: '2',
        title: '广告单元总收入',
        primaryValue: '$2,768.58',
        subText: '平均每单元$10.81',
        accent: 'teal'
      },
      {
        id: '3',
        title: '广告单元平均ECPM',
        primaryValue: '3.32',
        subText: 'Top: Splash_Admob_001 ECPM 19.2',
        accent: 'default'
      },
      {
        id: '4',
        title: '广告单元充填率',
        primaryValue: '94.8%',
        subText: '充填率<80%: 12个',
        accent: 'amber'
      }
    ],
    tableRows: [
      {
        s_ad_unit_id: 'ca-app-pub-xxx/Splash_001',
        placementName: 'Splash',
        adTypeName: '开屏',
        sourceName: 'Admob',
        revenue: 486.2,
        ecpmEst: 19.2,
        ecpmReal: 17.8,
        impressions: 27315,
        fillRate: 98.4,
        status: 'normal'
      },
      {
        s_ad_unit_id: 'ca-app-pub-xxx/Splash_002',
        placementName: 'Splash',
        adTypeName: '开屏',
        sourceName: 'Admob',
        revenue: 412.3,
        ecpmEst: 18.8,
        ecpmReal: 17.4,
        impressions: 23892,
        fillRate: 97.8,
        status: 'normal'
      },
      {
        s_ad_unit_id: 'ca-app-pub-xxx/Splash_003',
        placementName: 'Splash',
        adTypeName: '开屏',
        sourceName: 'Admob',
        revenue: 356.8,
        ecpmEst: 18.5,
        ecpmReal: 17.1,
        impressions: 20845,
        fillRate: 96.2,
        status: 'normal'
      },
      {
        s_ad_unit_id: 'ca-app-pub-xxx/HomeResume_001',
        placementName: 'HomeResume',
        adTypeName: '插页式',
        sourceName: 'Admob',
        revenue: 198.4,
        ecpmEst: 18.4,
        ecpmReal: 16.9,
        impressions: 11741,
        fillRate: 95.8,
        status: 'normal'
      },
      {
        s_ad_unit_id: 'ca-app-pub-xxx/HomeResume_002',
        placementName: 'HomeResume',
        adTypeName: '插页式',
        sourceName: 'Admob',
        revenue: 156.2,
        ecpmEst: 18.1,
        ecpmReal: 16.7,
        impressions: 9358,
        fillRate: 94.3,
        status: 'normal'
      },
      {
        s_ad_unit_id: 'ca-app-pub-xxx/Native_001',
        placementName: 'Native_AdMainWall',
        adTypeName: '原生',
        sourceName: 'Admob',
        revenue: 142.8,
        ecpmEst: 1.82,
        ecpmReal: 1.68,
        impressions: 84952,
        fillRate: 93.7,
        status: 'normal'
      },
      {
        s_ad_unit_id: 'ca-app-pub-xxx/Native_002',
        placementName: 'Native_AdMainWall',
        adTypeName: '原生',
        sourceName: 'Admob',
        revenue: 128.5,
        ecpmEst: 1.76,
        ecpmReal: 1.62,
        impressions: 79321,
        fillRate: 92.4,
        status: 'normal'
      },
      {
        s_ad_unit_id: 'ca-app-pub-xxx/Banner_001',
        placementName: 'Banner_HomeWeather',
        adTypeName: '横幅',
        sourceName: 'Admob',
        revenue: 68.4,
        ecpmEst: 0.52,
        ecpmReal: 0.48,
        impressions: 142500,
        fillRate: 91.2,
        status: 'normal'
      },
      {
        s_ad_unit_id: 'ca-app-pub-xxx/Banner_002',
        placementName: 'Banner_HomeWeather',
        adTypeName: '横幅',
        sourceName: 'Admob',
        revenue: 52.3,
        ecpmEst: 0.48,
        ecpmReal: 0.44,
        impressions: 118864,
        fillRate: 90.8,
        status: 'normal'
      },
      {
        s_ad_unit_id: 'ca-app-pub-xxx/DailyDetail_001',
        placementName: 'DailyDetail',
        adTypeName: '插页式',
        sourceName: 'Facebook',
        revenue: 38.2,
        ecpmEst: 15.8,
        ecpmReal: 14.6,
        impressions: 2616,
        fillRate: 88.4,
        status: 'normal'
      },
      {
        s_ad_unit_id: 'ca-app-pub-xxx/Rewarded_001',
        placementName: 'WeatherDetail',
        adTypeName: '激励视频',
        sourceName: 'Admob',
        revenue: 28.4,
        ecpmEst: 12.4,
        ecpmReal: 11.2,
        impressions: 2536,
        fillRate: 85.2,
        status: 'normal'
      },
      {
        s_ad_unit_id: 'ca-app-pub-xxx/Native_003',
        placementName: 'SearchResult',
        adTypeName: '原生',
        sourceName: 'Applovin',
        revenue: 18.6,
        ecpmEst: 9.8,
        ecpmReal: 9.2,
        impressions: 20217,
        fillRate: 82.3,
        status: 'normal'
      },
      {
        s_ad_unit_id: 'ca-app-pub-xxx/Banner_003',
        placementName: 'ProfilePage',
        adTypeName: '横幅',
        sourceName: 'Admob',
        revenue: 12.8,
        ecpmEst: 0.38,
        ecpmReal: 0.34,
        impressions: 37647,
        fillRate: 79.4,
        status: 'low'
      },
      {
        s_ad_unit_id: 'ca-app-pub-xxx/Interstitial_004',
        placementName: 'Settings',
        adTypeName: '插页式',
        sourceName: 'Vungle',
        revenue: 3.92,
        ecpmEst: 8.2,
        ecpmReal: 7.6,
        impressions: 516,
        fillRate: 76.8,
        status: 'low'
      },
      {
        s_ad_unit_id: 'ca-app-pub-xxx/Banner_004',
        placementName: 'ExitPopup',
        adTypeName: '横幅',
        sourceName: 'Pangle',
        revenue: 2.92,
        ecpmEst: 0.32,
        ecpmReal: 0.28,
        impressions: 10429,
        fillRate: 72.1,
        status: 'low'
      }
    ],
    fillRateBuckets: [
      { range: '<70%', count: 2 },
      { range: '70-80%', count: 10 },
      { range: '80-90%', count: 45 },
      { range: '90-95%', count: 120 },
      { range: '>95%', count: 107 }
    ],
    fillRateInsight: '12个单元充填率<80%，建议检查广告位配置',
    scatterData: [
      { unitId: 'Splash_001', ecpm: 19.2, fillRate: 97.6, adType: '开屏' },
      { unitId: 'HomeResume_001', ecpm: 4.7, fillRate: 95.8, adType: '插页式' },
      { unitId: 'Native_001', ecpm: 1.82, fillRate: 93.7, adType: '原生' },
      { unitId: 'Banner_001', ecpm: 0.52, fillRate: 76.4, adType: '横幅' },
      { unitId: 'Native_002', ecpm: 1.62, fillRate: 85.2, adType: '原生' }
    ],
    trend7d: {
      dates: ['Feb27', 'Feb28', 'Mar1', 'Mar2', 'Mar3', 'Mar4', 'Mar5'],
      series: [
        { name: 'Splash_001', color: '#26C2AD', data: [480, 490, 485, 500, 495, 505, 488] },
        { name: 'HomeResume_001', color: '#3B82F6', data: [340, 350, 345, 360, 355, 365, 358] },
        { name: 'Native_001', color: '#8B5CF6', data: [140, 148, 145, 152, 150, 158, 156] }
      ]
    }
  }
  return Promise.resolve<IaaAdUnitTabData>(data)
  // 后端就绪后改为:
  // return request.post<IaaAdUnitTabData>({ url: `${IAA_BASE}/overview/ad-unit-tab`, data: params })
}

/** 国家 Tab - 整页数据（Mock：后端就绪后改为 request.post） */
export function fetchIaaCountryTabData(_params: IaaFilterState) {
  const data: IaaCountryTabData = {
    kpis: [
      {
        id: '1',
        title: '覆盖国家数',
        primaryValue: '68个',
        subText: '收入贡献国家',
        accent: 'default'
      },
      {
        id: '2',
        title: 'Top1国家收入',
        primaryValue: '美国 $1,026.41',
        subText: '占比41.6% ↑8.2%',
        trendUp: true,
        accent: 'teal'
      },
      {
        id: '3',
        title: '平均ECPM',
        primaryValue: '3.32',
        subText: '美国ECPM 8.23 | 韩国 7.44',
        accent: 'default'
      },
      {
        id: '4',
        title: '国家ARPDAU差异',
        primaryValue: '8.23x',
        subText: '美国 vs 乌兹别克斯坦最高差异',
        accent: 'amber'
      }
    ],
    mapData: [
      { name: 'United States', value: 8.23, cnName: '美国', s_country_code: 'US' },
      { name: 'Korea', value: 7.44, cnName: '韩国', s_country_code: 'KR' },
      { name: 'United Kingdom', value: 6.82, cnName: '英国', s_country_code: 'GB' },
      { name: 'Japan', value: 6.12, cnName: '日本', s_country_code: 'JP' },
      { name: 'Germany', value: 5.34, cnName: '德国', s_country_code: 'DE' },
      { name: 'France', value: 4.82, cnName: '法国', s_country_code: 'FR' },
      { name: 'Australia', value: 4.92, cnName: '澳大利亚', s_country_code: 'AU' },
      { name: 'Canada', value: 4.51, cnName: '加拿大', s_country_code: 'CA' },
      { name: 'China', value: 2.84, cnName: '中国', s_country_code: 'CN' },
      { name: 'South Africa', value: 2.18, cnName: '南非', s_country_code: 'ZA' },
      { name: 'India', value: 1.92, cnName: '印度', s_country_code: 'IN' },
      { name: 'Uzbekistan', value: 0.63, cnName: '乌兹别克斯坦', s_country_code: 'UZ' }
    ],
    tableRows: [
      {
        rank: 1,
        s_country_code: 'US',
        s_country_name: '美国',
        revenue: 1026.41,
        revenueShare: 41.6,
        ecpmEst: 8.23,
        ecpmReal: 7.82,
        impressions: 131234,
        adUsers: 45000,
        arpdau: 0.0228,
        trend: 'up',
        trendPercent: 8.2
      },
      {
        rank: 2,
        s_country_code: 'KR',
        s_country_name: '韩国',
        revenue: 302.2,
        revenueShare: 10.9,
        ecpmEst: 7.44,
        ecpmReal: 7.1,
        impressions: 43254,
        adUsers: 22000,
        arpdau: 0.0137,
        trend: 'up',
        trendPercent: 5.1
      },
      {
        rank: 3,
        s_country_code: 'JP',
        s_country_name: '日本',
        revenue: 185.52,
        revenueShare: 6.7,
        ecpmEst: 6.12,
        ecpmReal: 5.82,
        impressions: 31908,
        adUsers: 18000,
        arpdau: 0.0103,
        trend: 'flat'
      },
      {
        rank: 4,
        s_country_code: 'DE',
        s_country_name: '德国',
        revenue: 135.78,
        revenueShare: 4.9,
        ecpmEst: 5.34,
        ecpmReal: 5.12,
        impressions: 26515,
        adUsers: 15000,
        arpdau: 0.009,
        trend: 'down',
        trendPercent: 2.1
      },
      {
        rank: 5,
        s_country_code: 'GB',
        s_country_name: '英国',
        revenue: 120.78,
        revenueShare: 4.4,
        ecpmEst: 6.82,
        ecpmReal: 6.54,
        impressions: 18484,
        adUsers: 12000,
        arpdau: 0.0101,
        trend: 'up',
        trendPercent: 3.2
      },
      {
        rank: 6,
        s_country_code: 'AU',
        s_country_name: '澳大利亚',
        revenue: 94.1,
        revenueShare: 3.4,
        ecpmEst: 4.92,
        ecpmReal: 4.68,
        impressions: 20106,
        adUsers: 9000,
        arpdau: 0.0104,
        trend: 'flat'
      },
      {
        rank: 7,
        s_country_code: 'CA',
        s_country_name: '加拿大',
        revenue: 81.42,
        revenueShare: 2.9,
        ecpmEst: 4.51,
        ecpmReal: 4.01,
        impressions: 20303,
        adUsers: 8000,
        arpdau: 0.0102,
        trend: 'up',
        trendPercent: 1.8
      },
      {
        rank: 8,
        s_country_code: 'FR',
        s_country_name: '法国',
        revenue: 68.42,
        revenueShare: 2.5,
        ecpmEst: 4.51,
        ecpmReal: 4.01,
        impressions: 17023,
        adUsers: 7000,
        arpdau: 0.0098,
        trend: 'flat'
      },
      {
        rank: 9,
        s_country_code: 'CN',
        s_country_name: '中国',
        revenue: 68.42,
        revenueShare: 2.5,
        ecpmEst: 2.84,
        ecpmReal: 2.64,
        impressions: 13903,
        adUsers: 6000,
        arpdau: 0.0114,
        trend: 'up',
        trendPercent: 2.0
      },
      {
        rank: 10,
        s_country_code: 'IN',
        s_country_name: '印度',
        revenue: 51.42,
        revenueShare: 1.9,
        ecpmEst: 1.92,
        ecpmReal: 1.82,
        impressions: 26735,
        adUsers: 5000,
        arpdau: 0.0103,
        trend: 'up',
        trendPercent: 1.2
      }
    ],
    ecpmComparison: [
      { name: '美国', ecpm: 8.23 },
      { name: '韩国', ecpm: 7.44 },
      { name: '英国', ecpm: 6.82 },
      { name: '日本', ecpm: 6.12 },
      { name: '德国', ecpm: 5.34 },
      { name: '澳大利亚', ecpm: 4.92 },
      { name: '加拿大', ecpm: 4.51 },
      { name: '法国', ecpm: 4.51 },
      { name: '中国', ecpm: 2.84 },
      { name: '印度', ecpm: 1.92 }
    ],
    trend7d: {
      dates: ['Feb27', 'Feb28', 'Mar1', 'Mar2', 'Mar3', 'Mar4', 'Mar5'],
      series: [
        { name: '美国', color: '#26C2AD', data: [320, 350, 340, 380, 400, 420, 440] },
        { name: '韩国', color: '#3B82F6', data: [120, 130, 125, 138, 142, 145, 148] },
        { name: '日本', color: '#8B5CF6', data: [95, 100, 98, 105, 108, 110, 112] }
      ]
    },
    penetrationData: [
      { name: '美国', penetration: 68.6 },
      { name: '韩国', penetration: 65.2 },
      { name: '日本', penetration: 60.1 },
      { name: '德国', penetration: 58.4 },
      { name: '英国', penetration: 55.9 },
      { name: '澳大利亚', penetration: 52.3 },
      { name: '加拿大', penetration: 50.8 },
      { name: '法国', penetration: 36.6 }
    ]
  }
  return Promise.resolve<IaaCountryTabData>(data)
  // 后端就绪后改为:
  // return request.post<IaaCountryTabData>({ url: `${IAA_BASE}/overview/country-tab`, data: params })
}

/** 版本 Tab - 整页数据（Mock：后端就绪后改为 request.post） */
export function fetchIaaVersionTabData(_params: IaaFilterState) {
  const data: IaaVersionTabData = {
    kpis: [
      {
        id: '1',
        title: '当前版本',
        primaryValue: 'v4.2.1',
        subText: '主流版本 | 用户占比62.4%',
        accent: 'teal'
      },
      {
        id: '2',
        title: '活跃版本数量',
        primaryValue: '8个活跃版本',
        subText: '追踪近2个月内版本',
        accent: 'default'
      },
      {
        id: '3',
        title: '版本广告收入',
        primaryValue: '$2,768.58',
        subText: 'v4.2.1贡献$1,727.60 (62.4%)',
        accent: 'default'
      },
      {
        id: '4',
        title: '版本升级影响',
        primaryValue: '+12.8%',
        subText: 'v4.2.1 vs v4.1.x ECPM提升',
        trendUp: true,
        accent: 'green'
      }
    ],
    tableRows: [
      {
        app_version: 'v4.2.1',
        releaseDate: '2026-02-15',
        userShare: 62.4,
        revenue: 1727.6,
        ecpmEst: 3.46,
        ecpmReal: 3.22,
        impressions: 521076,
        adPenetration: 75.2,
        crashRate: 0.12,
        versionRating: 4.6,
        isCurrent: true
      },
      {
        app_version: 'v4.1.8',
        releaseDate: '2026-01-20',
        userShare: 18.2,
        revenue: 504.2,
        ecpmEst: 3.06,
        ecpmReal: 2.84,
        impressions: 165000,
        adPenetration: 67.4,
        crashRate: 0.35,
        versionRating: 4.2
      },
      {
        app_version: 'v4.1.5',
        releaseDate: '2026-01-05',
        userShare: 8.5,
        revenue: 235.6,
        ecpmEst: 2.84,
        ecpmReal: 2.61,
        impressions: 81000,
        adPenetration: 62.1,
        crashRate: 0.42,
        versionRating: 4.0
      },
      {
        app_version: 'v4.1.0',
        releaseDate: '2025-12-10',
        userShare: 5.0,
        revenue: 138.2,
        ecpmEst: 2.72,
        ecpmReal: 2.52,
        impressions: 44870,
        adPenetration: 65.8,
        crashRate: 0.38,
        versionRating: 4.1
      },
      {
        app_version: 'v4.0.8',
        releaseDate: '2025-11-22',
        userShare: 3.1,
        revenue: 85.6,
        ecpmEst: 2.64,
        ecpmReal: 2.42,
        impressions: 27022,
        adPenetration: 62.4,
        crashRate: 0.51,
        versionRating: 3.9
      },
      {
        app_version: 'v4.0.5',
        releaseDate: '2025-11-01',
        userShare: 1.5,
        revenue: 53.88,
        ecpmEst: 2.52,
        ecpmReal: 2.32,
        impressions: 5523,
        adPenetration: 60.0,
        crashRate: 0.92,
        versionRating: 3.8
      }
    ],
    revenueComparison: [
      { app_version: 'v4.2.1', revenue: 1727.6, userShare: 62.4 },
      { app_version: 'v4.1.8', revenue: 504.2, userShare: 18.2 },
      { app_version: 'v4.1.5', revenue: 235.6, userShare: 8.5 },
      { app_version: 'v4.1.0', revenue: 138.2, userShare: 5.0 },
      { app_version: 'v4.0.8', revenue: 85.6, userShare: 3.1 },
      { app_version: 'v4.0.5', revenue: 53.88, userShare: 1.5 }
    ],
    versionInsight: 'v4.2.1已成为主流版本，建议推动老版本用户升级',
    ecpmTrend: {
      versions: ['v4.0.5', 'v4.0.8', 'v4.1.0', 'v4.1.5', 'v4.1.8', 'v4.2.1'],
      est: [2.52, 2.64, 2.72, 2.84, 3.06, 3.46],
      real: [2.32, 2.42, 2.52, 2.61, 2.84, 3.22]
    },
    upgradeProgress: {
      dates: ['Feb5', 'Feb12', 'Feb19', 'Feb26', 'Mar5'],
      series: [
        { version: 'v4.2.1', color: '#26C2AD', data: [10, 25, 42, 55, 62.4] },
        { version: 'v4.1.8', color: '#3B82F6', data: [35, 32, 28, 22, 18.2] },
        { version: 'v4.1.5', color: '#8B5CF6', data: [25, 22, 18, 14, 8.5] },
        { version: '其他', color: '#94A3B8', data: [30, 21, 12, 9, 10.9] }
      ]
    },
    penetrationCrash: {
      versions: ['v4.0.5', 'v4.0.8', 'v4.1.0', 'v4.1.5', 'v4.1.8', 'v4.2.1'],
      penetration: [60.0, 62.4, 65.8, 62.1, 67.4, 75.2],
      crash: [0.92, 0.51, 0.38, 0.42, 0.35, 0.12]
    },
    aiInsight: {
      bullets: [
        'v4.2.1 ECPM提升+12.8%，建议加速推动老版本用户升级',
        'v4.1.8及以下版本崩溃率较高，建议重点关注并引导升级',
        'v4.2.1广告用户渗透率75.2%创历史新高，广告体验优化效果显著'
      ]
    }
  }
  return Promise.resolve<IaaVersionTabData>(data)
  // 后端就绪后改为:
  // return request.post<IaaVersionTabData>({ url: `${IAA_BASE}/overview/version-tab`, data: params })
}

// ---------- IAP 分析 ----------

/** IAP 筛选下拉选项（Mock：后端就绪后改为 request.get） */
export function fetchIapMetaFilterOptions() {
  return Promise.resolve<IapFilterOptions>({
    appOptions: [
      { label: '全部应用', value: 'all' },
      { label: 'PhoneTracker', value: 'phonetracker' },
      { label: 'YearCam', value: 'yearcam' }
    ],
    platformOptions: [
      { label: '全部', value: 'all' },
      { label: 'Android', value: 'android' },
      { label: 'iOS', value: 'ios' }
    ],
    countryOptions: [
      { label: '全部', value: 'all' },
      { label: '美国', value: 'US' },
      { label: '韩国', value: 'KR' }
    ],
    productTypeOptions: [
      { label: '全部', value: 'all' },
      { label: '内购', value: 'iap' },
      { label: '订阅', value: 'sub' }
    ],
    timeRangeOptions: [
      { label: '最近7天', value: '7' },
      { label: '最近30天', value: '30' },
      { label: '最近90天', value: '90' }
    ]
  })
}

/** IAP Overview - 总览表格（树形，Mock：后端就绪后改为 request.post） */
export function fetchIapOverviewTable(_params: {
  timeRange: string
  s_app_id?: string
  productType?: string
  s_country_code?: string
  platform?: string
}) {
  return Promise.resolve<{ list: IapOverviewRow[]; summary: IapOverviewSummary }>({
    list: [
      {
        id: '1',
        name: 'Weather5',
        platform: '安卓',
        adPlatform: 'google',
        evalDays: '3天',
        targetReq: '53%',
        minReq: '50%',
        difficulty: '1.2',
        minProfit: '—',
        adSpend: '$12,450',
        calcCost: '$11,800',
        roi: '91%',
        proxyCost: '$2,100',
        estProfit: '+$3,240',
        cpa: '$2.21',
        score: 28,
        status: '投放中',
        icon: 'Cloudy',
        iconBg: 'linear-gradient(135deg,#0ea5e9,#38bdf8)'
      },
      {
        id: '2',
        name: 'Weather8',
        platform: '安卓',
        adPlatform: 'all',
        adSpend: '$8,200',
        calcCost: '$7,600',
        roi: '53%',
        proxyCost: '$1,200',
        estProfit: '+$1,840',
        status: '投放中',
        icon: 'Cloudy',
        iconBg: 'linear-gradient(135deg,#f59e0b,#fbbf24)',
        hasChildren: true,
        children: [
          {
            id: '2-1',
            name: 'Weather8',
            platform: '安卓',
            adPlatform: 'facebook',
            evalDays: '3天',
            targetReq: '53%',
            minReq: '50%',
            difficulty: '1.2',
            adSpend: '$4,800',
            calcCost: '$4,800',
            roi: '53%',
            proxyCost: '$800',
            estProfit: '-$340',
            cpa: '$2.45',
            score: 0,
            status: '投放中',
            icon: 'Cloudy',
            iconBg: 'linear-gradient(135deg,#f59e0b,#fbbf24)',
            isChild: true
          }
        ]
      },
      {
        id: '3',
        name: 'PhoneTracker2',
        platform: '安卓',
        adPlatform: 'google',
        evalDays: '3天',
        targetReq: '100%',
        minReq: '97%',
        difficulty: '1',
        adSpend: '$6,800',
        calcCost: '$6,400',
        roi: '98%',
        proxyCost: '$1,100',
        estProfit: '+$2,180',
        cpa: '$1.89',
        score: 25,
        status: '投放中',
        icon: 'Iphone',
        iconBg: 'linear-gradient(135deg,#6c63ff,#a78bfa)'
      },
      {
        id: '4',
        name: 'PhoneTracker2',
        platform: '安卓',
        adPlatform: 'facebook',
        evalDays: '1天',
        targetReq: '97%',
        minReq: '92%',
        difficulty: '1',
        adSpend: '$4,200',
        calcCost: '$3,900',
        roi: '94%',
        proxyCost: '$680',
        estProfit: '+$1,240',
        cpa: '$2.12',
        score: 22,
        status: '投放中',
        icon: 'Iphone',
        iconBg: 'linear-gradient(135deg,#6c63ff,#a78bfa)'
      },
      {
        id: '5',
        name: 'BloodSugar2',
        platform: '安卓',
        adPlatform: 'google',
        evalDays: '3天',
        targetReq: '100%',
        minReq: '95%',
        difficulty: '1',
        adSpend: '$9,760',
        calcCost: '$9,200',
        roi: '96%',
        proxyCost: '$1,800',
        estProfit: '+$3,120',
        cpa: '$2.08',
        score: 26,
        status: '投放中',
        icon: 'Sugar',
        iconBg: 'linear-gradient(135deg,#ef4444,#f87171)'
      },
      {
        id: '6',
        name: 'CPUMonitor',
        platform: '安卓',
        adPlatform: 'google',
        evalDays: '3天',
        targetReq: '95%',
        minReq: '93%',
        difficulty: '1',
        adSpend: '$3,200',
        calcCost: '$3,000',
        roi: '98%',
        proxyCost: '$480',
        estProfit: '-$120',
        cpa: '$2.38',
        score: 0,
        status: '投放中',
        statusNote: '变更: 2026-02-28',
        icon: 'Monitor',
        iconBg: 'linear-gradient(135deg,#10b981,#34d399)'
      },
      {
        id: '7',
        name: 'Dressup',
        platform: '安卓',
        adPlatform: 'google',
        evalDays: '3天',
        targetReq: '75%',
        minReq: '70%',
        difficulty: '0.7',
        minProfit: '$45,000',
        adSpend: '$4,850',
        calcCost: '$4,500',
        roi: '72%',
        proxyCost: '$620',
        estProfit: '+$1,890',
        cpa: '$18.50',
        score: 18,
        status: '投放中',
        statusBadge: 'CPA≤$25',
        icon: 'Brush',
        iconBg: 'linear-gradient(135deg,#ec4899,#f472b6)'
      }
    ],
    summary: {
      adSpend: '$36,600',
      calcCost: '$34,200',
      avgRoi: '88%',
      proxyCost: '$6,180',
      estProfit: '$8,450',
      avgCpa: '$2.21',
      score: '92分'
    }
  })
  // 后端就绪后改为:
  // return request.post<{ list: IapOverviewRow[]; summary: IapOverviewSummary }>({ url: `${IAP_BASE}/overview/table`, data: params })
}

/** IAP Dashboard - 顶部 KPI（Mock：后端就绪后改为 request.post） */
export function fetchIapOverviewKpi(_params: {
  timeRange: string
  s_app_id?: string
  productType?: string
  s_country_code?: string
  platform?: string
}) {
  return Promise.resolve<{ kpis: IapKpiCard[] }>({
    kpis: [
      {
        label: '订单数',
        value: '45,234',
        change: '8.3%',
        up: true,
        borderColor: '#0ea5e9',
        sparkColor: '#0ea5e9'
      },
      {
        label: '总收入(USD)',
        value: '$2.88M',
        change: '12.5%',
        up: true,
        borderColor: '#6366f1',
        sparkColor: '#818cf8'
      },
      {
        label: 'ARPU',
        value: '$12.45',
        change: '3.2%',
        up: true,
        borderColor: '#06b6d4',
        sparkColor: '#22d3ee'
      },
      {
        label: '转化率',
        value: '3.24%',
        change: '1.5%',
        up: false,
        borderColor: '#a855f7',
        sparkColor: '#c084fc'
      },
      {
        label: '续费率',
        value: '42.8%',
        change: '5.1%',
        up: true,
        borderColor: '#f59e0b',
        sparkColor: '#fbbf24'
      },
      {
        label: '退款率',
        value: '2.15%',
        change: '0.8%',
        up: false,
        warn: true,
        borderColor: '#ef4444',
        sparkColor: '#f87171'
      }
    ]
  })
}

/** IAP Dashboard - 趋势图（Mock：后端就绪后改为 request.post） */
export function fetchIapOverviewTrend(_params: {
  timeRange: string
  s_app_id?: string
  productType?: string
  s_country_code?: string
  platform?: string
}) {
  return Promise.resolve<IapOverviewTrend>({
    ordersRevenue: {
      dates: ['2/4', '2/5', '2/6', '2/7', '2/8', '2/9', '2/10'],
      orders: [3200, 3500, 3800, 3600, 4100, 3900, 4200],
      revenue: [620000, 680000, 710000, 690000, 750000, 730000, 780000]
    },
    conversion: {
      dates: ['2/4', '2/5', '2/6', '2/7', '2/8', '2/9', '2/10'],
      values: [2.8, 3.0, 3.2, 3.1, 3.4, 3.3, 3.5]
    },
    arpu: {
      dates: ['2/4', '2/5', '2/6', '2/7', '2/8', '2/9', '2/10'],
      values: [11.2, 11.8, 12.0, 11.9, 12.2, 12.1, 12.5]
    }
  })
}

/** IAP Dashboard - 应用卡片列表（Mock：后端就绪后改为 request.post） */
export function fetchIapOverviewAppCards(_params: {
  timeRange: string
  s_app_id?: string
  productType?: string
  s_country_code?: string
  platform?: string
}) {
  return Promise.resolve<{ list: IapAppCard[] }>({
    list: [
      {
        name: 'PhoneTracker',
        platform: 'Android',
        orders: '8,950',
        revenue: '$560K',
        arpu: '$11.20',
        change: '12.3%',
        up: true,
        icon: 'Iphone',
        iconBg: 'linear-gradient(135deg,#6366f1,#8b5cf6)'
      },
      {
        name: 'YearCam',
        platform: 'iOS',
        orders: '7,200',
        revenue: '$480K',
        arpu: '$12.10',
        change: '8.5%',
        up: true,
        icon: 'Camera',
        iconBg: 'linear-gradient(135deg,#0ea5e9,#38bdf8)'
      },
      {
        name: 'FaceMe',
        platform: 'iOS',
        orders: '6,500',
        revenue: '$390K',
        arpu: '$10.50',
        change: '4.2%',
        up: true,
        icon: 'VideoCamera',
        iconBg: 'linear-gradient(135deg,#3b82f6,#60a5fa)'
      },
      {
        name: 'Weather5',
        platform: 'Android',
        orders: '5,800',
        revenue: '$310K',
        arpu: '$9.80',
        change: '2.1%',
        up: true,
        icon: 'Sunny',
        iconBg: 'linear-gradient(135deg,#f59e0b,#fbbf24)'
      },
      {
        name: 'VideoDownloader',
        platform: 'Android',
        orders: '4,100',
        revenue: '$220K',
        arpu: '$13.20',
        change: '6.7%',
        up: true,
        icon: 'Download',
        iconBg: 'linear-gradient(135deg,#ef4444,#f87171)'
      }
    ]
  })
}

/** IAP Dashboard - 国家收入分布（Mock：后端就绪后改为 request.post） */
export function fetchIapOverviewCountryDistribution(_params: {
  timeRange: string
  s_app_id?: string
  productType?: string
  s_country_code?: string
  platform?: string
}) {
  return Promise.resolve<{ list: IapCountryRow[] }>({
    list: [
      {
        s_country_code: 'US',
        country: '美国',
        flag: '🇺🇸',
        orders: 12450,
        revenue: '$1.2M',
        ratio: '41.7%',
        arpu: '$96.38'
      },
      {
        s_country_code: 'KR',
        country: '韩国',
        flag: '🇰🇷',
        orders: 8320,
        revenue: '$650K',
        ratio: '22.6%',
        arpu: '$78.12'
      },
      {
        s_country_code: 'DE',
        country: '德国',
        flag: '🇩🇪',
        orders: 6820,
        revenue: '$660K',
        ratio: '10.2%',
        arpu: '$96.38'
      },
      {
        s_country_code: 'JP',
        country: '日本',
        flag: '🇯🇵',
        orders: 8500,
        revenue: '$350K',
        ratio: '6.5%',
        arpu: '$41.18'
      },
      {
        s_country_code: 'GB',
        country: '英国',
        flag: '🇬🇧',
        orders: 4800,
        revenue: '$280K',
        ratio: '6.5%',
        arpu: '$58.33'
      },
      {
        s_country_code: 'FR',
        country: '法国',
        flag: '🇫🇷',
        orders: 1200,
        revenue: '$230K',
        ratio: '2.7%',
        arpu: '$191.67'
      },
      {
        s_country_code: 'BR',
        country: '巴西',
        flag: '🇧🇷',
        orders: 900,
        revenue: '$145K',
        ratio: '2.3%',
        arpu: '$161.11'
      },
      {
        s_country_code: 'IN',
        country: '印度',
        flag: '🇮🇳',
        orders: 200,
        revenue: '$12K',
        ratio: '0.3%',
        arpu: '$60.00'
      }
    ]
  })
}

/** IAP Dashboard - 产品类型甜甜圈（Mock：后端就绪后改为 request.post） */
export function fetchIapOverviewProductTypeDonut(_params: {
  timeRange: string
  s_app_id?: string
  s_country_code?: string
  platform?: string
}) {
  return Promise.resolve<{ list: IapProductTypeDonutItem[] }>({
    list: [
      { name: '内购', value: 42, percent: 42, amount: '$1.21M' },
      { name: '订阅', value: 58, percent: 58, amount: '$1.67M' }
    ]
  })
}

/** IAP Dashboard - 平台对比（Mock：后端就绪后改为 request.post） */
export function fetchIapOverviewPlatformCompare(_params: {
  timeRange: string
  s_app_id?: string
  s_country_code?: string
}) {
  return Promise.resolve<IapPlatformCompare>({
    dimensions: ['订单数', '收入', 'ARPU'],
    ios: [28, 32, 38],
    android: [22, 26, 30]
  })
}

/** IAP Detail - 详情页 KPI（Mock：后端就绪后改为 request.post） */
export function fetchIapDetailKpi(_params: {
  s_app_id: string
  timeRange: string
  s_country_code?: string
  platform?: string
}) {
  return Promise.resolve<{ kpis: IapKpiCard[] }>({
    kpis: [
      {
        label: '订单数',
        value: '8,950',
        change: '12.3%',
        up: true,
        borderColor: '#00c9a7',
        sparkColor: '#00c9a7',
        sparklineValues: [38, 42, 41, 45, 47, 46, 49, 50, 48, 52, 54, 53]
      },
      {
        label: '总收入',
        value: '$560K',
        change: '15.2%',
        up: true,
        borderColor: '#6c63ff',
        sparkColor: '#a78bfa',
        sparklineValues: [60, 63, 62, 65, 67, 66, 69, 71, 70, 72, 74, 73]
      },
      {
        label: 'ARPU',
        value: '$11.20',
        change: '2.8%',
        up: true,
        borderColor: '#3b82f6',
        sparkColor: '#60a5fa',
        sparklineValues: [20, 21, 22, 22.5, 23, 23.2, 23.5, 24, 23.8, 24.2, 24.5, 24.4]
      },
      {
        label: '转化率',
        value: '4.12%',
        change: '0.8%',
        up: false,
        borderColor: '#f59e0b',
        sparkColor: '#fbbf24',
        sparklineValues: [3.0, 3.2, 3.1, 3.3, 3.4, 3.35, 3.45, 3.5, 3.48, 3.6, 3.58, 3.62]
      },
      {
        label: '续费率',
        value: '48.5%',
        change: '3.2%',
        up: true,
        borderColor: '#10b981',
        sparkColor: '#34d399',
        sparklineValues: [40, 42, 44, 45, 46, 47, 48, 49, 48, 50, 52, 51]
      },
      {
        label: '退款率',
        value: '1.85%',
        change: '0.3%',
        up: false,
        borderColor: '#ef4444',
        sparkColor: '#f87171',
        sparklineValues: [2.2, 2.1, 2.0, 2.05, 1.95, 1.9, 1.85, 1.88, 1.8, 1.76, 1.78, 1.74]
      }
    ]
  })
}

/** IAP Detail - 产品 Tab（Mock：后端就绪后改为 request.post） */
export function fetchIapDetailProduct(_params: {
  s_app_id: string
  timeRange: string
  s_country_code?: string
  platform?: string
}) {
  return Promise.resolve<IapDetailProduct>({
    skuList: [
      {
        name: 'Annual Premium',
        type: '订阅',
        orders: 1280,
        revenue: '$192K',
        ratio: '34.3%',
        arpu: '$45.20',
        conversion: '4.2%',
        retention: '68.5%',
        churn: '0.8%',
        trend: '↑',
        trendUp: true,
        sparklineValues: [12, 14, 13, 16, 18, 17, 19, 21, 20, 22, 23, 24]
      },
      {
        name: 'Monthly Premium',
        type: '订阅',
        orders: 3450,
        revenue: '$138K',
        ratio: '24.6%',
        arpu: '$8.50',
        conversion: '3.8%',
        retention: '52.3%',
        churn: '1.2%',
        trend: '↓',
        trendUp: false,
        sparklineValues: [22, 20, 19, 18, 17, 16, 15, 14, 14.5, 13.5, 13, 12.5]
      },
      {
        name: 'Lifetime Unlock',
        type: '内购',
        orders: 890,
        revenue: '$133.5K',
        ratio: '23.8%',
        arpu: '$89.99',
        conversion: '2.1%',
        retention: 'N/A',
        churn: '1.5%',
        trend: '↑',
        trendUp: true,
        sparklineValues: [9, 10, 10.5, 11, 12, 12.5, 13, 14, 13.8, 14.5, 15, 15.5]
      }
    ],
    userSegments: [
      {
        label: '高价值(Top10%)',
        count: '895人',
        pct: '78%',
        arpu: 'ARPU $45.20',
        color: '#6c63ff'
      },
      {
        label: '中高价值(10-30%)',
        count: '1,790人',
        pct: '55%',
        arpu: 'ARPU $18.50',
        color: '#3b82f6'
      },
      {
        label: '中低价值(30-60%)',
        count: '2,685人',
        pct: '38%',
        arpu: 'ARPU $8.80',
        color: '#10b981'
      },
      {
        label: '低价值(Bottom40%)',
        count: '3,580人',
        pct: '20%',
        arpu: 'ARPU $2.10',
        color: '#f59e0b'
      }
    ],
    subscriptionDonut: [
      { name: '周订阅', pct: '15%', value: 15, color: '#6c63ff' },
      { name: '月订阅', pct: '38%', value: 38, color: '#3b82f6' },
      { name: '季订阅', pct: '22%', value: 22, color: '#10b981' },
      { name: '年订阅', pct: '25%', value: 25, color: '#f59e0b' }
    ],
    subscriptionTotal: '5,990',
    renewChart: {
      categories: ['第1次', '第2次', '第3次', '第4次+'],
      counts: [2650, 1710, 1026, 718],
      rates: [100, 65, 39, 27]
    }
  })
}

/** IAP Detail - 用户 Tab（Mock：后端就绪后改为 request.post） */
export function fetchIapDetailUser(_params: {
  s_app_id: string
  timeRange: string
  s_country_code?: string
  platform?: string
}) {
  return Promise.resolve<IapDetailUser>({
    userValueTable: [
      {
        segment: '高价值(Top10%)',
        count: '895',
        ratio: '10%',
        arpu: '$45.20',
        conversion: '7.8%',
        retention: '78.3%',
        churn: '0.6%'
      },
      {
        segment: '中高价值(10-30%)',
        count: '1,790',
        ratio: '20%',
        arpu: '$18.50',
        conversion: '5.2%',
        retention: '55.2%',
        churn: '1.2%'
      },
      {
        segment: '中低价值(30-60%)',
        count: '2,685',
        ratio: '30%',
        arpu: '$8.80',
        conversion: '3.1%',
        retention: '38.5%',
        churn: '1.8%'
      },
      {
        segment: '低价值(Bottom40%)',
        count: '3,580',
        ratio: '40%',
        arpu: '$2.10',
        conversion: '1.6%',
        retention: '15.9%',
        churn: '9.8%'
      }
    ],
    countryChartData: {
      countries: ['美国', '韩国', '德国', '英国', '法国', '日本', '澳大利亚', '加拿大', '墨西哥'],
      counts: [3500, 2800, 1200, 980, 750, 500, 310, 280, 250],
      arpu: [14.5, 13.2, 15.8, 11.2, 9.8, 8.5, 13.4, 12.1, 7.2]
    },
    userCompareData: {
      categories: ['新用户', '老用户', '回归用户'],
      conversion: [2.1, 5.8, 4.2],
      arpu: [6.5, 15.2, 11.8]
    },
    firstPayData: {
      categories: ['安装当天', 'D1-03', 'D4-07', 'D8-14', 'D15-030', 'D30+'],
      values: [28, 15, 22, 18, 12, 5]
    }
  })
}

/** IAP Detail - 趋势 Tab（Mock：后端就绪后改为 request.post） */
export function fetchIapDetailTrend(_params: {
  s_app_id: string
  timeRange: string
  s_country_code?: string
  platform?: string
}) {
  return Promise.resolve<IapDetailTrend>({
    ordersRevenue: {
      dates: ['03/01', '03/02', '03/03', '03/04', '03/05'],
      orders: [280, 310, 290, 320, 300],
      revenue: [12500, 14200, 13800, 15100, 14500]
    },
    arpuTrend: {
      dates: ['03/01', '03/02', '03/03', '03/04', '03/05'],
      values: [11.2, 11.5, 11.8, 11.6, 12.0]
    },
    conversionRetention: {
      dates: ['03/01', '03/02', '03/03', '03/04', '03/05'],
      conversion: [4.0, 4.2, 4.1, 4.3, 4.2],
      retention: [47, 48, 49, 48.5, 50]
    },
    churnTrend: {
      dates: ['03/01', '03/02', '03/03', '03/04', '03/05'],
      values: [1.8, 1.9, 1.7, 2.0, 1.85]
    },
    churnThreshold: 2
  })
}
