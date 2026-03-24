<script setup lang="ts">
  /**
   * 三方商店管理 — 數據由 API / Mock 注入（樣式保持不變）
   */
  import { ref, computed, onMounted, nextTick, onBeforeUnmount } from 'vue'
  import * as echarts from 'echarts'
  import { Plus, Download } from '@element-plus/icons-vue'
  import { cloneAppDate, formatYYYYMMDD, getAppNow } from '@/utils/app-now'
  import { thirdPartyStoresApi } from './api/third-party-stores'
  import type {
    AppStoreRecord,
    ChannelRecord,
    FilterState,
    PlatformCard,
    ThirdPartyStoresDashboardPayload,
    ThirdPartyStoresQueryParams,
    ThirdPartyStoresStatusSummary,
    ThirdPartyStoresSummaryMetrics
  } from './types'

  defineOptions({ name: 'ThirdPartyStores' })

  function createDefaultDateRange(): [Date, Date] {
    const end = cloneAppDate(getAppNow())
    end.setHours(0, 0, 0, 0)
    const start = cloneAppDate(end)
    start.setDate(start.getDate() - 6)
    return [start, end]
  }

  function buildQueryParams(f: FilterState): ThirdPartyStoresQueryParams {
    const [start, end] = f.dateRange || []
    return {
      platform: f.platform || undefined,
      app_store: f.appStore || undefined,
      s_app_id: f.app || undefined,
      source: f.adPlatform || undefined,
      channel: f.channel || undefined,
      t_date_start: start ? formatYYYYMMDD(start) : undefined,
      t_date_end: end ? formatYYYYMMDD(end) : undefined,
      currency: f.currency || undefined
    }
  }

  // ─── Options ──────────────────────────────────────────────────────────────────
  const platformOptions = [
    { label: '全部', value: '' },
    { label: '安卓', value: 'android' },
    { label: 'iOS', value: 'ios' }
  ]
  const appStoreOptions = [
    { label: '全部', value: '' },
    { label: 'XIAOMI', value: 'XIAOMI' },
    { label: 'OPPO', value: 'OPPO' },
    { label: 'Google Play', value: 'GooglePlay' }
  ]
  const appOptions = [
    { label: '全部', value: '' },
    { label: 'Weather8', value: 'Weather8' },
    { label: 'HealthTracker2', value: 'HealthTracker2' },
    { label: 'CPUMonitor', value: 'CPUMonitor' },
    { label: 'BloodPressure2', value: 'BloodPressure2' },
    { label: 'Weather5', value: 'Weather5' },
    { label: 'FaceMe', value: 'FaceMe' },
    { label: 'Weather6', value: 'Weather6' }
  ]
  const adPlatformOptions = [
    { label: '全部', value: '' },
    { label: 'TikTok', value: 'TikTok' },
    { label: 'Mintegral', value: 'Mintegral' },
    { label: 'organic', value: 'organic' }
  ]
  const channelOptions = [
    { label: '全部', value: '' },
    { label: 'InAppShare', value: 'InAppShare' }
  ]
  const currencyOptions = [
    { label: 'USD', value: 'USD' },
    { label: 'CNY', value: 'CNY' },
    { label: 'EUR', value: 'EUR' }
  ]

  // ─── Filter State ─────────────────────────────────────────────────────────────
  const filters = ref<FilterState>({
    platform: '',
    appStore: '',
    app: '',
    adPlatform: '',
    channel: '',
    dateRange: createDefaultDateRange(),
    currency: 'USD'
  })

  const activeFilters = ref<FilterState>({ ...filters.value })
  const loading = ref(false)

  const platformCards = ref<PlatformCard[]>([])
  const statusSummary = ref<ThirdPartyStoresStatusSummary>({
    connectedPlatforms: 0,
    totalApps: 0,
    pendingSync: 0,
    newPlatformsThisMonth: 0,
    newPlatformName: ''
  })
  const summaryPayload = ref<ThirdPartyStoresSummaryMetrics | null>(null)
  const chartDonut = ref<ThirdPartyStoresDashboardPayload['donut'] | null>(null)
  const chartBar = ref<ThirdPartyStoresDashboardPayload['bar'] | null>(null)

  const appStoreData = ref<AppStoreRecord[]>([])
  const channelData = ref<ChannelRecord[]>([])

  // Flatten for rendering with expand logic
  const flatAppStoreRows = computed(() => {
    const rows: (AppStoreRecord & { indent: number })[] = []
    for (const row of appStoreData.value) {
      rows.push({ ...row, indent: 0 })
      if (row.isGroup && row.expanded && row.children) {
        for (const child of row.children) {
          rows.push({ ...child, indent: 1 })
        }
      }
    }
    return rows
  })

  const flatChannelRows = computed(() => {
    const rows: (ChannelRecord & { indent: number })[] = []
    for (const row of channelData.value) {
      rows.push({ ...row, indent: 0 })
      if (row.isGroup && row.expanded && row.children) {
        for (const child of row.children) {
          rows.push({ ...child, indent: 1 })
        }
      }
    }
    return rows
  })

  const fmtUsd2 = (n: number) =>
    '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  // ─── Summary Metrics ──────────────────────────────────────────────────────────
  const summaryMetrics = computed(() => {
    const suffix = activeFilters.value.app ? ' (筛选)' : ''
    const s = summaryPayload.value
    if (!s) {
      return {
        newUsers: { value: '—', label: '总新用户', sublabel: '商店自然流量为主' + suffix },
        totalRevenue: { value: '—', label: '总收入', sublabel: '应用商店+推广渠道' },
        adRevenue: { value: '—', label: '广告收入', sublabel: '含商店内广告' },
        paidRevenue: { value: '—', label: '付费收入', sublabel: '应用内购买' },
        arpu: { value: '—', label: '平均每用户收入', sublabel: '总收入/总新用户' }
      }
    }
    return {
      newUsers: {
        value: s.newUsers.toLocaleString('en-US'),
        label: '总新用户',
        sublabel: '商店自然流量为主' + suffix
      },
      totalRevenue: {
        value: fmtUsd2(s.totalRevenue),
        label: '总收入',
        sublabel: '应用商店+推广渠道'
      },
      adRevenue: {
        value: fmtUsd2(s.adRevenue),
        label: '广告收入',
        sublabel: '含商店内广告'
      },
      paidRevenue: {
        value: fmtUsd2(s.paidRevenue),
        label: '付费收入',
        sublabel: '应用内购买'
      },
      arpu: {
        value: fmtUsd2(s.arpu),
        label: '平均每用户收入',
        sublabel: '总收入/总新用户'
      }
    }
  })

  const appStoreTotals = computed(() => {
    const tops = appStoreData.value
    const nu = tops.reduce((acc, r) => acc + r.newUsers, 0)
    const tr = tops.reduce((acc, r) => acc + r.totalRevenue, 0)
    const ar = tops.reduce((acc, r) => acc + r.adRevenue, 0)
    const pr = tops.reduce((acc, r) => acc + r.paidRevenue, 0)
    const adPct = tr > 0 ? Math.round((ar / tr) * 100) : 0
    return { newUsers: nu, totalRevenue: tr, adRevenue: ar, paidRevenue: pr, adRatioPct: adPct }
  })

  const channelTotals = computed(() => {
    const tops = channelData.value
    const nu = tops.reduce((acc, r) => acc + r.newUsers, 0)
    const tr = tops.reduce((acc, r) => acc + r.totalRevenue, 0)
    const ar = tops.reduce((acc, r) => acc + r.adRevenue, 0)
    const pr = tops.reduce((acc, r) => acc + r.paidRevenue, 0)
    return {
      newUsers: nu,
      totalRevenue: tr,
      adRevenue: ar,
      paidRevenue: pr,
      ratioPct: tr > 0 ? 100 : 0
    }
  })

  // ─── Filter / Search Logic ───────────────────────────────────────────────────
  const loadDashboard = async () => {
    loading.value = true
    try {
      const params = buildQueryParams(filters.value)
      const data = await thirdPartyStoresApi.getOverviewDashboard(params)
      activeFilters.value = { ...filters.value }
      platformCards.value = data.platformCards
      statusSummary.value = data.statusSummary
      summaryPayload.value = data.summary
      appStoreData.value = data.appStoreData
      channelData.value = data.channelData
      chartDonut.value = data.donut
      chartBar.value = data.bar
      await nextTick()
      initCharts()
    } finally {
      loading.value = false
    }
  }

  const applyFilters = () => {
    loadDashboard()
  }

  const resetFilters = () => {
    filters.value = {
      platform: '',
      appStore: '',
      app: '',
      adPlatform: '',
      channel: '',
      dateRange: createDefaultDateRange(),
      currency: 'USD'
    }
    loadDashboard()
  }

  const toggleExpand = (key: string, type: 'app' | 'channel') => {
    if (type === 'app') {
      const row = appStoreData.value.find((r) => r.key === key)
      if (row) row.expanded = !row.expanded
    } else {
      const row = channelData.value.find((r) => r.key === key)
      if (row) row.expanded = !row.expanded
    }
  }

  // ─── Charts ────────────────────────────────────────────────────────────────────
  const donutChartRef = ref<HTMLElement | null>(null)
  const barChartRef = ref<HTMLElement | null>(null)
  let donutChart: echarts.ECharts | null = null
  let barChart: echarts.ECharts | null = null

  const initCharts = () => {
    const d = chartDonut.value
    const b = chartBar.value

    if (donutChartRef.value && d) {
      if (!donutChart) donutChart = echarts.init(donutChartRef.value, 'dark')
      donutChart.setOption({
        backgroundColor: 'transparent',
        tooltip: { trigger: 'item', formatter: '{b}: {d}%' },
        legend: {
          orient: 'vertical',
          right: '5%',
          top: 'center',
          textStyle: { color: '#9ca3af', fontSize: 12 },
          itemWidth: 10,
          itemHeight: 10,
          data: d.legend
        },
        series: [
          {
            type: 'pie',
            radius: ['45%', '70%'],
            center: ['40%', '50%'],
            data: d.slices.map((s) => ({
              value: s.value,
              name: s.name,
              itemStyle: { color: s.color }
            })),
            label: { show: false },
            emphasis: {
              itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.5)' }
            }
          }
        ]
      })
    }

    if (barChartRef.value && b) {
      if (!barChart) barChart = echarts.init(barChartRef.value, 'dark')
      const apps = b.apps
      const values = b.values
      const ratios = b.ratios
      barChart.setOption({
        backgroundColor: 'transparent',
        tooltip: { trigger: 'axis', axisPointer: { type: 'none' } },
        grid: { left: 80, right: 80, top: 10, bottom: 10 },
        xAxis: { show: false, type: 'value' },
        yAxis: {
          type: 'category',
          data: apps,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: '#9ca3af', fontSize: 12 }
        },
        series: [
          {
            type: 'bar',
            data: values.map((v, i) => ({
              value: v,
              label: {
                show: true,
                position: 'right',
                formatter: () => `$${v}  ${ratios[i]}%`,
                color: '#d1d5db',
                fontSize: 12
              },
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                  { offset: 0, color: '#6366f1' },
                  { offset: 1, color: '#8b5cf6' }
                ]),
                borderRadius: [0, 4, 4, 0]
              }
            })),
            barWidth: 16
          }
        ]
      })
    }
  }

  onMounted(() => {
    loadDashboard()
    window.addEventListener('resize', () => {
      donutChart?.resize()
      barChart?.resize()
    })
  })

  onBeforeUnmount(() => {
    donutChart?.dispose()
    barChart?.dispose()
  })
