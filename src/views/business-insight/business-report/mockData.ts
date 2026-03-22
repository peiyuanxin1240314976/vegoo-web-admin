// ============================================================
// Business Report – Mock Data
// ============================================================
import type {
  AppListItem,
  KpiMetric,
  UserMetricRow,
  RoiRow,
  RetentionRow,
  RevenueRow,
  FeeItem,
  AdPlatformCard,
  CountryRow,
  CampaignRow,
  PlatformCountryRow,
  CompareAppData,
  CompareMetricRow
} from './types'

// ── App List ──────────────────────────────────────────────────
export const appList: AppListItem[] = [
  {
    id: 'overall',
    name: '整体',
    category: '全部平台',
    platforms: ['安卓', 'iOS', '网站'],
    iconEmoji: '📊',
    iconColor: '#00D4A1',
    iconBg: 'rgba(0,212,161,0.15)',
    revenue: 152300,
    revenueChange: 8.4,
    profit: 108900,
    mau: 78.3,
    dau: 78.3,
    adSpend: 41100,
    adSpendChange: 7.8,
    activeCampaigns: 14,
    pausedCampaigns: 3,
    countries: 22,
    isOverall: true,
    sparkline: [118, 125, 120, 138, 132, 145, 149, 152],
    paidUsers: 25.7,
    platformBreakdown: [
      { name: 'Google', color: '#4285F4', percent: 37 },
      { name: 'Facebook', color: '#1877F2', percent: 26 },
      { name: 'Unity', color: '#22C55E', percent: 15 },
      { name: 'Mintegral', color: '#F59E0B', percent: 10 },
      { name: 'TikTok', color: '#FF4D4F', percent: 6 },
      { name: 'Snapchat', color: '#FFFC00', percent: 3 },
      { name: '其他', color: '#3A3A50', percent: 3 }
    ]
  },
  {
    id: 'health',
    name: '健康',
    category: '全部平台',
    platforms: ['安卓', 'iOS', '网站'],
    iconEmoji: '🏥',
    iconColor: '#3B82F6',
    iconBg: 'rgba(59,130,246,0.15)',
    revenue: 41200,
    revenueChange: 11.2,
    profit: 29400,
    mau: 29.2,
    dau: 29.2,
    adSpend: 11200,
    adSpendChange: 9.3,
    activeCampaigns: 4,
    countries: 18,
    sparkline: [32, 34, 33, 37, 36, 39, 40, 41],
    paidUsers: 7.1
  },
  {
    id: 'weather',
    name: '天气',
    category: '安卓+iOS',
    platforms: ['安卓', 'iOS'],
    iconEmoji: '🌤',
    iconColor: '#94A3B8',
    iconBg: 'rgba(148,163,184,0.15)',
    revenue: 32800,
    revenueChange: -3.1,
    profit: 23400,
    mau: 18.1,
    dau: 18.1,
    adSpend: 8900,
    adSpendChange: -2.4,
    activeCampaigns: 3,
    countries: 15,
    sparkline: [35, 34, 36, 33, 32, 31, 33, 32],
    paidUsers: 5.2
  },
  {
    id: 'ai',
    name: 'AI应用',
    category: '全部',
    platforms: ['安卓', 'iOS', '网站'],
    iconEmoji: '🤖',
    iconColor: '#10B981',
    iconBg: 'rgba(16,185,129,0.15)',
    revenue: 29100,
    revenueChange: 6.7,
    profit: 20800,
    mau: 14.4,
    dau: 14.4,
    adSpend: 7800,
    adSpendChange: 5.1,
    activeCampaigns: 3,
    countries: 12,
    sparkline: [24, 25, 25, 27, 26, 28, 28, 29],
    paidUsers: 4.6
  },
  {
    id: 'bloodsugar2',
    name: 'BloodSugar2',
    category: '安卓',
    platforms: ['安卓'],
    iconEmoji: '🩸',
    iconColor: '#FF6B35',
    iconBg: 'rgba(255,107,53,0.15)',
    revenue: 12400,
    revenueChange: 5.6,
    profit: 8700,
    adSpend: 3400,
    adSpendChange: 4.2,
    activeCampaigns: 2,
    countries: 10
  },
  {
    id: 'healthtracker2',
    name: 'HealthTracker2',
    category: '安卓',
    platforms: ['安卓'],
    iconEmoji: '💪',
    iconColor: '#00B894',
    iconBg: 'rgba(0,184,148,0.15)',
    revenue: 9800,
    revenueChange: 8.9,
    profit: 6800,
    adSpend: 2900,
    adSpendChange: 7.1,
    activeCampaigns: 1,
    countries: 10
  },
  {
    id: 'weatherapp',
    name: 'WeatherApp',
    category: '安卓+iOS',
    platforms: ['安卓', 'iOS'],
    iconEmoji: '⛅',
    iconColor: '#74B9FF',
    iconBg: 'rgba(116,185,255,0.15)',
    revenue: 8700,
    revenueChange: -1.2,
    profit: 5900,
    adSpend: 2400,
    adSpendChange: -0.8,
    activeCampaigns: 1,
    countries: 8
  },
  {
    id: 'phonetracker2',
    name: 'PhoneTracker2',
    category: '安卓',
    platforms: ['安卓'],
    iconEmoji: '📱',
    iconColor: '#00CEC9',
    iconBg: 'rgba(0,206,201,0.15)',
    revenue: 7200,
    revenueChange: 3.4,
    profit: 5100,
    adSpend: 2100,
    adSpendChange: 3.6,
    activeCampaigns: 1,
    countries: 8
  }
]

