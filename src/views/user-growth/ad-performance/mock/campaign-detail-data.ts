/**
 * 广告系列详情页 Mock 数据（模块根统一存放，避免子路由重复 mock 目录）
 * 路由：/campaign-detail
 * 类型：../campaign-detail/types.ts
 */
import type { CampaignDetailData } from '../campaign-detail/types'

export const MOCK_CAMPAIGN_DETAIL: CampaignDetailData = {
  campaignName: 'USA_Android_T1_Purchase',
  status: 'active',

  basicInfo: {
    campaignId: '0032021863838Z7',
    channel: 'google',
    channelName: 'Google Ads',
    appName: 'Weather8',
    createdAt: '2026-01-15'
  },

  budgetInfo: {
    budgetType: '日预算',
    budgetAmount: 5000,
    todaySpend: 3250,
    todaySpendPercent: 65,
    totalSpend: 83250,
    scheduleStart: '2026-01-15',
    scheduleEnd: '2026-03-15'
  },

  targetInfo: {
    region: '美国',
    regionCode: 'US',
    platform: 'android',
    bidStrategy: 'Maximize Conversions',
    targetCpi: 1.65
  },

  trendData: [
    { date: '01-01', spend: 42000, installs: 18000, cpi: 1.82, roi: 98 },
    { date: '01-03', spend: 55000, installs: 22000, cpi: 1.74, roi: 105 },
    { date: '01-05', spend: 63000, installs: 27000, cpi: 1.68, roi: 112 },
    { date: '01-07', spend: 71000, installs: 31000, cpi: 1.65, roi: 118 },
    { date: '01-09', spend: 80000, installs: 35000, cpi: 1.63, roi: 125 },
    { date: '01-11', spend: 68000, installs: 29000, cpi: 1.7, roi: 110 },
    { date: '01-13', spend: 75000, installs: 33000, cpi: 1.64, roi: 120 },
    { date: '01-15', spend: 85000, installs: 38000, cpi: 1.63, roi: 130 },
    { date: '01-17', spend: 77000, installs: 34000, cpi: 1.66, roi: 122 },
    { date: '01-19', spend: 72000, installs: 30000, cpi: 1.69, roi: 115 },
    { date: '01-21', spend: 90000, installs: 41000, cpi: 1.6, roi: 138 },
    { date: '01-23', spend: 83000, installs: 37000, cpi: 1.62, roi: 132 },
    { date: '01-25', spend: 78000, installs: 35000, cpi: 1.65, roi: 128 },
    { date: '01-27', spend: 86000, installs: 39000, cpi: 1.61, roi: 135 },
    { date: '01-29', spend: 92000, installs: 43000, cpi: 1.58, roi: 142 }
  ],

  adRows: [
    {
      id: '1',
      adGroupName: 'AdGroup_Android_Male_25-35',
      status: 'active',
      spend: 45000,
      installs: 28000,
      cpi: 1.61,
      roi1: 138.5,
      roiTotal: 142
    },
    {
      id: '2',
      adGroupName: 'AdGroup_Android_Female_25-35',
      status: 'active',
      spend: 38000,
      installs: 24000,
      cpi: 1.72,
      roi1: 124,
      roiTotal: 128
    },
    {
      id: '3',
      adGroupName: 'AdGroup_Android_All_18-24',
      status: 'active',
      spend: 29000,
      installs: 19000,
      cpi: 1.68,
      roi1: 110.25,
      roiTotal: 115
    },
    {
      id: '4',
      adGroupName: 'AdGroup_Android_Male_35-44',
      status: 'paused',
      spend: 18000,
      installs: 11000,
      cpi: 1.83,
      roi1: 88,
      roiTotal: 92
    },
    {
      id: '5',
      adGroupName: 'AdGroup_Android_All_45+',
      status: 'active',
      spend: 22000,
      installs: 14000,
      cpi: 1.77,
      roi1: 104.5,
      roiTotal: 108
    },
    {
      id: '6',
      adGroupName: 'AdGroup_Android_Female_18-24',
      status: 'active',
      spend: 31000,
      installs: 20000,
      cpi: 1.65,
      roi1: 130,
      roiTotal: 135
    }
  ],

  creativeTop5: [
    { id: 'c1', thumbnail: '', roi: 155, ctr: 3.2 },
    { id: 'c2', thumbnail: '', roi: 155, ctr: 3.2 },
    { id: 'c3', thumbnail: '', roi: 155, ctr: 3.2 },
    { id: 'c4', thumbnail: '', roi: 155, ctr: 3.2 },
    { id: 'c5', thumbnail: '', roi: 155, ctr: 3.2 }
  ],

  aiInsights: [
    {
      id: 'a1',
      level: 'info',
      title: '优化建议',
      content:
        '广告组 AdGroup_Android_Female_25-35 CPI ($1.72) 高于平均水平，但ROI尚可。建议将预算向ROI更高的 AdGroup_Android_Male_25-35 倾斜。'
    },
    {
      id: 'a2',
      level: 'warning',
      title: '素材洞察',
      content:
        '视频素材 (ID: #CR58392) 的点击率和转化率远超图片素材。建议增加此类视频素材的投放量。'
    },
    {
      id: 'a3',
      level: 'danger',
      title: '异常提醒',
      content: '过去24小时内，来自加拿大的安装成本上涨了30%，请关注。'
    }
  ]
}
