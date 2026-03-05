<template>
  <ElCard class="cockpit-panel monetization-panel" shadow="never">
    <template #header>
      <span>eCPM 趋势 - 按广告类型</span>
    </template>
    <div ref="chartRef" class="chart-container" />
  </ElCard>
</template>

<script setup lang="ts">
  import { onMounted, watch, computed } from 'vue'
  import { useChart } from '@/hooks/core/useChart'
  import type { EChartsOption } from 'echarts'
  import type { MonetizationEcpmByAdType } from '../types'
  import { MOCK_MONETIZATION_ANALYSIS } from '../mock/data'

  defineOptions({ name: 'MonetizationEcpmTrendByAdType' })

  const props = withDefaults(defineProps<{ data?: MonetizationEcpmByAdType | null }>(), {
    data: null
  })

  const { chartRef, initChart, updateChart } = useChart()
  const data = computed(() => props.data ?? MOCK_MONETIZATION_ANALYSIS.ecpmByAdType)

  const lineColors = ['#f56c6c', '#409eff', '#67c23a', '#e6a23c']

  function buildOption(): EChartsOption {
    const d = data.value
    const series = d.series.map((s, i) => ({
      name: s.name,
      type: 'line',
      smooth: true,
      data: s.value,
      itemStyle: { color: lineColors[i % lineColors.length] }
    }))
    return {
      tooltip: { trigger: 'axis' },
      legend: { data: d.series.map((s) => s.name), bottom: 0 },
      grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
      xAxis: { type: 'category', boundaryGap: false, data: d.dates },
      yAxis: {
        type: 'value',
        name: 'eCPM ($)',
        min: 0,
        splitLine: { lineStyle: { type: 'dashed', opacity: 0.5 } }
      },
      series
    }
  }

  onMounted(() => {
    initChart(buildOption())
  })
  watch(data, () => updateChart(buildOption()), { deep: true })
</script>

<style scoped lang="scss">
  .monetization-panel {
    margin-bottom: 16px;

    :deep(.el-card__body) {
      padding: 12px;
    }
  }

  .chart-container {
    height: 260px;
  }
</style>
