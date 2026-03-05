/**
 * 变现分析 Mock 数据
 * 与原型「变现管理」- 变现分析一致，后续对接真实接口时可替换
 */
import type { MonetizationAnalysisOverview } from '../types'

const trendDates = ['05-08', '05-10', '05-12', '05-15', '05-18', '05-20', '05-22', '05-26']

export const MOCK_MONETIZATION_ANALYSIS: MonetizationAnalysisOverview = {
  kpi: [
    { type: 'income', label: '总收入', value: '$2.88M', compare: '+12.3%', compareUp: true },
    { type: 'adRevenue', label: '广告收入', value: '¥2.16M', compare: '+12.3%', compareUp: true },
    { type: 'iap', label: 'IAP收入', value: '$0.72M', compare: '-3.2%', compareUp: false },
    { type: 'arpu', label: 'ARPU', value: '$0.24', compare: '+5.2%', compareUp: true },
    { type: 'dau', label: 'DAU', value: '12.0M', compare: '+2.3%', compareUp: true }
  ],
  channelTotal: {
    label: '渠道总数',
    value: '200台'
  },
  channelPie: [
    { name: '分类一', value: 40, percent: 40 },
    { name: '分类二', value: 21, percent: 21 },
    { name: '分类三', value: 17, percent: 17 },
    { name: '分类四', value: 13, percent: 13 },
    { name: '分类五', value: 9, percent: 9 }
  ],
  channelPlatformTable: [
    { channel: 'Facebook', platform: 'Meta', spend: '$12,500', revenue: '$18,200', roi: '145.6%' },
    { channel: 'Google', platform: 'Google', spend: '$8,300', revenue: '$11,600', roi: '139.8%' },
    { channel: 'TikTok', platform: 'ByteDance', spend: '$5,200', revenue: '$6,800', roi: '130.8%' },
    { channel: 'Unity', platform: 'Unity', spend: '$3,100', revenue: '$4,000', roi: '129.0%' },
    { channel: 'AppLovin', platform: 'AppLovin', spend: '$2,800', revenue: '$3,500', roi: '125.0%' }
  ],
  revenueEcpMTrend: {
    dates: trendDates,
    adRevenue: [62000, 68000, 71000, 75000, 72000, 78000, 76000, 82000],
    avgEcpM: [11.2, 11.8, 12.0, 12.5, 12.2, 12.8, 12.4, 13.0]
  },
  fillRateTrend: {
    dates: ['05-08', '05-10', '05-12', '05-13', '05-15', '05-18', '05-22', '05-27'],
    series: [
      { name: 'AdMob', data: [35, 38, 36, 32, 40, 42, 38, 45] },
      { name: 'Facebook AN', data: [28, 30, 28, 18, 22, 25, 28, 30] },
      { name: 'Unity Ads', data: [22, 20, 22, 15, 18, 20, 22, 24] },
      { name: 'IronSource', data: [10, 8, 10, 12, 12, 8, 10, 6] }
    ],
    warning: {
      date: '5月13日',
      message: 'Facebook AN 与 Unity Ads 填充率显著下降 (90%)'
    }
  },
  waterfallLevels: [
    { name: 'AdMob', ecpm: '$15.00', fillRate: '45%', priority: 1 },
    { name: 'Meta Audience Network', ecpm: '$12.00', fillRate: '35%', priority: 2 },
    { name: 'Unity Ads', ecpm: '$8.50', fillRate: '12%', priority: 3 },
    { name: 'AppLovin', ecpm: '$5.00', fillRate: '2%', priority: 4 },
    { name: 'No Fill', ecpm: '-', fillRate: '6%', priority: 5 }
  ],
  iapAnalysis: {
    total: '$2.45M',
    items: [
      { name: 'Monthly Premium', percent: 42, amount: '$1.03M' },
      { name: 'Annual Premium', percent: 25, amount: '$0.61M' },
      { name: 'Lifetime Unlock', percent: 15, amount: '$0.37M' },
      { name: 'Coin Pack 1000', percent: 10, amount: '$0.25M' },
      { name: 'Coin Pack 500', percent: 8, amount: '$0.20M' }
    ]
  },
  ecpmByAdType: {
    dates: ['Feb 04', 'Feb 05', 'Feb 06', 'Feb 07', 'Feb 08', 'Feb 09', 'Feb 10'],
    series: [
      { name: 'Interstitial', value: [12.2, 12.8, 13.0, 13.2, 13.5, 13.2, 13.5] },
      { name: 'Rewarded Video', value: [8.5, 8.8, 9.0, 9.2, 9.2, 9.0, 9.2] },
      { name: 'Native', value: [4.8, 5.0, 5.1, 5.0, 5.2, 5.1, 5.1] },
      { name: 'Banner', value: [2.2, 2.3, 2.4, 2.45, 2.4, 2.5, 2.45] }
    ]
  },
  adPlatformPerformance: [
    {
      channel: 'Google Ads',
      platform: 'Google',
      impressions: '1.2M',
      clicks: '45.2K',
      revenue: '$85,200',
      revenuePercent: '38%',
      ecpm: '$12.50',
      fillRate: '92%',
      fillRateStatus: 'high',
      trendData: [11, 12, 11.5, 12.2, 12.5, 12.8, 12.5]
    },
    {
      channel: 'Facebook Ads',
      platform: 'Meta',
      impressions: '980K',
      clicks: '38.1K',
      revenue: '$72,400',
      revenuePercent: '32%',
      ecpm: '$11.20',
      fillRate: '88%',
      fillRateStatus: 'normal',
      trendData: [10.5, 11, 10.8, 11.2, 11, 11.2, 11.2]
    },
    {
      channel: 'TikTok',
      platform: 'ByteDance',
      impressions: '650K',
      clicks: '28.5K',
      revenue: '$48,600',
      revenuePercent: '22%',
      ecpm: '$9.80',
      fillRate: '78%',
      fillRateStatus: 'low',
      trendData: [9.5, 9.8, 9.6, 9.8, 10, 9.8, 9.8]
    }
  ],
  aiInsights: [
    {
      title: '广告收入增长',
      content:
        'Weather 近期广告收入上升了 10%，主要来自 AdMob 和 eCPM 从 $11.5 增至 $13.5，建议继续定向高价偏好用户。'
    },
    {
      title: 'IAP 潜力',
      content:
        'PhoneTracker 的 IAP 收入上升了 15%，转化率以 Premium Subscription Yearly 达 5.2%，建议加大推广力度。'
    },
    {
      title: 'eCPM 下降',
      content: 'Unity Ads 的 eCPM 连续 3 天下降超过 25%，可能存在配置问题，建议立即检查。'
    }
  ]
}
