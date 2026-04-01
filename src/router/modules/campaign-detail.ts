import { AppRouteRecord } from '@/types/router'

/**
 * 广告系列详情 / 单广告详情 / 编辑 — 与侧栏一级菜单同级，仅代码跳转，不在菜单展示。
 * 勿设 meta.activePath：侧栏用其高亮菜单项，会误选中「广告成效」。
 */
export const campaignDetailHiddenRoutes: AppRouteRecord[] = [
  {
    path: '/campaign-detail',
    name: 'CampaignDetailRoot',
    component: '/index/index',
    meta: {
      title: 'menus.userGrowth.campaignDetail',
      keepAlive: false,
      isHide: true,
      roles: ['R_SUPER', 'R_ADMIN']
    },
    children: [
      {
        path: '',
        name: 'CampaignDetail',
        component: '/user-growth/ad-performance/campaign-detail',
        meta: {
          title: 'menus.userGrowth.campaignDetail',
          keepAlive: false,
          isHide: true,
          roles: ['R_SUPER', 'R_ADMIN']
        }
      },
      {
        path: 'ad-detail',
        name: 'AdDetail',
        component: '/user-growth/ad-performance/campaign-detail/ad-detail',
        meta: {
          title: 'menus.userGrowth.adDetail',
          keepAlive: false,
          isHide: true,
          roles: ['R_SUPER', 'R_ADMIN']
        }
      },
      {
        path: 'ad-edit',
        name: 'AdEdit',
        component: '/user-growth/ad-performance/campaign-detail/ad-edit',
        meta: {
          title: 'menus.userGrowth.adEdit',
          keepAlive: false,
          isHide: true,
          roles: ['R_SUPER', 'R_ADMIN']
        }
      }
    ]
  }
]