// ── Daily KPI Metrics ──────────────────────────────────────────
export const dailyKpis: KpiMetric[] = [
  {
    key: 'revenue',
    label: '总收入',
    value: '$152,300',
    change: 8.4,
    changeLabel: '环比昨日 ↑ 8.4%',
    color: '#00D4A1',
    bg: 'linear-gradient(135deg, rgba(0,168,117,0.35) 0%, rgba(0,100,70,0.2) 100%)',
    sparkline: [120, 132, 125, 145, 138, 152, 148, 152]
  },
  {
    key: 'paidRevenue',
    label: '付费收入',
    value: '$43,200',
    change: 9.1,
    changeLabel: '环比 ↑ 9.1%',
    color: '#22C55E',
    bg: 'linear-gradient(135deg, rgba(34,197,94,0.3) 0%, rgba(20,120,56,0.15) 100%)',
    sparkline: [35, 38, 36, 41, 40, 43, 42, 43]
  },
  {
    key: 'dau',
    label: '平均DAU',
    value: '78.3万',
    change: 5.2,
    changeLabel: '环比 ↑ 5.2%',
    color: '#3B82F6',
    bg: 'linear-gradient(135deg, rgba(59,130,246,0.3) 0%, rgba(29,78,216,0.15) 100%)',
    sparkline: [68, 70, 72, 74, 75, 76, 78, 78]
  },
  {
    key: 'adSpend',
    label: '广告支出',
    value: '$41,100',
    change: 7.8,
    changeLabel: '环比 ↑ 7.8%',
    color: '#F59E0B',
    bg: 'linear-gradient(135deg, rgba(245,158,11,0.3) 0%, rgba(180,83,9,0.15) 100%)',
    sparkline: [34, 36, 35, 38, 39, 40, 41, 41]
  },
  {
    key: 'profit',
    label: '预估利润',
    value: '$108,900',
    change: 8.9,
    changeLabel: '环比 ↑ 8.9%',
    color: '#8B5CF6',
    bg: 'linear-gradient(135deg, rgba(139,92,246,0.3) 0%, rgba(91,33,182,0.15) 100%)',
    sparkline: [90, 95, 92, 100, 102, 106, 108, 109]
  }
]

// ── Monthly KPI Metrics ────────────────────────────────────────
export const monthlyKpis: KpiMetric[] = [
  {
    key: 'revenue',
    label: '总收缴',
    value: '$4,521,000',
    change: 9.7,
    changeLabel: '月环比 ↑ 9.7%',
    color: '#00D4A1',
    bg: 'linear-gradient(135deg, rgba(0,168,117,0.35) 0%, rgba(0,100,70,0.2) 100%)',
    sparkline: [3800, 4000, 3900, 4100, 4200, 4300, 4400, 4521]
  },
  {
    key: 'paidRevenue',
    label: '付费收缴',
    value: '$1,234,000',
    change: 9.9,
    changeLabel: '月环比 ↑ 9.9%',
    color: '#22C55E',
    bg: 'linear-gradient(135deg, rgba(34,197,94,0.3) 0%, rgba(20,120,56,0.15) 100%)',
    sparkline: [1050, 1080, 1100, 1120, 1150, 1180, 1210, 1234]
  },
  {
    key: 'mau',
    label: 'MAU',
    value: '8,234万',
    change: 4.4,
    changeLabel: '月环比 ↑ 4.4%',
    color: '#06B6D4',
    bg: 'linear-gradient(135deg, rgba(6,182,212,0.3) 0%, rgba(3,105,161,0.15) 100%)',
    sparkline: [7600, 7700, 7800, 7850, 7900, 7980, 8100, 8234],
    badge: 'MONTHLY ONLY'
  },
  {
    key: 'dau',
    label: '平均DAU',
    value: '2,341万',
    change: 8.6,
    changeLabel: '月环比 ↑ 8.6%',
    color: '#3B82F6',
    bg: 'linear-gradient(135deg, rgba(59,130,246,0.3) 0%, rgba(29,78,216,0.15) 100%)',
    sparkline: [2100, 2150, 2180, 2200, 2250, 2280, 2320, 2341]
  },
  {
    key: 'adSpend',
    label: '广告支出',
    value: '$1,234,000',
    change: 9.9,
    changeLabel: '月环比 ↑ 9.9%',
    color: '#F59E0B',
    bg: 'linear-gradient(135deg, rgba(245,158,11,0.3) 0%, rgba(180,83,9,0.15) 100%)',
    sparkline: [1050, 1080, 1100, 1120, 1150, 1180, 1210, 1234]
  },
  {
    key: 'profit',
    label: '预估利润',
    value: '$3,234,000',
    change: 8.3,
    changeLabel: '月环比 ↑ 8.3%',
    color: '#8B5CF6',
    bg: 'linear-gradient(135deg, rgba(139,92,246,0.3) 0%, rgba(91,33,182,0.15) 100%)',
    sparkline: [2900, 2980, 3000, 3050, 3100, 3150, 3200, 3234]
  }
]

