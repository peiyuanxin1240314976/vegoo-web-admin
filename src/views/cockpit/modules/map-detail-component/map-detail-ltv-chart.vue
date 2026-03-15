<template>
  <ElCard class="map-detail-ltv-chart" shadow="never">
    <template #header>
      <div class="card-header-inner">
        <span class="card-title">LTV 预测</span>
        <span v-if="note" class="card-note">{{ note }}</span>
      </div>
    </template>
    <div ref="chartRef" class="chart-box"></div>
  </ElCard>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, watch } from 'vue'
  import { echarts, type EChartsOption } from '@/plugins/echarts'

  defineOptions({ name: 'MapDetailLtvChart' })

  const CHART_COLOR = '#3984F1'

  /** data、note 来自接口 countryInfo/ltv */
  const props = withDefaults(
    defineProps<{
      data?: number[]
      xAxisData?: string[]
      note?: string
    }>(),
    {
      data: () => [],
      xAxisData: () => ['LTV D7', 'LTV D30', 'LTV D90', 'LTV D180'],
      note: ''
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
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: unknown) => {
          const list = Array.isArray(params) ? params : []
          const axis = list[0]?.axisValue ?? ''
          const lines = list.map(
            (p: { value?: number }) => `LTV: ${p.value != null ? `$${p.value}` : '—'}`
          )
          return [axis, ...lines].join('<br/>')
        }
      },
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

    .card-header-inner {
      display: flex;
      gap: 16px;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }

    .card-title {
      flex-shrink: 0;
    }

    .card-note {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }

    .chart-box {
      height: 240px;
    }
  }
</style>
