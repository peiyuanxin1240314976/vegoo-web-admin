<template>
  <div class="iaa-tab-content iaa-tab-ad-placement">
    <section class="iaa-kpi-grid">
      <article v-for="k in kpis" :key="k.id" class="iaa-kpi" :data-accent="k.accent">
        <div class="iaa-kpi__title">{{ k.title }}</div>
        <div class="iaa-kpi__value">{{ k.primaryValue }}</div>
        <div class="iaa-kpi__sub">{{ k.subText }}</div>
      </article>
    </section>

    <section class="iaa-main-grid">
      <div class="iaa-main-left">
        <ElCard class="iaa-panel" shadow="never">
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
          <div ref="top10ChartRef" class="iaa-chart iaa-chart--hbar"></div>
        </ElCard>
        <ElCard class="iaa-panel" shadow="never">
          <template #header>
            <span>广告位详细数据表</span>
          </template>
          <ArtTable
            :data="tableData"
            :columns="tableColumns"
            row-key="placementName"
            :stripe="false"
            :border="false"
            size="default"
            :pagination="undefined"
          >
            <template #status="{ row }">
              <span class="iaa-status" :class="row.status">
                <span class="iaa-status-dot"></span>
                {{ row.status === 'normal' ? '正常' : '偏低' }}
              </span>
            </template>
          </ArtTable>
        </ElCard>
        <ElCard class="iaa-panel" shadow="never">
          <template #header>
            <span>广告位展示次数 vs 收入散点图</span>
          </template>
          <div ref="scatterChartRef" class="iaa-chart iaa-chart--scatter"></div>
        </ElCard>
      </div>
      <div class="iaa-main-right">
        <ElCard class="iaa-panel" shadow="never">
          <template #header>
            <span>广告位收入分布</span>
          </template>
          <div class="iaa-donut-wrap">
            <div class="iaa-donut-center">$2,768</div>
            <div ref="donutChartRef" class="iaa-chart iaa-chart--donut"></div>
          </div>
          <div class="iaa-donut-legend">
            <div v-for="(item, i) in donutList" :key="item.name" class="iaa-donut-legend__item">
              <span
                class="iaa-donut-legend__dot"
                :style="{ background: PLACEMENT_COLORS[i] }"
              ></span>
              <span>{{ item.name }} {{ item.percent.toFixed(1) }}%</span>
            </div>
          </div>
        </ElCard>
        <ElCard class="iaa-panel" shadow="never">
          <template #header>
            <span>广告位 ECPM 排行</span>
          </template>
          <div ref="ecpmChartRef" class="iaa-chart iaa-chart--hbar"></div>
          <div class="iaa-insight-banner iaa-insight-banner--amber">
            插页式广告位普遍ECPM较高，建议优先保障展示频次
          </div>
        </ElCard>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue'
  import { useChart } from '@/hooks/core/useChart'
  import type { EChartsOption } from '@/plugins/echarts'
  import type { ColumnOption } from '@/types'
  import type { IaaFilterState, IaaKpiCard, IaaPlacementTableRow } from '../types'

  defineOptions({ name: 'IaaTabAdPlacement' })

  defineProps<{ filter: IaaFilterState }>()

  const metricTabs = [
    { key: 'revenue', label: '收入' },
    { key: 'impressions', label: '展示次数' },
    { key: 'ecpm', label: 'ECPM' },
    { key: 'users', label: '用户数' }
  ]
  const metricKey = ref('revenue')

  const kpis = ref<IaaKpiCard[]>([
    {
      id: '1',
      title: '广告位总数',
      primaryValue: '47个',
      subText: '已开启43个 | 关闭4个',
      accent: 'default'
    },
    {
      id: '2',
      title: '广告位总收入',
      primaryValue: '$2,768.58',
      subText: '平均每个 $58.91 ↑ 12.3%',
      trendUp: true,
      accent: 'teal'
    },
    {
      id: '3',
      title: '广告位平均ECPM',
      primaryValue: '3.32',
      subText: 'Top广告位: WeatherRadar 19.16',
      accent: 'default'
    },
    {
      id: '4',
      title: '广告位展示总次',
      primaryValue: '833,607',
      subText: '广告位平均展示 17,736次',
      accent: 'default'
    }
  ])

  const tableData = ref<IaaPlacementTableRow[]>([
    {
      placementName: 'Splash',
      adTypeName: '开屏',
      sourceName: 'Admob',
      revenue: 1452,
      impressions: 280000,
      ecpmEst: 19.16,
      ecpmReal: 18.2,
      impressionUsers: 65000,
      fillRate: 98,
      status: 'normal'
    },
    {
      placementName: 'HomeResume',
      adTypeName: '插页式',
      sourceName: 'Admob',
      revenue: 446,
      impressions: 95000,
      ecpmEst: 4.7,
      ecpmReal: 4.5,
      impressionUsers: 42000,
      fillRate: 95,
      status: 'normal'
    },
    {
      placementName: 'Native_AdMainWall',
      adTypeName: '原生',
      sourceName: 'Facebook',
      revenue: 332,
      impressions: 120000,
      ecpmEst: 2.77,
      ecpmReal: 2.6,
      impressionUsers: 38000,
      fillRate: 92,
      status: 'normal'
    }
  ])

  const PLACEMENT_COLORS = ['#26C2AD', '#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#94A3B8']
  const top10Placements = [
    {
      name: 'Splash',
      revenue: 1452,
      percent: 52.4,
      impressions: 280000,
      ecpm: 19.16,
      users: 65000
    },
    {
      name: 'HomeResume',
      revenue: 446,
      percent: 16.1,
      impressions: 95000,
      ecpm: 4.7,
      users: 42000
    },
    {
      name: 'Native_AdMainWall',
      revenue: 332,
      percent: 12.0,
      impressions: 120000,
      ecpm: 2.77,
      users: 38000
    }
  ]

  const donutList = computed(() => {
    const total = top10Placements.reduce((s, r) => s + r.revenue, 0)
    return top10Placements.map((r) => ({
      name: r.name,
      value: r.revenue,
      percent: total ? (r.revenue / total) * 100 : 0
    }))
  })

  const tableColumns = computed<ColumnOption[]>(() => [
    { prop: 'placementName', label: '广告位', minWidth: 140 },
    { prop: 'adTypeName', label: '广告类型', minWidth: 88 },
    { prop: 'sourceName', label: '广告平台', minWidth: 88 },
    {
      prop: 'revenue',
      label: '收入',
      minWidth: 90,
      formatter: (r: IaaPlacementTableRow) => `$${r.revenue.toFixed(2)}`
    },
    {
      prop: 'impressions',
      label: '展示次数',
      minWidth: 96,
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
      minWidth: 88,
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
    const names = top10Placements.map((p) => p.name)
    const data = top10Placements.map((p) =>
      key === 'revenue'
        ? p.revenue
        : key === 'impressions'
          ? p.impressions
          : key === 'ecpm'
            ? p.ecpm
            : p.users
    )
    const colors = data.map((_, i) => (i === 0 ? '#26C2AD' : i === 1 ? '#3B82F6' : '#94A3B8'))
    return {
      grid: { left: 100, right: 48, top: 16, bottom: 24 },
      xAxis: { type: 'value' },
      yAxis: { type: 'category', data: names },
      series: [
        {
          type: 'bar',
          data,
          itemStyle: { color: (params: any) => colors[params.dataIndex] },
          barMaxWidth: 24
        }
      ]
    }
  }

  function buildDonutOption(): EChartsOption {
    const data = donutList.value.map((d, i) => ({
      name: d.name,
      value: d.value,
      itemStyle: { color: PLACEMENT_COLORS[i] }
    }))
    return {
      series: [
        {
          type: 'pie',
          radius: ['60%', '85%'],
          center: ['50%', '50%'],
          data,
          label: { show: false }
        }
      ]
    }
  }

  function buildEcpmOption(): EChartsOption {
    const names = top10Placements.map((p) => p.name)
    const ecpms = top10Placements.map((p) => p.ecpm)
    return {
      grid: { left: 72, right: 24, top: 16, bottom: 24 },
      xAxis: { type: 'value' },
      yAxis: { type: 'category', data: names },
      series: [{ type: 'bar', data: ecpms, itemStyle: { color: '#26C2AD' }, barMaxWidth: 20 }]
    }
  }

  function buildScatterOption(): EChartsOption {
    const data = top10Placements.map((p) => [p.impressions / 1000, p.revenue])
    return {
      grid: { left: 56, right: 24, top: 16, bottom: 32 },
      xAxis: { type: 'value', name: '展示次数(K)' },
      yAxis: { type: 'value', name: '收入($)' },
      series: [{ type: 'scatter', data, symbolSize: 16, itemStyle: { color: '#26C2AD' } }]
    }
  }

  onMounted(() => {
    useTop10.initChart(buildTop10Option())
    useDonut.initChart(buildDonutOption())
    useEcpm.initChart(buildEcpmOption())
    useScatter.initChart(buildScatterOption())
  })

  watch(metricKey, () => {
    useTop10.updateChart(buildTop10Option())
  })
</script>

<style scoped lang="scss">
  .iaa-tab-ad-placement {
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-height: 100%;
  }

  .iaa-kpi-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }

  .iaa-kpi {
    padding: 16px;
    background: var(--default-box-color);
    border: 1px solid var(--default-border);
    border-radius: 8px;

    &[data-accent='teal'] .iaa-kpi__value {
      color: var(--art-primary);
    }

    &__title {
      margin-bottom: 8px;
      font-size: 12px;
      color: var(--art-gray-600);
    }

    &__value {
      font-size: 20px;
      font-weight: 600;
      color: var(--art-gray-900);
    }

    &__sub {
      margin-top: 4px;
      font-size: 12px;
      color: var(--art-gray-600);
    }
  }

  .iaa-main-grid {
    display: grid;
    flex: 1;
    grid-template-columns: 1fr 360px;
    gap: 16px;
    min-height: 0;
  }

  .iaa-main-left,
  .iaa-main-right {
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-height: 0;
  }

  .iaa-panel {
    background: var(--default-box-color);
    border: 1px solid var(--default-border);

    :deep(.el-card__header) {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      font-size: 14px;
      border-bottom: 1px solid var(--default-border);
    }

    :deep(.el-card__body) {
      padding: 16px;
    }
  }

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
    border: none;
    border-radius: 9999px;

    &.is-active {
      color: var(--art-primary);
      background: rgb(38 194 173 / 15%);
    }
  }

  .iaa-chart {
    width: 100%;
    height: 260px;
  }

  .iaa-chart--donut {
    height: 200px;
  }

  .iaa-chart--scatter {
    height: 280px;
  }

  .iaa-donut-wrap {
    position: relative;
    height: 200px;
  }

  .iaa-donut-center {
    position: absolute;
    top: 50%;
    left: 50%;
    font-size: 18px;
    font-weight: 600;
    color: var(--art-gray-900);
    transform: translate(-50%, -50%);
  }

  .iaa-donut-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 16px;
    margin-top: 12px;
    font-size: 12px;
    color: var(--art-gray-600);
  }

  .iaa-donut-legend__item {
    display: inline-flex;
    gap: 6px;
    align-items: center;
  }

  .iaa-donut-legend__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .iaa-insight-banner {
    padding: 10px 12px;
    margin-top: 12px;
    font-size: 12px;
    background: rgb(38 194 173 / 15%);
    border: 1px solid rgb(38 194 173 / 30%);
    border-radius: 8px;
  }

  .iaa-insight-banner--amber {
    background: rgb(245 158 11 / 15%);
    border-color: rgb(245 158 11 / 30%);
  }

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
