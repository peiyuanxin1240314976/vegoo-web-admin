<template>
  <ElRow :gutter="16" class="ad-performance-trend-charts">
    <!-- 花费趋势 -->
    <ElCol :xs="24" :md="12">
      <ElCard class="ad-performance-trend-charts__card" shadow="never">
        <template #header>
          <span class="ad-performance-trend-charts__title">
            {{ tr('adPerformance.spendTrend', '花费趋势') }}
          </span>
          <span class="ad-performance-trend-charts__title-dot spend-dot"></span>
        </template>
        <div v-if="loading" class="ad-performance-trend-charts__skeleton">
          <div class="chart-sk">
            <div v-for="i in 10" :key="i" class="chart-sk__bar" :style="barStyle(i, 10)"></div>
          </div>
        </div>
        <div v-show="!loading" ref="spendChartRef" class="ad-performance-trend-charts__chart"></div>
      </ElCard>
    </ElCol>

    <!-- ROI 趋势 -->
    <ElCol :xs="24" :md="12">
      <ElCard class="ad-performance-trend-charts__card" shadow="never">
        <template #header>
          <span class="ad-performance-trend-charts__title">
            {{ tr('adPerformance.roi7dTrend', '7日ROI趋势') }}
          </span>
          <span class="ad-performance-trend-charts__title-dot roi-dot"></span>
        </template>
        <div v-if="loading" class="ad-performance-trend-charts__skeleton">
          <div class="chart-sk chart-sk--line">
            <svg viewBox="0 0 200 60" preserveAspectRatio="none" class="chart-sk__svg">
              <polyline
                points="0,50 20,38 40,42 60,28 80,35 100,20 120,26 140,18 160,24 180,15 200,20"
                fill="none"
                stroke="url(#sk-line-grad)"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <defs>
                <linearGradient id="sk-line-grad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stop-color="rgb(16 185 129 / 30%)" />
                  <stop offset="50%" stop-color="rgb(34 211 238 / 40%)" />
                  <stop offset="100%" stop-color="rgb(59 130 246 / 30%)" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
        <div v-show="!loading" ref="roiChartRef" class="ad-performance-trend-charts__chart"></div>
      </ElCard>
    </ElCol>
  </ElRow>
</template>

