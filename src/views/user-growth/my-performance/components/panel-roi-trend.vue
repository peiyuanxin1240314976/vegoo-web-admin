<template>
  <div class="panel">
    <div class="panel__header">
      <span class="title">{{ title }}</span>
    </div>
    <div class="panel__body">
      <div ref="chartRef" class="chart"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
  import { echarts, type EChartsOption } from '@/plugins/echarts'
  import type { MyPerformanceRoiTrendPoint } from '../types'

  defineOptions({ name: 'MyPerformancePanelRoiTrend' })

  const props = withDefaults(
    defineProps<{
      title: string
      points: MyPerformanceRoiTrendPoint[]
    }>(),
    { points: () => [] }
  )

  const chartRef = ref<HTMLElement | null>(null)
  let chart: ReturnType<typeof echarts.init> | null = null

  function buildOption(): EChartsOption {
    const x = props.points.map((p) => p.date.slice(5))
    const y = props.points.map((p) => p.roi)
    return {
      grid: { top: 20, right: 16, bottom: 24, left: 36 },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: x,
        axisLine: { lineStyle: { color: 'rgba(148,163,184,0.35)' } },
        axisLabel: { color: 'rgba(161,161,170,0.9)' }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        splitLine: { lineStyle: { color: 'rgba(148,163,184,0.12)' } },
        axisLabel: { color: 'rgba(161,161,170,0.9)', formatter: '{value}%' }
      },
      series: [
        {
          type: 'line',
          data: y,
          smooth: true,
          symbolSize: 6,
          lineStyle: {
            width: 2,
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: 'rgba(59, 130, 246, 0.95)' },
              { offset: 0.5, color: 'rgba(34, 211, 238, 0.95)' },
              { offset: 1, color: 'rgba(16, 185, 129, 0.95)' }
            ])
          },
          itemStyle: {
            color: 'rgba(34, 211, 238, 0.95)',
            borderColor: 'rgba(244, 244, 245, 0.35)',
            borderWidth: 1
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(59, 130, 246, 0.22)' },
              { offset: 0.55, color: 'rgba(34, 211, 238, 0.10)' },
              { offset: 1, color: 'rgba(16, 185, 129, 0)' }
            ])
          }
        }
      ]
    }
  }

  function init() {
    if (!chartRef.value) return
    chart = echarts.init(chartRef.value)
    chart.setOption(buildOption())
  }

  function resize() {
    chart?.resize()
  }

  onMounted(() => {
    init()
    window.addEventListener('resize', resize)
  })

  watch(
    () => props.points,
    () => {
      if (!chart) init()
      chart?.setOption(buildOption())
      chart?.resize()
    },
    { deep: true }
  )

  onBeforeUnmount(() => {
    window.removeEventListener('resize', resize)
    chart?.dispose()
    chart = null
  })
</script>

<style scoped lang="scss">
  .panel {
    background: var(--default-box-color);
    border: 1px solid var(--default-border);
    border-radius: 12px;
  }

  .panel__header {
    padding: 10px 14px;
    border-bottom: 1px solid var(--default-border);
  }

  .title {
    font-size: 14px;
    font-weight: 650;
    color: var(--art-gray-900);
  }

  .panel__body {
    padding: 10px 14px 14px;
  }

  .chart {
    width: 100%;
    height: 180px;
  }
</style>
