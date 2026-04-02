import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  fetchMyPerformanceAppDimensionTable,
  fetchMyPerformanceKpiAchievement,
  fetchMyPerformanceMetaPeriodOptions,
  fetchMyPerformanceMetaPersonOptions,
  fetchMyPerformanceOverviewKpi,
  fetchMyPerformancePerformanceHistory,
  fetchMyPerformanceRoiTrend,
  fetchMyPerformanceSpendProgress
} from '@/api/user-growth/my-performance'
import { getAppNow } from '@/utils/app-now'
import type {
  MyPerformanceMetaPersonResponse,
  MyPerformanceMetaPeriodResponse,
  MyPerformancePageData,
  MyPerformancePeriodOption,
  MyPerformancePeriodType,
  MyPerformanceQueryBody
} from '../types'

/** 月度口径：固定使用当年 3 月（`YYYY-03`） */
function pickFixedMarchPeriodValue(monthOptions: MyPerformancePeriodOption[]): string {
  const y = getAppNow().getFullYear()
  const target = `${y}-03`
  if (monthOptions.some((o) => o.value === target)) return target
  const anyMarch = monthOptions.find((o) => /-03$/.test(o.value))
  if (anyMarch) return anyMarch.value
  return target
}

/** 兼容远程未返回 selectedPersonId、列表字段异常等情况，保证能拼出 queryBody */
function normalizeMetaPersonPayload(
  raw: MyPerformanceMetaPersonResponse | null | undefined
): Pick<MyPerformancePageData, 'personOptions' | 'selectedPersonId'> {
  const list = Array.isArray(raw?.personOptions) ? raw.personOptions : []
  let selected = typeof raw?.selectedPersonId === 'string' ? raw.selectedPersonId.trim() : ''
  if (!selected || !list.some((p) => p.id === selected)) {
    selected = list[0]?.id ?? ''
  }
  return { personOptions: list, selectedPersonId: selected }
}

/** 兼容远程返回缺字段、`data` 为空等情况，避免 periodOptions / selectedPeriod 为 undefined */
function normalizeMetaPeriodPayload(
  raw: MyPerformanceMetaPeriodResponse | null | undefined
): Pick<MyPerformancePageData, 'periodOptions' | 'periodType' | 'selectedPeriodValue'> {
  const po = raw?.periodOptions
  const periodOptions = {
    quarter: Array.isArray(po?.quarter) ? po.quarter : [],
    month: Array.isArray(po?.month) ? po.month : []
  }
  const sp = raw?.selectedPeriod
  if (
    sp &&
    (sp.periodType === 'quarter' || sp.periodType === 'month') &&
    typeof sp.periodValue === 'string' &&
    sp.periodValue.length > 0
  ) {
    if (sp.periodType === 'month') {
      return {
        periodOptions,
        periodType: 'month',
        selectedPeriodValue: pickFixedMarchPeriodValue(periodOptions.month)
      }
    }
    return { periodOptions, periodType: sp.periodType, selectedPeriodValue: sp.periodValue }
  }
  const m0 = periodOptions.month[0]?.value
  if (m0) {
    return {
      periodOptions,
      periodType: 'month',
      selectedPeriodValue: pickFixedMarchPeriodValue(periodOptions.month)
    }
  }
  const q0 = periodOptions.quarter[0]?.value
  if (q0) {
    return { periodOptions, periodType: 'quarter', selectedPeriodValue: q0 }
  }
  return {
    periodOptions,
    periodType: 'month',
    selectedPeriodValue: pickFixedMarchPeriodValue(periodOptions.month)
  }
}

function emptyPageData(): MyPerformancePageData {
  return {
    personOptions: [],
    selectedPersonId: '',
    periodType: 'month',
    periodOptions: { quarter: [], month: [] },
    selectedPeriodValue: '',
    topKpis: [],
    kpiAchievement: {
      score: 0,
      label: '',
      breakdown: []
    },
    roiTrend: { title: '', points: [] },
    spendProgress: {
      title: '',
      list: []
    },
    performanceHistory: { title: '', list: [] },
    appTable: {
      title: '',
      list: [],
      summary: {
        adSpend: 0,
        calculatedSpend: 0,
        roi: 0,
        commissionSpend: 0,
        estimatedProfit: 0,
        cpa: 0,
        score: 0
      }
    }
  }
}

const DETAIL_LABELS: Record<string, string> = {
  overviewKpi: '顶部 KPI',
  kpiAchievement: 'KPI 达成',
  roiTrend: 'ROI 趋势',
  spendProgress: '消耗进度',
  performanceHistory: '绩效历史',
  appDimensionTable: '应用维度表'
}

