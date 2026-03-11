<template>
  <ElCard class="map-detail-retention-chart" shadow="never">
    <template #header>
      <span>用户留存曲线 (vs 全局平均)</span>
    </template>
    <div ref="chartRef" class="chart-box"></div>
  </ElCard>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, watch } from 'vue'
  import { echarts, type EChartsOption } from '@/plugins/echarts'

  defineOptions({ name: 'MapDetailRetentionChart' })

  const CHART_COLOR = '#3984F1'

  const props = withDefaults(
    defineProps<{
      localData?: number[]
      globalData?: number[]
      xAxisData?: string[]
    }>(),
    {
      localData: () => [72, 58, 45, 38, 32],
      globalData: () => [66, 52, 39, 32, 26],
      xAxisData: () => ['D1', 'D3', 'D7', 'D14', 'D30']
    }
  )

  const chartRef = ref<HTMLElement | null>(null)
  let chart: ReturnType<typeof echarts.init> | null = null

  function initChart() {
    if (!chartRef.value) return
    chart = echarts.init(chartRef.value)
    const opt: EChartsOption = {
      color: [CHART_COLOR, '#94a3b8'],
      grid: { left: 48, right: 24, top: 24, bottom: 32 },
      xAxis: { type: 'category', data: props.xAxisData },
      yAxis: { type: 'value', axisLabel: { formatter: '{value}%' } },
      series: [
        {
          name: '本地区',
          type: 'line',
          data: props.localData,
          smooth: true,
          lineStyle: { width: 2 }
        },
        {
          name: '全局平均',
          type: 'line',
          data: props.globalData,
          smooth: true,
          lineStyle: { type: 'dashed', width: 1.5 }
        }
      ],
      legend: { bottom: 0 }
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
  watch(() => [props.localData, props.globalData], initChart, { deep: true })

  onUnmounted(() => {
    window.removeEventListener('resize', resize)
    chart?.dispose()
    chart = null
  })
</script>

<style scoped lang="scss">
  .map-detail-retention-chart {
    :deep(.el-card__header) {
      font-weight: 500;
    }

    .chart-box {
      height: 240px;
    }
  }
</style>
