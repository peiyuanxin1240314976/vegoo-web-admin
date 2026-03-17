<template>
  <div class="conversion-type-chart">
    <div ref="chartRef" class="conversion-type-chart__dom"></div>
    <div class="conversion-type-chart__legend">
      <div
        v-for="(item, index) in chartData"
        :key="item.name"
        class="conversion-type-chart__legend-item"
      >
        <span class="conversion-type-chart__legend-name">
          <span
            class="conversion-type-chart__legend-dot"
            :style="{ backgroundColor: LEGEND_COLORS[index % LEGEND_COLORS.length] }"
          />
          {{ item.name }}
        </span>
        <span class="conversion-type-chart__legend-data">
          {{ item.value }}%, {{ item.count }}{{ $t('conversionManagement.recordUnit') }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useChart } from '@/hooks/core/useChart'
  import type { ConversionTypeDistributionItem } from '../types'

  defineOptions({ name: 'ConversionTypeChart' })

  const props = withDefaults(
    defineProps<{
      data?: ConversionTypeDistributionItem[]
    }>(),
    { data: () => [] }
  )

  const chart = useChart()
  const chartRef = chart.chartRef

  const LEGEND_COLORS = ['#4ABEFF', '#67c23a', '#e6a23c', '#722ed1', '#909399', '#f56c6c']

  const chartData = computed(() =>
    (props.data ?? []).map((d) => ({ name: d.name, value: d.value, count: d.count ?? 0 }))
  )

  function buildOption(): import('echarts').EChartsOption {
    const data = chartData.value
    const isDark = chart.isDark.value
    const pieBorderColor = isDark ? '#1d1e1f' : '#fff'
    return {
      tooltip: {
        trigger: 'item' as const,
        formatter: (params: any) =>
          `${params.name}: ${params.value}%${params.data?.count != null ? ` (${params.data.count}条)` : ''}`,
        backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)',
        borderColor: isDark ? '#333' : '#ddd',
        textStyle: { color: isDark ? '#e5e7eb' : '#333' }
      },
      legend: { show: false },
      series: [
        {
          type: 'pie',
          radius: ['40%', '65%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: true,
          itemStyle: { borderColor: pieBorderColor, borderWidth: 2 },
          label: {
            show: true,
            position: 'inside',
            distance: 10,
            formatter: '{d}%',
            fontSize: 14,
            color: isDark ? '#e5e7eb' : '#333'
          },
          labelLine: { show: false },
          data: data.map((d) => ({ name: d.name, value: d.value, count: d.count })),
          color: ['#4ABEFF', '#67c23a', '#e6a23c', '#722ed1', '#909399', '#f56c6c']
        }
      ]
    }
  }

  watch(
    [chartRef, () => props.data],
    () => {
      if (!chartRef.value) return
      const empty = !chartData.value.length
      chart.initChart(buildOption(), empty)
    },
    { immediate: true, deep: true }
  )

  onMounted(() => {
    if (chartRef.value) {
      chart.initChart(buildOption(), !chartData.value.length)
    }
  })
</script>

<script lang="ts">
  export default { name: 'ConversionTypeChart' }
</script>

<style scoped lang="scss">
  .conversion-type-chart {
    width: 100%;
  }

  .conversion-type-chart__dom {
    width: 100%;
    height: 280px;
  }

  .conversion-type-chart__legend {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 2px 0 4px;
  }

  .conversion-type-chart__legend-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    color: var(--el-text-color-primary);
  }

  html.dark .conversion-type-chart__legend-item {
    color: #fff;
  }

  .conversion-type-chart__legend-name {
    display: inline-flex;
    gap: 6px;
    align-items: center;
  }

  .conversion-type-chart__legend-dot {
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .conversion-type-chart__legend-data {
    text-align: right;
  }
</style>
