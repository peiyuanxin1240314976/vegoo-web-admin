import { AppRouteRecord } from '@/types/router'

/**
 * 变现管理 - 一级菜单，含 5 个子菜单
 */
export const monetizationRoutes: AppRouteRecord = {
  name: 'Monetization',
  path: '/monetization',
  component: '/index/index',
  meta: {
    title: 'menus.monetization.title',
    icon: 'ri:money-dollar-circle-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'monetization-analysis',
      name: 'MonetizationAnalysis',
      component: '/monetization/monetization-analysis',
      meta: {
        title: 'menus.monetization.monetizationAnalysis',
        keepAlive: false
      }
    },
    {
      path: 'app-health',
      name: 'AppHealth',
      component: '/monetization/app-health',
      meta: {
        title: 'menus.monetization.appHealth',
        keepAlive: false
      }
    },
    {
      path: 'deep-analysis',
      name: 'MonetizationDeepAnalysis',
      component: '/monetization/deep-analysis',
      meta: {
        title: 'menus.monetization.deepAnalysis',
        keepAlive: false
      }
    },
    {
      path: 'attribution-analysis',
      name: 'AttributionAnalysis',
      component: '/monetization/attribution-analysis',
      meta: {
        title: 'menus.monetization.attributionAnalysis',
        keepAlive: false
      }
    },
    {
      path: 'ltv-prediction',
      name: 'LtvPrediction',
      component: '/monetization/ltv-prediction',
      meta: {
        title: 'menus.monetization.ltvPrediction',
        keepAlive: false
      }
    }
  ]
}
