<template>
  <ElCard class="map-detail-retention-chart" shadow="never">
    <template #header>
      <div class="card-header-inner">
        <span class="card-title">用户留存曲线 (vs 全局平均)</span>
        <div class="chart-legend">
          <span class="legend-item">
            <i class="legend-line legend-line-local" />
            <span>本地区</span>
          </span>
          <span class="legend-item">
            <i class="legend-line legend-line-global" />
            <span>全局平均</span>
          </span>
        </div>
      </div>
    </template>
    <div ref="chartRef" class="chart-box"></div>
  </ElCard>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, watch } from 'vue'
  import { echarts, type EChartsOption } from '@/plugins/echarts'

  defineOptions({ name: 'MapDetailRetentionChart' })

  const CHART_COLOR = '#3984F1'

  /** localData 来自接口 countryInfo/remain (day1,day3,day7,day14,day30)；globalData 暂无接口为对比线 */
  const props = withDefaults(
    defineProps<{
      localData?: number[]
      globalData?: number[]
      xAxisData?: string[]
    }>(),
    {
      localData: () => [],
      globalData: () => [66, 52, 39, 32, 26],
      xAxisData: () => ['D1', 'D3', 'D7', 'D14', 'D30']
    }
  )

  const chartRef = ref<HTMLElement | null>(null)
  let chart: ReturnType<typeof echarts.init> | null = null

  function initChart() {
    if (!chartRef.value) return
    chart = echarts.init(chartRef.value)
    const opt: EChartsOption = {
      color: [CHART_COLOR, '#94a3b8'],
      grid: { left: 48, right: 24, top: 16, bottom: 24 },
      xAxis: { type: 'category', data: props.xAxisData },
      yAxis: { type: 'value', axisLabel: { formatter: '{value}%' } },
      series: [
        {
          name: '本地区',
          type: 'line',
          data: props.localData,
          smooth: true,
          lineStyle: { width: 2 }
        },
        {
          name: '全局平均',
          type: 'line',
          data: props.globalData,
          smooth: true,
          lineStyle: { type: 'dashed', width: 1.5 }
        }
      ],
      legend: { show: false }
    }
    chart.setOption(opt)
  }

  function resize() {
    chart?.resize()
  }

  onMounted(() => {
    initChart()
    window.addEventListener('resize', resize)
  })
  watch(() => [props.localData, props.globalData], initChart, { deep: true })

  onUnmounted(() => {
    window.removeEventListener('resize', resize)
    chart?.dispose()
    chart = null
  })
</script>

<style scoped lang="scss">
  .map-detail-retention-chart {
    :deep(.el-card__header) {
      font-weight: 500;
    }

    .card-header-inner {
      display: flex;
      gap: 16px;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }

    .card-title {
      flex-shrink: 0;
    }

    .chart-legend {
      display: flex;
      flex-shrink: 0;
      gap: 20px;
    }

    .legend-item {
      display: inline-flex;
      gap: 6px;
      align-items: center;
      font-size: 13px;
      color: var(--el-text-color-regular);
    }

    .legend-line {
      display: inline-block;
      width: 20px;
      height: 3px;
      border-radius: 2px;

      &.legend-line-local {
        background: #3984f1;
      }

      &.legend-line-global {
        background: #94a3b8;
        background-image: repeating-linear-gradient(
          90deg,
          #94a3b8 0,
          #94a3b8 4px,
          transparent 4px,
          transparent 8px
        );
        background-size: 8px 3px;
      }
    }

    .chart-box {
      height: 240px;
    }
  }
</style>
