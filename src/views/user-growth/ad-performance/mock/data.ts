/**
 * 广告成效页 Mock 数据（按设计稿还原，后续对接真实接口可整体替换）
 */
import type { AdPerformanceCampaignDetail, AdPerformanceMock } from '../types'

function buildCampaignRows(): AdPerformanceMock['campaignTableRows'] {
  return [
    {
      id: 'c1',
      appId: 'app_weather5',
      appName: 'Weather5',
      name: 'Weather5_US_Google_CRE001',
      channel: 'google',
      country: 'US',
      status: 'active',
      spend: 12450,
      budget: 13000,
      spendBudgetPercent: 83,
      cpi: 2.37,
      ctr: 3.1,
      cvr: 31.2,
      roi1: 85,
      roi7: 94,
      estimatedProfit: 1240,
      children: [
        {
          id: 'c1-1',
          appName: 'Weather5',
          name: 'AdGroup_US_Interest_Broad',
          channel: 'google',
          country: 'US',
          status: 'active',
          spend: 4200,
          budget: 4500,
          spendBudgetPercent: 93,
          cpi: 2.2,
          ctr: 3.2,
          cvr: 32,
          roi1: 86,
          roi7: 95,
          estimatedProfit: 420
        },
        {
          id: 'c1-2',
          appName: 'Weather5',
          name: 'AdGroup_US_Retargeting',
          channel: 'google',
          country: 'US',
          status: 'active',
          spend: 4100,
          budget: 4300,
          spendBudgetPercent: 95,
          cpi: 2.4,
          ctr: 3.0,
          cvr: 30,
          roi1: 84,
          roi7: 93,
          estimatedProfit: 410
        },
        {
          id: 'c1-3',
          appName: 'Weather5',
          name: 'AdGroup_US_Lookalike',
          channel: 'google',
          country: 'US',
          status: 'paused',
          spend: 4150,
          budget: 4200,
          spendBudgetPercent: 99,
          cpi: 2.5,
          ctr: 2.9,
          cvr: 29,
          roi1: 85,
          roi7: 94,
          estimatedProfit: 410
        }
      ]
    },
    {
      id: 'c2',
      appId: 'app_bloodsugar2',
      appName: 'BloodSugar2',
      name: 'BloodSugar2_UK_Facebook_CRE002',
      channel: 'facebook',
      country: 'UK',
      status: 'over_budget',
      spend: 18885,
      budget: 13500,
      spendBudgetPercent: 96,
      cpi: 2.38,
      ctr: 2.1,
      cvr: 22.3,
      roi1: 68,
      roi7: 80,
      estimatedProfit: -1240,
      children: []
    },
    {
      id: 'c3',
      appId: 'app_phonetracker',
      appName: 'PhoneTracker',
      name: 'PhoneTracker_CA_TikTok_CRE003',
      channel: 'tiktok',
      country: 'CA',
      status: 'over_budget',
      spend: 2866,
      budget: 3000,
      spendBudgetPercent: 96,
      cpi: 2.38,
      ctr: 4.2,
      cvr: 35.6,
      roi1: 88,
      roi7: 99,
      estimatedProfit: 340,
      children: []
    },
    {
      id: 'c4',
      appId: 'app_weather5',
      appName: 'Weather5',
      name: 'Weather5_JP_Google_CRE004',
      channel: 'google',
      country: 'JP',
      status: 'active',
      spend: 8372,
      budget: 10000,
      spendBudgetPercent: 84,
      cpi: 2.65,
      ctr: 2.9,
      cvr: 29.8,
      roi1: 84,
      roi7: 95,
      estimatedProfit: 890,
      children: []
    },
    {
      id: 'c5',
      appId: 'app_faceme',
      appName: 'FaceMe',
      name: 'FaceMe_US_Meta_CRE005',
      channel: 'meta',
      country: 'BR',
      status: 'low_efficiency',
      spend: 1926,
      budget: 3000,
      spendBudgetPercent: 54,
      cpi: 2.65,
      ctr: 1.8,
      cvr: 18.9,
      roi1: 72,
      roi7: 84,
      estimatedProfit: -180,
      children: []
    },
    {
      id: 'c6',
      appId: 'app_healthtracker',
      appName: 'HealthTracker',
      name: 'HealthTracker_BR_Kwai_CRE006',
      channel: 'kwai',
      country: 'BR',
      status: 'active',
      spend: 920,
      budget: 1200,
      spendBudgetPercent: 77,
      cpi: 2.45,
      ctr: 5.1,
      cvr: 38.2,
      roi1: 91,
      roi7: 103,
      estimatedProfit: 95,
      children: []
    }
  ]
}

