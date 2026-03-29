<template>
  <ElCard class="api-panel" shadow="never">
    <template #header>
      <div class="api-panel__header">
        <div class="api-panel__title">用户群体分析-按获客日期</div>
      </div>
    </template>

    <div class="api-panel__body">
      <div ref="chartRef" class="api-chart api-chart--heatmap"></div>
    </div>
  </ElCard>
</template>

<script setup lang="ts">
  import { onMounted, watch } from 'vue'
  import { useChart } from '@/hooks/core/useChart'
  import type { EChartsOption } from '@/plugins/echarts'
  import type { AdPlatformInfoHeatmapData } from '../types'

  defineOptions({ name: 'ApiRetentionHeatmap' })

  const props = defineProps<{ data: AdPlatformInfoHeatmapData }>()

  const { chartRef, initChart, updateChart, getTooltipStyle } = useChart()

  function buildOption(): EChartsOption {
    return {
      backgroundColor: 'transparent',
      grid: { top: 34, left: 56, right: 16, bottom: 18 },
      tooltip: getTooltipStyle('item', {
        formatter: (p: any) => {
          const x = props.data.xLabels[p.data?.[0] ?? 0] || ''
          const y = props.data.yLabels[p.data?.[1] ?? 0] || ''
          const v = Number(p.data?.[2] ?? 0)
          return `<div style="font-weight:700;margin-bottom:4px">${y} · ${x}</div><div>留存：<b>${v.toFixed(
            2
          )}%</b></div>`
        }
      }),
      xAxis: {
        type: 'category',
        data: props.data.xLabels,
        position: 'top',
        axisTick: { show: false },
        axisLine: { show: false },
        axisLabel: { color: '#94a3b8', fontSize: 11, margin: 14 }
      },
      yAxis: {
        type: 'category',
        data: props.data.yLabels,
        inverse: true,
        axisTick: { show: false },
        axisLine: { show: false },
        axisLabel: { color: '#94a3b8', fontSize: 11, margin: 18 }
      },
      visualMap: {
        min: props.data.legendMin,
        max: props.data.legendMax,
        show: false,
        orient: 'horizontal',
        left: 56,
        bottom: 8,
        textStyle: { color: '#64748b', fontSize: 11 },
        inRange: {
          color: ['#EF4444', '#F97316', '#10B981']
        },
        formatter: (v: unknown) => Number(v ?? 0).toFixed(1)
      },
      series: [
        {
          type: 'heatmap',
          data: props.data.points,
          label: {
            show: true,
            color: '#0b1220',
            fontSize: 10,
            formatter: (p: any) => Number(p.data?.[2] ?? 0).toFixed(1)
          },
          itemStyle: {
            borderColor: 'rgba(15,23,42,0.55)',
            borderWidth: 1.5,
            borderRadius: 3
          },
          emphasis: {
            itemStyle: { shadowBlur: 12, shadowColor: 'rgba(0,0,0,0.35)' }
          }
        }
      ]
    } as unknown as EChartsOption
  }

  onMounted(() => {
    initChart(buildOption(), !props.data.points.length)
  })

  watch(
    () => props.data,
    () => updateChart(buildOption()),
    { deep: true }
  )
</script>

<style scoped lang="scss">
  @use '../styles/api-info-fx.scss' as fx;

  .api-panel {
    @include fx.api-panel-card;
  }

  .api-panel__header {
    display: flex;
    gap: 12px;
    align-items: baseline;
    justify-content: space-between;
  }

  .api-panel__title {
    font-size: 14px;
    font-weight: 800;
    color: var(--art-gray-900);
  }

  .api-panel__hint {
    font-size: 12px;
    color: var(--art-gray-600);
  }

  .api-chart--heatmap {
    width: 100%;
    height: 320px;
  }
</style>
