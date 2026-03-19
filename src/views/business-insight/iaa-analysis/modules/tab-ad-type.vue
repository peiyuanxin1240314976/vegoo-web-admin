<template>
  <div class="iaa-tab-content iaa-tab-ad-type">
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

    <section class="iaa-main-grid">
      <div class="iaa-main-left">
        <ElCard class="iaa-panel" shadow="never">
          <template #header>
            <span>广告类型详细对比</span>
          </template>
          <div class="iaa-ad-type-row">
            <div ref="radarChartRef" class="iaa-chart iaa-chart--radar"></div>
            <ArtTable
              :data="adTypeTableData"
              :columns="adTypeColumns"
              row-key="adTypeName"
              :stripe="false"
              :border="false"
              size="default"
              :pagination="undefined"
            />
          </div>
        </ElCard>
        <ElCard class="iaa-panel" shadow="never">
          <template #header>
            <span>广告平台效果排行</span>
          </template>
          <div ref="platformBarRef" class="iaa-chart iaa-chart--bar"></div>
        </ElCard>
        <ElCard class="iaa-panel" shadow="never">
          <template #header>
            <span>广告位 Top10 收入</span>
          </template>
          <div class="iaa-top10-list">
            <div v-for="(item, i) in placementTop10" :key="item.name" class="iaa-top10-item">
              <span class="iaa-top10-rank">{{ i + 1 }}</span>
              <span class="iaa-top10-name">{{ item.name }}</span>
              <span class="iaa-top10-value">${{ item.revenue.toFixed(2) }}</span>
              <div class="iaa-top10-bar">
                <div class="iaa-top10-bar__fill" :style="{ width: item.percent + '%' }" />
              </div>
              <span class="iaa-top10-pct">{{ item.percent.toFixed(1) }}%</span>
            </div>
          </div>
        </ElCard>
      </div>
      <div class="iaa-main-right">
        <ElCard class="iaa-panel" shadow="never">
          <template #header>
            <span>广告类型趋势(近7天)</span>
          </template>
          <div ref="trendChartRef" class="iaa-chart iaa-chart--line"></div>
        </ElCard>
        <ElCard class="iaa-panel" shadow="never">
          <template #header>
            <span>用户拆分分析(安装天数)</span>
          </template>
          <div ref="userBreakdownRef" class="iaa-chart iaa-chart--bar"></div>
          <div class="iaa-insight-banner">
            新用户(0天)广告收入 $228.29 (8.2%)，老用户为核心变现群体
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
  import type { IaaFilterState, IaaKpiCard, IaaAdTypeCompareRow } from '../types'

  defineOptions({ name: 'IaaTabAdType' })

  defineProps<{ filter: IaaFilterState }>()

  const kpis = ref<IaaKpiCard[]>([
    {
      id: '1',
      title: '广告总收入',
      primaryValue: '$2,768.58',
      subText: '真实 $1,861.23',
      accent: 'teal'
    },
    {
      id: '2',
      title: '广告用户渗透率',
      primaryValue: '68.6%',
      subText: '117,483/171,334 DAU',
      accent: 'default'
    },
    {
      id: '3',
      title: '人均展示次数',
      primaryValue: '4.9次',
      subText: '广告展示 833,597',
      accent: 'default'
    },
    {
      id: '4',
      title: 'ECPM',
      primaryValue: '3.32 (预估) / 3.06 (真实)',
      subText: '偏差 +8.5%',
      accent: 'default'
    }
  ])

  const adTypeTableData = ref<IaaAdTypeCompareRow[]>([
    {
      adTypeName: '插页式',
      revenue: 2014,
      revenueShare: 72.8,
      users: 95000,
      ecpm: 3.8,
      impressions: 530000
    },
    {
      adTypeName: '原生',
      revenue: 484,
      revenueShare: 17.5,
      users: 88000,
      ecpm: 2.2,
      impressions: 220000
    },
    {
      adTypeName: '横幅',
      revenue: 191,
      revenueShare: 6.9,
      users: 102000,
      ecpm: 0.9,
      impressions: 212000
    },
    {
      adTypeName: '开屏',
      revenue: 79,
      revenueShare: 2.9,
      users: 65000,
      ecpm: 1.2,
      impressions: 66000
    }
  ])

  const placementTop10 = ref([
    { name: 'Splash', revenue: 1452, percent: 52.4 },
    { name: 'HomeResume', revenue: 446, percent: 16.1 },
    { name: 'Native_AdMainWall', revenue: 332, percent: 12.0 },
    { name: 'Interstitial_LevelEnd', revenue: 221, percent: 8.0 },
    { name: 'Banner_Home', revenue: 166, percent: 6.0 }
  ])

  const adTypeColumns = computed<ColumnOption[]>(() => [
    { prop: 'adTypeName', label: '名称', minWidth: 90 },
    {
      prop: 'revenue',
      label: '收入',
      minWidth: 90,
      formatter: (r: IaaAdTypeCompareRow) => `$${r.revenue}`
    },
    {
      prop: 'revenueShare',
      label: '%',
      minWidth: 64,
      formatter: (r: IaaAdTypeCompareRow) => `${r.revenueShare}%`
    },
    {
      prop: 'users',
      label: '用户',
      minWidth: 80,
      formatter: (r: IaaAdTypeCompareRow) => r.users.toLocaleString()
    },
    {
      prop: 'ecpm',
      label: 'ECPM',
      minWidth: 72,
      formatter: (r: IaaAdTypeCompareRow) => r.ecpm.toFixed(2)
    },
    {
      prop: 'impressions',
      label: '展示',
      minWidth: 90,
      formatter: (r: IaaAdTypeCompareRow) => r.impressions.toLocaleString()
    }
  ])

  const useRadar = useChart()
  const usePlatformBar = useChart()
  const useTrend = useChart()
  const useUserBreakdown = useChart()
  const radarChartRef = useRadar.chartRef
  const platformBarRef = usePlatformBar.chartRef
  const trendChartRef = useTrend.chartRef
  const userBreakdownRef = useUserBreakdown.chartRef

  function buildRadarOption(): EChartsOption {
    const maxRevenue = Math.max(...adTypeTableData.value.map((r) => r.revenue))
    const indicators = adTypeTableData.value.map((r) => ({
      name: r.adTypeName,
      max: maxRevenue * 1.2
    }))
    const values = adTypeTableData.value.map((r) => r.revenue)
    return {
      radar: { indicator: indicators, center: ['50%', '55%'], radius: '68%' },
      series: [
        {
          type: 'radar',
          data: [
            { value: values, name: '收入', areaStyle: { opacity: 0.3 }, lineStyle: { width: 2 } }
          ]
        }
      ]
    }
  }

  function buildPlatformBarOption(): EChartsOption {
    const names = ['Admob', 'Facebook', 'Applovin', 'Vungle', 'Pangle', 'Mintegral']
    const revenues = [1985, 257, 166, 198, 98, 62]
    return {
      grid: { left: 56, right: 24, top: 16, bottom: 48 },
      xAxis: { type: 'category', data: names },
      yAxis: { type: 'value' },
      series: [{ type: 'bar', data: revenues, itemStyle: { color: '#26C2AD' }, barMaxWidth: 32 }]
    }
  }

  const trend7dDates = ['02-27', '02-29', '03-01', '03-02', '03-03', '03-04', '03-05']
  function buildTrendOption(): EChartsOption {
    return {
      grid: { left: 48, right: 24, top: 16, bottom: 28 },
      tooltip: { trigger: 'axis' },
      legend: { data: ['插页式', '原生', '横幅', '开屏'], bottom: 0 },
      xAxis: { type: 'category', data: trend7dDates },
      yAxis: { type: 'value' },
      series: [
        {
          name: '插页式',
          type: 'line',
          stack: 'total',
          data: [580, 620, 590, 650, 680, 700, 720],
          areaStyle: {},
          itemStyle: { color: '#3B82F6' }
        },
        {
          name: '原生',
          type: 'line',
          stack: 'total',
          data: [120, 135, 128, 142, 138, 145, 148],
          areaStyle: {},
          itemStyle: { color: '#10B981' }
        },
        {
          name: '横幅',
          type: 'line',
          stack: 'total',
          data: [50, 52, 48, 55, 58, 60, 62],
          areaStyle: {},
          itemStyle: { color: '#8B5CF6' }
        },
        {
          name: '开屏',
          type: 'line',
          stack: 'total',
          data: [20, 22, 21, 23, 24, 25, 26],
          areaStyle: {},
          itemStyle: { color: '#F59E0B' }
        }
      ]
    }
  }

  function buildUserBreakdownOption(): EChartsOption {
    const categories = [
      '0天',
      '1天',
      '2-7天',
      '8-30天',
      '31-90天',
      '91-180天',
      '181-360天',
      '360+天'
    ]
    const revenue = [228, 185, 312, 398, 425, 380, 440, 1380]
    const users = [12000, 9500, 18000, 22000, 24000, 21000, 23000, 85000]
    return {
      grid: { left: 56, right: 48, top: 16, bottom: 28 },
      tooltip: { trigger: 'axis' },
      legend: { data: ['广告收入', '活动性用户'], bottom: 0 },
      xAxis: { type: 'category', data: categories },
      yAxis: [
        { type: 'value', name: '收入' },
        { type: 'value', name: '用户' }
      ],
      series: [
        { name: '广告收入', type: 'bar', data: revenue, itemStyle: { color: '#3B82F6' } },
        {
          name: '活动性用户',
          type: 'bar',
          data: users,
          yAxisIndex: 1,
          itemStyle: { color: '#10B981', borderColor: '#10B981' }
        }
      ]
    }
  }

  onMounted(() => {
    useRadar.initChart(buildRadarOption())
    usePlatformBar.initChart(buildPlatformBarOption())
    useTrend.initChart(buildTrendOption())
    useUserBreakdown.initChart(buildUserBreakdownOption())
  })
