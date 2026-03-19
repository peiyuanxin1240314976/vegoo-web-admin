<template>
  <div class="iaa-tab-content iaa-tab-ad-platform">
    <!-- KPI 卡片 -->
    <section class="iaa-kpi-grid">
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

    <!-- 主内容：左 2/3 + 右 1/3 -->
    <section class="iaa-main-grid">
      <div class="iaa-main-left">
        <!-- 广告平台效果排行 -->
        <ElCard class="iaa-panel" shadow="never">
          <template #header>
            <span>广告平台效果排行</span>
          </template>
          <div ref="rankingChartRef" class="iaa-chart iaa-chart--bar"></div>
          <div class="iaa-insight-banner"> ✅ Admob收入占比 71.7%，建议优先保障Admob展示质量 </div>
        </ElCard>
        <!-- 平台详细对比表 -->
        <ElCard class="iaa-panel" shadow="never">
          <template #header>
            <span>平台详细对比表</span>
          </template>
          <ArtTable
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
              <span class="iaa-variance" :class="row.variance > 0 ? 'up' : 'down'">
                {{ row.variance > 0 ? '+' : '' }}{{ row.variance }}%
              </span>
            </template>
          </ArtTable>
        </ElCard>
      </div>
      <div class="iaa-main-right">
        <ElCard class="iaa-panel" shadow="never">
          <template #header>
            <span>广告平台收入占比</span>
          </template>
          <div class="iaa-donut-wrap">
            <div class="iaa-donut-center">$2,768</div>
            <div ref="donutChartRef" class="iaa-chart iaa-chart--donut"></div>
          </div>
          <div class="iaa-donut-legend">
            <div v-for="(item, i) in donutData" :key="item.name" class="iaa-donut-legend__item">
              <span class="iaa-donut-legend__dot" :style="{ background: DONUT_COLORS[i] }" />
              <span>{{ item.name }} {{ item.percent.toFixed(1) }}%</span>
            </div>
          </div>
        </ElCard>
        <ElCard class="iaa-panel" shadow="never">
          <template #header>
            <span>平台ECPM对比</span>
          </template>
          <div ref="ecpmChartRef" class="iaa-chart iaa-chart--hbar"></div>
        </ElCard>
        <ElCard class="iaa-panel" shadow="never">
          <template #header>
            <span>平台收入趋势(近7天)</span>
          </template>
          <div ref="trendChartRef" class="iaa-chart iaa-chart--line"></div>
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
  import type { IaaFilterState, IaaKpiCard, IaaPlatformTableRow } from '../types'

  defineOptions({ name: 'IaaTabAdPlatform' })

  const props = defineProps<{ filter: IaaFilterState }>()

  const kpis = ref<IaaKpiCard[]>([
    {
      id: '1',
      title: '广告总收入',
      primaryValue: '$2,768.58',
      subText: '广告平台上报 ↑12.3%',
      trendUp: true,
      accent: 'teal'
    },
    {
      id: '2',
      title: '平均ECPM',
      primaryValue: '3.32 / 3.06',
      subText: '预估/真实 | 偏差 +8.5%',
      accent: 'default'
    },
    {
      id: '3',
      title: '广告展示次数',
      primaryValue: '833,607',
      subText: '人均展示4.9次',
      accent: 'default'
    },
    {
      id: '4',
      title: '广告用户',
      primaryValue: '117,483',
      subText: '渗透率68.6%',
      accent: 'default'
    }
  ])

  const tableData = ref<IaaPlatformTableRow[]>([
    {
      sourceName: 'Admob',
      source: 1,
      revenue: 1985.86,
      revenueShare: 71.7,
      impressions: 520000,
      impressionShare: 62.4,
      adUsers: 85000,
      userShare: 72.4,
      ecpmEst: 18.54,
      ecpmReal: 17.2,
      variance: 7.8,
      fillRate: 96.2,
      trend: 'up'
    },
    {
      sourceName: 'Facebook',
      source: 2,
      revenue: 257.5,
      revenueShare: 9.3,
      impressions: 120000,
      impressionShare: 14.4,
      adUsers: 22000,
      userShare: 18.7,
      ecpmEst: 2.14,
      ecpmReal: 2.0,
      variance: 7.0,
      fillRate: 92,
      trend: 'flat'
    },
    {
      sourceName: 'Applovin',
      source: 4,
      revenue: 166.1,
      revenueShare: 6.0,
      impressions: 95000,
      impressionShare: 11.4,
      adUsers: 18000,
      userShare: 15.3,
      ecpmEst: 1.75,
      ecpmReal: 1.62,
      variance: 8.0,
      fillRate: 94,
      trend: 'up'
    },
    {
      sourceName: 'Vungle',
      source: 5,
      revenue: 198.2,
      revenueShare: 7.2,
      impressions: 58000,
      impressionShare: 7.0,
      adUsers: 12000,
      userShare: 10.2,
      ecpmEst: 3.42,
      ecpmReal: 3.2,
      variance: 6.9,
      fillRate: 91,
      trend: 'down'
    },
    {
      sourceName: 'Pangle',
      source: 7,
      revenue: 98.5,
      revenueShare: 3.6,
      impressions: 40000,
      impressionShare: 4.8,
      adUsers: 8000,
      userShare: 6.8,
      ecpmEst: 2.46,
      ecpmReal: 2.3,
      variance: 7.0,
      fillRate: 88,
      trend: 'flat'
    },
    {
      sourceName: 'Mintegral',
      source: 8,
      revenue: 62.4,
      revenueShare: 2.3,
      impressions: 20000,
      impressionShare: 2.4,
      adUsers: 4483,
      userShare: 3.8,
      ecpmEst: 3.12,
      ecpmReal: 2.9,
      variance: 7.6,
      fillRate: 90,
      trend: 'up'
    }
  ])

  const DONUT_COLORS = ['#26C2AD', '#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#94A3B8']

  const donutData = computed(() => {
    const total = tableData.value.reduce((s, r) => s + r.revenue, 0)
    return tableData.value.map((r) => ({
      name: r.sourceName,
      value: r.revenue,
      percent: total ? (r.revenue / total) * 100 : 0
    }))
  })

  const tableColumns = computed<ColumnOption[]>(() => [
    { prop: 'sourceName', label: '平台', minWidth: 100 },
    {
      prop: 'revenue',
      label: '广告收入',
      minWidth: 100,
      formatter: (row: IaaPlatformTableRow) => `$${row.revenue.toFixed(2)}`
    },
    {
      prop: 'revenueShare',
      label: '占比',
      minWidth: 72,
      formatter: (row: IaaPlatformTableRow) => `${row.revenueShare}%`
    },
    {
      prop: 'impressions',
      label: '展示次数',
      minWidth: 100,
      formatter: (row: IaaPlatformTableRow) => row.impressions.toLocaleString()
    },
    {
      prop: 'impressionShare',
      label: '展示占比',
      minWidth: 80,
      formatter: (row: IaaPlatformTableRow) => `${row.impressionShare}%`
    },
    {
      prop: 'adUsers',
      label: '广告用户',
      minWidth: 90,
      formatter: (row: IaaPlatformTableRow) => row.adUsers.toLocaleString()
    },
    {
      prop: 'userShare',
      label: '用户占比',
      minWidth: 80,
      formatter: (row: IaaPlatformTableRow) => `${row.userShare}%`
    },
    {
      prop: 'ecpmEst',
      label: 'ECPM(预)',
      minWidth: 88,
      formatter: (row: IaaPlatformTableRow) => row.ecpmEst.toFixed(2)
    },
    {
      prop: 'ecpmReal',
      label: 'ECPM(真)',
      minWidth: 88,
      formatter: (row: IaaPlatformTableRow) => row.ecpmReal.toFixed(2)
    },
    { prop: 'variance', label: '偏差', minWidth: 72, useSlot: true, slotName: 'variance' },
    {
      prop: 'fillRate',
      label: '充填率',
      minWidth: 80,
      formatter: (row: IaaPlatformTableRow) => `${row.fillRate}%`
    },
    { prop: 'trend', label: '趋势', minWidth: 64, useSlot: true, slotName: 'trend' }
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
    const names = tableData.value.map((r) => r.sourceName)
    const revenues = tableData.value.map((r) => r.revenue)
    return {
      grid: { left: 56, right: 24, top: 16, bottom: 48 },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: names, axisLabel: { fontSize: 11 } },
      yAxis: {
        type: 'value',
        name: '',
        axisLabel: { fontSize: 11 },
        splitLine: { lineStyle: { type: 'dashed', opacity: 0.3 } }
      },
      series: [
        {
          type: 'bar',
          data: revenues,
          itemStyle: { color: '#26C2AD' },
          barMaxWidth: 36,
          label: {
            show: true,
            position: 'top',
            formatter: (p: any) => `$${Number(p.value ?? 0).toFixed(2)}`
          }
        }
      ]
    }
  }

  function buildDonutOption(): EChartsOption {
    const data = donutData.value.map((d, i) => ({
      name: d.name,
      value: d.value,
      itemStyle: { color: DONUT_COLORS[i] }
    }))
    return {
      series: [
        {
          type: 'pie',
          radius: ['60%', '85%'],
          center: ['50%', '50%'],
          data,
          label: { show: false },
          emphasis: { scale: false }
        }
      ]
    }
  }

  function buildEcpmOption(): EChartsOption {
    const names = tableData.value.map((r) => r.sourceName)
    const est = tableData.value.map((r) => r.ecpmEst)
    const real = tableData.value.map((r) => r.ecpmReal)
    return {
      grid: { left: 72, right: 24, top: 16, bottom: 24 },
      tooltip: { trigger: 'axis' },
      legend: { data: ['预估ECPM', '真实ECPM'], bottom: 0 },
      xAxis: { type: 'value', axisLabel: { fontSize: 11 } },
      yAxis: { type: 'category', data: names, axisLabel: { fontSize: 11 } },
      series: [
        {
          name: '预估ECPM',
          type: 'bar',
          data: est,
          itemStyle: { color: '#26C2AD' },
          barMaxWidth: 14
        },
        {
          name: '真实ECPM',
          type: 'bar',
          data: real,
          itemStyle: { color: '#3B82F6' },
          barMaxWidth: 14
        }
      ]
    }
  }

  const trend7dDates = ['02-27', '02-29', '03-01', '03-02', '03-03', '03-04', '03-05']
  const trend7dAdmob = [420, 480, 450, 520, 580, 610, 620]
  const trend7dFacebook = [80, 85, 82, 90, 88, 92, 95]
  const trend7dOthers = [120, 115, 130, 125, 135, 140, 138]

  function buildTrendOption(): EChartsOption {
    return {
      grid: { left: 48, right: 24, top: 16, bottom: 28 },
      tooltip: { trigger: 'axis' },
      legend: { data: ['Admob', 'Facebook', '其他'], bottom: 0 },
      xAxis: { type: 'category', data: trend7dDates, axisLabel: { fontSize: 11 } },
      yAxis: { type: 'value', axisLabel: { fontSize: 11 } },
      series: [
        {
          name: 'Admob',
          type: 'line',
          data: trend7dAdmob,
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: { color: '#26C2AD' }
        },
        {
          name: 'Facebook',
          type: 'line',
          data: trend7dFacebook,
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: { color: '#3B82F6' }
        },
        {
          name: '其他',
          type: 'line',
          data: trend7dOthers,
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: { color: '#8B5CF6' }
        }
      ]
    }
  }

  onMounted(() => {
    useRankingChart.initChart(buildRankingOption())
    useDonutChart.initChart(buildDonutOption())
    useEcpmChart.initChart(buildEcpmOption())
    useTrendChart.initChart(buildTrendOption())
  })

  watch(
    () => [tableData.value, props.filter],
    () => {
      useRankingChart.updateChart(buildRankingOption())
      useDonutChart.updateChart(buildDonutOption())
      useEcpmChart.updateChart(buildEcpmOption())
    },
    { deep: true }
  )
