<template>
  <div class="tab-campaign-detail">
    <div class="filter-bar">
      <ElSelect
        v-model="filterApp"
        :placeholder="$t('myAds.campaignDetail.filterApp')"
        clearable
        class="filter-item"
      >
        <ElOption :label="$t('myAds.campaignDetail.all')" value="" />
        <ElOption label="天气预报" value="weather" />
        <ElOption label="血糖监测" value="blood" />
        <ElOption label="手机追踪" value="phone" />
      </ElSelect>
      <ElSelect
        v-model="filterPlatform"
        :placeholder="$t('myAds.campaignDetail.filterPlatform')"
        clearable
        class="filter-item"
      >
        <ElOption :label="$t('myAds.campaignDetail.all')" value="" />
        <ElOption label="Google" value="google" />
        <ElOption label="Meta" value="meta" />
        <ElOption label="TikTok" value="tiktok" />
      </ElSelect>
      <ElSelect
        v-model="filterCountry"
        :placeholder="$t('myAds.campaignDetail.filterCountry')"
        clearable
        class="filter-item"
      >
        <ElOption :label="$t('myAds.campaignDetail.all')" value="" />
        <ElOption label="美国" value="US" />
        <ElOption label="日本" value="JP" />
        <ElOption label="英国" value="UK" />
        <ElOption label="加拿大" value="CA" />
        <ElOption label="澳大利亚" value="AU" />
      </ElSelect>
      <ElSelect
        v-model="filterStatus"
        :placeholder="$t('myAds.campaignDetail.filterStatus')"
        clearable
        class="filter-item"
      >
        <ElOption :label="$t('myAds.campaignDetail.all')" value="" />
        <ElOption label="激活" value="active" />
        <ElOption label="未启动" value="inactive" />
        <ElOption label="超预算" value="over_budget" />
      </ElSelect>
      <ElSelect
        v-model="filterType"
        :placeholder="$t('myAds.campaignDetail.filterType')"
        clearable
        class="filter-item"
      >
        <ElOption :label="$t('myAds.campaignDetail.all')" value="" />
      </ElSelect>
      <ElInput
        v-model="searchKeyword"
        :placeholder="$t('myAds.campaignDetail.searchPlaceholder')"
        clearable
        class="filter-search"
      />
      <ElButton @click="onReset">{{ $t('table.searchBar.reset') }}</ElButton>
    </div>

    <div ref="tableWrapRef" class="table-wrap">
      <ElTable
        :data="tableData"
        stripe
        border
        size="small"
        class="campaign-table"
        :row-class-name="rowClassName"
      >
        <ElTableColumn label="应用" min-width="100">
          <template #default="{ row }">
            <span class="app-icon small" :class="'app-icon--' + getAppIcon(row.appName)"></span>
            {{ row.appName }}
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="campaignName"
          :label="$t('myAds.campaignDetail.campaignName')"
          min-width="180"
        />
        <ElTableColumn :label="$t('myAds.campaignDetail.channel')" width="90">
          <template #default="{ row }">
            <span class="channel-tag">{{ row.channel }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn :label="$t('myAds.campaignDetail.country')" width="80">
          <template #default="{ row }">
            <span
              class="country-flag fi"
              :class="'fi-' + (row.countryCode?.toLowerCase() || 'us')"
            ></span>
            {{ row.country }}
          </template>
        </ElTableColumn>
        <ElTableColumn width="100">
          <template #default="{ row }">
            <span class="status-tag" :class="'status--' + row.status">{{ row.statusText }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn :label="$t('myAds.campaignDetail.adSpendBudget')" width="160">
          <template #default="{ row }">
            <div class="spend-budget-cell">
              <span>${{ formatNum(row.spend) }} / ${{ formatNum(row.budget) }}</span>
              <div class="my-ads-progress-track">
                <div
                  class="my-ads-progress-fill"
                  :class="
                    row.progress >= 90
                      ? 'my-ads-progress-fill--danger'
                      : 'my-ads-progress-fill--normal'
                  "
                  :style="{ width: row.progress + '%' }"
                />
              </div>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn
          :label="$t('myAds.campaignDetail.calculatedConsumption')"
          width="110"
          align="right"
        >
          <template #default="{ row }">
            <span class="value-info">${{ formatNum(row.calculatedConsumption) }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn
          :label="$t('myAds.campaignDetail.commissionConsumption')"
          width="110"
          align="right"
        >
          <template #default="{ row }">
            <span class="value-info">${{ formatNum(row.commissionConsumption) }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn :label="$t('myAds.campaignDetail.firstDayRoi')" width="90" align="right">
          <template #default="{ row }">
            <span :class="roiCellClass(row)">{{
              row.firstDayRoi != null ? row.firstDayRoi + '%' : '--'
            }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn :label="$t('myAds.campaignDetail.minConsumption')" width="100" align="right">
          <template #default="{ row }">
            <span :class="profitCellClass(row.minProfit)"
              >${{ formatNum(row.minConsumption) }}</span
            >
          </template>
        </ElTableColumn>
        <ElTableColumn
          :label="$t('myAds.campaignDetail.estimatedProfit')"
          width="100"
          align="right"
        >
          <template #default="{ row }">
            <span :class="profitCellClass(row.estimatedProfit)"
              >${{ formatNum(row.estimatedProfit) }}</span
            >
          </template>
        </ElTableColumn>
        <ElTableColumn :label="$t('myAds.campaignDetail.minProfit')" width="100" align="right">
          <template #default="{ row }">
            <span :class="profitCellClass(row.minProfit)">${{ formatNum(row.minProfit) }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="CPI" width="70" align="right">
          <template #default="{ row }">
            {{ row.cpi != null ? '$' + row.cpi.toFixed(2) : '--' }}
          </template>
        </ElTableColumn>
        <ElTableColumn :label="$t('myAds.campaignDetail.trend')" width="80" align="center">
          <template #default="{ row }">
            <div :data-trend-id="row.id" class="trend-sparkline"></div>
          </template>
        </ElTableColumn>
        <ElTableColumn :label="$t('myAds.campaignDetail.operation')" width="80" fixed="right">
          <template #default>
            <ElButton link type="primary" size="small">{{
              $t('myAds.campaignDetail.detail')
            }}</ElButton>
          </template>
        </ElTableColumn>
      </ElTable>

      <div class="pagination-wrap">
        <span class="total-text">{{
          $t('myAds.campaignDetail.totalCampaigns', { n: total })
        }}</span>
        <ElPagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="prev, pager, next, sizes"
          small
        />
      </div>
    </div>

    <!-- 底部汇总条 -->
    <div class="summary-bar">
      <span class="summary-item">
        {{ $t('myAds.campaignDetail.adSpendSubtotal') }}
        <strong class="value-info">${{ formatNum(summaryBar.adSpendSubtotal) }}</strong>
      </span>
      <span class="summary-item">
        {{ $t('myAds.campaignDetail.calculatedConsumption') }}
        <strong class="value-info">${{ formatNum(summaryBar.calculatedConsumption) }}</strong>
      </span>
      <span class="summary-item">
        {{ $t('myAds.campaignDetail.difference') }}
        <strong class="value-danger">${{ formatNum(summaryBar.difference) }}</strong>
      </span>
      <span class="summary-item">
        {{ $t('myAds.campaignDetail.commissionSubtotal') }}
        <strong class="value-info">${{ formatNum(summaryBar.commissionSubtotal) }}</strong>
      </span>
      <span class="summary-item">
        {{ $t('myAds.campaignDetail.directConsumption') }}
        <strong class="value-info">${{ formatNum(summaryBar.directConsumption) }}</strong>
      </span>
      <span class="summary-item">
        {{ $t('myAds.campaignDetail.commissionRatio') }}
        <strong class="value-info">{{ summaryBar.commissionRatio }}%</strong>
      </span>
      <span class="summary-item">
        {{ $t('myAds.campaignDetail.profitSubtotal') }} {{ $t('myAds.campaignDetail.estimated') }}
        <strong class="value-success">${{ formatNum(summaryBar.estimatedProfitSubtotal) }}</strong>
      </span>
      <span class="summary-item">
        {{ $t('myAds.campaignDetail.minimum') }}
        <strong class="value-success">${{ formatNum(summaryBar.minProfit) }}</strong>
      </span>
      <span v-if="summaryBar.nonProfitableCount > 0" class="summary-item warning">
        {{ $t('myAds.campaignDetail.nonProfitable') }} {{ summaryBar.nonProfitableCount }}条 ▲
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
  import { echarts, type EChartsOption } from '@/plugins/echarts'
  import type { MyAdsCampaignRow, MyAdsCampaignSummaryBar } from '../types'

  defineOptions({ name: 'MyAdsTabCampaignDetail' })

  const props = withDefaults(
    defineProps<{
      list: MyAdsCampaignRow[]
      total: number
      summaryBar: MyAdsCampaignSummaryBar
    }>(),
    { list: () => [], total: 0 }
  )

  const filterApp = ref('')
  const filterPlatform = ref('')
  const filterCountry = ref('')
  const filterStatus = ref('')
  const filterType = ref('')
  const searchKeyword = ref('')
  const currentPage = ref(1)
  const pageSize = ref(10)

  const tableData = computed(() => props.list)
  const total = computed(() => props.total)
  const summaryBar = computed(() => props.summaryBar)

  const tableWrapRef = ref<HTMLElement | null>(null)
  const chartInstances = new Map<string, ReturnType<typeof echarts.init>>()
  let resizeObserver: ResizeObserver | null = null

  function getAppIcon(appName: string): string {
    if (appName.includes('天气')) return 'weather'
    if (appName.includes('血糖')) return 'blood'
    if (appName.includes('手机')) return 'phone'
    return 'default'
  }

  function formatNum(n: number) {
    return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
  }

  function roiCellClass(row: MyAdsCampaignRow): string {
    if (row.firstDayRoi == null) return ''
    return row.firstDayRoi >= 35 ? 'value-success' : 'value-danger'
  }

  function profitCellClass(profit: number): string {
    return profit >= 0 ? 'value-success' : 'value-danger'
  }

  function rowClassName({ row }: { row: MyAdsCampaignRow }) {
    return row.status === 'over_budget' ? 'row-warning' : ''
  }

  function onReset() {
    filterApp.value = ''
    filterPlatform.value = ''
    filterCountry.value = ''
    filterStatus.value = ''
    filterType.value = ''
    searchKeyword.value = ''
  }

  /** 根据趋势数据判断方向，用于折线/面积图颜色 */
  function getTrendColor(row: MyAdsCampaignRow): string {
    const arr = row.trend
    if (!arr?.length) return '#94a3b8'
    const first = arr[0]
    const last = arr[arr.length - 1]
    if (last > first) return '#67c23a' // 上升-绿色
    if (last < first) return '#f56c6c' // 下降-红色
    return '#e6a23c' // 平稳-黄/橙
  }

  function initTrendCharts() {
    const wrap = tableWrapRef.value
    if (!wrap) return
    chartInstances.forEach((c) => c.dispose())
    chartInstances.clear()
    const rows = tableData.value
    const cells = wrap.querySelectorAll<HTMLElement>('[data-trend-id]')
    cells.forEach((el) => {
      const id = el.getAttribute('data-trend-id')
      if (!id) return
      const row = rows.find((r) => r.id === id)
      if (!row) return
      const chart = echarts.init(el)
      chartInstances.set(id, chart)
      const hasData = (row.trend?.length ?? 0) > 0
      const trendData = hasData ? row.trend! : [0, 0]
      const color = getTrendColor(row)
      const option: EChartsOption = {
        grid: { top: 2, right: 2, bottom: 2, left: 2 },
        xAxis: { type: 'category', show: false, data: trendData.map((_, i) => i) },
        yAxis: { type: 'value', show: false, scale: true },
        series: [
          {
            type: 'line',
            data: trendData,
            smooth: hasData,
            showSymbol: hasData,
            symbolSize: 4,
            lineStyle: { color, width: 1 },
            ...(hasData && {
              areaStyle: {
                color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    { offset: 0, color: color + '80' },
                    { offset: 1, color: color + '08' }
                  ]
                }
              }
            })
          }
        ]
      }
      chart.setOption(option)
      chart.resize()
    })
  }

  function scheduleInitTrendCharts() {
    nextTick(() => {
      nextTick(() => initTrendCharts())
    })
  }

  onMounted(() => {
    scheduleInitTrendCharts()
    window.addEventListener('resize', () => chartInstances.forEach((c) => c.resize()))
    if (tableWrapRef.value && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => chartInstances.forEach((c) => c.resize()))
      resizeObserver.observe(tableWrapRef.value)
    }
  })

  watch(tableData, scheduleInitTrendCharts, { deep: true })

  onBeforeUnmount(() => {
    resizeObserver?.disconnect()
    resizeObserver = null
    chartInstances.forEach((c) => c.dispose())
    chartInstances.clear()
  })
</script>

<style lang="scss" scoped>
  @use '../styles/my-ads-common.scss' as *;

  .tab-campaign-detail {
    padding-bottom: 80px;
  }

  .filter-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    margin-bottom: 16px;

    .filter-item {
      width: 120px;
    }

    .filter-search {
      width: 200px;
    }
  }

  .table-wrap {
    margin-bottom: 16px;
    overflow: hidden;
    background: $my-ads-panel-bg;
    border: 1px solid $my-ads-panel-border;
    border-radius: $my-ads-panel-radius;
  }

  .campaign-table {
    font-size: 13px;

    :deep(.el-table__row.row-warning) {
      background: rgb(230 166 60 / 8%);
    }

    .app-icon.small {
      display: inline-block;
      width: 20px;
      height: 20px;
      margin-right: 6px;
      vertical-align: middle;
      background: rgb(148 163 184 / 30%);
      border-radius: 4px;

      &.app-icon--weather {
        background: linear-gradient(135deg, #93c5fd, #60a5fa);
      }

      &.app-icon--blood {
        background: linear-gradient(135deg, #f87171, #ef4444);
      }

      &.app-icon--phone {
        background: linear-gradient(135deg, #86efac, #22c55e);
      }
    }

    .country-flag {
      width: 20px;
      height: 14px;
      margin-right: 4px;
      vertical-align: middle;
      border-radius: 2px;
    }

    .channel-tag {
      font-size: 12px;
      color: $my-ads-text-primary;
    }

    .status-tag {
      font-size: 12px;

      &.status--active {
        color: $my-ads-success;
      }

      &.status--inactive {
        color: $my-ads-text-secondary;
      }

      &.status--over_budget {
        color: $my-ads-warning;
      }
    }

    .spend-budget-cell {
      .my-ads-progress-track {
        height: 6px;
        margin-top: 4px;
      }
    }

    .value-info {
      color: #60a5fa;
    }

    .value-success {
      color: $my-ads-success;
    }

    .value-danger {
      color: $my-ads-danger;
    }

    .trend-sparkline {
      width: 100%;
      min-width: 56px;
      height: 24px;
    }
  }

  .pagination-wrap {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: flex-end;
    padding: 10px 16px;
    border-top: 1px solid $my-ads-panel-border;

    .total-text {
      font-size: 13px;
      color: $my-ads-text-secondary;
    }
  }

  .summary-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 16px 24px;
    align-items: center;
    padding: 12px 16px;
    font-size: 13px;
    background: $my-ads-panel-bg;
    border: 1px solid $my-ads-panel-border;
    border-radius: $my-ads-panel-radius;

    .summary-item {
      color: $my-ads-text-secondary;

      &.warning {
        color: $my-ads-warning;
      }

      .value-success {
        color: $my-ads-success;
      }

      .value-danger {
        color: $my-ads-danger;
      }

      .value-info {
        color: #60a5fa;
      }
    }
  }
</style>
