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
      appStore: f.appStore || undefined,
      appId: f.app || undefined,
      source: f.adPlatform || undefined,
      channel: f.channel || undefined,
      startDate: start ? formatYYYYMMDD(start) : undefined,
      endDate: end ? formatYYYYMMDD(end) : undefined,
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
  const skeletonLoading = computed(() => {
    return (
      loading.value &&
      platformCards.value.length === 0 &&
      summaryPayload.value === null &&
      appStoreData.value.length === 0 &&
      channelData.value.length === 0
    )
  })

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
        tooltip: {
          trigger: 'item',
          confine: true,
          backgroundColor: 'rgba(24, 24, 27, 0.92)',
          borderColor: 'rgba(39, 39, 42, 0.9)',
          borderWidth: 1,
          padding: [8, 10],
          textStyle: { color: '#F4F4F5', fontSize: 12, lineHeight: 18 },
          extraCssText:
            'border-radius: 10px; box-shadow: 0 12px 40px rgba(0,0,0,0.45); backdrop-filter: blur(8px);',
          formatter: '{b}: {d}%'
        },
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
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'none' },
          confine: true,
          backgroundColor: 'rgba(24, 24, 27, 0.92)',
          borderColor: 'rgba(39, 39, 42, 0.9)',
          borderWidth: 1,
          padding: [8, 10],
          textStyle: { color: '#F4F4F5', fontSize: 12, lineHeight: 18 },
          extraCssText:
            'border-radius: 10px; box-shadow: 0 12px 40px rgba(0,0,0,0.45); backdrop-filter: blur(8px);'
        },
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
                formatter: () => `${fmtUsd2(v)}  ${ratios[i]}%`,
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

  function onResize() {
    donutChart?.resize()
    barChart?.resize()
  }

  onMounted(() => {
    loadDashboard()
    window.addEventListener('resize', onResize)
  })

  onBeforeUnmount(() => {
    donutChart?.dispose()
    barChart?.dispose()
    window.removeEventListener('resize', onResize)
  })
</script>

