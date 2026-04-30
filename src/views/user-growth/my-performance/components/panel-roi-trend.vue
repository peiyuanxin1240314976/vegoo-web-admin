<template>
  <div class="panel">
    <div class="panel__header">
      <ElSkeleton :loading="loading" animated>
        <template #template>
          <ElSkeletonItem variant="text" class="roi-sk-title" />
        </template>
        <template #default>
          <span class="title">{{ title }}</span>
        </template>
      </ElSkeleton>
    </div>
    <div class="panel__body">
      <div v-if="loading" class="chart chart--sk" aria-hidden="true">
        <ElSkeleton :loading="true" animated>
          <template #template>
            <div class="chart__sk-bars">
              <div
                v-for="(h, i) in chartSkHeights"
                :key="i"
                class="chart__sk-col"
                :style="{ height: h + 'px' }"
              >
                <ElSkeletonItem variant="text" class="chart__sk-bar" />
              </div>
            </div>
          </template>
        </ElSkeleton>
      </div>
      <div v-else ref="chartRef" class="chart"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, onMounted, onBeforeUnmount, onActivated, nextTick } from 'vue'
  import { echarts, type EChartsOption } from '@/plugins/echarts'
  import type { MyPerformanceRoiTrendPoint } from '../types'

  defineOptions({ name: 'MyPerformancePanelRoiTrend' })

  const chartSkHeights = [48, 72, 56, 88, 64, 92, 52]

  const props = withDefaults(
    defineProps<{
      loading?: boolean
      title: string
      points: MyPerformanceRoiTrendPoint[]
    }>(),
    { loading: false, points: () => [] }
  )

  const chartRef = ref<HTMLElement | null>(null)
  let chart: ReturnType<typeof echarts.init> | null = null
  let initRetryTimer: number | null = null

  function formatXLabel(date: string): string {
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return `${date.slice(5, 7)}/${date.slice(8, 10)}`
    }
    return date
  }

  function calcYAxisMax(values: number[]): number {
    const nums = values.map((v) => Number(v)).filter((n) => Number.isFinite(n))
    const rawMax = nums.length ? Math.max(...nums) : 100
    if (rawMax <= 100) return 110
    // 向上取整到 10 的倍数并留出一点顶部空间，避免线条顶到图例区域
    return Math.ceil((rawMax * 1.08) / 10) * 10
  }

  function buildOption(): EChartsOption {
    const x = props.points.map((p) => formatXLabel(p.date))
    const y = props.points.map((p) => p.roi)
    const hasTarget = props.points.some(
      (p) => p.targetRoi != null && Number.isFinite(p.targetRoi as number)
    )
    const yTarget = hasTarget
      ? props.points.map((p) => (p.targetRoi != null ? p.targetRoi : 0))
      : []
    const yAxisMax = calcYAxisMax([...y, ...yTarget])

    const series: EChartsOption['series'] = [
      {
        name: '实际 ROI',
        type: 'line',
        data: y,
        smooth: true,
        smoothMonotone: 'x',
        symbolSize: 8,
        emphasis: {
          focus: 'series',
          itemStyle: {
            shadowBlur: 16,
            shadowColor: 'rgba(34, 211, 238, 0.55)'
          }
        },
        lineStyle: {
          width: 3,
          shadowBlur: 12,
          shadowColor: 'rgba(34, 211, 238, 0.35)',
          shadowOffsetY: 2,
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: 'rgba(59, 130, 246, 0.98)' },
            { offset: 0.5, color: 'rgba(34, 211, 238, 0.98)' },
            { offset: 1, color: 'rgba(16, 185, 129, 0.98)' }
          ])
        },
        itemStyle: {
          color: 'rgba(34, 211, 238, 0.98)',
          borderColor: 'rgba(244, 244, 245, 0.45)',
          borderWidth: 2,
          shadowBlur: 8,
          shadowColor: 'rgba(34, 211, 238, 0.4)'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(59, 130, 246, 0.32)' },
            { offset: 0.45, color: 'rgba(34, 211, 238, 0.14)' },
            { offset: 1, color: 'rgba(16, 185, 129, 0)' }
          ])
        },
        animationDuration: 1200,
        animationEasing: 'cubicOut'
      }
    ]

    if (hasTarget) {
      series.push({
        name: '目标 ROI',
        type: 'line',
        data: yTarget,
        smooth: true,
        smoothMonotone: 'x',
        symbolSize: 4,
        lineStyle: {
          width: 2,
          type: 'dashed',
          color: 'rgba(161, 161, 170, 0.85)'
        },
        itemStyle: { color: 'rgba(161, 161, 170, 0.95)' }
      })
    }

    return {
      grid: { top: hasTarget ? 46 : 24, right: 16, bottom: 26, left: 38 },
      legend: hasTarget
        ? {
            top: 0,
            right: 8,
            textStyle: { color: 'rgba(161,161,170,0.9)', fontSize: 11 }
          }
        : undefined,
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
        max: yAxisMax,
        splitLine: { lineStyle: { color: 'rgba(148,163,184,0.12)' } },
        axisLabel: { color: 'rgba(161,161,170,0.9)', formatter: '{value}%' }
      },
      series
    }
  }

  function clearInitRetryTimer() {
    if (initRetryTimer != null) {
      window.clearTimeout(initRetryTimer)
      initRetryTimer = null
    }
  }

  function canInitChart(el: HTMLElement) {
    return el.clientWidth > 0 && el.clientHeight > 0
  }

  function scheduleSyncChartRetry() {
    if (initRetryTimer != null) return
    initRetryTimer = window.setTimeout(() => {
      initRetryTimer = null
      syncChart()
    }, 80)
  }

  function syncChart() {
    if (props.loading || !chartRef.value) return
    if (!canInitChart(chartRef.value)) {
      // 容器尺寸为 0 时跳过本次初始化，延迟重试可避免 ECharts 0 宽高告警
      scheduleSyncChartRetry()
      return
    }
    clearInitRetryTimer()
    if (!chart) chart = echarts.init(chartRef.value)
    chart.setOption(buildOption())
    chart.resize()
  }

  function resize() {
    chart?.resize()
  }

  function resizeAfterActivate() {
    nextTick(() => {
      requestAnimationFrame(() => {
        chart?.resize()
      })
      window.setTimeout(() => chart?.resize(), 80)
      window.setTimeout(() => chart?.resize(), 220)
    })
  }

  onMounted(() => {
    window.addEventListener('resize', resize)
  })

  onActivated(() => {
    if (props.loading) return
    resizeAfterActivate()
  })

  watch(
    () => props.loading,
    async (ld) => {
      if (ld) {
        clearInitRetryTimer()
        chart?.dispose()
        chart = null
        return
      }
      await nextTick()
      syncChart()
    },
    { immediate: true }
  )

  watch(
    () => props.points,
    () => {
      syncChart()
    },
    { deep: true }
  )

  onBeforeUnmount(() => {
    clearInitRetryTimer()
    window.removeEventListener('resize', resize)
    chart?.dispose()
    chart = null
  })
