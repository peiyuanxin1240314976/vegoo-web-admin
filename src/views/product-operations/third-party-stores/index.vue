<script setup lang="ts">
  /**
   * ThirdPartyStoreManagement.vue
   * 三方商店管理 — 完整可接入组件
   *
   * 依赖：vue@3, element-plus, echarts@6, tailwindcss@4
   * 使用：<ThirdPartyStoreManagement />
   */
  import { ref, computed, onMounted, nextTick, onBeforeUnmount } from 'vue'
  import * as echarts from 'echarts'
  import { Plus, Download } from '@element-plus/icons-vue'

  // ─── Types ────────────────────────────────────────────────────────────────────
  interface PlatformCard {
    id: string
    name: string
    icon: string
    iconBg: string
    status: 'connected' | 'warning' | 'pending'
    appCount: number
    lastSync: string
  }

  interface FilterState {
    platform: string
    appStore: string
    app: string
    adPlatform: string
    channel: string
    dateRange: [Date, Date] | null
    currency: string
  }

  interface AppStoreRecord {
    key: string
    app: string
    platform: string
    adStore: string
    adPlatform: string
    newUsers: number
    totalRevenue: number
    adRevenue: number
    paidRevenue: number
    adRatio: number
    isGroup?: boolean
    expanded?: boolean
    children?: AppStoreRecord[]
  }

  interface ChannelRecord {
    key: string
    app: string
    platform: string
    channel: string
    adCampaign: string
    newUsers: number
    totalRevenue: number
    adRevenue: number
    paidRevenue: number
    channelRatio: number
    isGroup?: boolean
    expanded?: boolean
    children?: ChannelRecord[]
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
    dateRange: [new Date('2026-02-26'), new Date('2026-03-04')],
    currency: 'USD'
  })

  const activeFilters = ref<FilterState>({ ...filters.value })
  const loading = ref(false)

  // ─── Platform Cards ───────────────────────────────────────────────────────────
  const platformCards = ref<PlatformCard[]>([
    {
      id: 'google',
      name: 'Google Play',
      icon: 'google-play',
      iconBg: '#1a73e8',
      status: 'connected',
      appCount: 38,
      lastSync: '5min ago'
    },
    {
      id: 'apple',
      name: 'App Store',
      icon: 'app-store',
      iconBg: '#555',
      status: 'connected',
      appCount: 32,
      lastSync: '3min ago'
    },
    {
      id: 'huawei',
      name: 'Huawei AppGallery',
      icon: 'huawei',
      iconBg: '#e31837',
      status: 'connected',
      appCount: 18,
      lastSync: '10min ago'
    },
    {
      id: 'samsung',
      name: 'Samsung Galaxy Store',
      icon: 'samsung',
      iconBg: '#1428a0',
      status: 'warning',
      appCount: 12,
      lastSync: 'Sync Error - Auth expired'
    },
    {
      id: 'xiaomi',
      name: 'Xiaomi App Store',
      icon: 'xiaomi',
      iconBg: '#ff6900',
      status: 'connected',
      appCount: 15,
      lastSync: '20min ago'
    },
    {
      id: 'amazon',
      name: 'Amazon Appstore',
      icon: 'amazon',
      iconBg: '#232f3e',
      status: 'pending',
      appCount: 0,
      lastSync: 'Not configured'
    }
  ])

  // ─── Raw Data ─────────────────────────────────────────────────────────────────
  const rawAppStoreData: AppStoreRecord[] = [
    {
      key: 'weather8',
      app: 'Weather8',
      platform: '安卓',
      adStore: 'XIAOMI',
      adPlatform: '—',
      newUsers: 297,
      totalRevenue: 380,
      adRevenue: 0,
      paidRevenue: 0,
      adRatio: 0,
      isGroup: true,
      expanded: true,
      children: [
        {
          key: 'w8-1',
          app: '',
          platform: '',
          adStore: 'XIAOMI',
          adPlatform: 'organic',
          newUsers: 297,
          totalRevenue: 380,
          adRevenue: 0,
          paidRevenue: 0,
          adRatio: 0
        },
        {
          key: 'w8-2',
          app: '',
          platform: '',
          adStore: 'XIAOMI',
          adPlatform: 'TikTok',
          newUsers: 0,
          totalRevenue: 862,
          adRevenue: 862,
          paidRevenue: 0,
          adRatio: 100
        }
      ]
    },
    {
      key: 'health2',
      app: 'HealthTracker2',
      platform: '安卓',
      adStore: 'XIAOMI',
      adPlatform: '—',
      newUsers: 80,
      totalRevenue: 540,
      adRevenue: 240,
      paidRevenue: 0,
      adRatio: 44,
      isGroup: true,
      expanded: true,
      children: [
        {
          key: 'h2-1',
          app: '',
          platform: '',
          adStore: 'XIAOMI',
          adPlatform: 'organic',
          newUsers: 80,
          totalRevenue: 440,
          adRevenue: 0,
          paidRevenue: 0,
          adRatio: 0
        },
        {
          key: 'h2-2',
          app: '',
          platform: '',
          adStore: 'XIAOMI',
          adPlatform: 'TikTok',
          newUsers: 0,
          totalRevenue: 48,
          adRevenue: 48,
          paidRevenue: 0,
          adRatio: 100
        },
        {
          key: 'h2-3',
          app: '',
          platform: '',
          adStore: 'XIAOMI',
          adPlatform: 'Mintegral',
          newUsers: 0,
          totalRevenue: 52,
          adRevenue: 52,
          paidRevenue: 0,
          adRatio: 100
        }
      ]
    },
    {
      key: 'cpu',
      app: 'CPUMonitor',
      platform: '安卓',
      adStore: 'XIAOMI+OPPO',
      adPlatform: '—',
      newUsers: 69,
      totalRevenue: 320,
      adRevenue: 180,
      paidRevenue: 0,
      adRatio: 56,
      isGroup: true,
      expanded: true,
      children: [
        {
          key: 'cpu-1',
          app: '',
          platform: '',
          adStore: 'XIAOMI',
          adPlatform: 'organic',
          newUsers: 63,
          totalRevenue: 240,
          adRevenue: 0,
          paidRevenue: 0,
          adRatio: 0
        },
        {
          key: 'cpu-2',
          app: '',
          platform: '',
          adStore: 'XIAOMI',
          adPlatform: 'TikTok',
          newUsers: 0,
          totalRevenue: 60,
          adRevenue: 60,
          paidRevenue: 0,
          adRatio: 100
        },
        {
          key: 'cpu-3',
          app: '',
          platform: '',
          adStore: 'XIAOMI',
          adPlatform: 'Mintegral',
          newUsers: 0,
          totalRevenue: 40,
          adRevenue: 40,
          paidRevenue: 0,
          adRatio: 100
        },
        {
          key: 'cpu-4',
          app: '',
          platform: '',
          adStore: 'OPPO',
          adPlatform: 'organic',
          newUsers: 6,
          totalRevenue: 0,
          adRevenue: 0,
          paidRevenue: 0,
          adRatio: 0
        }
      ]
    },
    {
      key: 'bp2',
      app: 'BloodPressure2',
      platform: '安卓',
      adStore: 'XIAOMI',
      adPlatform: '—',
      newUsers: 43,
      totalRevenue: 285,
      adRevenue: 150,
      paidRevenue: 0,
      adRatio: 53,
      isGroup: true,
      expanded: false
    },
    {
      key: 'weather5',
      app: 'Weather5',
      platform: '安卓',
      adStore: 'XIAOMI+OPPO',
      adPlatform: '—',
      newUsers: 38,
      totalRevenue: 203,
      adRevenue: 0,
      paidRevenue: 0,
      adRatio: 0,
      isGroup: true,
      expanded: false
    },
    {
      key: 'faceme',
      app: 'FaceMe',
      platform: '安卓',
      adStore: 'XIAOMI',
      adPlatform: 'organic',
      newUsers: 7,
      totalRevenue: 60,
      adRevenue: 0,
      paidRevenue: 0,
      adRatio: 0
    },
    {
      key: 'weather6',
      app: 'Weather6',
      platform: '安卓',
      adStore: 'XIAOMI',
      adPlatform: '—',
      newUsers: 2,
      totalRevenue: 243,
      adRevenue: 0,
      paidRevenue: 0,
      adRatio: 0,
      isGroup: true,
      expanded: false
    }
  ]

  const rawChannelData: ChannelRecord[] = [
    {
      key: 'faceme-ch',
      app: 'FaceMe',
      platform: '—',
      channel: 'InAppShare',
      adCampaign: '—',
      newUsers: 0,
      totalRevenue: 680,
      adRevenue: 580,
      paidRevenue: 100,
      channelRatio: 29,
      isGroup: true,
      expanded: true,
      children: [
        {
          key: 'f-1',
          app: '',
          platform: 'iOS',
          channel: 'InAppShare',
          adCampaign: 'FaceMe_InAppShare',
          newUsers: 0,
          totalRevenue: 340,
          adRevenue: 290,
          paidRevenue: 50,
          channelRatio: 0
        },
        {
          key: 'f-2',
          app: '',
          platform: '安卓',
          channel: 'InAppShare',
          adCampaign: 'FaceMe_InAppShare',
          newUsers: 0,
          totalRevenue: 340,
          adRevenue: 290,
          paidRevenue: 50,
          channelRatio: 0
        }
      ]
    },
    {
      key: 'yearcam-ch',
      app: 'YearCam',
      platform: '安卓',
      channel: 'InAppShare',
      adCampaign: '—',
      newUsers: 0,
      totalRevenue: 520,
      adRevenue: 420,
      paidRevenue: 100,
      channelRatio: 22,
      isGroup: true,
      expanded: true,
      children: [
        {
          key: 'y-1',
          app: '',
          platform: '安卓',
          channel: 'InAppShare',
          adCampaign: 'YearCam_InAppShare',
          newUsers: 0,
          totalRevenue: 520,
          adRevenue: 420,
          paidRevenue: 100,
          channelRatio: 0
        }
      ]
    },
    {
      key: 'dressup-ch',
      app: 'Dressup',
      platform: '安卓',
      channel: 'InAppShare',
      adCampaign: '—',
      newUsers: 0,
      totalRevenue: 480,
      adRevenue: 380,
      paidRevenue: 100,
      channelRatio: 21,
      isGroup: true,
      expanded: true,
      children: [
        {
          key: 'd-1',
          app: '',
          platform: '安卓',
          channel: 'InAppShare',
          adCampaign: 'Dressup_InAppShare',
          newUsers: 0,
          totalRevenue: 480,
          adRevenue: 380,
          paidRevenue: 100,
          channelRatio: 0
        }
      ]
    },
    {
      key: 'clapfinder-ch',
      app: 'ClapFinder',
      platform: '—',
      channel: 'InAppShare',
      adCampaign: '—',
      newUsers: 0,
      totalRevenue: 360,
      adRevenue: 290,
      paidRevenue: 70,
      channelRatio: 15,
      isGroup: true,
      expanded: true,
      children: [
        {
          key: 'c-1',
          app: '',
          platform: 'iOS',
          channel: 'InAppShare',
          adCampaign: 'ClapFinder_InAppShare',
          newUsers: 0,
          totalRevenue: 200,
          adRevenue: 160,
          paidRevenue: 40,
          channelRatio: 0
        },
        {
          key: 'c-2',
          app: '',
          platform: '安卓',
          channel: 'InAppShare',
          adCampaign: 'ClapFinder_InAppShare',
          newUsers: 0,
          totalRevenue: 160,
          adRevenue: 130,
          paidRevenue: 30,
          channelRatio: 0
        }
      ]
    },
    {
      key: 'weatherpro-ch',
      app: 'WeatherPro',
      platform: '安卓',
      channel: 'InAppShare',
      adCampaign: 'WeatherPro_InAppShare',
      newUsers: 0,
      totalRevenue: 300,
      adRevenue: 220,
      paidRevenue: 80,
      channelRatio: 13
    }
  ]

  // ─── Filtered Data ────────────────────────────────────────────────────────────
  const appStoreData = ref<AppStoreRecord[]>(JSON.parse(JSON.stringify(rawAppStoreData)))
  const channelData = ref<ChannelRecord[]>(JSON.parse(JSON.stringify(rawChannelData)))

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

  // ─── Summary Metrics ──────────────────────────────────────────────────────────
  const summaryMetrics = computed(() => {
    // Simulate filter-dependent aggregation
    const suffix = activeFilters.value.app ? ' (筛选)' : ''
    return {
      newUsers: { value: '496', label: '总新用户', sublabel: '商店自然流量为主' + suffix },
      totalRevenue: { value: '$6,187', label: '总收入', sublabel: '应用商店+推广渠道' },
      adRevenue: { value: '$4,046', label: '广告收入', sublabel: '含商店内广告' },
      paidRevenue: { value: '$2,141', label: '付费收入', sublabel: '应用内购买' },
      arpu: { value: '$12.47', label: '平均每用户收入', sublabel: '总收入/总新用户' }
    }
  })

  // ─── Filter / Search Logic ───────────────────────────────────────────────────
  const applyFilters = () => {
    loading.value = true
    // Simulate API call
    setTimeout(() => {
      activeFilters.value = { ...filters.value }
      // Filter appStoreData
      const filtered = rawAppStoreData.filter((row) => {
        if (activeFilters.value.app && row.app !== activeFilters.value.app && row.app !== '')
          return false
        if (activeFilters.value.platform) {
          const map: Record<string, string> = { android: '安卓', ios: 'iOS' }
          if (row.platform && row.platform !== map[activeFilters.value.platform]) return false
        }
        return true
      })
      appStoreData.value = JSON.parse(
        JSON.stringify(filtered.length > 0 ? filtered : rawAppStoreData)
      )
      channelData.value = JSON.parse(JSON.stringify(rawChannelData))
      loading.value = false
      nextTick(() => initCharts())
    }, 600)
  }

  const resetFilters = () => {
    filters.value = {
      platform: '',
      appStore: '',
      app: '',
      adPlatform: '',
      channel: '',
      dateRange: [new Date('2026-02-26'), new Date('2026-03-04')],
      currency: 'USD'
    }
    applyFilters()
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
    if (donutChartRef.value) {
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
          data: ['自然流量', 'TikTok', 'Mintegral', 'Kwai']
        },
        series: [
          {
            type: 'pie',
            radius: ['45%', '70%'],
            center: ['40%', '50%'],
            data: [
              { value: 45, name: '自然流量', itemStyle: { color: '#22c55e' } },
              { value: 30, name: 'TikTok', itemStyle: { color: '#3b82f6' } },
              { value: 15, name: 'Mintegral', itemStyle: { color: '#8b5cf6' } },
              { value: 10, name: 'Kwai', itemStyle: { color: '#f59e0b' } }
            ],
            label: { show: false },
            emphasis: {
              itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.5)' }
            }
          }
        ]
      })
    }

    if (barChartRef.value) {
      if (!barChart) barChart = echarts.init(barChartRef.value, 'dark')
      const apps = ['WeatherPro', 'ClapFinder', 'Dressup', 'YearCam', 'FaceMe']
      const values = [300, 360, 480, 520, 680]
      const ratios = [13, 15, 21, 22, 29]
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
    nextTick(() => initCharts())
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
          <div class="summary-value">6<span class="summary-unit">个</span></div>
          <div class="summary-label">已接入平台</div>
          <div class="summary-sub green-dot">● 全部正常</div>
        </div>
        <div class="summary-card">
          <div class="summary-value">42<span class="summary-unit">个</span></div>
          <div class="summary-label">总应用数</div>
          <div class="summary-sub">覆盖 6 个平台</div>
        </div>
        <div class="summary-card orange">
          <div class="summary-value">3<span class="summary-unit">个</span></div>
          <div class="summary-label">待同步</div>
          <div class="summary-sub warning-dot">▲ 需处理</div>
        </div>
        <div class="summary-card purple">
          <div class="summary-value">1<span class="summary-unit">个</span></div>
          <div class="summary-label">本月新增平台</div>
          <div class="summary-sub">Amazon Appstore</div>
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
              <td class="num val-highlight">496</td>
              <td class="num val-green">$3,847</td>
              <td class="num val-teal">$2,156</td>
              <td class="num val-purple">$1,691</td>
              <td class="num">56%</td>
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
              <td class="num">0</td>
              <td class="num val-green">$2,340</td>
              <td class="num val-teal">$1,890</td>
              <td class="num val-purple">$450</td>
              <td class="num">100%</td>
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
