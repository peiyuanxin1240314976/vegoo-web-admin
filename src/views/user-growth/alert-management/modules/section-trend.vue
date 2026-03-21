<template>
  <div class="am-trend">
    <ElCard class="am-trend__card" shadow="never">
      <template #header>
        <span>{{ block.title }}</span>
      </template>
      <div ref="trendRef" class="am-trend__chart" />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { watch, onMounted, onBeforeUnmount } from 'vue'
  import { useChart } from '@/hooks/core/useChart'
  import type { EChartsOption } from '@/plugins/echarts'
  import type { AlertTrendBlock } from '../types'

  defineOptions({ name: 'AmSectionTrend' })

  const props = defineProps<{
    block: AlertTrendBlock
  }>()

  const chart = useChart()
  const trendRef = chart.chartRef

  function buildOption(uc: ReturnType<typeof useChart>): EChartsOption {
    const { getAxisLineStyle, getSplitLineStyle, getAxisLabelStyle, getTooltipStyle } = uc
    const b = props.block
    return {
      tooltip: { ...getTooltipStyle('axis') },
      legend: {
        data: b.series.map((s) => s.name),
        top: 0,
        left: 0,
        textStyle: { color: 'var(--art-gray-600)', fontSize: 11 },
        itemWidth: 12,
        itemHeight: 8
      },
      grid: { top: 32, right: 12, bottom: 28, left: 0, containLabel: true },
      xAxis: {
        type: 'category',
        data: b.dates,
        axisLine: getAxisLineStyle(),
        axisTick: { show: false },
        axisLabel: getAxisLabelStyle()
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
        axisLabel: getAxisLabelStyle(),
        splitLine: getSplitLineStyle()
      },
      series: b.series.map((s) => ({
        name: s.name,
        type: 'line',
        smooth: true,
        data: s.data,
        lineStyle: { color: s.color, width: 2 },
        itemStyle: { color: s.color },
        symbol: 'circle',
        symbolSize: 4,
        areaStyle: { color: s.color, opacity: 0.08 }
      }))
    }
  }

  function render() {
    chart.initChart(buildOption(chart))
  }

  watch(
    () => props.block,
    () => render(),
    { deep: true }
  )

  onMounted(() => render())

  onBeforeUnmount(() => chart.getChartInstance()?.dispose())
</script>

<style scoped lang="scss">
  .am-trend__card {
    :deep(.el-card__header) {
      padding: 10px 14px;
      font-size: 13px;
      font-weight: 600;
      color: var(--art-gray-800);
    }

    :deep(.el-card__body) {
      padding: 10px 14px 14px;
    }
  }

  .am-trend__chart {
    width: 100%;
    height: 220px;
  }
</style>
