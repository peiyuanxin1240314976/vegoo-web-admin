import { computed, markRaw, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  fetchAdPerformanceAlertAction,
  fetchAdPerformanceExport,
  fetchAdPerformanceMetaFilterOptions,
  fetchAdPerformanceOverview,
  fetchAdPerformanceTableAccount,
  fetchAdPerformanceTableCampaign,
  fetchAdPerformanceTableCountry,
  fetchAdPerformanceTableOwner
} from '@/api/user-growth/ad-performance'
import type {
  AdPerformanceAlertItem,
  AdPerformanceFilter,
  AdPerformanceMetaFilterResponse,
  AdPerformanceMock,
  AdPerformanceTableTab
} from '../types'
import { getAppTodayYYYYMMDD } from '@/utils/app-now'

const defaultFilter: AdPerformanceFilter = {
  startDate: getAppTodayYYYYMMDD(),
  endDate: getAppTodayYYYYMMDD(),
  appId: [],
  adPlatform: '',
  account: '',
  country: ''
}

function getFirstAppId(meta: AdPerformanceMetaFilterResponse | null): string {
  const first = (meta?.appOptions ?? []).find((item) => String(item.value ?? '').trim() !== '')
  return String(first?.value ?? '').trim()
}

function hasSelectedApp(appId: AdPerformanceFilter['appId']): boolean {
  if (Array.isArray(appId)) return appId.length > 0
  return !!String(appId ?? '').trim()
}

function emptyPage(): AdPerformanceMock {
  return {
    dataTime: '',
    filter: { ...defaultFilter },
    kpi: [],
    spendTrend: [],
    roi7dTrend: [],
    channelDistribution: [],
    appDistribution: [],
    ownerShareDistribution: [],
    campaignTableRows: [],
    countryTableRows: [],
    ownerTableRows: [],
    ownerTeamSummary: {
      totalSpend: 0,
      avgCpi: 0,
      estimatedProfit: 0
    },
    accountTableRows: [],
    accountSummary: {
      totalSpend: 0,
      avgCpi: 0,
      lowBalanceAccountCount: 0,
      overBudgetAccountCount: 0,
      estimatedProfit: 0
    },
    alerts: [],
    pagination: { current: 1, size: 10, total: 0 }
  }
}

