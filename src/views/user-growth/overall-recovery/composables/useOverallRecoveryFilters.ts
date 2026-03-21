/**
 * 整体回收 - 全局筛选与下拉选项
 */
import { ref, onMounted } from 'vue'
import { fetchOverallRecoveryFilterOptions } from '@/api/user-growth'
import type { SelectOption } from '../types'

const DEFAULT_APP_OPTIONS: SelectOption[] = [
  { label: '全部', value: 'all' },
  { label: 'Weather5', value: 'weather5' }
]
const DEFAULT_SOURCE_OPTIONS: SelectOption[] = [
  { label: '全部', value: 'all' },
  { label: 'Google', value: 'google' },
  { label: 'Facebook', value: 'facebook' },
  { label: 'TikTok', value: 'tiktok' }
]
const DEFAULT_COUNTRY_OPTIONS: SelectOption[] = [
  { label: '全部', value: 'all' },
  { label: '美国', value: 'US' },
  { label: '德国', value: 'DE' },
  { label: '日本', value: 'JP' },
  { label: '韩国', value: 'KR' }
]

export function useOverallRecoveryFilters() {
  const appOptions = ref<SelectOption[]>(DEFAULT_APP_OPTIONS)
  const sourceOptions = ref<SelectOption[]>(DEFAULT_SOURCE_OPTIONS)
  const countryOptions = ref<SelectOption[]>(DEFAULT_COUNTRY_OPTIONS)

  async function loadFilterOptions() {
    const res = await fetchOverallRecoveryFilterOptions()
    appOptions.value = res.appOptions
    sourceOptions.value = res.sourceOptions
    countryOptions.value = res.countryOptions
  }

  onMounted(() => {
    loadFilterOptions()
  })

  return { appOptions, sourceOptions, countryOptions, loadFilterOptions }
}