export const MOCK_AD_PERFORMANCE: AdPerformanceMock = {
  dataTime: '14:40:23',
  filter: {
    startDate: '2026-03-05',
    endDate: '2026-03-05',
    appId: '',
    adPlatform: '',
    account: '',
    country: ''
  },
  kpi: [
    {
      type: 'totalSpend',
      label: '总花费',
      value: '$34,858',
      compare: '+8.5%',
      compareUp: true
    },
    {
      type: 'avgCpi',
      label: '平均CPI',
      value: '$2.28',
      compare: '+3.2%',
      compareUp: true
    },
    {
      type: 'activeCampaigns',
      label: '活跃系列',
      value: '604',
      compare: '↓42',
      compareUp: false
    },
    {
      type: 'alertCampaigns',
      label: '异常系列',
      value: '3',
      alert: true
    },
    {
      type: 'todayRoi1',
      label: '今日首日ROI',
      value: '83%',
      compare: '↑2.1%',
      compareUp: true
    },
    {
      type: 'todayProfit',
      label: '今日利润(预估)',
      value: '+$11,021',
      compare: '+5.2%',
      compareUp: true
    }
  ],
  spendTrend: [
    { date: '2/23', value: 28000 },
    { date: '2/24', value: 31000 },
    { date: '2/25', value: 28000 },
    { date: '2/26', value: 33000 },
    { date: '2/27', value: 35000 },
    { date: '2/28', value: 32000 },
    { date: '3/1', value: 35000 }
  ],
  roi7dTrend: [
    { date: '2/23', roi: 79 },
    { date: '2/24', roi: 82 },
    { date: '2/25', roi: 78 },
    { date: '2/26', roi: 85 },
    { date: '2/27', roi: 87 },
    { date: '2/28', roi: 83 },
    { date: '3/1', roi: 83 }
  ],
  channelDistribution: [
    { name: 'Google', value: 18128, percent: 52 },
    { name: 'Facebook', value: 10808, percent: 31 },
    { name: 'TikTok', value: 2789, percent: 8 },
    { name: 'Mintegral', value: 2091, percent: 6 },
    { name: 'Kwai', value: 1046, percent: 3 }
  ],
  appDistribution: [
    { appName: 'Weather5', spend: 15686, percent: 43, ownerShare: 38 },
    { appName: 'BloodSugar2', spend: 9760, percent: 33, ownerShare: 29 },
    { appName: 'PhoneTracker', spend: 4850, percent: 14, ownerShare: 19 },
    { appName: 'FaceMe', spend: 2789, percent: 5, ownerShare: 9 },
    { appName: '其他', spend: 1743, percent: 5, ownerShare: 5 }
  ],
  ownerShareDistribution: [
    { ownerName: '张三', percent: 45, spend: 15686 },
    { ownerName: '李四', percent: 22, spend: 7716 },
    { ownerName: '王五', percent: 18, spend: 6234 },
    { ownerName: '赵六', percent: 10, spend: 3480 },
    { ownerName: '其他', percent: 5, spend: 1742 }
  ],
  campaignTableRows: buildCampaignRows(),
  countryTableRows: [
    {
      id: 'ct1',
      country: 'US',
      spend: 5674,
      spendSharePercent: 16,
      cpi: 1.01,
      ctr: 2.3,
      cvr: 37.3,
      roi1: 80,
      roi3: 89,
      roi7: 90,
      roiTotal: 90,
      estimatedProfit: -577,
      children: [
        {
          id: 'c1',
          appId: 'app_weather5',
          appName: 'Weather5',
          name: 'Weather5_US_Google_CRE001',
          channel: 'google',
          country: 'US',
          status: 'active',
          spend: 12450,
          budget: 13000,
          spendBudgetPercent: 83,
          cpi: 2.37,
          ctr: 3.1,
          cvr: 31.2,
          roi1: 85,
          roi7: 94,
          estimatedProfit: 1240,
          children: []
        },
        {
          id: 'c5',
          appId: 'app_faceme',
          appName: 'FaceMe',
          name: 'FaceMe_US_Meta_CRE005',
          channel: 'meta',
          country: 'US',
          status: 'low_efficiency',
          spend: 1926,
          budget: 3000,
          spendBudgetPercent: 54,
          cpi: 2.65,
          ctr: 1.8,
          cvr: 18.9,
          roi1: 72,
          roi7: 84,
          estimatedProfit: -180,
          children: []
        }
      ]
    },
    {
      id: 'ct2',
      country: 'MX',
      spend: 3274,
      spendSharePercent: 9,
      cpi: 0.16,
      ctr: 2.3,
      cvr: 34.6,
      roi1: 91,
      roi3: 101,
      roi7: 103,
      roiTotal: 103,
      estimatedProfit: 64,
      children: [
        {
          id: 'c3',
          appId: 'app_phonetracker',
          appName: 'PhoneTracker',
          name: 'PhoneTracker_MX_TikTok_CRE003',
          channel: 'tiktok',
          country: 'MX',
          status: 'over_budget',
          spend: 2866,
          budget: 3000,
          spendBudgetPercent: 96,
          cpi: 2.38,
          ctr: 4.2,
          cvr: 35.6,
          roi1: 88,
          roi7: 99,
          estimatedProfit: 340,
          children: []
        }
      ]
    },
    {
      id: 'ct3',
      country: 'CO',
      spend: 2098,
      spendSharePercent: 6,
      cpi: 0.1,
      ctr: 2.1,
      cvr: 31.1,
      roi1: 80,
      roi3: 88,
      roi7: 89,
      roiTotal: 89,
      estimatedProfit: -252
    },
    {
      id: 'ct4',
      country: 'AR',
      spend: 1398,
      spendSharePercent: 4,
      cpi: 0.15,
      ctr: 1.5,
      cvr: 26.0,
      roi1: 77,
      roi3: 86,
      roi7: 86,
      roiTotal: 88,
      estimatedProfit: -182
    },
    {
      id: 'ct5',
      country: 'TH',
      spend: 1231,
      spendSharePercent: 4,
      cpi: 0.19,
      ctr: 4.8,
      cvr: 36.4,
      roi1: 109,
      roi3: 121,
      roi7: 122,
      roiTotal: 122,
      estimatedProfit: 267
    },
    {
      id: 'ct6',
      country: 'VN',
      spend: 1205,
      spendSharePercent: 3,
      cpi: 0.15,
      ctr: 5.9,
      cvr: 27.0,
      roi1: 90,
      roi3: 99,
      roi7: 100,
      roiTotal: 100,
      estimatedProfit: -14
    },
    {
      id: 'ct7',
      country: 'BR',
      spend: 1106,
      spendSharePercent: 3,
      cpi: 0.18,
      ctr: 7.3,
      cvr: 37.3,
      roi1: 83,
      roi3: 89,
      roi7: 90,
      roiTotal: 90,
      estimatedProfit: -116
    },
    {
      id: 'ct8',
      country: 'ES',
      spend: 1028,
      spendSharePercent: 3,
      cpi: 0.3,
      ctr: 1.9,
      cvr: 34.7,
      roi1: 76,
      roi3: 85,
      roi7: 87,
      roiTotal: 87,
      estimatedProfit: -142
    }
  ],
  ownerTableRows: [
    {
      id: 'ow1',
      ownerName: '张三',
      level: 'senior',
      appCount: 3,
      spend: 15686,
      activeCampaignCount: 3,
      avgCpi: 2.37,
      avgCtr: 3.1,
      avgCvr: 31.2,
      roi1: 85,
      roi7: 94,
      estimatedProfit: 2130,
      children: [
        {
          id: 'ow1-c1',
          campaignName: 'Weather5_US_Google_CRE001',
          channel: 'google',
          country: 'US',
          status: 'active',
          spend: 12450,
          cpi: 2.37,
          ctr: 3.1,
          cvr: 31.2,
          roi1: 85,
          roi7: 94,
          estimatedProfit: 1240
        },
        {
          id: 'ow1-c2',
          campaignName: 'Weather5_JP_Google_CRE004',
          channel: 'google',
          country: 'JP',
          status: 'active',
          spend: 8372,
          cpi: 2.65,
          ctr: 2.9,
          cvr: 29.8,
          roi1: 84,
          roi7: 95,
          estimatedProfit: 890
        },
        {
          id: 'ow1-c3',
          campaignName: 'BloodSugar2_UK_Facebook_CRE002',
          channel: 'facebook',
          country: 'UK',
          status: 'over_budget',
          spend: 18885,
          cpi: 2.38,
          ctr: 2.1,
          cvr: 22.3,
          roi1: 68,
          roi7: 80,
          estimatedProfit: -1240
        }
      ]
    },
    {
      id: 'ow2',
      ownerName: '李四',
      level: 'mid',
      appCount: 2,
      spend: 7716,
      activeCampaignCount: 2,
      avgCpi: 2.38,
      avgCtr: 4.2,
      avgCvr: 35.6,
      roi1: 88,
      roi7: 99,
      estimatedProfit: 160,
      children: []
    },
    {
      id: 'ow3',
      ownerName: '王五',
      level: 'junior',
      appCount: 1,
      spend: 920,
      activeCampaignCount: 1,
      avgCpi: 2.45,
      avgCtr: 5.1,
      avgCvr: 38.2,
      roi1: 91,
      roi7: 103,
      estimatedProfit: 95,
      children: []
    },
    {
      id: 'ow4',
      ownerName: '赵六',
      level: 'senior',
      appCount: 2,
      spend: 1926,
      activeCampaignCount: 2,
      avgCpi: 2.65,
      avgCtr: 1.8,
      avgCvr: 18.9,
      roi1: 72,
      roi7: 84,
      estimatedProfit: -180,
      children: []
    }
  ],
  ownerTeamSummary: {
    totalSpend: 34858,
    avgCpi: 2.38,
    avgRoi1: 83,
    avgCvr: 28.6,
    estimatedProfit: 2205
  },
  accountTableRows: [
    {
      id: 'ac1',
      accountName: '523-793-2262',
      platform: 'google',
      balance: 2380,
      status: 'sufficient',
      spend: 15686,
      budgetProgressPercent: 65,
      activeCampaignCount: 3,
      avgCpi: 2.37,
      avgCtr: 3.1,
      avgCvr: 31.2,
      roi1: 85,
      roi7: 94,
      estimatedProfit: 2130,
      children: [
        {
          id: 'ac1-c1',
          campaignName: 'Weather5_US_Google_CRE001',
          channel: 'google',
          country: 'US',
          status: 'active',
          spend: 12450,
          cpi: 2.37,
          ctr: 3.1,
          cvr: 31.2,
          roi1: 85,
          roi7: 94,
          estimatedProfit: 1240
        },
        {
          id: 'ac1-c2',
          campaignName: 'Weather5_JP_Google_CRE004',
          channel: 'google',
          country: 'JP',
          status: 'active',
          spend: 8372,
          cpi: 2.65,
          ctr: 2.9,
          cvr: 29.8,
          roi1: 84,
          roi7: 95,
          estimatedProfit: 890
        },
        {
          id: 'ac1-c3',
          campaignName: 'BloodSugar2_UK_Facebook_CRE002',
          channel: 'facebook',
          country: 'UK',
          status: 'over_budget',
          spend: 18885,
          cpi: 2.38,
          ctr: 2.1,
          cvr: 22.3,
          roi1: 68,
          roi7: 80,
          estimatedProfit: -1240
        }
      ]
    },
    {
      id: 'ac2',
      accountName: '678-234-5566',
      platform: 'facebook',
      balance: 890,
      status: 'low_balance',
      spend: 9760,
      budgetProgressPercent: 72,
      activeCampaignCount: 2,
      avgCpi: 2.38,
      avgCtr: 2.1,
      avgCvr: 22.3,
      roi1: 68,
      roi7: 80,
      estimatedProfit: -1080,
      children: []
    },
    {
      id: 'ac3',
      accountName: '891-456-7890',
      platform: 'tiktok',
      balance: 120,
      status: 'insufficient',
      spend: 2866,
      budgetProgressPercent: 96,
      activeCampaignCount: 1,
      avgCpi: 2.38,
      avgCtr: 4.2,
      avgCvr: 35.6,
      roi1: 88,
      roi7: 99,
      estimatedProfit: 340,
      children: []
    }
  ],
  accountSummary: {
    totalSpend: 34858,
    avgCpi: 2.38,
    lowBalanceAccountCount: 2,
    overBudgetAccountCount: 1,
    estimatedProfit: 2205
  },
  alerts: [
    {
      id: 'a1',
      title: 'PhoneTracker_CA_TikTok',
      desc: '超预算96%',
      actionType: 'pause'
    },
    {
      id: 'a2',
      title: 'BloodSugar2_UK_Facebook',
      desc: '超预算79%',
      actionType: 'view'
    },
    {
      id: 'a3',
      title: 'FaceMe_US_Meta',
      desc: 'CPI偏高$2.65',
      actionType: 'optimize'
    }
  ],
  pagination: {
    current: 1,
    size: 10,
    total: 604
  }
}

