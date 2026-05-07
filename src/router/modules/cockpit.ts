import { AppRouteRecord } from '@/types/router'

/**
 * 经营驾驶舱 - 一级菜单
 */
export const cockpitRoutes: AppRouteRecord = {
  name: 'Cockpit',
  path: '/cockpit',
  component: '/cockpit/index',
  meta: {
    title: 'menus.cockpit.title',
    icon: 'ri:dashboard-line',
    roles: ['R_SUPER', 'R_ADMIN'],
    keepAlive: false,
    preload: true
  }
}

/**
 * 地区详情 - 与驾驶舱同级，由地图 tooltip 跳转，不在侧栏展示
 */
export const cockpitMapDetailRoute: AppRouteRecord = {
  name: 'CockpitMapDetail',
  path: '/cockpit-map-detail/:country',
  component: '/cockpit/modules/map-detail',
  meta: {
    title: '地区详情',
    isHide: true,
    keepAlive: false,
    roles: ['R_SUPER', 'R_ADMIN']
  }
}