</script>

<style scoped lang="scss">
  .iaa-tab-ad-platform {
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

      &.up {
        color: var(--art-success);
      }

      &.down {
        color: var(--art-danger);
      }
    }
  }

  .iaa-main-grid {
    display: grid;
    flex: 1;
    grid-template-columns: 1fr 360px;
    gap: 16px;
    min-height: 0;
  }

  .iaa-main-left {
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-height: 0;
  }

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
      padding: 12px 16px;
      font-size: 14px;
      color: var(--art-gray-900);
      border-bottom: 1px solid var(--default-border);
    }

    :deep(.el-card__body) {
      padding: 16px;
    }
  }

  .iaa-chart {
    width: 100%;
    height: 280px;

    &--bar {
      height: 320px;
    }

    &--donut {
      height: 200px;
    }

    &--hbar {
      height: 240px;
    }

    &--line {
      height: 220px;
    }
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
    color: var(--art-gray-900);
    background: rgb(38 194 173 / 15%);
    border: 1px solid rgb(38 194 173 / 30%);
    border-radius: 8px;
  }

  .iaa-trend.up {
    color: var(--art-success);
  }

  .iaa-trend.down {
    color: var(--art-danger);
  }

  .iaa-trend:not(.up, .down) {
    color: var(--art-gray-600);
  }

  .iaa-variance.up {
    color: var(--art-warning);
  }

  .iaa-variance.down {
    color: var(--art-success);
  }
</style>
