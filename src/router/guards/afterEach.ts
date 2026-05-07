import { nextTick } from 'vue'
import { useSettingStore } from '@/store/modules/setting'
import { Router } from 'vue-router'
import NProgress from 'nprogress'
import { useCommon } from '@/hooks/core/useCommon'
import { loadingService } from '@/utils/ui'
import mittBus from '@/utils/sys/mittBus'
import { getPendingLoading, resetPendingLoading } from './beforeEach'

/** 路由全局后置守卫 */
export function setupAfterEachGuard(router: Router) {
  const { scrollToTop } = useCommon()

  router.afterEach(() => {
    // 布局主滚动条在 #app-main .layout-content 上，且路由过渡后 DOM 可能晚一拍，延后重置避免仍停在底部
    nextTick(() => {
      scrollToTop()
    })

    // 路由切换后自动收起所有浮层（弹窗/抽屉等），避免残留遮罩或滚动锁定
    mittBus.emit('closeOverlays')

    // 关闭进度条
    const settingStore = useSettingStore()
    if (settingStore.showNprogress) {
      NProgress.done()
      NProgress.remove()
    }

    // 关闭 loading 效果
    if (getPendingLoading()) {
      nextTick(() => {
        loadingService.hideLoading()
        resetPendingLoading()
      })
    }
  })
}