// ── Weekly KPI Metrics ─────────────────────────────────────────
export const weeklyKpis: KpiMetric[] = [
  {
    key: 'revenue',
    label: '总收缴',
    value: '$1,064,100',
    change: 8.4,
    changeLabel: '周环比 ↑ 8.4%',
    color: '#00D4A1',
    bg: 'linear-gradient(135deg, rgba(0,168,117,0.35) 0%, rgba(0,100,70,0.2) 100%)',
    sparkline: [960, 980, 1000, 1020, 1030, 1050, 1060, 1064]
  },
  {
    key: 'paidRevenue',
    label: '付费收缴',
    value: '$302,400',
    change: 9.1,
    changeLabel: '周环比 ↑ 9.1%',
    color: '#22C55E',
    bg: 'linear-gradient(135deg, rgba(34,197,94,0.3) 0%, rgba(20,120,56,0.15) 100%)',
    sparkline: [270, 275, 280, 288, 292, 296, 300, 302]
  },
  {
    key: 'dau',
    label: '平均DAU',
    value: '78.3万',
    change: 5.2,
    changeLabel: '周环比 ↑ 5.2%',
    color: '#3B82F6',
    bg: 'linear-gradient(135deg, rgba(59,130,246,0.3) 0%, rgba(29,78,216,0.15) 100%)',
    sparkline: [70, 72, 73, 74, 75, 76, 77, 78]
  },
  {
    key: 'adSpend',
    label: '广告支出',
    value: '$287,700',
    change: 7.8,
    changeLabel: '周环比 ↑ 7.8%',
    color: '#F59E0B',
    bg: 'linear-gradient(135deg, rgba(245,158,11,0.3) 0%, rgba(180,83,9,0.15) 100%)',
    sparkline: [260, 265, 268, 272, 275, 280, 285, 288]
  },
  {
    key: 'profit',
    label: '预估利润',
    value: '$762,300',
    change: 8.9,
    changeLabel: '周环比 ↑ 8.9%',
    color: '#8B5CF6',
    bg: 'linear-gradient(135deg, rgba(139,92,246,0.3) 0%, rgba(91,33,182,0.15) 100%)',
    sparkline: [680, 695, 705, 720, 735, 745, 755, 762]
  }
]

// ── User Metrics ───────────────────────────────────────────────
export const dailyUserMetrics: UserMetricRow[] = [
  {
    name: '新用户',
    current: '40.2万',
    previous: '37.1万',
    change: '+8.4%',
    changeType: 'positive'
  },
  {
    name: '自然量',
    current: '14.5万',
    previous: '13.4万',
    change: '+8.2%',
    changeType: 'positive'
  },
  { name: '自然量比例', current: '36%', previous: '36%', change: '0pp', changeType: 'neutral' },
  {
    name: '买量用户',
    current: '25.7万',
    previous: '23.7万',
    change: '+8.4%',
    changeType: 'positive'
  },
  { name: '广告系列数', current: '14', previous: '13', change: '+1', changeType: 'positive' }
]
export const weeklyUserMetrics: UserMetricRow[] = [
  {
    name: '新用户',
    current: '281.4万',
    previous: '259.7万',
    change: '+8.4%',
    changeType: 'positive'
  },
  {
    name: '自然量',
    current: '101.3万',
    previous: '93.5万',
    change: '+8.3%',
    changeType: 'positive'
  },
  { name: '自然量比例', current: '36%', previous: '36%', change: '0pp', changeType: 'neutral' },
  {
    name: '买量用户',
    current: '179.9万',
    previous: '166.1万',
    change: '+8.3%',
    changeType: 'positive'
  },
  { name: '广告系列数', current: '14', previous: '13', change: '+1', changeType: 'positive' }
]
export const monthlyUserMetrics: UserMetricRow[] = [
  { name: 'MAU', current: '8,234万', previous: '7,891万', change: '+4.4%', changeType: 'positive' },
  {
    name: '平均DAU',
    current: '2,341万',
    previous: '2,156万',
    change: '+8.6%',
    changeType: 'positive'
  },
  { name: '新用户', current: '1.2亿', previous: '1.1亿', change: '+9.1%', changeType: 'positive' },
  {
    name: '自然量',
    current: '4,321万',
    previous: '3,987万',
    change: '+8.4%',
    changeType: 'positive'
  },
  { name: '自然量比例', current: '36%', previous: '36%', change: '0pp', changeType: 'neutral' },
  {
    name: '买量用户',
    current: '7,654万',
    previous: '7,123万',
    change: '+7.5%',
    changeType: 'positive'
  },
  { name: '广告系列数', current: '420', previous: '380', change: '+40', changeType: 'positive' }
]

