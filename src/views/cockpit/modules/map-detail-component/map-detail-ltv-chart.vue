<template>
  <ElCard class="map-detail-ltv-chart" shadow="never">
    <template #header>
      <span>LTV 预测</span>
    </template>
    <div ref="chartRef" class="chart-box"></div>
    <div v-if="note" class="chart-note">{{ note }}</div>
  </ElCard>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, watch } from 'vue'
  import { echarts, type EChartsOption } from '@/plugins/echarts'

  defineOptions({ name: 'MapDetailLtvChart' })

  const CHART_COLOR = '#3984F1'

  const props = withDefaults(
    defineProps<{
      data?: number[]
      xAxisData?: string[]
      note?: string
    }>(),
    {
      data: () => [8.2, 18.5, 32.1, 48.6],
      xAxisData: () => ['LTV D7', 'LTV D30', 'LTV D90', 'LTV D180'],
      note: '预计回收周期: 45天'
    }
  )

  const chartRef = ref<HTMLElement | null>(null)
  let chart: ReturnType<typeof echarts.init> | null = null

  function initChart() {
    if (!chartRef.value) return
    chart = echarts.init(chartRef.value)
    const opt: EChartsOption = {
      color: [CHART_COLOR],
      grid: { left: 56, right: 24, top: 24, bottom: 32 },
      xAxis: { type: 'category', data: props.xAxisData },
      yAxis: { type: 'value', axisLabel: { formatter: '${value}' } },
      series: [{ type: 'bar', data: props.data, barWidth: '50%' }]
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
  watch(() => props.data, initChart, { deep: true })

  onUnmounted(() => {
    window.removeEventListener('resize', resize)
    chart?.dispose()
    chart = null
  })
</script>

<style scoped lang="scss">
  .map-detail-ltv-chart {
    :deep(.el-card__header) {
      font-weight: 500;
    }

    .chart-box {
      height: 240px;
    }

    .chart-note {
      margin-top: 8px;
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }
</style>
