import { AppRouteRecord } from '@/types/router'
import { cockpitRoutes } from './cockpit'
import { dashboardRoutes } from './dashboard'
import { monetizationRoutes } from './monetization'
import { systemRoutes } from './system'
import { resultRoutes } from './result'
import { exceptionRoutes } from './exception'

/**
 * 导出所有模块化路由（顺序即侧边栏菜单顺序）
 */
export const routeModules: AppRouteRecord[] = [
  cockpitRoutes,
  dashboardRoutes,
  monetizationRoutes,
  systemRoutes,
  resultRoutes,
  exceptionRoutes
]
