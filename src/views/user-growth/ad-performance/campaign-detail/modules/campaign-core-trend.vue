<template>
  <ElCard class="cct" shadow="never">
    <template #header>
      <div class="cct__header">
        <span class="cct__title">核心指标趋势</span>
        <div class="cct__legend">
          <button
            v-for="item in legendItems"
            :key="item.key"
            type="button"
            class="cct__legend-btn"
            :class="{ 'is-active': activeKeys.includes(item.key) }"
            @click="toggleKey(item.key)"
          >
            <span class="cct__legend-dot" :style="{ background: item.color }"></span>
            {{ item.label }}
          </button>
        </div>
      </div>
    </template>
    <div ref="chartRef" class="cct__chart"></div>
  </ElCard>
</template>

<script setup lang="ts">
  import { ref, watch, onMounted } from 'vue'
  import type { EChartsOption } from 'echarts'
  import { useChart } from '@/hooks/core/useChart'
  import type { CampaignTrendPoint } from '../types'

  defineOptions({ name: 'CampaignCoreTrend' })

  const props = withDefaults(
    defineProps<{
      data?: CampaignTrendPoint[]
    }>(),
    { data: () => [] }
  )

  const COLORS = {
    spend: '#3B82F6',
    installs: '#10B981',
    cpi: '#F59E0B',
    roi: '#EC4899'
  }

  const legendItems = [
    { key: 'spend', label: '花费', color: COLORS.spend },
    { key: 'installs', label: '安装量', color: COLORS.installs },
    { key: 'cpi', label: 'CPI', color: COLORS.cpi },
    { key: 'roi', label: 'ROI', color: COLORS.roi }
  ] as const

  type LegendKey = 'spend' | 'installs' | 'cpi' | 'roi'
  const activeKeys = ref<LegendKey[]>(['spend', 'installs', 'cpi', 'roi'])

  function toggleKey(key: LegendKey) {
    const idx = activeKeys.value.indexOf(key)
    if (idx >= 0) {
      if (activeKeys.value.length === 1) return // 至少保留一个
      activeKeys.value.splice(idx, 1)
    } else {
      activeKeys.value.push(key)
    }
  }

  const chart = useChart()
  const chartRef = chart.chartRef

  function buildOption() {
    const d = props.data
    const isDark = chart.isDark.value
    const axisColor = isDark ? '#666' : '#bbb'
    const splitColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
    const labelColor = isDark ? '#999' : '#666'

    const showSpend = activeKeys.value.includes('spend')
    const showInstalls = activeKeys.value.includes('installs')
    const showCpi = activeKeys.value.includes('cpi')
    const showRoi = activeKeys.value.includes('roi')

    return {
      tooltip: {
        trigger: 'axis' as const,
        axisPointer: { type: 'cross', crossStyle: { color: axisColor } },
        backgroundColor: isDark ? 'rgba(30,30,30,0.95)' : 'rgba(255,255,255,0.95)',
        borderColor: isDark ? '#444' : '#e5e7eb',
        textStyle: { color: isDark ? '#e5e7eb' : '#374151', fontSize: 12 },
        formatter: (params: any[]) => {
          const date = params[0]?.axisValue ?? ''
          const lines = params
            .map((p: any) => {
              const color = p.color?.colorStops ? p.color.colorStops[0]?.color : p.color
              const dot = `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color};margin-right:5px;"></span>`
              return `${dot}${p.seriesName}: <b>${p.value}</b>`
            })
            .join('<br/>')
          return `<div style="font-size:12px;font-weight:600;margin-bottom:4px;">${date}</div>${lines}`
        }
      },
      grid: { left: 50, right: 55, top: 14, bottom: 26 },
      xAxis: {
        type: 'category',
        data: d.map((t) => t.date),
        boundaryGap: true,
        axisLine: { lineStyle: { color: axisColor } },
        axisTick: { show: false },
        axisLabel: { color: labelColor, fontSize: 11 }
      },
      yAxis: [
        {
          type: 'value',
          name: '',
          position: 'left',
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: {
            color: labelColor,
            fontSize: 11,
            formatter: (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v))
          },
          splitLine: { lineStyle: { color: splitColor, type: 'dashed' } }
        },
        {
          type: 'value',
          name: '',
          position: 'right',
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: {
            color: labelColor,
            fontSize: 11,
            formatter: (v: number) => (v >= 1000 ? `${v / 1000}K` : String(v))
          },
          splitLine: { show: false }
        }
      ],
      series: [
        {
          name: '花费',
          type: 'bar',
          yAxisIndex: 0,
          data: showSpend ? d.map((t) => t.spend) : [],
          itemStyle: { color: COLORS.spend, borderRadius: [3, 3, 0, 0] },
          barMaxWidth: 18,
          barGap: '10%'
        },
        {
          name: '安装量',
          type: 'bar',
          yAxisIndex: 0,
          data: showInstalls ? d.map((t) => t.installs) : [],
          itemStyle: { color: COLORS.installs, borderRadius: [3, 3, 0, 0] },
          barMaxWidth: 18,
          barGap: '10%'
        },
        {
          name: 'CPI',
          type: 'line',
          yAxisIndex: 1,
          data: showCpi ? d.map((t) => t.cpi) : [],
          smooth: true,
          symbol: 'circle',
          symbolSize: 5,
          lineStyle: { color: COLORS.cpi, width: 2 },
          itemStyle: { color: COLORS.cpi }
        },
        {
          name: 'ROI',
          type: 'line',
          yAxisIndex: 1,
          data: showRoi ? d.map((t) => t.roi) : [],
          smooth: true,
          symbol: 'circle',
          symbolSize: 5,
          lineStyle: { color: COLORS.roi, width: 2 },
          itemStyle: { color: COLORS.roi }
        }
      ]
    } as EChartsOption
  }

  function render() {
    chart.initChart(buildOption(), props.data.length === 0)
  }

  onMounted(() => render())

  watch([() => props.data, () => chart.isDark.value, activeKeys], () => render(), { deep: true })
</script>

<style scoped lang="scss">
  .cct {
    background: var(--default-box-color);

    :deep(.el-card__header) {
      padding: 10px 14px 8px;
      border-bottom: 1px solid var(--default-border);
    }

    :deep(.el-card__body) {
      padding: 8px 6px 10px;
    }
  }

  .cct__header {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    justify-content: space-between;
  }

  .cct__title {
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .cct__legend {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .cct__legend-btn {
    display: inline-flex;
    gap: 5px;
    align-items: center;
    padding: 3px 8px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    cursor: pointer;
    background: transparent;
    border: 1px solid var(--default-border);
    border-radius: 6px;
    transition: all 0.15s ease;

    &.is-active {
      color: var(--el-text-color-primary);
      background: color-mix(in srgb, var(--default-border) 50%, transparent);
    }

    &:hover:not(.is-active) {
      border-color: color-mix(in srgb, var(--el-text-color-secondary) 50%, transparent);
    }
  }

  .cct__legend-dot {
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    border-radius: 2px;
  }

  .cct__chart {
    width: 100%;
    height: 260px;
  }
</style>
