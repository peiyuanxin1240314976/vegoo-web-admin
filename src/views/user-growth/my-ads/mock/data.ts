/**
 * 我的广告 - Mock 数据
 */
import type { MyAdsPageData } from '../types'

export const MOCK_MY_ADS_DATA: MyAdsPageData = {
  user: {
    name: '张三',
    role: '高级投放师',
    avatarLetter: '张',
    apps: ['Weather5', 'BloodSugar2', 'PhoneTracker']
  },
  kpi: [
    { label: '广告支出', value: '$12,200', sub: '↑8.5%', trend: 'up', type: 'primary' },
    { label: '计算消耗', value: '$11,480', sub: '差异 -$720', type: 'default' },
    { label: '代投消耗', value: '$8,960', sub: '占比 73.4%', type: 'default' },
    {
      label: '首日ROI',
      value: '38.2%',
      sub: '目标 35%↑',
      trend: 'up',
      trendText: '目标 35%↑',
      type: 'warning'
    },
    { label: '预估利润', value: '$4,660', sub: '利润率 0.2%', type: 'success' },
    { label: '最低利润', value: '$2,100', sub: '安全边界', type: 'success' }
  ],
  dateRange: ['2026-02-23', '2026-03-01'],
  summary: {
    kpiCards: [
      {
        title: '本期广告支出',
        value: '$12,200',
        valueType: 'primary',
        line1: '计算消耗 $11,480 差异 -$720',
        line2: '上期 $11,250 环比 +8.5%'
      },
      {
        title: '代投消耗占比',
        value: '73.4%',
        valueType: 'primary',
        line1: '代投 $8,960 / 直投 $2,520',
        line2: '上期占比 71.3% 环比 +2.1%'
      },
      {
        title: '平均首日ROI',
        value: '38.2%',
        valueType: 'warning',
        line1: '目标 35.0% 超目标 +3.2%',
        line2: '上期 36.1% | 环比 +2.1pp'
      },
      {
        title: '预估利润',
        value: '$4,660',
        valueType: 'success',
        line1: '最低利润 $2,100',
        line2: '利润率 38.2% 不盈利广告 1条'
      }
    ],
    trend: [
      { date: '2/23', adSpend: 1650, estimatedProfit: 620, firstDayRoi: 36 },
      { date: '2/24', adSpend: 1720, estimatedProfit: 680, firstDayRoi: 39 },
      { date: '2/25', adSpend: 1580, estimatedProfit: 590, firstDayRoi: 35 },
      { date: '2/26', adSpend: 1890, estimatedProfit: 720, firstDayRoi: 41 },
      { date: '2/27', adSpend: 1840, estimatedProfit: 680, firstDayRoi: 40 },
      { date: '2/28', adSpend: 1760, estimatedProfit: 710, firstDayRoi: 38 },
      { date: '3/1', adSpend: 1760, estimatedProfit: 660, firstDayRoi: 38 }
    ],
    channelDistribution: [
      { name: '谷歌', value: 5200, percent: 42 },
      { name: 'Meta', value: 3400, percent: 28 },
      { name: 'TikTok', value: 1700, percent: 14 },
      { name: 'ASA', value: 1220, percent: 10 },
      { name: '其他', value: 680, percent: 6 }
    ],
    appSpend: [
      { appName: '天气预报', percent: 59, spend: 7300, firstDayRoi: 39.2, roiTrend: 'up' },
      { appName: '血糖监测', percent: 26, spend: 3200, firstDayRoi: 29.4, roiTrend: 'down' },
      { appName: '手机追踪', percent: 15, spend: 1700, firstDayRoi: 36.5, roiTrend: 'up' }
    ],
    paceMonitor: [
      {
        name: 'Weather5 US Google',
        spend: 5200,
        budget: 6500,
        progress: 80,
        firstDayRoi: 41.2,
        status: 'normal',
        statusText: '● 正常'
      },
      {
        name: 'Weather5 JP Meta',
        spend: 2100,
        budget: 2800,
        progress: 75,
        firstDayRoi: 35.8,
        status: 'normal',
        statusText: '● 正常'
      },
      {
        name: 'BloodSugar2 UK Google',
        spend: 3200,
        budget: 3500,
        progress: 91,
        firstDayRoi: 29.4,
        status: 'over_budget',
        statusText: '▲ 超预算'
      },
      {
        name: 'Phone Tracker CA TikTok',
        spend: 1700,
        budget: 2200,
        progress: 77,
        firstDayRoi: 36.5,
        status: 'normal',
        statusText: '● 正常'
      },
      {
        name: 'Weather5 AU Google',
        spend: 0,
        budget: 1000,
        progress: 0,
        firstDayRoi: null,
        status: 'not_started',
        statusText: '● 未启动'
      }
    ],
    paceRemainingDays: 3
  },
  appPlatform: {
    groupBy: 'platform',
    viewDesc: '应用视角 | 展示各应用在各广告平台的广告数据',
    appGroups: [
      {
        appName: '天气预报',
        appIcon: 'weather',
        totalSpend: 7300,
        avgFirstDayRoi: 39.2,
        platformCount: 3,
        platforms: [
          {
            platformName: '谷歌广告',
            country: '美国',
            countryCode: 'US',
            status: 'active',
            statusText: '激活',
            spend: 5200,
            budget: 6500,
            progress: 80,
            firstDayRoi: 41.2,
            roiTarget: 35,
            minConsumption: 4100,
            cpi: 2.37
          },
          {
            platformName: 'Meta广告',
            country: '日本',
            countryCode: 'JP',
            status: 'active',
            statusText: '激活',
            spend: 2100,
            budget: 2800,
            progress: 75,
            firstDayRoi: 35.8,
            roiTarget: 35,
            minConsumption: 1680,
            cpi: 2.38
          },
          {
            platformName: '谷歌广告',
            country: '澳大利亚',
            countryCode: 'AU',
            status: 'inactive',
            statusText: '未启动',
            spend: 0,
            budget: 1000,
            progress: 0,
            firstDayRoi: null,
            roiTarget: 35,
            minConsumption: 750,
            cpi: null
          }
        ]
      },
      {
        appName: '血糖监测',
        appIcon: 'blood',
        totalSpend: 4090,
        avgFirstDayRoi: 34.15,
        platformCount: 2,
        platforms: [
          {
            platformName: '谷歌广告',
            country: '英国',
            countryCode: 'UK',
            status: 'over_budget',
            statusText: '▲ 超预算',
            warning: 'ROI未达标,预估不盈利',
            spend: 3200,
            budget: 3500,
            progress: 91,
            firstDayRoi: 29.4,
            roiTarget: 35,
            roiTrend: 'down',
            minConsumption: 2450,
            cpi: 2.38,
            isWarning: true
          },
          {
            platformName: 'Meta广告',
            country: '美国',
            countryCode: 'US',
            status: 'active',
            statusText: '激活',
            spend: 890,
            budget: 1200,
            progress: 74,
            firstDayRoi: 38.9,
            roiTarget: 35,
            minConsumption: 670,
            cpi: 2.41
          }
        ]
      },
      {
        appName: '手机追踪',
        appIcon: 'phone',
        totalSpend: 1700,
        avgFirstDayRoi: 36.5,
        platformCount: 1,
        platforms: [
          {
            platformName: 'TikTok广告',
            country: '加拿大',
            countryCode: 'CA',
            status: 'active',
            statusText: '激活',
            spend: 1700,
            budget: 2200,
            progress: 77,
            firstDayRoi: 36.5,
            roiTarget: 35,
            minConsumption: 1280,
            cpi: 2.26
          }
        ]
      }
    ],
    footer: {
      appCount: 3,
      campaignCount: 6,
      totalSpend: 12200,
      overBudgetCount: 1,
      roiBelowCount: 1,
      notStartedCount: 1,
      avgFirstDayRoi: 38.2,
      estimatedTotalProfit: 4660,
      minTotalProfit: 2100
    }
  },
  campaignDetail: {
    filters: {
      app: '',
      platform: '',
      country: '',
      status: '',
      type: ''
    },
    list: [
      {
        id: '1',
        appName: '天气预报',
        campaignName: 'Weather5_US_Google_CRE001',
        channel: 'Google',
        country: '美国',
        countryCode: 'US',
        status: 'active',
        statusText: '激活',
        spend: 5200,
        budget: 6500,
        progress: 80,
        calculatedConsumption: 4890,
        commissionConsumption: 3580,
        firstDayRoi: 41.2,
        minConsumption: 4100,
        estimatedProfit: 1640,
        minProfit: 820,
        cpi: 2.37,
        trend: [4200, 4500, 4600, 4800, 4850, 4890]
      },
      {
        id: '2',
        appName: '天气预报',
        campaignName: 'Weather5_JP_Facebook_CRE002',
        channel: 'Facebook',
        country: '日本',
        countryCode: 'JP',
        status: 'active',
        statusText: '激活',
        spend: 2100,
        budget: 2800,
        progress: 75,
        calculatedConsumption: 1980,
        commissionConsumption: 1450,
        firstDayRoi: 35.8,
        minConsumption: 1680,
        estimatedProfit: 580,
        minProfit: 290,
        cpi: 2.38,
        trend: [1900, 1920, 1950, 1960, 1970, 1980]
      },
      {
        id: '3',
        appName: '血糖监测',
        campaignName: 'BloodSugar2_UK_Google_CRE003',
        channel: 'Google',
        country: '英国',
        countryCode: 'UK',
        status: 'over_budget',
        statusText: '▲ 超预算',
        spend: 3200,
        budget: 3500,
        progress: 91,
        calculatedConsumption: 3010,
        commissionConsumption: 2200,
        firstDayRoi: 29.4,
        minConsumption: 2450,
        estimatedProfit: -340,
        minProfit: -680,
        cpi: 2.38,
        trend: [3200, 3100, 3050, 3040, 3020, 3010]
      },
      {
        id: '4',
        appName: '血糖监测',
        campaignName: 'BloodSugar2_US_Meta_CRE004',
        channel: 'Meta',
        country: '美国',
        countryCode: 'US',
        status: 'active',
        statusText: '激活',
        spend: 890,
        budget: 1200,
        progress: 74,
        calculatedConsumption: 840,
        commissionConsumption: 620,
        firstDayRoi: 38.9,
        minConsumption: 670,
        estimatedProfit: 210,
        minProfit: 105,
        cpi: 2.41,
        trend: [800, 810, 820, 830, 835, 840]
      },
      {
        id: '5',
        appName: '天气预报',
        campaignName: 'Weather5_AU_Google_CRE005',
        channel: 'Google',
        country: '澳大利亚',
        countryCode: 'AU',
        status: 'inactive',
        statusText: '未启动',
        spend: 0,
        budget: 1000,
        progress: 0,
        calculatedConsumption: 0,
        commissionConsumption: 0,
        firstDayRoi: null,
        minConsumption: 750,
        estimatedProfit: 0,
        minProfit: 0,
        cpi: null,
        trend: []
      },
      {
        id: '6',
        appName: '手机追踪',
        campaignName: 'PhoneTracker_CA_TikTok_CRE006',
        channel: 'TikTok',
        country: '加拿大',
        countryCode: 'CA',
        status: 'active',
        statusText: '激活',
        spend: 1700,
        budget: 2200,
        progress: 77,
        calculatedConsumption: 1600,
        commissionConsumption: 1180,
        firstDayRoi: 36.5,
        minConsumption: 1280,
        estimatedProfit: 420,
        minProfit: 210,
        cpi: 2.26,
        trend: [1500, 1540, 1570, 1585, 1595, 1600]
      }
    ],
    total: 185,
    summaryBar: {
      adSpendSubtotal: 12200,
      calculatedConsumption: 11480,
      difference: -720,
      commissionSubtotal: 8960,
      directConsumption: 2520,
      commissionRatio: 73.4,
      estimatedProfitSubtotal: 4660,
      minProfit: 2100,
      nonProfitableCount: 1
    }
  }
}
