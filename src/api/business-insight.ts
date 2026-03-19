/**
 * 商业洞察 - IAA / IAP 分析 API
 * 接口路径与 mock/backend-api 契约一致，后端就绪后切换为真实 request
 */
/* eslint-disable @typescript-eslint/no-unused-vars -- Mock 接口参数保留供后端联调使用 */
import type {
  IaaFilterOptions,
  IaaKpiCard,
  IaaPlatformTableRow,
  IaaFilterState
} from '@/views/business-insight/iaa-analysis/types'
import type {
  IapFilterOptions,
  IapKpiCard,
  IapOverviewTrend,
  IapAppCard,
  IapCountryRow,
  IapProductTypeDonutItem,
  IapPlatformCompare,
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
        sparkColor: '#00c9a7'
      },
      {
        label: '总收入',
        value: '$560K',
        change: '15.2%',
        up: true,
        borderColor: '#6c63ff',
        sparkColor: '#a78bfa'
      },
      {
        label: 'ARPU',
        value: '$11.20',
        change: '2.8%',
        up: true,
        borderColor: '#3b82f6',
        sparkColor: '#60a5fa'
      },
      {
        label: '转化率',
        value: '4.12%',
        change: '0.8%',
        up: false,
        borderColor: '#f59e0b',
        sparkColor: '#fbbf24'
      },
      {
        label: '续费率',
        value: '48.5%',
        change: '3.2%',
        up: true,
        borderColor: '#10b981',
        sparkColor: '#34d399'
      },
      {
        label: '退款率',
        value: '1.85%',
        change: '0.3%',
        up: false,
        borderColor: '#ef4444',
        sparkColor: '#f87171'
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
        trendUp: true
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
        trendUp: false
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
        trendUp: true
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