</script>

<template>
  <div class="store-mgmt">
    <!-- ── Header ─────────────────────────────────────────────────────────── -->
    <div class="header-bar">
      <div class="breadcrumb">
        <span class="breadcrumb-parent">商店运营</span>
        <span class="breadcrumb-sep">›</span>
        <span class="breadcrumb-current">三方商店管理</span>
      </div>
      <div class="header-actions">
        <el-date-picker
          v-model="filters.dateRange"
          type="daterange"
          size="small"
          range-separator="—"
          format="YYYY-MM-DD"
          class="date-picker"
        />
        <el-select v-model="filters.currency" size="small" class="currency-select">
          <el-option
            v-for="o in currencyOptions"
            :key="o.value"
            :label="o.label"
            :value="o.value"
          />
        </el-select>
        <el-button size="small" type="primary" class="btn-add">
          <el-icon><Plus /></el-icon> 新增平台
        </el-button>
        <el-button size="small" class="btn-export">
          <el-icon><Download /></el-icon> 导出
        </el-button>
      </div>
    </div>

    <!-- ── Platform Status ────────────────────────────────────────────────── -->
    <section class="section">
      <h2 class="section-title">平台接入状态</h2>

      <!-- Summary cards -->
      <div class="status-summary-grid">
        <div class="summary-card blue">
          <div class="summary-value"
            >{{ statusSummary.connectedPlatforms }}<span class="summary-unit">个</span></div
          >
          <div class="summary-label">已接入平台</div>
          <div class="summary-sub green-dot">● 全部正常</div>
        </div>
        <div class="summary-card">
          <div class="summary-value"
            >{{ statusSummary.totalApps }}<span class="summary-unit">个</span></div
          >
          <div class="summary-label">总应用数</div>
          <div class="summary-sub">覆盖 6 个平台</div>
        </div>
        <div class="summary-card orange">
          <div class="summary-value"
            >{{ statusSummary.pendingSync }}<span class="summary-unit">个</span></div
          >
          <div class="summary-label">待同步</div>
          <div class="summary-sub warning-dot">▲ 需处理</div>
        </div>
        <div class="summary-card purple">
          <div class="summary-value"
            >{{ statusSummary.newPlatformsThisMonth }}<span class="summary-unit">个</span></div
          >
          <div class="summary-label">本月新增平台</div>
          <div class="summary-sub">{{ statusSummary.newPlatformName }}</div>
        </div>
      </div>

      <!-- Platform cards grid -->
      <div class="platform-grid">
        <div v-for="p in platformCards" :key="p.id" class="platform-card" :class="p.status">
          <div class="platform-card-header">
            <div class="platform-icon" :style="{ backgroundColor: p.iconBg }">
              <!-- Platform Logo SVG placeholders -->
              <span class="platform-icon-letter">{{ p.name[0] }}</span>
            </div>
            <div class="platform-info">
              <div class="platform-name">{{ p.name }}</div>
              <div class="platform-status-badge" :class="p.status">
                <span class="status-dot"></span>
                {{
                  p.status === 'connected'
                    ? 'Connected'
                    : p.status === 'warning'
                      ? 'Warning'
                      : 'Pending'
                }}
              </div>
            </div>
          </div>
          <div class="platform-meta">
            <template v-if="p.status !== 'pending'">
              <span>{{ p.appCount }} apps</span>
              <span v-if="p.status !== 'warning'"> | Last sync {{ p.lastSync }}</span>
              <span v-else class="warning-text"> {{ p.lastSync }}</span>
            </template>
            <span v-else>0 apps | {{ p.lastSync }}</span>
          </div>
          <div class="platform-card-footer">
            <el-button v-if="p.status === 'connected'" size="small" class="btn-detail"
              >查看详情</el-button
            >
            <el-button
              v-else-if="p.status === 'warning'"
              size="small"
              type="warning"
              class="btn-fix"
              >修复认证</el-button
            >
            <el-button v-else size="small" type="primary" class="btn-config">开始配置</el-button>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Filter Bar ─────────────────────────────────────────────────────── -->
    <div class="filter-bar">
      <span class="filter-label">筛选条件：</span>
      <div class="filter-items">
        <el-select v-model="filters.platform" size="small" placeholder="平台: 全部" clearable>
          <el-option
            v-for="o in platformOptions"
            :key="o.value"
            :label="o.label"
            :value="o.value"
          />
        </el-select>
        <el-select v-model="filters.appStore" size="small" placeholder="应用商店: 全部" clearable>
          <el-option
            v-for="o in appStoreOptions"
            :key="o.value"
            :label="o.label"
            :value="o.value"
          />
        </el-select>
        <el-select v-model="filters.app" size="small" placeholder="应用: 全部" clearable>
          <el-option v-for="o in appOptions" :key="o.value" :label="o.label" :value="o.value" />
        </el-select>
        <el-select v-model="filters.adPlatform" size="small" placeholder="广告平台: 全部" clearable>
          <el-option
            v-for="o in adPlatformOptions"
            :key="o.value"
            :label="o.label"
            :value="o.value"
          />
        </el-select>
        <el-select v-model="filters.channel" size="small" placeholder="渠道: 全部" clearable>
          <el-option v-for="o in channelOptions" :key="o.value" :label="o.label" :value="o.value" />
        </el-select>
        <el-button size="small" type="primary" :loading="loading" @click="applyFilters"
          >查询</el-button
        >
        <el-button size="small" @click="resetFilters">重置</el-button>
      </div>
    </div>

    <!-- ── Summary Metrics ────────────────────────────────────────────────── -->
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-value primary"
          >{{ summaryMetrics.newUsers.value }} <span class="metric-unit">人</span></div
        >
        <div class="metric-label">{{ summaryMetrics.newUsers.label }}</div>
        <div class="metric-sub">{{ summaryMetrics.newUsers.sublabel }}</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">{{ summaryMetrics.totalRevenue.value }}</div>
        <div class="metric-label">{{ summaryMetrics.totalRevenue.label }}</div>
        <div class="metric-sub">{{ summaryMetrics.totalRevenue.sublabel }}</div>
      </div>
      <div class="metric-card accent-orange">
        <div class="metric-value orange">{{ summaryMetrics.adRevenue.value }}</div>
        <div class="metric-label">{{ summaryMetrics.adRevenue.label }}</div>
        <div class="metric-sub">{{ summaryMetrics.adRevenue.sublabel }}</div>
      </div>
      <div class="metric-card accent-purple">
        <div class="metric-value purple">{{ summaryMetrics.paidRevenue.value }}</div>
        <div class="metric-label">{{ summaryMetrics.paidRevenue.label }}</div>
        <div class="metric-sub">{{ summaryMetrics.paidRevenue.sublabel }}</div>
      </div>
      <div class="metric-card accent-teal">
        <div class="metric-value teal">{{ summaryMetrics.arpu.value }}</div>
        <div class="metric-label">{{ summaryMetrics.arpu.label }}</div>
        <div class="metric-sub">{{ summaryMetrics.arpu.sublabel }}</div>
      </div>
    </div>

    <!-- ── App Store Data Table ───────────────────────────────────────────── -->
    <section class="section">
      <h2 class="section-title">应用商店数据明细</h2>
      <div v-loading="loading" class="data-table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>应用</th>
              <th>平台</th>
              <th>应用商店</th>
              <th>广告平台</th>
              <th class="num">新用户</th>
              <th class="num">总收入</th>
              <th class="num">广告收入</th>
              <th class="num">付费收入</th>
              <th class="num">广告占比</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="row in flatAppStoreRows" :key="row.key">
              <tr
                class="data-row"
                :class="{ 'group-row': row.isGroup, 'child-row': row.indent > 0 }"
              >
                <td>
                  <div class="cell-app" :style="{ paddingLeft: row.indent * 20 + 'px' }">
                    <span
                      v-if="row.isGroup"
                      class="expand-toggle"
                      @click="toggleExpand(row.key, 'app')"
                    >
                      {{ row.expanded ? '▼' : '▶' }}
                    </span>
                    <span v-if="row.app" class="app-name-link">{{ row.app }}</span>
                    <span v-else class="empty-dash">—</span>
                  </div>
                </td>
                <td>{{ row.platform || '—' }}</td>
                <td>{{ row.adStore || '—' }}</td>
                <td>{{ row.adPlatform || '—' }}</td>
                <td class="num" :class="{ 'val-highlight': row.newUsers > 0 }">
                  {{ row.newUsers > 0 ? row.newUsers : '—' }}
                </td>
                <td class="num val-green"
                  >${{ row.totalRevenue > 0 ? row.totalRevenue.toLocaleString() : '—' }}</td
                >
                <td class="num val-teal"
                  >${{ row.adRevenue > 0 ? row.adRevenue.toLocaleString() : '$0' }}</td
                >
                <td class="num val-purple">{{
                  row.paidRevenue > 0 ? '$' + row.paidRevenue : '—'
                }}</td>
                <td class="num">
                  <div v-if="row.adRatio > 0" class="ratio-cell">
                    <span class="ratio-text">{{ row.adRatio }}%</span>
                    <div class="ratio-bar">
                      <div class="ratio-fill" :style="{ width: row.adRatio + '%' }"></div>
                    </div>
                  </div>
                  <span v-else class="empty-dash">0%</span>
                </td>
              </tr>
            </template>
            <!-- Total row -->
            <tr class="total-row">
              <td>合计</td><td>—</td><td>—</td><td>—</td>
              <td class="num val-highlight">{{ appStoreTotals.newUsers }}</td>
              <td class="num val-green"
                >${{ appStoreTotals.totalRevenue.toLocaleString('en-US') }}</td
              >
              <td class="num val-teal">${{ appStoreTotals.adRevenue.toLocaleString('en-US') }}</td>
              <td class="num val-purple"
                >${{ appStoreTotals.paidRevenue.toLocaleString('en-US') }}</td
              >
              <td class="num">{{ appStoreTotals.adRatioPct }}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- ── Channel Data Table ─────────────────────────────────────────────── -->
    <section class="section">
      <h2 class="section-title">推广渠道数据明细</h2>
      <div v-loading="loading" class="data-table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>应用</th>
              <th>平台</th>
              <th>渠道</th>
              <th>广告系列</th>
              <th class="num">新用户</th>
              <th class="num">总收入</th>
              <th class="num">广告收入</th>
              <th class="num">付费收入</th>
              <th class="num">渠道占比</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="row in flatChannelRows" :key="row.key">
              <tr
                class="data-row"
                :class="{ 'group-row': row.isGroup, 'child-row': row.indent > 0 }"
              >
                <td>
                  <div class="cell-app" :style="{ paddingLeft: row.indent * 20 + 'px' }">
                    <span
                      v-if="row.isGroup"
                      class="expand-toggle"
                      @click="toggleExpand(row.key, 'channel')"
                      >{{ row.expanded ? '▼' : '▶' }}</span
                    >
                    <span v-if="row.app" class="app-name-link">{{ row.app }}</span>
                    <span v-else class="empty-dash">—</span>
                  </div>
                </td>
                <td>{{ row.platform || '—' }}</td>
                <td>{{ row.channel || '—' }}</td>
                <td>{{ row.adCampaign || '—' }}</td>
                <td class="num">{{ row.newUsers }}</td>
                <td class="num val-green">${{ row.totalRevenue.toLocaleString() }}</td>
                <td class="num val-teal">${{ row.adRevenue.toLocaleString() }}</td>
                <td class="num val-purple">${{ row.paidRevenue }}</td>
                <td class="num">
                  <div v-if="row.channelRatio > 0" class="ratio-cell">
                    <span class="ratio-text">{{ row.channelRatio }}%</span>
                    <div class="ratio-bar">
                      <div
                        class="ratio-fill purple-fill"
                        :style="{ width: row.channelRatio * 3 + '%' }"
                      ></div>
                    </div>
                  </div>
                  <span v-else class="empty-dash">—</span>
                </td>
              </tr>
            </template>
            <!-- Total -->
            <tr class="total-row">
              <td>合计</td><td>—</td><td>—</td><td>—</td>
              <td class="num">{{ channelTotals.newUsers }}</td>
              <td class="num val-green"
                >${{ channelTotals.totalRevenue.toLocaleString('en-US') }}</td
              >
              <td class="num val-teal">${{ channelTotals.adRevenue.toLocaleString('en-US') }}</td>
              <td class="num val-purple"
                >${{ channelTotals.paidRevenue.toLocaleString('en-US') }}</td
              >
              <td class="num">{{ channelTotals.ratioPct }}%</td>
            </tr>
          </tbody>
        </table>
        <div class="table-tip">
          提示：InAppShare 为应用内分享推广渠道，不包含外部广告投放消耗，无法计算 ROI
        </div>
      </div>
    </section>

    <!-- ── Bottom Charts ──────────────────────────────────────────────────── -->
    <div class="charts-row">
      <div class="chart-card">
        <h3 class="chart-title">广告平台收入占比</h3>
        <div ref="donutChartRef" class="chart-container donut-chart"></div>
      </div>
      <div class="chart-card">
        <h3 class="chart-title">推广渠道应用收入分布</h3>
        <div ref="barChartRef" class="chart-container bar-chart"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  /* ── Base ─────────────────────────────────────────────────────────────────── */
  .store-mgmt {
    min-height: 100vh;
    padding: 0 0 40px;
    font-family:
      'PingFang SC',
      'Microsoft YaHei',
      -apple-system,
      sans-serif;
    font-size: 13px;
    color: #e2e8f0;
    background: #0f1117;
  }

  /* ── Header ───────────────────────────────────────────────────────────────── */
  .header-bar {
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 24px;
    background: #0f1117;
    border-bottom: 1px solid #1e2332;
  }

  .breadcrumb {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .breadcrumb-parent {
    font-size: 13px;
    color: #6b7280;
  }

  .breadcrumb-sep {
    color: #4b5563;
  }

  .breadcrumb-current {
    font-size: 13px;
    font-weight: 500;
    color: #f1f5f9;
  }

  .header-actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .date-picker {
    width: 220px;
  }

  .currency-select {
    width: 80px;
  }

  .btn-add.el-button--primary {
    background: #3b82f6;
    border-color: #3b82f6;
  }

  .btn-export {
    color: #94a3b8;
    background: #1e2332;
    border-color: #2d3748;
  }

  .btn-export:hover {
    color: #e2e8f0;
    border-color: #4b6080;
  }

  /* ── Section ──────────────────────────────────────────────────────────────── */
  .section {
    padding: 20px 24px 0;
  }

  .section-title {
    margin: 0 0 14px;
    font-size: 14px;
    font-weight: 600;
    color: #f1f5f9;
  }

  /* ── Status Summary Grid ─────────────────────────────────────────────────── */
  .status-summary-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 16px;
  }

  .summary-card {
    padding: 16px 20px;
    background: #151b2d;
    border: 1px solid #1e2332;
    border-radius: 8px;
    transition: border-color 0.2s;
  }

  .summary-card:hover {
    border-color: #2d3f6b;
  }

  .summary-card.blue {
    border-left: 3px solid #3b82f6;
  }

  .summary-card.orange {
    border-left: 3px solid #f59e0b;
  }

  .summary-card.purple {
    border-left: 3px solid #8b5cf6;
  }

  .summary-value {
    font-size: 28px;
    font-weight: 700;
    line-height: 1.2;
    color: #f1f5f9;
  }

  .summary-unit {
    margin-left: 2px;
    font-size: 14px;
    font-weight: 400;
    color: #9ca3af;
  }

  .summary-label {
    margin: 4px 0 2px;
    font-size: 12px;
    color: #9ca3af;
  }

  .summary-sub {
    font-size: 11px;
    color: #6b7280;
  }

  .green-dot {
    color: #22c55e;
  }

  .warning-dot {
    color: #f59e0b;
  }

  /* ── Platform Cards Grid ─────────────────────────────────────────────────── */
  .platform-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 4px;
  }

  .platform-card {
    padding: 14px 16px;
    background: #151b2d;
    border: 1px solid #1e2332;
    border-radius: 8px;
    transition:
      border-color 0.2s,
      transform 0.15s;
  }

  .platform-card:hover {
    border-color: #2d4070;
    transform: translateY(-1px);
  }

  .platform-card.warning {
    border-color: #7c4a0d;
  }

  .platform-card.pending {
    border-color: #1e2332;
    opacity: 0.8;
  }

  .platform-card-header {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 8px;
  }

  .platform-icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 8px;
  }

  .platform-icon-letter {
    font-size: 16px;
    font-weight: 700;
    color: #fff;
  }

  .platform-name {
    font-size: 13px;
    font-weight: 600;
    color: #e2e8f0;
  }

  .platform-status-badge {
    display: flex;
    gap: 4px;
    align-items: center;
    margin-top: 2px;
    font-size: 11px;
  }

  .platform-status-badge.connected {
    color: #22c55e;
  }

  .platform-status-badge.warning {
    color: #f59e0b;
  }

  .platform-status-badge.pending {
    color: #6b7280;
  }

  .status-dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    background: currentcolor;
    border-radius: 50%;
  }

  .platform-meta {
    margin-bottom: 10px;
    font-size: 11px;
    color: #6b7280;
  }

  .warning-text {
    color: #f59e0b;
  }

  .platform-card-footer {
    display: flex;
    justify-content: center;
  }

  .btn-detail,
  .btn-fix,
  .btn-config {
    width: 100%;
    border-radius: 4px;
  }

  .btn-detail {
    color: #94a3b8;
    background: transparent;
    border-color: #2d3748;
  }

  .btn-detail:hover {
    color: #4b90e2;
    border-color: #4b90e2;
  }

  /* ── Filter Bar ───────────────────────────────────────────────────────────── */
  .filter-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    padding: 16px 24px;
    margin-top: 20px;
    background: #151b2d;
    border-top: 1px solid #1e2332;
    border-bottom: 1px solid #1e2332;
  }

  .filter-label {
    font-size: 13px;
    color: #9ca3af;
    white-space: nowrap;
  }

  .filter-items {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  .filter-items .el-select {
    width: 130px;
  }

  /* ── Metrics Grid ─────────────────────────────────────────────────────────── */
  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 0;
    margin: 0 24px;
    margin-top: 20px;
    overflow: hidden;
    background: #151b2d;
    border-top: 1px solid #1e2332;
    border-bottom: 1px solid #1e2332;
    border-radius: 8px;
    animation: slideUp 0.4s ease;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(12px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .metric-card {
    padding: 18px 20px;
    border-right: 1px solid #1e2332;
    transition: background 0.2s;
  }

  .metric-card:last-child {
    border-right: none;
  }

  .metric-card:hover {
    background: #1a2236;
  }

  .metric-card.accent-orange {
    background: rgb(251 146 60 / 5%);
  }

  .metric-card.accent-purple {
    background: rgb(139 92 246 / 5%);
  }

  .metric-card.accent-teal {
    background: rgb(20 184 166 / 5%);
  }

  .metric-value {
    font-size: 22px;
    font-weight: 700;
    line-height: 1.3;
    color: #f1f5f9;
  }

  .metric-unit {
    font-size: 14px;
    font-weight: 400;
  }

  .metric-value.primary {
    color: #f1f5f9;
  }

  .metric-value.orange {
    color: #fb923c;
  }

  .metric-value.purple {
    color: #a78bfa;
  }

  .metric-value.teal {
    color: #2dd4bf;
  }

  .metric-label {
    margin: 4px 0 2px;
    font-size: 12px;
    color: #9ca3af;
  }

  .metric-sub {
    font-size: 11px;
    color: #6b7280;
  }

  /* ── Data Tables ──────────────────────────────────────────────────────────── */
  .data-table-wrap {
    margin-bottom: 4px;
    overflow: hidden;
    border: 1px solid #1e2332;
    border-radius: 8px;
  }

  .data-table {
    width: 100%;
    font-size: 12px;
    border-collapse: collapse;
  }

  .data-table thead tr {
    background: #0d1017;
  }

  .data-table th {
    padding: 10px 12px;
    font-weight: 500;
    color: #6b7280;
    text-align: left;
    white-space: nowrap;
    border-bottom: 1px solid #1e2332;
  }

  .data-table th.num {
    text-align: right;
  }

  .data-row {
    border-bottom: 1px solid #141926;
    transition: background 0.15s;
  }

  .data-row:hover {
    background: #1a2236;
  }

  .group-row {
    background: #131824;
  }

  .child-row {
    background: #0f1420;
  }

  .total-row {
    background: #0d1017;
    border-top: 1px solid #2d3748;
  }

  .total-row td {
    padding: 10px 12px;
    font-weight: 600;
    color: #e2e8f0;
  }

  .data-table td {
    padding: 8px 12px;
    color: #9ca3af;
    white-space: nowrap;
  }

  .data-table td.num {
    text-align: right;
  }

  .cell-app {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .expand-toggle {
    width: 12px;
    font-size: 10px;
    color: #4b5563;
    cursor: pointer;
    user-select: none;
    transition: color 0.15s;
  }

  .expand-toggle:hover {
    color: #94a3b8;
  }

  .app-name-link {
    color: #60a5fa;
    cursor: pointer;
  }

  .app-name-link:hover {
    text-decoration: underline;
  }

  .empty-dash {
    color: #374151;
  }

  .val-highlight {
    font-weight: 600;
    color: #f1f5f9;
  }

  .val-green {
    color: #4ade80;
  }

  .val-teal {
    color: #2dd4bf;
  }

  .val-purple {
    color: #a78bfa;
  }

  .ratio-cell {
    display: flex;
    gap: 6px;
    align-items: center;
    justify-content: flex-end;
  }

  .ratio-text {
    min-width: 32px;
    color: #e2e8f0;
    text-align: right;
  }

  .ratio-bar {
    width: 60px;
    height: 4px;
    overflow: hidden;
    background: #1e2332;
    border-radius: 2px;
  }

  .ratio-fill {
    height: 100%;
    background: linear-gradient(90deg, #22c55e, #4ade80);
    border-radius: 2px;
    transition: width 0.4s ease;
  }

  .ratio-fill.purple-fill {
    background: linear-gradient(90deg, #7c3aed, #a78bfa);
  }

  .table-tip {
    padding: 8px 12px;
    font-size: 11px;
    color: #4b5563;
    background: #0d1017;
    border-top: 1px solid #1e2332;
  }

  /* ── Charts ───────────────────────────────────────────────────────────────── */
  .charts-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    padding: 20px 24px 0;
  }

  .chart-card {
    padding: 16px 20px;
    background: #151b2d;
    border: 1px solid #1e2332;
    border-radius: 8px;
  }

  .chart-title {
    margin: 0 0 12px;
    font-size: 13px;
    font-weight: 600;
    color: #e2e8f0;
  }

  .chart-container {
    width: 100%;
  }

  .donut-chart {
    height: 220px;
  }

  .bar-chart {
    height: 220px;
  }

  /* ── Element Plus Overrides ──────────────────────────────────────────────── */
  :deep(.el-input__wrapper) {
    background: #1a2133 !important;
    border-color: #2d3748 !important;
    box-shadow: none !important;
  }

  :deep(.el-input__inner) {
    font-size: 12px;
    color: #d1d5db !important;
  }

  :deep(.el-date-editor .el-range-input) {
    font-size: 12px;
    color: #d1d5db;
  }

  :deep(.el-date-editor .el-range-separator) {
    color: #6b7280;
  }

  :deep(.el-select .el-input.is-focus .el-input__wrapper) {
    border-color: #3b82f6 !important;
    box-shadow: 0 0 0 1px #3b82f6 !important;
  }

  :deep(.el-button--small) {
    padding: 5px 12px;
    font-size: 12px;
  }

  :deep([v-loading]) {
    min-height: 40px;
  }

  /* ── Responsive ───────────────────────────────────────────────────────────── */
  @media (width <= 1200px) {
    .status-summary-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .platform-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .metrics-grid {
      grid-template-columns: repeat(3, 1fr);
    }

    .charts-row {
      grid-template-columns: 1fr;
    }
  }

  @media (width <= 768px) {
    .header-bar {
      flex-direction: column;
      gap: 8px;
      align-items: flex-start;
    }

    .metrics-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .platform-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