// ── ROI Metrics ────────────────────────────────────────────────
export const roiMetrics: RoiRow[] = [
  { type: '首日ROI', current: '36%', previous: '34%', change: '+2pp', isHighlighted: false },
  { type: '3日ROI', current: '66%', previous: '64%', change: '+2pp', isHighlighted: false },
  { type: '7日ROI', current: '96%', previous: '94%', change: '+2pp', isHighlighted: false },
  { type: '14日ROI', current: '101%', previous: '99%', change: '+2pp', isHighlighted: true },
  { type: '30日ROI', current: '113%', previous: '113%', change: '0pp', isHighlighted: true },
  { type: '60日ROI', current: '-', previous: '-', change: '-' },
  { type: '90日ROI', current: '-', previous: '-', change: '-' }
]

// ── Retention ──────────────────────────────────────────────────
export const retentionMetrics: RetentionRow[] = [
  { day: '次留', current: '44%', previous: '43%', change: '+1pp', changeType: 'positive' },
  { day: '三留', current: '27%', previous: '26%', change: '+1pp', changeType: 'positive' },
  { day: '七留', current: '15%', previous: '14%', change: '+1pp', changeType: 'positive' },
  { day: '十四留', current: '1%', previous: '1%', change: '0pp', changeType: 'neutral' },
  { day: '三十留', current: '7%', previous: '6%', change: '+1pp', changeType: 'positive' }
]

// ── Revenue Metrics ────────────────────────────────────────────
export const dailyRevenueMetrics: RevenueRow[] = [
  {
    name: '总收入',
    current: '$152,300',
    previous: '$140,500',
    change: '+8.4%',
    changeType: 'positive'
  },
  {
    name: '付费收入',
    current: '$43,200',
    previous: '$39,600',
    change: '+9.1%',
    changeType: 'positive'
  },
  {
    name: '广告收入',
    current: '$109,100',
    previous: '$100,900',
    change: '+8.1%',
    changeType: 'positive'
  },
  {
    name: '预估利润',
    current: '$108,900',
    previous: '$99,900',
    change: '+9.0%',
    changeType: 'positive'
  },
  {
    name: '计算利润',
    current: '$97,200',
    previous: '$89,400',
    change: '+8.7%',
    changeType: 'positive'
  },
  {
    name: '广告支出',
    current: '$41,100',
    previous: '$38,100',
    change: '+7.8%',
    changeType: 'positive'
  }
]
export const monthlyRevenueMetrics: RevenueRow[] = [
  {
    name: '总收缴',
    current: '$4,521,000',
    previous: '$4,123,000',
    change: '+9.7%',
    changeType: 'positive'
  },
  {
    name: '付费收缴',
    current: '$1,234,000',
    previous: '$1,123,000',
    change: '+9.9%',
    changeType: 'positive'
  },
  {
    name: '广告收缴',
    current: '$3,287,000',
    previous: '$3,000,000',
    change: '+9.6%',
    changeType: 'positive'
  },
  {
    name: '预估利润',
    current: '$3,234,000',
    previous: '$2,987,000',
    change: '+8.3%',
    changeType: 'positive'
  },
  {
    name: '计算利润',
    current: '$2,876,000',
    previous: '$2,654,000',
    change: '+8.4%',
    changeType: 'positive'
  },
  {
    name: '广告支出',
    current: '$1,234,000',
    previous: '$1,123,000',
    change: '+9.9%',
    changeType: 'positive'
  }
]

// ── Fee Deductions (Monthly Only) ─────────────────────────────
export const feeDeductions: FeeItem[] = [
  { name: 'Google Ads核减', amount: '+$6,737.28', isPositive: true },
  { name: '广告平台赠款', amount: '+$454.60', isPositive: true },
  { name: '广告服务费', amount: '-$166.63', isPositive: false },
  { name: '网站推广费用', amount: '-$1,893.47', isPositive: false },
  { name: 'XMP年费', amount: '-$5,004.40', isPositive: false },
  { name: 'AF归因费用', amount: '-$9,783.62', isPositive: false },
  { name: 'GCP费用', amount: '-$19,693.27', isPositive: false },
  { name: 'Admob核减', amount: '-$21,458.88', isPositive: false },
  { name: 'AI项目费用', amount: '-$28,293.60', isPositive: false }
]

