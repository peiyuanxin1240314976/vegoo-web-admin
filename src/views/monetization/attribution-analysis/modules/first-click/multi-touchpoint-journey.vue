<template>
  <div class="multi-touchpoint-journey art-card">
    <h3 class="chart-title">多触点用户旅程</h3>
    <div ref="chartRef" class="chart-container" />
  </div>
</template>

<script setup lang="ts">
  import { computed, nextTick } from 'vue'
  import { type EChartsOption } from '@/plugins/echarts'
  import { useChart, useChartOps } from '@/hooks/core/useChart'

  defineOptions({ name: 'MultiTouchpointJourney' })

  const props = withDefaults(
    defineProps<{
      nodes?: Array<{ name: string }>
      links?: Array<{ source: string; target: string; value: number }>
    }>(),
    {
      nodes: () => [
        { name: 'Facebook Ad' },
        { name: 'Google Search' },
        { name: 'TikTok Video' },
        { name: 'Google Ads' },
        { name: 'Search Ad' },
        { name: 'App Store' },
        { name: 'TikTok Play' },
        { name: 'App Store Page' },
        { name: 'Install' }
      ],
      links: () => [
        { source: 'Facebook Ad', target: 'Google Search', value: 1200 },
        { source: 'Google Search', target: 'TikTok Video', value: 800 },
        { source: 'TikTok Video', target: 'Install', value: 3500 },
        { source: 'Google Ads', target: 'App Store', value: 2100 },
        { source: 'Search Ad', target: 'App Store Page', value: 1500 },
        { source: 'App Store', target: 'Install', value: 2800 },
        { source: 'App Store Page', target: 'Install', value: 2200 },
        { source: 'TikTok Play', target: 'Install', value: 1800 }
      ]
    }
  )

  const { chartRef, initChart, updateChart, isDark } = useChart()
  const colors = useChartOps().colors
  console.log(colors)

  const option = computed<EChartsOption>(() => {
    void isDark.value
    return {
      tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove',
        backgroundColor: 'var(--el-bg-color-overlay)',
        borderColor: 'var(--el-border-color-lighter)',
        textStyle: { color: 'var(--el-text-color-primary)' }
      },
      series: [
        {
          type: 'sankey',
          emphasis: { focus: 'adjacency' },
          nodeWidth: 10,
          nodeGap: 8,
          left: '10%',
          right: '10%',
          top: '10%',
          bottom: '10%',
          data: props.nodes,
          links: props.links,
          lineStyle: { color: 'gradient', opacity: 0.4 },
          itemStyle: {
            borderWidth: 0,
            borderRadius: 5
          },
          label: {
            color: 'var(--el-text-color-regular)',
            fontSize: 11
          }
        }
      ]
    }
  })

  onMounted(() => {
    nextTick(() => {
      initChart(option.value)
    })
  })
  watch(option, (v) => updateChart(v), { deep: true })
</script>

<style scoped lang="scss">
  .multi-touchpoint-journey {
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
    height: 220px;
    min-height: 220px;
    overflow: hidden;
  }
</style>
