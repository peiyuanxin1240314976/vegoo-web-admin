<template>
  <ElCard class="cockpit-panel monetization-panel" shadow="never">
    <template #header>
      <span>填充率监控</span>
    </template>
    <div v-if="data?.warning" class="fill-rate-warning">
      <ElIcon color="var(--el-color-danger)"><WarningFilled /></ElIcon>
      <span>警告：{{ data.warning.message }}</span>
    </div>
    <div ref="chartRef" class="chart-container" />
  </ElCard>
</template>

<script setup lang="ts">
  import { onMounted, watch, computed } from 'vue'
  import { WarningFilled } from '@element-plus/icons-vue'
  import { useChart } from '@/hooks/core/useChart'
  import type { EChartsOption } from 'echarts'
  import type { MonetizationFillRateTrend } from '../types'
  import { MOCK_MONETIZATION_ANALYSIS } from '../mock/data'

  defineOptions({ name: 'MonetizationFillRateMonitoring' })

  const props = withDefaults(defineProps<{ data?: MonetizationFillRateTrend | null }>(), {
    data: null
  })

  const { chartRef, initChart, updateChart } = useChart()
  const data = computed(() => props.data ?? MOCK_MONETIZATION_ANALYSIS.fillRateTrend)

  const colors = ['#67c23a', '#409eff', '#e6a23c', '#909399']

  function buildOption(): EChartsOption {
    const d = data.value
    const series: EChartsOption['series'] = d.series.map((s, i) => ({
      name: s.name,
      type: 'line' as const,
      stack: 'Total',
      areaStyle: { color: colors[i % colors.length] },
      emphasis: { focus: 'series' },
      data: s.data
    }))
    return {
      tooltip: { trigger: 'axis' },
      legend: { data: d.series.map((s) => s.name), bottom: 0 },
      grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
      xAxis: { type: 'category', boundaryGap: false, data: d.dates },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        axisLabel: { formatter: '{value}%' },
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

  .fill-rate-warning {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 8px 12px;
    margin-bottom: 12px;
    font-size: 13px;
    color: var(--el-color-danger);
    background: rgb(245 108 108 / 10%);
    border-radius: 6px;
  }

  .chart-container {
    height: 260px;
  }
</style>
