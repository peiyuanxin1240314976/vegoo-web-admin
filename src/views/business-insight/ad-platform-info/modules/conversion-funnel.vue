<template>
  <ElCard class="api-panel" shadow="never">
    <template #header>
      <div class="api-panel__header">
        <div class="api-panel__title">用户群体分析-按分层分析</div>
      </div>
    </template>

    <div class="api-panel__body">
      <div class="api-funnel-center">
        <div ref="chartRef" class="api-chart api-chart--funnel"></div>
      </div>
    </div>
  </ElCard>
</template>

<script setup lang="ts">
  import { computed, onMounted, watch } from 'vue'
  import { useChart } from '@/hooks/core/useChart'
  import type { EChartsOption } from '@/plugins/echarts'
  import type { AdPlatformInfoFunnelStage } from '../types'

  defineOptions({ name: 'ApiConversionFunnel' })

  const props = defineProps<{ stages: AdPlatformInfoFunnelStage[] }>()

  const colors = ['#10B981', '#F59E0B', '#3B82F6', '#EF4444']

  const normalized = computed(() => {
    return props.stages.map((s, idx) => ({ ...s, itemStyle: { color: colors[idx] } }))
  })

  const { chartRef, initChart, updateChart, getTooltipStyle } = useChart()

  function buildOption(): EChartsOption {
    const data = normalized.value
    return {
      backgroundColor: 'transparent',
      tooltip: getTooltipStyle('item', {
        formatter: (p: any) => {
          const v = Number(p.value ?? 0)
          return `<div style="font-weight:700;margin-bottom:4px">${p.name}</div><div>数量：<b>${v.toLocaleString(
            'en-US'
          )}</b></div>`
        }
      }),
      series: [
        {
          type: 'funnel',
          left: 'center',
          top: 'center',
          height: '86%',
          width: '72%',
          minSize: '38%',
          maxSize: '100%',
          funnelAlign: 'center',
          min: 0,
          max: Math.max(...data.map((d) => d.value), 1),
          sort: 'descending',
          gap: 6,
          label: {
            show: true,
            position: 'inside',
            color: '#f8fafc',
            fontSize: 13,
            fontWeight: 900,
            formatter: (p: any) => `${p.name}  ${Number(p.value ?? 0).toLocaleString('en-US')}`
          },
          labelLine: { show: false },
          itemStyle: { borderRadius: 0, borderColor: 'rgba(0,0,0,0.22)', borderWidth: 1 },
          emphasis: { label: { fontSize: 13 } },
          data
        }
      ]
    } as unknown as EChartsOption
  }

  onMounted(() => {
    initChart(buildOption(), !props.stages.length)
  })

  watch(
    () => props.stages,
    () => updateChart(buildOption()),
    { deep: true }
  )
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

  .api-funnel-center {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
  }

  .api-chart--funnel {
    width: 100%;
    max-width: 520px;
    height: 260px;
    margin: 0 auto;
  }

  .api-funnel__side {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 10px 12px;
    background: rgb(24 24 27 / 25%);
    border: 1px solid var(--default-border);
    border-radius: 12px;
  }

  .api-funnel__metric {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 8px;
    align-items: center;
    padding: 10px;
    background: rgb(24 24 27 / 35%);
    border: 1px solid var(--default-border);
    border-radius: 10px;
  }

  .api-funnel__k {
    font-size: 12px;
    color: var(--art-gray-600);
  }

  .api-funnel__v {
    font-size: 12px;
    font-weight: 800;
    color: var(--art-gray-900);
  }
</style>