export function useAdPerformancePage() {
  const meta = ref<AdPerformanceMetaFilterResponse | null>(null)
  const page = ref<AdPerformanceMock>(emptyPage())
  /** 筛选 options 加载（不会阻塞其他接口） */
  const metaLoading = ref(false)
  /** 概览区域加载（KPI/趋势/分布/预警） */
  const loading = ref(false)
  /** 仅表格区域加载（Tab 切换 / 翻页 / 关键词搜索） */
  const tableLoading = ref(false)
  const activeTableTab = ref<AdPerformanceTableTab>('campaign')
  const tableKeyword = ref('')

  /** 防竞态：每次 loadTable 调用前自增，异步回来后比较是否仍是最新请求 */
  let tableLoadSeq = 0

  const appCountFromMeta = computed(() => {
    const opts = meta.value?.appOptions ?? []
    const nonAll = opts.filter((o) => o.value !== '')
    return nonAll.length
  })

  function tableQuery() {
    return {
      ...page.value.filter,
      keyword: tableKeyword.value,
      current: page.value.pagination.current,
      size: page.value.pagination.size
    }
  }

  async function loadMeta() {
    metaLoading.value = true
    try {
      meta.value = await fetchAdPerformanceMetaFilterOptions()
      const firstAppId = getFirstAppId(meta.value)
      if (!hasSelectedApp(page.value.filter.appId) && firstAppId) {
        page.value.filter = { ...page.value.filter, appId: [firstAppId] }
      }
    } catch {
      ElMessage.error('加载筛选选项失败')
    } finally {
      metaLoading.value = false
    }
  }

  async function loadOverview() {
    try {
      const o = await fetchAdPerformanceOverview(page.value.filter)

      const normalizedAppDistribution = (o.appDistribution ?? []).map((item: any) => {
        // 兼容后端字段：name/value/percent
        if (item && typeof item === 'object' && 'name' in item && 'value' in item) {
          return {
            appName: String(item.name ?? ''),
            spend: Number(item.value ?? 0),
            percent: Number(item.percent ?? 0)
          }
        }
        return item
      })

      const normalizedOwnerShareDistribution = (o.ownerShareDistribution ?? []).map((item: any) => {
        // 兼容后端字段：name/value/percent
        if (item && typeof item === 'object' && 'name' in item && 'value' in item) {
          return {
            ownerName: String(item.name ?? ''),
            percent: Number(item.percent ?? 0),
            spend: Number(item.value ?? 0)
          }
        }
        return item
      })

      page.value.dataTime = o.dataTime
      page.value.kpi = markRaw(o.kpi)
      page.value.spendTrend = markRaw(o.spendTrend)
      page.value.roi7dTrend = markRaw(o.roi7dTrend)
      page.value.channelDistribution = markRaw(o.channelDistribution)
      page.value.appDistribution = markRaw(normalizedAppDistribution as any)
      page.value.ownerShareDistribution = markRaw(normalizedOwnerShareDistribution as any)
      page.value.alerts = markRaw(o.alerts)
    } catch {
      ElMessage.error('加载概览数据失败')
    }
  }

  function runOverview() {
    loading.value = true
    return loadOverview().finally(() => {
      loading.value = false
    })
  }

  async function loadTable() {
    const seq = ++tableLoadSeq
    const q = tableQuery()
    try {
      const [campaign, country, owner, account] = await Promise.all([
        fetchAdPerformanceTableCampaign(q),
        fetchAdPerformanceTableCountry(q),
        fetchAdPerformanceTableOwner(q),
        fetchAdPerformanceTableAccount(q)
      ])
      if (seq !== tableLoadSeq) return
      // markRaw 阻止 Vue 对行数据做深度响应式追踪，避免大数据量下递归创建 Proxy 导致卡顿/内存暴涨
      page.value.campaignTableRows = markRaw(campaign.rows)
      page.value.pagination = campaign.pagination
      page.value.countryTableRows = markRaw(country.rows)
      page.value.ownerTableRows = markRaw(owner.rows)
      page.value.ownerTeamSummary = owner.summary
      page.value.accountTableRows = markRaw(account.rows)
      page.value.accountSummary = account.summary
    } catch {
      if (seq !== tableLoadSeq) return
      ElMessage.error('加载表格数据失败')
    }
  }

  function runTable() {
    tableLoading.value = true
    return loadTable().finally(() => {
      tableLoading.value = false
    })
  }

  onMounted(async () => {
    // options 下拉单独加载；其余接口并发发起，互不阻塞
    await loadMeta()
    void runOverview()
    void runTable()
  })

  async function onFilterSearch(filter: AdPerformanceFilter) {
    page.value.filter = { ...filter }
    page.value.pagination = { ...page.value.pagination, current: 1 }
    void runOverview()
    void runTable()
  }

  async function refreshAll() {
    // 与 filterSearch 一致：除 options 外其余请求互不阻塞
    await loadMeta()
    void runOverview()
    void runTable()
  }

  function onTableTabChange(tab: AdPerformanceTableTab) {
    activeTableTab.value = tab
  }

  async function onTableKeywordSearch() {
    page.value.pagination = { ...page.value.pagination, current: 1 }
    await runTable()
  }

  async function onPageChange(p: number) {
    page.value.pagination = { ...page.value.pagination, current: p }
    await runTable()
  }

  async function onPageSizeChange(size: number) {
    page.value.pagination = { ...page.value.pagination, size, current: 1 }
    await runTable()
  }

  async function onExport() {
    try {
      const res = await fetchAdPerformanceExport({
        ...page.value.filter,
        tab: activeTableTab.value,
        format: 'xlsx'
      })
      if (res.downloadUrl) {
        window.open(res.downloadUrl, '_blank', 'noopener,noreferrer')
      } else {
        ElMessage.success('导出请求已提交（若后端返回 downloadUrl 将自动打开下载）')
      }
    } catch {
      ElMessage.error('导出失败')
    }
  }

  async function onAlertAction(item: AdPerformanceAlertItem) {
    try {
      const res = await fetchAdPerformanceAlertAction({
        alertId: item.id,
        actionType: item.actionType
      })
      if (res.message) ElMessage.success(res.message)
      else ElMessage.success('操作成功')
      await loadOverview()
    } catch {
      ElMessage.error('操作失败')
    }
  }

  function setTableKeyword(v: string) {
    tableKeyword.value = v
  }

  return {
    meta,
    page,
    metaLoading,
    loading,
    tableLoading,
    activeTableTab,
    tableKeyword,
    setTableKeyword,
    appCountFromMeta,
    onFilterSearch,
    refreshAll,
    onTableTabChange,
    onTableKeywordSearch,
    onPageChange,
    onPageSizeChange,
    onExport,
    onAlertAction
  }
}