// ── Ad Platform Cards ─────────────────────────────────────────
export const adPlatformCards: AdPlatformCard[] = [
  {
    id: 'google',
    name: 'Google',
    logo: 'G',
    color: '#4285F4',
    adSpend: '$15,200',
    adSpendChange: 8.1,
    acquisitions: '9.5万',
    cpi: '$1.60',
    cpm: '$9.80',
    cpc: '$0.38',
    campaigns: 5,
    roi1d: '38%',
    roi7d: '98%',
    roi14d: '101%',
    sharePercent: 37
  },
  {
    id: 'facebook',
    name: 'Facebook',
    logo: 'f',
    color: '#1877F2',
    adSpend: '$10,700',
    adSpendChange: 7.4,
    acquisitions: '6.7万',
    cpi: '$1.60',
    cpm: '$9.20',
    cpc: '$0.36',
    campaigns: 3,
    roi1d: '35%',
    roi7d: '94%',
    roi14d: '96%',
    sharePercent: 26
  },
  {
    id: 'unity',
    name: 'Unity',
    logo: 'U',
    color: '#22C55E',
    adSpend: '$6,200',
    adSpendChange: 6.9,
    acquisitions: '3.9万',
    cpi: '$1.59',
    cpm: '$8.90',
    cpc: '$0.35',
    campaigns: 2,
    roi1d: '33%',
    roi7d: '90%',
    roi14d: '93%',
    sharePercent: 15
  },
  {
    id: 'mintegral',
    name: 'Mintegral',
    logo: 'M',
    color: '#F59E0B',
    adSpend: '$4,100',
    adSpendChange: 9.2,
    acquisitions: '2.6万',
    cpi: '$1.58',
    cpm: '$8.60',
    cpc: '$0.34',
    campaigns: 2,
    roi1d: '34%',
    roi7d: '91%',
    sharePercent: 10
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    logo: '♪',
    color: '#FF4D4F',
    adSpend: '$2,500',
    adSpendChange: 5.3,
    acquisitions: '1.6万',
    cpi: '$1.56',
    cpm: '$8.20',
    cpc: '$0.32',
    campaigns: 1,
    roi1d: '31%',
    roi7d: '85%',
    sharePercent: 6
  },
  {
    id: 'snapchat',
    name: 'Snapchat',
    logo: '👻',
    color: '#FFFC00',
    adSpend: '$1,200',
    adSpendChange: 3.1,
    acquisitions: '0.8万',
    cpi: '$1.50',
    cpm: '$7.80',
    cpc: '$0.30',
    campaigns: 1,
    roi1d: '29%',
    roi7d: '79%',
    sharePercent: 3
  }
]

// ── Country Data ───────────────────────────────────────────────
export const countryData: CountryRow[] = [
  {
    flag: '🇺🇸',
    name: '美国',
    avgDau: '23.4万',
    revenue: '$45,600',
    paidRevenue: '$12,900',
    profit: '$32,600',
    calcProfit: '$29,100',
    newUsers: '12.1万',
    organic: '4.4万',
    organicRate: '36%',
    dauShare: 30,
    ecpm: '$12.40',
    arpdau: '1.95',
    adSpend: '$15,200',
    cpi: '$1.26',
    cpm: '$9.80',
    cpc: '$0.38',
    acquisitions: '7.6万',
    campaigns: 4,
    roi1d: '38%',
    roi7d: '98%'
  },
  {
    flag: '🇩🇪',
    name: '德国',
    avgDau: '8.9万',
    revenue: '$17,300',
    paidRevenue: '$4,900',
    profit: '$12,400',
    calcProfit: '$11,100',
    newUsers: '4.6万',
    organic: '1.7万',
    organicRate: '37%',
    dauShare: 11,
    ecpm: '$11.80',
    arpdau: '1.94',
    adSpend: '$5,800',
    cpi: '$1.26',
    cpm: '$9.20',
    cpc: '$0.35',
    acquisitions: '2.9万',
    campaigns: 2,
    roi1d: '37%',
    roi7d: '96%'
  },
  {
    flag: '🇯🇵',
    name: '日本',
    avgDau: '6.7万',
    revenue: '$13,100',
    paidRevenue: '$3,700',
    profit: '$9,400',
    calcProfit: '$8,400',
    newUsers: '3.5万',
    organic: '1.3万',
    organicRate: '37%',
    dauShare: 9,
    ecpm: '$11.70',
    arpdau: '1.95',
    adSpend: '$4,400',
    cpi: '$1.26',
    cpm: '$9.10',
    cpc: '$0.35',
    acquisitions: '2.2万',
    campaigns: 1,
    roi1d: '37%',
    roi7d: '96%'
  },
  {
    flag: '🇰🇷',
    name: '韩国',
    avgDau: '5.3万',
    revenue: '$10,300',
    paidRevenue: '$2,900',
    profit: '$7,400',
    calcProfit: '$6,600',
    newUsers: '2.7万',
    organic: '1.0万',
    organicRate: '37%',
    dauShare: 7,
    ecpm: '$11.60',
    arpdau: '1.94',
    adSpend: '$3,400',
    cpi: '$1.26',
    cpm: '$9.00',
    cpc: '$0.35',
    acquisitions: '1.7万',
    campaigns: 1,
    roi1d: '36%',
    roi7d: '95%'
  },
  {
    flag: '🇧🇷',
    name: '巴西',
    avgDau: '8.9万',
    revenue: '$8,700',
    paidRevenue: '$2,500',
    profit: '$6,200',
    calcProfit: '$5,600',
    newUsers: '4.6万',
    organic: '1.7万',
    organicRate: '37%',
    dauShare: 11,
    ecpm: '$5.80',
    arpdau: '0.98',
    adSpend: '$2,900',
    cpi: '$0.63',
    cpm: '$4.50',
    cpc: '$0.18',
    acquisitions: '2.9万',
    campaigns: 1,
    roi1d: '32%',
    roi7d: '85%'
  },
  {
    flag: '🇲🇽',
    name: '墨西哥',
    avgDau: '6.7万',
    revenue: '$6,500',
    paidRevenue: '$1,800',
    profit: '$4,700',
    calcProfit: '$4,200',
    newUsers: '3.5万',
    organic: '1.3万',
    organicRate: '37%',
    dauShare: 9,
    ecpm: '$5.80',
    arpdau: '0.97',
    adSpend: '$2,200',
    cpi: '$0.63',
    cpm: '$4.40',
    cpc: '$0.17',
    acquisitions: '2.2万',
    campaigns: 1,
    roi1d: '31%',
    roi7d: '83%'
  },
  {
    flag: '🇫🇷',
    name: '法国',
    avgDau: '4.5万',
    revenue: '$8,800',
    paidRevenue: '$2,500',
    profit: '$6,300',
    calcProfit: '$5,600',
    newUsers: '2.3万',
    organic: '0.8万',
    organicRate: '35%',
    dauShare: 6,
    ecpm: '$11.70',
    arpdau: '1.95',
    adSpend: '$3,000',
    cpi: '$1.30',
    cpm: '$9.30',
    cpc: '$0.36',
    acquisitions: '1.5万',
    campaigns: 1,
    roi1d: '37%',
    roi7d: '96%'
  },
  {
    flag: '🇬🇧',
    name: '英国',
    avgDau: '4.5万',
    revenue: '$8,800',
    paidRevenue: '$2,500',
    profit: '$6,300',
    calcProfit: '$5,600',
    newUsers: '2.3万',
    organic: '0.8万',
    organicRate: '35%',
    dauShare: 6,
    ecpm: '$11.80',
    arpdau: '1.96',
    adSpend: '$3,000',
    cpi: '$1.30',
    cpm: '$9.30',
    cpc: '$0.36',
    acquisitions: '1.5万',
    campaigns: 1,
    roi1d: '37%',
    roi7d: '96%'
  }
]

