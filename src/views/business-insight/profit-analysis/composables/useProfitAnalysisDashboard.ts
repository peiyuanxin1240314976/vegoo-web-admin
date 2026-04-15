import { computed, reactive, ref } from 'vue'
import type { ComputedRef, Reactive, Ref } from 'vue'
/** ElDatePicker shortcuts（element-plus 未导出 ShortcutProps 时的本地形状） */
interface ProfitDatePickerShortcut {
  text: string
  value: () => [Date, Date]
}
import type {
  ProfitAnalysisQueryParams,
  ProfitAppTotal,
  ProfitCountryRow,
  ProfitFilterOptions,
  ProfitKpiCard,
  ProfitMapDataItem,
  ProfitMapScatterItem,
  ProfitAppRow,
  ProfitSankeyLink,
  ProfitSankeyNode,
  ProfitTrend30d
} from '../types'
import {
  fetchProfitMetaFilterOptions,
  fetchProfitOverviewCountryProfit,
  fetchProfitOverviewKpi,
  fetchProfitOverviewSankey,
  fetchProfitOverviewTrend30d,
  fetchProfitTableAppProfit
} from '@/api/business-insight'
import { cloneAppDate, formatYYYYMMDD, getAppNow } from '@/utils/app-now'

const DEFAULT_FILTER_OPTIONS: ProfitFilterOptions = {
  appOptions: [{ label: '全部', value: 'all' }],
  countryOptions: [{ label: '全部', value: 'all' }],
  platformOptions: [
    { label: '全部', value: 'all' },
    { label: 'Android', value: 'android' },
    { label: 'iOS', value: 'ios' }
  ]
}

const EMPTY_TOTAL: ProfitAppTotal = {
  adRev: '—',
  paidRev: '—',
  total: '—',
  adSpend: '—',
  profit: '—',
  rate: '—'
}

const EMPTY_TREND: ProfitTrend30d = {
  days: [],
  revenue: [],
  adSpend: [],
  profit: []
}

function mergeFilterOptions(remote: ProfitFilterOptions | null): ProfitFilterOptions {
  if (!remote) return { ...DEFAULT_FILTER_OPTIONS }
  return {
    appOptions: remote.appOptions?.length ? remote.appOptions : DEFAULT_FILTER_OPTIONS.appOptions,
    countryOptions: remote.countryOptions?.length
      ? remote.countryOptions
      : DEFAULT_FILTER_OPTIONS.countryOptions,
    platformOptions: remote.platformOptions?.length
      ? remote.platformOptions
      : DEFAULT_FILTER_OPTIONS.platformOptions,
    datePresets: remote.datePresets?.length ? remote.datePresets : undefined
  }
}

export interface UseProfitAnalysisDashboardReturn {
  query: Reactive<ProfitAnalysisQueryParams>
  filterOptions: Ref<ProfitFilterOptions>
  pendingMeta: Ref<boolean>
  dateRangePicker: ComputedRef<[string, string] | null>
  dateShortcuts: ComputedRef<ProfitDatePickerShortcut[]>
  kpiCards: Ref<ProfitKpiCard[]>
  appRows: Ref<ProfitAppRow[]>
  appTotal: Ref<ProfitAppTotal>
  mapData: Ref<ProfitMapDataItem[]>
  mapScatter: Ref<ProfitMapScatterItem[]>
  countryRows: Ref<ProfitCountryRow[]>
  trend30d: Ref<ProfitTrend30d>
  sankeyNodes: Ref<ProfitSankeyNode[]>
  sankeyLinks: Ref<ProfitSankeyLink[]>
  pendingKpi: Ref<boolean>
  pendingApp: Ref<boolean>
  pendingCountry: Ref<boolean>
  pendingTrend: Ref<boolean>
  pendingSankey: Ref<boolean>
  loadFilterMeta: () => Promise<void>
  loadDashboard: () => Promise<void>
  reloadDashboard: () => Promise<void>
  buildParams: () => ProfitAnalysisQueryParams
}

