<template>
  <ElCard class="map-detail-revenue-panel" shadow="never">
    <template #header>
      <span>变现分析</span>
    </template>
    <div class="revenue-composition">
      <div ref="chartRef" class="revenue-chart"></div>
      <div class="revenue-metrics">
        <span>eCPM: {{ metrics.ecpm }} {{ metrics.ecpmTrend }}</span>
        <span>广告充展率: {{ metrics.fillRate }}</span>
        <span>ARPU: {{ metrics.arpu }}</span>
      </div>
    </div>
  </ElCard>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, watch } from 'vue'
  import { echarts, type EChartsOption } from '@/plugins/echarts'

  defineOptions({ name: 'MapDetailRevenuePanel' })

  const CHART_COLOR = '#3984F1'

  const props = withDefaults(
    defineProps<{
      metrics?: { ecpm: string; ecpmTrend: string; fillRate: string; arpu: string }
      chartData?: [number, number]
    }>(),
    {
      metrics: () => ({ ecpm: '$8.20', ecpmTrend: '↑+3%', fillRate: '94%', arpu: '$22.8' }),
      chartData: () => [780, 250]
    }
  )

  const chartRef = ref<HTMLElement | null>(null)
  let chart: ReturnType<typeof echarts.init> | null = null

  function initChart() {
    if (!chartRef.value) return
    chart = echarts.init(chartRef.value)
    const [ad, iap] = props.chartData
    const opt: EChartsOption = {
      grid: { left: 16, right: 16, top: 16, bottom: 24 },
      xAxis: { type: 'category', show: false, data: ['收入'] },
      yAxis: { type: 'value', show: false },
      series: [
        { data: [ad], stack: 'a', itemStyle: { color: CHART_COLOR }, type: 'bar' },
        { data: [iap], stack: 'a', itemStyle: { color: '#f59e0b' }, type: 'bar' }
      ]
    }
    chart.setOption(opt)
  }

  function resize() {
    chart?.resize()
  }

  onMounted(() => {
    initChart()
    window.addEventListener('resize', resize)
  })
  watch(() => props.chartData, initChart, { deep: true })

  onUnmounted(() => {
    window.removeEventListener('resize', resize)
    chart?.dispose()
    chart = null
  })
</script>

<style scoped lang="scss">
  .map-detail-revenue-panel {
    :deep(.el-card__header) {
      font-weight: 500;
    }
  }

  .revenue-composition {
    .revenue-chart {
      height: 80px;
      margin-bottom: 12px;
    }

    .revenue-metrics {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      font-size: 13px;
      color: var(--el-text-color-regular);
    }
  }
</style>
