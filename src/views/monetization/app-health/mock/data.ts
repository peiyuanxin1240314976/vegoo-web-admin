/**
 * App 应用健康分析 Mock 数据
 * 与原型「App应用健康分析」一致
 */
import type { AppHealthOverview } from '../types'

const revenueDates = ['6月6日', '周5', '周9', '16', '17', '18', '21', '周24', '26', '30']

export const MOCK_APP_HEALTH: AppHealthOverview = {
  kpiCards: [
    {
      appId: 'weather8-1',
      appName: 'Weather8',
      theme: 'blue',
      healthScore: 78,
      healthMax: 100,
      revenue: '$1,245',
      revenueCompare: '+3.9%',
      revenueUp: true,
      dau: '98K',
      dauCompare: '5%',
      dauUp: true,
      d7: '98K'
    },
    {
      appId: 'weather8-2',
      appName: 'Weather8',
      theme: 'green',
      healthScore: 82,
      healthMax: 100,
      revenue: '$1,580',
      revenueCompare: '+5.2%',
      revenueUp: true,
      dau: '112K',
      dauCompare: '4%',
      dauUp: true,
      d7: '105K'
    },
    {
      appId: 'weather8-3',
      appName: 'Weather8',
      theme: 'orange',
      healthScore: 65,
      healthMax: 100,
      revenue: '$980',
      revenueCompare: '-2.1%',
      revenueUp: false,
      dau: '76K',
      dauCompare: '-1%',
      dauUp: false,
      d7: '72K'
    },
    {
      appId: 'weather8-4',
      appName: 'Weather8',
      theme: 'purple',
      healthScore: 91,
      healthMax: 100,
      revenue: '$2,120',
      revenueCompare: '+8.3%',
      revenueUp: true,
      dau: '135K',
      dauCompare: '6%',
      dauUp: true,
      d7: '128K'
    },
    {
      appId: 'weather8-5',
      appName: 'Weather8',
      theme: 'cyan',
      healthScore: 72,
      healthMax: 100,
      revenue: '$1,050',
      revenueCompare: '+1.8%',
      revenueUp: true,
      dau: '88K',
      dauCompare: '3%',
      dauUp: true,
      d7: '85K'
    }
  ],
  funnel: [
    { name: '展示数', value: 5200000, percent: '100%' },
    { name: '点击数', value: 312000, percent: '6.0%', subPercent: '100%' },
    { name: '安装数', value: 89000, percent: '28.5%', subPercent: '的点击数' },
    { name: '激活数', value: 58000, percent: '65.2%', subPercent: '的安装数' },
    { name: 'D7活跃用户数', value: 22000, percent: '38.0%', subPercent: '的激活数' },
    { name: '付费用户数', value: 2800, percent: '4.8%', subPercent: '的D7用户数' }
  ],
  retention: [
    { week: 'W1', d1: 58, d3: 42, d7: 35, d714: 28, d30: '$3.28' },
    { week: 'W2', d1: 55, d3: 40, d7: 32, d714: 25, d30: '$3.02' },
    { week: 'W3', d1: 52, d3: 38, d7: 30, d714: 22, d30: '$2.85' },
    { week: 'W4', d1: 48, d3: 35, d7: 28, d714: 20, d30: '$2.60' },
    { week: 'W5', d1: 45, d3: 32, d7: 25, d714: 18, d30: '$2.40' },
    { week: 'W6', d1: 42, d3: 30, d7: 22, d714: 18, d30: '$2.20' }
  ],
  revenueComposition: {
    dates: revenueDates,
    series: [
      {
        name: '付费收入',
        percent: 60,
        data: [45000, 52000, 58000, 62000, 65000, 68000, 72000, 75000, 78000, 82000]
      },
      {
        name: '广告收入',
        percent: 25,
        data: [18000, 21000, 23000, 25000, 26000, 27000, 28000, 29000, 30000, 32000]
      },
      {
        name: '订阅收入',
        percent: 15,
        data: [12000, 14000, 15000, 16000, 17000, 18000, 19000, 20000, 21000, 22000]
      }
    ]
  },
  metricsTable: [
    {
      appId: 'weather8',
      appName: 'Weather8',
      revenue: '$850K',
      revenueGrowth: '+15%',
      revenueGrowthUp: true,
      dau: '125K',
      dauTrend: [110, 115, 118, 120, 122, 124, 125],
      activationRate: '68%',
      d1: '55%',
      d7: '42%',
      d7Trend: [38, 39, 40, 41, 41, 42, 42],
      d30: '42%',
      d30Change: '↑',
      d30Up: true,
      d30Trend: [38, 39, 40, 41, 41, 42, 42],
      payRate: '5.2%',
      payRateChange: '↑',
      payRateUp: true,
      payRateTrend: [4.8, 4.9, 5.0, 5.1, 5.1, 5.2, 5.2],
      arpu: '$2.38',
      ltv30: '$2.38',
      healthScore: 92,
      healthStatus: 'high'
    },
    {
      appId: 'weather8-2',
      appName: 'Weather8',
      revenue: '$620K',
      revenueGrowth: '+8%',
      revenueGrowthUp: true,
      dau: '98K',
      dauTrend: [92, 94, 95, 96, 97, 97, 98],
      activationRate: '65%',
      d1: '52%',
      d7: '38%',
      d7Trend: [35, 36, 37, 37, 38, 38, 38],
      d30: '35%',
      d30Change: '↓',
      d30Up: false,
      d30Trend: [36, 36, 35, 35, 35, 35, 35],
      payRate: '4.2%',
      payRateChange: '↓',
      payRateUp: false,
      payRateTrend: [4.5, 4.4, 4.3, 4.3, 4.2, 4.2, 4.2],
      arpu: '$1.95',
      ltv30: '$1.95',
      healthScore: 78,
      healthStatus: 'medium'
    },
    {
      appId: 'weather8-3',
      appName: 'Weather8',
      revenue: '$380K',
      revenueGrowth: '-5%',
      revenueGrowthUp: false,
      dau: '72K',
      dauTrend: [75, 74, 73, 73, 72, 72, 72],
      activationRate: '58%',
      d1: '45%',
      d7: '28%',
      d7Trend: [26, 27, 27, 28, 28, 28, 28],
      d30: '22%',
      d30Change: '↓',
      d30Up: false,
      d30Trend: [24, 23, 23, 22, 22, 22, 22],
      payRate: '2.1%',
      payRateChange: '↓',
      payRateUp: false,
      payRateTrend: [2.3, 2.2, 2.2, 2.1, 2.1, 2.1, 2.1],
      arpu: '$1.20',
      ltv30: '$1.20',
      healthScore: 52,
      healthStatus: 'low'
    }
  ]
}
