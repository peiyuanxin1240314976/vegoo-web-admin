<template>
  <div class="channel-attribution-chart art-card">
    <h3 class="chart-title">渠道归因-模型对比图表</h3>
    <div ref="chartRef" class="chart-container" />
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { type EChartsOption } from '@/plugins/echarts'
  import { useChart, useChartOps } from '@/hooks/core/useChart'

  defineOptions({ name: 'ChannelAttributionChart' })

  const props = withDefaults(
    defineProps<{
      channels?: string[]
      series?: Array<{ name: string; data: number[]; color?: string }>
    }>(),
    {
      channels: () => ['Google Ads', 'Facebook', 'TikTok', 'Unity', 'Organic'],
      series: () => [
        { name: '末次点击', data: [28000, 32000, 31000, 18000, 25000], color: '#91cc75' },
        { name: '首次点击', data: [22000, 35000, 42000, 15000, 22000], color: '#5470c6' },
        { name: '线性', data: [25000, 33000, 36000, 16500, 23500], color: '#ee6666' },
        { name: '时间衰减', data: [26000, 34000, 38000, 17000, 24000], color: '#fac858' },
        { name: '数据驱动', data: [25500, 33500, 37000, 16800, 23800], color: '#9a60b4' }
      ]
    }
  )

  const {
    chartRef,
    initChart,
    updateChart,
    isDark,
    getAxisLineStyle,
    getAxisLabelStyle,
    getTooltipStyle,
    getLegendStyle
  } = useChart()
  const colors = useChartOps().colors

  const option = computed<EChartsOption>(() => {
    void isDark.value
    return {
      tooltip: {
        ...getTooltipStyle('axis'),
        formatter: (params: any) => {
          if (!Array.isArray(params)) return ''
          const channel = params[0]?.axisValue ?? ''
          const lines = params.map(
            (p: any) => `${p.marker} ${p.seriesName}: ${Number(p.value).toLocaleString()} 安装量`
          )
          return `${channel}<br/>${lines.join('<br/>')}`
        }
      },
      legend: {
        ...getLegendStyle('top'),
        top: 8,
        data: props.series.map((s) => s.name)
      },
      grid: { left: '3%', right: '4%', bottom: '8%', top: 48, containLabel: true },
      xAxis: {
        type: 'category',
        data: props.channels,
        axisLine: getAxisLineStyle(true),
        axisLabel: getAxisLabelStyle(true),
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        name: '安装量',
        axisLine: { show: false },
        axisLabel: getAxisLabelStyle(true),
        splitLine: { lineStyle: { type: 'dashed', opacity: 0.4 } }
      },
      series: props.series.map((s, i) => ({
        name: s.name,
        type: 'bar',
        barWidth: '14%',
        data: s.data,
        itemStyle: { color: s.color ?? colors[i % colors.length] }
      }))
    }
  })

  onMounted(() => {
    initChart(option.value)
  })
  watch(option, (v) => updateChart(v), { deep: true })
</script>

<style scoped lang="scss">
  .channel-attribution-chart {
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
    min-height: 280px;
  }
</style>
