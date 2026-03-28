<template>
  <ElRow :gutter="16" class="ad-performance-trend-charts">
    <ElCol :xs="24" :md="12">
      <ElCard class="ad-performance-trend-charts__card" shadow="never">
        <template #header>{{ tr('adPerformance.spendTrend', '花费趋势') }}</template>
        <div ref="spendChartRef" class="ad-performance-trend-charts__chart"></div>
      </ElCard>
    </ElCol>
    <ElCol :xs="24" :md="12">
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
    const topColor = isDark ? 'rgba(249,115,22,0.38)' : 'rgba(249,115,22,0.28)'
    const midColor = isDark ? 'rgba(249,115,22,0.12)' : 'rgba(249,115,22,0.08)'
    const bottomColor = 'rgba(249,115,22,0)'
    spendChart.initChart(
      {
        animation: true,
        animationDuration: 900,
        animationEasing: 'cubicOut',
        animationDurationUpdate: 500,
        tooltip: {
          trigger: 'axis',
          backgroundColor: isDark ? 'rgba(15,25,41,0.92)' : 'rgba(255,255,255,0.96)',
          borderColor: isDark ? '#2a3f5f' : '#e5e7eb',
          textStyle: { color: isDark ? '#e2e8f0' : '#374151', fontSize: 12 }
        },
        grid: { left: 40, right: 14, top: 12, bottom: 20 },
        xAxis: {
          type: 'category',
          data: data.map((t) => t.date),
          boundaryGap: false,
          axisLabel: { color: isDark ? '#6b7280' : '#9ca3af', fontSize: 11 },
          axisLine: { lineStyle: { color: isDark ? '#374151' : '#f3f4f6' } },
          axisTick: { show: false }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            color: isDark ? '#6b7280' : '#9ca3af',
            fontSize: 11,
            formatter: (v: number) =>
              v >= 1000 ? `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}K` : String(v)
          },
          splitLine: { lineStyle: { color: isDark ? '#1f2937' : '#f9fafb', type: 'dashed' } }
        },
        series: [
          {
            type: 'line',
            data: data.map((t) => t.value),
            smooth: 0.4,
            symbol: 'circle',
            symbolSize: 7,
            showSymbol: false,
            emphasis: { scale: true, focus: 'series' },
            lineStyle: {
              width: 2.5,
              color: '#F97316',
              shadowColor: 'rgba(249,115,22,0.3)',
              shadowBlur: 6
            },
            itemStyle: {
              color: '#F97316',
              borderWidth: 2,
              borderColor: isDark ? '#1a2535' : '#fff'
            },
            areaStyle: {
              color: new graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: topColor },
                { offset: 0.5, color: midColor },
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
    const topColor = isDark ? 'rgba(16,185,129,0.38)' : 'rgba(16,185,129,0.28)'
    const midColor = isDark ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.08)'
    const bottomColor = 'rgba(16,185,129,0)'
    roiChart.initChart(
      {
        animation: true,
        animationDuration: 900,
        animationEasing: 'cubicOut',
        animationDurationUpdate: 500,
        tooltip: {
          trigger: 'axis',
          backgroundColor: isDark ? 'rgba(15,25,41,0.92)' : 'rgba(255,255,255,0.96)',
          borderColor: isDark ? '#2a3f5f' : '#e5e7eb',
          textStyle: { color: isDark ? '#e2e8f0' : '#374151', fontSize: 12 },
          formatter: (params: any[]) => {
            const p = params[0]
            return `${p.axisValue}<br/><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#10B981;margin-right:5px"></span>${p.value}%`
          }
        },
        grid: { left: 40, right: 14, top: 12, bottom: 20 },
        xAxis: {
          type: 'category',
          data: data.map((t) => t.date),
          boundaryGap: false,
          axisLabel: { color: isDark ? '#6b7280' : '#9ca3af', fontSize: 11 },
          axisLine: { lineStyle: { color: isDark ? '#374151' : '#f3f4f6' } },
          axisTick: { show: false }
        },
        yAxis: {
          type: 'value',
          min: (v: { min: number }) => Math.max(0, Math.floor(v.min / 10) * 10 - 10),
          axisLabel: {
            color: isDark ? '#6b7280' : '#9ca3af',
            fontSize: 11,
            formatter: '{value}%'
          },
          splitLine: { lineStyle: { color: isDark ? '#1f2937' : '#f9fafb', type: 'dashed' } }
        },
        series: [
          {
            type: 'line',
            data: data.map((t) => t.roi),
            smooth: 0.4,
            symbol: 'circle',
            symbolSize: 7,
            showSymbol: false,
            emphasis: { scale: true, focus: 'series' },
            lineStyle: {
              width: 2.5,
              color: '#10B981',
              shadowColor: 'rgba(16,185,129,0.3)',
              shadowBlur: 6
            },
            itemStyle: {
              color: '#10B981',
              borderWidth: 2,
              borderColor: isDark ? '#1a2535' : '#fff'
            },
            areaStyle: {
              color: new graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: topColor },
                { offset: 0.5, color: midColor },
                { offset: 1, color: bottomColor }
              ])
            },
            markLine: {
              silent: true,
              symbol: 'none',
              animation: false,
              label: {
                show: true,
                position: 'insideEndTop',
                formatter: `目标 ${ROI_TARGET}%`,
                color: isDark ? '#6b7280' : '#9ca3af',
                fontSize: 11
              },
              lineStyle: { type: 'dashed', color: isDark ? '#4b5563' : '#d1d5db', width: 1 },
              data: [{ yAxis: ROI_TARGET }]
            }
          }
        ]
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

  @media (width <= 768px) {
    .ad-performance-trend-charts__chart {
      height: 180px;
    }

    .ad-performance-trend-charts {
      margin-bottom: 12px;
    }
  }
</style>
