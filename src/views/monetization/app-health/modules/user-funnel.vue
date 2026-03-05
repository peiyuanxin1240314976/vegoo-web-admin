<template>
  <ElCard class="app-health-panel" shadow="never">
    <template #header>
      <span>用户漏斗分析</span>
    </template>
    <div ref="chartRef" class="chart-container" />
  </ElCard>
</template>

<script setup lang="ts">
  import { onMounted, onUnmounted, watch, computed, nextTick, ref } from 'vue'
  import { echarts } from '@/plugins/echarts'
  import type { EChartsOption } from 'echarts'
  import type { AppHealthFunnelStage } from '../types'
  import { MOCK_APP_HEALTH } from '../mock/data'

  defineOptions({ name: 'AppHealthUserFunnel' })

  const props = withDefaults(defineProps<{ data?: AppHealthFunnelStage[] }>(), {
    data: () => []
  })

  const chartRef = ref<HTMLElement | null>(null)
  let chartInstance: ReturnType<typeof echarts.init> | null = null

  const funnelData = computed(() => (props.data?.length ? props.data : MOCK_APP_HEALTH.funnel))

  function formatValue(n: number) {
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
    if (n >= 1e3) return (n / 1e3).toFixed(0) + 'K'
    return String(n)
  }

  function buildOption(): EChartsOption {
    const d = funnelData.value
    const colors = ['#409eff', '#53a8ff', '#66b1ff', '#79bbff', '#8cc5ff', '#9dd0ff']
    return {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const item = params
          const stage = d[item.dataIndex]
          if (!stage) return ''
          let s = `${stage.name}: ${formatValue(stage.value)}`
          if (stage.percent) s += ` (${stage.percent})`
          if (stage.subPercent) s += ` ${stage.subPercent}`
          return s
        }
      },
      series: [
        {
          type: 'funnel',
          left: '10%',
          right: '10%',
          top: 16,
          bottom: 16,
          minSize: '20%',
          maxSize: '100%',
          sort: 'descending',
          gap: 4,
          label: {
            show: true,
            position: 'inside',
            formatter: (params: any) => {
              const stage = d[params.dataIndex]
              if (!stage) return ''
              const line1 = `${stage.name}: ${formatValue(stage.value)} (${stage.percent || ''})`
              const line2 = stage.subPercent ? `\n${stage.subPercent}` : ''
              return line1 + line2
            },
            fontSize: 11
          },
          labelLine: { show: false },
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 1
          },
          emphasis: {
            label: { fontSize: 12 }
          },
          data: d.map((item, i) => ({
            name: item.name,
            value: item.value,
            itemStyle: { color: colors[i % colors.length] }
          }))
        }
      ]
    }
  }

  function initChart() {
    if (!chartRef.value) return
    chartInstance = echarts.init(chartRef.value)
    chartInstance.setOption(buildOption())
  }

  function updateChart() {
    if (chartInstance) chartInstance.setOption(buildOption())
  }

  onMounted(() => {
    nextTick(initChart)
  })

  onUnmounted(() => {
    if (chartInstance) {
      chartInstance.dispose()
      chartInstance = null
    }
  })

  watch(funnelData, () => updateChart(), { deep: true })
</script>

<style scoped lang="scss">
  .app-health-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 320px;

    :deep(.el-card__body) {
      display: flex;
      flex: 1;
      min-height: 0;
    }
  }

  .chart-container {
    flex: 1;
    min-height: 280px;
  }
</style>
