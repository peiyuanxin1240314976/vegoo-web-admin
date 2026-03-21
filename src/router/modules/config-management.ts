import { AppRouteRecord } from '@/types/router'

/**
 * 配置管理 - 一级菜单（与用户增长同级）
 */
export const configManagementRoutes: AppRouteRecord = {
  path: '/config-management',
  name: 'ConfigManagement',
  component: '/index/index',
  redirect: '/config-management/application-management',
  meta: {
    title: 'menus.configManagement.title',
    icon: 'ri:settings-3-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'application-management',
      name: 'ApplicationManagement',
      component: '/config-management/application-management',
      meta: {
        title: 'menus.configManagement.applicationManagement',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    }
  ]
}
