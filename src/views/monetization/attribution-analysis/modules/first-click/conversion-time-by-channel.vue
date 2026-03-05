<template>
  <div class="conversion-time-by-channel art-card">
    <h3 class="chart-title">分渠道转化时间</h3>
    <div ref="chartRef" class="chart-container" />
  </div>
</template>

<script setup lang="ts">
  import { computed, nextTick, ref, onMounted, onBeforeUnmount } from 'vue'
  import { graphic, type EChartsOption } from '@/plugins/echarts'
  import { hexToRgba } from '@/utils/ui'
  import { useChart } from '@/hooks/core/useChart'

  defineOptions({ name: 'ConversionTimeByChannel' })

  // 与参考图一致：浅蓝、深蓝、绿、黄、紫
  const CHANNEL_COLORS = ['#4ABEFF', '#5470c6', '#67c23a', '#fac858', '#9a60b4']

  const props = withDefaults(
    defineProps<{
      channels?: Array<{ name: string; data: number[] }>
      xAxisData?: string[]
    }>(),
    {
      xAxisData: () => Array.from({ length: 31 }, (_, i) => `${i}`),
      channels: () => [
        {
          name: 'Google Ads',
          data: [
            2, 5, 8, 12, 15, 18, 20, 18, 15, 12, 10, 8, 6, 5, 4, 3, 2, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0
          ]
        },
        {
          name: 'Facebook',
          data: [
            1, 3, 6, 10, 14, 16, 18, 16, 14, 11, 9, 7, 5, 4, 3, 2, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0
          ]
        },
        {
          name: 'TikTok',
          data: [
            3, 7, 11, 15, 19, 22, 20, 17, 14, 11, 8, 6, 4, 3, 2, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0
          ]
        },
        {
          name: 'Unity',
          data: [
            1, 2, 4, 6, 8, 10, 12, 10, 8, 6, 4, 3, 2, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0
          ]
        },
        {
          name: 'Organic',
          data: [
            2, 4, 7, 9, 11, 13, 14, 12, 10, 8, 6, 5, 4, 3, 2, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0
          ]
        }
      ]
    }
  )

  const {
    chartRef,
    initChart,
    updateChart,
    handleResize,
    isDark,
    getAxisLineStyle,
    getAxisLabelStyle,
    getTooltipStyle,
    getLegendStyle
  } = useChart()

  const option = computed<EChartsOption>(() => {
    void isDark.value
    return {
      tooltip: {
        ...getTooltipStyle('axis'),
        formatter: (params: any) => {
          if (!Array.isArray(params)) return ''
          const day = params[0]?.axisValue ?? ''
          const lines = params.map((p: any) => `${p.marker} ${p.seriesName}: ${p.value}%`)
          return `第 ${day} 天<br/>${lines.join('<br/>')}`
        }
      },
      legend: {
        ...getLegendStyle('top'),
        top: 8,
        data: props.channels.map((c) => c.name)
      },
      grid: { left: '3%', right: '4%', bottom: '10%', top: 40, containLabel: true },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: props.xAxisData,
        axisLine: getAxisLineStyle(true),
        axisLabel: getAxisLabelStyle(true),
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        name: '占比(%)',
        max: 25,
        axisLine: { show: false },
        axisLabel: getAxisLabelStyle(true),
        splitLine: { lineStyle: { type: 'dashed', opacity: 0.3 } }
      },
      series: props.channels.map((c, i) => {
        const hex = CHANNEL_COLORS[i % CHANNEL_COLORS.length]
        return {
          name: c.name,
          type: 'line',
          smooth: true,
          showSymbol: false,
          lineStyle: { width: 2, color: hex },
          areaStyle: {
            color: new graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: hexToRgba(hex, 0.45).rgba },
              { offset: 1, color: hexToRgba(hex, 0.02).rgba }
            ])
          },
          data: c.data
        }
      })
    }
  })

  const hasInited = ref(false)
  let resizeObserver: ResizeObserver | null = null
  let intersectionObserver: IntersectionObserver | null = null

  function isInViewport(el: HTMLElement) {
    const rect = el.getBoundingClientRect()
    return rect.top < window.innerHeight && rect.bottom > 0
  }

  function tryInit() {
    if (!chartRef.value || hasInited.value) return
    const rect = chartRef.value.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return
    if (!isInViewport(chartRef.value)) return
    hasInited.value = true
    initChart(option.value)
  }

  onMounted(() => {
    nextTick(() => {
      tryInit()
      if (!chartRef.value) return
      resizeObserver = new ResizeObserver(() => {
        if (hasInited.value) handleResize()
        else tryInit()
      })
      resizeObserver.observe(chartRef.value)
      intersectionObserver = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) tryInit()
        },
        { root: null, threshold: 0.01 }
      )
      intersectionObserver.observe(chartRef.value)
      setTimeout(tryInit, 100)
      setTimeout(tryInit, 400)
    })
  })

  onBeforeUnmount(() => {
    resizeObserver?.disconnect()
    intersectionObserver?.disconnect()
  })

  watch(
    option,
    (v) => {
      if (hasInited.value) updateChart(v)
    },
    { deep: true }
  )
</script>

<style scoped lang="scss">
  .conversion-time-by-channel {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    padding: 16px;
  }

  .chart-title {
    margin: 0 0 12px;
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .chart-container {
    flex: 1;
    height: 220px;
    min-height: 220px;
  }
</style>
