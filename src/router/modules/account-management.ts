import { AppRouteRecord } from '@/types/router'

/**
 * 账户管理 - 一级菜单
 */
export const accountManagementRoutes: AppRouteRecord = {
  path: '/account-management',
  name: 'AccountManagement',
  component: '/index/index',
  redirect: '/account-management/ad-account',
  meta: {
    title: 'menus.accountManagement.title',
    icon: 'ri:bank-card-line',
    roles: ['R_SUPER', 'R_ADMIN'],
    isHide: true
  },
  children: [
    {
      path: 'ad-account',
      name: 'AdAccount',
      component: '/account-management/ad-account',
      meta: {
        title: 'menus.accountManagement.adAccount',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'agency',
      name: 'Agency',
      component: '/account-management/agency',
      meta: {
        title: 'menus.accountManagement.agency',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'bc-management',
      name: 'BcManagement',
      component: '/account-management/bc-management',
      meta: {
        title: 'menus.accountManagement.bcManagement',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'open-account',
      name: 'OpenAccount',
      component: '/account-management/open-account',
      meta: {
        title: 'menus.accountManagement.openAccount',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    }
  ]
}
