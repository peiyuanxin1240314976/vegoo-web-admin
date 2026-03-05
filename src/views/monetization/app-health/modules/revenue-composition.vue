<template>
  <ElCard class="app-health-panel" shadow="never">
    <template #header>
      <span>收入构成</span>
    </template>
    <div class="revenue-legend">
      <span v-for="(s, i) in revenueData?.series ?? []" :key="s.name" class="legend-item">
        <span class="legend-dot" :style="{ background: seriesColors[i] }" />
        {{ s.name }} {{ s.percent }}%
      </span>
    </div>
    <div ref="chartRef" class="chart-container" />
  </ElCard>
</template>

<script setup lang="ts">
  import { onMounted, onUnmounted, watch, computed, nextTick, ref } from 'vue'
  import { echarts } from '@/plugins/echarts'
  import type { EChartsOption } from 'echarts'
  import type { AppHealthRevenueComposition } from '../types'
  import { MOCK_APP_HEALTH } from '../mock/data'

  defineOptions({ name: 'AppHealthRevenueComposition' })

  const props = withDefaults(defineProps<{ data?: AppHealthRevenueComposition | null }>(), {
    data: null
  })

  const chartRef = ref<HTMLElement | null>(null)
  let chartInstance: ReturnType<typeof echarts.init> | null = null

  const revenueData = computed(() => props.data ?? MOCK_APP_HEALTH.revenueComposition)

  const seriesColors = ['#722ed1', '#67c23a', '#13c2c2']

  function buildOption(): EChartsOption {
    const d = revenueData.value
    if (!d?.dates?.length || !d.series?.length) return {}
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' }
      },
      grid: { left: '3%', right: '4%', bottom: '12%', top: 40, containLabel: true },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: d.dates
      },
      yAxis: {
        type: 'value',
        name: '收入',
        axisLabel: { formatter: (v: number) => (v >= 1000 ? v / 1000 + 'K' : String(v)) },
        splitLine: { lineStyle: { type: 'dashed', opacity: 0.4 } }
      },
      series: d.series.map((s, i) => ({
        name: s.name,
        type: 'line',
        stack: 'Total',
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: seriesColors[i] },
              { offset: 1, color: seriesColors[i] + '40' }
            ]
          }
        },
        lineStyle: { width: 1, color: seriesColors[i] },
        itemStyle: { color: seriesColors[i] },
        data: s.data
      }))
    }
  }

  function initChart() {
    if (!chartRef.value) return
    chartInstance = echarts.init(chartRef.value)
    chartInstance.setOption(buildOption())
  }

  function updateChart() {
    if (chartInstance) chartInstance.setOption(buildOption())
  }

  onMounted(() => {
    nextTick(initChart)
  })

  onUnmounted(() => {
    if (chartInstance) {
      chartInstance.dispose()
      chartInstance = null
    }
  })

  watch(revenueData, () => updateChart(), { deep: true })
</script>

<style scoped lang="scss">
  .app-health-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 320px;

    :deep(.el-card__body) {
      display: flex;
      flex: 1;
      flex-direction: column;
      min-height: 0;
      padding: 12px;
    }
  }

  .revenue-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 16px 24px;
    margin-bottom: 8px;
    font-size: 12px;
    color: var(--el-text-color-regular);
  }

  .legend-item {
    display: inline-flex;
    gap: 6px;
    align-items: center;
  }

  .legend-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .chart-container {
    flex: 1;
    min-height: 240px;
  }
</style>
