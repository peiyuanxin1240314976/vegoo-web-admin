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

  /** data、note 来自接口 countryInfo/userPayLaunch */
  const props = withDefaults(
    defineProps<{
      data?: SegmentItem[]
      note?: string
    }>(),
    {
      data: () => [],
      note: ''
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
      position: relative;
      padding: 10px 14px;
      margin-top: 14px;
      font-size: 12px;
      font-weight: bold;
      color: #439872;
      text-align: center;
      background: #00ff8a17;
      border: 1px solid rgb(67 152 114 / 25%);
      border-radius: 8px;

      /* 气泡三角在上方、居中 */
      &::before {
        position: absolute;
        top: -6px;
        left: 50%;
        width: 0;
        height: 0;
        content: '';
        border-right: 6px solid transparent;
        border-bottom: 6px solid #00ff8a17;
        border-left: 6px solid transparent;
        transform: translateX(-50%);
      }
    }
  }
</style>
