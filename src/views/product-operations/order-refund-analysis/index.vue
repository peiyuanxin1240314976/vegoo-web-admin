<template>
  <div class="order-refund-analysis-page flex flex-col art-full-height" v-loading="globalLoading">
    <div class="ora-page-fx" aria-hidden="true" />

    <div
      class="order-refund-analysis-page__section order-refund-analysis-page__section--filters ora-entry-1"
    >
      <div class="ora-filters">
        <div class="ora-filters__left">
          <div class="ora-filter-chip">
            <ElIcon class="ora-filter-chip__icon"><Calendar /></ElIcon>
            <span class="ora-filter-chip__label">日期范围</span>
            <span class="ora-filter-chip__value">{{ dateRangeDisplay }}</span>
          </div>

          <AppPlatformSearchSelect
            v-model="draftAppId"
            mode="app"
            class="ora-filter-app-select-wrap"
            input-class="ora-filter-app-select__trigger"
            placeholder="应用"
            search-placeholder="搜索类别/应用名称/应用简称"
            all-label="全部应用"
            :setting-apps="settingAppsForSelect"
            :height="40"
            :width="128"
            :min-width="100"
            :max-width="128"
            radius="9999px"
            dropdown-class="ora-filter-popper"
            :show-platform-suffix="true"
          />

          <AppDatePicker
            v-model="dateRangeDraft"
            type="daterange"
            range-separator="~"
            start-placeholder="起"
            end-placeholder="止"
            value-format="YYYY-MM-DD"
            class="ora-filter-date"
            :shortcuts="dateRangeShortcuts"
            popper-class="ora-filter-popper"
          />

          <ElSelect
            v-model="draftFilters.compareType"
            placeholder="对比期间"
            class="ora-filter-select ora-filter-select--compare"
            :prefix-icon="TrendCharts"
            popper-class="ora-filter-popper"
          >
            <ElOption
              v-for="o in COMPARE_OPTIONS"
              :key="o.value"
              :label="o.label"
              :value="o.value"
            />
          </ElSelect>

          <ElSelect
            v-model="draftFilters.country"
            placeholder="国家"
            class="ora-filter-select"
            :prefix-icon="Flag"
            popper-class="ora-filter-popper"
          >
            <ElOption
              v-for="o in COUNTRY_OPTIONS"
              :key="o.value"
              :label="o.label"
              :value="o.value"
            />
          </ElSelect>

          <ElSelect
            v-model="draftFilters.platform"
            placeholder="支付平台"
            class="ora-filter-select ora-filter-select--pay"
            :prefix-icon="Money"
            popper-class="ora-filter-popper"
          >
            <ElOption
              v-for="o in PLATFORM_OPTIONS"
              :key="o.value"
              :label="o.label"
              :value="o.value"
            />
          </ElSelect>

          <ElButton
            round
            class="ora-filter-action-btn ora-filter-action-btn--query"
            :disabled="!isDirty"
            @click="onQuery"
          >
            查询
          </ElButton>
          <!-- <ElButton
            round
            class="ora-filter-action-btn ora-filter-action-btn--export"
            @click="handleExport"
          >
            导出
          </ElButton> -->
          <ElButton
            round
            aria-label="刷新数据"
            class="ora-filter-action-btn ora-filter-action-btn--refresh"
            :icon="RefreshRight"
            @click="onRefresh"
          />
        </div>
      </div>
    </div>

    <div class="order-refund-analysis-page__body ora-entry-2">
      <!-- KPI：布局与霓虹卡片对齐广告成效 -->
      <section class="ora-kpi-cards" aria-label="退款指标概览">
        <div v-for="(card, idx) in kpiCards" :key="idx" class="ora-kpi-cards__item">
          <div
            class="ora-kpi-card"
            :class="`ora-kpi-card--${card.themeKey}`"
            :style="{ animationDelay: `${idx * 60}ms` }"
          >
            <div class="ora-kpi-card__border-spin" aria-hidden="true" />
            <div class="ora-kpi-card__label">{{ card.label }}</div>
            <div class="ora-kpi-card__value-stack">
              <div class="ora-kpi-card__value">{{ card.value }}</div>
              <div class="ora-kpi-card__tip-row">
                <div v-if="card.change" class="ora-kpi-card__compare" :class="card.compareClass">
                  {{ card.change }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ElRow :gutter="16" class="ora-chart-row ora-chart-row--r1">
        <ElCol :xs="24" :lg="10">
          <ElCard class="ora-chart-card ora-chart-card--trend" shadow="never">
            <template #header>
              <span class="ora-chart-card__title">退款趋势（30天）</span>
              <span class="ora-chart-card__title-dot ora-chart-card__title-dot--trend"></span>
            </template>
            <div ref="trendRef" class="ora-chart-card__body" />
          </ElCard>
        </ElCol>
        <ElCol :xs="24" :lg="7">
          <ElCard class="ora-chart-card ora-chart-card--donut" shadow="never">
            <template #header>
              <span class="ora-chart-card__title">退款原因分布</span>
              <span class="ora-chart-card__title-dot ora-chart-card__title-dot--reason"></span>
            </template>
            <div ref="reasonRef" class="ora-chart-card__body ora-chart-card__body--donut" />
            <div class="ora-donut-legend">
              <div v-for="item in REASON_COLORS" :key="item.name" class="ora-donut-legend__item">
                <span class="ora-donut-legend__dot" :style="{ background: item.color }" />
                <span class="ora-donut-legend__text">{{ item.name }} {{ item.pct }}%</span>
              </div>
            </div>
          </ElCard>
        </ElCol>
        <ElCol :xs="24" :lg="7">
          <ElCard class="ora-chart-card ora-chart-card--donut" shadow="never">
            <template #header>
              <span class="ora-chart-card__title">退款订单结构</span>
              <span class="ora-chart-card__title-dot ora-chart-card__title-dot--detail"></span>
            </template>
            <div ref="detailRef" class="ora-chart-card__body ora-chart-card__body--donut" />
            <div class="ora-donut-legend">
              <div v-for="item in DETAIL_COLORS" :key="item.name" class="ora-donut-legend__item">
                <span class="ora-donut-legend__dot" :style="{ background: item.color }" />
                <span class="ora-donut-legend__text">{{ item.name }}</span>
              </div>
            </div>
          </ElCard>
        </ElCol>
      </ElRow>

      <ElRow :gutter="16" class="ora-chart-row ora-chart-row--r2">
        <ElCol :xs="24" :lg="11">
          <ElCard class="ora-chart-card ora-chart-card--country" shadow="never">
            <template #header>
              <span class="ora-chart-card__title">国家退款率对比</span>
              <span class="ora-chart-card__title-dot ora-chart-card__title-dot--country"></span>
            </template>
            <div ref="countryRef" class="ora-chart-card__body ora-chart-card__body--country" />
          </ElCard>
        </ElCol>
        <ElCol :xs="24" :lg="13">
          <ElCard class="ora-chart-card ora-chart-card--table" shadow="never">
            <template #header>
              <span class="ora-chart-card__title">退款订单明细</span>
              <span class="ora-chart-card__title-dot ora-chart-card__title-dot--table"></span>
            </template>
            <el-table
              :data="orderData"
              class="orders-table"
              size="small"
              :show-header="true"
              row-class-name="order-row"
            >
              <el-table-column prop="orderId" label="订单ID" min-width="110">
                <template #default="{ row }">
                  <span class="order-id">{{ row.orderId }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="user" label="用户" min-width="120" />
              <el-table-column prop="amount" label="金额" min-width="70">
                <template #default="{ row }">${{ row.amount.toFixed(2) }}</template>
              </el-table-column>
              <el-table-column prop="reason" label="原因" min-width="110" />
              <el-table-column prop="platform" label="平台" min-width="95" />
              <el-table-column prop="date" label="日期" min-width="100" />
              <el-table-column prop="status" label="状态" min-width="70" align="center">
                <template #default="{ row }">
                  <span class="status-tag" :class="`st-${row.status}`">
                    {{ STATUS_LABELS[row.status] }}
                  </span>
                </template>
              </el-table-column>
            </el-table>
          </ElCard>
        </ElCol>
      </ElRow>

      <!-- ═══════════════════════════════════════════
         ALERT BAR
    ═══════════════════════════════════════════ -->
      <div class="alert-bar" :class="{ visible: alertVisible }">
        <span class="alert-icon">⚠</span>
        <span>{{ alertMessage }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Calendar, Flag, Money, RefreshRight, TrendCharts } from '@element-plus/icons-vue'
  import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
  import { storeToRefs } from 'pinia'
  import AppDatePicker from '@/components/core/forms/AppDatePicker.vue'
  import * as echarts from 'echarts'
  import type { ECharts, EChartsOption } from 'echarts'
  import { ElMessage } from 'element-plus'
  import AppPlatformSearchSelect from '@/components/filter/app-platform-search-select.vue'
  import { useCockpitMetaFilterStore } from '@/store/modules/cockpit-meta-filter'
  import { cloneAppDate, formatYYYYMMDD, getAppNow } from '@/utils/app-now'
  import { dateRangeShortcuts } from '@/utils/form/date-shortcuts'
  import { toAppIdsRequestBody } from '@/utils/app-id-request'
  import { orderRefundAnalysisApi } from '@/api/product-operations/order-refund-analysis'
  import type {
    CountryRate,
    DashboardPayload,
    KpiCard,
    OrderRecord,
    OrderRefundDashboardParams,
    RefundFilters,
    TrendPoint
  } from './types'

  defineOptions({ name: 'OrderRefundAnalysis' })

  function createDefaultRefundFilters(): RefundFilters {
    const end = getAppNow()
    const start = cloneAppDate(end)
    start.setDate(start.getDate() - 29)
    return {
      appIds: [],
      dateRange: [formatYYYYMMDD(start), formatYYYYMMDD(end)],
      compareType: 'last_month',
      country: 'all',
      platform: 'all'
    }
  }

  // ════════════════════════════════════════════════════════════
  // CONSTANTS
  // ════════════════════════════════════════════════════════════

  const metaStore = useCockpitMetaFilterStore()
  const { data: cockpitMeta } = storeToRefs(metaStore)
  const settingAppsForSelect = computed(() => cockpitMeta.value?.settingApps ?? [])

  /** 单选应用 id ↔ `draftFilters.appIds`（POST `appIds[]`） */
  const draftAppId = computed({
    get: () => (draftFilters.appIds.length === 1 ? draftFilters.appIds[0]! : ''),
    set: (v: string) => {
      draftFilters.appIds = toAppIdsRequestBody(v)
    }
  })

  const COMPARE_OPTIONS = [
    { label: '上月同期', value: 'last_month' },
    { label: '上周同期', value: 'last_week' },
    { label: '去年同期', value: 'last_year' }
  ]

  const COUNTRY_OPTIONS = [
    { label: '全部', value: 'all' },
    { label: 'US', value: 'US' },
    { label: 'UK', value: 'UK' },
    { label: 'DE', value: 'DE' },
    { label: 'FR', value: 'FR' },
    { label: 'JP', value: 'JP' },
    { label: 'CN', value: 'CN' },
    { label: 'AU', value: 'AU' },
    { label: 'CA', value: 'CA' }
  ]

  const PLATFORM_OPTIONS = [
    { label: '全部', value: 'all' },
    { label: 'Google Play', value: 'google_play' },
    { label: 'App Store', value: 'app_store' },
    { label: 'Stripe', value: 'stripe' }
  ]

  const STATUS_LABELS: Record<string, string> = {
    refunded: '已退款',
    processing: '处理中',
    pending: '待审核'
  }

  const REASON_COLORS = [
    { name: '用户主动取消', pct: 45, color: '#4e90e8' },
    { name: '功能不符预期', pct: 28, color: '#f59e0b' },
    { name: '订阅重复扣费', pct: 12, color: '#34d399' },
    { name: '支付失败', pct: 8, color: '#f87171' },
    { name: '其他', pct: 7, color: '#6b7280' }
  ]

  const DETAIL_COLORS = [
    { name: '用户主动取消', color: '#4e90e8' },
    { name: '功能不符预期', color: '#f59e0b' },
    { name: '订阅重复扣费', color: '#34d399' },
    { name: '支付失败', color: '#f87171' },
    { name: '其他', color: '#6b7280' }
  ]

  // ════════════════════════════════════════════════════════════
  // STATE
  // ════════════════════════════════════════════════════════════

  const globalLoading = ref(false)

  function cloneRefundFilters(f: RefundFilters): RefundFilters {
    return {
      appIds: [...f.appIds],
      compareType: f.compareType,
      country: f.country,
      platform: f.platform,
      dateRange: [f.dateRange[0], f.dateRange[1]]
    }
  }

  /** 已应用条件（与接口一致，仅点「查询」后更新；刷新沿用已应用条件） */
  const appliedFilters = reactive<RefundFilters>(cloneRefundFilters(createDefaultRefundFilters()))
  /** 表单草稿 */
  const draftFilters = reactive<RefundFilters>(cloneRefundFilters(createDefaultRefundFilters()))

  const isDirty = computed(() => {
    const a = appliedFilters
    const d = draftFilters
    const appSame =
      a.appIds.length === d.appIds.length && a.appIds.every((id, i) => id === d.appIds[i])
    return (
      !appSame ||
      String(a.compareType) !== String(d.compareType) ||
      String(a.country) !== String(d.country) ||
      String(a.platform) !== String(d.platform) ||
      String(a.dateRange[0]) !== String(d.dateRange[0]) ||
      String(a.dateRange[1]) !== String(d.dateRange[1])
    )
  })

  const dateRangeDraft = computed({
    get: (): [string, string] => [draftFilters.dateRange[0] ?? '', draftFilters.dateRange[1] ?? ''],
    set: (val: [string, string] | null) => {
      if (val && val.length === 2) {
        draftFilters.dateRange = [val[0], val[1]]
      }
    }
  })

  const dateRangeDisplay = computed(() => {
    const s = draftFilters.dateRange[0]?.trim()
    const e = draftFilters.dateRange[1]?.trim()
    if (s && e) return `${s} ~ ${e}`
    return '请选择'
  })

  // KPI data
  const kpiRaw = reactive({
    totalAmount: 12450,
    totalAmountChange: -8,
    refundRate: 3.2,
    refundRateChange: 0.5,
    orderCount: 1847,
    orderCountChange: -12,
    avgAmount: 6.74,
    revenueRatio: 4.8
  })

  // Chart data
  const trendData = ref<TrendPoint[]>([])
  const reasonData = ref<{ name: string; value: number }[]>([])
  const countryData = ref<CountryRate[]>([])
  const orderData = ref<OrderRecord[]>([])
  const alertMessage = ref('')
  const alertVisible = ref(false)

  // ════════════════════════════════════════════════════════════
  // COMPUTED — KPI CARDS
  // ════════════════════════════════════════════════════════════

  const kpiCards = computed<KpiCard[]>(() => [
    {
      label: '退款总金额',
      value: `$${kpiRaw.totalAmount.toLocaleString()}`,
      change: `↓ ${Math.abs(kpiRaw.totalAmountChange)}% vs上月`,
      themeKey: 'refund',
      compareClass: 'is-up'
    },
    {
      label: '退款率',
      value: `${kpiRaw.refundRate.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}%`,
      change: `↑ +${kpiRaw.refundRateChange}%`,
      themeKey: 'rate',
      compareClass: 'is-down'
    },
    {
      label: '退款订单数',
      value: kpiRaw.orderCount.toLocaleString(),
      change: `↓ ${Math.abs(kpiRaw.orderCountChange)}%`,
      themeKey: 'orders',
      compareClass: 'is-up'
    },
    {
      label: '平均退款金额',
      value: `$${kpiRaw.avgAmount.toFixed(2)}`,
      themeKey: 'avg'
    },
    {
      label: '退款损失占收入比',
      value: `${kpiRaw.revenueRatio.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}%`,
      themeKey: 'loss'
    }
  ])

  // ════════════════════════════════════════════════════════════
  // CHART REFS & INSTANCES
  // ════════════════════════════════════════════════════════════

  const trendRef = ref<HTMLElement>()
  const reasonRef = ref<HTMLElement>()
  const detailRef = ref<HTMLElement>()
  const countryRef = ref<HTMLElement>()

  let trendChart: ECharts | null = null
  let reasonChart: ECharts | null = null
  let detailChart: ECharts | null = null
  let countryChart: ECharts | null = null

  let resizeObserver: ResizeObserver | null = null

  // ════════════════════════════════════════════════════════════
  // API FETCH（config/data-source.ts 控制 mock / remote）
  // ════════════════════════════════════════════════════════════

  /** 筛选 UI 值 → 契约 POST 体（`appIds[]` / `countryCode` / `paymentPlatform`，国家与平台「全部」为 `""`） */
  function toApiCountryCode(country: string): string {
    if (!country || country === 'all') return ''
    const lower = country.toLowerCase()
    return lower === 'uk' ? 'gb' : lower
  }

  function buildOrderRefundDashboardParams(f: RefundFilters): OrderRefundDashboardParams {
    return {
      appIds: [...(f.appIds ?? [])],
      startDate: f.dateRange[0],
      endDate: f.dateRange[1],
      compareType: f.compareType,
      countryCode: toApiCountryCode(f.country),
      paymentPlatform: f.platform === 'all' ? '' : f.platform
    }
  }

  async function fetchDashboardData(): Promise<void> {
    globalLoading.value = true
    try {
      const payload = await orderRefundAnalysisApi.getDashboard(
        buildOrderRefundDashboardParams(appliedFilters)
      )
      applyPayload(payload)
    } catch (err) {
      console.error('[RefundDashboard] fetch error:', err)
      ElMessage.error('数据加载失败，请稍后重试')
    } finally {
      globalLoading.value = false
    }
  }

  function applyPayload(p: DashboardPayload): void {
    // KPI
    Object.assign(kpiRaw, p.kpi)

    // Charts
    trendData.value = p.trend
    reasonData.value = p.reasonData
    countryData.value = p.countryData
    orderData.value = p.orderData

    // Alert
    alertMessage.value = p.alertMessage
    alertVisible.value = Boolean(p.alertMessage)

    // Update charts
    updateCharts()
  }

  // ════════════════════════════════════════════════════════════
  // ECHARTS — OPTION BUILDERS
  // ════════════════════════════════════════════════════════════

  function buildTrendOption(): EChartsOption {
    const dates = trendData.value.map((d) => d.date)
    const amounts = trendData.value.map((d) => d.refundAmount)
    const ma7 = trendData.value.map((d) => d.ma7)

    // annotation indices (5th and 18th day of month roughly)
    const annotIdx1 = 4 // day 5
    const annotIdx2 = 17 // day 18

    return {
      backgroundColor: 'transparent',
      animation: true,
      animationDuration: 800,
      animationEasing: 'cubicOut',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(18,24,40,0.95)',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        textStyle: { color: '#e6edf3', fontSize: 12 },
        formatter: (params: any) => {
          const p0 = params[0]
          const p1 = params[1]
          return `
          <div style="padding:4px 6px">
            <div style="color:#8b949e;margin-bottom:4px">${p0.axisValue}</div>
            <div style="display:flex;align-items:center;gap:6px">
              <span style="display:inline-block;width:8px;height:8px;background:#ef4444;border-radius:50%"></span>
              退款额：$${p0.value.toLocaleString()}
            </div>
            <div style="display:flex;align-items:center;gap:6px;margin-top:3px">
              <span style="display:inline-block;width:16px;height:2px;background:#f59e0b;border-top:2px dashed #f59e0b"></span>
              7日均：$${p1.value.toLocaleString()}
            </div>
          </div>
        `
        }
      },
      grid: { left: 55, right: 20, top: 24, bottom: 36 },
      xAxis: {
        type: 'category',
        data: dates,
        boundaryGap: false,
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
        axisLabel: { color: '#6b7280', fontSize: 11 },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: '#6b7280',
          fontSize: 11,
          formatter: (v: number) => `$${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`
        },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)', type: 'solid' } },
        axisLine: { show: false },
        axisTick: { show: false }
      },
      series: [
        {
          name: '退款数',
          type: 'line',
          data: amounts,
          smooth: 0.5,
          symbol: 'none',
          lineStyle: { color: '#ef4444', width: 2 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(239,68,68,0.55)' },
              { offset: 0.6, color: 'rgba(239,68,68,0.15)' },
              { offset: 1, color: 'rgba(239,68,68,0.02)' }
            ])
          },
          markPoint: {
            symbol: 'circle',
            symbolSize: 10,
            data: [
              {
                coord: [dates[annotIdx1], amounts[annotIdx1]],
                name: `${dates[annotIdx1]}: 大量退款批次`,
                label: {
                  show: true,
                  position: 'top',
                  distance: 12,
                  formatter: `${dates[annotIdx1]}: 大量退款批次`,
                  backgroundColor: 'rgba(20,30,50,0.92)',
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderWidth: 1,
                  borderRadius: 4,
                  padding: [5, 9],
                  color: '#e6edf3',
                  fontSize: 11
                },
                itemStyle: { color: '#ef4444', borderColor: '#fff', borderWidth: 1.5 }
              },
              {
                coord: [dates[annotIdx2], amounts[annotIdx2]],
                name: `${dates[annotIdx2]}: 服务中断影响`,
                label: {
                  show: true,
                  position: 'top',
                  distance: 12,
                  formatter: `${dates[annotIdx2]}: 服务中断影响`,
                  backgroundColor: 'rgba(20,30,50,0.92)',
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderWidth: 1,
                  borderRadius: 4,
                  padding: [5, 9],
                  color: '#e6edf3',
                  fontSize: 11
                },
                itemStyle: { color: '#f59e0b', borderColor: '#fff', borderWidth: 1.5 }
              }
            ]
          }
        },
        {
          name: '7日均线',
          type: 'line',
          data: ma7,
          smooth: 0.6,
          symbol: 'none',
          lineStyle: { color: '#f59e0b', width: 1.5, type: 'dashed' }
        }
      ]
    }
  }

  function buildDonutOption(
    seriesData: { name: string; value: number }[],
    colors: string[],
    centerTotal: number
  ): EChartsOption {
    return {
      backgroundColor: 'transparent',
      animation: true,
      animationDuration: 900,
      animationEasing: 'cubicOut',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(18,24,40,0.95)',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        textStyle: { color: '#e6edf3', fontSize: 12 },
        formatter: (p: any) => `${p.name}：${p.value}%`
      },
      series: [
        {
          type: 'pie',
          radius: ['46%', '68%'],
          center: ['46%', '48%'],
          data: seriesData.map((d, i) => ({
            name: d.name,
            value: d.value,
            itemStyle: { color: colors[i] ?? '#888' }
          })),
          label: {
            show: true,
            fontSize: 10,
            color: '#9ca3af',
            formatter: (p: any) =>
              `${p.name.replace('订阅重复扣费', '订阅\n重复扣费')}\n${p.value}%`,
            lineHeight: 14
          },
          labelLine: {
            length: 8,
            length2: 10,
            lineStyle: { color: 'rgba(255,255,255,0.15)' }
          },
          emphasis: {
            scale: true,
            scaleSize: 4,
            label: { fontSize: 11, fontWeight: 'bold' as const }
          },
          itemStyle: { borderRadius: 3, borderColor: '#161b2d', borderWidth: 2 }
        }
      ],
      graphic: [
        {
          type: 'text',
          left: '38%',
          top: '38%',
          style: {
            text: '总订单',
            fill: '#8b949e',
            fontSize: 11,
            textAlign: 'center'
          }
        },
        {
          type: 'text',
          left: '38%',
          top: '48%',
          style: {
            text: centerTotal.toLocaleString(),
            fill: '#e6edf3',
            fontSize: 20,
            fontWeight: 'bold',
            textAlign: 'center'
          }
        }
      ] as NonNullable<EChartsOption['graphic']>
    }
  }

  function buildCountryOption(): EChartsOption {
    const data = [...countryData.value].reverse() // display top-to-bottom

    const COLOR_MAP: Record<CountryRate['level'], string> = {
      good: '#22c55e',
      warning: '#eab308',
      danger: '#ef4444',
      critical: '#ef4444'
    }

    const barData = data.map((d) => ({
      value: d.rate,
      itemStyle: {
        color: COLOR_MAP[d.level],
        borderRadius: [0, 3, 3, 0]
      },
      label: {
        show: true,
        position: 'right' as const,
        distance: 6,
        formatter: (p: any) => {
          const item = data[p.dataIndex]
          if (item.badge) {
            return `{value|${item.rate}%}  {badge|${item.badge}}`
          }
          return `{value|${item.rate}%}`
        },
        rich: {
          value: { color: '#9ca3af', fontSize: 12 },
          badge: {
            color: '#fff',
            backgroundColor: 'rgba(239,68,68,0.2)',
            borderColor: 'rgba(239,68,68,0.4)',
            borderWidth: 1,
            borderRadius: 3,
            padding: [2, 6],
            fontSize: 11
          }
        }
      }
    }))

    // Override badge color for 'good' items
    data.forEach((d, i) => {
      if (d.level === 'good' && d.badge) {
        ;(barData[i].label as any).rich.badge = {
          color: '#fff',
          backgroundColor: 'rgba(34,197,94,0.15)',
          borderColor: 'rgba(34,197,94,0.4)',
          borderWidth: 1,
          borderRadius: 3,
          padding: [2, 6],
          fontSize: 11
        }
      }
    })

    return {
      backgroundColor: 'transparent',
      animation: true,
      animationDuration: 800,
      animationEasing: 'cubicOut',
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'none' },
        backgroundColor: 'rgba(18,24,40,0.95)',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        textStyle: { color: '#e6edf3', fontSize: 12 },
        formatter: (params: any) => {
          const p = params[0]
          return `${p.name}：${p.value}%`
        }
      },
      grid: { left: 44, right: 160, top: 8, bottom: 8, containLabel: false },
      xAxis: {
        type: 'value',
        max: 8,
        show: false
      },
      yAxis: {
        type: 'category',
        data: data.map((d) => d.countryCode.toUpperCase()),
        axisLabel: { color: '#9ca3af', fontSize: 13, fontWeight: 'bold' as const },
        axisLine: { show: false },
        axisTick: { show: false }
      },
      series: [
        {
          type: 'bar',
          data: barData,
          barWidth: 14,
          barCategoryGap: '35%'
        }
      ]
    }
  }

  // ════════════════════════════════════════════════════════════
  // CHART LIFECYCLE
  // ════════════════════════════════════════════════════════════

  function initCharts(): void {
    if (trendRef.value) {
      trendChart = echarts.init(trendRef.value, null, { renderer: 'canvas' })
    }
    if (reasonRef.value) {
      reasonChart = echarts.init(reasonRef.value, null, { renderer: 'canvas' })
    }
    if (detailRef.value) {
      detailChart = echarts.init(detailRef.value, null, { renderer: 'canvas' })
    }
    if (countryRef.value) {
      countryChart = echarts.init(countryRef.value, null, { renderer: 'canvas' })
    }
  }

  function updateCharts(): void {
    const colors = REASON_COLORS.map((r) => r.color)

    trendChart?.setOption(buildTrendOption(), { notMerge: true })

    reasonChart?.setOption(buildDonutOption(reasonData.value, colors, kpiRaw.orderCount), {
      notMerge: true
    })

    detailChart?.setOption(buildDonutOption(reasonData.value, colors, kpiRaw.orderCount), {
      notMerge: true
    })

    countryChart?.setOption(buildCountryOption(), { notMerge: true })
  }

  function resizeCharts(): void {
    trendChart?.resize()
    reasonChart?.resize()
    detailChart?.resize()
    countryChart?.resize()
  }

  function disposeCharts(): void {
    trendChart?.dispose()
    reasonChart?.dispose()
    detailChart?.dispose()
    countryChart?.dispose()
    trendChart = reasonChart = detailChart = countryChart = null
  }

  // ════════════════════════════════════════════════════════════
  // EVENT HANDLERS
  // ════════════════════════════════════════════════════════════

  function syncDraftToApplied(): void {
    appliedFilters.appIds = [...draftFilters.appIds]
    appliedFilters.compareType = draftFilters.compareType
    appliedFilters.country = draftFilters.country
    appliedFilters.platform = draftFilters.platform
    appliedFilters.dateRange[0] = draftFilters.dateRange[0]
    appliedFilters.dateRange[1] = draftFilters.dateRange[1]
  }

  function onQuery(): void {
    syncDraftToApplied()
    void fetchDashboardData()
  }

  function onRefresh(): void {
    void fetchDashboardData()
  }

  // function handleExport(): void {
  //   const p = buildOrderRefundDashboardParams(appliedFilters)
  //   const params = new URLSearchParams({
  //     appIds: p.appIds.join(','),
  //     startDate: p.startDate,
  //     endDate: p.endDate,
  //     compareType: p.compareType,
  //     countryCode: p.countryCode,
  //     paymentPlatform: p.paymentPlatform,
  //     format: 'xlsx'
  //   })
  //   // Actual export: window.open(`${(import.meta as any).env?.VITE_API_BASE_URL ?? '/api'}/refund/export?${params}`)
  //   ElMessage.success('正在生成导出文件...')
  //   console.log('[Export]', params.toString())
  // }

  // ════════════════════════════════════════════════════════════
  // LIFECYCLE
  // ════════════════════════════════════════════════════════════

  onMounted(async () => {
    await nextTick()
    initCharts()
    await fetchDashboardData()

    // Resize observer for chart responsiveness
    resizeObserver = new ResizeObserver(() => resizeCharts())
    const container = document.querySelector('.order-refund-analysis-page')
    if (container) resizeObserver.observe(container)

    window.addEventListener('resize', resizeCharts)
  })

  onUnmounted(() => {
    disposeCharts()
    resizeObserver?.disconnect()
    window.removeEventListener('resize', resizeCharts)
  })
