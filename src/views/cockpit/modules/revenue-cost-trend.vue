<template>
  <div class="cockpit-panel channel-roi-panel">
    <div class="panel-header">
      <span class="panel-title">渠道ROI&安装量</span>
      <a class="panel-more" href="javascript:;">查看更多</a>
    </div>
    <div class="panel-body">
      <template v-if="list.length">
        <ArtTable
          :data="list"
          :columns="roiColumns"
          size="small"
          height="calc(100% + 45px)"
          show-summary
          :summary-method="getSummaries"
          class="roi-table"
        >
          <template #channel="{ row }">
            <div class="col-channel">
              <span class="channel-icon" />
              <span class="channel-name">{{ row.channel }}</span>
            </div>
          </template>
          <template #spend="{ row }">
            <span class="col-number">{{ formatMoney(row.spend) }}</span>
          </template>
          <template #installs="{ row }">
            <span class="col-number">{{ formatNumber(row.installs) }}</span>
          </template>
          <template #cpi="{ row }">
            <span class="col-cpi" :class="getCpiClass(row.cpi)">{{ row.cpi.toFixed(2) }}</span>
          </template>
          <template #trend="{ $index }">
            <div
              :ref="(el) => $index >= 0 && setTrendChartRef(el as HTMLElement, $index)"
              class="trend-chart-cell"
            />
          </template>
        </ArtTable>
      </template>
      <div v-else class="roi-empty">暂无数据</div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
  import { echarts, type EChartsOption } from '@/plugins/echarts'
  import ArtTable from '@/components/core/tables/art-table/index.vue'
  import type { ColumnOption } from '@/types'
  import type { CockpitChannelRoiInstallItem } from '../types'
  import { MOCK_COCKPIT_OVERVIEW } from '../mock/data'

  defineOptions({ name: 'CockpitChannelRoiInstall' })
  /** ArtTable 列配置 */
  const roiColumns: ColumnOption<CockpitChannelRoiInstallItem>[] = [
    { prop: 'channel', label: '渠道', minWidth: 100, useSlot: true },
    { prop: 'spend', label: '消耗', minWidth: 60, align: 'right', useSlot: true },
    { prop: 'installs', label: '安装量', minWidth: 60, align: 'right', useSlot: true },
    { prop: 'cpi', label: 'CPI', width: 50, align: 'right', useSlot: true },
    { prop: 'trend', label: '近7日', width: 80, align: 'center', useSlot: true }
  ]

  const props = withDefaults(defineProps<{ list?: CockpitChannelRoiInstallItem[] | null }>(), {
    list: null
  })

  const list = computed(() =>
    Array.isArray(props.list) ? props.list : (MOCK_COCKPIT_OVERVIEW.channelRoiInstall ?? [])
  )

  const totals = computed(() => {
    const rows = list.value
    const spend = rows.reduce((s: number, r: CockpitChannelRoiInstallItem) => s + r.spend, 0)
    const installs = rows.reduce((s: number, r: CockpitChannelRoiInstallItem) => s + r.installs, 0)
    const cpi = spend > 0 ? spend / installs : 0
    return { spend, installs, cpi }
  })

  /** CPI 三档：绿(<1.0) / 黄(1.0~1.3) / 红(>=1.3) */
  const CPI_GREEN_MAX = 1.0
  const CPI_YELLOW_MAX = 1.3
  function getCpiClass(cpi: number): 'cpi-green' | 'cpi-yellow' | 'cpi-red' {
    if (cpi < CPI_GREEN_MAX) return 'cpi-green'
    if (cpi < CPI_YELLOW_MAX) return 'cpi-yellow'
    return 'cpi-red'
  }

  function formatMoney(n: number): string {
    return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 })
  }

  function formatNumber(n: number): string {
    return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
  }

  /** ElTable 合计行 */
  function getSummaries(): string[] {
    const t = totals.value
    return ['合计', formatMoney(t.spend), formatNumber(t.installs), '$' + t.cpi.toFixed(2), '']
  }

  const trendChartRefs = ref<(HTMLElement | null)[]>([])
  const chartInstances = new Map<number, ReturnType<typeof echarts.init>>()

  function setTrendChartRef(el: HTMLElement | null, index: number) {
    if (el) {
      trendChartRefs.value[index] = el
    }
  }

  /** 近7日折线图颜色与 CPI 列一致：按 CPI 取绿/黄/红 */
  const CPI_COLORS = { green: '#67c23a', yellow: '#e6a23c', red: '#f56c6c' } as const
  function getChartColorByCpi(cpi: number): string {
    if (cpi < CPI_GREEN_MAX) return CPI_COLORS.green
    if (cpi < CPI_YELLOW_MAX) return CPI_COLORS.yellow
    return CPI_COLORS.red
  }

  function buildMiniOption(trend: number[], lineColor: string): EChartsOption {
    return {
      grid: { top: 2, right: 2, bottom: 2, left: 2, containLabel: false },
      xAxis: { type: 'category', show: false, data: trend.map((_, i) => i) },
      yAxis: { type: 'value', show: false, scale: true },
      series: [
        {
          type: 'line',
          data: trend,
          smooth: true,
          showSymbol: false,
          lineStyle: { color: lineColor, width: 1 },
          areaStyle: { color: lineColor + '40' }
        }
      ]
    }
  }

  function initAllTrendCharts() {
    nextTick(() => {
      const rows = list.value
      const maxIndex = rows.length - 1
      chartInstances.forEach((chart, i) => {
        if (i > maxIndex) {
          chart.dispose()
          chartInstances.delete(i)
        }
      })
      rows.forEach((row: CockpitChannelRoiInstallItem, i: number) => {
        const el = trendChartRefs.value[i]
        if (!el || !row.trend?.length) return
        const lineColor = getChartColorByCpi(row.cpi)
        let chart = chartInstances.get(i)
        if (!chart) {
          chart = echarts.init(el)
          chartInstances.set(i, chart)
        }
        chart.setOption(buildMiniOption(row.trend, lineColor), { replaceMerge: ['series'] })
      })
    })
  }

  function resizeTrendCharts() {
    chartInstances.forEach((chart) => chart.resize())
  }

  function disposeTrendCharts() {
    chartInstances.forEach((chart) => chart.dispose())
    chartInstances.clear()
  }

  onMounted(() => {
    initAllTrendCharts()
    window.addEventListener('resize', resizeTrendCharts)
  })

  watch(list, () => initAllTrendCharts(), { deep: true })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeTrendCharts)
    disposeTrendCharts()
  })
