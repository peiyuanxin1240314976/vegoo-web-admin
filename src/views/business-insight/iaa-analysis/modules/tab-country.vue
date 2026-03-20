<template>
  <div class="iaa-tab-content iaa-tab-country">
    <section class="iaa-main-grid">
      <div class="iaa-main-left">
        <div class="iaa-kpi-grid">
          <article v-for="k in kpis" :key="k.id" class="iaa-kpi" :data-accent="k.accent">
            <div class="iaa-kpi__title">{{ k.title }}</div>
            <div class="iaa-kpi__value">{{ k.primaryValue }}</div>
            <div class="iaa-kpi__sub">{{ k.subText }}</div>
          </article>
        </div>

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
            size="small"
            :show-table-header="false"
            :pagination="pagination"
            :pagination-options="{ align: 'right', pageSizes: [8, 15], size: 'small' }"
            @pagination:current-change="onPageChange"
            @pagination:size-change="onSizeChange"
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
  import { ref, computed, reactive, onMounted, watch, nextTick } from 'vue'
  import { useChart } from '@/hooks/core/useChart'
  import { echarts, type EChartsOption } from '@/plugins/echarts'
  import type { ColumnOption } from '@/types'
  import type { IaaFilterState, IaaCountryTabData, IaaCountryTableRow } from '../types'
  import { fetchIaaCountryTabData } from '@/api/business-insight'
  import 'flag-icons/css/flag-icons.min.css'

  const WORLD_JSON_URL = `${import.meta.env.BASE_URL}geo/world.json`
  let mapRegistered = false
  async function ensureMapRegistered() {
    if (mapRegistered) return
    const res = await fetch(WORLD_JSON_URL)
    const geoJson = await res.json()
    echarts.registerMap('world', geoJson)
    mapRegistered = true
  }

  defineOptions({ name: 'IaaTabCountry' })

  const props = defineProps<{ filter: IaaFilterState }>()

  const tabData = ref<IaaCountryTabData | null>(null)

  const kpis = computed(() => tabData.value?.kpis ?? [])
  const allRows = computed(() => tabData.value?.tableRows ?? [])

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
    { prop: 'rank', label: '#', width: 40 },
    { prop: 's_country_name', label: '国家', minWidth: 90, useSlot: true, slotName: 'country' },
    {
      prop: 'revenue',
      label: '收入',
      minWidth: 80,
      formatter: (r: IaaCountryTableRow) => `$${r.revenue.toFixed(0)}`
    },
    {
      prop: 'revenueShare',
      label: '占比',
      minWidth: 60,
      formatter: (r: IaaCountryTableRow) => `${r.revenueShare}%`
    },
    {
      prop: 'ecpmEst',
      label: 'ECPM预',
      minWidth: 68,
      formatter: (r: IaaCountryTableRow) => r.ecpmEst.toFixed(2)
    },
    {
      prop: 'ecpmReal',
      label: 'ECPM真',
      minWidth: 68,
      formatter: (r: IaaCountryTableRow) => r.ecpmReal.toFixed(2)
    },
    {
      prop: 'impressions',
      label: '展示数',
      minWidth: 72,
      formatter: (r: IaaCountryTableRow) => r.impressions.toLocaleString()
    },
    {
      prop: 'adUsers',
      label: '广告用户',
      minWidth: 72,
      formatter: (r: IaaCountryTableRow) => r.adUsers.toLocaleString()
    },
    {
      prop: 'arpdau',
      label: 'ARPDAU',
      minWidth: 72,
      formatter: (r: IaaCountryTableRow) => r.arpdau.toFixed(4)
    },
    { prop: 'trend', label: '环比', minWidth: 64, useSlot: true, slotName: 'trend' }
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
    const mapData = tabData.value?.mapData ?? []
    const values = mapData.map((d) => d.value).filter((v) => Number.isFinite(v))
    const dataMin = values.length ? Math.min(...values) : 0
    const dataMax = values.length ? Math.max(...values) : 10

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(15,23,42,0.92)',
        borderColor: 'rgba(38,194,173,0.4)',
        borderWidth: 1,
        padding: [10, 14],
        textStyle: { color: '#f1f5f9', fontSize: 12 },
        formatter: (params: any) => {
          const item = mapData.find((d) => d.name === params.name)
          if (!item) return `<div style="color:#94a3b8">${params.name}</div>`
          return [
            `<div style="font-weight:600;margin-bottom:4px">${item.cnName ?? params.name}</div>`,
            `<div style="color:#26c2ad">ECPM：${item.value.toFixed(2)}</div>`
          ].join('')
        }
      },
      visualMap: {
        type: 'continuous',
        show: true,
        min: dataMin,
        max: dataMax,
        text: ['High', 'Low'],
        realtime: false,
        calculable: false,
        inRange: { color: ['#0d2137', '#0e4d6e', '#26C2AD'] },
        outOfRange: { color: ['#0d1f35'] },
        left: 10,
        bottom: 16,
        itemWidth: 14,
        itemHeight: 80,
        textStyle: { color: '#64748b', fontSize: 11 },
        formatter: (val: number) => val.toFixed(1)
      },
      series: [
        {
          type: 'map',
          map: 'world',
          roam: true,
          zoom: 1.2,
          scaleLimit: { min: 0.8, max: 5 },
          data: mapData.map((d) => ({
            name: d.name,
            value: d.value,
            cnName: d.cnName
          })),
          itemStyle: {
            areaColor: '#0d1f35',
            borderColor: '#1e3a5f',
            borderWidth: 0.6
          },
          emphasis: {
            itemStyle: {
              areaColor: 'rgba(38,194,173,0.4)',
              borderColor: '#26C2AD',
              borderWidth: 1.2,
              shadowBlur: 12,
              shadowColor: 'rgba(38,194,173,0.3)'
            },
            label: { show: false }
          },
          select: { disabled: true },
          label: {
            show: true,
            color: '#e2e8f0',
            fontSize: 10,
            fontWeight: 500,
            formatter: (params: any) => {
              const item = mapData.find((d) => d.name === params.name)
              if (!item) return ''
              return `{name|${item.cnName ?? params.name}}\n{ecpm|${item.value.toFixed(2)}}`
            },
            rich: {
              name: { color: '#e2e8f0', fontSize: 10, fontWeight: 600, lineHeight: 16 },
              ecpm: { color: '#26C2AD', fontSize: 10, lineHeight: 14 }
            }
          }
        }
      ]
    }
  }

  function buildEcpmOption(): EChartsOption {
    const comparison = tabData.value?.ecpmComparison?.slice(0, 6) ?? []
    const names = comparison.map((r) => r.name)
    const values = comparison.map((r) => r.ecpm)
    return {
      backgroundColor: 'transparent',
      grid: { left: 72, right: 56, top: 16, bottom: 16 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1e293b',
        borderColor: '#334155',
        textStyle: { color: '#f1f5f9' }
      },
      xAxis: {
        type: 'value',
        axisLabel: { color: '#94a3b8', fontSize: 10 },
        splitLine: { lineStyle: { color: '#1e293b', type: 'dashed' } }
      },
      yAxis: { type: 'category', data: names, axisLabel: { color: '#94a3b8', fontSize: 11 } },
      series: [
        {
          type: 'bar',
          data: values,
          itemStyle: { color: '#3B82F6' },
          barMaxWidth: 18
        }
      ]
    }
  }

  function buildTrendOption(): EChartsOption {
    const { dates, series } = tabData.value?.trend7d ?? { dates: [], series: [] }
    return {
      backgroundColor: 'transparent',
      grid: { left: 48, right: 24, top: 16, bottom: 36 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1e293b',
        borderColor: '#334155',
        textStyle: { color: '#f1f5f9' }
      },
      legend: {
        data: series.map((s) => s.name),
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

  function buildPenetrationOption(): EChartsOption {
    const data = tabData.value?.penetrationData ?? []
    const names = data.map((r) => r.name)
    const values = data.map((r) => r.penetration)
    return {
      backgroundColor: 'transparent',
      grid: { left: 72, right: 56, top: 16, bottom: 16 },
      xAxis: {
        type: 'value',
        max: 100,
        axisLabel: { color: '#94a3b8', fontSize: 10, formatter: '{value}%' },
        splitLine: { lineStyle: { color: '#1e293b', type: 'dashed' } }
      },
      yAxis: { type: 'category', data: names, axisLabel: { color: '#94a3b8', fontSize: 11 } },
      series: [
        {
          type: 'bar',
          data: values,
          itemStyle: { color: '#26C2AD' },
          barMaxWidth: 18,
          label: {
            show: true,
            position: 'right',
            color: '#94a3b8',
            fontSize: 10,
            formatter: (p: { value?: number }) => `${p.value ?? 0}%`
          }
        }
      ]
    }
  }

  function refreshCharts() {
    if (!tabData.value) return
    useMapChart.updateChart(buildMapOption())
    useEcpm.updateChart(buildEcpmOption())
    useTrend.updateChart(buildTrendOption())
    usePenetration.updateChart(buildPenetrationOption())
  }

  async function loadTabData() {
    await ensureMapRegistered()
    tabData.value = await fetchIaaCountryTabData(props.filter)
    pagination.total = tabData.value?.tableRows.length ?? 0
    pagination.current = 1
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
  .iaa-tab-country {
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

    &[data-accent='teal'] .iaa-kpi__value {
      color: #26c2ad;
    }

    &[data-accent='amber'] .iaa-kpi__value {
      color: var(--art-warning);
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

    &--map {
      min-height: 240px;
    }

    &--hbar {
      min-height: 160px;
    }

    &--line {
      min-height: 160px;
    }
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
</style>
