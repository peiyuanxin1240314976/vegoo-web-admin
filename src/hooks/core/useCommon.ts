/**
 * useCommon - 通用功能集合
 *
 * 提供常用的页面操作功能，包括页面刷新、滚动控制、路径获取等。
 * 这些功能在多个页面和组件中都会用到，统一封装便于复用。
 *
 * ## 主要功能
 *
 * 1. 首页路径 - 获取系统配置的首页路径
 * 2. 页面刷新 - 刷新当前页面内容
 * 3. 滚动控制 - 提供多种滚动到顶部和指定位置的方法
 * 4. 平滑滚动 - 支持平滑滚动动画效果
 *
 * @module useCommon
 * @author VeGoo Team
 */

import { computed } from 'vue'
import { useMenuStore } from '@/store/modules/menu'
import { useSettingStore } from '@/store/modules/setting'

/** 主布局滚动容器：内层 `.layout-content` 为内容区主滚动条，`#app-main` 亦可能滚动（见 views/index/style.scss） */
function forEachAppLayoutScrollEl(fn: (el: HTMLElement) => void) {
  const appMain = document.getElementById('app-main')
  if (appMain) fn(appMain)
  const layoutContent = document.querySelector<HTMLElement>('#app-main .layout-content')
  if (layoutContent) fn(layoutContent)
}

export function useCommon() {
  const menuStore = useMenuStore()
  const settingStore = useSettingStore()

  /**
   * 首页路径
   * 从菜单 store 中获取配置的首页路径
   */
  const homePath = computed(() => menuStore.getHomePath())

  /**
   * 刷新当前页面
   * 通过切换 setting store 中的 refresh 状态触发页面重新渲染
   */
  const refresh = () => {
    settingStore.reload()
  }

  /**
   * 滚动到页面顶部
   * 主内容区实际多在 `#app-main .layout-content` 上滚动，需一并重置；小屏下可能为 window/body。
   */
  const scrollToTop = () => {
    forEachAppLayoutScrollEl((el) => {
      el.scrollTop = 0
    })
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }

  /**
   * 平滑滚动到页面顶部
   * 使用 smooth 行为实现平滑滚动效果
   */
  const smoothScrollToTop = () => {
    const opts = { top: 0, behavior: 'smooth' as const }
    forEachAppLayoutScrollEl((el) => {
      el.scrollTo(opts)
    })
    window.scrollTo(opts)
  }

  /**
   * 滚动到指定位置
   * @param top 目标滚动位置（像素）
   * @param smooth 是否使用平滑滚动
   */
  const scrollTo = (top: number, smooth: boolean = false) => {
    const behavior: ScrollBehavior = smooth ? 'smooth' : 'auto'
    const opts: ScrollToOptions = { top, behavior }
    forEachAppLayoutScrollEl((el) => {
      el.scrollTo(opts)
    })
    window.scrollTo(opts)
  }

  return {
    homePath,
    refresh,
    scrollTo,
    scrollToTop,
    smoothScrollToTop
  }
}
