import { AppRouteRecord } from '@/types/router'

export const dashboardRoutes: AppRouteRecord = {
  name: 'Dashboard',
  path: '/dashboard',
  component: '/index/index',
  meta: {
    title: 'menus.dashboard.title',
    icon: 'ri:pie-chart-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'console',
      name: 'Console',
      component: '/dashboard/console',
      meta: {
        title: 'menus.dashboard.console',
        keepAlive: false,
        fixedTab: true
      }
    },
    {
      path: 'big-screen',
      name: 'BigScreen',
      component: '/dashboard/big-screen',
      meta: {
        title: 'menus.dashboard.bigScreen',
        keepAlive: false
      }
    },
    {
      path: 'finance-screen',
      name: 'FinanceScreen',
      component: '/dashboard/finance-screen',
      meta: {
        title: 'menus.dashboard.financeScreen',
        keepAlive: false
      }
    },
    {
      path: 'deep-analysis',
      name: 'DeepAnalysis',
      component: '/dashboard/deep-analysis',
      meta: {
        title: 'menus.dashboard.deepAnalysis',
        keepAlive: false
      }
    }
  ]
}
