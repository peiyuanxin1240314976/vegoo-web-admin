<template>
  <div class="iaa-tab-content iaa-tab-version">
    <section class="iaa-main-grid">
      <div class="iaa-main-left">
        <div v-if="loading" class="iaa-kpi-grid">
          <article v-for="i in 4" :key="i" class="iaa-kpi iaa-kpi--sk">
            <ElSkeleton animated :throttle="0">
              <template #template>
                <div class="iaa-kpi-sk">
                  <ElSkeletonItem variant="text" class="iaa-kpi-sk__t" />
                  <ElSkeletonItem variant="text" class="iaa-kpi-sk__v" />
                  <ElSkeletonItem variant="text" class="iaa-kpi-sk__s" />
                </div>
              </template>
            </ElSkeleton>
          </article>
        </div>

        <div v-else class="iaa-kpi-grid">
          <article v-for="k in kpis" :key="k.id" class="iaa-kpi" :data-accent="k.accent">
            <div class="iaa-kpi__title">{{ k.title }}</div>
            <div class="iaa-kpi__value">{{ k.primaryValue }}</div>
            <div class="iaa-kpi__sub">{{ k.subText }}</div>
          </article>
        </div>
        <ElCard class="iaa-panel iaa-neon-panel" shadow="never">
          <template #header>
            <span>版本收入对比</span>
          </template>
          <div v-if="loading" class="iaa-chart-sk iaa-chart-sk--bar"></div>
          <div v-else ref="revenueChartRef" class="iaa-chart iaa-chart--hbar"></div>
          <div v-if="versionInsight" class="iaa-insight-banner">
            {{ versionInsight }}
          </div>
        </ElCard>
        <ElCard class="iaa-panel iaa-neon-panel" shadow="never">
          <template #header>
            <span>版本详细数据表</span>
          </template>
          <div v-if="loading" class="iaa-chart-sk iaa-chart-sk--line"></div>
          <ArtTable
            v-else
            :data="tableData"
            :columns="tableColumns"
            row-key="app_version"
            :stripe="false"
            :border="false"
            size="small"
            :show-table-header="false"
            :pagination="pagination"
            :pagination-options="{ align: 'right', pageSizes: [8, 15], size: 'small' }"
            @pagination:current-change="onPageChange"
            @pagination:size-change="onSizeChange"
          >
            <template #version="{ row }">
              <span class="iaa-version-cell" :class="{ 'is-current': row.isCurrent }">{{
                row.app_version
              }}</span>
            </template>
          </ArtTable>
        </ElCard>
      </div>
      <div class="iaa-main-right">
        <ElCard class="iaa-panel iaa-neon-panel" shadow="never">
          <template #header>
            <span>版本 ECPM 趋势对比</span>
          </template>
          <div v-if="loading" class="iaa-chart-sk iaa-chart-sk--line"></div>
          <div v-else ref="ecpmTrendRef" class="iaa-chart iaa-chart--line"></div>
        </ElCard>
        <ElCard class="iaa-panel iaa-neon-panel" shadow="never">
          <template #header>
            <span>版本升级进度</span>
          </template>
          <div v-if="loading" class="iaa-chart-sk iaa-chart-sk--bar"></div>
          <div v-else ref="upgradeChartRef" class="iaa-chart iaa-chart--stack"></div>
        </ElCard>
        <ElCard class="iaa-panel iaa-neon-panel" shadow="never">
          <template #header>
            <span>版本广告渗透率 vs 崩溃率</span>
          </template>
          <div v-if="loading" class="iaa-chart-sk iaa-chart-sk--line"></div>
          <div v-else ref="penetrationCrashRef" class="iaa-chart iaa-chart--dual"></div>
        </ElCard>
        <div class="iaa-ai-card">
          <div class="iaa-ai-card__header">
            <div class="iaa-ai-card__icon-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L13.09 8.26L19 6L15.45 11.25L21 12L15.45 12.75L19 18L13.09 15.74L12 22L10.91 15.74L5 18L8.55 12.75L3 12L8.55 11.25L5 6L10.91 8.26L12 2Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <span class="iaa-ai-card__title">AI 版本洞察</span>
            <span class="iaa-ai-card__badge">Beta</span>
          </div>
          <ul class="iaa-ai-card__list">
            <li v-for="(bullet, i) in aiInsight.bullets" :key="i" class="iaa-ai-card__item">
              <span class="iaa-ai-card__dot"></span>
              <span>{{ bullet }}</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, reactive, onMounted, watch, nextTick } from 'vue'
  import { useChart } from '@/hooks/core/useChart'
  import type { EChartsOption } from '@/plugins/echarts'
  import type { ColumnOption } from '@/types'
  import type { IaaFilterState, IaaVersionTabData, IaaVersionTableRow } from '../types'
  import { fetchIaaVersionTabData } from '@/api/business-insight'

  defineOptions({ name: 'IaaTabVersion' })

  const props = defineProps<{ filter: IaaFilterState }>()

  const tabData = ref<IaaVersionTabData | null>(null)
  const loading = ref(false)

  const kpis = computed(() => tabData.value?.kpis ?? [])
  const allRows = computed(() => tabData.value?.tableRows ?? [])
  const aiInsight = computed(() => tabData.value?.aiInsight ?? { bullets: [] })
  const versionInsight = computed(() => tabData.value?.versionInsight ?? '')

  const pagination = reactive({ current: 1, size: 8, total: 0 })

  watch(allRows, (rows) => {
    pagination.total = rows.length
    pagination.current = 1
  })

  const tableData = computed(() => {
    const start = (pagination.current - 1) * pagination.size
    return allRows.value.slice(start, start + pagination.size)
  })

  function onPageChange(page: number) {
    pagination.current = page
  }
  function onSizeChange(size: number) {
    pagination.size = size
    pagination.current = 1
  }

  const tableColumns = computed<ColumnOption[]>(() => [
    { prop: 'app_version', label: '版本', minWidth: 80, useSlot: true, slotName: 'version' },
    { prop: 'releaseDate', label: '发布日期', minWidth: 88 },
    {
      prop: 'userShare',
      label: '用户占比',
      minWidth: 72,
      formatter: (r: IaaVersionTableRow) => `${r.userShare}%`
    },
    {
      prop: 'revenue',
      label: '收入',
      minWidth: 80,
      formatter: (r: IaaVersionTableRow) => `$${r.revenue.toFixed(0)}`
    },
    {
      prop: 'ecpmEst',
      label: 'ECPM预',
      minWidth: 68,
      formatter: (r: IaaVersionTableRow) => r.ecpmEst.toFixed(2)
    },
    {
      prop: 'ecpmReal',
      label: 'ECPM真',
      minWidth: 68,
      formatter: (r: IaaVersionTableRow) => r.ecpmReal.toFixed(2)
    },
    {
      prop: 'impressions',
      label: '展示数',
      minWidth: 72,
      formatter: (r: IaaVersionTableRow) => r.impressions.toLocaleString()
    },
    {
      prop: 'adPenetration',
      label: '渗透率',
      minWidth: 64,
      formatter: (r: IaaVersionTableRow) => `${r.adPenetration}%`
    }
  ])

  const useRevenueChart = useChart()
  const useEcpmTrend = useChart()
  const useUpgrade = useChart()
  const usePenetrationCrash = useChart()
  const revenueChartRef = useRevenueChart.chartRef
  const ecpmTrendRef = useEcpmTrend.chartRef
  const upgradeChartRef = useUpgrade.chartRef
  const penetrationCrashRef = usePenetrationCrash.chartRef

  function buildRevenueOption(): EChartsOption {
    const comparison = tabData.value?.revenueComparison ?? []
    const versions = comparison.map((r) => r.app_version)
    const revenues = comparison.map((r) => r.revenue)
    const userShares = comparison.map((r) => r.userShare)
    return {
      backgroundColor: 'transparent',
      grid: { left: 72, right: 96, top: 16, bottom: 36 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1e293b',
        borderColor: '#334155',
        textStyle: { color: '#f1f5f9' }
      },
      legend: { data: ['广告收入', '用户占比%'], bottom: 0, textStyle: { color: '#64748b' } },
      xAxis: {
        type: 'value',
        axisLabel: { color: '#94a3b8', fontSize: 10 },
        splitLine: { lineStyle: { color: '#1e293b', type: 'dashed' } }
      },
      yAxis: { type: 'category', data: versions, axisLabel: { color: '#94a3b8', fontSize: 11 } },
      series: [
        {
          name: '广告收入',
          type: 'bar',
          data: revenues,
          itemStyle: { color: '#26C2AD' },
          barMaxWidth: 24,
          label: {
            show: true,
            position: 'right',
            color: '#94a3b8',
            fontSize: 10,
            formatter: (p: any) => `$${Number(p.value ?? 0).toFixed(0)}`
          }
        },
        {
          name: '用户占比%',
          type: 'bar',
          data: userShares,
          itemStyle: { color: '#3B82F6', opacity: 0.6 },
          barMaxWidth: 10
        }
      ]
    }
  }

  function buildEcpmTrendOption(): EChartsOption {
    const { versions, est, real } = tabData.value?.ecpmTrend ?? { versions: [], est: [], real: [] }
    return {
      backgroundColor: 'transparent',
      grid: { left: 56, right: 48, top: 16, bottom: 36 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1e293b',
        borderColor: '#334155',
        textStyle: { color: '#f1f5f9' }
      },
      legend: { data: ['预估ECPM', '真实ECPM'], bottom: 0, textStyle: { color: '#64748b' } },
      xAxis: {
        type: 'category',
        data: versions,
        axisLabel: { color: '#64748b', fontSize: 10, rotate: 30 },
        axisLine: { lineStyle: { color: '#1e293b' } }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#64748b', fontSize: 10 },
        splitLine: { lineStyle: { color: '#1e293b', type: 'dashed' } }
      },
      series: [
        {
          name: '预估ECPM',
          type: 'line',
          data: est,
          symbol: 'circle',
          symbolSize: 7,
          lineStyle: { type: 'dashed', color: '#F59E0B', width: 2 },
          itemStyle: { color: '#F59E0B' }
        },
        {
          name: '真实ECPM',
          type: 'line',
          data: real,
          symbol: 'circle',
          symbolSize: 7,
          lineStyle: { color: '#26C2AD', width: 2 },
          itemStyle: { color: '#26C2AD' }
        }
      ]
    }
  }

  function buildUpgradeOption(): EChartsOption {
    const { dates, series } = tabData.value?.upgradeProgress ?? { dates: [], series: [] }
    return {
      backgroundColor: 'transparent',
      grid: { left: 48, right: 16, top: 16, bottom: 36 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1e293b',
        borderColor: '#334155',
        textStyle: { color: '#f1f5f9' }
      },
      legend: {
        data: series.map((s) => s.version),
        bottom: 0,
        textStyle: { color: '#64748b', fontSize: 11 }
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLabel: { color: '#64748b', fontSize: 10 },
        axisLine: { lineStyle: { color: '#1e293b' } }
      },
      yAxis: {
        type: 'value',
        max: 100,
        axisLabel: { color: '#64748b', fontSize: 10, formatter: '{value}%' },
        splitLine: { lineStyle: { color: '#1e293b', type: 'dashed' } }
      },
      series: series.map((s) => ({
        name: s.version,
        type: 'bar' as const,
        stack: 'total',
        data: s.data,
        itemStyle: { color: s.color }
      }))
    }
  }

  function buildPenetrationCrashOption(): EChartsOption {
    const { versions, penetration, crash } = tabData.value?.penetrationCrash ?? {
      versions: [],
      penetration: [],
      crash: []
    }
    return {
      backgroundColor: 'transparent',
      grid: { left: 56, right: 56, top: 16, bottom: 36 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1e293b',
        borderColor: '#334155',
        textStyle: { color: '#f1f5f9' }
      },
      legend: {
        data: ['广告用户渗透率', '崩溃率'],
        bottom: 0,
        textStyle: { color: '#64748b', fontSize: 11 }
      },
      xAxis: {
        type: 'category',
        data: versions,
        axisLabel: { color: '#64748b', fontSize: 10, rotate: 30 },
        axisLine: { lineStyle: { color: '#1e293b' } }
      },
      yAxis: [
        {
          type: 'value',
          name: '渗透率%',
          nameTextStyle: { color: '#64748b' },
          max: 100,
          axisLabel: { color: '#64748b', fontSize: 10, formatter: '{value}%' },
          splitLine: { lineStyle: { color: '#1e293b', type: 'dashed' } }
        },
        {
          type: 'value',
          name: '崩溃率%',
          nameTextStyle: { color: '#64748b' },
          axisLabel: { color: '#64748b', fontSize: 10 },
          splitLine: { show: false }
        }
      ],
      series: [
        {
          name: '广告用户渗透率',
          type: 'bar',
          data: penetration,
          itemStyle: { color: '#26C2AD', borderRadius: [3, 3, 0, 0] },
          barMaxWidth: 24
        },
        {
          name: '崩溃率',
          type: 'line',
          data: crash,
          yAxisIndex: 1,
          symbol: 'circle',
          symbolSize: 7,
          lineStyle: { color: '#8B5CF6', width: 2 },
          itemStyle: { color: '#8B5CF6' }
        }
      ]
    }
  }

  function refreshCharts() {
    if (!tabData.value) return
    useRevenueChart.updateChart(buildRevenueOption())
    useEcpmTrend.updateChart(buildEcpmTrendOption())
    useUpgrade.updateChart(buildUpgradeOption())
    usePenetrationCrash.updateChart(buildPenetrationCrashOption())
  }

  async function loadTabData() {
    if (!props.filter?.s_app_id) {
      loading.value = false
      tabData.value = null
      return
    }
    loading.value = true
    try {
      tabData.value = await fetchIaaVersionTabData(props.filter)
      pagination.total = tabData.value?.tableRows.length ?? 0
      pagination.current = 1
    } finally {
      loading.value = false
    }
    await nextTick()
    refreshCharts()
  }

  onMounted(() => {
    loadTabData()
  })

  watch(
    () => props.filter,
    () => {
      loadTabData()
    },
    { deep: true }
  )
