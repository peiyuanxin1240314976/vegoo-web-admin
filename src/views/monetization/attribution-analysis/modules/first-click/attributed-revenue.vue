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
  import { graphic, type EChartsOption } from '@/plugins/echarts'
  import { hexToRgba } from '@/utils/ui'
  import { useChartComponent } from '@/hooks/core/useChart'

  defineOptions({ name: 'AttributedRevenue' })

  const props = withDefaults(
    defineProps<{
      value?: string
      description?: string
      chartData?: number[]
    }>(),
    {
      value: '$1.89M',
      description: '+12.8% vs 上期',
      chartData: () => [120, 135, 148, 155, 168, 172, 185, 178, 189, 195]
    }
  )

  const color = '#67c23a'

  const { chartRef } = useChartComponent({
    props: {
      height: '60px',
      loading: false,
      isEmpty: !props.chartData?.length || props.chartData.every((v) => v === 0)
    },
    checkEmpty: () => !props.chartData?.length || props.chartData.every((v) => v === 0),
    watchSources: [() => props.chartData],
    generateOptions: (): EChartsOption => ({
      grid: { top: 4, right: 4, bottom: 4, left: 4, containLabel: false },
      xAxis: { type: 'category', show: false, boundaryGap: false },
      yAxis: { type: 'value', show: false },
      series: [
        {
          data: props.chartData,
          type: 'line',
          smooth: true,
          showSymbol: false,
          lineStyle: { width: 2, color },
          areaStyle: {
            color: new graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: hexToRgba(color, 0.35).rgba },
              { offset: 1, color: hexToRgba(color, 0.02).rgba }
            ])
          }
        }
      ]
    })
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

  .metric-desc.positive {
    color: var(--el-color-success);
  }

  .metric-chart {
    flex: 1;
    min-height: 50px;
    margin-top: auto;
  }
</style>
