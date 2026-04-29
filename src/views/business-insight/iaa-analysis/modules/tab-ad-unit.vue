<template>
  <div class="iaa-tab-content iaa-tab-ad-unit">
    <section class="iaa-main-grid">
      <div class="iaa-main-left">
        <!-- KPI 卡片行：属于左栏 -->
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

        <ElCard class="iaa-panel iaa-neon-panel iaa-panel--scatter-full" shadow="never">
          <template #header>
            <span>广告单元 Top15 收入表</span>
            <div class="iaa-unit-filters">
              <div class="iaa-filter-item">
                <span class="iaa-filter-label">广告平台</span>
                <ElSelect
                  v-model="localFilter.source"
                  size="small"
                  class="iaa-filter-select"
                  popper-class="iaa-select__popper"
                >
                  <ElOption
                    v-for="opt in sourceOptions"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </ElSelect>
              </div>
              <div class="iaa-filter-item">
                <span class="iaa-filter-label">广告位</span>
                <ElSelect
                  v-model="localFilter.placement"
                  size="small"
                  class="iaa-filter-select"
                  popper-class="iaa-select__popper"
                >
                  <ElOption
                    v-for="opt in placementOptions"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </ElSelect>
              </div>
              <div class="iaa-filter-item">
                <span class="iaa-filter-label">广告类型</span>
                <ElSelect
                  v-model="localFilter.adType"
                  size="small"
                  class="iaa-filter-select"
                  popper-class="iaa-select__popper"
                >
                  <ElOption
                    v-for="opt in adTypeOptions"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </ElSelect>
              </div>
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
          <div v-if="loading" class="iaa-chart-sk iaa-chart-sk--line"></div>
          <ArtTable
            v-else-if="hasTableData"
            :data="tableData"
            :columns="tableColumns"
            row-key="s_ad_unit_id"
            :stripe="false"
            :border="false"
            size="default"
            :show-table-header="false"
            :pagination="pagination"
            :pagination-options="{ align: 'right', pageSizes: [10, 15], size: 'small' }"
            @pagination:current-change="onPageChange"
            @pagination:size-change="onSizeChange"
          >
            <template #status="{ row }">
              <span class="iaa-unit-status" :class="row.status">
                <span v-if="row.status === 'normal'" class="iaa-status-dot"></span>
                <ElIcon v-else class="iaa-status-warn"><WarningFilled /></ElIcon>
                {{ row.status === 'normal' ? '正常' : '偏低' }}
              </span>
            </template>
          </ArtTable>
          <ElEmpty v-else class="iaa-panel-empty" description="暂无数据" />
        </ElCard> </div
      ><!-- iaa-main-left -->
      <div class="iaa-main-right">
        <!--
        <ElCard class="iaa-panel iaa-neon-panel" shadow="never">
          <template #header>
            <span>广告单元充填率分布</span>
          </template>
          <div v-if="loading" class="iaa-chart-sk iaa-chart-sk--bar"></div>
          <div v-else ref="fillRateChartRef" class="iaa-chart iaa-chart--bar"></div>
          <div v-if="fillRateInsight" class="iaa-insight-banner">
            <ElIcon><WarningFilled /></ElIcon>
            {{ fillRateInsight }}
          </div>
        </ElCard>
        -->
        <ElCard class="iaa-panel iaa-neon-panel" shadow="never">
          <template #header>
            <span>广告单元 ECPM 对比</span>
          </template>
          <div v-if="loading" class="iaa-chart-sk iaa-chart-sk--line"></div>
          <div
            v-else-if="hasScatterData"
            ref="scatterChartRef"
            class="iaa-chart iaa-chart--scatter"
          ></div>
          <ElEmpty v-else class="iaa-panel-empty iaa-panel-empty--scatter" description="暂无数据" />
        </ElCard>
        <ElCard class="iaa-panel iaa-neon-panel" shadow="never">
          <template #header>
            <span>广告单元收入趋势(近7天)</span>
          </template>
          <div v-if="loading" class="iaa-chart-sk iaa-chart-sk--line"></div>
          <div v-else-if="hasTrendData" ref="trendChartRef" class="iaa-chart iaa-chart--line"></div>
          <ElEmpty v-else class="iaa-panel-empty iaa-panel-empty--line" description="暂无数据" />
        </ElCard>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, reactive, onMounted, watch, nextTick } from 'vue'
  import { Search, WarningFilled } from '@element-plus/icons-vue'
  import { useChart } from '@/hooks/core/useChart'
  import type { EChartsOption } from '@/plugins/echarts'
  import type { ColumnOption } from '@/types'
  import type { IaaFilterState, IaaAdUnitTabData, IaaAdUnitTableRow } from '../types'
  import { fetchIaaAdUnitTabData } from '@/api/business-insight'
  import { useIaaPageLoading } from '../composables/useIaaPageLoading'

  defineOptions({ name: 'IaaTabAdUnit' })

  const props = defineProps<{ filter: IaaFilterState }>()

  const loading = ref(false)
  const pageLoading = useIaaPageLoading()

  watch(loading, (v) => {
    pageLoading?.setTabLoading('adUnit', v)
  })

  onMounted(() => {
    pageLoading?.setTabLoading('adUnit', loading.value)
  })

  const localFilter = reactive({ source: 'all', placement: 'all', adType: 'all', keyword: '' })

  const tabData = ref<IaaAdUnitTabData | null>(null)

  const kpis = computed(() => tabData.value?.kpis ?? [])

  const allRows = computed(() => tabData.value?.tableRows ?? [])

  const sourceOptions = computed(() => {
    const unique = [...new Set(allRows.value.map((r) => r.sourceName))].sort()
    return [{ label: '全部', value: 'all' }, ...unique.map((s) => ({ label: s, value: s }))]
  })

  const placementOptions = computed(() => {
    const unique = [...new Set(allRows.value.map((r) => r.placementName))].sort()
    return [{ label: '全部', value: 'all' }, ...unique.map((p) => ({ label: p, value: p }))]
  })

  const adTypeOptions = computed(() => {
    const unique = [...new Set(allRows.value.map((r) => r.adTypeName))]
    return [{ label: '全部', value: 'all' }, ...unique.map((t) => ({ label: t, value: t }))]
  })

  const filteredRows = computed(() => {
    const kw = localFilter.keyword.toLowerCase()
    return allRows.value.filter((r) => {
      const matchSrc = localFilter.source === 'all' || r.sourceName === localFilter.source
      const matchPlacement =
        localFilter.placement === 'all' || r.placementName === localFilter.placement
      const matchAdType = localFilter.adType === 'all' || r.adTypeName === localFilter.adType
      const matchKw =
        !kw ||
        r.s_ad_unit_id.toLowerCase().includes(kw) ||
        r.placementName.toLowerCase().includes(kw)
      return matchSrc && matchPlacement && matchAdType && matchKw
    })
  })
  const hasTableData = computed(() => filteredRows.value.length > 0)
  const hasScatterData = computed(() => (tabData.value?.scatterData?.length ?? 0) > 0)
  const hasTrendData = computed(() => {
    const trend = tabData.value?.trend7d
    if (!trend || trend.dates.length === 0) return false
    return trend.series.some((item) => Array.isArray(item.data) && item.data.length > 0)
  })

  const pagination = reactive({ current: 1, size: 10, total: 0 })

  watch(filteredRows, (rows) => {
    pagination.total = rows.length
    pagination.current = 1
  })

  const tableData = computed(() => {
    const start = (pagination.current - 1) * pagination.size
    return filteredRows.value.slice(start, start + pagination.size)
  })

  function onPageChange(page: number) {
    pagination.current = page
  }

  function onSizeChange(size: number) {
    pagination.size = size
    pagination.current = 1
  }

  const tableColumns = computed<ColumnOption[]>(() => [
    { prop: 's_ad_unit_id', label: '广告单元ID', minWidth: 140, showOverflowTooltip: true },
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
    { prop: 'status', label: '状态', minWidth: 72, useSlot: true, slotName: 'status' }
  ])

  const AD_TYPE_COLORS: Record<string, string> = {
    开屏: '#26C2AD',
    插页式: '#3B82F6',
    原生: '#8B5CF6',
    横幅: '#F59E0B'
  }

  const useScatter = useChart()
  const useTrend = useChart()
  const scatterChartRef = useScatter.chartRef
  const trendChartRef = useTrend.chartRef

  function buildScatterOption(): EChartsOption {
    const ecpmData = tabData.value?.scatterData ?? []
    const sortedData = [...ecpmData].sort((a, b) => b.ecpm - a.ecpm)
    return {
      backgroundColor: 'transparent',
      grid: { left: 132, right: 24, top: 16, bottom: 28 },
      tooltip: {
        trigger: 'item',
        backgroundColor: '#1e293b',
        borderColor: '#334155',
        textStyle: { color: '#f1f5f9' },
        formatter: (params: any) => {
          const d = params?.data as { unitId?: string; ecpm?: number; adType?: string } | undefined
          if (!d) return ''
          const ecpmText = typeof d.ecpm === 'number' ? d.ecpm.toFixed(2) : '-'
          return `${d.unitId ?? '-'}\n广告类型: ${d.adType ?? '-'}\nECPM: ${ecpmText}`
        }
      },
      xAxis: {
        type: 'value',
        name: 'ECPM',
        nameTextStyle: { color: '#64748b' },
        axisLabel: { color: '#94a3b8', fontSize: 10 },
        splitLine: { lineStyle: { color: '#1e293b', type: 'dashed' } }
      },
      yAxis: {
        type: 'category',
        data: sortedData.map((item) => item.unitId),
        nameTextStyle: { color: '#64748b' },
        axisLabel: {
          color: '#94a3b8',
          fontSize: 10,
          width: 116,
          overflow: 'truncate'
        },
        splitLine: { lineStyle: { color: '#1e293b', type: 'dashed' } }
      },
      series: [
        {
          type: 'bar',
          data: sortedData.map((item) => ({
            value: item.ecpm,
            unitId: item.unitId,
            adType: item.adType,
            itemStyle: { color: AD_TYPE_COLORS[item.adType] ?? '#94A3B8' }
          })),
          barMaxWidth: 16,
          label: {
            show: true,
            position: 'right',
            color: '#94a3b8',
            fontSize: 10,
            formatter: (p: any) => (typeof p?.value === 'number' ? p.value.toFixed(2) : '')
          }
        }
      ]
    }
  }

  function buildTrendOption(): EChartsOption {
    const { dates, series } = tabData.value?.trend7d ?? { dates: [], series: [] }
    return {
      backgroundColor: 'transparent',
      grid: { left: 56, right: 48, top: 16, bottom: 170 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1e293b',
        borderColor: '#334155',
        textStyle: { color: '#f1f5f9' }
      },
      legend: {
        data: series.map((s) => s.name),
        bottom: 8,
        left: 8,
        right: 8,
        itemWidth: 10,
        itemHeight: 10,
        itemGap: 8,
        textStyle: { color: '#64748b', fontSize: 10 }
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLabel: { color: '#64748b', fontSize: 10 },
        axisLine: { lineStyle: { color: '#1e293b' } }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#64748b', fontSize: 10, formatter: '${value}' },
        splitLine: { lineStyle: { color: '#1e293b', type: 'dashed' } }
      },
      series: series.map((s) => ({
        name: s.name,
        type: 'line' as const,
        data: s.data,
        smooth: true,
        symbol: 'circle',
        symbolSize: 5,
        lineStyle: { color: s.color, width: 2 },
        itemStyle: { color: s.color }
      }))
    }
  }

  function refreshCharts() {
    if (!tabData.value) return
    if (hasScatterData.value) {
      useScatter.updateChart(buildScatterOption())
    } else {
      useScatter.destroyChart()
    }
    if (hasTrendData.value) {
      useTrend.updateChart(buildTrendOption())
    } else {
      useTrend.destroyChart()
    }
    // 卡片高度在布局完成后会再次变化，补一次 resize 确保图表真正铺满 card-body
    requestAnimationFrame(() => {
      if (hasScatterData.value) useScatter.handleResize()
      if (hasTrendData.value) useTrend.handleResize()
      requestAnimationFrame(() => {
        if (hasScatterData.value) useScatter.handleResize()
        if (hasTrendData.value) useTrend.handleResize()
      })
    })
  }

  async function loadTabData() {
    if (!props.filter?.s_app_id) {
      loading.value = false
      tabData.value = null
      return
    }
    loading.value = true
    try {
      tabData.value = await fetchIaaAdUnitTabData(props.filter)
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

  .iaa-tab-ad-unit {
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
    grid-template-columns: 1fr minmax(0, 380px);
    gap: 16px;
    min-height: 0;
  }

  .iaa-main-left {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-width: 0;
    min-height: 0;
  }

  .iaa-main-right {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-self: stretch;
    min-width: 0;
    min-height: 650px;

    .iaa-panel {
      flex: 1;
      min-height: 0;
    }
  }

  .iaa-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--default-box-color);
    border: 1px solid var(--default-border);

    :deep(.el-card__header) {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
      justify-content: space-between;
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

  .iaa-unit-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  .iaa-filter-item {
    display: inline-flex;
    gap: 0;
    align-items: center;
    padding: 0 8px 0 10px;
    background: var(--default-bg-color);
    border: 1px solid var(--default-border);
    border-radius: 6px;
  }

  .iaa-filter-label {
    margin-right: 2px;
    font-size: 12px;
    color: var(--art-gray-600);
    white-space: nowrap;
  }

  .iaa-filter-select {
    width: 72px;

    :deep(.el-input__wrapper) {
      padding: 0 4px;
      background: transparent;
      box-shadow: none;
    }
  }

  .iaa-filter-search {
    width: 140px;
  }

  .iaa-chart {
    flex: 1;
    width: 100%;
    height: 100%;
    min-height: 0;

    &--bar {
      min-height: 180px;
    }

    &--scatter {
      min-height: 220px;
    }

    &--line {
      min-height: 160px;
    }
  }

  .iaa-panel-empty {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    min-height: 140px;
  }

  .iaa-panel-empty--scatter {
    min-height: 220px;
  }

  .iaa-panel-empty--line {
    min-height: 160px;
  }

  .iaa-panel--scatter-full {
    :deep(.el-card__body) {
      padding: 0;
    }

    .iaa-chart--scatter {
      height: 100%;
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
    color: #f59e0b;
    background: rgb(245 158 11 / 12%);
    border: 1px solid rgb(245 158 11 / 28%);
    border-radius: 6px;
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
