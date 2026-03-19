<template>
  <div class="iaa-tab-content iaa-tab-version">
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
            <span>版本收入对比</span>
          </template>
          <div ref="revenueChartRef" class="iaa-chart iaa-chart--hbar"></div>
          <div class="iaa-insight-banner iaa-insight-banner--orange">
            v4.2.1已成为主流版本，建议推动老版本用户升级
          </div>
        </ElCard>
        <ElCard class="iaa-panel" shadow="never">
          <template #header>
            <span>版本详细数据表</span>
          </template>
          <ArtTable
            :data="tableData"
            :columns="tableColumns"
            row-key="app_version"
            :stripe="false"
            :border="false"
            size="default"
            :pagination="undefined"
          >
            <template #version="{ row }">
              <span class="iaa-version-cell" :class="{ 'is-current': row.isCurrent }">{{
                row.app_version
              }}</span>
            </template>
            <template #rating="{ row }">
              <span class="iaa-rating">{{ row.versionRating.toFixed(1) }}★</span>
            </template>
          </ArtTable>
        </ElCard>
      </div>
      <div class="iaa-main-right">
        <ElCard class="iaa-panel" shadow="never">
          <template #header>
            <span>版本 ECPM 趋势对比</span>
          </template>
          <div ref="ecpmTrendRef" class="iaa-chart iaa-chart--line"></div>
        </ElCard>
        <ElCard class="iaa-panel" shadow="never">
          <template #header>
            <span>版本升级进度</span>
          </template>
          <div ref="upgradeChartRef" class="iaa-chart iaa-chart--stack"></div>
        </ElCard>
        <ElCard class="iaa-panel" shadow="never">
          <template #header>
            <span>版本广告渗透率 vs 崩溃率</span>
          </template>
          <div ref="penetrationCrashRef" class="iaa-chart iaa-chart--dual"></div>
        </ElCard>
        <ElCard class="iaa-panel iaa-panel--ai" shadow="never">
          <div class="iaa-ai-insight">
            <span class="iaa-ai-insight__icon">🤖</span>
            <div class="iaa-ai-insight__title">AI版本洞察</div>
            <ul class="iaa-ai-insight__list">
              <li v-for="(bullet, i) in aiInsight.bullets" :key="i">{{ bullet }}</li>
            </ul>
          </div>
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
  import type { IaaFilterState, IaaKpiCard, IaaVersionTableRow, IaaVersionInsight } from '../types'

  defineOptions({ name: 'IaaTabVersion' })

  defineProps<{ filter: IaaFilterState }>()

  const kpis = ref<IaaKpiCard[]>([
    {
      id: '1',
      title: '当前版本',
      primaryValue: 'v4.2.1',
      subText: '主流版本 | 用户占比62.4%',
      accent: 'teal'
    },
    {
      id: '2',
      title: '版本数量',
      primaryValue: '8个活跃版本',
      subText: '追踪近2个月内版本',
      accent: 'default'
    },
    {
      id: '3',
      title: '版本广告收入',
      primaryValue: '$2,768.58',
      subText: 'v4.2.1贡献$1,727.60 (62.4%)',
      accent: 'default'
    },
    {
      id: '4',
      title: '版本升级影响',
      primaryValue: '+12.8%',
      subText: 'v4.2.1 vs v4.1.x ECPM提升',
      trendUp: true,
      accent: 'green'
    }
  ])

  const tableData = ref<IaaVersionTableRow[]>([
    {
      app_version: 'v4.2.1',
      releaseDate: '2026-02-15',
      userShare: 62.4,
      revenue: 1727.6,
      ecpmEst: 3.45,
      ecpmReal: 3.32,
      impressions: 520000,
      adPenetration: 68.6,
      crashRate: 0.12,
      versionRating: 4.6,
      isCurrent: true
    },
    {
      app_version: 'v4.1.8',
      releaseDate: '2026-01-20',
      userShare: 18.2,
      revenue: 504.2,
      ecpmEst: 3.12,
      ecpmReal: 3.06,
      impressions: 165000,
      adPenetration: 65.2,
      crashRate: 0.35,
      versionRating: 4.2
    },
    {
      app_version: 'v4.1.5',
      releaseDate: '2026-01-05',
      userShare: 8.5,
      revenue: 235.6,
      ecpmEst: 2.98,
      ecpmReal: 2.91,
      impressions: 81000,
      adPenetration: 62.1,
      crashRate: 0.42,
      versionRating: 4.0
    }
  ])

  const aiInsight = ref<IaaVersionInsight>({
    bullets: [
      'v4.2.1 ECPM提升+12.8%，建议加速推动老版本用户升级',
      'v4.1.8及以下版本崩溃率较高，建议重点关注并引导升级'
    ]
  })

  const tableColumns = computed<ColumnOption[]>(() => [
    { prop: 'app_version', label: '版本', minWidth: 88, useSlot: true, slotName: 'version' },
    { prop: 'releaseDate', label: '发布日期', minWidth: 100 },
    {
      prop: 'userShare',
      label: '用户占比',
      minWidth: 88,
      formatter: (r: IaaVersionTableRow) => `${r.userShare}%`
    },
    {
      prop: 'revenue',
      label: '广告收入',
      minWidth: 100,
      formatter: (r: IaaVersionTableRow) => `$${r.revenue.toFixed(2)}`
    },
    {
      prop: 'ecpmEst',
      label: 'ECPM(预)',
      minWidth: 88,
      formatter: (r: IaaVersionTableRow) => r.ecpmEst.toFixed(2)
    },
    {
      prop: 'ecpmReal',
      label: 'ECPM(真)',
      minWidth: 88,
      formatter: (r: IaaVersionTableRow) => r.ecpmReal.toFixed(2)
    },
    {
      prop: 'impressions',
      label: '广告展示次数',
      minWidth: 110,
      formatter: (r: IaaVersionTableRow) => r.impressions.toLocaleString()
    },
    {
      prop: 'adPenetration',
      label: '广告用户渗透率',
      minWidth: 110,
      formatter: (r: IaaVersionTableRow) => `${r.adPenetration}%`
    },
    {
      prop: 'crashRate',
      label: '崩溃率',
      minWidth: 72,
      formatter: (r: IaaVersionTableRow) => `${r.crashRate}%`
    },
    { prop: 'versionRating', label: '版本评分', minWidth: 88, useSlot: true, slotName: 'rating' }
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
    const versions = tableData.value.map((r) => r.app_version)
    const revenues = tableData.value.map((r) => r.revenue)
    const userShares = tableData.value.map((r) => r.userShare * 50)
    return {
      grid: { left: 80, right: 80, top: 16, bottom: 24 },
      tooltip: { trigger: 'axis' },
      legend: { data: ['广告收入', '用户占比%'], bottom: 0 },
      xAxis: { type: 'value' },
      yAxis: { type: 'category', data: versions },
      series: [
        {
          name: '广告收入',
          type: 'bar',
          data: revenues,
          itemStyle: { color: '#26C2AD' },
          barMaxWidth: 28,
          label: {
            show: true,
            position: 'right',
            formatter: (p: any) => `$${p.value?.toFixed(2) ?? 0}`
          }
        },
        {
          name: '用户占比%',
          type: 'bar',
          data: userShares,
          itemStyle: { color: '#3B82F6' },
          barMaxWidth: 12
        }
      ]
    }
  }

  function buildEcpmTrendOption(): EChartsOption {
    const versions = tableData.value.map((r) => r.app_version)
    const est = tableData.value.map((r) => r.ecpmEst)
    const real = tableData.value.map((r) => r.ecpmReal)
    return {
      grid: { left: 56, right: 48, top: 16, bottom: 28 },
      tooltip: { trigger: 'axis' },
      legend: { data: ['预估ECPM', '真实ECPM'], bottom: 0 },
      xAxis: { type: 'category', data: versions },
      yAxis: { type: 'value', min: 2, max: 4 },
      series: [
        {
          name: '预估ECPM',
          type: 'line',
          data: est,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: { type: 'dashed' },
          itemStyle: { color: '#F59E0B' }
        },
        {
          name: '真实ECPM',
          type: 'line',
          data: real,
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: { color: '#26C2AD' }
        }
      ]
    }
  }

  function buildUpgradeOption(): EChartsOption {
    const dates = ['02-05', '02-12', '02-19', '02-26', '03-05']
    return {
      grid: { left: 56, right: 24, top: 16, bottom: 28 },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: dates },
      yAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' } },
      series: [
        {
          name: 'v4.2.1',
          type: 'bar',
          stack: 'total',
          data: [10, 25, 42, 55, 62.4],
          itemStyle: { color: '#26C2AD' }
        },
        {
          name: 'v4.1.8',
          type: 'bar',
          stack: 'total',
          data: [35, 32, 28, 22, 18.2],
          itemStyle: { color: '#3B82F6' }
        },
        {
          name: 'v4.1.5',
          type: 'bar',
          stack: 'total',
          data: [25, 22, 18, 14, 8.5],
          itemStyle: { color: '#8B5CF6' }
        },
        {
          name: '其他',
          type: 'bar',
          stack: 'total',
          data: [30, 21, 12, 9, 10.9],
          itemStyle: { color: '#94A3B8' }
        }
      ]
    }
  }

  function buildPenetrationCrashOption(): EChartsOption {
    const versions = tableData.value.map((r) => r.app_version)
    const penetration = tableData.value.map((r) => r.adPenetration)
    const crash = tableData.value.map((r) => r.crashRate)
    return {
      grid: { left: 56, right: 48, top: 16, bottom: 28 },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: versions },
      yAxis: [
        { type: 'value', name: '渗透率%', max: 100 },
        { type: 'value', name: '崩溃率%' }
      ],
      series: [
        {
          name: '广告用户渗透率',
          type: 'bar',
          data: penetration,
          itemStyle: { color: '#26C2AD' },
          barMaxWidth: 24
        },
        {
          name: '崩溃率',
          type: 'line',
          data: crash,
          yAxisIndex: 1,
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: { color: '#8B5CF6' }
        }
      ]
    }
  }

  onMounted(() => {
    useRevenueChart.initChart(buildRevenueOption())
    useEcpmTrend.initChart(buildEcpmTrendOption())
    useUpgrade.initChart(buildUpgradeOption())
    usePenetrationCrash.initChart(buildPenetrationCrashOption())
  })
