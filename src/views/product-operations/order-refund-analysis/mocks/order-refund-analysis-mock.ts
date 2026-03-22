/**
 * 订单退款分析 - Mock 实现
 * 与 mock/backend-api 契约及 api-mock 示例对齐
 */
import type { DashboardPayload, OrderRefundDashboardParams } from '../types'

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

/** 根据筛选参数生成与页面结构一致的看板数据 */
export function buildMockDashboardPayload(params: OrderRefundDashboardParams): DashboardPayload {
  void params
  const trend: DashboardPayload['trend'] = []
  const base = [
    28000, 31000, 35000, 29000, 64000, 42000, 38000, 35000, 30000, 32000, 28000, 26000, 29000,
    31000, 33000, 30000, 27000, 55000, 48000, 44000, 38000, 34000, 31000, 29000, 33000, 36000,
    32000, 29000, 27000, 30000
  ]
  const ma7: number[] = []
  for (let i = 0; i < 30; i++) {
    const start = Math.max(0, i - 3)
    const end = Math.min(29, i + 3)
    const avg = base.slice(start, end + 1).reduce((a, b) => a + b, 0) / (end - start + 1)
    ma7.push(Math.round(avg))
  }
  const startDate = new Date(params.startDate)
  for (let i = 0; i < 30; i++) {
    const d = new Date(startDate)
    d.setDate(startDate.getDate() + i)
    trend.push({
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      refundAmount: base[i],
      ma7: ma7[i]
    })
  }

  return {
    kpi: {
      totalAmount: 12450,
      totalAmountChange: -8,
      refundRate: 3.2,
      refundRateChange: 0.5,
      orderCount: 1847,
      orderCountChange: -12,
      avgAmount: 6.74,
      revenueRatio: 4.8
    },
    trend,
    reasonData: [
      { name: '用户主动取消', value: 45 },
      { name: '功能不符预期', value: 28 },
      { name: '订阅重复扣费', value: 12 },
      { name: '支付失败', value: 8 },
      { name: '其他', value: 7 }
    ],
    countryData: [
      { country: 'US', rate: 2.8, level: 'good', badge: 'Acceptable' },
      { country: 'UK', rate: 3.1, level: 'warning' },
      { country: 'DE', rate: 4.2, level: 'warning' },
      { country: 'FR', rate: 5.8, level: 'danger', badge: 'High' },
      { country: 'JP', rate: 2.1, level: 'good' },
      { country: 'CN', rate: 6.2, level: 'critical', badge: 'Highest' },
      { country: 'AU', rate: 3.5, level: 'warning' },
      { country: 'CA', rate: 2.9, level: 'good' }
    ],
    orderData: [
      {
        orderId: 'ORD-123456',
        user: 'john.doe@...',
        amount: 15.0,
        reason: '用户主动取消',
        platform: 'Google Play',
        date: '2024-01-23',
        status: 'refunded'
      },
      {
        orderId: 'ORD-789012',
        user: 'jane.smith@...',
        amount: 5.5,
        reason: '订阅重复扣费',
        platform: 'App Store',
        date: '2024-01-22',
        status: 'processing'
      },
      {
        orderId: 'ORD-345678',
        user: 'mike.brown@...',
        amount: 9.99,
        reason: '功能不符预期',
        platform: 'Stripe',
        date: '2024-01-22',
        status: 'pending'
      },
      {
        orderId: 'ORD-901234',
        user: 'lisa.wang@...',
        amount: 49.99,
        reason: '支付失败',
        platform: 'Google Play',
        date: '2024-01-21',
        status: 'refunded'
      },
      {
        orderId: 'ORD-567890',
        user: 'david.lee@...',
        amount: 12.5,
        reason: '其他',
        platform: 'App Store',
        date: '2024-01-21',
        status: 'refunded'
      }
    ],
    alertMessage:
      '高退款率预警：法国地区退款率达5.8%，超过预警阈值5%，建议检查当地付费渠道和定价策略'
  }
}

export async function mockFetchDashboard(
  params: OrderRefundDashboardParams
): Promise<DashboardPayload> {
  await delay(400)
  return buildMockDashboardPayload(params)
}
