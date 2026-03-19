<template>
  <ElCard class="cockpit-panel monetization-panel" shadow="never">
    <template #header>
      <span>广告平台表现</span>
    </template>
    <ElTable :data="tableData" stripe size="default" class="monetization-table" style="width: 100%">
      <ElTableColumn prop="channel" label="广告平台/平台" min-width="120">
        <template #default="{ row }">
          <span>{{ row.channel }}</span>
          <span v-if="row.platform" class="platform-sub">({{ row.platform }})</span>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="impressions" label="展示" min-width="90" />
      <ElTableColumn prop="clicks" label="点击" min-width="90" />
      <ElTableColumn prop="revenue" label="收入" min-width="100">
        <template #default="{ row }">
          {{ row.revenue }}
          <span v-if="row.revenuePercent" class="revenue-percent">{{ row.revenuePercent }}</span>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="ecpm" label="eCPM" min-width="80" />
      <ElTableColumn prop="fillRate" label="填充率" min-width="90">
        <template #default="{ row }">
          <span
            class="fill-rate-cell"
            :class="{
              'fill-rate--high': row.fillRateStatus === 'high',
              'fill-rate--low': row.fillRateStatus === 'low'
            }"
          >
            {{ row.fillRate }}
          </span>
        </template>
      </ElTableColumn>
      <ElTableColumn label="趋势" min-width="100" align="center">
        <template #default="{ row, $index }">
          <div
            v-if="row.trendData?.length"
            :ref="(el) => setTrendRef($index, el)"
            class="trend-spark"
          />
        </template>
      </ElTableColumn>
    </ElTable>
  </ElCard>
</template>

<script setup lang="ts">
  import { computed, ref, onMounted, nextTick } from 'vue'
  import { useChart } from '@/hooks/core/useChart'
  import type { EChartsOption } from 'echarts'
  import type { MonetizationAdPlatformRow } from '../types'
  import { MOCK_MONETIZATION_ANALYSIS } from '../mock/data'

  defineOptions({ name: 'MonetizationAdPlatformPerformance' })

  const props = withDefaults(defineProps<{ data?: MonetizationAdPlatformRow[] }>(), {
    data: () => []
  })

  const tableData = computed(() =>
    props.data?.length ? props.data : MOCK_MONETIZATION_ANALYSIS.adPlatformPerformance
  )

  const trendRefs = ref<(HTMLElement | null)[]>([])
  const chartInstances: ReturnType<typeof useChart>[] = []

  function setTrendRef(index: number, el: any) {
    if (el) {
      trendRefs.value[index] = el as HTMLElement
    }
  }

  function buildSparkOption(values: number[]): EChartsOption {
    return {
      grid: { left: 2, right: 2, top: 2, bottom: 2 },
      xAxis: { type: 'category', show: false, data: values.map((_, i) => i) },
      yAxis: { type: 'value', show: false, scale: true },
      series: [
        {
          type: 'line',
          data: values,
          smooth: true,
          symbol: 'none',
          lineStyle: { width: 1.5, color: '#409eff' },
          areaStyle: { color: 'rgba(64, 158, 255, 0.15)' }
        }
      ]
    }
  }

  onMounted(() => {
    nextTick(() => {
      tableData.value.forEach((row, index) => {
        if (!row.trendData?.length) return
        const el = trendRefs.value[index]
        if (el) {
          const chart = useChart()
          chartInstances.push(chart)
          ;(chart as any).chartRef.value = el
          chart.initChart(buildSparkOption(row.trendData!))
        }
      })
    })
  })
</script>

<style scoped lang="scss">
  .monetization-panel {
    margin-bottom: 16px;

    :deep(.el-card__body) {
      padding: 12px;
    }
  }

  .platform-sub {
    margin-left: 4px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .revenue-percent {
    margin-left: 4px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .fill-rate-cell {
    &.fill-rate--high {
      color: var(--el-color-success);
    }

    &.fill-rate--low {
      color: var(--el-color-danger);
    }
  }

  .trend-spark {
    width: 80px;
    height: 32px;
    margin: 0 auto;
  }
</style>
