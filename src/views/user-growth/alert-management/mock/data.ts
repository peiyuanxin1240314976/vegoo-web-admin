/**
 * 预警管理页 Mock（接入真实接口前由 `fetchAlertManagementOverview` 使用）
 */
import type {
  AlertFeedItem,
  AlertManagementOverview,
  AlertManagementOverviewParams
} from '../types'

const baseAlerts: AlertFeedItem[] = [
  {
    id: '1',
    title: 'ROI异常下降 - Facebook 广告平台',
    summary: '今日 ROI 下降 12%，从 153% 降至 135%，CPI 上涨 25% 是主要原因',
    severity: 'high' as const,
    category: 'roi' as const,
    status: 'pending' as const,
    timeLabel: '2小时前',
    metrics: [
      { label: 'ROI：', value: '135%（-12%）', tone: 'danger' as const },
      { label: 'CPI：', value: '$1.25（+25%）', tone: 'danger' as const },
      { label: '影响金额：', value: '-$4.2K', tone: 'danger' as const }
    ],
    actions: ['detail', 'markDone', 'ignore']
  },
  {
    id: '2',
    title: '变现收入下降 - Weather8 应用',
    summary: '今日广告收入环比下降 18%，eCPM 从 $3.2 降至 $2.6，填充率下降 12%',
    severity: 'high' as const,
    category: 'revenue' as const,
    status: 'pending' as const,
    timeLabel: '3小时前',
    metrics: [
      { label: '收入：', value: '$8.2K（-18%）', tone: 'danger' as const },
      { label: 'eCPM：', value: '$2.6（-19%）', tone: 'danger' as const },
      { label: '填充率：', value: '88%（-12%）', tone: 'danger' as const }
    ],
    actions: ['detail', 'markDone', 'ignore']
  },
  {
    id: '3',
    title: '消耗速度过快 - Google Ads',
    summary: '预算消耗快于计划，请关注回收与出价',
    severity: 'medium' as const,
    category: 'cost' as const,
    status: 'pending' as const,
    timeLabel: '2小时前',
    metrics: [
      { label: '日均消耗：', value: '$22.7K', tone: 'warning' as const },
      { label: '预算剩余：', value: '$320' },
      { label: '预计耗尽：', value: '14 天后' }
    ],
    actions: ['detail', 'markDone', 'ignore']
  },
  {
    id: '4',
    title: '用户留存下降 - PhoneTracker2',
    summary: 'D7 留存率从 18% 降至 15%，连续 3 天下降，可能影响 LTV 预测',
    severity: 'medium' as const,
    category: 'retention' as const,
    status: 'pending' as const,
    timeLabel: '2小时前',
    metrics: [
      { label: 'D7 留存：', value: '15%（-17%）', tone: 'warning' as const },
      { label: 'D30 留存：', value: '6%（-25%）', tone: 'warning' as const },
      { label: '影响 LTV：', value: '-$0.15', tone: 'danger' as const }
    ],
    actions: ['detail', 'markDone', 'ignore']
  },
  {
    id: '5',
    title: 'DAU 增长显著 - Weather5 应用',
    summary: 'DAU 增长 25%，达到历史新高',
    severity: 'low' as const,
    category: 'traffic' as const,
    status: 'pending' as const,
    timeLabel: '2小时前',
    metrics: [
      { label: 'DAU：', value: '125,680', tone: 'primary' as const },
      { label: '昨日 DAU：', value: '100,540', tone: 'primary' as const },
      { label: '增长率：', value: '25%' }
    ],
    actions: ['detail', 'markDone', 'ignore']
  }
]

/**
 * 按请求参数裁剪列表（Mock）；KPI/趋势/分类仍用全量模板。
 * `date` 由后端按统计日聚合时生效，Mock 阶段仅占位不参与过滤。
 */
export function buildMockAlertManagementOverview(
  params: AlertManagementOverviewParams
): AlertManagementOverview {
  const base = MOCK_ALERT_MANAGEMENT_OVERVIEW
  const alerts = base.alerts.filter((a) => {
    if (params.severity !== 'all' && a.severity !== params.severity) return false
    if (params.category !== 'all' && a.category !== params.category) return false
    if (params.status !== 'all' && a.status !== params.status) return false
    return true
  })
  return { ...base, alerts }
}

export const MOCK_ALERT_MANAGEMENT_OVERVIEW: AlertManagementOverview = {
  summaryCards: [
    { id: 'today', title: '今日预警', value: '12', accent: 'danger', badge: '+3', icon: 'bell' },
    { id: 'pending', title: '未处理', value: '8', accent: 'warning', icon: 'clock' },
    { id: 'done', title: '已处理', value: '45', accent: 'success', badge: '+5', icon: 'check' },
    {
      id: 'rules',
      title: '预警规则',
      value: '12',
      accent: 'primary',
      badge: '启用中',
      icon: 'setting'
    }
  ],
  trendPrimary: {
    title: '预警趋势分析',
    dates: ['1/1', '1/5', '1/10', '1/15', '1/20', '1/25', '1/30', '2/4'],
    series: [
      { name: '高优先级', color: '#EF4444', data: [4, 5, 3, 6, 5, 4, 5, 4] },
      { name: '中优先级', color: '#F97316', data: [5, 4, 6, 4, 5, 6, 4, 5] },
      { name: '低优先级', color: '#3B82F6', data: [1, 2, 1, 2, 1, 2, 1, 2] }
    ]
  },
  classification: [
    { name: 'ROI异常', value: 40, color: '#22C55E' },
    { name: '成本异常', value: 21, color: '#EAB308' },
    { name: '收入异常', value: 17, color: '#94A3B8' },
    { name: '留存异常', value: 13, color: '#3B82F6' },
    { name: '其他', value: 9, color: '#EF4444' }
  ],
  classificationCenterTitle: '总收入',
  classificationCenterValue: '$2.45M',
  ruleGroups: [
    {
      name: 'ROI 异常监控',
      rules: [
        {
          name: 'ROAS 低于阈值',
          desc: 'ROAS < 1.2 持续 >1 小时',
          priority: '高',
          notify: '飞书、Email'
        },
        { name: 'ROI 警告', desc: 'ROI 较昨日下降 >15%', priority: '中', notify: 'Email' }
      ]
    },
    {
      name: '预算异常监控',
      rules: [{ name: '预算将耗尽', desc: '预计 14 天内耗尽', priority: '高', notify: '飞书' }]
    },
    {
      name: '用户留存监控',
      rules: [{ name: '留存连续下降', desc: 'D7 连续 3 天下滑', priority: '中', notify: 'Email' }]
    }
  ],
  alerts: [
    ...baseAlerts,
    ...baseAlerts.slice(0, 3).map(
      (a, i): AlertFeedItem => ({
        ...a,
        id: `dup-${i + 6}`
      })
    )
  ]
}