</script>

<style scoped lang="scss">
  .channel-roi-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    font-size: 14px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    .panel-title {
      font-weight: 500;
      color: var(--el-text-color-primary);
    }

    .panel-more {
      font-size: 13px;
      color: var(--el-text-color-secondary);
      text-decoration: none;

      &:hover {
        color: var(--el-color-primary);
      }
    }
  }

  .panel-body {
    flex: 1;
    padding: 12px 16px;
    overflow: auto;
  }

  .roi-empty {
    padding: 32px 16px;
    font-size: 13px;
    color: var(--el-text-color-secondary);
    text-align: center;
  }

  .roi-table {
    font-size: 13px;

    :deep(.el-table__header th) {
      font-weight: 500;
      color: var(--el-text-color-secondary);
    }

    :deep(.el-table__body td),
    :deep(.el-table__footer td) {
      color: var(--el-text-color-primary);
    }

    :deep(.el-table__footer .cell) {
      font-weight: 500;
    }

    .col-channel {
      display: flex;
      gap: 8px;
      align-items: center;

      .channel-icon {
        flex-shrink: 0;
        width: 24px;
        height: 24px;
        background: var(--el-border-color);
        border-radius: 4px;
      }

      .channel-name {
        white-space: nowrap;
      }
    }

    .col-number {
      white-space: nowrap;
    }

    .col-cpi {
      &.cpi-green {
        color: #67c23a;
      }

      &.cpi-yellow {
        color: #e6a23c;
      }

      &.cpi-red {
        color: #f56c6c;
      }
    }

    .trend-chart-cell {
      width: 100%;
      height: 24px;
    }
  }
</style>