</script>

<style scoped lang="scss">
  @use '../styles/iaa-card-fx.scss' as *;

  .iaa-tab-version {
    display: flex;
    flex-direction: column;
    min-height: 100%;
  }

  .iaa-kpi-grid {
    display: grid;
    flex-shrink: 0;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }

  .iaa-kpi {
    min-width: 0;
    padding: 16px;
    background: var(--default-box-color);
    border: 1px solid var(--default-border);
    border-radius: 8px;

    &:not(.iaa-kpi--sk) {
      @include iaa-panel-hover;
    }

    &[data-accent='teal'] .iaa-kpi__value {
      color: #26c2ad;
    }

    &[data-accent='green'] .iaa-kpi__value {
      color: var(--art-success);
    }

    &[data-accent='amber'] .iaa-kpi__value {
      color: var(--art-warning);
    }

    &__title {
      margin-bottom: 8px;
      font-size: 12px;
      color: var(--art-gray-600);
    }

    &__value {
      font-size: 28px;
      font-weight: 700;
      line-height: 1.2;
      color: var(--art-gray-900);
    }

    &__sub {
      display: flex;
      gap: 4px;
      align-items: center;
      margin-top: 6px;
      font-size: 12px;
      color: var(--art-gray-600);
    }
  }

  .iaa-main-grid {
    display: grid;
    flex: 1;
    grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
    gap: 12px;
    min-height: 0;
  }

  .iaa-main-left,
  .iaa-main-right {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-width: 0;
    min-height: 0;
  }

  .iaa-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--default-box-color);
    border: 1px solid var(--default-border);

    :deep(.el-card__header) {
      flex-shrink: 0;
      padding: 10px 14px;
      font-size: 13px;
      font-weight: 600;
      border-bottom: 1px solid var(--default-border);
    }

    :deep(.el-card__body) {
      display: flex;
      flex: 1;
      flex-direction: column;
      padding: 14px;
      overflow: hidden;
    }
  }

  .iaa-chart {
    flex: 1;
    width: 100%;
    min-height: 0;

    &--hbar {
      min-height: 180px;
    }

    &--line {
      min-height: 160px;
    }

    &--stack {
      min-height: 160px;
    }

    &--dual {
      min-height: 160px;
    }
  }

  .iaa-insight-banner {
    display: flex;
    flex-shrink: 0;
    gap: 6px;
    align-items: center;
    padding: 8px 12px;
    margin-top: 10px;
    font-size: 12px;
    color: #f97316;
    background: rgb(249 115 22 / 12%);
    border: 1px solid rgb(249 115 22 / 28%);
    border-radius: 6px;
  }

  .iaa-version-cell.is-current {
    font-weight: 600;
    color: var(--art-primary);
  }

  .iaa-rating {
    color: var(--art-warning);
  }

  .iaa-ai-card {
    position: relative;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    gap: 12px;
    padding: 14px;
    overflow: hidden;
    background: linear-gradient(135deg, rgb(99 102 241 / 8%) 0%, rgb(139 92 246 / 6%) 100%);
    border: 1px solid rgb(99 102 241 / 30%);
    border-radius: 8px;

    /* 装饰光晕 */
    &::before {
      position: absolute;
      top: -30px;
      right: -30px;
      width: 100px;
      height: 100px;
      pointer-events: none;
      content: '';
      background: radial-gradient(circle, rgb(99 102 241 / 20%) 0%, transparent 70%);
    }

    &__header {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    &__icon-wrap {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      color: #fff;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      border-radius: 6px;
    }

    &__title {
      flex: 1;
      font-size: 13px;
      font-weight: 600;
      color: var(--art-gray-900);
    }

    &__badge {
      padding: 2px 7px;
      font-size: 10px;
      font-weight: 500;
      color: #818cf8;
      letter-spacing: 0.5px;
      background: rgb(99 102 241 / 15%);
      border: 1px solid rgb(99 102 241 / 25%);
      border-radius: 4px;
    }

    &__list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 0;
      margin: 0;
      list-style: none;
    }

    &__item {
      display: flex;
      gap: 8px;
      align-items: flex-start;
      font-size: 12px;
      line-height: 1.6;
      color: var(--art-gray-700);
    }

    &__dot {
      flex-shrink: 0;
      width: 5px;
      height: 5px;
      margin-top: 5px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      border-radius: 50%;
    }
  }
</style>
