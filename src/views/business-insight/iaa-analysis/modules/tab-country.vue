<template>
  <div class="iaa-tab-content iaa-tab-country">
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
            <span>国家收入地图</span>
          </template>
          <div ref="mapChartRef" class="iaa-chart iaa-chart--map"></div>
        </ElCard>
        <ElCard class="iaa-panel" shadow="never">
          <template #header>
            <span>国家收入 Top10 表格</span>
          </template>
          <ArtTable
            :data="tableData"
            :columns="tableColumns"
            row-key="s_country_code"
            :stripe="false"
            :border="false"
            size="default"
            :pagination="undefined"
          >
            <template #country="{ row }">
              <span class="iaa-country-cell">
                <span
                  :class="'fi fi-' + (row.s_country_code?.toLowerCase() || '')"
                  class="iaa-flag"
                ></span>
                {{ row.s_country_name }}
              </span>
            </template>
            <template #trend="{ row }">
              <span class="iaa-trend" :class="row.trend">
                <template v-if="row.trend === 'up'">↑ {{ row.trendPercent }}%</template>
                <template v-else-if="row.trend === 'down'">↓ {{ row.trendPercent }}%</template>
                <template v-else>—</template>
              </span>
            </template>
          </ArtTable>
        </ElCard>
      </div>
      <div class="iaa-main-right">
        <ElCard class="iaa-panel" shadow="never">
          <template #header>
            <span>国家ECPM对比</span>
          </template>
          <div ref="ecpmChartRef" class="iaa-chart iaa-chart--hbar"></div>
        </ElCard>
        <ElCard class="iaa-panel" shadow="never">
          <template #header>
            <span>国家收入趋势(近7天)</span>
          </template>
          <div ref="trendChartRef" class="iaa-chart iaa-chart--line"></div>
        </ElCard>
        <ElCard class="iaa-panel" shadow="never">
          <template #header>
            <span>国家广告用户渗透率</span>
          </template>
          <div ref="penetrationChartRef" class="iaa-chart iaa-chart--hbar"></div>
        </ElCard>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useChart } from '@/hooks/core/useChart'
  import type { EChartsOption } from '@/plugins/echarts'
  import type { ColumnOption } from '@/types'
  import type { IaaFilterState, IaaKpiCard, IaaCountryTableRow } from '../types'
  import 'flag-icons/css/flag-icons.min.css'

  defineOptions({ name: 'IaaTabCountry' })

  defineProps<{ filter: IaaFilterState }>()

  const kpis = ref<IaaKpiCard[]>([
    {
      id: '1',
      title: '覆盖国家数',
      primaryValue: '68个',
      subText: '收入贡献国家',
      accent: 'default'
    },
    {
      id: '2',
      title: 'Top1国家收入',
      primaryValue: '美国 $1,026.41',
      subText: '占比41.6% ↑ 8.2%',
      trendUp: true,
      accent: 'teal'
    },
    {
      id: '3',
      title: '平均ECPM',
      primaryValue: '3.32',
      subText: '美国 ECPM 8.23 | 韩国 7.44',
      accent: 'default'
    },
    {
      id: '4',
      title: '国家ARPDAU差异',
      primaryValue: '8.23x',
      subText: '美国 vs 乌兹别克斯坦最高差异',
      accent: 'amber'
    }
  ])

  const tableData = ref<IaaCountryTableRow[]>([
    {
      rank: 1,
      s_country_code: 'US',
      s_country_name: '美国',
      revenue: 1026.41,
      revenueShare: 41.6,
      ecpmEst: 8.23,
      ecpmReal: 7.9,
      impressions: 130000,
      adUsers: 45000,
      arpdau: 0.0228,
      trend: 'up',
      trendPercent: 8.2
    },
    {
      rank: 2,
      s_country_code: 'KR',
      s_country_name: '韩国',
      revenue: 412.2,
      revenueShare: 14.9,
      ecpmEst: 7.44,
      ecpmReal: 7.1,
      impressions: 58000,
      adUsers: 22000,
      arpdau: 0.0187,
      trend: 'up',
      trendPercent: 5.1
    },
    {
      rank: 3,
      s_country_code: 'JP',
      s_country_name: '日本',
      revenue: 318.5,
      revenueShare: 11.5,
      ecpmEst: 6.82,
      ecpmReal: 6.5,
      impressions: 47000,
      adUsers: 18000,
      arpdau: 0.0177,
      trend: 'flat'
    },
    {
      rank: 4,
      s_country_code: 'DE',
      s_country_name: '德国',
      revenue: 210.2,
      revenueShare: 7.6,
      ecpmEst: 4.51,
      ecpmReal: 4.3,
      impressions: 46600,
      adUsers: 15000,
      arpdau: 0.014,
      trend: 'down',
      trendPercent: 2.1
    }
  ])

  const tableColumns = computed<ColumnOption[]>(() => [
    { prop: 'rank', label: '#', width: 48 },
    { prop: 's_country_name', label: '国家', minWidth: 100, useSlot: true, slotName: 'country' },
    {
      prop: 'revenue',
      label: '收入',
      minWidth: 100,
      formatter: (r: IaaCountryTableRow) => `$${r.revenue.toFixed(2)}`
    },
    {
      prop: 'revenueShare',
      label: '占比',
      minWidth: 72,
      formatter: (r: IaaCountryTableRow) => `${r.revenueShare}%`
    },
    {
      prop: 'ecpmEst',
      label: 'ECPM(预)',
      minWidth: 88,
      formatter: (r: IaaCountryTableRow) => r.ecpmEst.toFixed(2)
    },
    {
      prop: 'ecpmReal',
      label: 'ECPM(真)',
      minWidth: 88,
      formatter: (r: IaaCountryTableRow) => r.ecpmReal.toFixed(2)
    },
    {
      prop: 'impressions',
      label: '展示次数',
      minWidth: 96,
      formatter: (r: IaaCountryTableRow) => r.impressions.toLocaleString()
    },
    {
      prop: 'adUsers',
      label: '广告用户',
      minWidth: 88,
      formatter: (r: IaaCountryTableRow) => r.adUsers.toLocaleString()
    },
    {
      prop: 'arpdau',
      label: 'ARPDAU',
      minWidth: 80,
      formatter: (r: IaaCountryTableRow) => r.arpdau.toFixed(4)
    },
    { prop: 'trend', label: '环比', minWidth: 72, useSlot: true, slotName: 'trend' }
  ])

  const useMapChart = useChart()
  const useEcpm = useChart()
  const useTrend = useChart()
  const usePenetration = useChart()
  const mapChartRef = useMapChart.chartRef
  const ecpmChartRef = useEcpm.chartRef
  const trendChartRef = useTrend.chartRef
  const penetrationChartRef = usePenetration.chartRef

  function buildMapOption(): EChartsOption {
    const names = tableData.value.map((r) => r.s_country_name)
    const values = tableData.value.map((r) => r.ecpmReal)
    return {
      grid: { left: 72, right: 24, top: 16, bottom: 40 },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'value', name: 'ECPM' },
      yAxis: { type: 'category', data: names },
      series: [{ type: 'bar', data: values, itemStyle: { color: '#26C2AD' }, barMaxWidth: 24 }]
    }
  }

  function buildEcpmOption(): EChartsOption {
    const names = tableData.value.map((r) => r.s_country_name)
    const values = tableData.value.map((r) => r.ecpmReal)
    return {
      grid: { left: 72, right: 24, top: 16, bottom: 24 },
      xAxis: { type: 'value' },
      yAxis: { type: 'category', data: names },
      series: [{ type: 'bar', data: values, itemStyle: { color: '#26C2AD' }, barMaxWidth: 20 }]
    }
  }

  function buildTrendOption(): EChartsOption {
    const dates = ['02-27', '02-29', '03-01', '03-02', '03-03', '03-04', '03-05']
    return {
      grid: { left: 48, right: 24, top: 16, bottom: 28 },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: dates },
      yAxis: { type: 'value' },
      legend: { data: ['美国', '韩国', '日本'], bottom: 0 },
      series: [
        {
          name: '美国',
          type: 'line',
          data: [320, 350, 340, 380, 400, 420, 440],
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: { color: '#26C2AD' }
        },
        {
          name: '韩国',
          type: 'line',
          data: [120, 130, 125, 138, 142, 145, 148],
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: { color: '#3B82F6' }
        },
        {
          name: '日本',
          type: 'line',
          data: [95, 100, 98, 105, 108, 110, 112],
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: { color: '#8B5CF6' }
        }
      ]
    }
  }

  function buildPenetrationOption(): EChartsOption {
    const names = tableData.value.map((r) => r.s_country_name)
    const penetration = tableData.value.map(
      (r) =>
        Math.round((r.adUsers / (r.impressions / Math.max(r.impressions / 5000, 1))) * 100) || 68
    )
    return {
      grid: { left: 72, right: 48, top: 16, bottom: 24 },
      xAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' } },
      yAxis: { type: 'category', data: names },
      series: [
        {
          type: 'bar',
          data: penetration,
          itemStyle: { color: '#26C2AD' },
          barMaxWidth: 20,
          label: { show: true, position: 'right', formatter: (p: any) => p.value + '%' }
        }
      ]
    }
  }

  onMounted(() => {
    useMapChart.initChart(buildMapOption())
    useEcpm.initChart(buildEcpmOption())
    useTrend.initChart(buildTrendOption())
    usePenetration.initChart(buildPenetrationOption())
  })
</script>

<style scoped lang="scss">
  .iaa-tab-country {
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

    &[data-accent='amber'] .iaa-kpi__value {
      color: var(--art-warning);
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
      padding: 12px 16px;
      font-size: 14px;
      border-bottom: 1px solid var(--default-border);
    }

    :deep(.el-card__body) {
      padding: 16px;
    }
  }

  .iaa-chart {
    width: 100%;
    height: 260px;
  }

  .iaa-chart--map {
    height: 280px;
  }

  .iaa-country-cell {
    display: inline-flex;
    gap: 8px;
    align-items: center;
  }

  .iaa-flag {
    display: inline-block;
    width: 20px;
    height: 14px;
    border-radius: 2px;
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
</style>