<template>
  <div class="store-mgmt">
    <!-- ── Filters（对齐广告成效：非固定吸顶，不改功能） ─────────────────────── -->
    <div class="tps-filters">
      <div class="tps-filters__left">
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
      </div>
      <div class="tps-filters__right">
        <el-button
          size="small"
          type="primary"
          :loading="loading"
          class="tps-btn-query"
          @click="applyFilters"
        >
          查询
        </el-button>
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

      <ElSkeleton :loading="skeletonLoading" animated>
        <template #template>
          <div class="status-summary-grid">
            <div v-for="i in 4" :key="i" class="summary-card">
              <ElSkeletonItem variant="text" style="width: 60%; height: 28px" />
              <ElSkeletonItem variant="text" style="width: 40%; margin-top: 10px" />
              <ElSkeletonItem variant="text" style="width: 55%; margin-top: 8px" />
            </div>
          </div>
          <div class="platform-grid">
            <div v-for="i in 3" :key="i" class="platform-card">
              <div class="platform-card-header">
                <ElSkeletonItem variant="circle" style="width: 36px; height: 36px" />
                <div style="flex: 1; min-width: 0">
                  <ElSkeletonItem variant="text" style="width: 46%" />
                  <ElSkeletonItem variant="text" style="width: 34%; margin-top: 8px" />
                </div>
              </div>
              <ElSkeletonItem variant="text" style="width: 70%; margin-top: 10px" />
              <ElSkeletonItem variant="rect" style="width: 100%; height: 32px; margin-top: 12px" />
            </div>
          </div>
        </template>
        <template #default>
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
                <el-button v-else size="small" type="primary" class="btn-config"
                  >开始配置</el-button
                >
              </div>
            </div>
          </div>
        </template>
      </ElSkeleton>
    </section>

    <!-- ── Filter Bar ─────────────────────────────────────────────────────── -->
    <div class="filter-bar">
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
    <ElSkeleton :loading="skeletonLoading" animated>
      <template #template>
        <div class="metrics-grid">
          <div v-for="i in 5" :key="i" class="metric-card">
            <ElSkeletonItem variant="text" style="width: 62%; height: 22px" />
            <ElSkeletonItem variant="text" style="width: 34%; margin-top: 10px" />
            <ElSkeletonItem variant="text" style="width: 78%; margin-top: 8px" />
          </div>
        </div>
      </template>
      <template #default>
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
      </template>
    </ElSkeleton>

    <!-- ── App Store Data Table ───────────────────────────────────────────── -->
    <section class="section">
      <ElCard shadow="never" class="tps-section-card" body-class="tps-section-card__body">
        <template #header>
          <div class="tps-section-card__header">
            <span class="tps-section-card__title">应用商店数据明细</span>
          </div>
        </template>
        <ElSkeleton :loading="skeletonLoading" animated>
          <template #template>
            <div class="data-table-wrap">
              <div style="padding: 12px 12px 4px">
                <ElSkeletonItem variant="rect" style="width: 100%; height: 34px" />
              </div>
              <div style="padding: 0 12px 12px">
                <ElSkeletonItem
                  v-for="i in 6"
                  :key="i"
                  variant="rect"
                  style="width: 100%; height: 28px; margin-top: 10px"
                />
              </div>
            </div>
          </template>
          <template #default>
            <div v-loading="loading && !skeletonLoading" class="data-table-wrap">
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
                    <td class="num val-teal"
                      >${{ appStoreTotals.adRevenue.toLocaleString('en-US') }}</td
                    >
                    <td class="num val-purple"
                      >${{ appStoreTotals.paidRevenue.toLocaleString('en-US') }}</td
                    >
                    <td class="num">{{ appStoreTotals.adRatioPct }}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
        </ElSkeleton>
      </ElCard>
    </section>

    <!-- ── Channel Data Table ─────────────────────────────────────────────── -->
    <section class="section">
      <ElCard shadow="never" class="tps-section-card" body-class="tps-section-card__body">
        <template #header>
          <div class="tps-section-card__header">
            <span class="tps-section-card__title">推广渠道数据明细</span>
          </div>
        </template>
        <ElSkeleton :loading="skeletonLoading" animated>
          <template #template>
            <div class="data-table-wrap">
              <div style="padding: 12px 12px 4px">
                <ElSkeletonItem variant="rect" style="width: 100%; height: 34px" />
              </div>
              <div style="padding: 0 12px 12px">
                <ElSkeletonItem
                  v-for="i in 6"
                  :key="i"
                  variant="rect"
                  style="width: 100%; height: 28px; margin-top: 10px"
                />
              </div>
            </div>
          </template>
          <template #default>
            <div v-loading="loading && !skeletonLoading" class="data-table-wrap">
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
                    <td class="num val-teal"
                      >${{ channelTotals.adRevenue.toLocaleString('en-US') }}</td
                    >
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
          </template>
        </ElSkeleton>
      </ElCard>
    </section>

    <!-- ── Bottom Charts ──────────────────────────────────────────────────── -->
    <div class="charts-row">
      <ElSkeleton :loading="skeletonLoading" animated>
        <template #template>
          <div class="chart-card">
            <ElSkeletonItem variant="text" style="width: 46%" />
            <ElSkeletonItem variant="rect" style="width: 100%; height: 220px; margin-top: 12px" />
          </div>
        </template>
        <template #default>
          <div class="chart-card">
            <h3 class="chart-title">广告平台收入占比</h3>
            <div ref="donutChartRef" class="chart-container donut-chart"></div>
          </div>
        </template>
      </ElSkeleton>
      <ElSkeleton :loading="skeletonLoading" animated>
        <template #template>
          <div class="chart-card">
            <ElSkeletonItem variant="text" style="width: 52%" />
            <ElSkeletonItem variant="rect" style="width: 100%; height: 220px; margin-top: 12px" />
          </div>
        </template>
        <template #default>
          <div class="chart-card">
            <h3 class="chart-title">推广渠道应用收入分布</h3>
            <div ref="barChartRef" class="chart-container bar-chart"></div>
          </div>
        </template>
      </ElSkeleton>
    </div>
  </div>
</template>

