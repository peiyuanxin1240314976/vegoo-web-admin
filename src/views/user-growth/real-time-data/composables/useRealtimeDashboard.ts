import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { useCockpitMetaFilterStore } from '@/store/modules/cockpit-meta-filter'
import type { CockpitMetaOptionItem, CockpitSettingAppItem } from '@/types/cockpit-meta-filter'
import { toAppIdsRequestBody } from '@/utils/app-id-request'
import {
  fetchRealtimeOverviewKpiSummary,
  fetchRealtimeTableAppCards,
  fetchRealtimeOverviewHourlySpendComparison,
  fetchRealtimeAppDetail
} from '@/api/user-growth/real-time-data'
import type {
  AppDetailData,
  RealtimeAppCardRow,
  RealtimeDataQueryParams,
  RealtimeHourlySpendComparison,
  RealtimeKpiSummary
} from '../types'

const EMPTY_KPI: RealtimeKpiSummary = {
  onlineApps: 0,
  totalApps: 0,
  todaySpend: 0,
  spendChange: '—',
  roiAvg: 0,
  roiTarget: 0,
  warningApps: 0
}

/**
 * 综合分析 meta 里部分 Mock 使用 slug（google / facebook），实时数据筛选入参使用 `source` 字符串枚举。
 * 已为标准枚举值的选项会原样透传。
 */
function mapUiSourceToApiSource(uiValue: string): string {
  if (!uiValue) return ''
  const slugMap: Record<string, string> = {
    google: '1',
    facebook: '2',
    tiktok: '7'
  }
  return slugMap[uiValue] ?? uiValue
}

/** 与 `buildComprehensiveAnalysisApiParams` 一致：meta 里「全部」可能为 `all` / `''` */
function dimensionToApiValue(v: string | string[] | undefined | null) {
  if (Array.isArray(v)) return v
  const s = v ?? ''
  return s === 'all' || s === '' ? '' : s
}

/**
 * 列表/KPI/底部图请求体：始终带齐 `appIds`、`source`（空串表示不限）。
 */
function buildQueryParams(
  filterAppId: string | string[],
  filterSourceUi: string
): RealtimeDataQueryParams {
  const sourceValue = dimensionToApiValue(filterSourceUi)
  return {
    appIds: toAppIdsRequestBody(dimensionToApiValue(filterAppId)),
    source: mapUiSourceToApiSource(Array.isArray(sourceValue) ? '' : sourceValue)
  }
}

/**
 * 实时数据看板：筛选项读 `useCockpitMetaFilterStore().data`（`ensureLoaded` 拉取/复用 session）；列表/KPI/底部图来自 `fetchRealtime*`。
 */
export function useRealtimeDashboard() {
  const { t } = useI18n()
  const cockpitMetaFilterStore = useCockpitMetaFilterStore()

  const apps = ref<RealtimeAppCardRow[]>([])
  const kpiData = ref<RealtimeKpiSummary>({ ...EMPTY_KPI })
  const hourlyComparison = ref<RealtimeHourlySpendComparison | null>(null)
  const detailCache = ref<Record<string, AppDetailData>>({})

  const rawAppOptions = computed(
    () => cockpitMetaFilterStore.data?.appOptions ?? ([] as CockpitMetaOptionItem[])
  )
  const settingApps = computed(
    () => cockpitMetaFilterStore.data?.settingApps ?? ([] as CockpitSettingAppItem[])
  )
  const rawSourceOptions = computed(
    () => cockpitMetaFilterStore.data?.sourceOptions ?? ([] as CockpitMetaOptionItem[])
  )

  /** 与契约一致：空字符串表示「全部应用」 */
  const filterAppId = ref<string | string[]>([])
  /** 下拉原始 value（可能为 Mock slug 或后端 `source` 字符串） */
  const filterSourceUi = ref('')

  const filterOptionsLoading = ref(false)
  const dashboardLoading = ref(false)

  const appSelectOptions = computed<CockpitMetaOptionItem[]>(() => {
    const rest = rawAppOptions.value.filter((o) => o.value !== 'all')
    return [{ label: t('realtimeDashboard.composable.allApps'), value: '' }, ...rest]
  })

  const sourceSelectOptions = computed<CockpitMetaOptionItem[]>(() => {
    const rest = rawSourceOptions.value.filter((o) => o.value !== 'all')
    return [{ label: t('realtimeDashboard.composable.allAdPlatforms'), value: '' }, ...rest]
  })

  async function loadFilterOptions() {
    filterOptionsLoading.value = true
    try {
      const data = await cockpitMetaFilterStore.ensureLoaded()
      if (!data) {
        ElMessage.error(t('realtimeDashboard.composable.filterLoadFailed'))
      }
    } finally {
      filterOptionsLoading.value = false
    }
  }

  async function loadDashboard() {
    const appId = filterAppId.value ?? ''
    const srcUi = filterSourceUi.value ?? ''
    filterAppId.value = appId
    filterSourceUi.value = srcUi
    const params = buildQueryParams(appId, srcUi)
    dashboardLoading.value = true
    try {
      const [kpi, table, hourly] = await Promise.all([
        fetchRealtimeOverviewKpiSummary(params),
        fetchRealtimeTableAppCards(params),
        fetchRealtimeOverviewHourlySpendComparison(params)
      ])
      kpiData.value = kpi
      hourlyComparison.value = hourly

      apps.value = table.items ?? []
    } catch (e) {
      console.error(e)
      ElMessage.error(t('realtimeDashboard.composable.dashboardLoadFailed'))
      apps.value = []
      kpiData.value = { ...EMPTY_KPI }
      hourlyComparison.value = null
    } finally {
      dashboardLoading.value = false
    }
  }

  async function loadAppDetail(appId: string): Promise<AppDetailData | null> {
    const params = buildQueryParams(filterAppId.value ?? '', filterSourceUi.value ?? '')
    const cacheKey = `${appId}::${params.source}`
    const cached = detailCache.value[cacheKey]
    if (cached) return cached
    try {
      const res = await fetchRealtimeAppDetail({
        appId,
        source: params.source
      })
      detailCache.value[cacheKey] = res.detail
      return res.detail
    } catch (e) {
      console.error(e)
      ElMessage.error(t('realtimeDashboard.composable.appDetailLoadFailed'))
      return null
    }
  }

  return {
    apps,
    kpiData,
    hourlyComparison,
    filterAppId,
    filterSourceUi,
    appSelectOptions,
    settingApps,
    sourceSelectOptions,
    filterOptionsLoading,
    dashboardLoading,
    loadFilterOptions,
    loadDashboard,
    loadAppDetail,
    buildQueryParams: () => buildQueryParams(filterAppId.value, filterSourceUi.value)
  }
}