// ── Campaign Data ──────────────────────────────────────────────
export const campaignData: CampaignRow[] = [
  {
    id: '1',
    app: 'BloodSugar2',
    platform: '安卓',
    adPlatform: 'Google',
    adPlatformColor: '#4285F4',
    campaignName: 'BS2_US_Search_Broad_2025Q4',
    status: 'active',
    country: '美国',
    countryFlag: '🇺🇸',
    adSpend: '$3,400',
    adSpendChange: 6.2,
    cpi: '$1.45',
    cpm: '$9.23',
    cpc: '$0.36',
    acquisitions: '2.3万',
    roi1d: '40%',
    roi3d: '72%',
    roi7d: '104%',
    roi14d: '110%',
    roi30d: '122%'
  },
  {
    id: '2',
    app: 'BloodSugar2',
    platform: '安卓',
    adPlatform: 'Google',
    adPlatformColor: '#4285F4',
    campaignName: 'BS2_DE_Brand_2025Q4',
    status: 'active',
    country: '德国',
    countryFlag: '🇩🇪',
    adSpend: '$1,800',
    adSpendChange: 4.1,
    cpi: '$1.34',
    cpm: '$8.90',
    cpc: '$0.35',
    acquisitions: '1.3万',
    roi1d: '39%',
    roi3d: '70%',
    roi7d: '101%',
    roi14d: '107%',
    roi30d: '119%'
  },
  {
    id: '3',
    app: 'BloodSugar2',
    platform: '安卓',
    adPlatform: 'Facebook',
    adPlatformColor: '#1877F2',
    campaignName: 'BS2_US_LAL_2025Q4',
    status: 'active',
    country: '美国',
    countryFlag: '🇺🇸',
    adSpend: '$2,600',
    adSpendChange: 5.8,
    cpi: '$1.38',
    cpm: '$8.70',
    cpc: '$0.34',
    acquisitions: '1.9万',
    roi1d: '37%',
    roi3d: '67%',
    roi7d: '97%',
    roi14d: '103%',
    roi30d: '114%'
  },
  {
    id: '4',
    app: 'BloodSugar2',
    platform: '安卓',
    adPlatform: 'Facebook',
    adPlatformColor: '#1877F2',
    campaignName: 'BS2_BR_Video_2025Q4',
    status: 'paused',
    country: '巴西',
    countryFlag: '🇧🇷',
    adSpend: '$0',
    adSpendChange: -100,
    cpi: '-',
    cpm: '-',
    cpc: '-',
    acquisitions: '0',
    roi1d: '28%',
    roi3d: '50%',
    roi7d: '72%',
    roi14d: '77%',
    roi30d: '85%'
  },
  {
    id: '5',
    app: 'HealthTracker2',
    platform: '安卓',
    adPlatform: 'Google',
    adPlatformColor: '#4285F4',
    campaignName: 'HT2_US_Search_2025Q4',
    status: 'active',
    country: '美国',
    countryFlag: '🇺🇸',
    adSpend: '$2,400',
    adSpendChange: 7.3,
    cpi: '$1.67',
    cpm: '$10.80',
    cpc: '$0.42',
    acquisitions: '1.4万',
    roi1d: '37%',
    roi3d: '66%',
    roi7d: '96%',
    roi14d: '102%',
    roi30d: '113%'
  },
  {
    id: '6',
    app: 'HealthTracker2',
    platform: '安卓',
    adPlatform: 'Unity',
    adPlatformColor: '#22C55E',
    campaignName: 'HT2_JP_Interstitial_Q4',
    status: 'active',
    country: '日本',
    countryFlag: '🇯🇵',
    adSpend: '$1,700',
    adSpendChange: 3.2,
    cpi: '$1.59',
    cpm: '$9.80',
    cpc: '$0.38',
    acquisitions: '1.1万',
    roi1d: '34%',
    roi3d: '61%',
    roi7d: '88%',
    roi14d: '94%',
    roi30d: '104%'
  },
  {
    id: '7',
    app: 'WeatherApp',
    platform: '安卓+iOS',
    adPlatform: 'TikTok',
    adPlatformColor: '#FF4D4F',
    campaignName: 'WA_BR_Video_2025Q4',
    status: 'active',
    country: '巴西',
    countryFlag: '🇧🇷',
    adSpend: '$920',
    adSpendChange: 2.1,
    cpi: '$0.45',
    cpm: '$2.87',
    cpc: '$0.11',
    acquisitions: '2.0万',
    roi1d: '32%',
    roi3d: '57%',
    roi7d: '82%',
    roi14d: '87%',
    roi30d: '97%'
  },
  {
    id: '8',
    app: 'WeatherApp',
    platform: 'iOS',
    adPlatform: 'Mintegral',
    adPlatformColor: '#F59E0B',
    campaignName: 'WA_US_Rewarded_Q4',
    status: 'active',
    country: '美国',
    countryFlag: '🇺🇸',
    adSpend: '$1,100',
    adSpendChange: 8.9,
    cpi: '$1.58',
    cpm: '$9.60',
    cpc: '$0.37',
    acquisitions: '0.7万',
    roi1d: '35%',
    roi3d: '63%',
    roi7d: '91%',
    roi14d: '97%',
    roi30d: '108%'
  },
  {
    id: '9',
    app: 'PhoneTracker2',
    platform: '安卓',
    adPlatform: 'Google',
    adPlatformColor: '#4285F4',
    campaignName: 'PT2_US_Brand_2025Q4',
    status: 'active',
    country: '美国',
    countryFlag: '🇺🇸',
    adSpend: '$1,400',
    adSpendChange: 4.7,
    cpi: '$1.72',
    cpm: '$11.20',
    cpc: '$0.44',
    acquisitions: '0.8万',
    roi1d: '38%',
    roi3d: '68%',
    roi7d: '99%',
    roi14d: '105%',
    roi30d: '116%'
  },
  {
    id: '10',
    app: 'PhoneTracker2',
    platform: '安卓',
    adPlatform: 'Snapchat',
    adPlatformColor: '#FFFC00',
    campaignName: 'PT2_KR_Story_2025Q4',
    status: 'paused',
    country: '韩国',
    countryFlag: '🇰🇷',
    adSpend: '$0',
    adSpendChange: -100,
    cpi: '-',
    cpm: '-',
    cpc: '-',
    acquisitions: '0',
    roi1d: '25%',
    roi3d: '45%',
    roi7d: '65%',
    roi14d: '69%',
    roi30d: '77%'
  }
]