<script setup lang="ts">
  import { watch, nextTick } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useChart } from '@/hooks/core/useChart'
  import { graphic } from '@/plugins/echarts'
  import type { SpendTrendItem, Roi7dTrendItem } from '../types'

  defineOptions({ name: 'AdPerformanceTrendCharts' })

  const { t, te } = useI18n()
  const tr = (key: string, fallback: string) => (te(key) ? t(key) : fallback)

  const props = withDefaults(
    defineProps<{
      spendTrend?: SpendTrendItem[]
      roi7dTrend?: Roi7dTrendItem[]
      loading?: boolean
    }>(),
    { spendTrend: () => [], roi7dTrend: () => [], loading: false }
  )

  const ROI_TARGET = 80

  const spendChart = useChart()
  const spendChartRef = spendChart.chartRef

  const roiChart = useChart()
  const roiChartRef = roiChart.chartRef

  /** 骨架 bar 随机高度（模拟柱状图） */
  function barStyle(i: number, total: number) {
    const heights = [45, 62, 38, 75, 55, 80, 48, 68, 58, 72]
    const h = heights[(i - 1) % heights.length]
    const hue = Math.round((i / total) * 30)
    return {
      height: `${h}%`,
      background: `linear-gradient(180deg, hsl(${30 + hue}deg 90% 60% / 35%) 0%, transparent 100%)`
    }
  }

  function renderSpendChart() {
    const data = props.spendTrend
    const isDark = spendChart.isDark.value
    spendChart.initChart(
      {
        animation: true,
        animationDuration: 1000,
        animationEasing: 'cubicOut',
        animationDurationUpdate: 500,
        tooltip: {
          trigger: 'axis',
          backgroundColor: isDark ? 'rgba(15,20,36,0.94)' : 'rgba(255,255,255,0.96)',
          borderColor: isDark ? 'rgba(249,115,22,0.3)' : '#e5e7eb',
          borderWidth: 1,
          textStyle: { color: isDark ? '#e2e8f0' : '#374151', fontSize: 12 }
        },
        grid: { left: 42, right: 14, top: 14, bottom: 22 },
        xAxis: {
          type: 'category',
          data: data.map((t) => t.date),
          boundaryGap: false,
          axisLabel: { color: isDark ? '#52525b' : '#9ca3af', fontSize: 10 },
          axisLine: { lineStyle: { color: isDark ? '#27272a' : '#f3f4f6' } },
          axisTick: { show: false }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            color: isDark ? '#52525b' : '#9ca3af',
            fontSize: 10,
            formatter: (v: number) =>
              v >= 1000 ? `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}K` : String(v)
          },
          splitLine: {
            lineStyle: { color: isDark ? 'rgba(39,39,42,0.8)' : '#f9fafb', type: 'dashed' }
          }
        },
        series: [
          {
            type: 'line',
            data: data.map((t) => t.value),
            smooth: 0.5,
            symbol: 'circle',
            symbolSize: 8,
            showSymbol: false,
            emphasis: { scale: true, focus: 'series' },
            lineStyle: {
              width: 3,
              color: new graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: '#F97316' },
                { offset: 0.5, color: '#fb923c' },
                { offset: 1, color: '#fbbf24' }
              ]),
              shadowColor: 'rgba(249,115,22,0.45)',
              shadowBlur: 14,
              shadowOffsetY: 4
            },
            itemStyle: {
              color: '#F97316',
              borderWidth: 2.5,
              borderColor: isDark ? 'rgba(249,115,22,0.4)' : '#fff',
              shadowColor: 'rgba(249,115,22,0.5)',
              shadowBlur: 8
            },
            areaStyle: {
              color: new graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(249,115,22,0.42)' },
                { offset: 0.6, color: 'rgba(249,115,22,0.12)' },
                { offset: 1, color: 'rgba(249,115,22,0)' }
              ])
            }
          }
        ]
      },
      data.length === 0
    )
  }

  function renderRoiChart() {
    const data = props.roi7dTrend
    const isDark = roiChart.isDark.value
    roiChart.initChart(
      {
        animation: true,
        animationDuration: 1000,
        animationEasing: 'cubicOut',
        animationDurationUpdate: 500,
        tooltip: {
          trigger: 'axis',
          backgroundColor: isDark ? 'rgba(15,20,36,0.94)' : 'rgba(255,255,255,0.96)',
          borderColor: isDark ? 'rgba(16,185,129,0.3)' : '#e5e7eb',
          borderWidth: 1,
          textStyle: { color: isDark ? '#e2e8f0' : '#374151', fontSize: 12 },
          formatter: (params: any[]) => {
            const p = params[0]
            return (
              `${p.axisValue}<br/>` +
              `<span style="display:inline-block;width:8px;height:8px;` +
              `border-radius:50%;background:#10B981;margin-right:5px"></span>` +
              `${p.value}%`
            )
          }
        },
        grid: { left: 42, right: 14, top: 14, bottom: 22 },
        xAxis: {
          type: 'category',
          data: data.map((t) => t.date),
          boundaryGap: false,
          axisLabel: { color: isDark ? '#52525b' : '#9ca3af', fontSize: 10 },
          axisLine: { lineStyle: { color: isDark ? '#27272a' : '#f3f4f6' } },
          axisTick: { show: false }
        },
        yAxis: {
          type: 'value',
          min: (v: { min: number }) => Math.max(0, Math.floor(v.min / 10) * 10 - 10),
          axisLabel: {
            color: isDark ? '#52525b' : '#9ca3af',
            fontSize: 10,
            formatter: '{value}%'
          },
          splitLine: {
            lineStyle: { color: isDark ? 'rgba(39,39,42,0.8)' : '#f9fafb', type: 'dashed' }
          }
        },
        series: [
          {
            type: 'line',
            data: data.map((t) => t.roi),
            smooth: 0.5,
            symbol: 'circle',
            symbolSize: 8,
            showSymbol: false,
            emphasis: { scale: true, focus: 'series' },
            lineStyle: {
              width: 3,
              color: new graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: '#10B981' },
                { offset: 0.5, color: '#22d3ee' },
                { offset: 1, color: '#3b82f6' }
              ]),
              shadowColor: 'rgba(16,185,129,0.45)',
              shadowBlur: 14,
              shadowOffsetY: 4
            },
            itemStyle: {
              color: '#10B981',
              borderWidth: 2.5,
              borderColor: isDark ? 'rgba(16,185,129,0.4)' : '#fff',
              shadowColor: 'rgba(16,185,129,0.5)',
              shadowBlur: 8
            },
            areaStyle: {
              color: new graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(16,185,129,0.42)' },
                { offset: 0.6, color: 'rgba(34,211,238,0.10)' },
                { offset: 1, color: 'rgba(59,130,246,0)' }
              ])
            },
            markLine: {
              silent: true,
              symbol: 'none',
              animation: false,
              label: {
                show: true,
                position: 'insideEndTop',
                formatter: `目标 ${ROI_TARGET}%`,
                color: isDark ? '#52525b' : '#9ca3af',
                fontSize: 10
              },
              lineStyle: { type: 'dashed', color: isDark ? '#3f3f46' : '#d1d5db', width: 1 },
              data: [{ yAxis: ROI_TARGET }]
            }
          }
        ]
      },
      data.length === 0
    )
  }

  async function syncCharts() {
    await nextTick()
    renderSpendChart()
    renderRoiChart()
  }

  watch(
    () => props.loading,
    async (ld) => {
      if (ld) {
        spendChart.getChartInstance()?.dispose()
        roiChart.getChartInstance()?.dispose()
        return
      }
      await syncCharts()
    },
    { immediate: true }
  )

  watch(
    () => [spendChart.isDark.value, props.spendTrend, props.roi7dTrend] as const,
    () => {
      if (!props.loading) syncCharts()
    },
    { deep: true }
  )
