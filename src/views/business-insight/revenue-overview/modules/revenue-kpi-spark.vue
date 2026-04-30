<template>
  <div ref="chartRef" class="rev-kpi__spark" />
</template>

<script setup lang="ts">
  import { nextTick, onMounted, watch } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useSettingStore } from '@/store/modules/setting'
  import { useChart } from '@/hooks/core/useChart'
  import { graphic, type EChartsOption } from '@/plugins/echarts'
  import type { RevenueOverviewKpiCard } from '../mock'

  defineOptions({ name: 'RevenueKpiSpark' })

  const props = defineProps<{
    spark: number[]
    accent: RevenueOverviewKpiCard['accent']
  }>()

  const { chartRef, initChart, updateChart, isChartInitialized } = useChart({ autoTheme: true })
  const { isDark } = storeToRefs(useSettingStore())

  function getVar(el: HTMLElement | null, name: string, fallback: string) {
    const root = el ?? document.documentElement
    const v = getComputedStyle(root).getPropertyValue(name).trim()
    return v || fallback
  }

  function resolveAccent(): string {
    const dom = chartRef.value ?? null
    switch (props.accent) {
      case 'blue':
        return getVar(dom, '--rev-c-blue', '#60a5fa')
      case 'teal':
        return getVar(dom, '--rev-c-teal', '#20d6b5')
      case 'purple':
        return getVar(dom, '--rev-c-purple', '#a78bfa')
      case 'amber':
        return getVar(dom, '--rev-c-amber', '#f59e0b')
      case 'green':
        return getVar(dom, '--rev-c-green', '#22c55e')
      default:
        return getVar(dom, '--rev-c-indigo', '#60a5fa')
    }
  }

  function buildSparkOption(data: number[], accent: string): EChartsOption {
    return {
      grid: { left: 0, right: 0, top: 2, bottom: 0 },
      xAxis: { type: 'category', show: false, data: data.map((_, i) => i) },
      yAxis: { type: 'value', show: false, scale: true },
      series: [
        {
          type: 'line',
          data,
          smooth: true,
          symbol: 'none',
          lineStyle: { color: accent, width: 1.8 },
          areaStyle: {
            color: new graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: accent },
              { offset: 1, color: 'rgba(0,0,0,0)' }
            ]),
            opacity: 0.22
          }
        }
      ]
    }
  }

  function paint() {
    if (!chartRef.value) return
    const accent = resolveAccent()
    const data = Array.isArray(props.spark) ? props.spark : []
    const opt = buildSparkOption(data, accent)
    const empty = data.length === 0
    if (!isChartInitialized()) {
      initChart(opt, empty)
    } else {
      updateChart(opt)
    }
  }

  onMounted(() => {
    nextTick(() => paint())
  })

  watch(
    () => props.spark,
    () => nextTick(() => paint()),
    { deep: true }
  )

  watch(
    () => props.accent,
    () => nextTick(() => paint())
  )

  watch(isDark, () => nextTick(() => paint()))
</script>
