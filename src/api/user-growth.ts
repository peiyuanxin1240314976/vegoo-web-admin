/**
 * 用户增长 - 转化管理 & 整体回收 & 综合分析 & 广告平台分析详情 API
 * 综合分析 / 广告平台分析详情 / 预警管理：当前返回 `mock/data.ts` 本地数据；接入真实接口时在下方方法内改为 `request.post`
 */
/* eslint-disable @typescript-eslint/no-unused-vars -- Mock 接口参数保留供后端联调使用 */
import request from '@/utils/http'
import type {
  OverallRecoveryFilterOptions,
  OverallTabData,
  OrganicTabData
} from '@/views/user-growth/overall-recovery/types'
import type { ComprehensiveAnalysisFilterState } from '@/views/user-growth/comprehensive-analysis/types'
import { buildComprehensiveAnalysisApiParams } from '@/views/user-growth/comprehensive-analysis/utils/buildApiParams'
import {
  buildMockComprehensiveAnalysisData,
  MOCK_COMPREHENSIVE_ANALYSIS_FILTER_OPTIONS
} from '@/views/user-growth/comprehensive-analysis/mock/data'
import { buildMockPlatformAnalysisDetailData } from '@/views/user-growth/platform-analysis-detail/mock/data'
import type {
  AlertManagementOverview,
  AlertManagementOverviewParams
} from '@/views/user-growth/alert-management/types'
import { buildMockAlertManagementOverview } from '@/views/user-growth/alert-management/mock/data'

// ─── 整体回收 ──────────────────────────────────────────────────

/** 整体回收 - 下拉筛选选项 */
export function fetchOverallRecoveryFilterOptions() {
  return Promise.resolve<OverallRecoveryFilterOptions>({
    appOptions: [
      { label: '全部', value: 'all' },
      { label: 'Weather5', value: 'weather5' }
    ],
    channelOptions: [
      { label: '全部', value: 'all' },
      { label: 'Google', value: 'google' },
      { label: 'Facebook', value: 'facebook' },
      { label: 'TikTok', value: 'tiktok' }
    ],
    countryOptions: [
      { label: '全部', value: 'all' },
      { label: '美国', value: 'US' },
      { label: '德国', value: 'DE' },
      { label: '日本', value: 'JP' },
      { label: '韩国', value: 'KR' }
    ]
  })
}

