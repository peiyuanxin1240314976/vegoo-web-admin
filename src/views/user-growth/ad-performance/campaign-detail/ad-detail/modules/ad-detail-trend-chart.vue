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
  @import '../../../styles/ap-card-fx';

  .adt {
    @include ap-neon-bg;
    @include ap-panel-hover;

    position: relative;
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
    border-radius: 14px;

    &::before {
      position: absolute;
      top: 0;
      left: 5%;
      z-index: 0;
      width: 90%;
      height: 1.5px;
      pointer-events: none;
      content: '';
      background: linear-gradient(
        90deg,
        transparent,
        rgb(59 130 246 / 75%),
        rgb(6 182 212 / 82%),
        rgb(16 185 129 / 68%),
        transparent
      );
      filter: blur(0.4px);
    }

    :deep(.el-card__header) {
      position: relative;
      z-index: 1;
      padding: 14px 18px 12px;
      background: transparent;
      border-bottom: 1px solid rgb(6 182 212 / 16%);
    }

    :deep(.el-card__body) {
      position: relative;
      z-index: 1;
      display: flex;
      flex: 1;
      flex-direction: column;
      min-height: 0;
      padding: 14px 12px 16px;
      background: transparent;
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
    @include ap-title-gradient;

    font-size: 13px;
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
    color: #94a3b8;
  }

  .adt__legend-dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    box-shadow: 0 0 6px currentcolor;
  }

  .adt__body {
    width: 100%;
    height: 100%;
    min-height: 260px;
  }
</style>
