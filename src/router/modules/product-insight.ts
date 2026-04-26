import { AppRouteRecord } from '@/types/router'

/**
 * 产品洞察 - 一级菜单（报告管理等）
 */
export const productInsightRoutes: AppRouteRecord = {
  path: '/product-insight',
  name: 'ProductInsight',
  component: '/index/index',
  meta: {
    title: 'menus.productInsight.title',
    icon: 'ri:lightbulb-flash-line',
    roles: ['R_SUPER', 'R_ADMIN'],
    isHide: true
  },
  children: [
    {
      path: 'business-report',
      name: 'BusinessReport',
      component: '/product-insight/business-report',
      meta: {
        title: 'menus.productInsight.businessReport',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    }
  ]
}
