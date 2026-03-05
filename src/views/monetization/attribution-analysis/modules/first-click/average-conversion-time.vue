<template>
  <div class="metric-card art-card">
    <div class="metric-header">
      <span class="metric-value">{{ value }}</span>
    </div>
    <p class="metric-desc">{{ description }}</p>
    <div ref="chartRef" class="metric-chart" />
  </div>
</template>

<script setup lang="ts">
  import { type EChartsOption } from '@/plugins/echarts'
  import { useChartComponent, useChartOps } from '@/hooks/core/useChart'

  defineOptions({ name: 'AverageConversionTime' })

  const props = withDefaults(
    defineProps<{
      value?: string
      description?: string
      chartData?: number[]
    }>(),
    {
      value: '3.1 days',
      description: '0-1d: 20% | 1-3d: 40% | 3-7d: 25%',
      chartData: () => [20, 40, 25]
    }
  )

  const { chartRef } = useChartComponent({
    props: {
      height: '60px',
      loading: false,
      isEmpty: !props.chartData?.length || props.chartData.every((v) => v === 0)
    },
    checkEmpty: () => !props.chartData?.length || props.chartData.every((v) => v === 0),
    watchSources: [() => props.chartData],
    generateOptions: (): EChartsOption => {
      const color = useChartOps().themeColor
      return {
        grid: { top: 8, right: 8, bottom: 20, left: 8, containLabel: false },
        xAxis: {
          type: 'category',
          data: ['0-1d', '1-3d', '3-7d'],
          show: true,
          axisLabel: { fontSize: 10, color: 'var(--el-text-color-secondary)' },
          axisLine: { show: false },
          axisTick: { show: false }
        },
        yAxis: { type: 'value', show: false },
        series: [
          {
            data: props.chartData,
            type: 'bar',
            barWidth: '50%',
            itemStyle: { color, borderRadius: [4, 4, 0, 0] }
          }
        ]
      }
    }
  })
</script>

<style scoped lang="scss">
  .metric-card {
    display: flex;
    flex-direction: column;
    min-height: 140px;
    padding: 16px;
  }

  .metric-header {
    margin-bottom: 6px;
  }

  .metric-value {
    font-size: 22px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .metric-desc {
    margin: 0 0 8px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .metric-chart {
    flex: 1;
    min-height: 60px;
    margin-top: auto;
  }
</style>
