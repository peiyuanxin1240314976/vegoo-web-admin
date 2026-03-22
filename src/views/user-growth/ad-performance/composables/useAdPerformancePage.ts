import { computed, onMounted, ref } from 'vue'
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

const defaultFilter: AdPerformanceFilter = {
  dateRange: 'today',
  app: '',
  adPlatform: '',
  account: '',
  country: ''
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
      avgRoi1: 0,
      avgCvr: 0,
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
  const loading = ref(false)
  const activeTableTab = ref<AdPerformanceTableTab>('campaign')
  const tableKeyword = ref('')

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
    try {
      meta.value = await fetchAdPerformanceMetaFilterOptions()
    } catch {
      ElMessage.error('加载筛选选项失败')
    }
  }

  async function loadOverview() {
    try {
      const o = await fetchAdPerformanceOverview(page.value.filter)
      page.value.dataTime = o.dataTime
      page.value.kpi = o.kpi
      page.value.spendTrend = o.spendTrend
      page.value.roi7dTrend = o.roi7dTrend
      page.value.channelDistribution = o.channelDistribution
      page.value.appDistribution = o.appDistribution
      page.value.ownerShareDistribution = o.ownerShareDistribution
      page.value.alerts = o.alerts
    } catch {
      ElMessage.error('加载概览数据失败')
    }
  }

  async function loadTable() {
    const q = tableQuery()
    try {
      if (activeTableTab.value === 'campaign') {
        const r = await fetchAdPerformanceTableCampaign(q)
        page.value.campaignTableRows = r.rows
        page.value.pagination = r.pagination
      } else if (activeTableTab.value === 'country') {
        const r = await fetchAdPerformanceTableCountry(q)
        page.value.countryTableRows = r.rows
        page.value.pagination = r.pagination
      } else if (activeTableTab.value === 'owner') {
        const r = await fetchAdPerformanceTableOwner(q)
        page.value.ownerTableRows = r.rows
        page.value.ownerTeamSummary = r.summary
        page.value.pagination = r.pagination
      } else {
        const r = await fetchAdPerformanceTableAccount(q)
        page.value.accountTableRows = r.rows
        page.value.accountSummary = r.summary
        page.value.pagination = r.pagination
      }
    } catch {
      ElMessage.error('加载表格数据失败')
    }
  }

  async function bootstrap() {
    loading.value = true
    await loadMeta()
    await loadOverview()
    await loadTable()
    loading.value = false
  }

  onMounted(() => {
    bootstrap()
  })

  async function onFilterSearch(filter: AdPerformanceFilter) {
    page.value.filter = { ...filter }
    page.value.pagination = { ...page.value.pagination, current: 1 }
    loading.value = true
    await loadOverview()
    await loadTable()
    loading.value = false
  }

  async function refreshAll() {
    loading.value = true
    await loadMeta()
    await loadOverview()
    await loadTable()
    loading.value = false
  }

  async function onTableTabChange(tab: AdPerformanceTableTab) {
    activeTableTab.value = tab
    page.value.pagination = { ...page.value.pagination, current: 1 }
    loading.value = true
    await loadTable()
    loading.value = false
  }

  async function onTableKeywordSearch() {
    page.value.pagination = { ...page.value.pagination, current: 1 }
    loading.value = true
    await loadTable()
    loading.value = false
  }

  async function onPageChange(p: number) {
    page.value.pagination = { ...page.value.pagination, current: p }
    loading.value = true
    await loadTable()
    loading.value = false
  }

  async function onPageSizeChange(size: number) {
    page.value.pagination = { ...page.value.pagination, size, current: 1 }
    loading.value = true
    await loadTable()
    loading.value = false
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
    loading,
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
