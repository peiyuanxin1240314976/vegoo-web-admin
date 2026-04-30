<template>
  <div class="profit-app-trend-spark">
    <span v-if="!hasData" class="profit-app-trend-spark__dash">—</span>
    <div v-else ref="hostRef" class="profit-app-trend-spark__chart" />
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
  import { useResizeObserver } from '@vueuse/core'
  import { echarts, type EChartsOption } from '@/plugins/echarts'
  import type { ProfitTrendPoint } from '../types'

  defineOptions({ name: 'ProfitAppRowTrendSpark' })

  const props = defineProps<{
    points?: ProfitTrendPoint[] | null
    lineColor?: string
  }>()

  const hostRef = ref<HTMLElement | null>(null)
  let chart: ReturnType<typeof echarts.init> | null = null

  const normalizedPoints = computed(() => {
    const arr = props.points
    if (!Array.isArray(arr) || !arr.length) return []
    return arr
      .map((p) => ({
        date: String(p?.date ?? '').trim(),
        profit: Number(p?.profit)
      }))
      .filter((p) => p.date && Number.isFinite(p.profit))
  })

  const hasData = computed(() => normalizedPoints.value.length > 0)

  function buildOption(): EChartsOption {
    const pts = normalizedPoints.value
    const dates = pts.map((p) => p.date)
    const values = pts.map((p) => p.profit)
    const color = (props.lineColor ?? '').trim() || '#a78bfa'

    const minV = Math.min(...values)
    const maxV = Math.max(...values)
    const spread = maxV - minV
    const pad = spread === 0 ? Math.max(Math.abs(maxV) * 0.06, 1) : spread * 0.12

    const single = values.length === 1

    return {
      backgroundColor: 'transparent',
      grid: { top: 4, right: 2, bottom: 2, left: 2, containLabel: false },
      xAxis: {
        type: 'category',
        data: dates,
        show: false,
        boundaryGap: false
      },
      yAxis: {
        type: 'value',
        show: false,
        scale: true,
        min: spread === 0 ? minV - pad : undefined,
        max: spread === 0 ? maxV + pad : undefined
      },
      series: [
        {
          type: 'line',
          data: values,
          smooth: true,
          showSymbol: !single,
          symbol: single ? 'circle' : 'none',
          symbolSize: single ? 5 : 0,
          lineStyle: { color, width: 1.6 },
          areaStyle: {
            color: `${color}30`
          }
        }
      ],
      tooltip: {
        trigger: 'axis',
        appendToBody: true,
        backgroundColor: '#0f1f3d',
        borderColor: '#1e40af',
        textStyle: { color: '#e2e8f0', fontSize: 11 },
        confine: true,
        axisPointer: {
          type: 'line',
          lineStyle: { color: '#64748b', width: 1 }
        },
        formatter: (raw: unknown) => {
          const list = Array.isArray(raw) ? raw : [raw]
          const first = list[0] as {
            axisValue?: string
            axisValueLabel?: string
            data?: number | number[]
            value?: number | number[]
          }
          const date = String(first?.axisValueLabel ?? first?.axisValue ?? '')
          let n: number
          if (Array.isArray(first?.value)) {
            n = Number(first.value[1])
          } else if (Array.isArray(first?.data)) {
            n = Number(first.data[1])
          } else if (first?.data !== undefined && typeof first.data === 'number') {
            n = first.data
          } else {
            n = Number(first?.value)
          }
          const profitStr = Number.isFinite(n)
            ? n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : '—'
          return `${date}<br/>利润: ${profitStr}`
        }
      }
    }
  }

  function disposeChart() {
    chart?.dispose()
    chart = null
  }

  function sync() {
    const el = hostRef.value
    const pts = normalizedPoints.value
    if (!el || !pts.length) {
      disposeChart()
      return
    }
    if (!chart) {
      chart = echarts.init(el, undefined, { renderer: 'canvas' })
    }
    chart.setOption(buildOption(), { notMerge: true })
    chart.resize()
  }

  watch(
    () => [normalizedPoints.value, props.lineColor] as const,
    () => {
      nextTick(() => {
        if (!hasData.value) disposeChart()
        else sync()
      })
    },
    { deep: true }
  )

  useResizeObserver(hostRef, () => {
    chart?.resize()
  })

  onMounted(() => {
    nextTick(() => {
      nextTick(sync)
    })
  })

  onBeforeUnmount(() => {
    disposeChart()
  })
</script>

<style scoped lang="scss">
  .profit-app-trend-spark {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 22px;
  }

  .profit-app-trend-spark__chart {
    width: 100%;
    min-width: 72px;
    max-width: 140px;
    height: 28px;
  }

  .profit-app-trend-spark__dash {
    line-height: 1;
    color: #475569;
  }
</style>
