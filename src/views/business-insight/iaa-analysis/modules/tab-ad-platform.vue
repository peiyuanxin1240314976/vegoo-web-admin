<template>
  <div class="iaa-tab-content iaa-tab-ad-platform">
    <section class="iaa-main-grid">
      <!-- ——— 左列 ——— -->
      <div class="iaa-main-left">
        <!-- KPI 4列横排 -->
        <section v-if="loading" class="iaa-kpi-grid">
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
        </section>

        <section v-else class="iaa-kpi-grid">
          <article v-for="k in kpis" :key="k.id" class="iaa-kpi" :data-accent="k.accent">
            <div class="iaa-kpi__title">{{ k.title }}</div>
            <div class="iaa-kpi__value">{{ k.primaryValue }}</div>
            <div
              class="iaa-kpi__sub"
              :class="k.trendUp !== undefined ? (k.trendUp ? 'up' : 'down') : ''"
            >
              {{ k.subText }}
            </div>
          </article>
        </section>

        <!-- 广告平台效果排行 -->
        <ElCard class="iaa-panel iaa-neon-panel" shadow="never">
          <template #header><span>广告平台效果排行</span></template>
          <div v-if="loading" class="iaa-chart-sk iaa-chart-sk--bar"></div>
          <div v-else ref="rankingChartRef" class="iaa-chart iaa-chart--bar"></div>
          <div v-if="platformInsight" class="iaa-insight-banner">
            <el-icon><SuccessFilled /></el-icon>
            <span v-html="platformInsight"></span>
          </div>
        </ElCard>

        <!-- 平台详细对比表 -->
        <ElCard class="iaa-panel iaa-neon-panel" shadow="never">
          <template #header><span>平台详细对比表</span></template>
          <div v-if="loading" class="iaa-chart-sk iaa-chart-sk--line"></div>
          <ArtTable
            v-else
            :data="tableData"
            :columns="tableColumns"
            row-key="sourceName"
            :stripe="false"
            :border="false"
            size="default"
            :pagination="undefined"
          >
            <template #trend="{ row }">
              <span class="iaa-trend" :class="row.trend">
                <template v-if="row.trend === 'up'">↑</template>
                <template v-else-if="row.trend === 'down'">↓</template>
                <template v-else>—</template>
              </span>
            </template>
            <template #variance="{ row }">
              <span class="iaa-variance" :class="(row.variance ?? 0) > 0 ? 'up' : 'down'">
                {{ (row.variance ?? 0) > 0 ? '+' : '' }}{{ row.variance ?? 0 }}%
              </span>
            </template>
          </ArtTable>
        </ElCard>
      </div>

      <!-- ——— 右列 ——— -->
      <div class="iaa-main-right">
        <!-- 广告平台收入占比 -->
        <ElCard class="iaa-panel iaa-neon-panel" shadow="never">
          <template #header><span>广告平台收入占比</span></template>
          <div class="iaa-donut-body">
            <div class="iaa-donut-wrap">
              <div v-if="loading" class="iaa-chart-sk iaa-chart-sk--radar"></div>
              <div v-else ref="donutChartRef" class="iaa-chart iaa-chart--donut"></div>
              <div class="iaa-donut-center">{{ donutTotal }}</div>
            </div>
            <div class="iaa-donut-legend">
              <div v-for="(item, i) in donutData" :key="item.name" class="iaa-donut-legend__item">
                <span class="iaa-donut-legend__dot" :style="{ background: DONUT_COLORS[i] }" />
                <span class="iaa-donut-legend__name">{{ item.name }}</span>
                <span class="iaa-donut-legend__pct">{{ (item.percent ?? 0).toFixed(1) }}%</span>
              </div>
            </div>
          </div>
        </ElCard>

        <!-- 平台ECPM对比 -->
        <ElCard class="iaa-panel iaa-neon-panel" shadow="never">
          <template #header><span>平台ECPM对比</span></template>
          <div v-if="loading" class="iaa-chart-sk iaa-chart-sk--bar"></div>
          <div v-else ref="ecpmChartRef" class="iaa-chart iaa-chart--hbar"></div>
        </ElCard>

        <!-- 平台收入趋势 -->
        <ElCard class="iaa-panel iaa-neon-panel" shadow="never">
          <template #header><span>平台收入趋势(近7天)</span></template>
          <div v-if="loading" class="iaa-chart-sk iaa-chart-sk--line"></div>
          <div v-else ref="trendChartRef" class="iaa-chart iaa-chart--line"></div>
        </ElCard>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch, nextTick } from 'vue'
  import { useChart } from '@/hooks/core/useChart'
  import { SuccessFilled } from '@element-plus/icons-vue'
  import type { EChartsOption } from '@/plugins/echarts'
  import type { ColumnOption } from '@/types'
  import type { IaaFilterState, IaaPlatformTabData, IaaPlatformTableRow } from '../types'
  import { fetchIaaPlatformTabData } from '@/api/business-insight'
  import { useIaaTheme } from '../composables/useIaaTheme'

  defineOptions({ name: 'IaaTabAdPlatform' })

  const props = defineProps<{ filter: IaaFilterState }>()

  const tabData = ref<IaaPlatformTabData | null>(null)
  const loading = ref(false)
  const { colors } = useIaaTheme()

  const kpis = computed(() => tabData.value?.kpis ?? [])
  const tableData = computed(() => tabData.value?.tableRows ?? [])
  const platformInsight = computed(() => tabData.value?.platformInsight ?? '')
  const donutData = computed(() => tabData.value?.donut ?? [])

  // 加一点紫/橙氛围：warning + danger 参与配色（仍来自 token）
  const PLATFORM_COLORS = computed(() => [
    colors.value.success,
    colors.value.primary,
    colors.value.danger,
    colors.value.warning,
    colors.value.textSecondary
  ])
  const DONUT_COLORS = PLATFORM_COLORS

  const donutTotal = computed(() => {
    const total = donutData.value.reduce((s, d) => s + Number(d.value ?? 0), 0)
    return `$${total.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  })

  const n = (v: unknown, fallback = 0) => {
    const x = Number(v)
    return Number.isFinite(x) ? x : fallback
  }

  const tableColumns = computed<ColumnOption[]>(() => [
    { prop: 'sourceName', label: '平台', minWidth: 90 },
    {
      prop: 'revenue',
      label: '广告收入',
      minWidth: 96,
      formatter: (row: IaaPlatformTableRow) => `$${n(row.revenue).toFixed(2)}`
    },
    {
      prop: 'revenueShare',
      label: '占比',
      minWidth: 60,
      formatter: (row: IaaPlatformTableRow) => `${n(row.revenueShare)}%`
    },
    {
      prop: 'impressions',
      label: '展示次数',
      minWidth: 90,
      formatter: (row: IaaPlatformTableRow) => n(row.impressions).toLocaleString()
    },
    {
      prop: 'impressionShare',
      label: '展示占比',
      minWidth: 74,
      formatter: (row: IaaPlatformTableRow) => `${n(row.impressionShare)}%`
    },
    {
      prop: 'adUsers',
      label: '广告用户',
      minWidth: 80,
      formatter: (row: IaaPlatformTableRow) => n(row.adUsers).toLocaleString()
    },
    {
      prop: 'userShare',
      label: '用户占比',
      minWidth: 70,
      formatter: (row: IaaPlatformTableRow) => `${n(row.userShare)}%`
    },
    {
      prop: 'ecpmEst',
      label: 'ECPM(预)',
      minWidth: 80,
      formatter: (row: IaaPlatformTableRow) => n(row.ecpmEst).toFixed(2)
    },
    {
      prop: 'ecpmReal',
      label: 'ECPM(真)',
      minWidth: 80,
      formatter: (row: IaaPlatformTableRow) => n(row.ecpmReal).toFixed(2)
    },
    { prop: 'variance', label: '偏差', minWidth: 68, useSlot: true, slotName: 'variance' },
    {
      prop: 'fillRate',
      label: '充填率',
      minWidth: 70,
      formatter: (row: IaaPlatformTableRow) => `${n(row.fillRate)}%`
    },
    { prop: 'trend', label: '趋势', minWidth: 56, useSlot: true, slotName: 'trend' }
  ])

  const useRankingChart = useChart()
  const useDonutChart = useChart()
  const useEcpmChart = useChart()
  const useTrendChart = useChart()
  const rankingChartRef = useRankingChart.chartRef
  const donutChartRef = useDonutChart.chartRef
  const ecpmChartRef = useEcpmChart.chartRef
  const trendChartRef = useTrendChart.chartRef

  function buildRankingOption(): EChartsOption {
    const rows = tabData.value?.platformRanking ?? []
    const names = rows.map((r) => r.sourceName)
    const revenues = rows.map((r) => r.revenue)
    const ecpms = rows.map((r) => n(r.ecpm).toFixed(2))
    return {
      backgroundColor: 'transparent',
      grid: { left: 48, right: 16, top: 32, bottom: 52 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1e293b',
        borderColor: '#334155',
        textStyle: { color: '#f1f5f9' }
      },
      xAxis: {
        type: 'category',
        data: names,
        axisLine: { lineStyle: { color: '#1e293b' } },
        axisTick: { show: false },
        axisLabel: {
          color: '#94a3b8',
          fontSize: 11,
          interval: 0,
          formatter: (_val: string, idx: number) => `${names[idx]}\nECPM ${ecpms[idx]}`
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#94a3b8', fontSize: 10, formatter: '${value}' },
        splitLine: { lineStyle: { color: '#1e293b', type: 'dashed' } }
      },
      series: [
        {
          type: 'bar',
          barMaxWidth: 44,
          data: revenues.map((v, i) => ({
            value: v,
            itemStyle: {
              color: PLATFORM_COLORS.value[i % PLATFORM_COLORS.value.length],
              borderRadius: [3, 3, 0, 0]
            }
          })),
          label: {
            show: true,
            position: 'top',
            formatter: (p: { value?: number }) => `$${Number(p.value ?? 0).toFixed(2)}`,
            color: '#f1f5f9',
            fontSize: 11
          }
        }
      ]
    } as unknown as EChartsOption
  }

  function buildDonutOption(): EChartsOption {
    const data = donutData.value.map((d, i) => ({
      name: d.name,
      value: d.value,
      itemStyle: { color: DONUT_COLORS.value[i % DONUT_COLORS.value.length] }
    }))
    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: '#1e293b',
        borderColor: '#334155',
        textStyle: { color: '#f1f5f9' },
        formatter: (p: { name: string; value: number; percent: number }) =>
          `${p.name}<br/>$${p.value.toFixed(2)} (${p.percent?.toFixed(1)}%)`
      },
      series: [
        {
          type: 'pie',
          radius: ['48%', '72%'],
          center: ['46%', '50%'],
          data,
          label: {
            show: true,
            position: 'outside',
            formatter: (p: { percent: number }) => `${p.percent?.toFixed(1)}%`,
            color: '#94a3b8',
            fontSize: 11
          },
          labelLine: {
            show: true,
            lineStyle: { color: '#334155', width: 1 }
          },
          emphasis: { scale: true, scaleSize: 4 }
        }
      ]
    } as unknown as EChartsOption
  }

  function buildEcpmOption(): EChartsOption {
    const rows = tabData.value?.ecpmComparison ?? []
    const names = rows.map((r) => r.name)
    const est = rows.map((r) => r.ecpmEst)
    const real = rows.map((r) => r.ecpmReal)
    return {
      backgroundColor: 'transparent',
      grid: { left: 72, right: 48, top: 36, bottom: 8, containLabel: false },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1e293b',
        borderColor: '#334155',
        textStyle: { color: '#f1f5f9' }
      },
      legend: {
        data: ['预估ECPM', '真实ECPM'],
        top: 4,
        right: 0,
        textStyle: { color: '#64748b', fontSize: 11 },
        itemWidth: 12,
        itemHeight: 8
      },
      xAxis: {
        type: 'value',
        axisLabel: { show: false },
        splitLine: { show: false },
        axisLine: { show: false }
      },
      yAxis: {
        type: 'category',
        data: names,
        axisLabel: { color: '#94a3b8', fontSize: 11 },
        axisLine: { show: false },
        axisTick: { show: false }
      },
      series: [
        {
          name: '预估ECPM',
          type: 'bar',
          data: est,
          barMaxWidth: 12,
          itemStyle: { color: '#26C2AD', borderRadius: [0, 2, 2, 0] },
          label: {
            show: true,
            position: 'right',
            formatter: (p: { value?: number }) => `${Number(p.value ?? 0).toFixed(2)}`,
            color: '#94a3b8',
            fontSize: 10
          }
        },
        {
          name: '真实ECPM',
          type: 'bar',
          data: real,
          barMaxWidth: 12,
          itemStyle: { color: '#3B82F6', borderRadius: [0, 2, 2, 0] },
          label: {
            show: true,
            position: 'right',
            formatter: (p: { value?: number }) => `${Number(p.value ?? 0).toFixed(2)}`,
            color: '#94a3b8',
            fontSize: 10
          }
        }
      ]
    } as unknown as EChartsOption
  }

  function buildTrendOption(): EChartsOption {
    const trend = tabData.value?.trend7d
    const dates = trend?.dates ?? []
    const series = trend?.series ?? []
    return {
      backgroundColor: 'transparent',
      grid: { left: 32, right: 16, top: 40, bottom: 20, containLabel: true },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1e293b',
        borderColor: '#334155',
        textStyle: { color: '#f1f5f9' }
      },
      legend: {
        data: series.map((s) => s.name),
        top: 4,
        left: 0,
        textStyle: { color: '#64748b', fontSize: 10 },
        itemWidth: 16,
        itemHeight: 3,
        icon: 'rect'
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLabel: { color: '#64748b', fontSize: 10 },
        axisLine: { lineStyle: { color: '#1e293b' } },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#64748b', fontSize: 10 },
        splitLine: { lineStyle: { color: '#1e293b', type: 'dashed' } }
      },
      series: series.map((s) => ({
        name: s.name,
        type: 'line' as const,
        data: s.data,
        smooth: true,
        symbol: 'circle',
        symbolSize: 4,
        lineStyle: { color: s.color, width: 2 },
        itemStyle: { color: s.color }
      }))
    } as unknown as EChartsOption
  }

  function refreshCharts() {
    if (!tabData.value) return
    useRankingChart.updateChart(buildRankingOption())
    useDonutChart.updateChart(buildDonutOption())
    useEcpmChart.updateChart(buildEcpmOption())
    useTrendChart.updateChart(buildTrendOption())
  }

  async function loadTabData() {
    if (!props.filter?.s_app_id) {
      loading.value = false
      tabData.value = null
      return
    }
    loading.value = true
    try {
      tabData.value = await fetchIaaPlatformTabData(props.filter)
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
  @import '../styles/iaa-card-fx';

  .iaa-tab-ad-platform {
    display: flex;
    flex-direction: column;
    min-height: 100%;
  }

  /* ——— 主网格 ——— */
  .iaa-main-grid {
    display: grid;
    flex: 1;
    grid-template-columns: 3fr 2fr;
    gap: 16px;
    min-height: 0;
  }

  .iaa-main-left {
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-width: 0;
  }

  .iaa-main-right {
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-width: 0;

    .iaa-panel {
      flex: 1;
    }
  }

  /* ——— KPI 4列横排 ——— */
  .iaa-kpi-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }

  .iaa-kpi {
    min-width: 0;
    padding: 14px 16px;
    background: var(--default-box-color);
    border: 1px solid var(--default-border);
    border-radius: 8px;

    &[data-accent='teal'] .iaa-kpi__value {
      color: var(--art-primary);
    }

    &__title {
      margin-bottom: 6px;
      font-size: 12px;
      color: var(--art-gray-600);
    }

    &__value {
      font-size: 22px;
      font-weight: 700;
      line-height: 1.2;
      color: var(--art-gray-900);
    }

    &__sub {
      margin-top: 4px;
      font-size: 12px;
      color: var(--art-gray-600);

      &.up {
        color: var(--art-success);
      }

      &.down {
        color: var(--art-danger);
      }
    }
  }

  /* ——— Panel 通用 ——— */
  .iaa-panel {
    display: flex;
    flex-direction: column;
    background: var(--default-box-color);
    border: 1px solid var(--default-border);

    :deep(.el-card__header) {
      flex-shrink: 0;
      padding: 12px 16px;
      font-size: 13px;
      font-weight: 600;
      color: var(--art-gray-900);
      border-bottom: 1px solid var(--default-border);
    }

    :deep(.el-card__body) {
      display: flex;
      flex: 1;
      flex-direction: column;
      padding: 16px;
      overflow: hidden;
    }
  }

  /* ——— 图表高度 ——— */
  .iaa-chart {
    flex: 1;
    width: 100%;
    min-height: 0;

    &--bar {
      min-height: 200px;
    }

    &--hbar {
      min-height: 180px;
    }

    &--line {
      min-height: 160px;
    }

    &--donut {
      flex: none;
      width: 100%;
      height: 100%;
    }
  }

  /* ——— 环形图 ——— */
  .iaa-donut-body {
    display: flex;
    flex: 1;
    gap: 8px;
    align-items: center;
    min-height: 160px;
  }

  .iaa-donut-wrap {
    position: relative;
    flex: 1;
    min-width: 0;
    height: 160px;
  }

  .iaa-donut-center {
    position: absolute;
    top: 50%;
    left: 46%;
    font-size: 18px;
    font-weight: 700;
    color: var(--art-gray-900);
    white-space: nowrap;
    pointer-events: none;
    transform: translate(-50%, -50%);
  }

  .iaa-donut-legend {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    gap: 7px;
    width: 130px;
  }

  .iaa-donut-legend__item {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 12px;
  }

  .iaa-donut-legend__dot {
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .iaa-donut-legend__name {
    flex: 1;
    overflow: hidden;
    color: var(--art-gray-600);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .iaa-donut-legend__pct {
    flex-shrink: 0;
    font-weight: 600;
    color: var(--art-gray-900);
  }

  /* ——— 洞察条 ——— */
  .iaa-insight-banner {
    display: flex;
    flex-shrink: 0;
    gap: 6px;
    align-items: center;
    padding: 8px 12px;
    margin-top: 10px;
    font-size: 12px;
    color: #67e8f9;
    background: rgb(6 182 212 / 10%);
    border: 1px solid rgb(6 182 212 / 25%);
    border-radius: 6px;

    .el-icon {
      flex-shrink: 0;
      color: #22d3ee;
    }
  }

  /* ——— 表格趋势/偏差 ——— */
  .iaa-trend {
    &.up {
      color: var(--art-success);
    }

    &.down {
      color: var(--art-danger);
    }

    &:not(.up, .down) {
      color: var(--art-gray-600);
    }
  }

  .iaa-variance {
    &.up {
      color: var(--art-warning);
    }

    &.down {
      color: var(--art-success);
    }
  }
</style>
