<template>
  <div class="refund-dashboard" v-loading="globalLoading">
    <!-- ═══════════════════════════════════════════
         TOP BAR: breadcrumb + filter controls
    ═══════════════════════════════════════════ -->
    <header class="top-bar">
      <div class="breadcrumb">
        <span class="bc-parent">商店运营</span>
        <span class="bc-sep">›</span>
        <span class="bc-current">订单退款分析</span>
      </div>

      <div class="filter-bar">
        <!-- App -->
        <div class="filter-item">
          <span class="filter-label">App</span>
          <el-select
            v-model="filters.app"
            size="small"
            class="filter-select"
            @change="onFilterChange"
          >
            <el-option v-for="o in APP_OPTIONS" :key="o.value" :label="o.label" :value="o.value" />
          </el-select>
        </div>

        <!-- Date Range -->
        <el-date-picker
          v-model="dateRangeModel"
          type="daterange"
          range-separator=" - "
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          size="small"
          class="filter-date"
          value-format="YYYY-MM-DD"
          @change="onDateChange"
        />

        <!-- Compare Period -->
        <div class="filter-item">
          <span class="filter-label">对比期间</span>
          <el-select
            v-model="filters.compareType"
            size="small"
            class="filter-select"
            @change="onFilterChange"
          >
            <el-option
              v-for="o in COMPARE_OPTIONS"
              :key="o.value"
              :label="o.label"
              :value="o.value"
            />
          </el-select>
        </div>

        <!-- Country -->
        <div class="filter-item">
          <span class="filter-label">国家</span>
          <el-select
            v-model="filters.country"
            size="small"
            class="filter-select"
            @change="onFilterChange"
          >
            <el-option
              v-for="o in COUNTRY_OPTIONS"
              :key="o.value"
              :label="o.label"
              :value="o.value"
            />
          </el-select>
        </div>

        <!-- Platform -->
        <div class="filter-item">
          <span class="filter-label">支付平台</span>
          <el-select
            v-model="filters.platform"
            size="small"
            class="filter-select"
            @change="onFilterChange"
          >
            <el-option
              v-for="o in PLATFORM_OPTIONS"
              :key="o.value"
              :label="o.label"
              :value="o.value"
            />
          </el-select>
        </div>

        <!-- Export -->
        <el-button class="export-btn" size="small" type="primary" @click="handleExport">
          <span class="export-icon">↓</span> 导出
        </el-button>
      </div>
    </header>

    <!-- ═══════════════════════════════════════════
         KPI CARDS ROW
    ═══════════════════════════════════════════ -->
    <section class="kpi-row">
      <div
        v-for="(card, idx) in kpiCards"
        :key="idx"
        class="kpi-card"
        :class="card.theme"
        :style="{ animationDelay: `${idx * 60}ms` }"
      >
        <div class="kpi-label">{{ card.label }}</div>
        <div class="kpi-value" :class="card.valueClass">{{ card.value }}</div>
        <div v-if="card.change" class="kpi-change" :class="card.changeClass">
          {{ card.change }}
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════
         CHARTS ROW 1: Trend | Reason | Detail
    ═══════════════════════════════════════════ -->
    <section class="chart-row row-1">
      <!-- Trend Area Chart -->
      <div class="chart-card trend-card">
        <div class="card-title">退款趋势（30天）</div>
        <div ref="trendRef" class="chart-body" />
      </div>

      <!-- Reason Donut -->
      <div class="chart-card donut-card">
        <div class="card-title">退款原因分布</div>
        <div ref="reasonRef" class="chart-body" />
        <div class="donut-legend">
          <div v-for="item in REASON_COLORS" :key="item.name" class="legend-item">
            <span class="legend-dot" :style="{ background: item.color }" />
            <span class="legend-text">{{ item.name }} {{ item.pct }}%</span>
          </div>
        </div>
      </div>

      <!-- Order Detail Donut -->
      <div class="chart-card donut-card">
        <div class="card-title">退款订单明细</div>
        <div ref="detailRef" class="chart-body" />
        <div class="donut-legend">
          <div v-for="item in DETAIL_COLORS" :key="item.name" class="legend-item">
            <span class="legend-dot" :style="{ background: item.color }" />
            <span class="legend-text">{{ item.name }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════
         CHARTS ROW 2: Country Bars | Orders Table
    ═══════════════════════════════════════════ -->
    <section class="chart-row row-2">
      <!-- Country Refund Rate Bar Chart -->
      <div class="chart-card country-card">
        <div class="card-title">国家退款率对比</div>
        <div ref="countryRef" class="chart-body" />
      </div>

      <!-- Orders Table -->
      <div class="chart-card table-card">
        <div class="card-title">退款订单明细</div>
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
      </div>
    </section>

    <!-- ═══════════════════════════════════════════
         ALERT BAR
    ═══════════════════════════════════════════ -->
    <div class="alert-bar" :class="{ visible: alertVisible }">
      <span class="alert-icon">⚠</span>
      <span>{{ alertMessage }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
  import * as echarts from 'echarts'
  import type { ECharts, EChartsOption } from 'echarts'
  import { ElMessage } from 'element-plus'

  // ════════════════════════════════════════════════════════════
  // TYPES
  // ════════════════════════════════════════════════════════════

  interface RefundFilters {
    app: string
    dateRange: [string, string]
    compareType: string
    country: string
    platform: string
  }

  interface KpiCard {
    label: string
    value: string
    change?: string
    theme: string
    valueClass?: string
    changeClass?: string
  }

  interface TrendPoint {
    date: string
    refundAmount: number
    ma7: number
  }

  interface CountryRate {
    country: string
    rate: number
    level: 'good' | 'warning' | 'danger' | 'critical'
    badge?: string
  }

  interface OrderRecord {
    orderId: string
    user: string
    amount: number
    reason: string
    platform: string
    date: string
    status: 'refunded' | 'processing' | 'pending'
  }

  interface DashboardPayload {
    kpi: {
      totalAmount: number
      totalAmountChange: number
      refundRate: number
      refundRateChange: number
      orderCount: number
      orderCountChange: number
      avgAmount: number
      revenueRatio: number
    }
    trend: TrendPoint[]
    reasonData: { name: string; value: number }[]
    countryData: CountryRate[]
    orderData: OrderRecord[]
    alertMessage: string
  }

  // ════════════════════════════════════════════════════════════
  // CONSTANTS
  // ════════════════════════════════════════════════════════════

  const APP_OPTIONS = [
    { label: '全部 apps', value: 'all' },
    { label: 'App Alpha', value: 'alpha' },
    { label: 'App Beta', value: 'beta' }
  ]

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

  const filters = reactive<RefundFilters>({
    app: 'all',
    dateRange: ['2024-01-01', '2024-01-31'],
    compareType: 'last_month',
    country: 'all',
    platform: 'all'
  })

  // v-model bridge for el-date-picker (needs array ref)
  const dateRangeModel = ref<[string, string]>(['2024-01-01', '2024-01-31'])

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
      theme: 'kpi-red',
      changeClass: 'change-down'
    },
    {
      label: '退款率',
      value: `${kpiRaw.refundRate}%`,
      change: `↑ +${kpiRaw.refundRateChange}%`,
      theme: 'kpi-amber',
      valueClass: 'val-amber',
      changeClass: 'change-up'
    },
    {
      label: '退款订单数',
      value: kpiRaw.orderCount.toLocaleString(),
      change: `↓ ${Math.abs(kpiRaw.orderCountChange)}%`,
      theme: 'kpi-blue',
      changeClass: 'change-down'
    },
    {
      label: '平均退款金额',
      value: `$${kpiRaw.avgAmount.toFixed(2)}`,
      theme: 'kpi-default'
    },
    {
      label: '退款损失占收入比',
      value: `${kpiRaw.revenueRatio}%`,
      theme: 'kpi-gold',
      valueClass: 'val-gold'
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
  // MOCK DATA GENERATOR
  // ════════════════════════════════════════════════════════════

  function getMockData(): DashboardPayload {
    // Generate 30-day trend
    const trend: TrendPoint[] = []
    const base = [
      28000, 31000, 35000, 29000, 64000, 42000, 38000, 35000, 30000, 32000, 28000, 26000, 29000,
      31000, 33000, 30000, 27000, 55000, 48000, 44000, 38000, 34000, 31000, 29000, 33000, 36000,
      32000, 29000, 27000, 30000
    ]
    const ma7: number[] = []
    for (let i = 0; i < 30; i++) {
      const start = Math.max(0, i - 3)
      const end = Math.min(29, i + 3)
      const avg = base.slice(start, end + 1).reduce((a, b) => a + b, 0) / (end - start + 1)
      ma7.push(Math.round(avg))
    }
    const startDate = new Date(filters.dateRange[0])
    for (let i = 0; i < 30; i++) {
      const d = new Date(startDate)
      d.setDate(startDate.getDate() + i)
      trend.push({
        date: `${d.getMonth() + 1}/${d.getDate()}`,
        refundAmount: base[i],
        ma7: ma7[i]
      })
    }

    return {
      kpi: {
        totalAmount: 12450,
        totalAmountChange: -8,
        refundRate: 3.2,
        refundRateChange: 0.5,
        orderCount: 1847,
        orderCountChange: -12,
        avgAmount: 6.74,
        revenueRatio: 4.8
      },
      trend,
      reasonData: [
        { name: '用户主动取消', value: 45 },
        { name: '功能不符预期', value: 28 },
        { name: '订阅重复扣费', value: 12 },
        { name: '支付失败', value: 8 },
        { name: '其他', value: 7 }
      ],
      countryData: [
        { country: 'US', rate: 2.8, level: 'good', badge: 'Acceptable' },
        { country: 'UK', rate: 3.1, level: 'warning' },
        { country: 'DE', rate: 4.2, level: 'warning' },
        { country: 'FR', rate: 5.8, level: 'danger', badge: 'High' },
        { country: 'JP', rate: 2.1, level: 'good' },
        { country: 'CN', rate: 6.2, level: 'critical', badge: 'Highest' },
        { country: 'AU', rate: 3.5, level: 'warning' },
        { country: 'CA', rate: 2.9, level: 'good' }
      ],
      orderData: [
        {
          orderId: 'ORD-123456',
          user: 'john.doe@...',
          amount: 15.0,
          reason: '用户主动取消',
          platform: 'Google Play',
          date: '2024-01-23',
          status: 'refunded'
        },
        {
          orderId: 'ORD-789012',
          user: 'jane.smith@...',
          amount: 5.5,
          reason: '订阅重复扣费',
          platform: 'App Store',
          date: '2024-01-22',
          status: 'processing'
        },
        {
          orderId: 'ORD-345678',
          user: 'mike.brown@...',
          amount: 9.99,
          reason: '功能不符预期',
          platform: 'Stripe',
          date: '2024-01-22',
          status: 'pending'
        },
        {
          orderId: 'ORD-901234',
          user: 'lisa.wang@...',
          amount: 49.99,
          reason: '支付失败',
          platform: 'Google Play',
          date: '2024-01-21',
          status: 'refunded'
        },
        {
          orderId: 'ORD-567890',
          user: 'david.lee@...',
          amount: 12.5,
          reason: '其他',
          platform: 'App Store',
          date: '2024-01-21',
          status: 'refunded'
        }
      ],
      alertMessage:
        '高退款率预警：法国地区退款率达5.8%，超过预警阈值5%，建议检查当地付费渠道和定价策略'
    }
  }

  // ════════════════════════════════════════════════════════════
  // API FETCH — Replace mock with real endpoint when ready
  // ════════════════════════════════════════════════════════════

  async function fetchDashboardData(): Promise<void> {
    globalLoading.value = true
    try {
      // ── Real API call (uncomment when backend is ready) ──────
      // const params = new URLSearchParams({
      //   app: filters.app,
      //   startDate: filters.dateRange[0],
      //   endDate: filters.dateRange[1],
      //   compareType: filters.compareType,
      //   country: filters.country,
      //   platform: filters.platform,
      // })
      // const res = await fetch(`${(import.meta as any).env?.VITE_API_BASE_URL ?? '/api'}/refund/analysis?${params}`, {
      //   headers: { Authorization: `Bearer ${getToken()}` },
      // })
      // if (!res.ok) throw new Error(`HTTP ${res.status}`)
      // const payload: DashboardPayload = await res.json()
      // applyPayload(payload)
      // ─────────────────────────────────────────────────────────

      // ── Mock: simulate network latency ───────────────────────
      await new Promise((r) => setTimeout(r, 400))
      applyPayload(getMockData())
      // ─────────────────────────────────────────────────────────
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
        data: data.map((d) => d.country),
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

  function onFilterChange(): void {
    fetchDashboardData()
  }

  function onDateChange(val: [string, string] | null): void {
    if (val) {
      filters.dateRange = val
      fetchDashboardData()
    }
  }

  function handleExport(): void {
    const params = new URLSearchParams({
      app: filters.app,
      startDate: filters.dateRange[0],
      endDate: filters.dateRange[1],
      compareType: filters.compareType,
      country: filters.country,
      platform: filters.platform,
      format: 'xlsx'
    })
    // Actual export: window.open(`${(import.meta as any).env?.VITE_API_BASE_URL ?? '/api'}/refund/export?${params}`)
    ElMessage.success('正在生成导出文件...')
    console.log('[Export]', params.toString())
  }

  // ════════════════════════════════════════════════════════════
  // LIFECYCLE
  // ════════════════════════════════════════════════════════════

  onMounted(async () => {
    await nextTick()
    initCharts()
    await fetchDashboardData()

    // Resize observer for chart responsiveness
    resizeObserver = new ResizeObserver(() => resizeCharts())
    const container = document.querySelector('.refund-dashboard')
    if (container) resizeObserver.observe(container)

    window.addEventListener('resize', resizeCharts)
  })

  onUnmounted(() => {
    disposeCharts()
    resizeObserver?.disconnect()
    window.removeEventListener('resize', resizeCharts)
  })
</script>

<style scoped>
  /* ═══════════════════════════════════════════
   CSS VARIABLES
═══════════════════════════════════════════ */
  .refund-dashboard {
    --bg-page: #0d1117;
    --bg-card: #161b2d;
    --bg-card-hover: #1d2340;
    --border-subtle: rgb(255 255 255 / 6%);
    --border-mid: rgb(255 255 255 / 10%);
    --text-primary: #e6edf3;
    --text-muted: #8b949e;
    --text-dim: #6b7280;
    --red: #ef4444;
    --amber: #f59e0b;
    --blue: #3b82f6;
    --green: #22c55e;
    --gold: #d97706;

    box-sizing: border-box;
    min-height: 100vh;
    padding: 0 16px 16px;
    font-family: 'PingFang SC', 'SF Pro Text', 'Hiragino Sans GB', sans-serif;
    color: var(--text-primary);
    background: var(--bg-page);
  }

  /* ═══════════════════════════════════════════
   TOP BAR
═══════════════════════════════════════════ */
  .top-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    justify-content: space-between;
    height: 56px;
    padding: 0 4px;
    margin-bottom: 16px;
    border-bottom: 1px solid var(--border-subtle);
  }

  .breadcrumb {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 16px;
    font-weight: 600;
  }

  .bc-parent {
    color: var(--text-muted);
    cursor: pointer;
    transition: color 0.2s;
  }

  .bc-parent:hover {
    color: var(--text-primary);
  }

  .bc-sep {
    font-size: 14px;
    color: var(--text-dim);
  }

  .bc-current {
    color: var(--text-primary);
  }

  .filter-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  .filter-item {
    display: flex;
    gap: 6px;
    align-items: center;
    height: 32px;
    padding: 0 10px;
    background: var(--bg-card);
    border: 1px solid var(--border-subtle);
    border-radius: 6px;
    transition: border-color 0.2s;
  }

  .filter-item:hover {
    border-color: var(--border-mid);
  }

  .filter-label {
    font-size: 12px;
    color: var(--text-muted);
    white-space: nowrap;
  }

  /* Override Element Plus styles inside filter */
  .filter-item :deep(.el-select) {
    --el-select-border-color-hover: transparent;
  }

  .filter-item :deep(.el-select .el-input__wrapper),
  .filter-item :deep(.el-select .el-input__wrapper:hover),
  .filter-item :deep(.el-select .el-input__wrapper.is-focus) {
    padding-left: 0;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
  }

  .filter-item :deep(.el-input__inner) {
    font-size: 12px;
    color: var(--text-primary) !important;
  }

  .filter-item :deep(.el-select__caret) {
    color: var(--text-muted) !important;
  }

  .filter-select {
    width: 100px;
  }

  /* Date picker */
  .filter-date {
    width: 220px;
  }

  .filter-date :deep(.el-input__wrapper) {
    background: var(--bg-card) !important;
    border: 1px solid var(--border-subtle) !important;
    border-radius: 6px;
    box-shadow: none !important;
    transition: border-color 0.2s;
  }

  .filter-date :deep(.el-input__wrapper:hover),
  .filter-date :deep(.el-input__wrapper.is-focus) {
    border-color: var(--border-mid) !important;
  }

  .filter-date :deep(.el-input__inner) {
    font-size: 12px;
    color: var(--text-primary) !important;
  }

  .filter-date :deep(.el-range__icon),
  .filter-date :deep(.el-range-separator),
  .filter-date :deep(.el-input__prefix) {
    color: var(--text-muted) !important;
  }

  .export-btn {
    height: 32px !important;
    padding: 0 14px !important;
    font-size: 12px !important;
    font-weight: 600 !important;
    color: #fff !important;
    background: #0d7a5f !important;
    border-color: #0d7a5f !important;
    border-radius: 6px !important;
    transition:
      background 0.2s,
      transform 0.15s !important;
  }

  .export-btn:hover {
    background: #0f9070 !important;
    transform: translateY(-1px);
  }

  .export-icon {
    margin-right: 3px;
  }

  /* ═══════════════════════════════════════════
   KPI ROW
═══════════════════════════════════════════ */
  .kpi-row {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 12px;
    margin-bottom: 14px;
  }

  .kpi-card {
    padding: 16px 18px;
    cursor: default;
    background: var(--bg-card);
    border: 1px solid var(--border-subtle);
    border-radius: 10px;
    transition:
      transform 0.2s,
      box-shadow 0.2s;
    animation: fadeSlideUp 0.5s ease both;
  }

  .kpi-card:hover {
    box-shadow: 0 8px 24px rgb(0 0 0 / 40%);
    transform: translateY(-2px);
  }

  @keyframes fadeSlideUp {
    from {
      opacity: 0;
      transform: translateY(12px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .kpi-label {
    margin-bottom: 10px;
    font-size: 12px;
    color: var(--text-muted);
    letter-spacing: 0.3px;
  }

  .kpi-value {
    margin-bottom: 8px;
    font-size: 30px;
    font-weight: 700;
    line-height: 1;
    color: var(--text-primary);
    letter-spacing: -0.5px;
  }

  .val-amber {
    color: var(--amber);
  }

  .val-gold {
    color: var(--gold);
  }

  .kpi-change {
    font-size: 12px;
    font-weight: 500;
  }

  .change-down {
    color: var(--green);
  } /* decrease = good for refunds? match design */
  .change-up {
    color: var(--red);
  }

  /* Theme borders */
  .kpi-red {
    background: rgb(239 68 68 / 5%);
    border-left: 3px solid var(--red);
  }

  .kpi-amber {
    background: rgb(245 158 11 / 6%);
    border-left: 3px solid var(--amber);
  }

  .kpi-blue {
    background: rgb(59 130 246 / 6%);
    border-left: 3px solid var(--blue);
  }

  .kpi-gold {
    background: rgb(217 119 6 / 7%);
    border-left: 3px solid var(--gold);
  }

  .kpi-default {
    /* no accent */
  }

  /* ═══════════════════════════════════════════
   CHART CARDS (shared)
═══════════════════════════════════════════ */
  .chart-card {
    box-sizing: border-box;
    padding: 16px;
    background: var(--bg-card);
    border: 1px solid var(--border-subtle);
    border-radius: 10px;
    animation: fadeSlideUp 0.5s ease 0.2s both;
  }

  .card-title {
    margin-bottom: 12px;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
    letter-spacing: 0.2px;
  }

  .chart-body {
    width: 100%;
    height: 260px;
  }

  /* ═══════════════════════════════════════════
   ROW 1: Trend + Donuts
═══════════════════════════════════════════ */
  .chart-row {
    display: grid;
    gap: 12px;
    margin-bottom: 14px;
  }

  .row-1 {
    grid-template-columns: 1fr 0.48fr 0.48fr;
  }

  .trend-card {
    /* full height, no legend */
  }

  .donut-card .chart-body {
    height: 200px;
  }

  .donut-legend {
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-top: 10px;
  }

  .legend-item {
    display: flex;
    gap: 7px;
    align-items: center;
    font-size: 11px;
    color: var(--text-muted);
  }

  .legend-dot {
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  /* ═══════════════════════════════════════════
   ROW 2: Country + Table
═══════════════════════════════════════════ */
  .row-2 {
    grid-template-columns: 0.88fr 1fr;
  }

  .country-card .chart-body {
    height: 300px;
  }

  .table-card {
    padding: 16px;
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
    --el-table-border-color: var(--border-subtle) !important;
    --el-table-text-color: var(--text-muted) !important;
    --el-table-header-text-color: var(--text-dim) !important;
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
    color: var(--text-dim) !important;
    background: transparent !important;
    border-bottom: 1px solid var(--border-subtle) !important;
  }

  .orders-table :deep(.el-table__body td) {
    font-size: 12px !important;
    color: var(--text-muted) !important;
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
    color: #5aa3f5;
    cursor: pointer;
    transition: color 0.2s;
  }

  .order-id:hover {
    color: #74b8ff;
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
   EL-SELECT DROPDOWN (global override via :deep)
═══════════════════════════════════════════ */
  :deep(.el-select__popper) {
    background: #1d2340 !important;
    border-color: var(--border-mid) !important;
  }

  :deep(.el-select-dropdown__item) {
    font-size: 12px !important;
    color: var(--text-muted) !important;
  }

  :deep(.el-select-dropdown__item:hover),
  :deep(.el-select-dropdown__item.is-hovering) {
    background: rgb(255 255 255 / 5%) !important;
  }

  :deep(.el-select-dropdown__item.is-selected) {
    color: #5aa3f5 !important;
  }

  /* ═══════════════════════════════════════════
   DATE PICKER DROPDOWN
═══════════════════════════════════════════ */
  :deep(.el-date-range-picker),
  :deep(.el-date-picker) {
    color: var(--text-primary) !important;
    background: #1d2340 !important;
    border-color: var(--border-mid) !important;
  }

  :deep(.el-date-table td.today .el-date-table-cell__text) {
    color: var(--blue) !important;
  }

  :deep(.el-date-table td.in-range .el-date-table-cell) {
    background: rgb(59 130 246 / 15%) !important;
  }

  :deep(.el-date-table td.start-date .el-date-table-cell),
  :deep(.el-date-table td.end-date .el-date-table-cell) {
    background: var(--blue) !important;
  }

  :deep(.el-picker-panel__icon-btn),
  :deep(.el-date-picker__header-label),
  :deep(.el-date-range-picker__header) {
    color: var(--text-muted) !important;
  }

  :deep(.el-picker-panel) {
    color: var(--text-primary) !important;
    background: #1d2340 !important;
    border-color: var(--border-mid) !important;
  }

  /* ═══════════════════════════════════════════
   LOADING OVERLAY (El directive)
═══════════════════════════════════════════ */
  :deep(.el-loading-mask) {
    background: rgb(13 17 23 / 70%) !important;
  }

  :deep(.el-loading-spinner .path) {
    stroke: var(--blue) !important;
  }

  /* ═══════════════════════════════════════════
   RESPONSIVE
═══════════════════════════════════════════ */
  @media (width <= 1400px) {
    .kpi-row {
      grid-template-columns: repeat(3, 1fr);
    }

    .row-1 {
      grid-template-columns: 1fr 1fr;
    }

    .trend-card {
      grid-column: 1 / -1;
    }
  }

  @media (width <= 960px) {
    .top-bar {
      flex-direction: column;
      align-items: flex-start;
      height: auto;
      padding: 12px 0;
    }

    .kpi-row {
      grid-template-columns: repeat(2, 1fr);
    }

    .row-1,
    .row-2 {
      grid-template-columns: 1fr;
    }
  }
</style>
