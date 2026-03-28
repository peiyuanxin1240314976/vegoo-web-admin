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
      path: 'app-store-management',
      name: 'AppStoreManagement',
      component: '/config-management/app-store-management',
      meta: {
        title: 'menus.configManagement.appStoreManagement',
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
    },
    {
      path: 'ad-account-management',
      name: 'AdAccountManagement',
      component: '/config-management/ad-account-management',
      meta: {
        title: 'menus.configManagement.adAccountManagement',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'country-management',
      name: 'CountryManagement',
      component: '/config-management/country-management',
      meta: {
        title: 'menus.configManagement.countryManagement',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'exchange-rate-management',
      name: 'ExchangeRateManagement',
      component: '/config-management/exchange-rate-management',
      meta: {
        title: 'menus.configManagement.exchangeRateManagement',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'cost-coefficient',
      name: 'CostCoefficient',
      component: '/config-management/cost-coefficient',
      meta: {
        title: 'menus.configManagement.costCoefficient',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'perf-config',
      name: 'PerfConfig',
      component: '/config-management/perf-config',
      meta: {
        title: 'menus.configManagement.perfConfig',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'order-import',
      name: 'OrderImport',
      component: '/config-management/order-import',
      meta: {
        title: 'menus.configManagement.orderImport',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'order-import/import-report/:taskId',
      name: 'OrderImportReport',
      component: '/config-management/order-import/import-report',
      meta: {
        title: 'menus.configManagement.orderImportReport',
        roles: ['R_SUPER', 'R_ADMIN'],
        isHide: true
      }
    }
  ]
}