export function useMyPerformancePage() {
  const data = ref<MyPerformancePageData>(emptyPageData())
  const loading = ref(false)
  const detailLoading = ref(false)

  const selectedPerson = computed(() => {
    const list = data.value.personOptions
    const cur = list.find((p) => p.id === data.value.selectedPersonId) ?? list[0]
    if (cur) return cur
    return {
      id: '',
      name: '',
      role: '',
      avatarLetter: '?',
      apps: [] as string[]
    }
  })

  function queryBody(): MyPerformanceQueryBody | null {
    const { selectedPersonId, periodType, selectedPeriodValue } = data.value
    if (!selectedPersonId || !selectedPeriodValue) return null
    return {
      personId: selectedPersonId,
      periodType,
      periodValue: selectedPeriodValue
    }
  }

  /**
   * 先拉人员再拉统计口径：多数后端口径随人员变化，并行时不带 personId 会导致口径失败/为空，
   * 进而 selectedPeriodValue 为空，loadDetail 不会发任何详情请求。
   */
  async function loadMeta(personIdOverride?: string) {
    let personOk = false
    try {
      const personRaw = await fetchMyPerformanceMetaPersonOptions()
      const n = normalizeMetaPersonPayload(personRaw)
      data.value.personOptions = n.personOptions
      data.value.selectedPersonId = n.selectedPersonId
      personOk = true
    } catch {
      ElMessage.error('加载人员选项失败')
    }

    const personIdForPeriod = personIdOverride ?? data.value.selectedPersonId

    let periodOk = false
    try {
      const periodRaw = await fetchMyPerformanceMetaPeriodOptions(
        personIdForPeriod ? { personId: personIdForPeriod } : undefined
      )
      const n = normalizeMetaPeriodPayload(periodRaw)
      data.value.periodOptions = n.periodOptions
      data.value.periodType = n.periodType
      data.value.selectedPeriodValue = n.selectedPeriodValue
      periodOk = true
    } catch {
      ElMessage.error('加载统计口径选项失败')
    }

    return personOk && periodOk
  }

  async function loadDetail() {
    const body = queryBody()
    if (!body) {
      if (data.value.selectedPersonId && !data.value.selectedPeriodValue) {
        ElMessage.warning('统计口径下暂无可用月份或季度，无法加载绩效详情')
      }
      return
    }

    detailLoading.value = true
    try {
      const tasks: Array<{ key: string; run: () => Promise<void> }> = [
        {
          key: 'overviewKpi',
          run: async () => {
            const r = await fetchMyPerformanceOverviewKpi(body)
            data.value.topKpis = r.topKpis
          }
        },
        {
          key: 'kpiAchievement',
          run: async () => {
            const r = await fetchMyPerformanceKpiAchievement(body)
            data.value.kpiAchievement = r.kpiAchievement
          }
        },
        {
          key: 'roiTrend',
          run: async () => {
            const r = await fetchMyPerformanceRoiTrend(body)
            data.value.roiTrend = { title: r.title, points: r.points }
          }
        },
        {
          key: 'performanceHistory',
          run: async () => {
            const r = await fetchMyPerformancePerformanceHistory(body)
            data.value.performanceHistory = { title: r.title, list: r.list }
          }
        },
        {
          key: 'appDimensionTable',
          run: async () => {
            const r = await fetchMyPerformanceAppDimensionTable(body)
            data.value.appTable = { title: r.title, list: r.list, summary: r.summary }
          }
        }
      ]

      if (data.value.periodType === 'month') {
        tasks.push({
          key: 'spendProgress',
          run: async () => {
            const r = await fetchMyPerformanceSpendProgress(body)
            data.value.spendProgress = { title: r.title, list: r.list }
          }
        })
      } else {
        data.value.spendProgress = {
          title: '',
          list: []
        }
      }

      const results = await Promise.allSettled(tasks.map((t) => t.run()))
      results.forEach((res, i) => {
        if (res.status === 'rejected') {
          const key = tasks[i]!.key
          const label = DETAIL_LABELS[key] ?? key
          ElMessage.error(`加载${label}失败`)
        }
      })
    } finally {
      detailLoading.value = false
    }
  }

  async function bootstrap() {
    loading.value = true
    try {
      await loadMeta()
      await loadDetail()
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    bootstrap()
  })

  async function onPersonChange(personId: string) {
    data.value.selectedPersonId = personId
    try {
      const periodRes = await fetchMyPerformanceMetaPeriodOptions({ personId })
      const n = normalizeMetaPeriodPayload(periodRes)
      data.value.periodOptions = n.periodOptions
      data.value.periodType = n.periodType
      data.value.selectedPeriodValue = n.selectedPeriodValue
    } catch {
      ElMessage.error('加载统计口径选项失败')
    }
    await loadDetail()
  }

  async function onPeriodTypeChange(periodType: MyPerformancePeriodType) {
    data.value.periodType = periodType
    const nextValue =
      periodType === 'quarter'
        ? (data.value.periodOptions.quarter[0]?.value ?? data.value.selectedPeriodValue)
        : pickFixedMarchPeriodValue(data.value.periodOptions.month)
    data.value.selectedPeriodValue = nextValue
    await loadDetail()
  }

  async function onPeriodValueChange(periodValue: string) {
    data.value.selectedPeriodValue = periodValue
    await loadDetail()
  }

  return {
    data,
    loading,
    detailLoading,
    selectedPerson,
    onPersonChange,
    onPeriodTypeChange,
    onPeriodValueChange
  }
}
