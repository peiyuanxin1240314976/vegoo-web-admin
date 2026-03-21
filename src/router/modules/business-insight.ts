import { AppRouteRecord } from '@/types/router'

/**
 * 商业洞察 - 一级菜单，含 收入概览、利润分析、IAP/IAA、代投、ECPM 等
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
    },
    {
      path: 'iap-analysis',
      name: 'IapAnalysis',
      component: '/business-insight/iap-analysis',
      meta: {
        title: 'menus.businessInsight.iapAnalysis',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'iap-analysis/detail',
      name: 'IapAnalysisDetail',
      component: '/business-insight/iap-analysis/detail',
      meta: {
        title: 'menus.businessInsight.iapAnalysis',
        keepAlive: false,
        isHide: true,
        activePath: '/business-insight/iap-analysis',
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'iaa-analysis',
      name: 'IaaAnalysis',
      component: '/business-insight/iaa-analysis',
      meta: {
        title: 'menus.businessInsight.iaaAnalysis',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'agency-analysis',
      name: 'AgencyAnalysis',
      component: '/business-insight/agency-analysis',
      meta: {
        title: 'menus.businessInsight.agencyAnalysis',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'ecpm-analysis',
      name: 'EcpmAnalysis',
      component: '/business-insight/ecpm-analysis/EcpmDashboard',
      meta: {
        title: 'menus.businessInsight.ecpmAnalysis',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    }
  ]
}