// ── Platform × Country (Hierarchical) ─────────────────────────
export const platformCountryData: PlatformCountryRow[] = [
  {
    id: 'android',
    osPlatform: '安卓',
    adSpend: '',
    cpi: '',
    cpm: '',
    cpc: '',
    roi1d: '',
    roi3d: '',
    roi7d: '',
    roi14d: '',
    roi30d: '',
    profit: '',
    level: 'os',
    isExpanded: true,
    children: [
      {
        id: 'google',
        platform: 'Google',
        platformColor: '#4285F4',
        adSpend: '$456,000',
        changeRate: '+8.1%',
        acquisitions: '180万',
        campaigns: 52,
        cpi: '$1.26',
        cpm: '$9.80',
        cpc: '$0.38',
        roi1d: '38%',
        roi3d: '68%',
        roi7d: '98%',
        roi14d: '101%',
        roi30d: '113%',
        profit: '$1,634,000',
        level: 'platform',
        isExpanded: true,
        children: [
          {
            id: 'google-de',
            country: '德国',
            countryFlag: '🇩🇪',
            adSpend: '$173,000',
            changeRate: '+7.4%',
            acquisitions: '68万',
            campaigns: 20,
            cpi: '$1.26',
            cpm: '$9.20',
            cpc: '$0.36',
            roi1d: '37%',
            roi3d: '66%',
            roi7d: '96%',
            roi14d: '99%',
            roi30d: '110%',
            profit: '$620,000',
            level: 'country'
          },
          {
            id: 'google-jp',
            country: '日本',
            countryFlag: '🇯🇵',
            adSpend: '$131,000',
            changeRate: '+6.9%',
            acquisitions: '52万',
            campaigns: 15,
            cpi: '$1.26',
            cpm: '$9.10',
            cpc: '$0.35',
            roi1d: '37%',
            roi3d: '66%',
            roi7d: '96%',
            roi14d: '99%',
            roi30d: '110%',
            profit: '$469,000',
            level: 'country'
          },
          {
            id: 'google-kr',
            country: '韩国',
            countryFlag: '🇰🇷',
            adSpend: '$102,000',
            changeRate: '+9.2%',
            acquisitions: '40万',
            campaigns: 12,
            cpi: '$1.26',
            cpm: '$9.00',
            cpc: '$0.35',
            roi1d: '36%',
            roi3d: '65%',
            roi7d: '94%',
            roi14d: '97%',
            roi30d: '108%',
            profit: '$365,000',
            level: 'country'
          }
        ]
      },
      {
        id: 'facebook',
        platform: 'Facebook',
        platformColor: '#1877F2',
        adSpend: '$321,000',
        changeRate: '+7.4%',
        acquisitions: '130万',
        campaigns: 37,
        cpi: '$1.24',
        cpm: '$8.70',
        cpc: '$0.34',
        roi1d: '35%',
        roi3d: '63%',
        roi7d: '91%',
        roi14d: '94%',
        roi30d: '104%',
        profit: '$1,150,000',
        level: 'platform',
        isExpanded: true,
        children: [
          {
            id: 'fb-de',
            country: '德国',
            countryFlag: '🇩🇪',
            adSpend: '$122,000',
            changeRate: '+6.8%',
            acquisitions: '50万',
            campaigns: 14,
            cpi: '$1.24',
            cpm: '$8.20',
            cpc: '$0.32',
            roi1d: '34%',
            roi3d: '61%',
            roi7d: '88%',
            roi14d: '91%',
            roi30d: '101%',
            profit: '$437,000',
            level: 'country'
          }
        ]
      }
    ]
  }
]

