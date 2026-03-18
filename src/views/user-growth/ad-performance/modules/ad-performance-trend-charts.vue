<template>
  <ElRow :gutter="16" class="ad-performance-trend-charts">
    <ElCol :xs="24" :lg="12">
      <ElCard class="ad-performance-trend-charts__card" shadow="never">
        <template #header>{{ tr('adPerformance.spendTrend', '花费趋势') }}</template>
        <div ref="spendChartRef" class="ad-performance-trend-charts__chart"></div>
      </ElCard>
    </ElCol>
    <ElCol :xs="24" :lg="12">
      <ElCard class="ad-performance-trend-charts__card" shadow="never">
        <template #header>{{ tr('adPerformance.roi7dTrend', '7日ROI趋势') }}</template>
        <div ref="roiChartRef" class="ad-performance-trend-charts__chart"></div>
      </ElCard>
    </ElCol>
  </ElRow>
</template>

<script setup lang="ts">
  import { watch, onMounted } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useChart } from '@/hooks/core/useChart'
  import { graphic } from '@/plugins/echarts'
  import type { SpendTrendItem, Roi7dTrendItem } from '../types'

  defineOptions({ name: 'AdPerformanceTrendCharts' })

  const { t, te } = useI18n()
  const tr = (key: string, fallback: string) => (te(key) ? t(key) : fallback)

  const props = withDefaults(
    defineProps<{
      spendTrend?: SpendTrendItem[]
      roi7dTrend?: Roi7dTrendItem[]
    }>(),
    { spendTrend: () => [], roi7dTrend: () => [] }
  )

  const ROI_TARGET = 80

  const spendChart = useChart()
  const spendChartRef = spendChart.chartRef

  const roiChart = useChart()
  const roiChartRef = roiChart.chartRef

  function renderSpendChart() {
    const data = props.spendTrend
    const isDark = spendChart.isDark.value
    const topColor = isDark ? 'rgba(249,115,22,0.22)' : 'rgba(249,115,22,0.16)'
    const bottomColor = 'rgba(249,115,22,0)'
    spendChart.initChart(
      {
        tooltip: { trigger: 'axis' },
        grid: { left: 38, right: 14, top: 8, bottom: 18 },
        xAxis: {
          type: 'category',
          data: data.map((t) => t.date),
          boundaryGap: true,
          axisLabel: { color: isDark ? '#999' : '#666', fontSize: 11 },
          axisLine: { lineStyle: { color: isDark ? '#444' : '#eee' } }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            color: isDark ? '#999' : '#666',
            fontSize: 11,
            formatter: (v: number) => (v >= 1000 ? `${v / 1000}K` : String(v))
          },
          splitLine: { lineStyle: { color: isDark ? '#333' : '#eee', type: 'dashed' } }
        },
        series: [
          {
            type: 'line',
            data: data.map((t) => t.value),
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: { width: 2 },
            itemStyle: { color: '#F97316' },
            areaStyle: {
              color: new graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: topColor },
                { offset: 1, color: bottomColor }
              ])
            }
          }
        ]
      },
      data.length === 0
    )
  }

  function renderRoiChart() {
    const data = props.roi7dTrend
    const isDark = roiChart.isDark.value
    const topColor = isDark ? 'rgba(16,185,129,0.22)' : 'rgba(16,185,129,0.16)'
    const bottomColor = 'rgba(16,185,129,0)'
    roiChart.initChart(
      {
        tooltip: { trigger: 'axis' },
        grid: { left: 38, right: 14, top: 8, bottom: 18 },
        xAxis: {
          type: 'category',
          data: data.map((t) => t.date),
          boundaryGap: true,
          axisLabel: { color: isDark ? '#999' : '#666', fontSize: 11 },
          axisLine: { lineStyle: { color: isDark ? '#444' : '#eee' } }
        },
        yAxis: {
          type: 'value',
          min: (v: { min: number }) => Math.max(0, v.min - 15),
          axisLabel: {
            color: isDark ? '#999' : '#666',
            fontSize: 11,
            formatter: '{value}%'
          },
          splitLine: { lineStyle: { color: isDark ? '#333' : '#eee', type: 'dashed' } }
        },
        series: [
          {
            type: 'line',
            data: data.map((t) => t.roi),
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: { width: 2 },
            itemStyle: { color: '#10B981' },
            areaStyle: {
              color: new graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: topColor },
                { offset: 1, color: bottomColor }
              ])
            }
          }
        ],
        markLine: {
          silent: true,
          symbol: 'none',
          label: { show: true, formatter: `目标 ${ROI_TARGET}%` },
          lineStyle: { type: 'dashed', color: isDark ? '#666' : '#999' },
          data: [{ yAxis: ROI_TARGET }]
        }
      },
      data.length === 0
    )
  }

  function renderAll() {
    renderSpendChart()
    renderRoiChart()
  }

  onMounted(() => {
    renderAll()
  })

  watch(
    () => [spendChart.isDark.value, props.spendTrend, props.roi7dTrend] as const,
    () => {
      renderAll()
    },
    { deep: true }
  )
</script>

<style scoped lang="scss">
  .ad-performance-trend-charts {
    margin-bottom: 16px;
  }

  .ad-performance-trend-charts__card {
    margin-bottom: 0;
    background: var(--default-box-color);

    :deep(.el-card__header) {
      padding-bottom: 8px;
      font-size: 15px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      border-bottom: none;
    }

    :deep(.el-card__body) {
      padding-top: 4px;
    }
  }

  .ad-performance-trend-charts__chart {
    height: 135px;
    min-height: 120px;
  }
</style>
