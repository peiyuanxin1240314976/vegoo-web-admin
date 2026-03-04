import { AppRouteRecord } from '@/types/router'

/**
 * 经营驾驶舱 - 一级菜单，无子菜单
 */
export const cockpitRoutes: AppRouteRecord = {
  name: 'Cockpit',
  path: '/cockpit',
  component: '/cockpit/index',
  meta: {
    title: 'menus.cockpit.title',
    icon: 'ri:dashboard-line',
    roles: ['R_SUPER', 'R_ADMIN']
  }
}
