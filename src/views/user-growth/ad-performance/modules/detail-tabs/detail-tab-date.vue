<template>
  <div class="ad-performance-detail-tab">
    <div class="ad-performance-detail-tab__toolbar">
      <div class="ad-performance-detail-tab__ranges" role="tablist" aria-label="日期维度范围">
        <button
          v-for="opt in rangeOptions"
          :key="opt.value"
          type="button"
          class="ad-performance-detail-tab__range"
          :class="{ 'is-active': activeRange === opt.value }"
          role="tab"
          :aria-selected="activeRange === opt.value"
          @click="activeRange = opt.value"
        >
          {{ opt.label }}
        </button>
      </div>
      <ElButton round class="ad-performance-detail-tab__export-btn">导出数据</ElButton>
    </div>

    <ElCard shadow="never" class="ad-performance-detail-card">
      <template #header>
        <div class="ad-performance-detail-card__header">
          <span>消耗 / 首日ROI 趋势</span>
          <span class="ad-performance-detail-card__meta">高度 160px</span>
        </div>
      </template>
      <div ref="dualAxisRef" class="ad-performance-detail-chart"></div>
    </ElCard>

    <ElCard shadow="never" class="ad-performance-detail-card">
      <template #header>
        <div class="ad-performance-detail-card__header">
          <span>CPI 趋势</span>
          <span class="ad-performance-detail-card__meta">高度 100px</span>
        </div>
      </template>
      <div
        ref="cpiRef"
        class="ad-performance-detail-chart ad-performance-detail-chart--small"
      ></div>
    </ElCard>

    <ElCard shadow="never" class="ad-performance-detail-card">
      <template #header>
        <div class="ad-performance-detail-card__header">
          <span>每日明细</span>
          <span class="ad-performance-detail-card__meta">12px</span>
        </div>
      </template>
      <ElTable
        :data="activeDataset.dailyRows ?? []"
        size="small"
        class="ad-performance-detail-table"
      >
        <ElTableColumn prop="date" label="日期" width="120" />
        <ElTableColumn prop="spend" label="消耗" width="100" align="right">
          <template #default="{ row }">{{ formatMoney(row.spend, 0) }}</template>
        </ElTableColumn>
        <ElTableColumn prop="cpi" label="CPI" width="90" align="right">
          <template #default="{ row }">{{ formatMoney(row.cpi, 2) }}</template>
        </ElTableColumn>
        <ElTableColumn prop="ctr" label="点击率" width="90" align="right">
          <template #default="{ row }">{{ row.ctr }}%</template>
        </ElTableColumn>
        <ElTableColumn prop="cvr" label="转化率" width="90" align="right">
          <template #default="{ row }">{{ row.cvr }}%</template>
        </ElTableColumn>
        <ElTableColumn prop="roi1" label="首日ROI" width="90" align="right">
          <template #default="{ row }"
            ><span :class="roiClass(row.roi1)">{{ row.roi1 }}%</span></template
          >
        </ElTableColumn>
        <ElTableColumn prop="wowPercent" label="环比" width="90" align="right">
          <template #default="{ row }">
            <span :class="wowClass(row.wowPercent)">
              {{ row.wowPercent >= 0 ? '+' : '' }}{{ row.wowPercent }}%
            </span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="statusText" label="状态" width="90" align="center">
          <template #default="{ row }">
            <ElTag :type="statusTagType(row.statusText)" size="small" effect="plain">
              {{ row.statusText }}
            </ElTag>
          </template>
        </ElTableColumn>
      </ElTable>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue'
  import { useChart } from '@/hooks/core/useChart'
  import { graphic } from '@/plugins/echarts'
  import type {
    AdPerformanceDetailDateRange,
    AdPerformanceDetailDateRangeData,
    AdPerformanceDetailDateTabData
  } from '../../types'

  defineOptions({ name: 'AdPerformanceDetailTabDate' })

  const props = defineProps<{
    data?: AdPerformanceDetailDateTabData
  }>()

  const activeRange = ref<AdPerformanceDetailDateRange>('last7d')

  watch(
    () => props.data?.range,
    (v) => {
      if (v) activeRange.value = v
    },
    { immediate: true }
  )

  const rangeOptions = [
    { value: 'last7d' as const, label: '近7天' },
    { value: 'last14d' as const, label: '近14天' },
    { value: 'month' as const, label: '本月' }
  ]

  const dualAxisChart = useChart()
  const dualAxisRef = dualAxisChart.chartRef

  const cpiChart = useChart()
  const cpiRef = cpiChart.chartRef

  const activeDataset = computed<AdPerformanceDetailDateRangeData>(() => {
    const ds = props.data?.datasets?.[activeRange.value]
    if (ds) return ds
    return {
      spendRoiTrend: props.data?.spendRoiTrend ?? [],
      cpiTrend: props.data?.cpiTrend ?? [],
      dailyRows: props.data?.dailyRows ?? []
    }
  })

  const spendRoiData = computed(() => activeDataset.value.spendRoiTrend ?? [])
  const cpiData = computed(() => activeDataset.value.cpiTrend ?? [])

  function renderDualAxis() {
    const data = spendRoiData.value
    const isDark = dualAxisChart.isDark.value
    const roiTarget = props.data?.roiTarget ?? 80
    dualAxisChart.initChart(
      {
        tooltip: { trigger: 'axis' },
        grid: { left: 44, right: 44, top: 12, bottom: 18 },
        xAxis: {
          type: 'category',
          data: data.map((d) => d.date),
          axisLabel: { color: isDark ? '#9ca3af' : '#666', fontSize: 11 },
          axisLine: { lineStyle: { color: isDark ? '#333' : '#eee' } }
        },
        yAxis: [
          {
            type: 'value',
            axisLabel: {
              color: isDark ? '#9ca3af' : '#666',
              fontSize: 11,
              formatter: (v: number) => (v >= 1000 ? `${v / 1000}K` : String(v))
            },
            splitLine: { lineStyle: { color: isDark ? '#333' : '#eee', type: 'dashed' } }
          },
          {
            type: 'value',
            axisLabel: { color: isDark ? '#9ca3af' : '#666', fontSize: 11, formatter: '{value}%' },
            splitLine: { show: false }
          }
        ],
        legend: {
          bottom: 0,
          textStyle: { color: isDark ? '#9ca3af' : '#666', fontSize: 11 }
        },
        series: [
          {
            name: '消耗',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            data: data.map((d) => d.spend ?? 0),
            itemStyle: { color: '#F97316' },
            lineStyle: { width: 2, color: '#F97316' },
            areaStyle: {
              color: new graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: isDark ? 'rgba(249,115,22,0.20)' : 'rgba(249,115,22,0.14)' },
                { offset: 1, color: 'rgba(249,115,22,0)' }
              ])
            }
          },
          {
            name: '首日ROI',
            type: 'line',
            yAxisIndex: 1,
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            data: data.map((d) => d.roi1 ?? 0),
            itemStyle: { color: '#10B981' },
            lineStyle: { width: 2, color: '#10B981' }
          }
        ],
        markLine: {
          silent: true,
          symbol: 'none',
          label: { show: true, formatter: `目标 ${roiTarget}%` },
          lineStyle: { type: 'dashed', color: isDark ? '#666' : '#999' },
          data: [{ yAxis: roiTarget, yAxisIndex: 1 }]
        }
      },
      data.length === 0
    )
  }

  function renderCpi() {
    const data = cpiData.value
    const isDark = cpiChart.isDark.value
    const cpiTarget = props.data?.cpiTarget ?? 2.5
    cpiChart.initChart(
      {
        tooltip: { trigger: 'axis' },
        grid: { left: 44, right: 18, top: 10, bottom: 14 },
        xAxis: {
          type: 'category',
          data: data.map((d) => d.date),
          axisLabel: { color: isDark ? '#9ca3af' : '#666', fontSize: 11 },
          axisLine: { lineStyle: { color: isDark ? '#333' : '#eee' } }
        },
        yAxis: {
          type: 'value',
          axisLabel: { color: isDark ? '#9ca3af' : '#666', fontSize: 11 },
          splitLine: { lineStyle: { color: isDark ? '#333' : '#eee', type: 'dashed' } }
        },
        series: [
          {
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            data: data.map((d) => d.cpi ?? 0),
            itemStyle: { color: '#8B5CF6' },
            lineStyle: { width: 2, color: '#8B5CF6' },
            areaStyle: {
              color: new graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: isDark ? 'rgba(139,92,246,0.18)' : 'rgba(139,92,246,0.12)' },
                { offset: 1, color: 'rgba(139,92,246,0)' }
              ])
            }
          }
        ],
        markLine: {
          silent: true,
          symbol: 'none',
          label: { show: true, formatter: `目标 ${cpiTarget.toFixed(2)}` },
          lineStyle: { type: 'dashed', color: isDark ? '#666' : '#999' },
          data: [{ yAxis: cpiTarget }]
        }
      },
      data.length === 0
    )
  }

  function renderAll() {
    renderDualAxis()
    renderCpi()
  }

  onMounted(() => {
    renderAll()
  })

  watch(
    () => [dualAxisChart.isDark.value, cpiChart.isDark.value, props.data] as const,
    () => {
      renderAll()
    },
    { deep: true }
  )

  function formatMoney(n: number, digits: 0 | 2) {
    const num = Number.isFinite(n) ? n : 0
    return (
      '$' +
      num.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })
    )
  }

  function roiClass(roi: number): string {
    return roi >= 80 ? 'is-roi-up' : 'is-roi-down'
  }

  function wowClass(wow: number): string {
    if (wow > 0) return 'is-wow-up'
    if (wow < 0) return 'is-wow-down'
    return 'is-wow-flat'
  }

  function statusTagType(text: string): 'success' | 'warning' | 'info' | 'danger' {
    if (text.includes('正常')) return 'success'
    if (text.includes('异常')) return 'warning'
    return 'info'
  }