// ── Compare Mode Data ──────────────────────────────────────────
export const compareApps: CompareAppData[] = [
  {
    id: 'overall',
    name: '整体',
    color: '#00D4A1',
    revenue: '$4,521,000',
    revenueChange: 9.7,
    mau: '8,234万',
    mauChange: 4.4,
    profit: '$3,234,000',
    profitChange: 8.3,
    fee: '-$79,102',
    feeChange: 12.3,
    paid: '$1,234,000',
    paidChange: 9.9,
    ad: '$3,287,000',
    adChange: 9.6
  },
  {
    id: 'health',
    name: '健康',
    color: '#FF6B9D',
    revenue: '$1,234,000',
    revenueChange: 12.3,
    mau: '2,456万',
    mauChange: 8.1,
    profit: '$876,000',
    profitChange: 14.1,
    fee: '-$21,456',
    feeChange: 9.8,
    paid: '$334,000',
    paidChange: 10.1,
    ad: '$900,000',
    adChange: 11.2
  },
  {
    id: 'ai',
    name: 'AI应用',
    color: '#8B5CF6',
    revenue: '$876,000',
    revenueChange: 5.6,
    mau: '1,654万',
    mauChange: 3.2,
    profit: '$543,000',
    profitChange: 4.2,
    fee: '-$15,678',
    feeChange: 8.4,
    paid: '$234,000',
    paidChange: 7.3,
    ad: '$642,000',
    adChange: 4.8
  }
]
export const compareMetrics: CompareMetricRow[] = [
  {
    metric: 'MAU',
    values: { overall: '8,234万', health: '2,456万', ai: '1,654万' },
    bestId: 'overall'
  },
  {
    metric: 'MAU增长',
    values: { overall: '+4.4%', health: '+8.1%', ai: '+3.2%' },
    bestId: 'health'
  },
  { metric: '首日ROI', values: { overall: '36%', health: '34%', ai: '31%' }, bestId: 'overall' },
  { metric: '7日ROI', values: { overall: '96%', health: '91%', ai: '84%' }, bestId: 'overall' },
  { metric: '14日ROI', values: { overall: '101%', health: '96%', ai: '89%' }, bestId: 'overall' },
  { metric: '30日ROI', values: { overall: '113%', health: '108%', ai: '99%' }, bestId: 'overall' },
  {
    metric: '收缴增长',
    values: { overall: '+9.7%', health: '+12.3%', ai: '+5.6%' },
    bestId: 'health'
  },
  {
    metric: '预估利润增长',
    values: { overall: '+8.3%', health: '+14.1%', ai: '+4.2%' },
    bestId: 'health'
  },
  {
    metric: '费用抄扣收缴比',
    values: { overall: '1.75%', health: '1.74%', ai: '1.79%' },
    bestId: 'health'
  }
]
