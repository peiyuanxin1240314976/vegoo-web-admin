import { AppRouteRecord } from '@/types/router'
import { cockpitRoutes, cockpitMapDetailRoute } from './cockpit'
import { dashboardRoutes } from './dashboard'
import { monetizationRoutes } from './monetization'
import { productOperationsRoutes } from './product-operations'
import { businessInsightRoutes } from './business-insight'
import { userGrowthRoutes } from './user-growth'
import { configManagementRoutes } from './config-management'
import { accountManagementRoutes } from './account-management'
import { systemRoutes } from './system'
// import { resultRoutes } from './result'
// import { exceptionRoutes } from './exception'

/**
 * 导出所有模块化路由（顺序即侧边栏菜单顺序）
 * cockpitMapDetailRoute 为隐藏路由，不显示在侧栏
 */
export const routeModules: AppRouteRecord[] = [
  cockpitRoutes,
  cockpitMapDetailRoute,
  userGrowthRoutes,
  configManagementRoutes,
  accountManagementRoutes,
  businessInsightRoutes,
  dashboardRoutes,
  monetizationRoutes,
  productOperationsRoutes,
  systemRoutes
  // resultRoutes,
  // exceptionRoutes
]
