import { ref, onMounted } from 'vue'
import { fetchComprehensiveAnalysisFilterOptions } from '@/api/user-growth'
import type { SelectOption } from '../types'

export function useComprehensiveAnalysisFilters() {
  const appOptions = ref<SelectOption[]>([])
  const adPlatformOptions = ref<SelectOption[]>([])
  const countryOptions = ref<SelectOption[]>([])

  onMounted(async () => {
    try {
      const opts = await fetchComprehensiveAnalysisFilterOptions()
      appOptions.value = opts.appOptions
      adPlatformOptions.value = opts.adPlatformOptions
      countryOptions.value = opts.countryOptions
    } catch {
      // 错误提示由 http 拦截器处理；保留空选项避免渲染异常
    }
  })

  return { appOptions, adPlatformOptions, countryOptions }
}