/** 整体回收 - Tab1 整体回收数据 */
export function fetchOverallTabData(_params: {
  dateRange: string
  s_app_id: string
  channel: string
  s_country_code: string
}) {
  const days = ['Day1', 'Day7', 'Day30', 'Day45', 'Day60', 'Day90', 'Day120', 'Day150', 'Day180']
  return Promise.resolve<OverallTabData>({
    kpis: [
      {
        id: 'totalInstall',
        title: '今日总安装',
        primaryValue: '12,485',
        subLabel: '付费',
        subValue: '8,642 + 自然3,843',
        trendText: '+3.2% YoY日',
        trendUp: true
      },
      {
        id: 'organicRatio',
        title: '自然量占比',
        primaryValue: '30.8%',
        subLabel: 'K-factor',
        subValue: '0.43',
        trendText: '+2.1pp',
        trendUp: true
      },
      {
        id: 'effectiveCpi',
        title: '整体有效CPI',
        primaryValue: '$1.67',
        subLabel: '付费',
        subValue: '$2.41',
        trendText: '+5.2% 自然量提高',
        trendUp: true
      },
      {
        id: 'ltv7',
        title: 'LTV7（整体）',
        primaryValue: '$1.24',
        subLabel: '自然量用户人均入',
        trendText: '-8.4%',
        trendUp: false
      },
      {
        id: 'ltv30',
        title: 'LTV30（整体）',
        primaryValue: '$3.85',
        subLabel: '自然量用户人均入',
        trendText: '+12%',
        trendUp: true
      },
      {
        id: 'roiDay30',
        title: '整体ROI Day30',
        primaryValue: '230.5%',
        subLabel: '相比付费212.3%',
        trendText: '+1.8pp 日对照增加',
        trendUp: true
      }
    ],
    recoveryCurve: {
      days,
      series: [
        {
          name: 'Google+自然',
          color: '#4B8EF1',
          data: [18, 65, 135, 165, 190, 230, 265, 285, 300]
        },
        {
          name: 'Facebook+自然',
          color: '#F4923A',
          data: [15, 55, 115, 145, 168, 200, 228, 248, 260]
        },
        {
          name: 'TikTok+自然',
          color: '#A855F7',
          data: [12, 48, 100, 128, 150, 180, 205, 218, 228]
        },
        {
          name: '付费用户',
          color: '#EF4444',
          data: [10, 40, 85, 108, 128, 155, 178, 192, 200],
          dashed: true
        },
        {
          name: '平均线',
          color: '#14B8A6',
          data: [14, 52, 109, 137, 159, 191, 219, 236, 247],
          dashed: true
        }
      ]
    },
    dailyVolume: Array.from({ length: 30 }, (_, i) => ({
      date: `03-${String(i + 1).padStart(2, '0')}`,
      paid: Math.floor(200 + Math.random() * 100),
      organic: Math.floor(80 + Math.random() * 60)
    })),
    roiCompare: [
      { label: '付费', day1: '10%', day14: '85%', day30: '212%', day60: '310%', day90: '380%' },
      {
        label: '整体',
        day1: '12%',
        day14: '95%',
        day30: '230%',
        day60: '335%',
        day90: '412%',
        isHighlight: true
      },
      {
        label: '自然量增益',
        day1: '+2%',
        day14: '+10%',
        day30: '+18%',
        day60: '+25%',
        day90: '+32%'
      }
    ],
    detailRows: [
      {
        date: '03-09',
        adSpend: 8754,
        cpi: 1.13,
        paidUsers: 9557,
        totalUsers: 12400,
        organicUsers: 2843,
        roiDay0: 5.2,
        roiDay1: 9.7,
        roiDay2: 15.4,
        roiDay3: 21.2,
        roiDay5: 33.8,
        roiDay7: 43.1,
        rush: 53,
        threeStar: 62,
        sevenStar: 71,
        retDay1: 38.2,
        retDay3: 25.6,
        retDay7: 18.4
      },
      {
        date: '03-08',
        adSpend: 9216,
        cpi: 1.13,
        paidUsers: 9557,
        totalUsers: 12400,
        organicUsers: 2843,
        roiDay0: 5.1,
        roiDay1: 9.7,
        roiDay2: 15.4,
        roiDay3: 21.2,
        roiDay5: 33.8,
        roiDay7: 43.1,
        rush: 53,
        threeStar: 62,
        sevenStar: 71,
        retDay1: 37.8,
        retDay3: 24.9,
        retDay7: 17.8
      },
      {
        date: '03-07',
        adSpend: 9521,
        cpi: 1.13,
        paidUsers: 9557,
        totalUsers: 12400,
        organicUsers: 2843,
        roiDay0: 5.6,
        roiDay1: 10.2,
        roiDay2: 16.8,
        roiDay3: 23.5,
        roiDay5: 36.2,
        roiDay7: 46.4,
        rush: 55,
        threeStar: 65,
        sevenStar: 74,
        retDay1: 39.1,
        retDay3: 26.3,
        retDay7: 19.2
      },
      {
        date: '03-06',
        adSpend: 8641,
        cpi: 0.13,
        paidUsers: 5735,
        totalUsers: 8203,
        organicUsers: 2468,
        roiDay0: 4.3,
        roiDay1: 7.8,
        roiDay2: 13.2,
        roiDay3: 18.9,
        roiDay5: 30.1,
        roiDay7: 39.8,
        rush: 48,
        threeStar: 58,
        sevenStar: 67,
        retDay1: 35.4,
        retDay3: 22.8,
        retDay7: 15.6
      },
      {
        date: '03-05',
        adSpend: 9865,
        cpi: 0.13,
        paidUsers: 4147,
        totalUsers: 6203,
        organicUsers: 2056,
        roiDay0: 5.5,
        roiDay1: 10.2,
        roiDay2: 16.3,
        roiDay3: 22.8,
        roiDay5: 36.4,
        roiDay7: 46.1,
        rush: 57,
        threeStar: 67,
        sevenStar: 76,
        retDay1: 40.2,
        retDay3: 27.1,
        retDay7: 19.8
      },
      {
        date: '03-04',
        adSpend: 8865,
        cpi: 0.15,
        paidUsers: 4342,
        totalUsers: 6043,
        organicUsers: 1701,
        roiDay0: 4.7,
        roiDay1: 8.5,
        roiDay2: 14.2,
        roiDay3: 19.8,
        roiDay5: 31.6,
        roiDay7: 41.2,
        rush: 50,
        threeStar: 60,
        sevenStar: 69,
        retDay1: 36.8,
        retDay3: 23.5,
        retDay7: 16.9
      }
    ]
  })
}

