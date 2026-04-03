import type {
  AppCard,
  AppDetailData,
  RealtimeAppCardRow,
  RealtimeBottomSeries,
  RealtimeHourlySpendComparison,
  RealtimeKpiSummary
} from '../types'

/**
 * 聚合源数据：单文件维护卡片 + 内嵌详情，便于与 `mock/api-mock`、联调前页面一致。
 * 契约上列表与详情已拆分为 03 / 04；下方导出 `mockRealtimeAppCardRows`、`mockRealtimeAppDetailsById` 与之一致。
 */
const mockRealtimeAppCardsSource: AppCard[] = [
  {
    id: 'weather5',
    name: 'Weather5',
    iconText: '⛅',
    iconBg: '#0d3d5a',
    isLive: false,
    hasWarning: false,
    launchLabel: '展开明细',
    spend: 8372,
    spendChange: '8.5%',
    spendUp: true,
    installs: 3518,
    cpi: 2.38,
    cpiChange: '3.2%',
    cpiUp: false,
    activeSeries: 185,
    roi: 94,
    roiGood: true,
    roiColor: '#00cfc0',
    chartData: [120, 160, 200, 280, 360, 520, 640, 720, 780, 760],
    chartColor: '#00cfc0',
    actionTag: '选择',
    actionTagType: 'cyan',
    detail: {
      id: 'weather5',
      name: 'Weather5',
      iconText: '⛅',
      iconBg: '#0d3d5a',
      spend: 8372,
      installs: 3518,
      cpi: 2.38,
      roi1d: 94,
      roi3d: 108,
      estimatedProfit: 1820,
      activeSeries: 185,
      balance: 6200,
      ctr: 3.2,
      cvr: 28.5,
      budgetProgress: 68,
      budgetDaysLeft: '~5天后',
      channels: [
        { name: 'Google Ads', iconColor: '#ea4335', spend: 4800, cpi: 2.25, roi: 96 },
        { name: 'Meta Ads', iconColor: '#1877f2', spend: 2500, cpi: 2.48, roi: 91 },
        { name: 'TikTok Ads', iconColor: '#000000', spend: 1072, cpi: 2.61, roi: 89 }
      ],
      hourlyData: [30, 60, 100, 220, 380, 620, 520, 650],
      hourlyRoi: [18, 22, 38, 55, 72, 90, 92, 96]
    }
  },
  {
    id: 'phonetracker',
    name: 'PhoneTracker',
    iconText: '📱',
    iconBg: '#3d2800',
    isLive: true,
    hasWarning: true,
    warningBadge: '超额',
    launchLabel: '实时',
    spend: 2886,
    installs: 1013,
    cpi: 2.85,
    cpiChange: '3.2%',
    cpiUp: true,
    activeSeries: 98,
    roi: 108,
    roiGood: true,
    roiColor: '#00cfc0',
    chartData: [40, 70, 110, 170, 240, 360, 490, 540, 590, 630],
    chartColor: '#ffa040',
    actionTag: '鼠标',
    actionTagType: 'orange',
    detail: {
      id: 'phonetracker',
      name: 'PhoneTracker',
      iconText: '📱',
      iconBg: '#3d2800',
      spend: 2886,
      installs: 1013,
      cpi: 2.85,
      roi1d: 108,
      roi3d: 124,
      estimatedProfit: 3200,
      activeSeries: 98,
      balance: 8200,
      ctr: 4.1,
      cvr: 31.2,
      budgetProgress: 92,
      budgetDaysLeft: '~1天后',
      channels: [
        { name: 'Google Ads', iconColor: '#ea4335', spend: 1600, cpi: 2.72, roi: 112 },
        { name: 'Meta Ads', iconColor: '#1877f2', spend: 900, cpi: 2.91, roi: 104 },
        { name: 'TikTok Ads', iconColor: '#000000', spend: 386, cpi: 3.02, roi: 99 }
      ],
      hourlyData: [20, 40, 80, 140, 220, 340, 430, 500],
      hourlyRoi: [30, 38, 52, 72, 90, 106, 112, 118]
    }
  },
  {
    id: 'bloodsugar2',
    name: 'BloodSugar2',
    iconText: '🩸',
    iconBg: '#5a0010',
    isLive: false,
    hasWarning: false,
    launchLabel: '展开明细',
    spend: 10438,
    installs: 4468,
    cpi: 2.38,
    activeSeries: 142,
    roi: 97,
    roiGood: true,
    roiColor: '#00cfc0',
    chartData: [280, 310, 400, 470, 530, 620, 660, 690, 720, 700],
    chartColor: '#4d9eff',
    actionTag: '选择',
    actionTagType: 'cyan',
    detail: {
      id: 'bloodsugar2',
      name: 'BloodSugar2',
      iconText: '🩸',
      iconBg: '#5a0010',
      spend: 10638,
      installs: 4468,
      cpi: 2.38,
      roi1d: 97,
      roi3d: 112,
      estimatedProfit: 2100,
      activeSeries: 142,
      balance: 8200,
      ctr: 3.5,
      cvr: 33.4,
      budgetProgress: 76,
      budgetDaysLeft: '~3天后',
      channels: [
        { name: 'Google Ads', iconColor: '#ea4335', spend: 5800, cpi: 2.28, roi: 99 },
        { name: 'Meta Ads', iconColor: '#1877f2', spend: 3200, cpi: 2.51, roi: 94 },
        { name: 'TikTok Ads', iconColor: '#000000', spend: 1638, cpi: 2.6, roi: 89 }
      ],
      hourlyData: [60, 100, 180, 320, 500, 760, 600, 680],
      hourlyRoi: [22, 30, 48, 68, 84, 96, 98, 100]
    }
  },
  {
    id: 'phonetracker2',
    name: 'PhoneTracker2',
    iconText: '📲',
    iconBg: '#22006b',
    isLive: true,
    hasWarning: false,
    launchLabel: '实时',
    spend: 89.68,
    installs: 415,
    cpi: 0.22,
    activeSeries: 5,
    roi: 101,
    roiGood: true,
    roiColor: '#00cfc0',
    chartData: [55, 68, 74, 62, 52, 48, 44, 46, 50, 48],
    chartColor: '#a855f7',
    actionTag: '选择',
    actionTagType: 'cyan',
    detail: {
      id: 'phonetracker2',
      name: 'PhoneTracker2',
      iconText: '📲',
      iconBg: '#22006b',
      spend: 89.68,
      installs: 415,
      cpi: 0.22,
      roi1d: 101,
      roi3d: 118,
      estimatedProfit: 420,
      activeSeries: 5,
      balance: 1500,
      ctr: 2.8,
      cvr: 22.1,
      budgetProgress: 42,
      budgetDaysLeft: '~12天后',
      channels: [
        { name: 'Google Ads', iconColor: '#ea4335', spend: 48, cpi: 0.19, roi: 104 },
        { name: 'Meta Ads', iconColor: '#1877f2', spend: 28, cpi: 0.24, roi: 98 },
        { name: 'TikTok Ads', iconColor: '#000000', spend: 13.68, cpi: 0.26, roi: 95 }
      ],
      hourlyData: [5, 8, 12, 16, 14, 12, 10, 11],
      hourlyRoi: [40, 52, 68, 88, 96, 102, 108, 112]
    }
  },
  {
    id: 'faceme',
    name: 'FaceMe',
    iconText: '😊',
    iconBg: '#5a1010',
    isLive: false,
    hasWarning: true,
    warningBadge: '低活跃',
    launchLabel: '展开明细',
    spend: 1926,
    installs: 812,
    cpi: 2.37,
    activeSeries: 54,
    roi: 64,
    roiGood: false,
    roiColor: '#ff4d6a',
    chartData: [420, 390, 350, 300, 270, 240, 210, 180, 145, 115],
    chartColor: '#ff4d6a',
    actionTag: '没文标',
    actionTagType: 'gray',
    detail: {
      id: 'faceme',
      name: 'FaceMe',
      iconText: '😊',
      iconBg: '#5a1010',
      spend: 1926,
      installs: 812,
      cpi: 2.37,
      roi1d: 64,
      roi3d: 72,
      estimatedProfit: -380,
      activeSeries: 54,
      balance: 3200,
      ctr: 1.9,
      cvr: 14.2,
      budgetProgress: 55,
      budgetDaysLeft: '~7天后',
      channels: [
        { name: 'Google Ads', iconColor: '#ea4335', spend: 980, cpi: 2.28, roi: 68 },
        { name: 'Meta Ads', iconColor: '#1877f2', spend: 620, cpi: 2.44, roi: 62 },
        { name: 'TikTok Ads', iconColor: '#000000', spend: 326, cpi: 2.58, roi: 58 }
      ],
      hourlyData: [180, 210, 240, 260, 220, 180, 140, 100],
      hourlyRoi: [40, 48, 58, 64, 62, 58, 52, 48]
    }
  },
  {
    id: 'dramavue',
    name: 'DramaVue',
    iconText: '🎬',
    iconBg: '#0a0a4a',
    isLive: false,
    hasWarning: false,
    launchLabel: '展开明细',
    spend: 1220,
    installs: 2389,
    cpi: 0.51,
    activeSeries: 12,
    roi: 95,
    roiGood: true,
    roiColor: '#00cfc0',
    chartData: [180, 320, 460, 530, 500, 460, 400, 360, 330, 320],
    chartColor: '#00cfc0',
    actionTag: '金额',
    actionTagType: 'orange',
    detail: {
      id: 'dramavue',
      name: 'DramaVue',
      iconText: '🎬',
      iconBg: '#0a0a4a',
      spend: 1220,
      installs: 2389,
      cpi: 0.51,
      roi1d: 95,
      roi3d: 110,
      estimatedProfit: 1640,
      activeSeries: 12,
      balance: 5500,
      ctr: 4.8,
      cvr: 38.0,
      budgetProgress: 60,
      budgetDaysLeft: '~6天后',
      channels: [
        { name: 'Google Ads', iconColor: '#ea4335', spend: 620, cpi: 0.48, roi: 98 },
        { name: 'Meta Ads', iconColor: '#1877f2', spend: 400, cpi: 0.54, roi: 94 },
        { name: 'TikTok Ads', iconColor: '#000000', spend: 200, cpi: 0.56, roi: 90 }
      ],
      hourlyData: [40, 80, 140, 220, 200, 160, 140, 130],
      hourlyRoi: [30, 46, 65, 82, 90, 92, 96, 100]
    }
  },
  {
    id: 'healthtracker',
    name: 'HealthTracker',
    iconText: '💚',
    iconBg: '#0a3a1a',
    isLive: true,
    hasWarning: false,
    launchLabel: '实时',
    spend: 920,
    installs: 1240,
    cpi: 0.74,
    activeSeries: 18,
    roi: 88,
    roiGood: true,
    roiColor: '#f0b429',
    chartData: [150, 160, 170, 180, 182, 178, 172, 168, 165, 162],
    chartColor: '#00d68f',
    actionTag: '选择',
    actionTagType: 'cyan',
    detail: {
      id: 'healthtracker',
      name: 'HealthTracker',
      iconText: '💚',
      iconBg: '#0a3a1a',
      spend: 920,
      installs: 1240,
      cpi: 0.74,
      roi1d: 88,
      roi3d: 104,
      estimatedProfit: 880,
      activeSeries: 18,
      balance: 4200,
      ctr: 3.8,
      cvr: 29.6,
      budgetProgress: 48,
      budgetDaysLeft: '~9天后',
      channels: [
        { name: 'Google Ads', iconColor: '#ea4335', spend: 480, cpi: 0.7, roi: 90 },
        { name: 'Meta Ads', iconColor: '#1877f2', spend: 290, cpi: 0.76, roi: 86 },
        { name: 'TikTok Ads', iconColor: '#000000', spend: 150, cpi: 0.82, roi: 84 }
      ],
      hourlyData: [30, 60, 90, 140, 160, 200, 180, 160],
      hourlyRoi: [28, 40, 58, 72, 82, 88, 90, 92]
    }
  }
]