</script>

<style scoped lang="scss">
  .iaa-tab-ad-type {
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
      padding: 12px 16px;
      font-size: 14px;
      border-bottom: 1px solid var(--default-border);
    }

    :deep(.el-card__body) {
      padding: 16px;
    }
  }

  .iaa-ad-type-row {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 16px;
  }

  .iaa-chart {
    width: 100%;
    height: 240px;

    &--radar {
      height: 260px;
    }

    &--bar {
      height: 280px;
    }

    &--line {
      height: 220px;
    }
  }

  .iaa-top10-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .iaa-top10-item {
    display: grid;
    grid-template-columns: 28px 1fr 80px 100px 48px;
    gap: 8px;
    align-items: center;
    font-size: 12px;
  }

  .iaa-top10-rank {
    color: var(--art-gray-600);
  }

  .iaa-top10-name {
    color: var(--art-gray-900);
  }

  .iaa-top10-value {
    color: var(--art-primary);
  }

  .iaa-top10-bar {
    height: 8px;
    overflow: hidden;
    background: var(--default-border);
    border-radius: 4px;
  }

  .iaa-top10-bar__fill {
    height: 100%;
    background: var(--art-primary);
    border-radius: 4px;
  }

  .iaa-top10-pct {
    font-size: 11px;
    color: var(--art-gray-600);
  }

  .iaa-insight-banner {
    padding: 10px 12px;
    margin-top: 12px;
    font-size: 12px;
    background: rgb(38 194 173 / 15%);
    border: 1px solid rgb(38 194 173 / 30%);
    border-radius: 8px;
  }
</style>