</script>

<style scoped lang="scss">
  .iaa-tab-version {
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

    &[data-accent='green'] .iaa-kpi__value {
      color: var(--art-success);
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

  .iaa-panel--ai :deep(.el-card__body) {
    padding: 16px;
  }

  .iaa-chart {
    width: 100%;
    height: 240px;
  }

  .iaa-chart--hbar {
    height: 260px;
  }

  .iaa-chart--stack {
    height: 220px;
  }

  .iaa-chart--dual {
    height: 220px;
  }

  .iaa-insight-banner {
    padding: 10px 12px;
    margin-top: 12px;
    font-size: 12px;
    background: rgb(245 158 11 / 15%);
    border: 1px solid rgb(245 158 11 / 30%);
    border-radius: 8px;
  }

  .iaa-insight-banner--orange {
    background: rgb(249 115 22 / 15%);
    border-color: rgb(249 115 22 / 30%);
  }

  .iaa-version-cell.is-current {
    font-weight: 600;
    color: var(--art-primary);
  }

  .iaa-rating {
    color: var(--art-warning);
  }

  .iaa-ai-insight {
    padding: 12px;

    &__icon {
      font-size: 24px;
    }

    &__title {
      margin: 8px 0;
      font-size: 14px;
      font-weight: 600;
      color: var(--art-gray-900);
    }

    &__list {
      padding-left: 20px;
      margin: 0;
      font-size: 12px;
      line-height: 1.8;
      color: var(--art-gray-600);
    }
  }
</style>