</script>

<style scoped lang="scss">
  @use './styles/ora-card-fx.scss' as *;

  @property --ora-kpi-border-angle {
    syntax: '<angle>';
    initial-value: 0deg;
    inherits: false;
  }

  .order-refund-analysis-page {
    --ora-border-subtle: var(--default-border);
    --ora-text-muted: var(--el-text-color-secondary);
    --ora-text-dim: var(--el-text-color-placeholder);
    --ora-red: var(--art-danger);
    --ora-amber: var(--art-warning);
    --ora-blue: var(--art-primary);
    --ora-green: var(--art-success);
    --ora-gold: #d97706;

    /* 筛选条与 Art 主题色一致（与 --el-color-primary 解耦） */
    --ora-filter-accent: var(--theme-color, var(--art-primary, #3b82f6));

    position: relative;
    box-sizing: border-box;
    min-width: 0;
    padding: 20px 24px 28px;
    overflow-x: clip;
    color: var(--el-text-color-primary);
    background: var(--default-bg-color);

    &::before {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      content: '';
      background:
        radial-gradient(
          ellipse 70% 50% at 6% 6%,
          color-mix(in srgb, var(--el-color-primary) 42%, transparent) 0%,
          rgb(6 182 212 / 20%) 38%,
          transparent 58%
        ),
        radial-gradient(
          ellipse 55% 42% at 94% 8%,
          rgb(59 130 246 / 38%) 0%,
          rgb(139 92 246 / 18%) 38%,
          transparent 58%
        ),
        radial-gradient(ellipse 40% 35% at 48% 18%, rgb(168 85 247 / 18%) 0%, transparent 55%),
        radial-gradient(
          ellipse 55% 42% at 76% 4%,
          rgb(34 211 238 / 22%) 0%,
          rgb(59 130 246 / 10%) 40%,
          transparent 58%
        );
      mask-image: linear-gradient(to bottom, black 0%, black 28%, transparent 58%);
      animation:
        ora-aurora-drift 14s ease-in-out infinite alternate,
        ora-bg-flow 22s ease-in-out infinite alternate;
    }

    &::after {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      content: '';
      background-image:
        linear-gradient(rgb(186 230 253 / 5%) 1px, transparent 1px),
        linear-gradient(90deg, rgb(186 230 253 / 5%) 1px, transparent 1px),
        radial-gradient(circle, rgb(6 182 212 / 8%) 1px, transparent 1px);
      background-size:
        40px 40px,
        40px 40px,
        80px 80px;
      mask-image: linear-gradient(to bottom, black 0%, black 18%, transparent 45%);
    }

    > *:not(.ora-page-fx) {
      position: relative;
      z-index: 1;
    }
  }

  .ora-page-fx {
    position: absolute;
    inset: -12% -12% 40%;
    z-index: 0;
    pointer-events: none;
    background: conic-gradient(
      from 0deg at 50% 50%,
      transparent 0deg,
      rgb(59 130 246 / 14%) 55deg,
      rgb(6 182 212 / 10%) 80deg,
      transparent 130deg,
      color-mix(in srgb, var(--el-color-primary) 12%, transparent) 200deg,
      color-mix(in srgb, var(--el-color-primary-light-3) 8%, transparent) 225deg,
      transparent 285deg,
      rgb(168 85 247 / 10%) 330deg,
      rgb(249 115 22 / 6%) 350deg,
      transparent 360deg
    );
    opacity: 0.85;
    mask-image: linear-gradient(to bottom, black 0%, black 50%, transparent 85%);
    animation: ora-fx-spin 52s linear infinite;
    will-change: transform;
  }

  @keyframes ora-aurora-drift {
    0% {
      filter: hue-rotate(0deg);
      opacity: 0.72;
      transform: scale(1) translate(0, 0);
    }

    50% {
      filter: hue-rotate(18deg);
      opacity: 1;
      transform: scale(1.06) translate(1.2%, -1.2%);
    }

    100% {
      filter: hue-rotate(-12deg);
      opacity: 0.82;
      transform: scale(1) translate(-1.2%, 1.2%);
    }
  }

  @keyframes ora-bg-flow {
    0% {
      opacity: 0.7;
      transform: scaleY(1) skewX(0deg);
    }

    100% {
      opacity: 1;
      transform: scaleY(1.08) skewX(1deg);
    }
  }

  @keyframes ora-fx-spin {
    to {
      transform: rotate(360deg);
    }
  }

  .ora-entry-1 {
    animation: ora-slide-up 0.55s var(--ease-out, cubic-bezier(0, 0, 0.2, 1)) both;
    animation-delay: 0.05s;
  }

  .ora-entry-2 {
    animation: ora-slide-up 0.55s var(--ease-out, cubic-bezier(0, 0, 0.2, 1)) both;
    animation-delay: 0.16s;
  }

  @keyframes ora-slide-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .order-refund-analysis-page__section {
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .order-refund-analysis-page__section--filters {
    margin-bottom: 16px;
  }

  .order-refund-analysis-page__body {
    flex: 1;
    min-width: 0;
  }

  .ora-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 14px 16px;
    align-items: center;
    justify-content: flex-start;
    min-width: 0;
    padding: 18px 20px;
    background: rgb(10 10 14 / 82%);
    backdrop-filter: blur(12px);
    border: 1px solid rgb(96 165 250 / 20%);
    border-radius: 16px;
    box-shadow:
      0 8px 32px rgb(0 0 0 / 40%),
      inset 0 1px 0 rgb(186 230 253 / 10%),
      0 0 40px rgb(59 130 246 / 8%);
  }

  .ora-filters__left {
    display: flex;
    flex: 0 1 auto;
    flex-wrap: nowrap;
    gap: 10px 12px;
    align-items: center;
    justify-content: flex-start;
    min-width: 0;
    overflow-x: auto;
    scrollbar-gutter: stable;
  }

  .ora-filter-chip {
    display: inline-flex;
    flex: 0 0 auto;
    gap: 7px;
    align-items: center;
    min-height: 40px;
    padding: 0 14px;
    font-size: 14px;
    color: var(--el-text-color-regular);
    white-space: nowrap;
    background: color-mix(in srgb, var(--ora-filter-accent) 8%, transparent);
    border: 1px solid color-mix(in srgb, var(--ora-filter-accent) 30%, transparent);
    border-radius: 9999px;
    box-shadow: 0 0 16px color-mix(in srgb, var(--ora-filter-accent) 10%, transparent);
  }

  .ora-filter-chip__icon {
    font-size: 16px;
    color: var(--ora-filter-accent);
    filter: drop-shadow(0 0 6px color-mix(in srgb, var(--ora-filter-accent) 55%, transparent));
  }

  .ora-filter-chip__label {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  .ora-filter-chip__value {
    font-size: 14px;
    font-weight: 600;
    color: var(--ora-filter-accent);
    text-shadow: 0 0 10px color-mix(in srgb, var(--ora-filter-accent) 50%, transparent);
  }

  .ora-filter-app-select-wrap {
    flex: 0 0 auto;
    width: 128px;
    min-width: 0;
    max-width: 128px;
  }

  :deep(.ora-filter-app-select__trigger.app-platform-search-select) {
    box-sizing: border-box;
    width: 100% !important;
    max-width: 100% !important;
    padding: 0 12px !important;
    font-size: 14px !important;
    background: color-mix(in srgb, var(--ora-filter-accent) 6%, transparent) !important;
    border: 1px solid color-mix(in srgb, var(--ora-filter-accent) 28%, transparent) !important;
    box-shadow: none !important;
    transition:
      border-color 0.22s ease,
      box-shadow 0.22s ease,
      background 0.22s ease;
  }

  :deep(.ora-filter-app-select__trigger .app-platform-search-select__text) {
    font-size: 14px;
    color: var(--el-text-color-primary);
  }

  :deep(.ora-filter-app-select__trigger .app-platform-search-select__suffix) {
    color: var(--ora-filter-accent);
    filter: drop-shadow(0 0 5px color-mix(in srgb, var(--ora-filter-accent) 50%, transparent));
  }

  :deep(.ora-filter-app-select__trigger:hover),
  :deep(.ora-filter-app-select__trigger.is-open) {
    background: color-mix(in srgb, var(--ora-filter-accent) 10%, transparent) !important;
    border-color: color-mix(in srgb, var(--ora-filter-accent) 60%, transparent) !important;
    box-shadow: 0 0 12px color-mix(in srgb, var(--ora-filter-accent) 18%, transparent) !important;
  }

  .ora-filter-select {
    width: 128px;
    min-width: 100px;
    max-width: 100%;
  }

  .ora-filter-select--compare {
    width: 148px;
  }

  .ora-filter-select--pay {
    width: 156px;
    min-width: 130px;
  }

  :deep(.ora-filter-select) {
    --el-input-border-color: color-mix(in srgb, var(--ora-filter-accent) 28%, transparent);
    --el-input-focus-border-color: var(--ora-filter-accent);
    --el-border-color: color-mix(in srgb, var(--ora-filter-accent) 28%, transparent);
    --el-border-color-hover: color-mix(in srgb, var(--ora-filter-accent) 75%, transparent);
    --el-border-color-focus: var(--ora-filter-accent);
    --el-component-size: 40px;
  }

  :deep(.ora-filter-select .el-input__wrapper) {
    padding: 0 12px;
    background: color-mix(in srgb, var(--ora-filter-accent) 6%, transparent);
    border: 1px solid color-mix(in srgb, var(--ora-filter-accent) 28%, transparent);
    border-radius: 9999px;
    box-shadow: none;
    transition:
      border-color 0.22s ease,
      box-shadow 0.22s ease,
      background 0.22s ease;
  }

  :deep(.ora-filter-select .el-input__inner) {
    font-size: 14px;
    color: var(--el-text-color-primary);
    text-overflow: ellipsis;
  }

  :deep(.ora-filter-select .el-input__prefix-inner svg) {
    width: 16px;
    height: 16px;
    color: var(--ora-filter-accent);
    filter: drop-shadow(0 0 5px color-mix(in srgb, var(--ora-filter-accent) 50%, transparent));
  }

  :deep(.ora-filter-select .el-select__caret) {
    color: var(--ora-filter-accent);
  }

  :deep(.ora-filter-select .el-input__wrapper.is-focus) {
    background: color-mix(in srgb, var(--ora-filter-accent) 10%, transparent) !important;
    border-color: var(--ora-filter-accent) !important;
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--ora-filter-accent) 20%, transparent) !important;
  }

  :deep(.ora-filter-select .el-input__wrapper:hover) {
    border-color: color-mix(in srgb, var(--ora-filter-accent) 60%, transparent);
    box-shadow: 0 0 12px color-mix(in srgb, var(--ora-filter-accent) 18%, transparent);
  }

  .ora-filter-date {
    flex: 0 0 auto;
    width: 220px;
    max-width: 100%;
  }

  :deep(.ora-filter-date) {
    --el-input-border-color: color-mix(in srgb, var(--ora-filter-accent) 28%, transparent);
    --el-input-focus-border-color: var(--ora-filter-accent);
    --el-border-color: color-mix(in srgb, var(--ora-filter-accent) 28%, transparent);
    --el-border-color-hover: color-mix(in srgb, var(--ora-filter-accent) 75%, transparent);
    --el-border-color-focus: var(--ora-filter-accent);
    --el-component-size: 40px;
  }

  :deep(.ora-filter-date .el-input__wrapper) {
    min-height: 40px;
    padding: 0 6px 0 8px;
    background: color-mix(in srgb, var(--ora-filter-accent) 6%, transparent);
    border: 1px solid color-mix(in srgb, var(--ora-filter-accent) 28%, transparent);
    border-radius: 9999px;
    box-shadow: none;
    transition:
      border-color 0.22s ease,
      box-shadow 0.22s ease,
      background 0.22s ease;
  }

  :deep(.ora-filter-date .el-input__wrapper:hover) {
    border-color: color-mix(in srgb, var(--ora-filter-accent) 60%, transparent);
    box-shadow: 0 0 12px color-mix(in srgb, var(--ora-filter-accent) 18%, transparent);
  }

  :deep(.ora-filter-date .el-input__wrapper.is-focus) {
    background: color-mix(in srgb, var(--ora-filter-accent) 10%, transparent) !important;
    border-color: var(--ora-filter-accent) !important;
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--ora-filter-accent) 20%, transparent) !important;
  }

  :deep(.ora-filter-date .el-range-input) {
    width: 78px;
    font-size: 12px;
    color: var(--el-text-color-primary);
    text-align: left;
  }

  :deep(.ora-filter-date .el-range-separator) {
    flex-shrink: 0;
    padding: 0 2px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  :deep(.ora-filter-date .el-range__icon) {
    margin-right: 2px;
    color: var(--ora-filter-accent);
    filter: drop-shadow(0 0 5px color-mix(in srgb, var(--ora-filter-accent) 50%, transparent));
  }

  .ora-filter-action-btn {
    flex: 0 0 auto;

    --el-button-size: 40px;
    --el-button-bg-color: color-mix(in srgb, var(--ora-filter-accent) 8%, transparent);
    --el-button-text-color: var(--ora-filter-accent);
    --el-button-border-color: color-mix(in srgb, var(--ora-filter-accent) 40%, transparent);
    --el-button-hover-text-color: var(--el-color-primary-light-3);
    --el-button-hover-border-color: var(--ora-filter-accent);
    --el-button-hover-bg-color: color-mix(in srgb, var(--ora-filter-accent) 16%, transparent);

    font-size: 14px;
    box-shadow: 0 0 14px color-mix(in srgb, var(--ora-filter-accent) 12%, transparent);
    transition: box-shadow 0.22s ease;

    &:hover:not(:disabled) {
      box-shadow: 0 0 22px color-mix(in srgb, var(--ora-filter-accent) 28%, transparent);
    }
  }

  .ora-filter-action-btn--query:disabled {
    cursor: not-allowed;
    opacity: 0.42;
  }

  .ora-filter-action-btn--refresh {
    min-width: 40px;
    padding: 0 12px;
  }

  /* ── KPI 霓虹卡片：5 列等宽均分（24 栅格无法整除 5）── */
  .ora-kpi-cards {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 16px;
    margin-bottom: 16px;
  }

  .ora-kpi-cards__item {
    display: flex;
    min-width: 0;
  }

  @media (width <= 1200px) {
    .ora-kpi-cards {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  @media (width <= 768px) {
    .ora-kpi-cards {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (width <= 480px) {
    .ora-kpi-cards {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  .ora-kpi-card {
    --kpi-accent: #3b82f6;
    --kpi-accent-2: #06b6d4;
    --kpi-glow: rgb(59 130 246 / 45%);
    --kpi-glow-2: rgb(6 182 212 / 25%);
    --kpi-spin-a: rgb(16 185 129 / 55%);
    --kpi-spin-b: rgb(59 130 246 / 48%);
    --kpi-spin-c: rgb(168 85 247 / 38%);

    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    min-height: 96px;
    padding: 18px 12px;
    overflow: hidden;
    background-color: rgb(8 8 12 / 98%);
    background-image:
      radial-gradient(
        ellipse 120% 80% at 50% -18%,
        var(--kpi-glow) 0%,
        var(--kpi-glow-2) 30%,
        transparent 58%
      ),
      linear-gradient(
        172deg,
        color-mix(in srgb, var(--kpi-accent) 22%, rgb(8 8 12)) 0%,
        color-mix(in srgb, var(--kpi-accent) 38%, rgb(8 8 12)) 60%,
        color-mix(in srgb, var(--kpi-accent-2) 15%, rgb(8 8 12)) 100%
      );
    border: 1px solid color-mix(in srgb, var(--kpi-accent) 55%, transparent);
    border-radius: 14px;
    box-shadow:
      0 8px 40px rgb(0 0 0 / 52%),
      0 0 0 1px color-mix(in srgb, var(--kpi-accent) 18%, transparent),
      inset 0 1px 0 rgb(255 255 255 / 16%),
      inset 0 -10px 28px rgb(0 0 0 / 38%),
      0 0 28px color-mix(in srgb, var(--kpi-accent) 12%, transparent);
    transition:
      box-shadow 0.4s var(--ease-out, cubic-bezier(0, 0, 0.2, 1)),
      border-color 0.28s var(--ease-default, cubic-bezier(0.4, 0, 0.2, 1));
    animation: ora-kpi-fade-up 0.5s ease both;

    &::before {
      position: absolute;
      top: 0;
      left: 50%;
      z-index: 0;
      width: 80%;
      height: 2px;
      pointer-events: none;
      content: '';
      background: linear-gradient(
        90deg,
        transparent,
        var(--kpi-accent),
        var(--kpi-accent-2),
        transparent
      );
      opacity: 0.8;
      transform: translateX(-50%);
    }

    &::after {
      position: absolute;
      bottom: 0;
      left: 50%;
      z-index: 0;
      width: 60%;
      height: 1px;
      pointer-events: none;
      content: '';
      background: linear-gradient(90deg, transparent, var(--kpi-accent), transparent);
      opacity: 0.45;
      transform: translateX(-50%);
    }

    > *:not(.ora-kpi-card__border-spin) {
      position: relative;
      z-index: 1;
    }

    &:hover {
      border-color: color-mix(in srgb, var(--kpi-accent) 85%, transparent);
      box-shadow:
        0 28px 72px rgb(0 0 0 / 55%),
        0 0 0 1px color-mix(in srgb, var(--kpi-accent) 40%, transparent),
        inset 0 1px 0 rgb(255 255 255 / 20%),
        0 0 60px color-mix(in srgb, var(--kpi-accent) 35%, transparent),
        0 0 100px color-mix(in srgb, var(--kpi-accent) 18%, transparent),
        0 0 140px color-mix(in srgb, var(--kpi-accent-2) 12%, transparent);
    }

    &--refund {
      --kpi-accent: #ef4444;
      --kpi-accent-2: #f97316;
      --kpi-glow: rgb(239 68 68 / 45%);
      --kpi-glow-2: rgb(249 115 22 / 22%);
      --kpi-spin-a: rgb(239 68 68 / 62%);
      --kpi-spin-b: rgb(249 115 22 / 48%);
      --kpi-spin-c: rgb(251 191 36 / 42%);
    }

    &--rate {
      --kpi-accent: #f59e0b;
      --kpi-accent-2: #fbbf24;
      --kpi-glow: rgb(245 158 11 / 45%);
      --kpi-glow-2: rgb(251 191 36 / 22%);
      --kpi-spin-a: rgb(245 158 11 / 62%);
      --kpi-spin-b: rgb(251 191 36 / 48%);
      --kpi-spin-c: rgb(249 115 22 / 42%);
    }

    &--orders {
      --kpi-accent: #3b82f6;
      --kpi-accent-2: #22d3ee;
      --kpi-glow: rgb(59 130 246 / 45%);
      --kpi-glow-2: rgb(34 211 238 / 22%);
      --kpi-spin-a: rgb(59 130 246 / 62%);
      --kpi-spin-b: rgb(34 211 238 / 48%);
      --kpi-spin-c: rgb(16 185 129 / 38%);
    }

    &--avg {
      --kpi-accent: #22d3ee;
      --kpi-accent-2: #3b82f6;
      --kpi-glow: rgb(34 211 238 / 42%);
      --kpi-glow-2: rgb(59 130 246 / 20%);
      --kpi-spin-a: rgb(34 211 238 / 58%);
      --kpi-spin-b: rgb(59 130 246 / 45%);
      --kpi-spin-c: rgb(6 182 212 / 38%);
    }

    &--loss {
      --kpi-accent: #a855f7;
      --kpi-accent-2: #818cf8;
      --kpi-glow: rgb(168 85 247 / 45%);
      --kpi-glow-2: rgb(129 140 248 / 22%);
      --kpi-spin-a: rgb(168 85 247 / 62%);
      --kpi-spin-b: rgb(129 140 248 / 48%);
      --kpi-spin-c: rgb(59 130 246 / 38%);
    }
  }

  @keyframes ora-kpi-fade-up {
    from {
      opacity: 0;
      transform: translateY(12px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .ora-kpi-card__border-spin {
    position: absolute;
    inset: -1px;
    z-index: 2;
    padding: 1.5px;
    pointer-events: none;
    background: conic-gradient(
      from var(--ora-kpi-border-angle, 0deg) at 50% 50%,
      transparent 0deg,
      var(--kpi-spin-a) 45deg,
      transparent 95deg,
      transparent 145deg,
      var(--kpi-spin-b) 195deg,
      transparent 250deg,
      transparent 300deg,
      var(--kpi-spin-c) 340deg,
      transparent 360deg
    );
    filter: blur(0.3px);
    border-radius: inherit;
    opacity: 0.92;
    mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    mask-composite: exclude;
    animation: ora-kpi-border-spin 4s linear infinite;
  }

  @keyframes ora-kpi-border-spin {
    to {
      --ora-kpi-border-angle: 360deg;
    }
  }

  .ora-kpi-card__label {
    margin-bottom: 8px;
    font-size: 12px;
    font-weight: 500;
    color: var(--el-text-color-secondary);
    text-align: center;
    letter-spacing: 0.03em;
  }

  .ora-kpi-card__value-stack {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 0;
  }

  .ora-kpi-card__value {
    font-size: 22px;
    font-weight: 900;
    font-variant-numeric: tabular-nums;
    color: var(--kpi-accent);
    text-align: center;
    text-shadow:
      0 0 12px color-mix(in srgb, var(--kpi-accent) 80%, transparent),
      0 0 30px color-mix(in srgb, var(--kpi-accent) 50%, transparent),
      0 0 60px color-mix(in srgb, var(--kpi-accent) 28%, transparent);
    filter: drop-shadow(0 0 4px color-mix(in srgb, var(--kpi-accent) 40%, transparent));
  }

  .ora-kpi-card__tip-row {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 18px;
    margin-top: 6px;
  }

  .ora-kpi-card__compare {
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    text-align: center;

    &.is-up {
      color: var(--art-success);
      text-shadow: 0 0 8px rgb(16 185 129 / 40%);
    }

    &.is-down {
      color: var(--art-danger);
      text-shadow: 0 0 8px rgb(239 68 68 / 40%);
    }
  }

  /* ── 图表 ElCard（对齐广告成效 trend-charts 标题与霓虹底）── */
  .ora-chart-row {
    margin-bottom: 16px;

    :deep(.el-col) {
      display: flex;
      margin-bottom: 16px;
    }

    :deep(.el-col:last-child) {
      margin-bottom: 0;
    }
  }

  @media (width >= 992px) {
    .ora-chart-row :deep(.el-col) {
      margin-bottom: 0;
    }
  }

  .ora-chart-card {
    @include ora-neon-bg;

    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-bottom: 0;
    overflow: hidden;
    border-radius: 14px;

    @include ora-panel-hover;

    animation: ora-chart-fade-up 0.55s ease 0.12s both;

    :deep(.el-card__header) {
      display: flex;
      gap: 8px;
      align-items: center;
      padding-bottom: 8px;
      font-size: 15px;
      font-weight: 700;
      color: var(--el-text-color-primary);
      letter-spacing: 0.03em;
      background: transparent;
      border-bottom: 1px solid rgb(63 63 70 / 35%);
      transition: filter 0.32s var(--ease-out, cubic-bezier(0, 0, 0.2, 1));
    }

    &:hover :deep(.el-card__header) {
      filter: drop-shadow(0 0 12px rgb(34 211 238 / 28%));
    }

    :deep(.el-card__body) {
      padding-top: 8px;
      background: transparent;
    }

    &::before {
      position: absolute;
      top: 0;
      left: 5%;
      z-index: 0;
      width: 90%;
      height: 2px;
      pointer-events: none;
      content: '';
      background: linear-gradient(
        90deg,
        transparent,
        rgb(59 130 246 / 75%),
        rgb(6 182 212 / 85%),
        rgb(34 211 238 / 70%),
        transparent
      );
      filter: blur(0.5px);
    }

    &::after {
      position: absolute;
      bottom: 0;
      left: 10%;
      z-index: 0;
      width: 80%;
      height: 1px;
      pointer-events: none;
      content: '';
      background: linear-gradient(
        90deg,
        transparent,
        rgb(16 185 129 / 50%),
        rgb(59 130 246 / 40%),
        transparent
      );
    }
  }

  @keyframes ora-chart-fade-up {
    from {
      opacity: 0;
      transform: translateY(14px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .ora-chart-card__title {
    @include ora-title-gradient;

    font-size: 15px;
  }

  .ora-chart-card__title-dot {
    flex-shrink: 0;
    width: 9px;
    height: 9px;
    border-radius: 50%;

    &--trend {
      background: #ef4444;
      box-shadow:
        0 0 6px #ef4444,
        0 0 14px rgb(239 68 68 / 70%),
        0 0 24px rgb(239 68 68 / 35%);
    }

    &--reason {
      background: #3b82f6;
      box-shadow:
        0 0 6px #3b82f6,
        0 0 14px rgb(59 130 246 / 70%),
        0 0 24px rgb(34 211 238 / 35%);
    }

    &--detail {
      background: #10b981;
      box-shadow:
        0 0 6px #10b981,
        0 0 14px rgb(16 185 129 / 70%),
        0 0 24px rgb(34 211 238 / 35%);
    }

    &--country {
      background: #a855f7;
      box-shadow:
        0 0 6px #a855f7,
        0 0 14px rgb(168 85 247 / 70%),
        0 0 24px rgb(129 140 248 / 35%);
    }

    &--table {
      background: #22d3ee;
      box-shadow:
        0 0 6px #22d3ee,
        0 0 14px rgb(34 211 238 / 70%),
        0 0 24px rgb(59 130 246 / 35%);
    }
  }

  .ora-chart-card__body {
    position: relative;
    z-index: 1;
    width: 100%;
    height: 260px;
    transition: filter 0.42s var(--ease-out, cubic-bezier(0, 0, 0.2, 1));

    .ora-chart-card:hover & {
      filter: drop-shadow(0 8px 24px rgb(59 130 246 / 28%)) brightness(1.06);
    }

    &--donut {
      height: 200px;
    }

    &--country {
      height: 300px;
    }
  }

  .ora-donut-legend {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-top: 10px;
  }

  .ora-donut-legend__item {
    display: flex;
    gap: 7px;
    align-items: center;
    font-size: 11px;
    color: var(--ora-text-muted);
  }

  .ora-donut-legend__dot {
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  /* ═══════════════════════════════════════════
   ORDERS TABLE (El-Table dark override)
═══════════════════════════════════════════ */
  .orders-table {
    width: 100%;

    --el-table-bg-color: transparent !important;
    --el-table-tr-bg-color: transparent !important;
    --el-table-header-bg-color: transparent !important;
    --el-table-row-hover-bg-color: rgb(255 255 255 / 4%) !important;
    --el-table-border-color: var(--ora-border-subtle) !important;
    --el-table-text-color: var(--ora-text-muted) !important;
    --el-table-header-text-color: var(--ora-text-dim) !important;
    --el-fill-color-lighter: transparent !important;

    background: transparent !important;
  }

  .orders-table :deep(.el-table__inner-wrapper) {
    background: transparent;
  }

  .orders-table :deep(table) {
    background: transparent;
  }

  .orders-table :deep(.el-table__header-wrapper th) {
    font-size: 11px !important;
    font-weight: 500 !important;
    color: var(--ora-text-dim) !important;
    background: transparent !important;
    border-bottom: 1px solid var(--ora-border-subtle) !important;
  }

  .orders-table :deep(.el-table__body td) {
    font-size: 12px !important;
    color: var(--ora-text-muted) !important;
    background: transparent !important;
    border-bottom: 1px solid rgb(255 255 255 / 3%) !important;
  }

  .orders-table :deep(.el-table__body .el-table__row:hover td) {
    background: rgb(255 255 255 / 3.5%) !important;
  }

  .orders-table :deep(.el-scrollbar__bar) {
    opacity: 0.3;
  }

  .order-id {
    color: var(--el-color-primary);
    cursor: pointer;
    transition: color var(--duration-fast, 0.15s) var(--ease-default, ease);
  }

  .order-id:hover {
    color: var(--el-color-primary-light-3);
    text-decoration: underline;
  }

  .status-tag {
    display: inline-block;
    padding: 2px 7px;
    font-size: 11px;
    font-weight: 600;
    border-radius: 4px;
  }

  .st-refunded {
    color: #f87171;
    background: rgb(239 68 68 / 15%);
    border: 1px solid rgb(239 68 68 / 25%);
  }

  .st-processing {
    color: #fbbf24;
    background: rgb(245 158 11 / 15%);
    border: 1px solid rgb(245 158 11 / 25%);
  }

  .st-pending {
    color: #9ca3af;
    background: rgb(107 114 128 / 20%);
    border: 1px solid rgb(107 114 128 / 30%);
  }

  /* ═══════════════════════════════════════════
   ALERT BAR
═══════════════════════════════════════════ */
  .alert-bar {
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 10px 16px;
    margin-top: 4px;
    font-size: 13px;
    color: #fbbf24;
    background: rgb(245 158 11 / 10%);
    border: 1px solid rgb(245 158 11 / 20%);
    border-radius: 8px;
    opacity: 0;
    transition:
      opacity 0.4s ease,
      transform 0.4s ease;
    transform: translateY(4px);
  }

  .alert-bar.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .alert-icon {
    flex-shrink: 0;
    font-size: 15px;
    color: #f59e0b;
  }

  /* ═══════════════════════════════════════════
   LOADING OVERLAY (El directive)
═══════════════════════════════════════════ */
  :deep(.el-loading-mask) {
    background: color-mix(in srgb, var(--default-bg-color) 75%, transparent) !important;
  }

  :deep(.el-loading-spinner .path) {
    stroke: var(--el-color-primary) !important;
  }

  /* ═══════════════════════════════════════════
   RESPONSIVE
═══════════════════════════════════════════ */
  @media (width <= 960px) {
    .order-refund-analysis-page {
      padding: 16px 16px 20px;
    }

    .ora-filters__left {
      flex-wrap: wrap;
      overflow-x: visible;
    }

    .ora-filter-app-select-wrap,
    .ora-filter-select,
    .ora-filter-select--compare,
    .ora-filter-select--pay,
    .ora-filter-date {
      flex: 1 1 100%;
      width: 100%;
      max-width: 100%;
    }

    .ora-chart-card__body {
      height: 220px;
    }

    .ora-chart-card__body--donut {
      height: 180px;
    }

    .ora-chart-card__body--country {
      height: 260px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .order-refund-analysis-page::before,
    .ora-page-fx {
      animation: none;
    }

    .ora-entry-1,
    .ora-entry-2 {
      opacity: 1;
      transform: none;
      animation: none;
    }

    .ora-kpi-card__border-spin {
      opacity: 0;
      animation: none;
    }

    .ora-kpi-card {
      transition: none;

      &:hover {
        transform: none;
      }
    }

    .ora-kpi-card,
    .ora-chart-card {
      animation: none;
    }

    .ora-chart-card {
      transition: none;

      &:hover :deep(.el-card__header) {
        filter: none;
      }
    }

    .ora-chart-card__body {
      transition: none;

      .ora-chart-card:hover & {
        filter: none;
      }
    }
  }
</style>

<style lang="scss">
  .ora-filter-popper.el-select__popper,
  .ora-filter-popper.app-platform-search-select__popper,
  .ora-filter-popper.el-picker__popper {
    --el-bg-color-overlay: rgb(18 20 28 / 96%);
  }

  .ora-filter-popper.el-select__popper,
  .ora-filter-popper.app-platform-search-select__popper {
    border-color: color-mix(in srgb, var(--el-color-primary) 35%, transparent) !important;
  }

  .ora-filter-popper.app-platform-search-select__popper {
    background: rgb(18 20 28 / 96%) !important;
  }

  .ora-filter-popper .el-select-dropdown__item {
    color: var(--el-text-color-regular) !important;
  }

  .ora-filter-popper .el-select-dropdown__item.is-hovering,
  .ora-filter-popper .el-select-dropdown__item:hover {
    color: var(--el-color-primary) !important;
    background: color-mix(in srgb, var(--el-color-primary) 12%, transparent) !important;
  }

  .ora-filter-popper .el-select-dropdown__item.is-selected {
    font-weight: 600;
    color: var(--el-color-primary) !important;
  }

  .ora-filter-popper.el-picker-panel,
  .ora-filter-popper .el-picker-panel {
    border-color: color-mix(in srgb, var(--el-color-primary) 35%, transparent) !important;
  }

  .ora-filter-popper .el-date-table td.in-range div {
    background: color-mix(in srgb, var(--el-color-primary) 12%, transparent) !important;
  }

  .ora-filter-popper .el-date-table td.start-date div,
  .ora-filter-popper .el-date-table td.end-date div {
    color: #fff !important;
    background: linear-gradient(
      135deg,
      var(--el-color-primary),
      var(--el-color-primary-dark-2)
    ) !important;
  }
</style>
