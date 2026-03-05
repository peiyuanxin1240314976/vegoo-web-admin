<template>
  <div class="metric-card art-card">
    <div class="metric-header">
      <span class="metric-value">{{ value }}</span>
    </div>
    <p class="metric-desc">{{ description }}</p>
    <div class="metric-chart-wrap">
      <div ref="chartRef" class="metric-chart" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { type EChartsOption } from '@/plugins/echarts'
  import { useChartComponent, useChartOps } from '@/hooks/core/useChart'

  defineOptions({ name: 'AverageTouchpoints' })

  const props = withDefaults(
    defineProps<{
      value?: string
      description?: string
      singleClickPct?: number
      multiClickPct?: number
    }>(),
    {
      value: '2.8',
      description: '单点点击: 40% | 多点点击: 60%',
      singleClickPct: 40,
      multiClickPct: 60
    }
  )

  const { chartRef } = useChartComponent({
    props: {
      height: '80px',
      loading: false,
      isEmpty: false
    },
    watchSources: [() => props.singleClickPct, () => props.multiClickPct],
    generateOptions: (): EChartsOption => {
      const colors = useChartOps().colors
      return {
        series: [
          {
            type: 'pie',
            radius: ['55%', '78%'],
            center: ['50%', '50%'],
            avoidLabelOverlap: false,
            label: { show: false },
            data: [
              {
                value: props.singleClickPct,
                name: '单点点击',
                itemStyle: { color: colors[2] ?? '#14DEBA' }
              },
              {
                value: props.multiClickPct,
                name: '多点点击',
                itemStyle: { color: colors[0] ?? '#409eff' }
              }
            ]
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

  .metric-chart-wrap {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    min-height: 80px;
    margin-top: auto;
  }

  .metric-chart {
    width: 100%;
    max-width: 100px;
    height: 80px;
  }
</style>
