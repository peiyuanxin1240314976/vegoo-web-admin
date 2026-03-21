<template>
  <ElCard class="am-class" shadow="never">
    <template #header>
      <span>异常分类</span>
    </template>
    <div ref="pieRef" class="am-class__chart" />
  </ElCard>
</template>

<script setup lang="ts">
  import { watch, onMounted, onBeforeUnmount } from 'vue'
  import { useChart } from '@/hooks/core/useChart'
  import type { EChartsOption } from '@/plugins/echarts'
  import type { ClassificationSlice } from '../types'

  defineOptions({ name: 'AmSectionClassification' })

  const props = defineProps<{
    slices: ClassificationSlice[]
    centerTitle: string
    centerValue: string
  }>()

  const chart = useChart()
  const pieRef = chart.chartRef

  function buildOption(): EChartsOption {
    const { getTooltipStyle } = chart
    return {
      tooltip: {
        ...getTooltipStyle('item'),
        formatter: (p: { name?: string; value?: number; percent?: number }) =>
          `${p.name ?? ''}<br/>${p.value ?? ''}（${p.percent ?? 0}%）`
      },
      graphic: [
        {
          type: 'text',
          left: 'center',
          top: '46%',
          style: {
            text: props.centerTitle,
            fill: 'var(--art-gray-600)',
            fontSize: 12
          }
        },
        {
          type: 'text',
          left: 'center',
          top: '52%',
          style: {
            text: props.centerValue,
            fill: 'var(--art-gray-900)',
            fontSize: 18,
            fontWeight: 'bold'
          }
        }
      ] as EChartsOption['graphic'],
      series: [
        {
          type: 'pie',
          radius: ['42%', '68%'],
          center: ['50%', '52%'],
          avoidLabelOverlap: true,
          itemStyle: { borderRadius: 4, borderColor: 'var(--default-box-color)', borderWidth: 2 },
          label: {
            color: 'var(--art-gray-600)',
            fontSize: 11,
            formatter: '{b}\n{d}%'
          },
          data: props.slices.map((s) => ({
            name: s.name,
            value: s.value,
            itemStyle: { color: s.color }
          }))
        }
      ]
    }
  }

  function render() {
    chart.initChart(buildOption())
  }

  watch(
    () => [props.slices, props.centerTitle, props.centerValue],
    () => render(),
    { deep: true }
  )

  onMounted(() => render())

  onBeforeUnmount(() => chart.getChartInstance()?.dispose())
</script>

<style scoped lang="scss">
  .am-class {
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

  .am-class__chart {
    width: 100%;
    height: 260px;
  }
</style>
