<template>
  <ElCard class="cockpit-panel" shadow="never">
    <template #header>
      <span>收入与成本趋势</span>
    </template>
    <div ref="chartRef" class="trend-chart"></div>
  </ElCard>
</template>

<script setup lang="ts">
  import { onMounted, watch, computed } from 'vue'
  import { useChart } from '@/hooks/core/useChart'
  import type { EChartsOption } from 'echarts'
  import type { CockpitRevenueCostTrend as TrendData } from '../types'
  import { MOCK_COCKPIT_OVERVIEW } from '../mock/data'

  defineOptions({ name: 'CockpitRevenueCostTrend' })

  const props = withDefaults(defineProps<{ trendData?: TrendData | null }>(), { trendData: null })

  const { chartRef, initChart, updateChart } = useChart()

  const data = computed(() => props.trendData ?? MOCK_COCKPIT_OVERVIEW.revenueCostTrend)

  function buildOption(): EChartsOption {
    const d = data.value
    return {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const axisVal = params?.[0]?.axisValue || ''
          const cost = params?.find((p: any) => p.seriesName === '消耗')?.value ?? 0
          const revenue = params?.find((p: any) => p.seriesName === '收入')?.value ?? 0
          return `${axisVal} 消耗$${cost} 收入$${revenue}`
        }
      },
      legend: { data: ['收入', '消耗'], bottom: 0 },
      grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
      xAxis: { type: 'category', boundaryGap: true, data: d.dates },
      yAxis: {
        type: 'value',
        name: '$',
        splitLine: { lineStyle: { type: 'dashed', opacity: 0.5 } }
      },
      series: [
        { name: '收入', type: 'bar', data: d.revenue, itemStyle: { color: '#67c23a' } },
        { name: '消耗', type: 'line', data: d.cost, smooth: true, itemStyle: { color: '#e6a23c' } }
      ]
    }
  }

  onMounted(() => {
    initChart(buildOption())
  })
  watch(data, () => updateChart(buildOption()), { deep: true })
</script>

<style scoped lang="scss">
  .cockpit-panel {
    height: 100%;

    :deep(.el-card__body) {
      padding: 12px;
    }
  }

  .trend-chart {
    height: 260px;
  }
</style>
