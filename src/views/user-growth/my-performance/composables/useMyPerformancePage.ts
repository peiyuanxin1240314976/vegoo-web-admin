import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  fetchMyPerformanceAppDimensionTable,
  fetchMyPerformanceAppDimensionTableByDateRange,
  fetchMyPerformanceKpiAchievement,
  fetchMyPerformanceMetaPeriodOptions,
  fetchMyPerformanceMetaPersonOptions,
  fetchMyPerformanceOverviewKpi,
  fetchMyPerformancePerformanceHistory,
  fetchMyPerformanceRoiTrend,
  fetchMyPerformanceSpendProgress
} from '@/api/user-growth/my-performance'
import { cloneAppDate, formatYYYYMMDD, getAppNow } from '@/utils/app-now'
import type {
  MyPerformanceAppDimensionTableQueryBody,
  MyPerformanceMetaPersonResponse,
  MyPerformanceMetaPeriodResponse,
  MyPerformancePageData,
  MyPerformancePeriodOption,
  MyPerformancePeriodType,
  MyPerformanceQueryBody
} from '../types'

function pickAppNowMonthPeriodValue(monthOptions: MyPerformancePeriodOption[]): string {
  const y = getAppNow().getFullYear()
  const m = String(getAppNow().getMonth() + 1).padStart(2, '0')
  const target = `${y}-${m}`
  if (monthOptions.some((o) => o.value === target)) return target
  const anySameMonth = monthOptions.find((o) => o.value.endsWith(`-${m}`))
  if (anySameMonth) return anySameMonth.value
  return target
}

function pickAppNowQuarterPeriodValue(quarterOptions: MyPerformancePeriodOption[]): string {
  const now = getAppNow()
  const targetYear = now.getFullYear()
  const targetQuarter = Math.floor(now.getMonth() / 3) + 1
  const parseQuarter = (value: string) => {
    const match = String(value).match(/(\d{4})\s*-?\s*[Qq]([1-4])/)
    if (!match) return null
    return { year: Number(match[1]), quarter: Number(match[2]) }
  }

  const exact = quarterOptions.find((o) => {
    const parsed = parseQuarter(o.value)
    return parsed?.year === targetYear && parsed.quarter === targetQuarter
  })
  if (exact) return exact.value

  const sameQuarter = quarterOptions.find((o) => {
    const parsed = parseQuarter(o.value)
    return parsed?.quarter === targetQuarter
  })
  if (sameQuarter) return sameQuarter.value

  return quarterOptions[0]?.value ?? ''
}

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
        selectedPeriodValue: pickAppNowMonthPeriodValue(periodOptions.month)
      }
    }
    return {
      periodOptions,
      periodType: 'quarter',
      selectedPeriodValue: pickAppNowQuarterPeriodValue(periodOptions.quarter) || sp.periodValue
    }
  }

  const monthValue = periodOptions.month[0]?.value
  if (monthValue) {
    return {
      periodOptions,
      periodType: 'month',
      selectedPeriodValue: pickAppNowMonthPeriodValue(periodOptions.month)
    }
  }

  const quarterValue = periodOptions.quarter[0]?.value
  if (quarterValue) {
    return {
      periodOptions,
      periodType: 'quarter',
      selectedPeriodValue: pickAppNowQuarterPeriodValue(periodOptions.quarter)
    }
  }

  return {
    periodOptions,
    periodType: 'month',
    selectedPeriodValue: pickAppNowMonthPeriodValue(periodOptions.month)
  }
}

function createEmptyTable() {
  return {
    title: '',
    list: [],
    summary: {
      adSpend: null,
      calculatedSpend: null,
      roi: null,
      commissionSpend: null,
      estimatedProfit: null,
      cpa: null,
      score: null
    },
    excelTables: undefined
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
      score: null,
      label: '',
      breakdown: []
    },
    roiTrend: { title: '', points: [] },
    spendProgress: {
      title: '',
      list: []
    },
    performanceHistory: { title: '', list: [] },
    appDimensionTable: createEmptyTable(),
    appDateRangeTable: createEmptyTable()
  }
}

const DETAIL_LABELS: Record<string, string> = {
  overviewKpi: '顶部 KPI',
  kpiAchievement: 'KPI 达成',
  roiTrend: 'ROI 趋势',
  spendProgress: '花费达成',
  performanceHistory: '绩效历史',
  appPeriodTable: '按应用绩效评估',
  appDateRangeTable: '近7天绩效评估'
}