</script>

<style scoped lang="scss">
  @use '../styles/mp-card-fx.scss' as *;

  .panel {
    position: relative;
    overflow: hidden;
    backdrop-filter: blur(16px) saturate(1.12);
    border: 1px solid rgb(63 63 70 / 40%);
    border-radius: 16px;

    @include mp-neon-stack;
    @include mp-card-mesh;
    @include mp-panel-hover-lift;
    @include mp-panel-header-title-hover;

    &::before {
      position: absolute;
      bottom: -40%;
      left: -20%;
      z-index: 0;
      width: 70%;
      height: 80%;
      pointer-events: none;
      content: '';
      background: radial-gradient(ellipse at center, rgb(59 130 246 / 16%) 0%, transparent 70%);
      animation: roi-glow-drift 8s ease-in-out infinite alternate;
    }
  }

  @keyframes roi-glow-drift {
    0% {
      opacity: 0.5;
      transform: translate(0, 0);
    }

    100% {
      opacity: 1;
      transform: translate(8%, -5%);
    }
  }

  .panel__header {
    position: relative;
    z-index: 1;
    padding: 12px 16px;
    border-bottom: 1px solid rgb(63 63 70 / 30%);
  }

  .title {
    font-size: 14px;

    @include mp-title-gradient;
  }

  .roi-sk-title {
    width: 38% !important;
    height: 16px !important;
  }

  .chart--sk {
    display: flex;
    align-items: stretch;
    justify-content: center;
    padding: 8px 0 0;
  }

  .chart--sk :deep(.el-skeleton) {
    width: 100%;
  }

  .chart__sk-bars {
    display: flex;
    gap: 12px;
    align-items: flex-end;
    justify-content: space-between;
    width: 100%;
    min-height: 180px;
    padding: 0 8px 12px;
  }

  .chart__sk-col {
    flex: 1 1 0;
    min-width: 0;
    max-width: 100%;
  }

  .chart__sk-bar {
    width: 100% !important;
    height: 100% !important;
    margin: 0 !important;
    border-radius: 6px 6px 2px 2px;
  }

  .panel__body {
    position: relative;
    z-index: 1;
    padding: 10px 14px 16px;
  }

  .chart {
    width: 100%;
    height: 216px;
    filter: drop-shadow(0 4px 20px rgb(34 211 238 / 8%));
    transition: filter 0.5s var(--ease-out);
    transform-origin: center center;
  }

  .panel:hover .chart {
    filter: drop-shadow(0 10px 36px rgb(34 211 238 / 18%)) brightness(1.06);
  }

  @media (prefers-reduced-motion: reduce) {
    .panel {
      transition: none;
    }

    .panel:hover {
      transform: none;
    }

    .panel:hover .panel__header .title {
      filter: none;
      transform: none;
    }

    .panel:hover .chart {
      filter: drop-shadow(0 4px 20px rgb(34 211 238 / 8%));
      transform: none;
    }

    .chart {
      transition: none;
    }

    .panel::before {
      animation: none;
    }

    .panel::after {
      opacity: 0.12;
    }
  }
</style>
