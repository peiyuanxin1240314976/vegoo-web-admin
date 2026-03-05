<template>
  <div class="metric-card art-card">
    <h3 class="metric-title">平均转化时间</h3>
    <div class="metric-row">
      <span class="metric-value">{{ value }}</span>
      <div ref="chartRef" class="metric-chart" />
    </div>
    <p class="metric-desc">{{ description }}</p>
  </div>
</template>

<script setup lang="ts">
  import { type EChartsOption } from '@/plugins/echarts'
  import { useChartComponent } from '@/hooks/core/useChart'

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

  // 图例：左绿、中蓝、右黄，高度约 60%、100%、75%
  const BAR_COLORS = ['#67c23a', '#409eff', '#fac858']

  const { chartRef } = useChartComponent({
    props: {
      height: '60px',
      loading: false,
      isEmpty: !props.chartData?.length || props.chartData.every((v) => v === 0)
    },
    checkEmpty: () => !props.chartData?.length || props.chartData.every((v) => v === 0),
    watchSources: [() => props.chartData],
    generateOptions: (): EChartsOption => ({
      grid: { top: 2, right: 2, bottom: 2, left: 2, containLabel: false },
      xAxis: {
        type: 'category',
        data: ['0-1d', '1-3d', '3-7d'],
        show: false,
        boundaryGap: true
      },
      yAxis: { type: 'value', show: false, max: 'dataMax' },
      series: [
        {
          data: props.chartData.map((val, i) => ({
            value: val,
            itemStyle: { color: BAR_COLORS[i % 3], borderRadius: [3, 3, 0, 0] }
          })),
          type: 'bar',
          barWidth: '50%'
        }
      ]
    })
  })
</script>

<style scoped lang="scss">
  .metric-card {
    display: flex;
    flex-direction: column;
    min-height: 128px;
    padding: 12px;
  }

  .metric-title {
    margin: 0 0 6px;
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-regular);
  }

  .metric-row {
    display: flex;
    flex: 1;
    gap: 8px;
    align-items: center;
    justify-content: space-between;
    min-height: 0;
  }

  .metric-value {
    flex-shrink: 0;
    font-size: 26px;
    font-weight: 700;
    line-height: 1.2;
    color: var(--el-text-color-primary);
  }

  .metric-chart {
    flex: 1;
    min-width: 0;
    max-width: 45%;
    height: 48px;
  }

  .metric-desc {
    margin: 0;
    margin-top: 4px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    text-align: center;
  }
</style>
