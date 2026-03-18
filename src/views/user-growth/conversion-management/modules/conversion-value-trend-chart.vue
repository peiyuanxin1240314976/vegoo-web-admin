<template>
  <ElCard shadow="never" class="conversion-value-trend">
    <template #header>
      <div class="conversion-value-trend__header">{{
        $t('conversionManagement.panelValueTrend30d')
      }}</div>
    </template>
    <div ref="chartRef" class="conversion-value-trend__dom"></div>
  </ElCard>
</template>

<script setup lang="ts">
  import { useChart } from '@/hooks/core/useChart'
  import { graphic } from 'echarts'
  import type { ConversionValueTrendPoint } from '../types'

  defineOptions({ name: 'ConversionValueTrendChart' })

  const props = withDefaults(
    defineProps<{
      data?: ConversionValueTrendPoint[]
    }>(),
    { data: () => [] }
  )

  const chart = useChart()
  const chartRef = chart.chartRef

  function buildOption(): import('echarts').EChartsOption {
    const isDark = chart.isDark.value
    const x = (props.data ?? []).map((d) => d.date)
    const y = (props.data ?? []).map((d) => d.value)
    const lineColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--el-color-success')
      .trim()
    const axisColor = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)'
    const topColor = isDark ? 'rgba(103,194,58,0.22)' : 'rgba(103,194,58,0.16)'
    const bottomColor = 'rgba(103,194,58,0)'

    return {
      grid: { left: 30, right: 14, top: 12, bottom: 22 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.95)',
        borderColor: isDark ? '#333' : '#ddd',
        textStyle: { color: isDark ? '#e5e7eb' : '#111827' }
      },
      xAxis: {
        type: 'category',
        data: x,
        boundaryGap: false,
        axisLine: { lineStyle: { color: axisColor } },
        axisTick: { show: false },
        axisLabel: { color: axisColor, fontSize: 10, interval: 5 }
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        splitLine: { lineStyle: { color: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' } },
        axisLabel: { color: axisColor, fontSize: 10 }
      },
      series: [
        {
          type: 'line',
          data: y,
          smooth: true,
          showSymbol: false,
          lineStyle: { width: 2, color: lineColor || '#67c23a' },
          areaStyle: {
            color: new graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: topColor },
              { offset: 1, color: bottomColor }
            ])
          }
        }
      ]
    }
  }

  watch(
    [chartRef, () => props.data],
    () => {
      if (!chartRef.value) return
      chart.initChart(buildOption(), !(props.data ?? []).length)
    },
    { immediate: true, deep: true }
  )
</script>

<style scoped lang="scss">
  .conversion-value-trend {
    margin-bottom: 16px;
    border-radius: 10px;
  }

  .conversion-value-trend__header {
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .conversion-value-trend__dom {
    width: 100%;
    height: 240px;
  }
</style>