<style scoped lang="scss">
  @use '../../user-growth/ad-performance/styles/ap-card-fx.scss' as *;

  /* 仅调整样式：DOM 结构保持不变 */
  .store-mgmt {
    position: relative;
    min-height: 100vh;
    padding: 0 0 40px;
    overflow-x: clip;
    font-size: 13px;
    color: var(--text-primary);
    background: var(--default-bg-color);
  }

  /* 极光背景（对齐广告成效的顶部氛围） */
  .store-mgmt::before {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    content: '';
    background:
      radial-gradient(
        ellipse 70% 50% at 6% 6%,
        rgb(16 185 129 / 32%) 0%,
        rgb(6 182 212 / 14%) 38%,
        transparent 58%
      ),
      radial-gradient(
        ellipse 55% 42% at 94% 8%,
        rgb(59 130 246 / 28%) 0%,
        rgb(139 92 246 / 12%) 38%,
        transparent 58%
      ),
      radial-gradient(ellipse 40% 35% at 48% 18%, rgb(168 85 247 / 12%) 0%, transparent 55%);
    mask-image: linear-gradient(to bottom, black 0%, black 28%, transparent 58%);
    animation: tps-aurora-drift 14s ease-in-out infinite alternate;
  }

  .store-mgmt::after {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    content: '';
    background-image:
      linear-gradient(rgb(186 230 253 / 4%) 1px, transparent 1px),
      linear-gradient(90deg, rgb(186 230 253 / 4%) 1px, transparent 1px);
    background-size:
      40px 40px,
      40px 40px;
    mask-image: linear-gradient(to bottom, black 0%, black 18%, transparent 45%);
  }

  @keyframes tps-aurora-drift {
    0% {
      filter: hue-rotate(0deg);
      opacity: 0.72;
      transform: scale(1) translate(0, 0);
    }

    100% {
      filter: hue-rotate(-12deg);
      opacity: 0.92;
      transform: scale(1.04) translate(-1.2%, 1.2%);
    }
  }

  /* 保证内容层级在背景之上 */
  .store-mgmt > * {
    position: relative;
    z-index: 1;
  }

  /* ── Filters（对齐广告成效）────────────────────────────────────────────── */
  .tps-filters {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    padding: 18px 20px;
    margin: 24px 24px 0;
    background: color-mix(in srgb, var(--default-box-color) 82%, transparent);
    border: 1px solid color-mix(in srgb, var(--default-border) 70%, transparent);
    border-radius: 16px;
    box-shadow:
      0 10px 36px rgb(0 0 0 / 22%),
      inset 0 1px 0 rgb(255 255 255 / 8%);
  }

  .tps-filters__left,
  .tps-filters__right {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 12px;
    align-items: center;
  }

  /* 筛选项尺寸统一：40px 高度 + 胶囊；按钮与选择器对齐 */
  :deep(.tps-filters),
  :deep(.filter-bar) {
    --el-component-size: 40px;
  }

  :deep(.tps-filters .el-input__wrapper),
  :deep(.filter-bar .el-input__wrapper) {
    min-height: 40px;
    padding: 0 12px;
  }

  /* Element Plus Select 在部分版本使用 el-select__wrapper（不是 el-input__wrapper） */
  :deep(.tps-filters .el-select__wrapper),
  :deep(.filter-bar .el-select__wrapper) {
    min-height: 40px;
    padding: 0 12px;
    border-radius: 9999px !important;
  }

  :deep(.tps-filters .el-range-editor.el-input__wrapper) {
    min-height: 40px;
  }

  :deep(.tps-filters .el-button--small),
  :deep(.filter-bar .el-button--small) {
    height: 40px;
    padding: 0 16px;
    font-size: 13px;
    border-radius: 9999px !important;
  }

  :deep(.tps-filters .el-button--small .el-icon),
  :deep(.filter-bar .el-button--small .el-icon) {
    margin-right: 6px;
  }

  :deep(.tps-filters .el-input__wrapper) {
    background: rgb(255 255 255 / 4%) !important;
    border: 1px solid rgb(96 165 250 / 18%) !important;
    border-radius: 9999px !important;
    box-shadow: none !important;
  }

  :deep(.tps-filters .el-input__wrapper:hover) {
    border-color: rgb(96 165 250 / 45%) !important;
    box-shadow: 0 0 12px rgb(59 130 246 / 14%) !important;
  }

  :deep(.tps-filters .el-input__wrapper.is-focus) {
    border-color: var(--art-primary) !important;
    box-shadow: 0 0 0 2px rgb(59 130 246 / 20%) !important;
  }

  :deep(.tps-filters .el-button--small) {
    border-radius: 9999px !important;
  }

  .date-picker {
    width: 220px;
  }

  .currency-select {
    width: 80px;
  }

  /* 按项目规范：按钮统一圆角 */
  .btn-add,
  .btn-export {
    border-radius: 9999px;
  }

  .btn-export {
    color: var(--text-secondary);
    background: rgb(255 255 255 / 6%);
    border-color: rgb(96 165 250 / 18%);
  }

  .btn-export:hover {
    color: var(--text-primary);
    border-color: rgb(96 165 250 / 45%);
  }

  /* ── Section ──────────────────────────────────────────────────────────────── */
  .section {
    padding: 20px 24px 0;
  }

  .section-title {
    margin: 0 0 14px;
    font-size: 14px;
    font-weight: 600;

    @include ap-title-gradient;

    line-height: 1.2;
  }

  .tps-section-card {
    /* 卡片额外质感 */
    position: relative;
    overflow: hidden;
    background: color-mix(in srgb, var(--default-box-color) 82%, transparent);
    border: 1px solid color-mix(in srgb, var(--default-border) 75%, transparent);
    border-radius: 16px;
    box-shadow: 0 10px 40px rgb(0 0 0 / 35%);

    @include ap-card-mesh;
    @include ap-panel-hover;
  }

  :deep(.tps-section-card .el-card__header) {
    padding: 14px 16px;
    background: color-mix(in srgb, var(--default-bg-color) 72%, transparent);
    border-bottom: 1px solid color-mix(in srgb, var(--default-border) 70%, transparent);
  }

  :deep(.tps-section-card__body.el-card__body) {
    padding: 14px 16px;
  }

  .tps-section-card__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-width: 0;
  }

  .tps-section-card__title {
    font-size: 13px;
    font-weight: 700;

    @include ap-title-gradient;

    line-height: 1.2;
  }

  /* ── Status Summary Grid ─────────────────────────────────────────────────── */
  .status-summary-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 16px;
  }

  .summary-card {
    --tps-accent: var(--art-primary);
    --tps-accent-2: #22d3ee;

    /* 效果留给卡片（筛选不加背景特效） */
    position: relative;
    padding: 16px 20px;
    overflow: hidden;
    background: color-mix(in srgb, var(--default-box-color) 82%, transparent);
    border: 1px solid color-mix(in srgb, var(--default-border) 70%, transparent);
    border-radius: 16px;
    box-shadow:
      0 10px 36px rgb(0 0 0 / 42%),
      inset 0 1px 0 rgb(255 255 255 / 10%);
    transition:
      box-shadow 0.42s var(--ease-out),
      border-color 0.32s var(--ease-default);

    @include ap-card-mesh;
    @include ap-panel-hover;

    /* 色彩氛围层：淡淡的双端渐变 */
    &::before {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      content: '';
      background:
        radial-gradient(
          ellipse 80% 60% at 10% 0%,
          color-mix(in srgb, var(--tps-accent) 26%, transparent) 0%,
          transparent 55%
        ),
        radial-gradient(
          ellipse 80% 60% at 100% 100%,
          color-mix(in srgb, var(--tps-accent-2) 18%, transparent) 0%,
          transparent 58%
        );
      opacity: 0.9;
    }

    /* 顶部高光线 */
    &::after {
      position: absolute;
      top: 0;
      left: 50%;
      z-index: 1;
      width: 82%;
      height: 2px;
      pointer-events: none;
      content: '';
      background: linear-gradient(
        90deg,
        transparent,
        color-mix(in srgb, var(--tps-accent) 85%, transparent),
        color-mix(in srgb, var(--tps-accent-2) 85%, transparent),
        transparent
      );
      opacity: 0.7;
      transform: translateX(-50%);
    }

    > * {
      position: relative;
      z-index: 2;
    }
  }

  .summary-card:hover {
    border-color: color-mix(in srgb, var(--art-primary) 45%, var(--default-border));
    box-shadow:
      0 24px 72px rgb(0 0 0 / 52%),
      0 0 72px rgb(59 130 246 / 10%);
  }

  .summary-card.blue {
    --tps-accent: var(--art-primary);
    --tps-accent-2: #22d3ee;

    border-color: color-mix(in srgb, var(--art-primary) 35%, var(--default-border));
  }

  .summary-card.orange {
    --tps-accent: var(--art-warning);
    --tps-accent-2: #fbbf24;

    border-color: color-mix(in srgb, var(--art-warning) 35%, var(--default-border));
  }

  .summary-card.purple {
    --tps-accent: #a855f7;
    --tps-accent-2: #818cf8;

    border-color: color-mix(in srgb, #a855f7 30%, var(--default-border));
  }

  .summary-value {
    font-size: 28px;
    font-weight: 900;
    font-variant-numeric: tabular-nums;
    line-height: 1.2;
    color: var(--text-primary);
  }

  .summary-unit {
    margin-left: 2px;
    font-size: 14px;
    font-weight: 500;
    color: var(--text-secondary);
  }

  .summary-label {
    margin: 4px 0 2px;
    font-size: 12px;
    color: var(--text-secondary);
  }

  .summary-sub {
    font-size: 11px;
    color: var(--text-tertiary);
  }

  .green-dot {
    color: var(--text-success);
  }

  .warning-dot {
    color: var(--text-warning);
  }

  /* ── Platform Cards Grid ─────────────────────────────────────────────────── */
  .platform-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 4px;
  }

  .platform-card {
    --tps-platform-accent: var(--art-primary);
    --tps-platform-glow: rgb(59 130 246 / 16%);

    position: relative;
    padding: 14px 16px;
    overflow: hidden;
    background: color-mix(in srgb, var(--default-box-color) 86%, transparent);
    border: 1px solid color-mix(in srgb, var(--default-border) 70%, transparent);
    border-radius: 16px;
    box-shadow: 0 10px 38px rgb(0 0 0 / 42%);
    transition:
      box-shadow 0.42s var(--ease-out),
      border-color 0.32s var(--ease-default),
      transform 0.22s var(--ease-out);

    @include ap-card-mesh;
    @include ap-panel-hover;

    /* 与上方状态卡区分：角落“徽记式”色彩，而不是整面渐变 */
    &::before {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      content: '';
      background:
        radial-gradient(
          ellipse 55% 45% at 12% 8%,
          color-mix(in srgb, var(--tps-platform-accent) 28%, transparent) 0%,
          transparent 58%
        ),
        radial-gradient(
          ellipse 45% 40% at 100% 110%,
          color-mix(in srgb, var(--tps-platform-accent) 16%, transparent) 0%,
          transparent 62%
        );
      opacity: 0.85;
    }

    /* 左侧细色条：更像“状态标识”，避免和上面卡片同款 */
    &::after {
      position: absolute;
      top: 14px;
      bottom: 14px;
      left: 10px;
      z-index: 1;
      width: 3px;
      pointer-events: none;
      content: '';
      background: linear-gradient(
        180deg,
        color-mix(in srgb, var(--tps-platform-accent) 92%, transparent),
        transparent
      );
      filter: drop-shadow(0 0 14px var(--tps-platform-glow));
      border-radius: 9999px;
      opacity: 0.55;
    }

    > * {
      position: relative;
      z-index: 2;
    }
  }

  .platform-card:hover {
    border-color: color-mix(in srgb, var(--art-primary) 45%, var(--default-border));
    box-shadow:
      0 24px 72px rgb(0 0 0 / 52%),
      0 0 72px rgb(59 130 246 / 10%);
    transform: translateY(-2px);
  }

  .platform-card.warning {
    --tps-platform-accent: var(--art-warning);
    --tps-platform-glow: rgb(249 115 22 / 18%);

    border-color: color-mix(in srgb, var(--art-warning) 40%, var(--default-border));
  }

  .platform-card.pending {
    --tps-platform-accent: color-mix(in srgb, var(--default-border) 60%, transparent);
    --tps-platform-glow: rgb(148 163 184 / 10%);

    opacity: 0.78;
  }

  .platform-card.connected {
    --tps-platform-accent: var(--art-success);
    --tps-platform-glow: rgb(16 185 129 / 16%);
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
    border-radius: 12px;
    box-shadow: inset 0 1px 0 rgb(255 255 255 / 18%);
  }

  .platform-icon-letter {
    font-size: 16px;
    font-weight: 700;
    color: #fff;
  }

  .platform-name {
    font-size: 13px;
    font-weight: 700;
    color: var(--text-primary);
  }

  .platform-status-badge {
    display: flex;
    gap: 4px;
    align-items: center;
    margin-top: 2px;
    font-size: 11px;
  }

  .platform-status-badge.connected {
    color: var(--text-success);
  }

  .platform-status-badge.warning {
    color: var(--text-warning);
  }

  .platform-status-badge.pending {
    color: var(--text-tertiary);
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
    color: var(--text-tertiary);
  }

  .warning-text {
    color: var(--text-warning);
  }

  .platform-card-footer {
    display: flex;
    justify-content: center;
  }

  .btn-detail,
  .btn-fix,
  .btn-config {
    width: 100%;
    border-radius: 9999px;
  }

  .btn-detail {
    color: var(--text-secondary);
    background: transparent;
    border-color: color-mix(in srgb, var(--default-border) 80%, transparent);
  }

  .btn-detail:hover {
    color: var(--text-link);
    border-color: color-mix(in srgb, var(--art-primary) 60%, transparent);
  }

  /* ── Filter Bar ───────────────────────────────────────────────────────────── */
  .filter-bar {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    padding: 16px 24px;
    margin: 20px 24px 0;
    overflow: visible;
    background: color-mix(in srgb, var(--default-box-color) 82%, transparent);
    border: 1px solid color-mix(in srgb, var(--default-border) 70%, transparent);
    border-radius: 16px;
    box-shadow:
      0 10px 36px rgb(0 0 0 / 22%),
      inset 0 1px 0 rgb(255 255 255 / 8%);
  }

  .filter-items .el-button--small {
    border-radius: 9999px;
  }

  :deep(.filter-bar .el-input__wrapper) {
    background: rgb(255 255 255 / 4%) !important;
    border: 1px solid rgb(96 165 250 / 18%) !important;
    border-radius: 9999px !important;
    box-shadow: none !important;
  }

  :deep(.filter-bar .el-input__wrapper:hover) {
    border-color: rgb(96 165 250 / 45%) !important;
    box-shadow: 0 0 12px rgb(59 130 246 / 14%) !important;
  }

  :deep(.filter-bar .el-input__wrapper.is-focus) {
    border-color: var(--art-primary) !important;
    box-shadow: 0 0 0 2px rgb(59 130 246 / 20%) !important;
  }

  /* filter-label DOM 已移除 */

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
    position: relative;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 0;
    margin: 0 24px;
    margin-top: 20px;
    overflow: hidden;
    background: color-mix(in srgb, var(--default-box-color) 82%, transparent);
    border: 1px solid color-mix(in srgb, var(--default-border) 75%, transparent);
    border-radius: 16px;
    animation: slideUp 0.4s ease;
  }

  .metrics-grid::before {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    content: '';
    background:
      radial-gradient(ellipse 60% 80% at 0% 0%, rgb(59 130 246 / 10%) 0%, transparent 62%),
      radial-gradient(ellipse 55% 80% at 100% 0%, rgb(16 185 129 / 8%) 0%, transparent 60%);
    opacity: 0.85;
  }

  .metrics-grid > * {
    position: relative;
    z-index: 1;
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
    --tps-metric-accent: var(--art-primary);
    --tps-metric-glow: rgb(59 130 246 / 14%);

    position: relative;
    padding: 18px 20px;
    overflow: hidden;
    border-right: 1px solid #1e2332;
    transition: background 0.2s;

    @include ap-card-mesh;

    &::before {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      content: '';
      background:
        radial-gradient(
          ellipse 70% 60% at 18% 0%,
          color-mix(in srgb, var(--tps-metric-accent) 24%, transparent) 0%,
          transparent 60%
        ),
        radial-gradient(
          ellipse 70% 60% at 100% 120%,
          color-mix(in srgb, var(--tps-metric-accent) 14%, transparent) 0%,
          transparent 62%
        );
      opacity: 0.9;
    }

    &::after {
      position: absolute;
      top: 0;
      left: 50%;
      z-index: 1;
      width: 70%;
      height: 2px;
      pointer-events: none;
      content: '';
      background: linear-gradient(
        90deg,
        transparent,
        color-mix(in srgb, var(--tps-metric-accent) 85%, transparent),
        transparent
      );
      opacity: 0.65;
      transform: translateX(-50%);
    }

    > * {
      position: relative;
      z-index: 2;
    }
  }

  .metric-card:last-child {
    border-right: none;
  }

  .metric-card:hover {
    background: color-mix(in srgb, var(--default-box-color) 92%, transparent);
    box-shadow: 0 0 60px var(--tps-metric-glow);
  }

  .metric-card.accent-orange {
    background: rgb(251 146 60 / 5%);

    --tps-metric-accent: #f97316;
    --tps-metric-glow: rgb(249 115 22 / 16%);
  }

  .metric-card.accent-purple {
    background: rgb(139 92 246 / 5%);

    --tps-metric-accent: #a855f7;
    --tps-metric-glow: rgb(168 85 247 / 16%);
  }

  .metric-card.accent-teal {
    background: rgb(20 184 166 / 5%);

    --tps-metric-accent: #22d3ee;
    --tps-metric-glow: rgb(34 211 238 / 14%);
  }

  .metric-value {
    font-size: 22px;
    font-weight: 900;
    font-variant-numeric: tabular-nums;
    line-height: 1.3;
    color: var(--text-primary);
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
    color: var(--text-secondary);
  }

  .metric-sub {
    font-size: 11px;
    color: var(--text-tertiary);
  }

  /* ── Data Tables ──────────────────────────────────────────────────────────── */
  .data-table-wrap {
    margin-bottom: 4px;
    overflow: hidden;
    border: 1px solid color-mix(in srgb, var(--default-border) 75%, transparent);
    border-radius: 16px;
    box-shadow: 0 10px 40px rgb(0 0 0 / 35%);
  }

  .data-table {
    width: 100%;
    font-size: 12px;
    border-collapse: collapse;
  }

  .data-table thead tr {
    background: color-mix(in srgb, var(--default-bg-color) 92%, transparent);
  }

  .data-table th {
    padding: 10px 12px;
    font-weight: 500;
    color: var(--text-secondary);
    text-align: left;
    white-space: nowrap;
    border-bottom: 1px solid color-mix(in srgb, var(--default-border) 70%, transparent);
  }

  .data-table th.num {
    text-align: right;
  }

  .data-row {
    border-bottom: 1px solid color-mix(in srgb, var(--default-border) 55%, transparent);
    transition: background 0.15s;
  }

  .data-row:hover {
    background: color-mix(in srgb, var(--art-primary) 10%, transparent);
  }

  .group-row {
    background: #131824;
  }

  .child-row {
    background: #0f1420;
  }

  .total-row {
    background: color-mix(in srgb, var(--default-bg-color) 94%, transparent);
    border-top: 1px solid color-mix(in srgb, var(--default-border) 75%, transparent);
  }

  .total-row td {
    padding: 10px 12px;
    font-weight: 800;
    color: var(--text-primary);
  }

  .data-table td {
    padding: 8px 12px;
    color: var(--text-secondary);
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
    color: var(--text-tertiary);
    cursor: pointer;
    user-select: none;
    transition: color 0.15s;
  }

  .expand-toggle:hover {
    color: var(--text-secondary);
  }

  .app-name-link {
    color: var(--text-link);
    cursor: pointer;
  }

  .app-name-link:hover {
    text-decoration: underline;
  }

  .empty-dash {
    color: var(--text-tertiary);
  }

  .val-highlight {
    font-weight: 800;
    color: var(--text-primary);
  }

  .val-green {
    color: var(--text-success);
  }

  .val-teal {
    color: #22d3ee;
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
    background: color-mix(in srgb, var(--default-border) 60%, transparent);
    border-radius: 9999px;
  }

  .ratio-fill {
    height: 100%;
    background: linear-gradient(90deg, #10b981, #34d399);
    border-radius: 9999px;
    transition: width 0.35s var(--ease-out);
  }

  .ratio-fill.purple-fill {
    background: linear-gradient(90deg, #7c3aed, #a78bfa);
  }

  .table-tip {
    padding: 8px 12px;
    font-size: 11px;
    color: var(--text-tertiary);
    background: color-mix(in srgb, var(--default-bg-color) 92%, transparent);
    border-top: 1px solid color-mix(in srgb, var(--default-border) 70%, transparent);
  }

  /* ── Charts ───────────────────────────────────────────────────────────────── */
  .charts-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    padding: 20px 24px 0;
  }

  .chart-card {
    position: relative;
    padding: 16px 20px;
    overflow: hidden;
    background: color-mix(in srgb, var(--default-box-color) 82%, transparent);
    border: 1px solid color-mix(in srgb, var(--default-border) 75%, transparent);
    border-radius: 16px;
    box-shadow: 0 10px 40px rgb(0 0 0 / 35%);

    /* 把“描边框感”提升到外层卡片上（不要画在图表容器里） */
    box-shadow:
      0 10px 40px rgb(0 0 0 / 35%),
      0 0 0 1px color-mix(in srgb, var(--art-primary) 28%, transparent) inset,
      0 0 42px rgb(59 130 246 / 10%);

    @include ap-card-mesh;
    @include ap-panel-hover;
    @include ap-card-title-hover('.chart-title');

    /* 内部层次：顶部轻微反光 + 底部暗角 */
    &::before {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      content: '';
      background:
        radial-gradient(ellipse 80% 55% at 50% 0%, rgb(255 255 255 / 6%) 0%, transparent 60%),
        radial-gradient(ellipse 60% 55% at 50% 120%, rgb(0 0 0 / 28%) 0%, transparent 65%);
      opacity: 0.9;
    }

    > * {
      position: relative;
      z-index: 1;
    }
  }

  .chart-title {
    margin: 0 0 12px;
    font-size: 13px;
    font-weight: 700;

    @include ap-title-gradient;

    line-height: 1.2;
  }

  /* 图表容器 */
  .chart-container {
    position: relative;
    width: 100%;
    overflow: hidden;
    background: transparent;
    border-radius: 14px;
  }

  .chart-container::before {
    content: none;
  }

  /* ECharts canvas/SVG 圆角裁切（不同渲染器都覆盖） */
  :deep(.chart-container canvas),
  :deep(.chart-container svg) {
    position: relative;
    z-index: 1;
    border-radius: 14px;
  }

  /* ECharts 外层包裹 div 也一起裁切，避免“内层框”观感残留 */
  :deep(.chart-container > div) {
    overflow: hidden;
    background: transparent !important;
    border-radius: 14px;
    outline: none !important;
    box-shadow: none !important;
  }

  .donut-chart {
    height: 220px;
  }

  .bar-chart {
    height: 220px;
  }

  /* ── Element Plus Overrides ──────────────────────────────────────────────── */
  :deep(.el-input__wrapper) {
    background: rgb(255 255 255 / 4%) !important;
    border-color: rgb(96 165 250 / 18%) !important;
    border-radius: 9999px;
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
    border-color: var(--art-primary) !important;
    box-shadow: 0 0 0 2px rgb(59 130 246 / 20%) !important;
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

  @media (prefers-reduced-motion: reduce) {
    .store-mgmt::before {
      animation: none;
    }
  }
</style>
