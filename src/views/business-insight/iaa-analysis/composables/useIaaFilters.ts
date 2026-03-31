/**
 * IAA 分析 - 全局筛选与下拉选项
 * 使用 api/business-insight 的 fetchIaaMetaFilterOptions，便于后续切换真实接口
 */
import { ref, onMounted } from 'vue'
import { fetchIaaMetaFilterOptions } from '@/api/business-insight'
import type { IaaSelectOption } from '../types'

const DEFAULT_APP_OPTIONS: IaaSelectOption[] = [
  // s_app_id 不在前端拼接“全部”，以接口返回为准
]
const DEFAULT_PLATFORM_OPTIONS: IaaSelectOption[] = [
  { label: 'Android&iOS', value: 'all' },
  { label: 'Android', value: 'android' },
  { label: 'iOS', value: 'ios' }
]
const DEFAULT_COUNTRY_OPTIONS: IaaSelectOption[] = [
  { label: '全部', value: 'all' },
  { label: '美国', value: 'US' },
  { label: '韩国', value: 'KR' },
  { label: '日本', value: 'JP' }
]

export function useIaaFilters() {
  const appOptions = ref<IaaSelectOption[]>(DEFAULT_APP_OPTIONS)
  const platformOptions = ref<IaaSelectOption[]>(DEFAULT_PLATFORM_OPTIONS)
  const countryOptions = ref<IaaSelectOption[]>(DEFAULT_COUNTRY_OPTIONS)

  async function loadFilterOptions() {
    try {
      const res = await fetchIaaMetaFilterOptions()
      if (res.appOptions.length) appOptions.value = res.appOptions
      if (res.platformOptions.length) platformOptions.value = res.platformOptions
      if (res.countryOptions.length) countryOptions.value = res.countryOptions
    } catch {
      // 保持默认选项，避免请求失败或未登录时整页因 undefined 崩溃
    }
  }

  onMounted(() => {
    loadFilterOptions()
  })

  return {
    appOptions,
    platformOptions,
    countryOptions,
    loadFilterOptions
  }
}
