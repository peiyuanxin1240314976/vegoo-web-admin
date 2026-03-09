/**
 * 驾驶舱 Mock 数据
 * 仅用于前端展示，后续对接真实接口时可整体替换或按字段对照后端返回
 */
import type { CockpitOverview } from '../types'

export const MOCK_COCKPIT_OVERVIEW: CockpitOverview = {
  kpi: [
    {
      type: 'income',
      label: '总收入',
      value: '$125,680.00',
      detail: '广告: $98,240 | 内购: $27,440',
      compare: '昨日: $125,245 -2.6%↓',
      compareUp: false
    },
    {
      type: 'paidRevenue',
      label: '付费收入',
      value: '$89,240',
      detail: '未扣平台费用',
      compare: '昨日: $125,245 -2.6%↓',
      compareUp: false
    },
    {
      type: 'adSpend',
      label: '广告支出',
      value: '$25,420',
      detail: '白投 $34,552  代股 $34,552',
      compare: '昨日: $66,692 +14.8%↑',
      compareUp: true
    },
    {
      type: 'subscriptions',
      label: '有效订阅',
      value: '36,440',
      detail: '新增 +1,240 流失 -380',
      compare: '昨日: 36,200 +14.8%↑',
      compareUp: true
    },
    {
      type: 'dau',
      label: 'DAU',
      value: '1,349,931',
      detail: 'DNU 374,920 ↓ 8,645',
      compare: '昨日: 1,358,576 -0.6%↓',
      compareUp: false
    },
    {
      type: 'profit',
      label: '预估利润',
      value: '+$11,021',
      detail: '当前广告 | 内购收入 - 广告支出',
      compare: '昨日: $125,245 -2.6%↓',
      compareUp: false
    }
  ],
  alertSummaryMetrics: [
    { label: 'DNU', value: '374,920', change: 8649, trend: 'down' },
    { label: '自然量', value: '50,372', change: 649, trend: 'up' },
    { label: '买带应用', value: '23个' },
    { label: '广告系列', value: '604个', change: 47, trend: 'down' },
    { label: '广告账户', value: '97个', change: 3, trend: 'up' }
  ],
  alertBanners: [
    {
      type: 'warning',
      text: 'Facebook渠道CPI上涨25%',
      suggestion: '建议优化投放策略'
    },
    {
      type: 'opportunity',
      text: 'Google-墨西哥市场ROI达180%',
      suggestion: '建议加大投入'
    },
    {
      type: 'risk',
      text: 'Weather8应用变现收入环比下降18%',
      suggestion: '需关注'
    }
  ],
  revenueCostTrend: {
    dates: ['10.15', '10.20', '10.25', '10.30', '11.05', '11.10', '11.15'],
    revenue: [620, 732, 601, 634, 590, 730, 620],
    cost: [520, 632, 501, 534, 490, 630, 560]
  },
  userQuality: [
    {
      key: 'retention',
      label: '7天留存率',
      value: '38%',
      status: 'Good',
      statusClass: 'good',
      gaugeValue: 38
    },
    {
      key: 'purchase',
      label: '购买率',
      value: '4.2%',
      status: 'Average',
      statusClass: 'avg',
      gaugeValue: 42
    },
    {
      key: 'arpu',
      label: 'ARPU',
      value: '$2.85',
      status: 'High',
      statusClass: 'high',
      gaugeValue: 28.5
    }
  ],
  spendPace: [
    {
      name: 'USA_Android_T1_Purchase',
      current: 7200,
      budget: 10000,
      percent: 72,
      status: '节奏正常',
      tagType: 'success',
      color: '#67c23a'
    },
    {
      name: 'USA_Android_T1_Purchase',
      current: 8500,
      budget: 8000,
      percent: 106,
      status: '预算预警',
      tagType: 'danger',
      color: '#f56c6c'
    },
    {
      name: 'USA_Android_T1_Purchase',
      current: 3200,
      budget: 10000,
      percent: 32,
      status: '节奏较慢',
      tagType: 'warning',
      color: '#e6a23c'
    }
  ],
  mapCountries: [
    {
      nameEn: 'United States of America',
      name: '美国',
      revenue: 1030,
      spend: 652,
      user: 45200,
      trend: '+12%',
      color: '#67c23a',
      newUser: 3840,
      newUserTrend: '+22%',
      ecpm: 8.2,
      ecpmTrend: '+3%'
    },
    {
      nameEn: 'Brazil',
      name: '巴西',
      revenue: 500,
      spend: 380,
      user: 28000,
      trend: '+15%',
      color: '#e6a23c',
      newUser: 1200,
      newUserTrend: '+8%',
      ecpm: 5.1,
      ecpmTrend: '+5%'
    },
    {
      nameEn: 'Japan',
      name: '日本',
      revenue: 650,
      spend: 520,
      user: 19000,
      trend: '+4%',
      color: '#f56c6c',
      newUser: 980,
      newUserTrend: '+3%',
      ecpm: 7.8,
      ecpmTrend: '+2%'
    },
    {
      nameEn: 'India',
      name: '印度',
      revenue: 150,
      spend: 120,
      user: 52000,
      trend: '+2%',
      color: '#e6a23c',
      newUser: 5200,
      newUserTrend: '+12%',
      ecpm: 0.9,
      ecpmTrend: '-1%'
    },
    {
      nameEn: 'Australia',
      name: '澳大利亚',
      revenue: 400,
      spend: 310,
      user: 9800,
      trend: '+9%',
      color: '#67c23a',
      newUser: 560,
      newUserTrend: '+15%',
      ecpm: 9.2,
      ecpmTrend: '+6%'
    },
    {
      nameEn: 'United Kingdom',
      name: '英国',
      revenue: 380,
      spend: 290,
      user: 8500,
      trend: '+6%',
      color: '#409eff',
      newUser: 420,
      newUserTrend: '+7%',
      ecpm: 6.5,
      ecpmTrend: '+4%'
    },
    {
      nameEn: 'Germany',
      name: '德国',
      revenue: 320,
      spend: 250,
      user: 7200,
      trend: '+5%',
      color: '#409eff',
      newUser: 380,
      newUserTrend: '+4%',
      ecpm: 5.8,
      ecpmTrend: '+3%'
    },
    {
      nameEn: 'France',
      name: '法国',
      revenue: 280,
      spend: 220,
      user: 6500,
      trend: '+7%',
      color: '#67c23a',
      newUser: 310,
      newUserTrend: '+6%',
      ecpm: 5.2,
      ecpmTrend: '+2%'
    },
    {
      nameEn: 'Canada',
      name: '加拿大',
      revenue: 260,
      spend: 200,
      user: 5800,
      trend: '+3%',
      color: '#e6a23c',
      newUser: 290,
      newUserTrend: '+5%',
      ecpm: 6.0,
      ecpmTrend: '+1%'
    },
    {
      nameEn: 'Mexico',
      name: '墨西哥',
      revenue: 180,
      spend: 140,
      user: 12000,
      trend: '+18%',
      color: '#67c23a',
      newUser: 1800,
      newUserTrend: '+25%',
      ecpm: 3.2,
      ecpmTrend: '+8%'
    }
  ],
  mapLegend: [
    { name: '美国', value: '$1.03M', trend: '++12%', color: '#67c23a' },
    { name: '巴西', value: '$500K', trend: '↑+15%', color: '#e6a23c' },
    { name: '日本', value: '$650K', trend: '↑+4%', color: '#f56c6c' },
    { name: '印度', value: '$150K', trend: '++2%', color: '#e6a23c' },
    { name: '澳大利亚', value: '$400K', trend: '↑+9%', color: '#67c23a' }
  ],
  topRevenue: [
    { name: 'Weather5', roas: '$580 ROAS 1.45' },
    { name: 'Weather5', roas: '$580 ROAS 1.45' },
    { name: 'Weather5', roas: '$580 ROAS 1.45' }
  ],
  topSpend: [
    { name: 'Google Ads', roi: '$45K ROI 1.58' },
    { name: 'Meta Ads', roi: '$580 ROI 1.45' },
    { name: 'TikTok', roi: '$580 ROI 1.45' }
  ],
  topUser: [
    { name: 'Weather5', dau: '+8,200 DAU' },
    { name: 'FaceMe', dau: '+8,200 DAU' },
    { name: 'Weather5', dau: '+8,200 DAU' }
  ],
  smartAlerts: [
    { type: 'risk', msg: '美国区ROI下降15%' },
    { type: 'warning', msg: 'Facebook消耗速度超预算20%' },
    { type: 'growth', msg: 'Weather5 DAU增长8%' }
  ],
  top5Apps: [
    { name: 'Weather5', revenue: '580K', roas: '1.45' },
    { name: 'BloodPressure2', revenue: '425K', roas: '1.38' },
    { name: 'HealthTracker3', revenue: '320K', roas: '1.28' },
    { name: 'FaceMe', revenue: '285K', roas: '1.22' },
    { name: 'YearCam', revenue: '245K', roas: '1.18' }
  ],
  top10Campaigns: [
    { campaign: 'IOS_Traffic_New', channel: 'FB', spend: '$7,500', revenue: '$9,000', roi: '1.20' },
    {
      campaign: 'IOS_Traffic_New',
      channel: 'Google',
      spend: '$7,500',
      revenue: '$9,000',
      roi: '1.40'
    },
    {
      campaign: 'IOS_Traffic_New',
      channel: 'TikTok',
      spend: '$7,500',
      revenue: '$6,150',
      roi: '0.82'
    }
  ]
}