export const mockRealtimeAppCards: AppCard[] = mockRealtimeAppCardsSource

export const mockRealtimeAppCardRows: RealtimeAppCardRow[] = mockRealtimeAppCardsSource.map((a) => {
  const { detail, ...row } = a
  void detail
  return row
})

export const mockRealtimeAppDetailsById: Record<string, AppDetailData> = Object.fromEntries(
  mockRealtimeAppCardsSource.map((a) => [a.id, a.detail])
)

export const mockRealtimeKpiSummary: RealtimeKpiSummary = {
  onlineApps: 8,
  totalApps: 12,
  todaySpend: 34858,
  spendChange: '+8.3%',
  roiAvg: 97,
  roiTarget: 85,
  warningApps: 2
}

export const mockRealtimeBottomSeries: RealtimeBottomSeries = {
  weather5: [45, 80, 120, 280, 420, 680, 520, 720],
  phonetracker: [20, 40, 80, 150, 280, 420, 380, 460],
  bloodsugar2: [60, 100, 180, 320, 480, 750, 600, 680],
  phonetracker2: [10, 20, 40, 80, 120, 180, 160, 200],
  roi: [20, 28, 42, 60, 78, 94, 96, 100]
}

/** 与 `04-overview-hourly-spend-comparison` 契约一致；由底部固定键结构派生，供联调/映射参考 */
export const mockRealtimeHourlySpendComparison: RealtimeHourlySpendComparison = {
  hourLabels: ['0:00', '2:00', '4:00', '6:00', '8:00', '10:00', '12:00', '14:00'],
  series: [
    {
      s_app_id: 'weather5',
      name: 'Weather5',
      color: '#00cfc0',
      costSeries: mockRealtimeBottomSeries.weather5
    },
    {
      s_app_id: 'phonetracker',
      name: 'PhoneTracker',
      color: '#ffa040',
      costSeries: mockRealtimeBottomSeries.phonetracker
    },
    {
      s_app_id: 'bloodsugar2',
      name: 'BloodSugar2',
      color: '#4d9eff',
      costSeries: mockRealtimeBottomSeries.bloodsugar2
    },
    {
      s_app_id: 'phonetracker2',
      name: 'PhoneTracker2',
      color: '#a855f7',
      costSeries: mockRealtimeBottomSeries.phonetracker2
    }
  ],
  roiPercentSeries: [...mockRealtimeBottomSeries.roi]
}
