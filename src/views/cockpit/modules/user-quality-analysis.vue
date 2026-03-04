<template>
  <ElCard class="cockpit-panel" shadow="never">
    <template #header>
      <span>用户质量分析</span>
      <ElButton type="primary" link size="small">查看更多</ElButton>
    </template>
    <div class="quality-gauges">
      <div ref="chartRef" class="gauges-chart" />
      <div class="gauge-labels">
        <div v-for="item in items" :key="item.key" class="gauge-item">
          <div class="gauge-label">{{ item.label }}</div>
          <div class="gauge-status" :class="item.statusClass"
            >{{ item.value }}-{{ item.status }}</div
          >
        </div>
      </div>
    </div>
  </ElCard>
</template>

<script setup lang="ts">
  import { onMounted, watch, computed } from 'vue'
  import { useChart } from '@/hooks/core/useChart'
  import type { EChartsOption } from 'echarts'
  import type { CockpitUserQualityItem } from '../types'
  import { MOCK_COCKPIT_OVERVIEW } from '../mock/data'

  defineOptions({ name: 'CockpitUserQualityAnalysis' })

  const props = withDefaults(defineProps<{ userQuality?: CockpitUserQualityItem[] }>(), {
    userQuality: () => []
  })

  const items = computed(() => {
    const list = props.userQuality.length ? props.userQuality : MOCK_COCKPIT_OVERVIEW.userQuality
    return list
  })

  const { chartRef, initChart, updateChart } = useChart()

  const gaugeColors = ['#67c23a', '#e6a23c', '#409eff']

  function buildGaugeOption(): EChartsOption {
    const list = items.value
    return {
      series: list.map((item, i) => ({
        type: 'gauge',
        center: [['16%', '50%', '84%'][i], '55%'] as [string, string],
        radius: '75%',
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max: 100,
        splitNumber: 4,
        itemStyle: { color: gaugeColors[i] },
        progress: { show: true, width: 12, roundCap: true, itemStyle: { color: gaugeColors[i] } },
        pointer: { show: false },
        axisLine: { lineStyle: { width: 12, color: [[1, 'var(--el-border-color-lighter)']] } },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        detail: { show: false },
        data: [{ value: item.gaugeValue }]
      }))
    }
  }

  onMounted(() => {
    initChart(buildGaugeOption())
  })
  watch(items, () => updateChart(buildGaugeOption()), { deep: true })
</script>

<style scoped lang="scss">
  .cockpit-panel {
    height: 100%;

    :deep(.el-card__header) {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    :deep(.el-card__body) {
      padding: 12px;
    }
  }

  .quality-gauges {
    position: relative;
  }

  .gauges-chart {
    width: 100%;
    height: 100px;
  }

  .gauge-labels {
    display: flex;
    justify-content: space-around;
    margin-top: 4px;
  }

  .gauge-item {
    flex: 1;
    text-align: center;

    .gauge-label {
      margin-top: 4px;
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }

    .gauge-status {
      font-size: 12px;
      font-weight: 500;

      &.good {
        color: var(--el-color-success);
      }

      &.avg {
        color: #e6a23c;
      }

      &.high {
        color: var(--el-color-primary);
      }
    }
  }
</style>