</script>

<style scoped lang="scss">
  @import '../styles/ap-card-fx';

  .ad-performance-trend-charts {
    margin-bottom: 16px;
  }

  .ad-performance-trend-charts__card {
    @include ap-neon-bg;

    position: relative;
    margin-bottom: 0;
    overflow: hidden;
    border-radius: 14px;

    @include ap-panel-hover;

    :deep(.el-card__header) {
      display: flex;
      gap: 8px;
      align-items: center;
      padding-bottom: 8px;
      font-size: 15px;
      font-weight: 700;
      color: var(--el-text-color-primary);
      letter-spacing: 0.03em;
      background: transparent;
      border-bottom: 1px solid rgb(63 63 70 / 35%);
      transition: filter 0.32s var(--ease-out);
    }

    &:hover :deep(.el-card__header) {
      filter: drop-shadow(0 0 12px rgb(34 211 238 / 28%));
    }

    :deep(.el-card__body) {
      padding-top: 8px;
      background: transparent;
    }

    /* 顶部扫光线 */
    &::before {
      position: absolute;
      top: 0;
      left: 5%;
      z-index: 0;
      width: 90%;
      height: 2px;
      pointer-events: none;
      content: '';
      background: linear-gradient(
        90deg,
        transparent,
        rgb(59 130 246 / 75%),
        rgb(6 182 212 / 85%),
        rgb(34 211 238 / 70%),
        transparent
      );
      filter: blur(0.5px);
    }

    /* 底部反光线 */
    &::after {
      position: absolute;
      bottom: 0;
      left: 10%;
      z-index: 0;
      width: 80%;
      height: 1px;
      pointer-events: none;
      content: '';
      background: linear-gradient(
        90deg,
        transparent,
        rgb(16 185 129 / 50%),
        rgb(59 130 246 / 40%),
        transparent
      );
    }
  }

  .ad-performance-trend-charts__title {
    @include ap-title-gradient;

    font-size: 15px;
  }

  .ad-performance-trend-charts__title-dot {
    flex-shrink: 0;
    width: 9px;
    height: 9px;
    border-radius: 50%;

    &.spend-dot {
      background: #f97316;
      box-shadow:
        0 0 6px #f97316,
        0 0 14px rgb(249 115 22 / 70%),
        0 0 24px rgb(249 115 22 / 35%);
    }

    &.roi-dot {
      background: #10b981;
      box-shadow:
        0 0 6px #10b981,
        0 0 14px rgb(16 185 129 / 70%),
        0 0 24px rgb(34 211 238 / 35%);
    }
  }

  .ad-performance-trend-charts__chart {
    position: relative;
    z-index: 1;
    height: 140px;
    min-height: 120px;
    transition:
      transform 0.42s var(--ease-out),
      filter 0.42s var(--ease-out);

    .ad-performance-trend-charts__card:hover & {
      filter: drop-shadow(0 8px 24px rgb(59 130 246 / 28%)) brightness(1.08);
      transform: scale(1.025) translateY(-3px);
    }
  }

  /* 骨架：模拟柱状图占位 */
  .ad-performance-trend-charts__skeleton {
    position: relative;
    z-index: 1;
    height: 140px;
    min-height: 120px;
  }

  .chart-sk {
    display: flex;
    gap: 6px;
    align-items: flex-end;
    height: 100%;
    padding: 10px 6px 6px;

    &__bar {
      flex: 1;
      min-width: 0;
      border-radius: 4px 4px 0 0;
      animation: chart-sk-pulse 1.5s ease-in-out infinite;
    }

    @for $i from 1 through 10 {
      &__bar:nth-child(#{$i}) {
        animation-delay: #{($i - 1) * 0.1}s;
      }
    }

    &--line {
      align-items: center;
      padding: 0;

      .chart-sk__svg {
        width: 100%;
        height: 100%;
        animation: chart-sk-pulse 1.8s ease-in-out infinite;
      }
    }
  }

  @keyframes chart-sk-pulse {
    0%,
    100% {
      opacity: 0.4;
    }

    50% {
      opacity: 0.9;
    }
  }

  @media (width <= 768px) {
    .ad-performance-trend-charts__chart,
    .ad-performance-trend-charts__skeleton {
      height: 180px;
    }

    .ad-performance-trend-charts {
      margin-bottom: 12px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ad-performance-trend-charts__card {
      transition: none;

      &:hover {
        transform: none;
      }

      &:hover :deep(.el-card__header) {
        filter: none;
      }
    }

    .ad-performance-trend-charts__chart {
      transition: none;

      .ad-performance-trend-charts__card:hover & {
        filter: none;
        transform: none;
      }
    }

    .chart-sk__bar,
    .chart-sk__svg {
      opacity: 0.6;
      animation: none;
    }
  }
</style>
