import { AppRouteRecord } from '@/types/router'

/**
 * 商业洞察 - 一级菜单，含 收入概览、利润分析
 */
export const businessInsightRoutes: AppRouteRecord = {
  name: 'BusinessInsight',
  path: '/business-insight',
  component: '/index/index',
  meta: {
    title: 'menus.businessInsight.title',
    icon: 'ri:bar-chart-box-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'revenue-overview',
      name: 'RevenueOverview',
      component: '/business-insight/revenue-overview',
      meta: {
        title: 'menus.businessInsight.revenueOverview',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'profit-analysis',
      name: 'ProfitAnalysis',
      component: '/business-insight/profit-analysis',
      meta: {
        title: 'menus.businessInsight.profitAnalysis',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    }
  ]
}
