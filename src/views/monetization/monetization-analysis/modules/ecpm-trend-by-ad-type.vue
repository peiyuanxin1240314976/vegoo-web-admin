<template>
  <ElCard class="cockpit-panel monetization-panel" shadow="never">
    <template #header>
      <span>eCPM 趋势 - 按广告类型</span>
    </template>
    <div ref="containerRef" class="chart-container" />
  </ElCard>
</template>

<script setup lang="ts">
  import { onMounted, onUnmounted, watch, computed, nextTick, ref } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useSettingStore } from '@/store/modules/setting'
  import { echarts } from '@/plugins/echarts'
  import type { EChartsOption } from 'echarts'
  import type { MonetizationEcpmByAdType } from '../types'
  import { MOCK_MONETIZATION_ANALYSIS } from '../mock/data'

  defineOptions({ name: 'MonetizationEcpmTrendByAdType' })

  const props = withDefaults(defineProps<{ data?: MonetizationEcpmByAdType | null }>(), {
    data: null
  })

  const { isDark } = storeToRefs(useSettingStore())
  const containerRef = ref<HTMLElement | null>(null)
  let chartInstance: ReturnType<typeof echarts.init> | null = null
  const data = computed(() => props.data ?? MOCK_MONETIZATION_ANALYSIS.ecpmByAdType)

  const lineColors = ['#f56c6c', '#409eff', '#67c23a', '#e6a23c']

  /** 随深色/浅色模式区分的坐标轴与图例文字颜色 */
  const textColor = computed(() => (isDark.value ? 'rgba(255,255,255,0.85)' : '#303133'))
  const axisLineColor = computed(() =>
    isDark.value ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'
  )
  const splitLineColor = computed(() =>
    isDark.value ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'
  )

  function buildOption(): EChartsOption {
    const d = data.value
    if (!d?.dates?.length || !d?.series?.length) return {}
    const color = textColor.value
    const series = d.series.map((s, i) => {
      const values = s.value
      const lastValue = values?.length ? values[values.length - 1] : 0
      return {
        name: `${s.name}: $${Number(lastValue).toFixed(2)}`,
        type: 'line' as const,
        smooth: true,
        data: s.value,
        lineStyle: { color: lineColors[i % lineColors.length], width: 2 },
        itemStyle: { color: lineColors[i % lineColors.length] },
        symbol: 'circle' as const,
        symbolSize: 6,
        emphasis: { focus: 'series' as const }
      }
    })
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' }
      },
      legend: {
        data: series.map((s) => s.name),
        right: 10,
        top: 'middle',
        orient: 'vertical',
        textStyle: {
          fontSize: 12,
          color,
          textBorderWidth: 0,
          textShadowColor: 'transparent'
        }
      },
      grid: {
        left: '3%',
        right: '18%',
        bottom: '12%',
        top: '8%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: d.dates,
        axisLine: { lineStyle: { color: axisLineColor.value } },
        axisLabel: { color }
      },
      yAxis: {
        type: 'value',
        name: 'eCPM ($)',
        min: 0,
        nameTextStyle: { color },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color },
        splitLine: { lineStyle: { type: 'dashed', color: splitLineColor.value, opacity: 0.6 } }
      },
      series
    }
  }

  function initEcpmChart() {
    if (!containerRef.value) return
    chartInstance = echarts.init(containerRef.value)
    const option = buildOption()
    if (option && Object.keys(option).length) {
      chartInstance.setOption(option)
    }
  }

  function updateEcpmChart() {
    if (!chartInstance) return
    const option = buildOption()
    if (option && Object.keys(option).length) {
      chartInstance.setOption(option)
    }
  }

  onMounted(() => {
    nextTick(() => {
      initEcpmChart()
    })
  })

  onUnmounted(() => {
    if (chartInstance) {
      chartInstance.dispose()
      chartInstance = null
    }
  })

  watch(data, () => updateEcpmChart(), { deep: true })
  watch(isDark, () => updateEcpmChart())
</script>

<style scoped lang="scss">
  .monetization-panel {
    margin-bottom: 16px;

    :deep(.el-card__body) {
      padding: 12px;
    }
  }

  .chart-container {
    width: 100%;
    height: 260px;
  }
</style>
