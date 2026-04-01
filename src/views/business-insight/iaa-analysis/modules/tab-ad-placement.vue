<template>
  <div class="iaa-tab-content iaa-tab-ad-placement">
    <section class="iaa-main-grid">
      <!-- ——— 左列 ——— -->
      <div class="iaa-main-left">
        <!-- KPI 4列横排（在左列内） -->
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

        <!-- Top10 排行 -->
        <ElCard class="iaa-panel iaa-neon-panel" shadow="never">
          <template #header>
            <span>广告位 Top10 收入排行</span>
            <div class="iaa-metric-tabs">
              <button
                v-for="m in metricTabs"
                :key="m.key"
                type="button"
                class="iaa-metric-tab"
                :class="{ 'is-active': metricKey === m.key }"
                @click="metricKey = m.key"
              >
                {{ m.label }}
              </button>
            </div>
          </template>
          <div v-if="loading" class="iaa-chart-sk iaa-chart-sk--bar"></div>
          <div v-else ref="top10ChartRef" class="iaa-chart iaa-chart--top10"></div>
        </ElCard>

        <!-- 详细数据表 -->
        <ElCard class="iaa-panel iaa-neon-panel" shadow="never">
          <template #header>
            <span>广告位详细数据表</span>
          </template>
          <div v-if="loading" class="iaa-chart-sk iaa-chart-sk--line"></div>
          <ArtTable
            v-else
            :data="tableData"
            :columns="tableColumns"
            row-key="placementName"
            :stripe="true"
            :border="false"
            size="default"
            :pagination="undefined"
            class="iaa-table"
          >
            <template #status="{ row }">
              <span class="iaa-status" :class="row.status">
                <span class="iaa-status-dot"></span>
                {{ row.status === 'normal' ? '正常' : '偏低' }}
              </span>
            </template>
          </ArtTable>
        </ElCard>
      </div>

      <!-- ——— 右列 ——— -->
      <div class="iaa-main-right">
        <!-- 广告位收入分布 donut -->
        <ElCard class="iaa-panel iaa-neon-panel" shadow="never">
          <template #header><span>广告位收入分布</span></template>
          <div class="iaa-donut-body">
            <div class="iaa-donut-wrap">
              <div v-if="loading" class="iaa-chart-sk iaa-chart-sk--radar"></div>
              <div v-else ref="donutChartRef" class="iaa-chart iaa-chart--donut"></div>
              <div class="iaa-donut-center">{{ donutTotal }}</div>
            </div>
            <div class="iaa-donut-legend">
              <div v-for="(item, i) in donutList" :key="item.name" class="iaa-donut-legend__item">
                <span class="iaa-donut-legend__dot" :style="{ background: PLACEMENT_COLORS[i] }" />
                <span class="iaa-donut-legend__name">{{ item.name }}</span>
                <span class="iaa-donut-legend__pct">{{ item.percent.toFixed(1) }}%</span>
              </div>
            </div>
          </div>
        </ElCard>

        <!-- ECPM 排行 -->
        <ElCard class="iaa-panel iaa-neon-panel iaa-panel--with-footer" shadow="never">
          <template #header><span>广告位 ECPM 排行</span></template>
          <div v-if="loading" class="iaa-chart-sk iaa-chart-sk--bar"></div>
          <div v-else ref="ecpmChartRef" class="iaa-chart iaa-chart--hbar"></div>
          <div v-if="placementInsight" class="iaa-insight-banner">
            <span>💡</span>
            <span>{{ placementInsight }}</span>
          </div>
        </ElCard>

        <!-- 展示次数 vs 收入散点图 -->
        <ElCard class="iaa-panel iaa-neon-panel" shadow="never">
          <template #header><span>广告位展示次数 vs 收入散点图</span></template>
          <div v-if="loading" class="iaa-chart-sk iaa-chart-sk--line"></div>
          <div v-else ref="scatterChartRef" class="iaa-chart iaa-chart--scatter"></div>
        </ElCard>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch, nextTick } from 'vue'
  import { useChart } from '@/hooks/core/useChart'
  import type { EChartsOption } from '@/plugins/echarts'
  import type { ColumnOption } from '@/types'
  import type { IaaFilterState, IaaPlacementTabData, IaaPlacementTableRow } from '../types'
  import { fetchIaaPlacementTabData } from '@/api/business-insight'

  defineOptions({ name: 'IaaTabAdPlacement' })

  const props = defineProps<{ filter: IaaFilterState }>()

  const loading = ref(false)

  const metricTabs = [
    { key: 'revenue', label: '收入' },
    { key: 'impressions', label: '展示次数' },
    { key: 'ecpm', label: 'ECPM' },
    { key: 'users', label: '用户数' }
  ]
  const metricKey = ref('revenue')

  const tabData = ref<IaaPlacementTabData | null>(null)

  const kpis = computed(() => tabData.value?.kpis ?? [])
  const tableData = computed(() => tabData.value?.tableRows ?? [])
  const placementInsight = computed(() => tabData.value?.placementInsight ?? '')
  const donutList = computed(() => tabData.value?.donut ?? [])

  const PLACEMENT_COLORS = ['#26C2AD', '#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#94A3B8']

  const donutTotal = computed(() => {
    const total = donutList.value.reduce((s, d) => s + d.value, 0)
    return `$${total.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  })

  const tableColumns = computed<ColumnOption[]>(() => [
    { prop: 'placementName', label: '广告位', minWidth: 140 },
    { prop: 'adTypeName', label: '广告类型', minWidth: 80 },
    { prop: 'sourceName', label: '广告平台', minWidth: 80 },
    {
      prop: 'revenue',
      label: '收入',
      minWidth: 90,
      formatter: (r: IaaPlacementTableRow) => `$${r.revenue.toFixed(2)}`
    },
    {
      prop: 'impressions',
      label: '展示次数',
      minWidth: 90,
      formatter: (r: IaaPlacementTableRow) => r.impressions.toLocaleString()
    },
    {
      prop: 'ecpmEst',
      label: 'ECPM(预)',
      minWidth: 80,
      formatter: (r: IaaPlacementTableRow) => r.ecpmEst.toFixed(2)
    },
    {
      prop: 'ecpmReal',
      label: 'ECPM(真)',
      minWidth: 80,
      formatter: (r: IaaPlacementTableRow) => r.ecpmReal.toFixed(2)
    },
    {
      prop: 'impressionUsers',
      label: '展示用户',
      minWidth: 80,
      formatter: (r: IaaPlacementTableRow) => r.impressionUsers.toLocaleString()
    },
    {
      prop: 'fillRate',
      label: '充填率',
      minWidth: 72,
      formatter: (r: IaaPlacementTableRow) => `${r.fillRate}%`
    },
    { prop: 'status', label: '状态', minWidth: 72, useSlot: true, slotName: 'status' }
  ])

  const useTop10 = useChart()
  const useDonut = useChart()
  const useEcpm = useChart()
  const useScatter = useChart()
  const top10ChartRef = useTop10.chartRef
  const donutChartRef = useDonut.chartRef
  const ecpmChartRef = useEcpm.chartRef
  const scatterChartRef = useScatter.chartRef

  function buildTop10Option(): EChartsOption {
    const key = metricKey.value
    const top10 = tabData.value?.top10 ?? []
    const names = top10.map((p, i) => `${i + 1}. ${p.name}`)
    const values = top10.map((p) => ({
      revenue: p.revenue,
      impressions: p.impressions,
      ecpm: p.ecpm,
      users: p.users,
      percent: p.percent
    }))
    const data = values.map((v, i) => ({
      value:
        key === 'revenue'
          ? v.revenue
          : key === 'impressions'
            ? v.impressions
            : key === 'ecpm'
              ? v.ecpm
              : v.users,
      itemStyle: { color: PLACEMENT_COLORS[i % PLACEMENT_COLORS.length] },
      _percent: v.percent
    }))
    return {
      backgroundColor: 'transparent',
      grid: { left: 160, right: 64, top: 8, bottom: 8, containLabel: false },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1e293b',
        borderColor: '#334155',
        textStyle: { color: '#f1f5f9' }
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
        inverse: false,
        axisLabel: { color: '#94a3b8', fontSize: 11 },
        axisLine: { show: false },
        axisTick: { show: false }
      },
      series: [
        {
          type: 'bar',
          data,
          barMaxWidth: 20,
          label: {
            show: true,
            position: 'right',
            color: '#94a3b8',
            fontSize: 11,
            formatter: (p: { data: { _percent: number; value: number } }) => `${p.data._percent}%`
          }
        }
      ]
    } as unknown as EChartsOption
  }

  function buildDonutOption(): EChartsOption {
    const data = donutList.value.map((d, i) => ({
      name: d.name,
      value: d.value,
      itemStyle: { color: PLACEMENT_COLORS[i] }
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
          radius: ['50%', '74%'],
          center: ['44%', '50%'],
          data,
          label: {
            show: true,
            position: 'outside',
            formatter: (p: { name: string; percent: number }) =>
              `${p.name}\n${p.percent?.toFixed(1)}%`,
            color: '#94a3b8',
            fontSize: 10,
            lineHeight: 16
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
    const ranking = tabData.value?.ecpmRanking ?? []
    const names = ranking.map((r) => r.name)
    const ecpms = ranking.map((r) => r.ecpm)
    return {
      backgroundColor: 'transparent',
      grid: { left: 100, right: 48, top: 8, bottom: 8, containLabel: false },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1e293b',
        borderColor: '#334155',
        textStyle: { color: '#f1f5f9' }
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
          type: 'bar',
          data: ecpms.map((v, i) => ({
            value: v,
            itemStyle: { color: PLACEMENT_COLORS[i % PLACEMENT_COLORS.length] }
          })),
          barMaxWidth: 18,
          label: {
            show: true,
            position: 'right',
            color: '#94a3b8',
            fontSize: 10,
            formatter: (p: { value?: number }) => Number(p.value ?? 0).toFixed(2)
          }
        }
      ]
    } as unknown as EChartsOption
  }

  function buildScatterOption(): EChartsOption {
    const scatter = tabData.value?.scatterData ?? []
    return {
      backgroundColor: 'transparent',
      grid: { left: 56, right: 24, top: 16, bottom: 32, containLabel: true },
      tooltip: {
        trigger: 'item',
        backgroundColor: '#1e293b',
        borderColor: '#334155',
        textStyle: { color: '#f1f5f9' },
        formatter: (p: { data: (string | number)[] }) =>
          `${p.data[2]}<br/>展示: ${Number(p.data[0]).toFixed(0)}K<br/>收入: $${Number(p.data[1]).toFixed(0)}`
      },
      xAxis: {
        type: 'value',
        name: 'Impressions (K)',
        nameTextStyle: { color: '#64748b', fontSize: 10 },
        axisLabel: { color: '#94a3b8', fontSize: 10, formatter: '{value}K' },
        splitLine: { lineStyle: { color: '#1e293b', type: 'dashed' } }
      },
      yAxis: {
        type: 'value',
        name: 'Revenue ($)',
        nameTextStyle: { color: '#64748b', fontSize: 10 },
        axisLabel: { color: '#94a3b8', fontSize: 10, formatter: '${value}' },
        splitLine: { lineStyle: { color: '#1e293b', type: 'dashed' } }
      },
      series: [
        {
          type: 'scatter',
          data: scatter.map((p) => [p.impressions / 1000, p.revenue, p.name]),
          symbolSize: (val: number[]) => Math.max(12, Math.min(40, val[1] / 40)),
          itemStyle: { color: '#26C2AD', opacity: 0.75 },
          label: {
            show: true,
            position: 'right',
            formatter: (p: { data: (string | number)[] }) => String(p.data[2]),
            color: '#94a3b8',
            fontSize: 10
          }
        }
      ]
    } as unknown as EChartsOption
  }

  function refreshCharts() {
    if (!tabData.value) return
    useTop10.updateChart(buildTop10Option())
    useDonut.updateChart(buildDonutOption())
    useEcpm.updateChart(buildEcpmOption())
    useScatter.updateChart(buildScatterOption())
  }

  async function loadTabData() {
    if (!props.filter?.s_app_id) {
      loading.value = false
      tabData.value = null
      return
    }
    loading.value = true
    try {
      tabData.value = await fetchIaaPlacementTabData(props.filter)
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

  watch(metricKey, () => {
    if (tabData.value) useTop10.updateChart(buildTop10Option())
  })
</script>

<style scoped lang="scss">
  @use '../styles/iaa-card-fx.scss' as *;

  .iaa-tab-ad-placement {
    display: flex;
    flex-direction: column;
    min-height: 100%;
  }

  /* ——— 主网格：左宽右窄 ——— */
  .iaa-main-grid {
    display: grid;
    flex: 1;
    grid-template-columns: minmax(0, 1fr) minmax(0, 400px);
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

    /* donut 和散点图等分剩余空间，ECPM 卡自然高度 */
    .iaa-panel:not(.iaa-panel--with-footer) {
      flex: 1;
    }
  }

  /* ——— KPI 在左列内 4列 ——— */
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

    &:not(.iaa-kpi--sk) {
      @include iaa-panel-hover;
    }

    &[data-accent='teal'] .iaa-kpi__value {
      color: var(--art-primary);
    }

    &__title {
      margin-bottom: 6px;
      font-size: 12px;
      color: var(--art-gray-600);
    }

    &__value {
      font-size: 20px;
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
      display: flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: space-between;
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

  /* ECPM 卡：自然高度，图表固定，banner 始终可见 */
  .iaa-panel--with-footer {
    flex: none;

    :deep(.el-card__body) {
      overflow: visible;
    }

    .iaa-chart--hbar {
      flex: none;
      height: 180px;
    }
  }

  /* ——— Metric 切换 ——— */
  .iaa-metric-tabs {
    display: flex;
    gap: 4px;
  }

  .iaa-metric-tab {
    padding: 4px 10px;
    font-size: 12px;
    color: var(--art-gray-600);
    cursor: pointer;
    background: transparent;
    border: 1px solid var(--default-border);
    border-radius: 9999px;

    &.is-active {
      color: #fff;
      background: var(--art-primary);
      border-color: var(--art-primary);
    }
  }

  /* ——— 图表 ——— */
  .iaa-chart {
    flex: 1;
    width: 100%;
    min-height: 0;

    &--top10 {
      min-height: 240px;
    }

    &--hbar {
      min-height: 180px;
    }

    &--scatter {
      min-height: 200px;
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
    left: 44%;
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
    width: 120px;
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
    align-items: flex-start;
    padding: 8px 12px;
    margin-top: 10px;
    font-size: 12px;
    color: #f59e0b;
    background: rgb(245 158 11 / 10%);
    border: 1px solid rgb(245 158 11 / 25%);
    border-radius: 6px;
  }

  /* ——— 表格 ——— */
  .iaa-table {
    /* 表头底色 */
    :deep(.el-table__header-wrapper th.el-table__cell) {
      font-weight: 500;
      color: var(--art-gray-600);
      background: rgb(255 255 255 / 6%);
    }

    /* 斑马纹（偶数行） */
    :deep(.el-table__body tr.el-table__row--striped td.el-table__cell) {
      background: rgb(255 255 255 / 3%);
    }

    /* 悬停行 */
    :deep(.el-table__body tr:hover td.el-table__cell) {
      background: rgb(59 130 246 / 8%) !important;
    }
  }

  /* ——— 状态 ——— */
  .iaa-status {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    font-size: 12px;
  }

  .iaa-status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  .iaa-status.normal .iaa-status-dot {
    background: var(--art-success);
  }

  .iaa-status.low .iaa-status-dot {
    background: var(--art-warning);
  }
</style>
