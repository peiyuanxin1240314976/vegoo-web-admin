<template>
  <ElCard class="cockpit-panel monetization-panel" shadow="never">
    <template #header>
      <span>IAP 收入分析</span>
    </template>
    <div class="iap-chart-wrap">
      <div ref="containerRef" class="chart-container" />
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
  import { onMounted, onUnmounted, watch, computed, nextTick, ref } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useSettingStore } from '@/store/modules/setting'
  import { echarts } from '@/plugins/echarts'
  import type { EChartsOption } from 'echarts'
  import type { MonetizationIapAnalysis } from '../types'
  import { MOCK_MONETIZATION_ANALYSIS } from '../mock/data'

  defineOptions({ name: 'MonetizationIapRevenueAnalysis' })

  const props = withDefaults(defineProps<{ data?: MonetizationIapAnalysis | null }>(), {
    data: null
  })

  const { isDark } = storeToRefs(useSettingStore())
  const containerRef = ref<HTMLElement | null>(null)
  let chartInstance: ReturnType<typeof echarts.init> | null = null
  const iapData = computed(() => props.data ?? MOCK_MONETIZATION_ANALYSIS.iapAnalysis)

  const colors = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399']

  /** 随深色/浅色模式区分的文字颜色 */
  const textColor = computed(() => (isDark.value ? 'rgba(255,255,255,0.85)' : '#303133'))

  function buildOption(): EChartsOption {
    const d = iapData.value
    if (!d?.items?.length) return {}
    const color = textColor.value
    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}%'
      },
      legend: {
        show: true,
        orient: 'vertical',
        right: 10,
        top: 'middle',
        textStyle: {
          fontSize: 12,
          color,
          textBorderWidth: 0,
          textShadowColor: 'transparent',
          textShadowBlur: 0
        }
      },
      series: [
        {
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['45%', '50%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderWidth: 0
          },
          label: {
            show: true,
            formatter: '{d}%',
            color,
            textBorderWidth: 0,
            textShadowColor: 'transparent',
            textShadowBlur: 0
          },
          labelLine: {
            show: true,
            lineStyle: { color: isDark.value ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)' }
          },
          data: d.items.map((item, i) => ({
            name: item.name,
            value: item.percent,
            itemStyle: { color: colors[i % colors.length] }
          }))
        }
      ]
    }
  }

  function initIapChart() {
    if (!containerRef.value) return
    chartInstance = echarts.init(containerRef.value)
    const option = buildOption()
    if (option && Object.keys(option).length) {
      chartInstance.setOption(option)
    }
  }

  function updateIapChart() {
    if (!chartInstance) return
    const option = buildOption()
    if (option && Object.keys(option).length) {
      chartInstance.setOption(option)
    }
  }

  onMounted(() => {
    nextTick(() => {
      initIapChart()
    })
  })

  onUnmounted(() => {
    if (chartInstance) {
      chartInstance.dispose()
      chartInstance = null
    }
  })

  watch(
    iapData,
    () => {
      updateIapChart()
    },
    { deep: true }
  )

  watch(isDark, () => {
    updateIapChart()
  })
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
    width: 100%;
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
