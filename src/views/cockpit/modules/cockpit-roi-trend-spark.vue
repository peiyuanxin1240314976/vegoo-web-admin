<template>
  <div ref="hostRef" class="cockpit-roi-trend-spark" />
</template>

<script setup lang="ts">
  import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
  import { useResizeObserver } from '@vueuse/core'
  import { echarts, type EChartsOption } from '@/plugins/echarts'

  defineOptions({ name: 'CockpitRoiTrendSpark' })

  const props = defineProps<{
    /** 近 7 日序列（如每日安装量或消耗） */
    trend: number[]
    lineColor: string
  }>()

  const hostRef = ref<HTMLElement | null>(null)
  let chart: ReturnType<typeof echarts.init> | null = null

  function buildOption(trend: number[], lineColor: string): EChartsOption {
    return {
      grid: { top: 2, right: 2, bottom: 2, left: 2, containLabel: false },
      xAxis: { type: 'category', show: false, data: trend.map((_, i) => i) },
      yAxis: { type: 'value', show: false, scale: true },
      series: [
        {
          type: 'line',
          data: trend,
          smooth: true,
          showSymbol: false,
          lineStyle: { color: lineColor, width: 1 },
          areaStyle: { color: lineColor + '40' }
        }
      ]
    }
  }

  function sync() {
    const el = hostRef.value
    const data = props.trend
    if (!el || !data?.length) return
    if (!chart) chart = echarts.init(el)
    chart.setOption(buildOption(data, props.lineColor), { replaceMerge: ['series'] })
    chart.resize()
  }

  watch(
    () => [props.trend, props.lineColor] as const,
    () => {
      nextTick(sync)
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
    chart?.dispose()
    chart = null
  })
</script>

<style scoped lang="scss">
  .cockpit-roi-trend-spark {
    width: 100%;
    min-width: 40px;
    height: 24px;
  }
</style>
