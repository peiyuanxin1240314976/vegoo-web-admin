import { computed, reactive, ref } from 'vue'
import type { ComputedRef, Reactive, Ref } from 'vue'
import type {
  ProfitAnalysisQueryParams,
  ProfitCountryRow,
  ProfitFilterOptions,
  ProfitKpiCard,
  ProfitAppProfitTreeNode,
  ProfitSankeyLink,
  ProfitSankeyNode,
  ProfitSelectOption,
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

/** 与页面 ElSelect 首项「全部」value="" 一致：列表内不再保留 value 为 all/空串 的占位项 */
function stripAllSentinelOptions(list: ProfitSelectOption[] | undefined): ProfitSelectOption[] {
  if (!Array.isArray(list)) return []
  return list.filter((o) => {
    const v = String(o.value ?? '')
      .trim()
      .toLowerCase()
    return v !== '' && v !== 'all'
  })
}

const DEFAULT_FILTER_OPTIONS: ProfitFilterOptions = {
  appOptions: [],
  countryOptions: [],
  platformOptions: [
    { label: 'Android', value: 'android' },
    { label: 'iOS', value: 'ios' }
  ]
}

const EMPTY_TREND: ProfitTrend30d = {
  days: [],
  revenue: [],
  adSpend: [],
  profit: []
}

const EMPTY_APP_PROFIT_ROOT: ProfitAppProfitTreeNode = {
  id: 'root',
  name: '全部应用、全部国家',
  appName: '全部应用',
  adRev: '—',
  paidRev: '—',
  adSpend: '—',
  profit: '—',
  profitColor: '#94a3b8',
  roi1d: '—',
  avgDau: '—',
  newUsers: '—',
  paidUsers: '—',
  organicUsers: '—',
  profitTrend: [],
  children: []
}

function mergeFilterOptions(remote: ProfitFilterOptions | null): ProfitFilterOptions {
  if (!remote) return { ...DEFAULT_FILTER_OPTIONS }
  const app = remote.appOptions?.length
    ? stripAllSentinelOptions(remote.appOptions)
    : DEFAULT_FILTER_OPTIONS.appOptions
  const country = remote.countryOptions?.length
    ? stripAllSentinelOptions(remote.countryOptions)
    : DEFAULT_FILTER_OPTIONS.countryOptions
  const plat = remote.platformOptions?.length
    ? stripAllSentinelOptions(remote.platformOptions)
    : DEFAULT_FILTER_OPTIONS.platformOptions
  return {
    appOptions: app,
    countryOptions: country,
    platformOptions: plat.length ? plat : DEFAULT_FILTER_OPTIONS.platformOptions,
    datePresets: remote.datePresets?.length ? remote.datePresets : undefined
  }
}

export interface UseProfitAnalysisDashboardReturn {
  query: Reactive<ProfitAnalysisQueryParams>
  filterOptions: Ref<ProfitFilterOptions>
  pendingMeta: Ref<boolean>
  dateRangePicker: ComputedRef<[string, string] | null>
  kpiCards: Ref<ProfitKpiCard[]>
  appProfitRoot: Ref<ProfitAppProfitTreeNode>
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
    platform: '',
    sAppId: [],
    sCountryCode: ''
  })

  const filterOptions = ref<ProfitFilterOptions>({ ...DEFAULT_FILTER_OPTIONS })
  const pendingMeta = ref(false)

  const kpiCards = ref<ProfitKpiCard[]>([])
  const appProfitRoot = ref<ProfitAppProfitTreeNode>({ ...EMPTY_APP_PROFIT_ROOT })
  const countryRows = ref<ProfitCountryRow[]>([])
  const trend30d = ref<ProfitTrend30d>({ ...EMPTY_TREND })
  const sankeyNodes = ref<ProfitSankeyNode[]>([])
  const sankeyLinks = ref<ProfitSankeyLink[]>([])

  const pendingKpi = ref(true)
  const pendingApp = ref(true)
  const pendingCountry = ref(true)
  const pendingTrend = ref(true)
  const pendingSankey = ref(true)

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
      const hasSelectedApp = Array.isArray(query.sAppId)
        ? query.sAppId.length > 0
        : !!String(query.sAppId ?? '').trim()
      const firstAppId = String(
        filterOptions.value.appOptions.find((item) => {
          const v = String(item.value ?? '')
            .trim()
            .toLowerCase()
          return v !== '' && v !== 'all'
        })?.value ?? ''
      ).trim()
      if (!hasSelectedApp && firstAppId) {
        query.sAppId = [firstAppId]
      }
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
          appProfitRoot.value = d?.root ?? { ...EMPTY_APP_PROFIT_ROOT }
        }
      ),
      run(
        pendingCountry,
        () => fetchProfitOverviewCountryProfit(p),
        (d) => {
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
    kpiCards,
    appProfitRoot,
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
