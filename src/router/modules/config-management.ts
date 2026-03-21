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
    },
    {
      path: 'app-assignment',
      name: 'AppAssignment',
      component: '/config-management/app-assignment',
      meta: {
        title: 'menus.configManagement.appAssignment',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'optimizer-management',
      name: 'OptimizerManagement',
      component: '/config-management/optimizer-management',
      meta: {
        title: 'menus.configManagement.optimizerManagement',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'user-management',
      name: 'ConfigUserManagement',
      component: '/config-management/user-management',
      meta: {
        title: 'menus.configManagement.userManagement',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    }
  ]
}