export function useProfitAnalysisDashboard(): UseProfitAnalysisDashboardReturn {
  const appNow = getAppNow()
  const defaultEnd = formatYYYYMMDD(appNow)
  const defaultStartDate = cloneAppDate(appNow)
  // 保持原有默认跨度（5 天）：结束为“今天”，开始往前推 4 天
  defaultStartDate.setDate(defaultStartDate.getDate() - 4)
  const defaultStart = formatYYYYMMDD(defaultStartDate)

  const query = reactive<ProfitAnalysisQueryParams>({
    currentPage: 0,
    pageSize: 0,
    dateRange: `${defaultStart},${defaultEnd}`,
    platform: 'all',
    sAppId: 'all',
    sCountryCode: 'all'
  })

  const filterOptions = ref<ProfitFilterOptions>({ ...DEFAULT_FILTER_OPTIONS })
  const pendingMeta = ref(false)

  const kpiCards = ref<ProfitKpiCard[]>([])
  const appRows = ref<ProfitAppRow[]>([])
  const appTotal = ref<ProfitAppTotal>({ ...EMPTY_TOTAL })
  const mapData = ref<ProfitMapDataItem[]>([])
  const mapScatter = ref<ProfitMapScatterItem[]>([])
  const countryRows = ref<ProfitCountryRow[]>([])
  const trend30d = ref<ProfitTrend30d>({ ...EMPTY_TREND })
  const sankeyNodes = ref<ProfitSankeyNode[]>([])
  const sankeyLinks = ref<ProfitSankeyLink[]>([])

  const pendingKpi = ref(false)
  const pendingApp = ref(false)
  const pendingCountry = ref(false)
  const pendingTrend = ref(false)
  const pendingSankey = ref(false)

  const dateRangePicker = computed({
    get(): [string, string] | null {
      const s = (query.dateRange ?? '').trim()
      if (!s.includes(',')) return null
      const [a, b] = s.split(',').map((x) => x.trim())
      if (!/^\d{4}-\d{2}-\d{2}$/.test(a) || !/^\d{4}-\d{2}-\d{2}$/.test(b)) return null
      return [a, b]
    },
    set(v: [string, string] | null) {
      if (v?.[0] && v?.[1]) query.dateRange = `${v[0]},${v[1]}`
    }
  })

  const dateShortcuts = computed<ProfitDatePickerShortcut[]>(() => {
    const presets = filterOptions.value.datePresets
    if (!presets?.length) return []
    return presets
      .map((p) => {
        const n = Number(p.value)
        if (!Number.isFinite(n) || n < 1) return null
        return {
          text: p.label,
          value: () => {
            const end = cloneAppDate(getAppNow())
            end.setHours(0, 0, 0, 0)
            const start = cloneAppDate(end)
            start.setDate(start.getDate() - (n - 1))
            return [start, end]
          }
        }
      })
      .filter((x): x is ProfitDatePickerShortcut => x != null)
  })

  function buildParams(): ProfitAnalysisQueryParams {
    return {
      dateRange: query.dateRange,
      currentPage: query.currentPage,
      pageSize: query.pageSize,
      platform: query.platform,
      sAppId: query.sAppId,
      sCountryCode: query.sCountryCode
    }
  }

  async function loadFilterMeta() {
    pendingMeta.value = true
    try {
      const data = await fetchProfitMetaFilterOptions()
      filterOptions.value = mergeFilterOptions(data)
    } catch {
      filterOptions.value = { ...DEFAULT_FILTER_OPTIONS }
    } finally {
      pendingMeta.value = false
    }
  }

  async function loadDashboard() {
    const p = buildParams()

    const run = async <T>(
      pending: typeof pendingKpi,
      task: () => Promise<T>,
      onOk: (data: T) => void
    ) => {
      pending.value = true
      try {
        const data = await task()
        onOk(data)
      } catch {
        /* 错误提示由 @/utils/http 统一处理 */
      } finally {
        pending.value = false
      }
    }

    await Promise.all([
      run(
        pendingKpi,
        () => fetchProfitOverviewKpi(p),
        (d) => {
          kpiCards.value = d.kpis ?? []
        }
      ),
      run(
        pendingApp,
        () => fetchProfitTableAppProfit(p),
        (d) => {
          appRows.value = d.rows ?? []
          appTotal.value = d.total ?? { ...EMPTY_TOTAL }
        }
      ),
      run(
        pendingCountry,
        () => fetchProfitOverviewCountryProfit(p),
        (d) => {
          mapData.value = d.mapData ?? []
          mapScatter.value = d.mapScatter ?? []
          countryRows.value = d.countryRows ?? []
        }
      ),
      run(
        pendingTrend,
        () => fetchProfitOverviewTrend30d(p),
        (d) => {
          trend30d.value = d ?? { ...EMPTY_TREND }
        }
      ),
      run(
        pendingSankey,
        () => fetchProfitOverviewSankey(p),
        (d) => {
          sankeyNodes.value = d.nodes ?? []
          sankeyLinks.value = d.links ?? []
        }
      )
    ])
  }

  async function reloadDashboard() {
    await loadDashboard()
  }

  return {
    query,
    filterOptions,
    pendingMeta,
    dateRangePicker,
    dateShortcuts,
    kpiCards,
    appRows,
    appTotal,
    mapData,
    mapScatter,
    countryRows,
    trend30d,
    sankeyNodes,
    sankeyLinks,
    pendingKpi,
    pendingApp,
    pendingCountry,
    pendingTrend,
    pendingSankey,
    loadFilterMeta,
    loadDashboard,
    reloadDashboard,
    buildParams
  }
}