/** 整体回收 - Tab2 自然量分析数据 */
export function fetchOrganicTabData(_params: {
  dateRange: string
  s_app_id: string
  channel: string
  s_country_code: string
}) {
  const dates = Array.from({ length: 30 }, (_, i) => `03-${String(i + 1).padStart(2, '0')}`)
  return Promise.resolve<OrganicTabData>({
    kpis: [
      {
        id: 'organicInstall',
        title: '自然量安装',
        primaryValue: '3,843',
        trendText: '+14.2%',
        trendUp: true
      },
      {
        id: 'organicRatio',
        title: '自然量占比',
        primaryValue: '30.8%',
        trendText: '+2pp',
        trendUp: true
      },
      { id: 'kfactor', title: 'K-factor', primaryValue: '0.43', trendText: '+0.02', trendUp: true },
      {
        id: 'organicLtv7',
        title: '自然量LTV7',
        primaryValue: '$0',
        trendText: '自然量用户人均广告变现'
      },
      {
        id: 'organicLtv30',
        title: '自然量LTV30',
        primaryValue: '$3.12',
        trendText: '+11.4%',
        trendUp: true
      },
      {
        id: 'roiBoost',
        title: '自然量ROI增幅',
        primaryValue: '+44.3%',
        trendText: '整体 vs 纯付费',
        trendUp: true
      }
    ],
    trendData: dates.map((date, i) => ({
      date,
      organic: Math.floor(100 + Math.sin(i * 0.3) * 40 + Math.random() * 30),
      paid: Math.floor(250 + Math.cos(i * 0.2) * 50 + Math.random() * 40),
      organicRatio: parseFloat((28 + Math.sin(i * 0.4) * 5 + Math.random() * 3).toFixed(1))
    })),
    trafficSources: [
      { name: '广告曝光', value: 38, color: '#4B8EF1' },
      { name: '口碑推荐', value: 32, color: '#14B8A6' },
      { name: '品牌效应', value: 18, color: '#A855F7' },
      { name: '社交分享', value: 12, color: '#F4923A' }
    ],
    radarData: {
      indicators: ['ARPU', 'LTV', 'K-factor', '自然量用户比', '价格弹性'],
      organicValues: [72, 85, 95, 100, 60],
      paidValues: [88, 92, 30, 0, 85]
    },
    kfactorTrend: {
      dates,
      values: dates.map((_, i) =>
        parseFloat((0.38 + Math.sin(i * 0.4) * 0.06 + Math.random() * 0.04).toFixed(2))
      )
    },
    kfactorChannels: [
      {
        channel: 'Google',
        paidInstall: 2845,
        organicDriven: 1456,
        total: 4301,
        kfactor: 0.47,
        roiBoost: 67.2,
        trend: [0.42, 0.44, 0.46, 0.45, 0.47, 0.47, 0.48]
      },
      {
        channel: 'Facebook',
        paidInstall: 3134,
        organicDriven: 1456,
        total: 4590,
        kfactor: 0.47,
        roiBoost: 67.2,
        trend: [0.4, 0.42, 0.43, 0.44, 0.45, 0.46, 0.47]
      },
      {
        channel: 'TikTok',
        paidInstall: 1288,
        organicDriven: 640,
        total: 1928,
        kfactor: 0.43,
        roiBoost: 44.3,
        trend: [0.38, 0.39, 0.41, 0.42, 0.42, 0.43, 0.43]
      },
      {
        channel: 'Montegar',
        paidInstall: 1000,
        organicDriven: 0,
        total: 1000,
        kfactor: 0,
        roiBoost: 0,
        trend: [0, 0, 0, 0, 0, 0, 0]
      },
      {
        channel: '合计',
        paidInstall: 8267,
        organicDriven: 3552,
        total: 11819,
        kfactor: 0.43,
        roiBoost: 44.3,
        trend: [0.4, 0.41, 0.42, 0.43, 0.43, 0.43, 0.43]
      }
    ],
    countryTop8: [
      {
        countryCode: 'US',
        countryName: '美国',
        organicInstall: 1248,
        paidInstall: 3200,
        kfactor: 0.39,
        roiBoost: 35.5,
        organicRatio: 28.1
      },
      {
        countryCode: 'GB',
        countryName: '英国',
        organicInstall: 692,
        paidInstall: 1800,
        kfactor: 0.38,
        roiBoost: 32.1,
        organicRatio: 27.8
      },
      {
        countryCode: 'CA',
        countryName: '加拿大',
        organicInstall: 524,
        paidInstall: 1400,
        kfactor: 0.37,
        roiBoost: 28.4,
        organicRatio: 27.2
      },
      {
        countryCode: 'AU',
        countryName: '澳大利亚',
        organicInstall: 412,
        paidInstall: 1100,
        kfactor: 0.37,
        roiBoost: 27.9,
        organicRatio: 27.3
      },
      {
        countryCode: 'JP',
        countryName: '日本',
        organicInstall: 384,
        paidInstall: 1050,
        kfactor: 0.37,
        roiBoost: 26.8,
        organicRatio: 26.8
      },
      {
        countryCode: 'DE',
        countryName: '德国',
        organicInstall: 248,
        paidInstall: 720,
        kfactor: 0.34,
        roiBoost: 22.3,
        organicRatio: 25.6
      },
      {
        countryCode: 'FR',
        countryName: '法国',
        organicInstall: 169,
        paidInstall: 510,
        kfactor: 0.33,
        roiBoost: 21.5,
        organicRatio: 24.9
      },
      {
        countryCode: 'KR',
        countryName: '韩国',
        organicInstall: 147,
        paidInstall: 460,
        kfactor: 0.32,
        roiBoost: 19.4,
        organicRatio: 24.2
      }
    ]
  })
}