</script>

<style scoped lang="scss">
  .ad-performance-detail-tab {
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-width: 0;
  }

  .ad-performance-detail-tab__toolbar {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    min-width: 0;
    padding: 0 4px;
  }

  .ad-performance-detail-tab__ranges {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    padding: 4px;
    background: rgb(255 255 255 / 4%);
    border: 1px solid color-mix(in srgb, var(--default-border) 85%, transparent);
    border-radius: 9999px;
  }

  .ad-performance-detail-tab__range {
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 700;
    color: var(--el-text-color-secondary);
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: 9999px;

    &.is-active {
      color: var(--el-text-color-primary);
      background: color-mix(in srgb, var(--art-success) 16%, transparent);
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--art-success) 40%, transparent) inset;
    }
  }

  .ad-performance-detail-tab__export-btn {
    color: var(--art-success);
    background: color-mix(in srgb, var(--art-success) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--art-success) 55%, transparent);
  }

  .ad-performance-detail-card {
    background: color-mix(in srgb, var(--default-box-color) 92%, transparent);
    border: 1px solid color-mix(in srgb, var(--default-border) 75%, transparent);
    border-radius: 12px;

    :deep(.el-card__header) {
      padding-bottom: 0;
      font-size: 14px;
      font-weight: 800;
      color: var(--el-text-color-primary);
      border-bottom: none;
    }

    :deep(.el-card__body) {
      padding-top: 12px;
    }
  }

  .ad-performance-detail-card__header {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
  }

  .ad-performance-detail-card__meta {
    font-size: 12px;
    font-weight: 600;
    color: var(--el-text-color-secondary);
  }

  .ad-performance-detail-chart {
    height: 160px;
  }

  .ad-performance-detail-chart--small {
    height: 100px;
  }

  .ad-performance-detail-table {
    :deep(.el-table) {
      background: transparent;
    }
  }

  .is-roi-up {
    font-weight: 700;
    color: var(--art-success);
  }

  .is-roi-down {
    font-weight: 700;
    color: var(--art-warning);
  }

  .is-wow-up {
    font-weight: 700;
    color: var(--art-success);
  }

  .is-wow-down {
    font-weight: 700;
    color: var(--art-danger);
  }

  .is-wow-flat {
    color: var(--el-text-color-secondary);
  }
</style>
