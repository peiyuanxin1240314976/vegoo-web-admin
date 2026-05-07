/**
 * ECharts 集中式 resize：全应用共享 window.resize 与侧栏布局监听，
 * 避免 useChart 每实例各绑一份导致监听器与定时器随图表数量线性膨胀。
 */
import { nextTick, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useSettingStore } from '@/store/modules/setting'

const resizers = new Set<() => void>()

let windowResizeDebounceId: number | null = null
let flushRafId: number | null = null
let layoutFallbackTimer: number | null = null
let menuWatchStop: (() => void) | null = null

const RESIZE_DEBOUNCE_MS = 100
const LAYOUT_FALLBACK_MS = 200

function flushAllCharts() {
  flushRafId = null
  for (const fn of resizers) {
    try {
      fn()
    } catch {
      /* 单个图失败不影响其它实例 */
    }
  }
}

function scheduleCoalescedFlush() {
  if (flushRafId != null) {
    cancelAnimationFrame(flushRafId)
  }
  flushRafId = requestAnimationFrame(flushAllCharts)
}

function debouncedWindowResize() {
  if (typeof window === 'undefined') return
  if (windowResizeDebounceId != null) {
    clearTimeout(windowResizeDebounceId)
  }
  windowResizeDebounceId = window.setTimeout(() => {
    windowResizeDebounceId = null
    scheduleCoalescedFlush()
  }, RESIZE_DEBOUNCE_MS)
}

/**
 * 侧栏展开/收起、菜单模式切换、KeepAlive 切回等：合并多次触发，
 * 用 nextTick + rAF + 单次延时兜底替代「每图多段 setTimeout」。
 */
export function scheduleLayoutResize() {
  scheduleCoalescedFlush()
  nextTick(() => {
    scheduleCoalescedFlush()
  })
  if (typeof window === 'undefined') return
  if (layoutFallbackTimer != null) {
    clearTimeout(layoutFallbackTimer)
  }
  layoutFallbackTimer = window.setTimeout(() => {
    layoutFallbackTimer = null
    scheduleCoalescedFlush()
  }, LAYOUT_FALLBACK_MS)
}

function teardownGlobalListeners() {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', debouncedWindowResize)
    if (windowResizeDebounceId != null) {
      clearTimeout(windowResizeDebounceId)
      windowResizeDebounceId = null
    }
    if (layoutFallbackTimer != null) {
      clearTimeout(layoutFallbackTimer)
      layoutFallbackTimer = null
    }
  }
  if (flushRafId != null) {
    cancelAnimationFrame(flushRafId)
    flushRafId = null
  }
  menuWatchStop?.()
  menuWatchStop = null
}

function ensureGlobalListeners() {
  if (typeof window === 'undefined') return
  if (menuWatchStop) return

  window.addEventListener('resize', debouncedWindowResize)

  const settingStore = useSettingStore()
  const { menuOpen, menuType } = storeToRefs(settingStore)
  menuWatchStop = watch(
    [menuOpen, menuType],
    () => {
      scheduleLayoutResize()
    },
    { flush: 'post' }
  )
}

/**
 * 图表实例就绪后注册；dispose 前须调用返回的卸载函数。
 */
export function registerChartResizer(resize: () => void): () => void {
  resizers.add(resize)
  ensureGlobalListeners()
  return () => {
    resizers.delete(resize)
    if (resizers.size === 0) {
      teardownGlobalListeners()
    }
  }
}
