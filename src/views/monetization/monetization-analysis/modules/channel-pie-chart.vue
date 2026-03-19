<template>
  <div class="channel-pie-panel cockpit-panel">
    <div class="panel-title">广告平台/分类占比</div>
    <div ref="chartRef" class="chart-container" />
  </div>
</template>

<script setup lang="ts">
  import * as echarts from 'echarts'
  import { useChart } from '@/hooks/core/useChart'
  import type { MonetizationPieItem } from '../types'
  import { MOCK_MONETIZATION_ANALYSIS } from '../mock/data'

  defineOptions({ name: 'MonetizationChannelPieChart' })

  const props = withDefaults(defineProps<{ data?: MonetizationPieItem[] }>(), {
    data: () => []
  })

  const { chartRef, initChart, updateChart } = useChart()
  const pieData = computed(() =>
    props.data?.length ? props.data : MOCK_MONETIZATION_ANALYSIS.channelPie
  )

  const option = computed<echarts.EChartsOption>(() => ({
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}%'
    },
    legend: {
      orient: 'vertical',
      right: 16,
      top: 'center',
      formatter: (name: string) => {
        const item = pieData.value.find((d) => d.name === name)
        return item ? `${name}: ${item.percent}%` : name
      }
    },
    series: [
      {
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderColor: 'var(--el-bg-color-page)',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{d}%'
        },
        data: pieData.value.map((d) => ({ name: d.name, value: d.percent }))
      }
    ]
  }))

  onMounted(() => initChart(option.value))
  watch(option, (opt) => updateChart(opt), { deep: true })
</script>

<style scoped lang="scss">
  .channel-pie-panel {
    padding: 16px;
    background: var(--el-fill-color-blank);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 10px;

    .panel-title {
      margin-bottom: 12px;
      font-size: 14px;
      font-weight: 500;
      color: var(--el-text-color-primary);
    }

    .chart-container {
      height: 260px;
    }
  }

  html.dark .channel-pie-panel {
    border-color: var(--el-border-color);
  }
</style>
