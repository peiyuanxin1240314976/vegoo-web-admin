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
    roles: ['R_SUPER', 'R_ADMIN']
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
      path: 'ad-platform-detail',
      name: 'AdPlatformDetail',
      component: '/user-growth/ad-platform-detail',
      meta: {
        title: 'menus.userGrowth.adPlatformDetail',
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
    }
  ]
}