/** 获取转化映射列表（占位：可先使用 views 下 mock 的 fetchConversionMappingListMock） */
export function fetchConversionMappingList(params: Api.UserGrowth.ConversionMappingListParams) {
  return request.get<Api.UserGrowth.ConversionMappingList>({
    url: '/api/user-growth/conversion-mapping/list',
    params
  })
}

/** 获取转化映射详情（占位） */
export function fetchConversionMappingDetail(id: string) {
  return request.get<Api.UserGrowth.ConversionMappingItem>({
    url: `/api/user-growth/conversion-mapping/${id}`
  })
}

/** 新增转化映射（占位） */
export function createConversionMapping(data: Record<string, unknown>) {
  return request.post<unknown>({
    url: '/api/user-growth/conversion-mapping',
    data
  })
}

/** 更新转化映射（占位） */
export function updateConversionMapping(id: string, data: Record<string, unknown>) {
  return request.put<unknown>({
    url: `/api/user-growth/conversion-mapping/${id}`,
    data
  })
}

/** 删除转化映射（占位） */
export function deleteConversionMapping(id: string) {
  return request.del<unknown>({
    url: `/api/user-growth/conversion-mapping/${id}`
  })
}

/** 获取转化管理右侧统计（占位） */
export function fetchConversionStats() {
  return request.get<{
    typeDistribution: Api.UserGrowth.ConversionTypeDistributionItem[]
    mappingStats: Api.UserGrowth.MappingStats
    platformStats: Api.UserGrowth.PlatformStats
  }>({
    url: '/api/user-growth/conversion-mapping/stats'
  })
}

/** 导出映射表（占位） */
export function exportMappingTable(params: Api.UserGrowth.ConversionMappingListParams) {
  return request.get<Blob>({
    url: '/api/user-growth/conversion-mapping/export',
    params,
    responseType: 'blob'
  })
}

// ─── 综合分析 ──────────────────────────────────────────────────

/** 综合分析 - 下拉筛选选项（当前：mock；后端：`POST /api/user-growth/comprehensive-analysis/meta-filter-options`） */
export function fetchComprehensiveAnalysisFilterOptions() {
  return Promise.resolve(MOCK_COMPREHENSIVE_ANALYSIS_FILTER_OPTIONS)
}

