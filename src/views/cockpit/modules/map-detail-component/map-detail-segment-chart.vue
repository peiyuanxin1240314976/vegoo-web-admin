<template>
  <ElCard class="map-detail-segment-chart" shadow="never">
    <template #header>
      <span>用户分层</span>
    </template>
    <div ref="chartRef" class="chart-box"></div>
    <div v-if="note" class="chart-note">{{ note }}</div>
  </ElCard>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, watch } from 'vue'
  import { echarts, type EChartsOption } from '@/plugins/echarts'

  defineOptions({ name: 'MapDetailSegmentChart' })

  const CHART_COLOR = '#3984F1'

  export interface SegmentItem {
    name: string
    value: number
  }

  const props = withDefaults(
    defineProps<{
      data?: SegmentItem[]
      note?: string
    }>(),
    {
      data: () => [
        { value: 52, name: '活跃免费' },
        { value: 30, name: '流失风险' },
        { value: 18, name: '付费用户' }
      ],
      note: '付费转化率 4.8% (vs 全局 3.2%)'
    }
  )

  const chartRef = ref<HTMLElement | null>(null)
  let chart: ReturnType<typeof echarts.init> | null = null

  function initChart() {
    if (!chartRef.value) return
    chart = echarts.init(chartRef.value)
    const opt: EChartsOption = {
      color: [CHART_COLOR, '#f59e0b', '#10b981'],
      series: [
        {
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['50%', '50%'],
          data: props.data,
          label: { formatter: '{b} {d}%' }
        }
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
  watch(() => props.data, initChart, { deep: true })

  onUnmounted(() => {
    window.removeEventListener('resize', resize)
    chart?.dispose()
    chart = null
  })
</script>

<style scoped lang="scss">
  .map-detail-segment-chart {
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
