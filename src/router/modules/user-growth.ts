import { AppRouteRecord } from '@/types/router'

/**
 * 用户增长 - 一级菜单
 */
export const userGrowthRoutes: AppRouteRecord = {
  path: '/user-growth',
  name: 'UserGrowth',
  component: '/index/index',
  meta: {
    title: 'menus.userGrowth.title',
    icon: 'ri:user-add-line',
    roles: ['R_SUPER', 'R_ADMIN'],
    preload: true
  },
  children: [
    {
      path: 'account-performance',
      name: 'AccountPerformance',
      component: '/user-growth/account-performance',
      meta: {
        title: 'menus.userGrowth.accountPerformance',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'ad-platform-analysis',
      name: 'AdPlatformAnalysis',
      component: '/user-growth/ad-platform-analysis',
      meta: {
        title: 'menus.userGrowth.adPlatformAnalysis',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'ad-platform-analysis/ad-platform-info',
      name: 'AdPlatformInfo',
      component: '/user-growth/ad-platform-analysis/ad-platform-info',
      meta: {
        title: 'menus.businessInsight.adPlatformInfo',
        keepAlive: true,
        isHide: true,
        activePath: '/user-growth/ad-platform-analysis',
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'my-ads',
      name: 'MyAds',
      component: '/user-growth/my-ads',
      meta: {
        title: 'menus.userGrowth.myAds',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'my-performance',
      name: 'MyPerformance',
      component: '/user-growth/my-performance',
      meta: {
        title: 'menus.userGrowth.myPerformance',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'real-time-data',
      name: 'AdMobDetail',
      component: '/user-growth/real-time-data',
      meta: {
        title: 'menus.userGrowth.realTimeData',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'ad-performance',
      name: 'AdPerformance',
      component: '/user-growth/ad-performance',
      meta: {
        title: 'menus.userGrowth.adPerformance',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'conversion-management',
      name: 'ConversionManagement',
      component: '/user-growth/conversion-management',
      meta: {
        title: 'menus.userGrowth.conversionManagement',
        isHide: true,
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'agency-analysis',
      name: 'AgencyAnalysis',
      component: '/business-insight/agency-analysis',
      meta: {
        title: 'menus.userGrowth.agencyAnalysis',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'paid-analysis',
      name: 'UserGrowthPaidAnalysis',
      component: '/user-growth/paid-analysis/IAPAnalysis',
      meta: {
        title: 'menus.userGrowth.paidAnalysis',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'overall-recovery',
      name: 'OverallRecovery',
      component: '/user-growth/overall-recovery',
      meta: {
        title: 'menus.userGrowth.overallRecovery',
        isHide: true,
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'performance-analysis',
      name: 'PerformanceAnalysis',
      component: '/user-growth/performance-analysis/PerformanceList',
      meta: {
        title: 'menus.userGrowth.performanceAnalysis',
        isHide: true,
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'performance-analysis/comparison',
      name: 'PerformanceComparison',
      component: '/user-growth/performance-analysis/PerformanceComparison',
      meta: {
        title: 'menus.userGrowth.performanceComparison',
        keepAlive: false,
        isHide: true,
        activePath: '/user-growth/performance-analysis',
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'comprehensive-analysis',
      name: 'ComprehensiveAnalysis',
      component: '/user-growth/comprehensive-analysis',
      meta: {
        title: 'menus.userGrowth.comprehensiveAnalysis',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'comprehensive-analysis/platform-analysis-detail',
      name: 'PlatformAnalysisDetail',
      component: '/user-growth/platform-analysis-detail',
      meta: {
        title: 'menus.userGrowth.platformAnalysisDetail',
        keepAlive: false,
        isHide: true,
        activePath: '/user-growth/comprehensive-analysis',
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'alert-management',
      name: 'AlertManagement',
      component: '/user-growth/alert-management',
      meta: {
        title: 'menus.userGrowth.alertManagement',
        keepAlive: true,
        isHide: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    }
  ]
}