/** 综合分析 - 页面 KPI/图表聚合（不含仅前端的 viewMode）（当前：mock；后端：`POST .../overview`） */
export function fetchComprehensiveAnalysisData(
  filters: Pick<
    ComprehensiveAnalysisFilterState,
    'dateRange' | 's_app_id' | 'adPlatform' | 's_country_code'
  >
) {
  return Promise.resolve(
    buildMockComprehensiveAnalysisData(buildComprehensiveAnalysisApiParams(filters))
  )
}

/** 广告平台分析详情页（从综合分析 drill-down 进入）（当前：mock；后端：`POST /api/user-growth/platform-analysis-detail/overview`） */
export function fetchPlatformAnalysisDetailData(params: { name: string; from: string }) {
  return Promise.resolve(buildMockPlatformAnalysisDetailData(params))
}

// ─── 预警管理 ──────────────────────────────────────────────────

/** 预警管理 - 整页聚合（当前：mock；后端：`POST /api/user-growth/alert-management/overview`） */
export function fetchAlertManagementOverview(
  params: AlertManagementOverviewParams
): Promise<AlertManagementOverview> {
  return Promise.resolve(buildMockAlertManagementOverview(params))
  // return request.post<AlertManagementOverview>('/api/user-growth/alert-management/overview', params)
}

/** 广告平台分析大屏 - 筛选下拉元数据 POST /api/v1/datacenter/analysis/ad-platform/filters/meta（请求体 `{}`） */
export function fetchAdPlatformAnalysisFiltersMeta() {
  return request.post<Api.UserGrowth.AdPlatformFiltersMetaDto>({
    url: '/api/v1/datacenter/analysis/ad-platform/filters/meta',
    data: {}
  })
}

/** 广告平台分析大屏 - 第一排 KPI 卡片 POST /api/v1/datacenter/analysis/ad-platform/kpi/cards */
export function fetchAdPlatformAnalysisKpiCards(
  params: Api.UserGrowth.AdPlatformAnalysisRequestParams
) {
  return request.post<Api.UserGrowth.AdPlatformKpiCardDto[]>({
    url: '/api/v1/datacenter/analysis/ad-platform/kpi/cards',
    data: params
  })
}

/** 广告平台分析大屏 - ROI 趋势 POST /api/v1/datacenter/analysis/ad-platform/roi/trend */
export function fetchAdPlatformAnalysisRoiTrend(
  params: Api.UserGrowth.AdPlatformAnalysisRequestParams
) {
  return request.post<Api.UserGrowth.AdPlatformRoiTrendDto>({
    url: '/api/v1/datacenter/analysis/ad-platform/roi/trend',
    data: params
  })
}

/** 广告平台分析大屏 - 用户质量热力图 POST /api/v1/datacenter/analysis/ad-platform/quality/heatmap */
export function fetchAdPlatformAnalysisQualityHeatmap(
  params: Api.UserGrowth.AdPlatformAnalysisRequestParams
) {
  return request.post<Api.UserGrowth.AdPlatformQualityHeatmapRowDto[]>({
    url: '/api/v1/datacenter/analysis/ad-platform/quality/heatmap',
    data: params
  })
}

/** 广告平台分析大屏 - Top10 广告系列 POST /api/v1/datacenter/analysis/ad-platform/campaign/top10 */
export function fetchAdPlatformAnalysisCampaignTop10(
  params: Api.UserGrowth.AdPlatformAnalysisRequestParams
) {
  return request.post<Api.UserGrowth.AdPlatformCampaignTop10RowDto[]>({
    url: '/api/v1/datacenter/analysis/ad-platform/campaign/top10',
    data: params
  })
}

/** 广告平台分析大屏 - 指标比较详情表（分页） POST /api/v1/datacenter/analysis/ad-platform/metrics/table */
export function fetchAdPlatformAnalysisMetricsTable(
  params: Api.UserGrowth.AdPlatformAnalysisRequestParams
) {
  return request.post<Api.UserGrowth.AdPlatformMetricsTableDto>({
    url: '/api/v1/datacenter/analysis/ad-platform/metrics/table',
    data: params
  })
}
