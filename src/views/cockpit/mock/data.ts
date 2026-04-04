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
      detail: '广告 $98,240  付费 $27,440',
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
      subItems: [
        { label: '自投', value: '$34,552', tone: 'default' },
        { label: '代投', value: '$34,552', tone: 'info' }
      ],
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
    { label: '买量应用', value: '23个' },
    { label: '广告系列', value: '604个', change: 47, trend: 'down' },
    { label: '广告账户', value: '97个', change: 3, trend: 'up' }
  ],
  alertBanners: [
    {
      type: 'warning',
      text: 'Facebook广告平台CPI上涨25%',
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
  channelRoiInstall: [
    {
      channel: 'Google Ads',
      spend: 7500,
      installs: 42500,
      cpi: 1.2,
      trend: [3200, 3800, 4200, 5800, 6200, 6500, 6800]
    },
    {
      channel: 'Facebook',
      spend: 7500,
      installs: 18500,
      cpi: 1.4,
      trend: [2200, 2400, 2600, 2500, 2700, 2600, 2800]
    },
    {
      channel: 'TikTok',
      spend: 7500,
      installs: 7500,
      cpi: 0.82,
      trend: [900, 950, 1100, 1050, 1150, 1200, 1150]
    },
    {
      channel: 'Mintegral',
      spend: 7500,
      installs: 4500,
      cpi: 1.2,
      trend: [500, 580, 620, 650, 680, 720, 750]
    },
    {
      channel: 'Kwai',
      spend: 7500,
      installs: 3500,
      cpi: 1.35,
      trend: [480, 460, 520, 500, 510, 530, 500]
    },
    {
      channel: 'NewsBreak',
      spend: 7500,
      installs: 2500,
      cpi: 1.5,
      trend: [320, 350, 360, 340, 380, 370, 380]
    }
  ],
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
      name: 'Google Ads',
      platform: 'google',
      current: 7500,
      budget: 10000,
      percent: 75,
      status: '节奏正常',
      tagType: 'success'
    },
    {
      name: 'Facebook',
      platform: 'facebook',
      current: 7000,
      budget: 10000,
      percent: 70,
      status: '节奏正常',
      tagType: 'success'
    },
    {
      name: 'TikTok',
      platform: 'tiktok',
      current: 4600,
      budget: 5000,
      percent: 92,
      status: '预算预警',
      tagType: 'danger'
    },
    {
      name: 'Mintegral',
      platform: 'mintegral',
      current: 5500,
      budget: 10000,
      percent: 55,
      status: '节奏正常',
      tagType: 'success'
    },
    {
      name: 'Kwai',
      platform: 'kwai',
      current: 4500,
      budget: 10000,
      percent: 45,
      status: '节奏较慢',
      tagType: 'warning'
    },
    {
      name: 'NewsBreak',
      platform: 'newsbreak',
      current: 3600,
      budget: 8000,
      percent: 45,
      status: '节奏较慢',
      tagType: 'warning'
    },
    {
      name: 'Google Ads',
      platform: 'google',
      current: 3200,
      budget: 10000,
      percent: 32,
      status: '节奏较慢',
      tagType: 'warning',
      section: 'managed'
    },
    {
      name: 'Facebook',
      platform: 'facebook',
      current: 2800,
      budget: 10000,
      percent: 28,
      status: '节奏较慢',
      tagType: 'warning',
      section: 'managed'
    }
  ],
  // mapCountries[].nameEn 必须与 public/geo/world.json 的 properties.name 完全一致才能在地图上高亮
  // 注意：美国用 "United States"（非 United States of America）；韩国用 "Korea"（非 South Korea）
  mapCountries: [
    {
      nameEn: 'United States',
      name: '美国',
      revenue: 8200,
      spend: 5800,
      user: 125000,
      trend: '+12%',
      color: '#67c23a',
      newUser: 3840,
      newUserTrend: '+22%',
      spendTrend: '+8%',
      userTrend: '+5%',
      ecpm: 8.2,
      ecpmTrend: '+3%'
    },
    {
      nameEn: 'China',
      name: '中国',
      revenue: 7500,
      spend: 5200,
      user: 98000,
      trend: '+10%',
      color: '#67c23a',
      newUser: 8200,
      newUserTrend: '+15%',
      spendTrend: '+6%',
      userTrend: '+4%',
      ecpm: 7.5,
      ecpmTrend: '+4%'
    },
    {
      nameEn: 'Japan',
      name: '日本',
      revenue: 6800,
      spend: 4800,
      user: 85000,
      trend: '+4%',
      color: '#f56c6c',
      newUser: 980,
      newUserTrend: '+3%',
      spendTrend: '+3%',
      userTrend: '+2%',
      ecpm: 7.8,
      ecpmTrend: '+2%'
    },
    {
      nameEn: 'United Kingdom',
      name: '英国',
      revenue: 5200,
      spend: 3800,
      user: 62000,
      trend: '+6%',
      color: '#409eff',
      newUser: 420,
      newUserTrend: '+7%',
      spendTrend: '+5%',
      userTrend: '+3%',
      ecpm: 6.5,
      ecpmTrend: '+4%'
    },
    {
      nameEn: 'Russia',
      name: '俄罗斯',
      revenue: 3800,
      spend: 2800,
      user: 48000,
      trend: '+5%',
      color: '#E2C33D',
      newUser: 2100,
      newUserTrend: '+9%',
      spendTrend: '+4%',
      userTrend: '+6%',
      ecpm: 5.5,
      ecpmTrend: '+2%'
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
      spendTrend: '+10%',
      userTrend: '+7%',
      ecpm: 5.1,
      ecpmTrend: '+5%'
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
      spendTrend: '+1%',
      userTrend: '+8%',
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
    { name: '美国', value: '$8.2M', trend: '++12%', color: '#67c23a' },
    { name: '中国', value: '$7.5M', trend: '↑+10%', color: '#67c23a' },
    { name: '日本', value: '$6.8M', trend: '↑+4%', color: '#f56c6c' },
    { name: '英国', value: '$5.2M', trend: '↑+6%', color: '#409eff' },
    { name: '印度', value: '$150K', trend: '++2%', color: '#e6a23c' }
  ],
  topRevenue: [
    { name: 'Weather5', revenue: '$580K', trendPercent: '+8%' },
    { name: 'Weather5', revenue: '$580K', trendPercent: '+5%' },
    { name: 'Weather5', revenue: '$580K', trendPercent: '+3%' }
  ],
  topSpend: [
    { name: 'Google Ads', roi: '$45K ROI 1.58' },
    { name: 'Meta Ads', roi: '$580 ROI 1.45' },
    { name: 'TikTok', roi: '$580 ROI 1.45' }
  ],
  topBadReview: [
    { name: 'Weather5', reasonTag: '变现下降18%', metric: 'DAU ↓ 12%', trend: 'down' },
    { name: 'Weather5', reasonTag: '安装成本过高', metric: 'CPI ↑ 23%', trend: 'up' },
    { name: 'Weather5', reasonTag: '用户流失', metric: '留存 ↓ 15%', trend: 'down' }
  ],
  topUser: [
    { name: 'Weather5', growth: '+8,200', trendPercent: '+8%' },
    { name: 'Weather5', growth: '+6,200', trendPercent: '+5%' },
    { name: 'Weather5', growth: '+3,100', trendPercent: '+3%' }
  ],
  smartAlerts: [],
  top5Apps: [
    { name: 'Weather5', revenue: '580K', roas: '1.45' },
    { name: 'BloodPressure2', revenue: '425K', roas: '1.38' },
    { name: 'HealthTracker3', revenue: '320K', roas: '1.28' },
    { name: 'FaceMe', revenue: '285K', roas: '1.22' },
    { name: 'YearCam', revenue: '245K', roas: '1.18' }
  ],
  revenueStructureFlow: {
    nodes: [
      {
        name: '广告收入',
        depth: 0,
        valueDisplay: '$41,353',
        percent: '89.5%',
        icon: '📢',
        itemStyle: { color: '#14DEBA', borderRadius: 6 }
      },
      {
        name: '内购收入',
        depth: 0,
        valueDisplay: '$4,828',
        percent: '10.5%',
        icon: '💰',
        itemStyle: { color: '#409eff', borderRadius: 6 }
      },
      {
        name: '美国',
        depth: 1,
        valueDisplay: '$1.03M',
        code: 'us',
        itemStyle: { color: '#67c23a', borderRadius: 6 }
      },
      {
        name: '日本',
        depth: 1,
        valueDisplay: '$650K',
        code: 'jp',
        itemStyle: { color: '#409eff', borderRadius: 6 }
      },
      {
        name: '英国',
        depth: 1,
        valueDisplay: '$600K',
        code: 'gb',
        itemStyle: { color: '#7230b3', borderRadius: 6 }
      },
      {
        name: '巴西',
        depth: 1,
        valueDisplay: '$500K',
        code: 'br',
        itemStyle: { color: '#e6a23c', borderRadius: 6 }
      },
      {
        name: '其他',
        depth: 1,
        valueDisplay: '$200K',
        itemStyle: { color: '#909399', borderRadius: 6 }
      },
      {
        name: 'Weather5',
        depth: 2,
        valueDisplay: '$580K',
        itemStyle: { color: '#67c23a', borderRadius: 6 }
      },
      {
        name: 'BloodPressure2',
        depth: 2,
        valueDisplay: '$425K',
        itemStyle: { color: '#409eff', borderRadius: 6 }
      },
      {
        name: 'HealthTracker3',
        depth: 2,
        valueDisplay: '$320K',
        itemStyle: { color: '#7230b3', borderRadius: 6 }
      },
      {
        name: '其他Apps',
        depth: 2,
        valueDisplay: '$1.85M',
        itemStyle: { color: '#909399', borderRadius: 6 }
      }
    ],
    links: [
      { source: '广告收入', target: '美国', value: 18000 },
      { source: '广告收入', target: '日本', value: 11000 },
      { source: '广告收入', target: '英国', value: 10000 },
      { source: '广告收入', target: '巴西', value: 8500 },
      { source: '广告收入', target: '其他', value: 3853 },
      { source: '内购收入', target: '美国', value: 1500 },
      { source: '内购收入', target: '日本', value: 1200 },
      { source: '内购收入', target: '英国', value: 800 },
      { source: '内购收入', target: '巴西', value: 828 },
      { source: '内购收入', target: '其他', value: 500 },
      { source: '美国', target: 'Weather5', value: 5800 },
      { source: '美国', target: 'BloodPressure2', value: 2500 },
      { source: '美国', target: 'HealthTracker3', value: 1200 },
      { source: '美国', target: '其他Apps', value: 11000 },
      { source: '日本', target: 'Weather5', value: 2200 },
      { source: '日本', target: 'BloodPressure2', value: 1800 },
      { source: '日本', target: 'HealthTracker3', value: 1500 },
      { source: '日本', target: '其他Apps', value: 6700 },
      { source: '英国', target: 'Weather5', value: 1800 },
      { source: '英国', target: 'BloodPressure2', value: 1500 },
      { source: '英国', target: 'HealthTracker3', value: 1200 },
      { source: '英国', target: '其他Apps', value: 6300 },
      { source: '巴西', target: 'Weather5', value: 1500 },
      { source: '巴西', target: 'BloodPressure2', value: 1200 },
      { source: '巴西', target: 'HealthTracker3', value: 800 },
      { source: '巴西', target: '其他Apps', value: 5828 },
      { source: '其他', target: '其他Apps', value: 4353 }
    ],
    insights: [
      { color: '#67c23a', text: '美国共享收入最高$1.03M (22.3%)' },
      { color: '#409eff', text: 'Weather5跨市场表现最佳' },
      { color: '#e6a23c', text: '内购收入占比偏低10.5%' }
    ]
  },
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
