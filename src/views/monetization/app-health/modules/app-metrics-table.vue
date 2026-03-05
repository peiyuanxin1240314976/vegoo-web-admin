<template>
  <ElCard class="app-health-panel app-health-table-panel" shadow="never">
    <template #header>
      <span>应用指标矩阵</span>
    </template>
    <ElTable
      :data="tableList"
      stripe
      size="default"
      class="app-metrics-table"
      style="width: 100%"
      :header-cell-style="{ background: 'var(--el-fill-color-light)' }"
    >
      <ElTableColumn prop="appName" label="APP名称" min-width="120">
        <template #default="{ row }">
          <div class="app-name-cell">
            <span class="app-icon-letter">{{ (row.appName || 'A').charAt(0) }}</span>
            <span>{{ row.appName }}</span>
          </div>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="revenue" label="收入" min-width="90" sortable />
      <ElTableColumn label="收入增长率" min-width="100" sortable>
        <template #default="{ row }">
          <span :class="row.revenueGrowthUp ? 'text-up' : 'text-down'">
            {{ row.revenueGrowth }}
            <ElIcon v-if="row.revenueGrowthUp !== undefined">
              <component :is="row.revenueGrowthUp ? ArrowUpBold : ArrowDownBold" />
            </ElIcon>
          </span>
        </template>
      </ElTableColumn>
      <ElTableColumn label="DAU" min-width="100">
        <template #default="{ row }">
          <div class="spark-cell">
            <span>{{ row.dau }}</span>
            <div
              v-if="row.dauTrend?.length"
              :ref="(el) => setSparkRef(row.appId, 'dau', el)"
              class="spark-chart"
            />
          </div>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="activationRate" label="激活比例" min-width="95" />
      <ElTableColumn prop="d1" label="D1" min-width="70" />
      <ElTableColumn label="D7" min-width="100">
        <template #default="{ row }">
          <div class="spark-cell">
            <span>{{ row.d7 }}</span>
            <div
              v-if="row.d7Trend?.length"
              :ref="(el) => setSparkRef(row.appId, 'd7', el)"
              class="spark-chart"
            />
          </div>
        </template>
      </ElTableColumn>
      <ElTableColumn label="D30" min-width="100">
        <template #default="{ row }">
          <div class="spark-cell">
            <span>{{ row.d30 }}</span>
            <span v-if="row.d30Change" :class="row.d30Up ? 'text-up' : 'text-down'">
              {{ row.d30Change }}
            </span>
            <div
              v-if="row.d30Trend?.length"
              :ref="(el) => setSparkRef(row.appId, 'd30', el)"
              class="spark-chart"
            />
          </div>
        </template>
      </ElTableColumn>
      <ElTableColumn label="支付率" min-width="90">
        <template #default="{ row }">
          <div class="spark-cell">
            <span>{{ row.payRate }}</span>
            <span v-if="row.payRateChange" :class="row.payRateUp ? 'text-up' : 'text-down'">
              {{ row.payRateChange }}
            </span>
            <div
              v-if="row.payRateTrend?.length"
              :ref="(el) => setSparkRef(row.appId, 'payRate', el)"
              class="spark-chart"
            />
          </div>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="arpu" label="ARPU" min-width="80" />
      <ElTableColumn prop="ltv30" label="LTV_30" min-width="85" />
      <ElTableColumn label="健康得分" min-width="100">
        <template #default="{ row }">
          <span class="health-score" :class="healthScoreClass(row.healthStatus)">
            <span class="health-dot" />
            {{ row.healthScore }}
          </span>
        </template>
      </ElTableColumn>
      <ElTableColumn label="详情" width="80" fixed="right">
        <template #default="{ row }">
          <ElLink type="primary" :underline="false" @click="onDetail(row)">详情</ElLink>
        </template>
      </ElTableColumn>
    </ElTable>
  </ElCard>
</template>

<script setup lang="ts">
  import { computed, ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
  import { ArrowUpBold, ArrowDownBold } from '@element-plus/icons-vue'
  import { echarts } from '@/plugins/echarts'
  import type { EChartsOption } from 'echarts'
  import type { AppHealthMetricsRow } from '../types'
  import { MOCK_APP_HEALTH } from '../mock/data'

  defineOptions({ name: 'AppHealthMetricsTable' })

  const props = withDefaults(defineProps<{ data?: AppHealthMetricsRow[] }>(), {
    data: () => []
  })

  const emit = defineEmits<{ (e: 'detail', row: AppHealthMetricsRow): void }>()

  const tableList = computed(() => (props.data?.length ? props.data : MOCK_APP_HEALTH.metricsTable))

  const sparkRefs = ref<Record<string, HTMLElement | null>>({})
  const chartInstances: ReturnType<typeof echarts.init>[] = []

  function setSparkRef(appId: string, key: string, el: unknown) {
    if (el) sparkRefs.value[`${appId}-${key}`] = el as HTMLElement
  }

  function healthScoreClass(status?: string): string {
    if (status === 'high') return 'health-high'
    if (status === 'low') return 'health-low'
    return 'health-medium'
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

  function initSparklines() {
    tableList.value.forEach((row) => {
      const keys = ['dauTrend', 'd7Trend', 'd30Trend', 'payRateTrend'] as const
      const map = { dauTrend: 'dau', d7Trend: 'd7', d30Trend: 'd30', payRateTrend: 'payRate' }
      keys.forEach((trendKey) => {
        const data = row[trendKey]
        if (!data?.length) return
        const el = sparkRefs.value[`${row.appId}-${map[trendKey]}`]
        if (el) {
          const chart = echarts.init(el)
          chartInstances.push(chart)
          chart.setOption(buildSparkOption(data))
        }
      })
    })
  }

  onMounted(() => {
    nextTick(initSparklines)
  })

  onUnmounted(() => {
    chartInstances.forEach((c) => c.dispose())
    chartInstances.length = 0
  })

  watch(
    () => props.data,
    () => {
      nextTick(initSparklines)
    },
    { deep: true }
  )

  function onDetail(row: AppHealthMetricsRow) {
    emit('detail', row)
  }
</script>

<style scoped lang="scss">
  .app-health-table-panel {
    :deep(.el-card__body) {
      padding: 12px;
    }
  }

  .app-name-cell {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .app-icon-letter {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    font-size: 12px;
    font-weight: 600;
    color: #fff;
    background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
    border-radius: 6px;
  }

  .spark-cell {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;

    .spark-chart {
      width: 56px;
      height: 24px;
    }
  }

  .text-up {
    color: var(--el-color-success);
  }

  .text-down {
    color: var(--el-color-danger);
  }

  .health-score {
    display: inline-flex;
    gap: 6px;
    align-items: center;

    .health-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    &.health-high .health-dot {
      background: var(--el-color-success);
    }

    &.health-medium .health-dot {
      background: var(--el-color-warning);
    }

    &.health-low .health-dot {
      background: var(--el-color-danger);
    }
  }
</style>
