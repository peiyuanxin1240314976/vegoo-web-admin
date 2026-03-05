<template>
  <ElCard class="cockpit-panel monetization-panel" shadow="never">
    <template #header>
      <span>IAP 收入分析</span>
    </template>
    <div class="iap-chart-wrap">
      <div ref="chartRef" class="chart-container" />
      <div class="iap-total-center">{{ iapData?.total ?? '--' }}</div>
    </div>
    <div class="iap-legend">
      <div v-for="(item, i) in iapData?.items ?? []" :key="i" class="iap-legend-item">
        <span class="iap-legend-dot" :style="{ background: colors[i % colors.length] }" />
        <span>{{ item.name }}: {{ item.percent }}%, {{ item.amount }}</span>
      </div>
    </div>
  </ElCard>
</template>

<script setup lang="ts">
  import { onMounted, watch, computed } from 'vue'
  import { useChart } from '@/hooks/core/useChart'
  import type { EChartsOption } from 'echarts'
  import type { MonetizationIapAnalysis } from '../types'
  import { MOCK_MONETIZATION_ANALYSIS } from '../mock/data'

  defineOptions({ name: 'MonetizationIapRevenueAnalysis' })

  const props = withDefaults(defineProps<{ data?: MonetizationIapAnalysis | null }>(), {
    data: null
  })

  const { chartRef, initChart, updateChart } = useChart()
  const iapData = computed(() => props.data ?? MOCK_MONETIZATION_ANALYSIS.iapAnalysis)

  const colors = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399']

  function buildOption(): EChartsOption {
    const d = iapData.value
    if (!d?.items?.length) return {}
    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}%'
      },
      series: [
        {
          type: 'pie',
          radius: ['50%', '75%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderColor: 'var(--el-bg-color-page)',
            borderWidth: 2
          },
          label: { show: false },
          data: d.items.map((item, i) => ({
            name: item.name,
            value: item.percent,
            itemStyle: { color: colors[i % colors.length] }
          }))
        }
      ]
    }
  }

  onMounted(() => {
    initChart(buildOption())
  })
  watch(iapData, () => updateChart(buildOption()), { deep: true })
</script>

<style scoped lang="scss">
  .monetization-panel {
    margin-bottom: 16px;

    :deep(.el-card__body) {
      padding: 12px;
    }
  }

  .iap-chart-wrap {
    position: relative;
    min-height: 220px;
  }

  .chart-container {
    height: 220px;
  }

  .iap-total-center {
    position: absolute;
    top: 50%;
    left: 50%;
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    pointer-events: none;
    transform: translate(-50%, -50%);
  }

  .iap-legend {
    padding-top: 12px;
    margin-top: 12px;
    border-top: 1px solid var(--el-border-color-lighter);
  }

  .iap-legend-item {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 4px;
    font-size: 12px;
    color: var(--el-text-color-regular);
  }

  .iap-legend-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
</style>