export function useMyPerformancePage() {
  const data = ref<MyPerformancePageData>(emptyPageData())
  const metaLoading = ref(false)
  const loadingMap = ref<Record<string, boolean>>({})
  const requestSeq = ref(0)

  function buildGlobalDateRangeFromPeriod(
    periodType: MyPerformancePeriodType,
    periodValue: string
  ): { startDate: string; endDate: string } {
    const now = getAppNow()

    const todayYmd = formatYYYYMMDD(now)

    const clampEndToToday = (end: Date) => {
      const endYmd = formatYYYYMMDD(end)
      return endYmd > todayYmd ? todayYmd : endYmd
    }

    const fallbackCurrentMonth = () => {
      const y = now.getFullYear()
      const m = now.getMonth() // 0-based
      const start = cloneAppDate(now)
      start.setFullYear(y, m, 1)
      start.setHours(0, 0, 0, 0)
      return { startDate: formatYYYYMMDD(start), endDate: todayYmd }
    }

    const fallbackCurrentQuarter = () => {
      const y = now.getFullYear()
      const q = Math.floor(now.getMonth() / 3) + 1
      const startMonth = (q - 1) * 3
      const start = cloneAppDate(now)
      start.setFullYear(y, startMonth, 1)
      start.setHours(0, 0, 0, 0)
      return { startDate: formatYYYYMMDD(start), endDate: todayYmd }
    }

    if (periodType === 'month') {
      const m = String(periodValue).match(/^(\d{4})-(\d{2})$/)
      if (!m) return fallbackCurrentMonth()
      const year = Number(m[1])
      const monthIndex = Number(m[2]) - 1
      if (!Number.isFinite(year) || !Number.isFinite(monthIndex)) return fallbackCurrentMonth()

      const start = cloneAppDate(now)
      start.setFullYear(year, monthIndex, 1)
      start.setHours(0, 0, 0, 0)

      const end = cloneAppDate(now)
      // 该月最后一天：把日期设为下个月第 0 天
      end.setFullYear(year, monthIndex + 1, 0)
      end.setHours(0, 0, 0, 0)

      const endDate =
        year === now.getFullYear() && monthIndex === now.getMonth()
          ? todayYmd
          : clampEndToToday(end)

      return { startDate: formatYYYYMMDD(start), endDate }
    }

    // quarter
    const q = String(periodValue).match(/^(\d{4})\s*-?\s*[Qq]([1-4])$/)
    if (!q) return fallbackCurrentQuarter()
    const year = Number(q[1])
    const quarter = Number(q[2])
    if (!Number.isFinite(year) || !Number.isFinite(quarter)) return fallbackCurrentQuarter()

    const startMonth = (quarter - 1) * 3
    const start = cloneAppDate(now)
    start.setFullYear(year, startMonth, 1)
    start.setHours(0, 0, 0, 0)

    const end = cloneAppDate(now)
    // 季度末月的最后一天
    end.setFullYear(year, startMonth + 3, 0)
    end.setHours(0, 0, 0, 0)

    const isCurrentQuarter =
      year === now.getFullYear() && Math.floor(now.getMonth() / 3) + 1 === quarter

    return {
      startDate: formatYYYYMMDD(start),
      endDate: isCurrentQuarter ? todayYmd : clampEndToToday(end)
    }
  }

  const globalDateRange = computed(() =>
    buildGlobalDateRangeFromPeriod(data.value.periodType, data.value.selectedPeriodValue)
  )

  const selectedPerson = computed(() => {
    const list = data.value.personOptions
    const current = list.find((p) => p.id === data.value.selectedPersonId) ?? list[0]
    if (current) return current
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
    const { startDate, endDate } = globalDateRange.value
    return {
      personId: selectedPersonId,
      periodType,
      periodValue: selectedPeriodValue,
      startDate,
      endDate
    }
  }

  function appDateRangeTableQueryBody(): MyPerformanceAppDimensionTableQueryBody | null {
    const { selectedPersonId } = data.value
    if (!selectedPersonId) return null
    const end = getAppNow()
    const start = cloneAppDate(end)
    start.setDate(start.getDate() - 7)
    const startDate = formatYYYYMMDD(start)
    const endDate = formatYYYYMMDD(end)
    return {
      personId: selectedPersonId,
      startDate,
      endDate
    }
  }

  async function loadMeta(personIdOverride?: string) {
    let personOk = false
    try {
      const personRaw = await fetchMyPerformanceMetaPersonOptions()
      const normalized = normalizeMetaPersonPayload(personRaw)
      data.value.personOptions = normalized.personOptions
      data.value.selectedPersonId = normalized.selectedPersonId
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
      const normalized = normalizeMetaPeriodPayload(periodRaw)
      data.value.periodOptions = normalized.periodOptions
      data.value.periodType = normalized.periodType
      data.value.selectedPeriodValue = normalized.selectedPeriodValue
      periodOk = true
    } catch {
      ElMessage.error('加载统计口径选项失败')
    }

    return personOk && periodOk
  }

  async function loadDetail() {
    const body = queryBody()
    const dateRangeBody = appDateRangeTableQueryBody()
    if (!dateRangeBody) return
    if (!body) {
      if (data.value.selectedPersonId && !data.value.selectedPeriodValue) {
        ElMessage.warning('当前统计口径暂无可用月份或季度，无法加载绩效详情')
      }
      return
    }

    const seq = ++requestSeq.value

    const setLoading = (key: string, value: boolean) => {
      loadingMap.value = { ...loadingMap.value, [key]: value }
    }

    const runTask = async (key: string, run: () => Promise<void>) => {
      setLoading(key, true)
      try {
        await run()
      } finally {
        setLoading(key, false)
      }
    }

    const tasks: Array<{ key: string; run: () => Promise<void> }> = [
      {
        key: 'overviewKpi',
        run: async () => {
          const response = await fetchMyPerformanceOverviewKpi(body)
          if (seq !== requestSeq.value) return
          data.value.topKpis = response.topKpis
        }
      },
      {
        key: 'kpiAchievement',
        run: async () => {
          const response = await fetchMyPerformanceKpiAchievement(body)
          if (seq !== requestSeq.value) return
          data.value.kpiAchievement = response.kpiAchievement
        }
      },
      {
        key: 'roiTrend',
        run: async () => {
          const response = await fetchMyPerformanceRoiTrend(body)
          if (seq !== requestSeq.value) return
          data.value.roiTrend = { title: response.title, points: response.points }
        }
      },
      {
        key: 'performanceHistory',
        run: async () => {
          const response = await fetchMyPerformancePerformanceHistory(body)
          if (seq !== requestSeq.value) return
          data.value.performanceHistory = { title: response.title, list: response.list }
        }
      },
      {
        key: 'appPeriodTable',
        run: async () => {
          const response = await fetchMyPerformanceAppDimensionTable(body)
          if (seq !== requestSeq.value) return
          data.value.appDimensionTable = {
            title: response.title,
            list: response.list,
            summary: response.summary
          }
        }
      },
      {
        key: 'appDateRangeTable',
        run: async () => {
          const response = await fetchMyPerformanceAppDimensionTableByDateRange(dateRangeBody)
          if (seq !== requestSeq.value) return
          data.value.appDateRangeTable = {
            title: response.title,
            list: response.list,
            summary: response.summary,
            excelTables: response.excelTables
          }
        }
      }
    ]

    if (data.value.periodType === 'month') {
      tasks.push({
        key: 'spendProgress',
        run: async () => {
          const response = await fetchMyPerformanceSpendProgress(body)
          data.value.spendProgress = { title: response.title, list: response.list }
        }
      })
    } else {
      data.value.spendProgress = {
        title: '',
        list: []
      }
    }

    const results = await Promise.allSettled(tasks.map((task) => runTask(task.key, task.run)))
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        const key = tasks[index]!.key
        ElMessage.error(`加载${DETAIL_LABELS[key] ?? key}失败`)
      }
    })
  }

  async function bootstrap() {
    metaLoading.value = true
    try {
      await loadMeta()
      await loadDetail()
    } finally {
      metaLoading.value = false
    }
  }

  onMounted(() => {
    bootstrap()
  })

  async function onPersonChange(personId: string) {
    data.value.selectedPersonId = personId
    try {
      const periodRes = await fetchMyPerformanceMetaPeriodOptions({ personId })
      const normalized = normalizeMetaPeriodPayload(periodRes)
      data.value.periodOptions = normalized.periodOptions
      data.value.periodType = normalized.periodType
      data.value.selectedPeriodValue = normalized.selectedPeriodValue
    } catch {
      ElMessage.error('加载统计口径选项失败')
    }
    await loadDetail()
  }

  async function onPeriodTypeChange(periodType: MyPerformancePeriodType) {
    data.value.periodType = periodType
    const nextValue =
      periodType === 'quarter'
        ? pickAppNowQuarterPeriodValue(data.value.periodOptions.quarter) ||
          data.value.selectedPeriodValue
        : pickAppNowMonthPeriodValue(data.value.periodOptions.month)
    data.value.selectedPeriodValue = nextValue
    await loadDetail()
  }

  async function onPeriodValueChange(periodValue: string) {
    data.value.selectedPeriodValue = periodValue
    await loadDetail()
  }

  return {
    data,
    metaLoading,
    loadingMap,
    selectedPerson,
    globalDateRange,
    onPersonChange,
    onPeriodTypeChange,
    onPeriodValueChange
  }
}
