import { computed, inject, provide, reactive } from 'vue'
import type { IaaTabKey } from '../types'

export type IaaTabLoadingMap = Record<IaaTabKey, boolean>

export interface IaaPageLoadingContext {
  tabLoading: IaaTabLoadingMap
  setTabLoading: (tab: IaaTabKey, loading: boolean) => void
}

const IAA_PAGE_LOADING_KEY: unique symbol = Symbol('iaa-page-loading')

export function provideIaaPageLoading() {
  const tabLoading = reactive<IaaTabLoadingMap>({
    adType: false,
    adPlatform: false,
    adPlacement: false,
    adUnit: false,
    country: false,
    version: false
  })

  function setTabLoading(tab: IaaTabKey, loading: boolean) {
    tabLoading[tab] = loading === true
  }

  const anyTabLoading = computed(() => Object.values(tabLoading).some(Boolean))

  provide<IaaPageLoadingContext>(IAA_PAGE_LOADING_KEY, { tabLoading, setTabLoading })

  return { tabLoading, setTabLoading, anyTabLoading }
}

export function useIaaPageLoading() {
  const ctx = inject<IaaPageLoadingContext | null>(IAA_PAGE_LOADING_KEY, null)
  if (!ctx) return null
  return ctx
}
