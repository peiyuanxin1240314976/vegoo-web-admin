<template>
  <div class="iaa-tab-content iaa-tab-ad-unit">
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
            <span>广告单元 Top15 收入表</span>
            <div class="iaa-unit-filters">
              <ElSelect
                v-model="localFilter.source"
                placeholder="广告平台"
                size="small"
                class="iaa-filter-select"
              >
                <ElOption label="Admob" value="admob" />
                <ElOption label="全部" value="all" />
              </ElSelect>
              <ElSelect
                v-model="localFilter.placement"
                placeholder="广告位"
                size="small"
                class="iaa-filter-select"
              >
                <ElOption label="全部" value="all" />
              </ElSelect>
              <ElSelect
                v-model="localFilter.adType"
                placeholder="广告类型"
                size="small"
                class="iaa-filter-select"
              >
                <ElOption label="全部" value="all" />
              </ElSelect>
              <ElInput
                v-model="localFilter.keyword"
                placeholder="搜索"
                size="small"
                clearable
                class="iaa-filter-search"
              >
                <template #prefix
                  ><ElIcon><Search /></ElIcon
                ></template>
              </ElInput>
            </div>
          </template>
          <ArtTable
            :data="tableData"
            :columns="tableColumns"
            row-key="s_ad_unit_id"
            :stripe="false"
            :border="false"
            size="default"
            :pagination="undefined"
          >
            <template #status="{ row }">
              <span class="iaa-unit-status" :class="row.status">
                <span v-if="row.status === 'normal'" class="iaa-status-dot"></span>
                <ElIcon v-else class="iaa-status-warn"><WarningFilled /></ElIcon>
                {{ row.status === 'normal' ? '正常' : '偏低' }}
              </span>
            </template>
          </ArtTable>
        </ElCard>
      </div>
      <div class="iaa-main-right">
        <ElCard class="iaa-panel" shadow="never">
          <template #header>
            <span>广告单元充填率分布</span>
          </template>
          <div ref="fillRateChartRef" class="iaa-chart iaa-chart--bar"></div>
          <div class="iaa-insight-banner iaa-insight-banner--amber">
            12个单元充填率&lt;80%，建议检查广告位设置
          </div>
        </ElCard>
        <ElCard class="iaa-panel" shadow="never">
          <template #header>
            <span>广告单元ECPM vs 充填率关联分析</span>
          </template>
          <div ref="scatterChartRef" class="iaa-chart iaa-chart--scatter"></div>
        </ElCard>
        <ElCard class="iaa-panel" shadow="never">
          <template #header>
            <span>广告单元收入趋势(近7天)</span>
          </template>
          <div ref="trendChartRef" class="iaa-chart iaa-chart--line"></div>
        </ElCard>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, reactive, onMounted } from 'vue'
  import { Search, WarningFilled } from '@element-plus/icons-vue'
  import { useChart } from '@/hooks/core/useChart'
  import type { EChartsOption } from '@/plugins/echarts'
  import type { ColumnOption } from '@/types'
  import type { IaaFilterState, IaaKpiCard, IaaAdUnitTableRow } from '../types'

  defineOptions({ name: 'IaaTabAdUnit' })

  defineProps<{ filter: IaaFilterState }>()

  const localFilter = reactive({ source: 'all', placement: 'all', adType: 'all', keyword: '' })

  const kpis = ref<IaaKpiCard[]>([
    {
      id: '1',
      title: '广告单元总数',
      primaryValue: '284个',
      subText: '已开启256个 | 关闭28个',
      accent: 'default'
    },
    {
      id: '2',
      title: '广告单元总收入',
      primaryValue: '$2,768.58',
      subText: '平均每单元$10.81',
      accent: 'teal'
    },
    {
      id: '3',
      title: '广告单元平均ECPM',
      primaryValue: '3.32',
      subText: 'Top单元: Splash_Admob_001 ECPM 19.2',
      accent: 'teal'
    },
    {
      id: '4',
      title: '广告单元充填率',
      primaryValue: '94.8%',
      subText: '充填率较差(<80%): 12个',
      accent: 'amber'
    }
  ])

  const tableData = ref<IaaAdUnitTableRow[]>([
    {
      s_ad_unit_id: 'Splash_Admob_001',
      placementName: 'Splash',
      adTypeName: '开屏',
      sourceName: 'Admob',
      revenue: 520,
      ecpmEst: 19.2,
      ecpmReal: 18.5,
      impressions: 27000,
      fillRate: 98,
      status: 'normal'
    },
    {
      s_ad_unit_id: 'HomeResume_Admob_001',
      placementName: 'HomeResume',
      adTypeName: '插页式',
      sourceName: 'Admob',
      revenue: 446,
      ecpmEst: 4.7,
      ecpmReal: 4.5,
      impressions: 95000,
      fillRate: 95,
      status: 'normal'
    },
    {
      s_ad_unit_id: 'Native_FB_002',
      placementName: 'Native_AdMainWall',
      adTypeName: '原生',
      sourceName: 'Facebook',
      revenue: 332,
      ecpmEst: 2.77,
      ecpmReal: 2.6,
      impressions: 120000,
      fillRate: 92,
      status: 'normal'
    },
    {
      s_ad_unit_id: 'Banner_Admob_003',
      placementName: 'Banner_Home',
      adTypeName: '横幅',
      sourceName: 'Admob',
      revenue: 88,
      ecpmEst: 0.9,
      ecpmReal: 0.85,
      impressions: 98000,
      fillRate: 76,
      status: 'low'
    }
  ])

  const tableColumns = computed<ColumnOption[]>(() => [
    { prop: 's_ad_unit_id', label: '广告单元ID', minWidth: 140 },
    { prop: 'placementName', label: '广告位', minWidth: 120 },
    { prop: 'adTypeName', label: '广告类型', minWidth: 88 },
    { prop: 'sourceName', label: '平台', minWidth: 88 },
    {
      prop: 'revenue',
      label: '收入',
      minWidth: 88,
      formatter: (r: IaaAdUnitTableRow) => `$${r.revenue.toFixed(2)}`
    },
    {
      prop: 'ecpmEst',
      label: 'ECPM(预)',
      minWidth: 80,
      formatter: (r: IaaAdUnitTableRow) => r.ecpmEst.toFixed(2)
    },
    {
      prop: 'ecpmReal',
      label: 'ECPM(真)',
      minWidth: 80,
      formatter: (r: IaaAdUnitTableRow) => r.ecpmReal.toFixed(2)
    },
    {
      prop: 'impressions',
      label: '展示次数',
      minWidth: 90,
      formatter: (r: IaaAdUnitTableRow) => r.impressions.toLocaleString()
    },
    {
      prop: 'fillRate',
      label: '充填率',
      minWidth: 72,
      formatter: (r: IaaAdUnitTableRow) => `${r.fillRate}%`
    },
    { prop: 'status', label: '状态', minWidth: 72, useSlot: true, slotName: 'status' }
  ])

  const fillRateBuckets = [
    { range: '<70%', count: 2 },
    { range: '70-80%', count: 10 },
    { range: '80-90%', count: 45 },
    { range: '90-95%', count: 120 },
    { range: '>95%', count: 107 }
  ]
  const FILL_RATE_COLORS = ['#EF4444', '#F59E0B', '#EAB308', '#26C2AD', '#0D9488']

  const useFillRate = useChart()
  const useScatter = useChart()
  const useTrend = useChart()
  const fillRateChartRef = useFillRate.chartRef
  const scatterChartRef = useScatter.chartRef
  const trendChartRef = useTrend.chartRef

  function buildFillRateOption(): EChartsOption {
    return {
      grid: { left: 72, right: 24, top: 16, bottom: 40 },
      xAxis: { type: 'category', data: fillRateBuckets.map((b) => b.range) },
      yAxis: { type: 'value' },
      series: [
        {
          type: 'bar',
          data: fillRateBuckets.map((b, i) => ({
            value: b.count,
            itemStyle: { color: FILL_RATE_COLORS[i] }
          })),
          barMaxWidth: 36
        }
      ]
    }
  }

  function buildScatterOption(): EChartsOption {
    return {
      grid: { left: 56, right: 24, top: 16, bottom: 32 },
      xAxis: { type: 'value', name: 'ECPM', min: 0, max: 20 },
      yAxis: { type: 'value', name: '充填率%', min: 60, max: 100 },
      legend: { data: ['插页式', '原生', '横幅'], bottom: 0 },
      series: [
        {
          name: '插页式',
          type: 'scatter',
          data: [
            [19.2, 98],
            [4.7, 95]
          ],
          symbolSize: 12,
          itemStyle: { color: '#26C2AD' }
        },
        {
          name: '原生',
          type: 'scatter',
          data: [[2.77, 92]],
          symbolSize: 12,
          itemStyle: { color: '#3B82F6' }
        },
        {
          name: '横幅',
          type: 'scatter',
          data: [[0.85, 76]],
          symbolSize: 12,
          itemStyle: { color: '#F59E0B' }
        }
      ]
    }
  }

  function buildTrendOption(): EChartsOption {
    const dates = ['02-27', '02-29', '03-01', '03-02', '03-03', '03-04', '03-05']
    return {
      grid: { left: 48, right: 48, top: 16, bottom: 28 },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: dates },
      yAxis: { type: 'value' },
      legend: { data: ['单元A', '单元B', '单元C'], bottom: 0 },
      series: [
        {
          name: '单元A',
          type: 'line',
          data: [98, 99, 98.5, 99.2, 98.4, 99, 98.4],
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: { color: '#26C2AD' }
        },
        {
          name: '单元B',
          type: 'line',
          data: [23, 25, 24, 26, 23.8, 25.2, 23.8],
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: { color: '#3B82F6' }
        },
        {
          name: '单元C',
          type: 'line',
          data: [18, 19, 18.5, 20, 19.2, 19.5, 18.8],
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: { color: '#8B5CF6' }
        }
      ]
    }
  }

  onMounted(() => {
    useFillRate.initChart(buildFillRateOption())
    useScatter.initChart(buildScatterOption())
    useTrend.initChart(buildTrendOption())
  })
</script>

<style scoped lang="scss">
  .iaa-tab-ad-unit {
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
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
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

  .iaa-unit-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  .iaa-filter-select {
    width: 120px;
  }

  .iaa-filter-search {
    width: 140px;
  }

  .iaa-chart {
    width: 100%;
    height: 240px;
  }

  .iaa-chart--scatter {
    height: 260px;
  }

  .iaa-insight-banner {
    padding: 10px 12px;
    margin-top: 12px;
    font-size: 12px;
    background: rgb(245 158 11 / 15%);
    border: 1px solid rgb(245 158 11 / 30%);
    border-radius: 8px;
  }

  .iaa-unit-status {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    font-size: 12px;
  }

  .iaa-status-dot {
    width: 6px;
    height: 6px;
    background: var(--art-success);
    border-radius: 50%;
  }

  .iaa-status-warn {
    font-size: 14px;
    color: var(--art-warning);
  }

  .iaa-unit-status.low {
    color: var(--art-warning);
  }
</style>
