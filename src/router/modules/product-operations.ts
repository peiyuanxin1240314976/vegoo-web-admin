import { AppRouteRecord } from '@/types/router'

/**
 * 商品运营 - 一级菜单
 */
export const productOperationsRoutes: AppRouteRecord = {
  name: 'ProductOperations',
  path: '/product-operations',
  component: '/index/index',
  meta: {
    title: 'menus.productOperations.title',
    icon: 'ri:store-2-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'reviews-ratings-monitor',
      name: 'ReviewsRatingsMonitor',
      component: '/product-operations/reviews-ratings-monitor',
      meta: {
        title: 'menus.productOperations.reviewsRatingsMonitor',
        keepAlive: false
      }
    },
    {
      path: 'order-refund-analysis',
      name: 'OrderRefundAnalysis',
      component: '/product-operations/order-refund-analysis',
      meta: {
        title: 'menus.productOperations.orderRefundAnalysis',
        keepAlive: false
      }
    },
    {
      path: 'third-party-stores',
      name: 'ThirdPartyStores',
      component: '/product-operations/third-party-stores',
      meta: {
        title: 'menus.productOperations.thirdPartyStores',
        keepAlive: false
      }
    },
    {
      path: 'text-management',
      name: 'TextManagement',
      component: '/product-operations/text-management',
      meta: {
        title: 'menus.productOperations.textManagement',
        keepAlive: false
      }
    }
  ]
}