function buildCampaignDetail(campaignId: string): AdPerformanceCampaignDetail {
  const isMain = campaignId === 'c1'
  return {
    header: {
      title: isMain ? '天气预报_US_Google_CRE001' : `Campaign_${campaignId}`,
      statusText: '激活'
    },
    topKpi: {
      totalSpend: isMain ? 12500 : 8200,
      cpi: isMain ? 2.38 : 2.42,
      roi1: isMain ? 83 : 79,
      budgetProgressPercent: isMain ? 85 : 72
    },
    roiSummary: {
      roi1: isMain ? 83 : 79,
      roi3: isMain ? 93 : 88,
      roi7: isMain ? 94 : 90,
      roiTotal: isMain ? 94 : 90,
      estimatedProfit: isMain ? 1240 : 420
    },
    tabs: {
      adGroup: {
        marketSummaryText: '投放市场：5个广告组',
        sortHintText: '按广告支出排序',
        adGroups: [
          {
            id: 'ag1',
            name: 'AdGroup_US_Interest',
            statusText: '激活',
            spend: 5125,
            cpi: 2.21,
            ctr: 3.2,
            cvr: 32.1,
            roi1: 86,
            roiTotal: 96,
            actionText: '详情'
          },
          {
            id: 'ag2',
            name: 'AdGroup_US_Broad',
            statusText: '激活',
            spend: 4125,
            cpi: 2.38,
            ctr: 2.8,
            cvr: 28.9,
            roi1: 82,
            roiTotal: 92,
            actionText: '详情'
          },
          {
            id: 'ag3',
            name: 'AdGroup_US_Retarget',
            statusText: '暂停',
            spend: 3250,
            cpi: 2.55,
            ctr: 1.9,
            cvr: 22.4,
            roi1: 79,
            roiTotal: 89,
            actionText: '启用'
          }
        ],
        spendDistribution: [
          { name: 'AdGroup_US_Interest', percent: 41 },
          { name: 'AdGroup_US_Broad', percent: 33 },
          { name: 'AdGroup_US_Retarget', percent: 26 }
        ],
        quickCards: [
          { title: '今日消耗', value: '$1,500', sub: '↑2.3%', tone: 'success' },
          { title: '账户余额', value: '$2,380', sub: '充足', tone: 'success' },
          { title: 'CPI趋势', value: '$2.38', sub: '目标$2.50 已达', tone: 'info' },
          { title: '预算跑完', value: '3天后', sub: '按当前速度', tone: 'warning' }
        ],
        insightTitle: 'AI洞察与建议',
        insightText: 'AdGroup_US_Interest近3日CPI持续下降至$2.12，建议提升预算15%以扩大规模'
      },
      date: {
        range: 'last7d',
        roiTarget: 80,
        cpiTarget: 2.5,
        datasets: {
          last7d: {
            spendRoiTrend: [
              { date: '2/22', spend: 1650, roi1: 81 },
              { date: '2/23', spend: 1720, roi1: 84 },
              { date: '2/24', spend: 1580, roi1: 78 },
              { date: '2/25', spend: 1890, roi1: 88 },
              { date: '2/26', spend: 1760, roi1: 82 },
              { date: '2/27', spend: 1830, roi1: 87 },
              { date: '2/28', spend: 1780, roi1: 85 }
            ],
            cpiTrend: [
              { date: '2/22', cpi: 2.45 },
              { date: '2/23', cpi: 2.38 },
              { date: '2/24', cpi: 2.52 },
              { date: '2/25', cpi: 2.31 },
              { date: '2/26', cpi: 2.38 },
              { date: '2/27', cpi: 2.35 },
              { date: '2/28', cpi: 2.38 }
            ],
            dailyRows: [
              {
                date: '2026-02-28',
                spend: 1780,
                cpi: 2.38,
                ctr: 3.1,
                cvr: 31.2,
                roi1: 85,
                wowPercent: 2.3,
                statusText: '正常'
              },
              {
                date: '2026-02-27',
                spend: 1820,
                cpi: 2.35,
                ctr: 3.3,
                cvr: 32.1,
                roi1: 87,
                wowPercent: 1.8,
                statusText: '正常'
              },
              {
                date: '2026-02-26',
                spend: 1760,
                cpi: 2.38,
                ctr: 2.9,
                cvr: 29.8,
                roi1: 83,
                wowPercent: -2.1,
                statusText: '正常'
              },
              {
                date: '2026-02-25',
                spend: 1890,
                cpi: 2.31,
                ctr: 3.5,
                cvr: 33.4,
                roi1: 88,
                wowPercent: 6.8,
                statusText: '正常'
              },
              {
                date: '2026-02-24',
                spend: 1580,
                cpi: 2.52,
                ctr: 2.4,
                cvr: 24.1,
                roi1: 78,
                wowPercent: -8.1,
                statusText: '异常'
              },
              {
                date: '2026-02-23',
                spend: 1720,
                cpi: 2.38,
                ctr: 3.0,
                cvr: 30.5,
                roi1: 84,
                wowPercent: 2.1,
                statusText: '正常'
              },
              {
                date: '2026-02-22',
                spend: 1650,
                cpi: 2.45,
                ctr: 2.8,
                cvr: 28.9,
                roi1: 81,
                wowPercent: 0.0,
                statusText: '正常'
              }
            ]
          },
          last14d: {
            spendRoiTrend: [],
            cpiTrend: [],
            dailyRows: []
          },
          month: {
            spendRoiTrend: [],
            cpiTrend: [],
            dailyRows: []
          }
        },
        spendRoiTrend: [
          { date: '2/22', spend: 1650, roi1: 81 },
          { date: '2/23', spend: 1720, roi1: 84 },
          { date: '2/24', spend: 1580, roi1: 78 },
          { date: '2/25', spend: 1890, roi1: 88 },
          { date: '2/26', spend: 1760, roi1: 82 },
          { date: '2/27', spend: 1830, roi1: 87 },
          { date: '2/28', spend: 1780, roi1: 85 }
        ],
        cpiTrend: [
          { date: '2/22', cpi: 2.45 },
          { date: '2/23', cpi: 2.38 },
          { date: '2/24', cpi: 2.52 },
          { date: '2/25', cpi: 2.31 },
          { date: '2/26', cpi: 2.38 },
          { date: '2/27', cpi: 2.35 },
          { date: '2/28', cpi: 2.38 }
        ],
        dailyRows: [
          {
            date: '2026-02-28',
            spend: 1780,
            cpi: 2.38,
            ctr: 3.1,
            cvr: 31.2,
            roi1: 85,
            wowPercent: 2.3,
            statusText: '正常'
          },
          {
            date: '2026-02-27',
            spend: 1820,
            cpi: 2.35,
            ctr: 3.3,
            cvr: 32.1,
            roi1: 87,
            wowPercent: 1.8,
            statusText: '正常'
          },
          {
            date: '2026-02-26',
            spend: 1760,
            cpi: 2.38,
            ctr: 2.9,
            cvr: 29.8,
            roi1: 83,
            wowPercent: -2.1,
            statusText: '正常'
          },
          {
            date: '2026-02-25',
            spend: 1890,
            cpi: 2.31,
            ctr: 3.5,
            cvr: 33.4,
            roi1: 88,
            wowPercent: 6.8,
            statusText: '正常'
          },
          {
            date: '2026-02-24',
            spend: 1580,
            cpi: 2.52,
            ctr: 2.4,
            cvr: 24.1,
            roi1: 78,
            wowPercent: -8.1,
            statusText: '异常'
          },
          {
            date: '2026-02-23',
            spend: 1720,
            cpi: 2.38,
            ctr: 3.0,
            cvr: 30.5,
            roi1: 84,
            wowPercent: 2.1,
            statusText: '正常'
          },
          {
            date: '2026-02-22',
            spend: 1650,
            cpi: 2.45,
            ctr: 2.8,
            cvr: 28.9,
            roi1: 81,
            wowPercent: 0.0,
            statusText: '正常'
          }
        ]
      },
      country: {
        marketSummaryText: '投放市场：5个国家',
        sortHintText: '按广告支出排序',
        spendRows: [
          { countryCode: 'US', countryName: '美国(US)', spend: 9021, percent: 78, cpi: 2.21 },
          { countryCode: 'CA', countryName: '加拿大(CA)', spend: 1282, percent: 10, cpi: 2.45 },
          { countryCode: 'GB', countryName: '英国(GB)', spend: 801, percent: 6, cpi: 2.55 },
          { countryCode: 'AU', countryName: '澳大利亚(AU)', spend: 560, percent: 4, cpi: 2.68 },
          { countryCode: 'NZ', countryName: '新西兰(NZ)', spend: 297, percent: 2, cpi: 2.71 }
        ],
        marketRows: [
          {
            countryCode: 'US',
            countryName: '美国',
            spend: 9021,
            cpi: 2.21,
            ctr: 2.8,
            cvr: 31.5,
            roi1: 85,
            roi3: 95,
            roi7: 96,
            roiTotal: 96,
            estimatedProfit: 1080,
            trendDirection: 'up',
            trendPoints: [78, 80, 82, 81, 84, 86, 88]
          },
          {
            countryCode: 'CA',
            countryName: '加拿大',
            spend: 1282,
            cpi: 2.45,
            ctr: 3.1,
            cvr: 29.8,
            roi1: 82,
            roi3: 92,
            roi7: 93,
            roiTotal: 93,
            estimatedProfit: 95,
            trendDirection: 'up',
            trendPoints: [74, 76, 75, 78, 80, 81, 82]
          },
          {
            countryCode: 'GB',
            countryName: '英国',
            spend: 801,
            cpi: 2.55,
            ctr: 2.4,
            cvr: 26.1,
            roi1: 79,
            roi3: 89,
            roi7: 90,
            roiTotal: 90,
            estimatedProfit: 28,
            trendDirection: 'up',
            trendPoints: [71, 72, 74, 76, 77, 78, 79]
          },
          {
            countryCode: 'AU',
            countryName: '澳大利亚',
            spend: 560,
            cpi: 2.68,
            ctr: 1.9,
            cvr: 22.3,
            roi1: 76,
            roi3: 86,
            roi7: 87,
            roiTotal: 87,
            estimatedProfit: -18,
            trendDirection: 'down',
            trendPoints: [84, 83, 82, 80, 79, 78, 76]
          },
          {
            countryCode: 'NZ',
            countryName: '新西兰',
            spend: 297,
            cpi: 2.71,
            ctr: 1.7,
            cvr: 20.1,
            roi1: 74,
            roi3: 84,
            roi7: 85,
            roiTotal: 85,
            estimatedProfit: -22,
            trendDirection: 'down',
            trendPoints: [82, 81, 80, 78, 77, 75, 74]
          }
        ],
        insightTitle: '市场洞察',
        insightText:
          '美国 CPI $2.21 低于平均水平（$2.38），建议加大美国投放占比。澳大利亚和新西兰 CPI 偏高，考虑降低或暂停投放。'
      }
    }
  }
}

const MOCK_AD_PERFORMANCE_DETAIL_BY_CAMPAIGN_ID: Record<string, AdPerformanceCampaignDetail> = {
  c1: buildCampaignDetail('c1'),
  c2: buildCampaignDetail('c2'),
  c3: buildCampaignDetail('c3'),
  c4: buildCampaignDetail('c4'),
  c5: buildCampaignDetail('c5'),
  c6: buildCampaignDetail('c6')
}

export function getMockCampaignDetail(campaignId: string): AdPerformanceCampaignDetail | null {
  if (!campaignId) return null
  return MOCK_AD_PERFORMANCE_DETAIL_BY_CAMPAIGN_ID[campaignId] ?? buildCampaignDetail(campaignId)
}
