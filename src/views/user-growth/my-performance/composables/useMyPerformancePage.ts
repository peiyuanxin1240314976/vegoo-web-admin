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
} from '@/api/my-performance'
import type {
  MyPerformancePageData,
  MyPerformancePeriodType,
  MyPerformanceQueryBody
} from '../types'

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
      data: { spend: 0, target: 0, rate: 0 }
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

  async function loadMeta(personIdForPeriod?: string) {
    const [personRes, periodRes] = await Promise.allSettled([
      fetchMyPerformanceMetaPersonOptions(),
      fetchMyPerformanceMetaPeriodOptions(
        personIdForPeriod ? { personId: personIdForPeriod } : undefined
      )
    ])

    if (personRes.status === 'fulfilled') {
      data.value.personOptions = personRes.value.personOptions
      data.value.selectedPersonId = personRes.value.selectedPersonId
    } else {
      ElMessage.error('加载人员选项失败')
    }

    if (periodRes.status === 'fulfilled') {
      data.value.periodOptions = periodRes.value.periodOptions
      data.value.periodType = periodRes.value.selectedPeriod.periodType
      data.value.selectedPeriodValue = periodRes.value.selectedPeriod.periodValue
    } else {
      ElMessage.error('加载统计口径选项失败')
    }

    return personRes.status === 'fulfilled' && periodRes.status === 'fulfilled'
  }

  async function loadDetail() {
    const body = queryBody()
    if (!body) return

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
            data.value.spendProgress = { title: r.title, data: r.data }
          }
        })
      } else {
        data.value.spendProgress = {
          title: '',
          data: { spend: 0, target: 0, rate: 0 }
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
    const ok = await loadMeta()
    if (ok) await loadDetail()
    loading.value = false
  }

  onMounted(() => {
    bootstrap()
  })

  async function onPersonChange(personId: string) {
    data.value.selectedPersonId = personId
    try {
      const periodRes = await fetchMyPerformanceMetaPeriodOptions({ personId })
      data.value.periodOptions = periodRes.periodOptions
      data.value.periodType = periodRes.selectedPeriod.periodType
      data.value.selectedPeriodValue = periodRes.selectedPeriod.periodValue
    } catch {
      ElMessage.error('加载统计口径选项失败')
    }
    await loadDetail()
  }

  async function onPeriodTypeChange(periodType: MyPerformancePeriodType) {
    data.value.periodType = periodType
    const options =
      periodType === 'quarter' ? data.value.periodOptions.quarter : data.value.periodOptions.month
    const nextValue = options[0]?.value ?? data.value.selectedPeriodValue
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
