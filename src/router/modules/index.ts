import { AppRouteRecord } from '@/types/router'
import { cockpitRoutes, cockpitMapDetailRoute } from './cockpit'
import { dashboardRoutes } from './dashboard'
import { monetizationRoutes } from './monetization'
import { productOperationsRoutes } from './product-operations'
import { businessInsightRoutes } from './business-insight'
import { productInsightRoutes } from './product-insight'
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
  cockpitRoutes, //经营驾驶舱
  cockpitMapDetailRoute, //经营驾驶舱地图详情
  userGrowthRoutes, //用户增长
  businessInsightRoutes, //商业洞察
  productInsightRoutes, //产品洞察
  productOperationsRoutes, //商品运营
  accountManagementRoutes, //账户管理
  configManagementRoutes, // 平台管理（路径仍为 /config-management）
  dashboardRoutes, // 仪表盘
  monetizationRoutes, // 变现管理
  systemRoutes // 系统管理
  // resultRoutes,//结果
  // exceptionRoutes//异常
]
