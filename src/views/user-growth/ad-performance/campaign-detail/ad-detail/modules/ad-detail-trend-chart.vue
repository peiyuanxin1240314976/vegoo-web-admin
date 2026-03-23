<template>
  <ElCard class="adt" shadow="never">
    <template #header>
      <div class="adt__header">
        <span class="adt__title">表现趋势</span>
        <div class="adt__legend">
          <span v-for="m in visibleMetrics" :key="m.key" class="adt__legend-item">
            <span class="adt__legend-dot" :style="{ background: m.color }"></span>
            {{ m.label }}
          </span>
        </div>
      </div>
    </template>
    <div ref="chartEl" class="adt__body"></div>
  </ElCard>
</template>

<script setup lang="ts">
  import { ref, watch, onMounted, onBeforeUnmount, nextTick, computed } from 'vue'
  import * as echarts from 'echarts/core'
  import { LineChart } from 'echarts/charts'
  import { GridComponent, TooltipComponent } from 'echarts/components'
  import { CanvasRenderer } from 'echarts/renderers'
  import type { AdTrendPoint } from '../types'

  echarts.use([LineChart, GridComponent, TooltipComponent, CanvasRenderer])

  defineOptions({ name: 'AdDetailTrendChart' })

  const props = defineProps<{
    data: AdTrendPoint[]
  }>()

  type MetricKey = 'spend' | 'cpi' | 'roi'

  const METRICS: { key: MetricKey; label: string; color: string }[] = [
    { key: 'spend', label: 'Spend', color: '#3B82F6' },
    { key: 'cpi', label: 'CPI', color: '#F97316' },
    { key: 'roi', label: 'ROI', color: '#10B981' }
  ]

  const visibleMetrics = computed(() => METRICS)

  const chartEl = ref<HTMLElement | null>(null)
  let chart: echarts.ECharts | null = null

  /** 读取实际 CSS 变量色值（ECharts canvas 无法识别 var(--xxx)） */
  function cv(name: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  }

  function buildOption() {
    const dates = props.data.map((d) => d.date)
    const labelColor = cv('--el-text-color-secondary') || '#94a3b8'
    const borderColor = cv('--default-border') || '#27272a'
    const boxColor = cv('--default-box-color') || '#18181b'
    const textColor = cv('--el-text-color-primary') || '#f4f4f5'

    const series = METRICS.map((m) => ({
      name: m.label,
      type: 'line' as const,
      smooth: true,
      symbol: 'circle',
      symbolSize: 5,
      lineStyle: { width: 2, color: m.color },
      itemStyle: { color: m.color },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: `${m.color}33` },
          { offset: 1, color: `${m.color}00` }
        ])
      },
      data: props.data.map((d) => d[m.key])
    }))

    return {
      backgroundColor: 'transparent',
      grid: { top: 16, right: 8, bottom: 28, left: 48, containLabel: false },
      tooltip: {
        trigger: 'axis',
        backgroundColor: boxColor,
        borderColor,
        textStyle: { color: textColor, fontSize: 12 }
      },
      xAxis: {
        type: 'category',
        data: dates,
        boundaryGap: false,
        axisLine: { lineStyle: { color: borderColor } },
        axisLabel: { color: labelColor, fontSize: 11 },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: borderColor, type: 'dashed' } },
        axisLabel: {
          color: labelColor,
          fontSize: 11,
          formatter: (v: number) => {
            if (v >= 1000) return `$${(v / 1000).toFixed(0)}K`
            return String(v)
          }
        }
      },
      series
    }
  }

  const ro = new ResizeObserver(() => chart?.resize())

  onMounted(async () => {
    await nextTick()
    if (!chartEl.value) return
    chart = echarts.init(chartEl.value)
    chart.setOption(buildOption())
    ro.observe(chartEl.value)
  })

  onBeforeUnmount(() => {
    ro.disconnect()
    chart?.dispose()
  })

  watch(
    () => props.data,
    () => chart?.setOption(buildOption(), { notMerge: true }),
    { deep: true }
  )
</script>

<style scoped lang="scss">
  .adt {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    background: var(--default-box-color);

    :deep(.el-card__header) {
      padding: 10px 16px 8px;
      border-bottom: 1px solid var(--default-border);
    }

    :deep(.el-card__body) {
      display: flex;
      flex: 1;
      flex-direction: column;
      min-height: 0;
      padding: 12px 14px 14px;
    }
  }

  .adt__header {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    justify-content: space-between;
  }

  .adt__title {
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .adt__legend {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .adt__legend-item {
    display: inline-flex;
    gap: 5px;
    align-items: center;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .adt__legend-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .adt__body {
    width: 100%;
    height: 100%;
    min-height: 260px;
  }
</style>
