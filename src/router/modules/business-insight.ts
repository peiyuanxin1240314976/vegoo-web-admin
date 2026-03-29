import { AppRouteRecord } from '@/types/router'

/**
 * 商业洞察 - 一级菜单，含 收入概览、利润分析、IAP/IAA、ECPM 等
 * （报告管理已迁至产品洞察；本模块保留 business-report 路径重定向）
 * （代投分析已迁至用户增长；本模块保留 agency-analysis 路径重定向）
 * （广告平台信息已迁至用户增长·广告平台分析下；本模块保留 ad-platform-info 路径重定向）
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
      redirect: '/user-growth/agency-analysis',
      meta: {
        title: 'menus.userGrowth.agencyAnalysis',
        isHide: true,
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
    },
    {
      path: 'revenue-deviation',
      name: 'RevenueDeviation',
      component: '/business-insight/revenue-deviation/RevenueDeviation',
      meta: {
        title: 'menus.businessInsight.revenueDeviation',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'business-report',
      redirect: '/product-insight/business-report',
      meta: {
        title: 'menus.productInsight.businessReport',
        isHide: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'ad-platform-detail',
      name: 'AdPlatformDetail',
      component: '/business-insight/ad-platform-detail',
      meta: {
        title: 'menus.businessInsight.adPlatformDetail',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'ad-platform-info',
      redirect: '/user-growth/ad-platform-analysis',
      meta: {
        title: 'menus.businessInsight.adPlatformInfo',
        isHide: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'ad-platform-detail/app-ad-platform-performance',
      name: 'AppAdPlatformPerformance',
      component: '/business-insight/ad-platform-detail/app-ad-platform-performance',
      meta: {
        title: 'menus.businessInsight.appAdPlatformPerformance',
        keepAlive: false,
        isHide: true,
        activePath: '/business-insight/ad-platform-detail',
        roles: ['R_SUPER', 'R_ADMIN']
      }
    }
  ]
}
