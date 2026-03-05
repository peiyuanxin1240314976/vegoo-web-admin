<template>
  <ElCard class="cockpit-panel monetization-panel" shadow="never">
    <template #header>
      <span>收入与 eCPM 趋势</span>
    </template>
    <div ref="chartRef" class="chart-container" />
  </ElCard>
</template>

<script setup lang="ts">
  import { onMounted, watch, computed } from 'vue'
  import { useChart } from '@/hooks/core/useChart'
  import type { EChartsOption } from 'echarts'
  import type { MonetizationRevenueEcpMTrend } from '../types'
  import { MOCK_MONETIZATION_ANALYSIS } from '../mock/data'

  defineOptions({ name: 'MonetizationRevenueEcpMTrend' })

  const props = withDefaults(defineProps<{ data?: MonetizationRevenueEcpMTrend | null }>(), {
    data: null
  })

  const { chartRef, initChart, updateChart } = useChart()
  const data = computed(() => props.data ?? MOCK_MONETIZATION_ANALYSIS.revenueEcpMTrend)

  function buildOption(): EChartsOption {
    const d = data.value
    return {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const axisVal = params?.[0]?.axisValue ?? ''
          const revenue = params?.find((p: any) => p.seriesName === '广告收入')?.value ?? 0
          const ecpm = params?.find((p: any) => p.seriesName === '平均 eCPM')?.value ?? 0
          return `${axisVal}<br/>广告收入 $${Number(revenue).toLocaleString()}<br/>平均 eCPM $${Number(ecpm).toFixed(2)}`
        }
      },
      legend: { data: ['广告收入', '平均 eCPM'], bottom: 0 },
      grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
      xAxis: { type: 'category', boundaryGap: true, data: d.dates },
      yAxis: [
        {
          type: 'value',
          name: '收入 ($)',
          splitLine: { lineStyle: { type: 'dashed', opacity: 0.5 } }
        },
        { type: 'value', name: 'eCPM ($)', splitLine: { show: false } }
      ],
      series: [
        { name: '广告收入', type: 'bar', data: d.adRevenue, itemStyle: { color: '#67c23a' } },
        {
          name: '平均 eCPM',
          type: 'line',
          yAxisIndex: 1,
          data: d.avgEcpM,
          smooth: true,
          itemStyle: { color: '#409eff' }
        }
      ]
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
    height: 280px;
  }
</style>
