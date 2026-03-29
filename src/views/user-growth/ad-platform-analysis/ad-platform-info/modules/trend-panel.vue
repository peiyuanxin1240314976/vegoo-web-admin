<template>
  <div>
    <ElCard class="api-panel" shadow="never">
      <template #header>
        <div class="api-panel__header">
          <div class="api-panel__actions">
            <ElRadioGroup v-model="modeProxy" class="api-seg" size="default">
              <ElRadioButton v-for="o in modeOptions" :key="o.value" :label="o.value">
                {{ o.label }}
              </ElRadioButton>
            </ElRadioGroup>
          </div>
          <div class="api-panel__title">趋势分析</div>
        </div>
      </template>

      <div class="api-panel__body">
        <div ref="chartRef" class="api-chart api-chart--trend"></div>
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue'
  import { useChart } from '@/hooks/core/useChart'
  import { graphic, type EChartsOption } from '@/plugins/echarts'
  import type { AdPlatformInfoTrendData } from '../types'

  defineOptions({ name: 'ApiTrendPanel' })

  const props = defineProps<{ data: AdPlatformInfoTrendData }>()

  const mode = ref<'revenue' | 'spend' | 'roi' | 'cpi'>('roi')
  const modeOptions = [
    { label: '收入趋势', value: 'revenue' },
    { label: '支出趋势', value: 'spend' },
    { label: 'ROI趋势', value: 'roi' },
    { label: 'CPI趋势', value: 'cpi' }
  ] as const

  const modeProxy = computed({
    get: () => mode.value,
    set: (v) => {
      mode.value = v
    }
  })

  const {
    chartRef,
    initChart,
    updateChart,
    getAxisLabelStyle,
    getSplitLineStyle,
    getTooltipStyle
  } = useChart()

  const activeLineSeries = computed(() => {
    const keyMap: Record<typeof mode.value, string> = {
      revenue: '收入',
      spend: '支出',
      roi: 'ROI',
      cpi: 'CPI'
    }
    const name = keyMap[mode.value]
    return props.data.series.find((s) => s.name === name) || props.data.series[0]
  })

  const barDiffSeries = computed(() => {
    const s = activeLineSeries.value
    const data = s?.data ?? []
    return data.map((v, i) => {
      if (i === 0) return 0
      return Number((v - data[i - 1]).toFixed(2))
    })
  })

  function buildOption(): EChartsOption {
    const dates = props.data.dates
    const line = activeLineSeries.value
    const barDiff = barDiffSeries.value
    const metric = mode.value
    const isPercent = metric === 'roi'
    const isUsd = metric === 'revenue' || metric === 'spend' || metric === 'cpi'

    const targetRoi = 150

    function fmtAxis(v: number) {
      if (isPercent) {
        return (
          v.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + '%'
        )
      }
      if (metric === 'cpi') return '$' + v.toFixed(2)
      return '$' + Math.round(v / 1000) + 'k'
    }

    return {
      backgroundColor: 'transparent',
      tooltip: getTooltipStyle('axis', {
        axisPointer: { type: 'line', lineStyle: { type: 'dashed' } },
        formatter: (params: any[]) => {
          const date = params?.[0]?.axisValue ?? ''
          const lineP = params.find((p) => p.seriesName === line?.name)
          const barP = params.find((p) => p.seriesName === '变化')
          const lv = Number(lineP?.data ?? 0)
          const bv = Number(barP?.data ?? 0)
          const lineValText = isPercent ? `${lv.toFixed(0)}%` : isUsd ? fmtAxis(lv) : String(lv)
          const diffText =
            (bv >= 0 ? '+' : '') +
            (isPercent
              ? `${bv.toFixed(1)}%`
              : metric === 'cpi'
                ? `$${bv.toFixed(2)}`
                : `$${Math.round(bv)}`)
          return [
            `<div style="font-weight:700;margin-bottom:6px;color:#e2e8f0">${date}</div>`,
            `<div style="margin:2px 0"><span style="color:${line?.color}">●</span> ${line?.name}：<b style="color:#fff">${lineValText}</b></div>`,
            `<div style="margin:2px 0"><span style="color:${bv >= 0 ? '#10B981' : '#EF4444'}">●</span> 变化：<b style="color:#fff">${diffText}</b></div>`
          ].join('')
        }
      }),
      grid: { top: 26, left: 52, right: 42, bottom: 36, containLabel: true },
      xAxis: {
        type: 'category',
        data: dates,
        axisTick: { show: false },
        axisLine: { show: false },
        axisLabel: { ...getAxisLabelStyle(true), formatter: (v: string) => v }
      },
      yAxis: [
        {
          type: 'value',
          axisLabel: {
            ...getAxisLabelStyle(true),
            formatter: (v: number) => fmtAxis(v)
          },
          splitLine: getSplitLineStyle(true)
        },
        {
          type: 'value',
          axisLabel: { show: false },
          splitLine: { show: false }
        }
      ],
      series: [
        {
          name: '变化',
          type: 'bar',
          yAxisIndex: 1,
          data: barDiff,
          barMaxWidth: 18,
          itemStyle: {
            borderRadius: [8, 8, 0, 0],
            color: (p: any) => (Number(p.value ?? 0) >= 0 ? '#10B981' : '#EF4444')
          }
        },
        {
          name: line?.name || '趋势',
          type: 'line',
          data: line?.data ?? [],
          smooth: true,
          showSymbol: false,
          lineStyle: {
            color: line?.color || '#3B82F6',
            width: 2.8,
            shadowBlur: 14,
            shadowColor: 'rgba(59,130,246,0.55)',
            shadowOffsetY: 0
          },
          itemStyle: { color: line?.color || '#3B82F6' },
          areaStyle:
            metric === 'roi'
              ? {
                  color: new graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: 'rgba(59,130,246,0.22)' },
                    { offset: 1, color: 'rgba(59,130,246,0.02)' }
                  ])
                }
              : undefined,
          markLine:
            metric === 'roi'
              ? {
                  symbol: 'none',
                  label: { show: true, formatter: 'Target ROI', color: '#10B981', fontWeight: 700 },
                  lineStyle: { type: 'dashed', color: 'rgba(16,185,129,0.75)', width: 1.2 },
                  data: [{ yAxis: targetRoi }]
                }
              : undefined
        }
      ]
    } as unknown as EChartsOption
  }

  onMounted(() => {
    initChart(buildOption(), !props.data.dates.length)
  })

  watch([() => props.data, () => mode.value], () => updateChart(buildOption()), { deep: true })
</script>

<style scoped lang="scss">
  .api-panel {
    background: var(--default-box-color);
    border: 1px solid var(--default-border);
    border-radius: 12px;

    :deep(.el-card__header) {
      padding: 12px 14px;
      border-bottom: 1px solid var(--default-border);
    }

    :deep(.el-card__body) {
      padding: 14px;
    }
  }

  .api-panel__header {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: flex-start;
  }

  .api-panel__title {
    font-size: 14px;
    font-weight: 800;
    color: var(--art-gray-900);
  }

  .api-chart--trend {
    width: 100%;
    height: 300px;
  }

  .api-seg {
    :deep(.el-radio-button__inner) {
      border-color: var(--default-border);
    }
  }
</style>
