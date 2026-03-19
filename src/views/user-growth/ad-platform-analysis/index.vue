<template>
  <div ref="rootRef" class="finance-screen-root art-full-height">
    <div
      class="finance-screen-wrap"
      :style="{
        width: `${designWidth}px`,
        transform: `scale(${scale})`,
        transformOrigin: '0 0'
      }"
    >
      <!-- 顶栏：日期 + 筛选 + 导出 -->
      <header class="finance-header">
        <div class="header-left">{{ currentTime }}</div>
        <div class="header-right">
          <div class="header-filters">
            <el-select
              v-model="filters.app"
              class="aps-filter-select"
              popper-class="aps-filter-popper"
              :teleported="false"
              :fit-input-width="true"
              :placeholder="filtersPlaceholders.app"
            >
              <el-option
                v-for="opt in appOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>

            <el-select
              v-model="filters.platform"
              class="aps-filter-select"
              popper-class="aps-filter-popper"
              :teleported="false"
              :fit-input-width="true"
              :placeholder="filtersPlaceholders.platform"
            >
              <el-option
                v-for="opt in platformOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>

            <el-select
              v-model="filters.channelKey"
              class="aps-filter-select"
              popper-class="aps-filter-popper"
              :teleported="false"
              :fit-input-width="true"
              :placeholder="filtersPlaceholders.channel"
              filterable
              clearable
            >
              <el-option
                v-for="opt in channelOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </div>
          <button type="button" class="btn-export">导出报表</button>
        </div>
      </header>

      <!-- 第一排：广告平台 KPI 卡片 -->
      <section class="row row-1">
        <div v-for="card in filteredChannelKpiCards" :key="card.id" class="kpi-card">
          <div class="kpi-card-head">
            <span class="kpi-card-name">{{ card.name }}</span>
          </div>
          <div class="kpi-card-roi">
            <span class="roi-value">{{ card.roi }}</span>
            <span class="roi-change" :class="card.roiChangeUp ? 'up' : 'down'">
              {{ card.roiChangeUp ? '+' : '' }}{{ card.roiChange }}%
            </span>
          </div>
          <div class="kpi-card-metrics">
            <span>花费 {{ card.cost }}</span>
            <span>收入 {{ card.revenue }}</span>
            <span>CPI {{ card.cpi }}</span>
          </div>
          <div :ref="(el) => setCardChartRef(card.id, el)" class="kpi-card-mini-chart"></div>
        </div>
      </section>

      <!-- 第二排：ROI 趋势 | 用户质量热力图 | 广告平台质量雷达 -->
      <section class="row row-2">
        <div class="panel panel-trend">
          <div class="panel-title">广告平台ROI趋势分析 (最近30天)</div>
          <div ref="roiTrendRef" class="chart-dom"></div>
        </div>
        <div class="panel panel-heatmap">
          <div class="panel-title">用户质量热力图</div>
          <div class="heatmap-wrap">
            <div ref="qualityHeatmapRef" class="chart-dom quality-heatmap-dom"></div>
          </div>
        </div>
      </section>

      <!-- 第三排：广告平台指标比较详情表格 -->
      <section class="row row-3">
        <div class="panel panel-table">
          <div class="panel-title">广告平台指标比较详情</div>
          <div class="table-wrap">
            <ArtTable
              :data="paginatedMetrics"
              :columns="detailColumns as any"
              row-key="channel"
              :stripe="false"
              :border="false"
              size="default"
              :header-cell-style="{
                color: 'var(--aps-table-header-text)',
                fontSize: '12px',
                padding: '6px 0',
                borderBottom: '1px solid var(--aps-table-divider-strong)'
              }"
              :cell-style="{
                background: 'transparent',
                color: 'var(--aps-text-secondary)',
                fontSize: '12px',
                padding: '6px 0',
                borderBottom: '1px solid var(--aps-table-divider-weak)'
              }"
              :pagination="{
                current: currentPage,
                size: pageSize,
                total: sortedChannelMetrics.length
              }"
              :paginationOptions="{ align: 'center', pageSizes: [10, 20, 30], background: false }"
              @pagination:current-change="(p: number) => (currentPage = p)"
              @pagination:size-change="onPageSizeChange"
              @sort-change="onSortChange"
            >
              <template #roi="{ row }">
                <span class="detail-cell">
                  <span>{{ row.roi }}</span>
                  <span class="mini-bar" :class="row.roiTrendUp ? 'up' : 'down'"></span>
                </span>
              </template>
              <template #cpi="{ row }">
                <span class="detail-cell">
                  <span>${{ row.cpi }}</span>
                  <span class="mini-bar" :class="row.cpiTrendUp ? 'down' : 'up'"></span>
                </span>
              </template>
              <template #userQualityD7="{ row }">
                <span class="detail-cell">
                  <span>{{ row.userQualityD7 }}%</span>
                  <span class="arrow" :class="row.userQualityD7TrendUp ? 'up' : 'down'">{{
                    row.userQualityD7TrendUp ? '↑' : '↓'
                  }}</span>
                  <span class="mini-bar" :class="row.userQualityD7TrendUp ? 'up' : 'down'"></span>
                </span>
              </template>
              <template #userQualityPay="{ row }">
                <span class="detail-cell">
                  <span>{{ row.userQualityPay }}%</span>
                  <span class="arrow" :class="row.userQualityPayTrendUp ? 'up' : 'down'">{{
                    row.userQualityPayTrendUp ? '↑' : '↓'
                  }}</span>
                  <span class="mini-bar" :class="row.userQualityPayTrendUp ? 'up' : 'down'"></span>
                </span>
              </template>
              <template #status="{ row }">
                <span class="detail-cell">
                  <span class="status-dot" :class="row.status"></span>
                  {{ statusText(row.status) }}
                </span>
              </template>
            </ArtTable>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts" name="AdPlatformAnalysis">
  import { ref, computed, nextTick, onMounted, onUnmounted, watch } from 'vue'
  import { useChart } from '@/hooks/core/useChart'
  import { graphic, type EChartsOption } from '@/plugins/echarts'
  import type { ColumnOption } from '@/types'
  import { getAppNow } from '@/utils/app-now'
  import {
    MOCK_CHANNEL_KPI_CARDS,
    MOCK_CHANNEL_ROI_TREND,
    MOCK_USER_QUALITY_HEATMAP,
    MOCK_CHANNEL_METRICS,
    type ChannelKpiCard,
    type ChannelMetricRow,
    type ChannelStatus
  } from './mock'

  defineOptions({ name: 'FinanceScreen' })

  // 对齐 Axure 原型画布尺寸（styles.css: body width 1700, base height 1237）
  const designWidth = 1700
  // const designHeight = 1237
  const pageSize = ref(10)

  const rootRef = ref<HTMLElement>()
  const scale = ref(1)
  const updateScale = () => {
    const el = rootRef.value
    if (!el) return
    const w = el.clientWidth
    if (w <= 0) return
    scale.value = w / designWidth
  }

  const currentTime = ref('')
  const updateTime = () => {
    const now = getAppNow()
    const week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][now.getDay()]
    currentTime.value = `今天${week}, ${now.getFullYear()}年${String(now.getMonth() + 1).padStart(2, '0')}月${String(now.getDate()).padStart(2, '0')}日`
  }
  let timeTimer: ReturnType<typeof setInterval> | null = null

  const channelKpiCards = ref<ChannelKpiCard[]>(MOCK_CHANNEL_KPI_CARDS)
  const userQualityHeatmap = ref(MOCK_USER_QUALITY_HEATMAP)
  const channelMetrics = ref<ChannelMetricRow[]>(MOCK_CHANNEL_METRICS)

  type SelectOption<T extends string = string> = { label: string; value: T }

  const filters = ref({
    app: 'all' as string,
    platform: 'all' as string,
    channelKey: 'all' as string
  })

  const filtersPlaceholders = {
    app: '全部Apps',
    platform: 'IOS & Android',
    channel: '全部广告平台'
  } as const

  const appOptions = computed<SelectOption[]>(() => [
    { label: '全部Apps', value: 'all' },
    // Mock 数据暂未包含 app 维度，这里先提供示例选项（后端接入时替换为接口返回）
    { label: 'App A', value: 'app_a' },
    { label: 'App B', value: 'app_b' }
  ])

  const platformOptions = computed<SelectOption[]>(() => [
    { label: 'IOS & Android', value: 'all' },
    // Mock 数据暂未包含 platform 维度，这里先提供示例选项（后端接入时替换为接口返回）
    { label: 'iOS', value: 'ios' },
    { label: 'Android', value: 'android' }
  ])

  function normalizeChannelKey(name: string) {
    return name
      .toLowerCase()
      .replace(/\s+ads\b/g, '')
      .replace(/[^\w]+/g, '')
  }

  const channelOptions = computed<SelectOption[]>(() => {
    const labels = new Map<string, string>()
    channelKpiCards.value.forEach((c) => labels.set(normalizeChannelKey(c.name), c.name))
    userQualityHeatmap.value.forEach((r) => labels.set(normalizeChannelKey(r.channel), r.channel))
    channelMetrics.value.forEach((r) => labels.set(normalizeChannelKey(r.channel), r.channel))
    MOCK_CHANNEL_ROI_TREND.series.forEach((s) => labels.set(normalizeChannelKey(s.name), s.name))

    const items = Array.from(labels.entries())
      .map(([key, label]) => ({ label, value: key }))
      .sort((a, b) => a.label.localeCompare(b.label))

    return [{ label: '全部广告平台', value: 'all' }, ...items]
  })

  const selectedChannelKey = computed(() =>
    filters.value.channelKey && filters.value.channelKey !== '' ? filters.value.channelKey : 'all'
  )

  const filteredChannelKpiCards = computed(() => {
    if (selectedChannelKey.value === 'all') return channelKpiCards.value
    return channelKpiCards.value.filter(
      (c) => normalizeChannelKey(c.name) === selectedChannelKey.value
    )
  })

  const filteredUserQualityHeatmap = computed(() => {
    if (selectedChannelKey.value === 'all') return userQualityHeatmap.value
    return userQualityHeatmap.value.filter(
      (r) => normalizeChannelKey(r.channel) === selectedChannelKey.value
    )
  })

  const filteredChannelMetrics = computed(() => {
    if (selectedChannelKey.value === 'all') return channelMetrics.value
    return channelMetrics.value.filter(
      (r) => normalizeChannelKey(r.channel) === selectedChannelKey.value
    )
  })

  type SortOrder = 'ascending' | 'descending' | null
  const sortState = ref<{ prop: keyof ChannelMetricRow | null; order: SortOrder }>({
    prop: null,
    order: null
  })

  function parseAbbrNumber(input: unknown) {
    const s = String(input ?? '').trim()
    const m = s.match(/-?\d+(?:\.\d+)?/)
    if (!m) return Number.NaN
    const n = Number(m[0])
    const upper = s.toUpperCase()
    const factor = upper.includes('B')
      ? 1e9
      : upper.includes('M')
        ? 1e6
        : upper.includes('K')
          ? 1e3
          : 1
    return n * factor
  }

  function getSortValue(row: ChannelMetricRow, prop: keyof ChannelMetricRow) {
    switch (prop) {
      case 'cost':
      case 'revenue':
      case 'installs':
        return parseAbbrNumber(row[prop])
      case 'status': {
        const rank: Record<ChannelStatus, number> = { excellent: 3, average: 2, poor: 1 }
        return rank[row.status] ?? 0
      }
      default:
        return row[prop] as any
    }
  }

  const sortedChannelMetrics = computed(() => {
    const list = [...filteredChannelMetrics.value]
    const { prop, order } = sortState.value
    if (!prop || !order) return list

    const dir = order === 'ascending' ? 1 : -1
    return list.sort((a, b) => {
      const av = getSortValue(a, prop)
      const bv = getSortValue(b, prop)

      if (typeof av === 'number' && typeof bv === 'number') {
        const aNum = Number.isNaN(av) ? -Infinity : av
        const bNum = Number.isNaN(bv) ? -Infinity : bv
        return (aNum - bNum) * dir
      }
      return String(av ?? '').localeCompare(String(bv ?? '')) * dir
    })
  })

  const filteredRoiTrend = computed(() => {
    if (selectedChannelKey.value === 'all') return MOCK_CHANNEL_ROI_TREND
    return {
      dates: MOCK_CHANNEL_ROI_TREND.dates,
      series: MOCK_CHANNEL_ROI_TREND.series.filter(
        (s) => normalizeChannelKey(s.name) === selectedChannelKey.value
      )
    }
  })

  const currentPage = ref(1)
  const paginatedMetrics = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return sortedChannelMetrics.value.slice(start, start + pageSize.value)
  })

  type SortableColumnOption<T = any> = Omit<ColumnOption<T>, 'sortable'> & {
    sortable?: boolean | 'custom'
  }
  const detailColumns = computed(() => {
    const customSortable = 'custom' as const
    return [
      { label: '广告平台名称', prop: 'channel', minWidth: 140, sortable: customSortable },
      { label: '花费', prop: 'cost', minWidth: 90, sortable: customSortable },
      { label: '收入', prop: 'revenue', minWidth: 90, sortable: customSortable },
      { label: 'ROI', prop: 'roi', minWidth: 90, useSlot: true, sortable: customSortable },
      { label: 'ROAS', prop: 'roas', minWidth: 80, sortable: customSortable },
      { label: 'CPI', prop: 'cpi', minWidth: 90, useSlot: true, sortable: customSortable },
      { label: '安装量', prop: 'installs', minWidth: 80, sortable: customSortable },
      {
        label: 'User Quality (D7)',
        prop: 'userQualityD7',
        minWidth: 140,
        useSlot: true,
        sortable: customSortable
      },
      {
        label: 'User Quality(Pay%)',
        prop: 'userQualityPay',
        minWidth: 160,
        useSlot: true,
        sortable: customSortable
      },
      {
        label: 'LTV_7',
        prop: 'ltv7',
        minWidth: 90,
        sortable: customSortable,
        formatter: (row: ChannelMetricRow) => `$${row.ltv7.toFixed(2)}`
      },
      {
        label: 'LTV_30',
        prop: 'ltv30',
        minWidth: 90,
        sortable: customSortable,
        formatter: (row: ChannelMetricRow) => `$${row.ltv30.toFixed(2)}`
      },
      {
        label: '状态/Status',
        prop: 'status',
        minWidth: 110,
        useSlot: true,
        sortable: customSortable
      }
    ] as SortableColumnOption<ChannelMetricRow>[]
  })

  function onPageSizeChange(size: number) {
    pageSize.value = size
    currentPage.value = 1
  }

  function onSortChange(payload: { column: any; prop: string; order: SortOrder }) {
    sortState.value = {
      prop: (payload.prop as keyof ChannelMetricRow) || null,
      order: payload.order ?? null
    }
    currentPage.value = 1
  }

  function statusText(s: ChannelStatus) {
    const map: Record<ChannelStatus, string> = { excellent: '优秀', average: '一般', poor: '较差' }
    return map[s] ?? s
  }

  /**
   * 热力图分档配色（对齐原型 styles.css）
   * - 绿: rgba(16,185,129,1)
   * - 橄榄绿: rgba(105,159,18,1)
   * - 橙: rgba(245,158,11,1)
   * - 红: rgba(239,68,68,1)
   */
  type HeatmapMetric = 'd1' | 'd7' | 'd30' | 'pay' | 'arpu'
  function heatmapCellClass(value: number, metric: HeatmapMetric) {
    const rules: Record<HeatmapMetric, [number, number, number]> = {
      // [绿阈值, 橄榄绿阈值, 橙阈值]，其余为红
      d1: [60, 50, 40],
      d7: [50, 35, 25],
      d30: [25, 16, 10],
      pay: [6, 4, 3],
      arpu: [3.2, 2.6, 2.1]
    }
    const [tGreen, tOlive, tOrange] = rules[metric]
    if (value >= tGreen) return 'lv-green'
    if (value >= tOlive) return 'lv-olive'
    if (value >= tOrange) return 'lv-orange'
    return 'lv-red'
  }

  const qualityHeatmapRef = ref<HTMLElement>()
  const chartQualityHeatmap = useChart()

  function heatmapColorByLevel(level: string) {
    switch (level) {
      case 'lv-green':
        return 'rgba(16, 185, 129, 1)'
      case 'lv-olive':
        return 'rgba(105, 159, 18, 1)'
      case 'lv-orange':
        return 'rgba(245, 158, 11, 1)'
      default:
        return 'rgba(239, 68, 68, 1)'
    }
  }

  function buildQualityHeatmapOption(): EChartsOption {
    const metrics: { key: HeatmapMetric; label: string; format: (v: number) => string }[] = [
      { key: 'd1', label: 'D1留存', format: (v) => `${v}%` },
      { key: 'd7', label: 'D7留存', format: (v) => `${v}%` },
      { key: 'd30', label: 'D30留存', format: (v) => `${v}%` },
      { key: 'pay', label: '付费率', format: (v) => `${v}%` },
      { key: 'arpu', label: 'ARPU', format: (v) => `$${v.toFixed(2)}` }
    ]

    const channels = filteredUserQualityHeatmap.value.map((r) => r.channel)
    // value: [x, y, 展示文本, 颜色档位, 广告平台, 指标名, 原始数值]
    const data: [number, number, string, string, string, string, number][] = []
    filteredUserQualityHeatmap.value.forEach((row, y) => {
      metrics.forEach((m, x) => {
        const raw =
          m.key === 'd1'
            ? row.d1Retention
            : m.key === 'd7'
              ? row.d7Retention
              : m.key === 'd30'
                ? row.d30Retention
                : m.key === 'pay'
                  ? row.payRate
                  : row.arpu
        const level = heatmapCellClass(raw, m.key)
        data.push([x, y, m.format(raw), level, row.channel, m.label, raw])
      })
    })

    return {
      grid: { left: 96, right: 12, top: 34, bottom: 8 },
      tooltip: {
        show: true,
        trigger: 'item',
        confine: true,
        backgroundColor: 'rgba(31, 45, 61, 0.92)',
        borderColor: 'rgba(51, 65, 85, 1)',
        borderWidth: 1,
        textStyle: { color: '#E2E8F0', fontSize: 12 },
        formatter: (p: any) => {
          const v = (p?.value ?? []) as any[]
          const channel = String(v[4] ?? '')
          const metric = String(v[5] ?? '')
          const text = String(v[2] ?? '')
          if (!channel || !metric) return text
          return `${channel}<br/>${metric}: ${text}`
        }
      },
      xAxis: {
        type: 'category',
        position: 'top',
        data: metrics.map((m) => m.label),
        axisTick: { show: false },
        axisLine: { show: false },
        splitLine: { show: false },
        axisLabel: { color: '#94A3B8', fontSize: 14 }
      },
      yAxis: {
        type: 'category',
        data: channels,
        axisTick: { show: false },
        axisLine: { show: false },
        splitLine: { show: false },
        axisLabel: { color: '#E2E8F0', fontSize: 14 }
      },
      series: [
        {
          type: 'custom',
          data,
          renderItem: (params: any, api: any) => {
            const x = api.value(0) as number
            const y = api.value(1) as number
            const text = api.value(2) as string
            const level = api.value(3) as string
            const p = api.coord([x, y]) as [number, number]
            const size = api.size([1, 1]) as [number, number]
            const cellW = size[0]

            const pillW = Math.max(56, Math.min(110, cellW - 4))
            const pillH = 32

            return {
              type: 'group',
              children: [
                {
                  type: 'rect',
                  shape: {
                    x: p[0] - pillW / 2,
                    y: p[1] - pillH / 2,
                    width: pillW,
                    height: pillH,
                    r: 8
                  },
                  style: {
                    fill: heatmapColorByLevel(level),
                    cursor: 'pointer'
                  },
                  emphasis: {
                    style: {
                      // 悬浮高亮（轻量动画效果）
                      lineWidth: 2,
                      stroke: 'rgba(255, 255, 255, 0.65)',
                      shadowBlur: 10,
                      shadowColor: 'rgba(0, 0, 0, 0.55)',
                      shadowOffsetY: 2
                    }
                  }
                },
                {
                  type: 'text',
                  style: {
                    x: p[0],
                    y: p[1],
                    text,
                    fill: '#FFFEFE',
                    fontSize: 14,
                    fontFamily:
                      "'PingFang SC', Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, 'Microsoft YaHei', sans-serif",
                    align: 'center',
                    verticalAlign: 'middle'
                  }
                }
              ]
            }
          }
        }
      ]
    }
  }

  const cardChartRefs = ref<Record<string, HTMLElement>>({})
  function setCardChartRef(id: string, el: unknown) {
    if (el instanceof HTMLElement) {
      cardChartRefs.value[id] = el
    } else if (el === null) {
      delete cardChartRefs.value[id]
    }
  }

  const roiTrendRef = ref<HTMLElement>()

  const chartRoiTrend = useChart()
  function getApsCssVar(name: string, fallback: string) {
    const el = rootRef.value ?? document.documentElement
    const v = getComputedStyle(el).getPropertyValue(name).trim()
    return v || fallback
  }

  function getChartTheme() {
    return {
      color1: '#4ABEFF',
      color2: '#14DEBA',
      color3: '#9a60b4',
      color4: '#e6c547',
      color5: '#5b8ff9',
      axis: getApsCssVar('--aps-chart-axis', '#64748b'),
      label: getApsCssVar('--aps-chart-label', '#334155'),
      split: getApsCssVar('--aps-chart-split', 'rgba(15, 23, 42, 0.08)'),
      axisLine: getApsCssVar('--aps-chart-axis-line', 'rgba(15, 23, 42, 0.18)')
    }
  }

  // KPI 卡片迷你趋势图（必须在 setup 同步创建，避免 useChart 生命周期警告）
  // 注意：不要放进 reactive/ref 对象里，否则内部 chartRef 会被 Vue 解包导致 .value 赋值报错
  const kpiMiniCharts = new Map<string, ReturnType<typeof useChart>>()
  channelKpiCards.value.forEach((card) => kpiMiniCharts.set(card.id, useChart()))

  function buildMiniTrendOption(data: number[]): EChartsOption {
    const theme = getChartTheme()
    return {
      grid: { left: 2, right: 2, top: 2, bottom: 2 },
      xAxis: { type: 'category', data: data.map((_, i) => i), show: false },
      yAxis: {
        type: 'value',
        show: false,
        scale: true,
        min: (v: { min: number }) => v.min * 0.9,
        max: (v: { max: number }) => v.max * 1.1
      },
      series: [
        {
          type: 'line',
          data,
          smooth: true,
          symbol: 'none',
          lineStyle: { color: theme.color1, width: 1.5 },
          areaStyle: { color: theme.color1, opacity: 0.3 }
        }
      ]
    }
  }

  function buildRoiTrendOption(): EChartsOption {
    const d = filteredRoiTrend.value
    const theme = getChartTheme()
    const colors = [theme.color1, theme.color2, theme.color3, theme.color4, theme.color5]

    const colorWithAlpha = (color: string, alpha: number) => {
      const raw = color.trim()

      // hex: #RGB/#RRGGBB
      if (raw.startsWith('#')) {
        const hex = raw.slice(1)
        const full =
          hex.length === 3
            ? hex
                .split('')
                .map((c) => c + c)
                .join('')
            : hex
        if (full.length === 6) {
          const r = Number.parseInt(full.slice(0, 2), 16)
          const g = Number.parseInt(full.slice(2, 4), 16)
          const b = Number.parseInt(full.slice(4, 6), 16)
          return `rgba(${r}, ${g}, ${b}, ${alpha})`
        }
      }

      // rgb()/rgba()
      const m = raw.match(
        /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(\d*\.?\d+))?\s*\)$/i
      )
      if (m) {
        const r = Math.min(255, Math.max(0, Number(m[1])))
        const g = Math.min(255, Math.max(0, Number(m[2])))
        const b = Math.min(255, Math.max(0, Number(m[3])))
        return `rgba(${r}, ${g}, ${b}, ${alpha})`
      }

      // 其他格式（变量色/命名色）：用 opacity 控制可能会更稳，但渐变 stop 需要具体颜色
      // 这里兜底直接返回，至少不影响折线本身
      return raw
    }

    return {
      tooltip: { trigger: 'axis' },
      legend: { show: false },
      grid: { left: 50, right: 24, top: 24, bottom: 36 },
      xAxis: {
        type: 'category',
        data: d.dates,
        axisLine: { lineStyle: { color: theme.axisLine } },
        axisLabel: { color: theme.axis, fontSize: 11 }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 2,
        axisLine: { show: false },
        splitLine: { lineStyle: { color: theme.split } },
        axisLabel: { color: theme.axis, fontSize: 11 }
      },
      series: d.series.map((s, i) => ({
        type: 'line',
        name: s.name,
        data: s.data,
        smooth: true,
        symbol: 'circle',
        symbolSize: 4,
        lineStyle: { color: colors[i % colors.length], width: 2 },
        itemStyle: { color: colors[i % colors.length] },
        areaStyle: {
          color: new graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: colorWithAlpha(colors[i % colors.length], 0.35) },
            { offset: 1, color: colorWithAlpha(colors[i % colors.length], 0) }
          ])
        }
      }))
    }
  }

  let resizeObserver: ResizeObserver | null = null

  onMounted(() => {
    updateScale()
    updateTime()
    timeTimer = setInterval(updateTime, 1000)
    if (rootRef.value) {
      resizeObserver = new ResizeObserver(() => updateScale())
      resizeObserver.observe(rootRef.value)
    }
    window.addEventListener('resize', updateScale)

    nextTick(() => {
      // 每个 KPI 卡片的迷你趋势图
      filteredChannelKpiCards.value.forEach((card) => {
        const el = cardChartRefs.value[card.id]
        if (el) {
          const chart = kpiMiniCharts.get(card.id)
          if (!chart) return
          chart.chartRef!.value = el
          chart.initChart(buildMiniTrendOption(card.trendData))
        }
      })
      if (roiTrendRef.value) {
        chartRoiTrend.chartRef!.value = roiTrendRef.value
        chartRoiTrend.initChart(buildRoiTrendOption())
      }
      if (qualityHeatmapRef.value) {
        chartQualityHeatmap.chartRef!.value = qualityHeatmapRef.value
        chartQualityHeatmap.initChart(buildQualityHeatmapOption())
      }
    })
  })

  // 筛选变化：重置分页 + 更新图表（KPI mini / ROI 趋势 / 热力图）
  watch(
    () => [filters.value.app, filters.value.platform, selectedChannelKey.value],
    async () => {
      currentPage.value = 1
      await nextTick()

      // KPI mini charts 仅更新当前可见卡片
      filteredChannelKpiCards.value.forEach((card) => {
        const el = cardChartRefs.value[card.id]
        const chart = kpiMiniCharts.get(card.id)
        if (el && chart) {
          chart.chartRef!.value = el
          chart.updateChart(buildMiniTrendOption(card.trendData))
        }
      })

      chartRoiTrend.updateChart(buildRoiTrendOption())
      chartQualityHeatmap.updateChart(buildQualityHeatmapOption())
    },
    { deep: false }
  )

  onUnmounted(() => {
    if (timeTimer) clearInterval(timeTimer)
    if (resizeObserver && rootRef.value) {
      resizeObserver.unobserve(rootRef.value)
      resizeObserver = null
    }
    window.removeEventListener('resize', updateScale)
    kpiMiniCharts.forEach((c) => c.destroyChart?.())
    chartRoiTrend.destroyChart?.()
    chartQualityHeatmap.destroyChart?.()
  })
</script>

<style lang="scss" scoped>
  /* ========== 设计变量（与原型/设计图一致，便于统一修改） ========== */

  /**
   * 主题适配说明
   * - 项目通过 `html.dark` 控制暗黑模式
   * - 本页用 CSS 变量承载配色：默认作为深色（与当前页面设计一致）；在明确的 Light 条件下覆盖为浅色
   *   这样可以避免暗黑选择器偶发未命中时，页面退回白底/浅色的情况
   */
  .finance-screen-root {
    /* Dark (default - 与原页面一致) */
    --aps-bg: #0f1419;
    --aps-text-primary: #e2e8f0;
    --aps-text-secondary: #e2e8f0;
    --aps-text-muted: #94a3b8;
    --aps-accent: #4abeff;
    --aps-success: #14deba;
    --aps-danger: #f56c6c;
    --aps-warning: #e6a23c;
    --aps-slate-700: #334155;
    --aps-text-axure: #e2e8f0;
    --aps-border-axure: #334155;
    --aps-border-subtle: rgb(255 255 255 / 6%);
    --aps-border-subtle-10: rgb(255 255 255 / 10%);
    --aps-border-accent: rgb(74 190 255 / 20%);
    --aps-table-divider-strong: rgb(51 65 85 / 60%);
    --aps-table-divider-weak: rgb(51 65 85 / 35%);
    --aps-bg-card: rgb(255 255 255 / 3%);
    --aps-bg-panel: rgb(255 255 255 / 2%);
    --aps-bg-header: rgb(74 190 255 / 4%);
    --aps-bg-btn-export: rgb(74 190 255 / 12%);
    --aps-bg-btn-export-hover: rgb(74 190 255 / 20%);
    --aps-bg-table-header: rgb(0 0 0 / 20%);
    --aps-bg-page-btn: rgb(255 255 255 / 6%);
    --aps-bg-page-btn-active: rgb(74 190 255 / 25%);
    --aps-bg-row-hover: rgb(255 255 255 / 3%);
    --aps-bg-page-btn-hover: rgb(74 190 255 / 15%);
    --aps-border-page-btn-hover: rgb(74 190 255 / 30%);
    --aps-panel-gradient: linear-gradient(135deg, #1f2d3d 0%, #000 100%);
    --aps-table-header-gradient: linear-gradient(
      90deg,
      #204493 0%,
      #374188 12.5%,
      #503f7d 25%,
      #663c73 37.5%,
      #733b6d 50%,
      #7d3a69 62.5%,
      #863964 75%,
      #8c3861 87.5%,
      #8f3860 100%
    );

    /* KPI card gradients (dark - 原始值) */
    --aps-kpi-g1: linear-gradient(135deg, #2356a2 0%, #242641 100%);
    --aps-kpi-g2: linear-gradient(135deg, #25859d 0%, #1c2a43 100%);
    --aps-kpi-g3: linear-gradient(135deg, #8f3860 0%, #242641 100%);
    --aps-kpi-g4: linear-gradient(135deg, #896228 0%, #242641 100%);
    --aps-kpi-g5: linear-gradient(135deg, #893528 0%, #242641 100%);
    --aps-chart-axis: #8b9dc3;
    --aps-chart-label: #b8c5d9;
    --aps-chart-split: rgb(255 255 255 / 6%);
    --aps-chart-axis-line: rgb(255 255 255 / 20%);

    /* 表头文字色：深色模式用白色系 */
    --aps-table-header-text: var(--aps-text-primary);

    /* ========== 根布局（合并，避免重复 selector） ========== */
    position: relative;
    box-sizing: border-box;
    width: 100%;
    height: var(--art-full-height, calc(100vh - 120px));
    overflow: auto;
    background: var(--aps-bg);
  }

  :global(html:not(.dark) .finance-screen-root) {
    /* Light override */
    --aps-bg: #f6f8fb;
    --aps-text-primary: #0f172a;
    --aps-text-secondary: #0f172a;
    --aps-text-muted: #64748b;
    --aps-accent: #2563eb;
    --aps-success: #10b981;
    --aps-danger: #ef4444;
    --aps-warning: #f59e0b;
    --aps-slate-700: #e2e8f0; /* 筛选/按钮底色（浅色用浅灰） */
    --aps-text-axure: #0f172a;
    --aps-border-axure: rgb(15 23 42 / 14%);
    --aps-border-subtle: rgb(15 23 42 / 8%);
    --aps-border-subtle-10: rgb(15 23 42 / 12%);
    --aps-border-accent: rgb(37 99 235 / 22%);
    --aps-table-divider-strong: rgb(15 23 42 / 18%);
    --aps-table-divider-weak: rgb(15 23 42 / 12%);
    --aps-bg-card: rgb(255 255 255 / 92%);
    --aps-bg-panel: rgb(255 255 255 / 95%);
    --aps-bg-header: rgb(37 99 235 / 6%);
    --aps-bg-btn-export: rgb(37 99 235 / 12%);
    --aps-bg-btn-export-hover: rgb(37 99 235 / 18%);
    --aps-bg-table-header: rgb(15 23 42 / 4%);
    --aps-bg-page-btn: rgb(15 23 42 / 6%);
    --aps-bg-page-btn-active: rgb(37 99 235 / 18%);
    --aps-bg-row-hover: rgb(37 99 235 / 6%);
    --aps-bg-page-btn-hover: rgb(37 99 235 / 12%);
    --aps-border-page-btn-hover: rgb(37 99 235 / 22%);
    --aps-panel-gradient: linear-gradient(135deg, #fff 0%, #f3f5f9 100%);
    --aps-table-header-gradient: linear-gradient(90deg, #eef2ff 0%, #f5f3ff 50%, #fff1f2 100%);

    /* KPI card gradients (light) */
    --aps-kpi-g1: linear-gradient(135deg, #e8f0ff 0%, #fff 100%);
    --aps-kpi-g2: linear-gradient(135deg, #e6fffb 0%, #fff 100%);
    --aps-kpi-g3: linear-gradient(135deg, #ffeaf2 0%, #fff 100%);
    --aps-kpi-g4: linear-gradient(135deg, #fff4e5 0%, #fff 100%);
    --aps-kpi-g5: linear-gradient(135deg, #ffe9e5 0%, #fff 100%);
    --aps-chart-axis: #64748b;
    --aps-chart-label: #334155;
    --aps-chart-split: rgb(15 23 42 / 8%);
    --aps-chart-axis-line: rgb(15 23 42 / 18%);

    /* 浅色模式表头文字色保持偏灰 */
    --aps-table-header-text: var(--aps-text-muted);
  }

  /* 原型底色：rgba(15, 20, 25, 1) */
  $color-bg: var(--aps-bg);
  $color-bg-gradient-from: var(--aps-bg);

  /* 原型主文字：#E2E8F0，次级/表头：#94A3B8 */
  $color-text-primary: var(--aps-text-primary);
  $color-text-secondary: var(--aps-text-secondary);
  $color-text-muted: var(--aps-text-muted);
  $color-accent: var(--aps-accent);
  $color-success: var(--aps-success);
  $color-danger: var(--aps-danger);
  $color-warning: var(--aps-warning);
  $color-slate-700: var(--aps-slate-700); /* 原型主按钮/筛选底色 */
  $color-text-axure: var(--aps-text-axure); /* 原型常用文字色 */
  $border-card: var(--aps-border-subtle);
  $border-subtle: var(--aps-border-subtle);
  $border-subtle-10: var(--aps-border-subtle-10);
  $border-accent: var(--aps-border-accent);
  $border-axure: var(--aps-border-axure); /* 原型描边：rgba(51,65,85,1) */
  $bg-card: var(--aps-bg-card);
  $bg-panel: var(--aps-bg-panel);
  $bg-header: var(--aps-bg-header);
  $bg-btn-export: var(--aps-bg-btn-export);
  $bg-btn-export-hover: var(--aps-bg-btn-export-hover);
  $bg-table-header: var(--aps-bg-table-header);
  $bg-page-btn: var(--aps-bg-page-btn);
  $bg-page-btn-active: var(--aps-bg-page-btn-active);
  $radius-card: 8px;
  $radius-btn: 6px;
  $radius-page: 4px;
  $font-size-title: 14px;
  $font-size-body: 12px;
  $font-size-small: 13px;
  $font-size-roi: 26px;

  /* 趋势指示颜色：上升绿、下降红（文字/边框） */
  @mixin trend-colors {
    &.up {
      color: $color-success;
    }

    &.down {
      color: $color-danger;
    }
  }

  /* 趋势指示颜色：背景（mini-bar 等） */
  @mixin trend-colors-bg {
    &.up {
      background: $color-success;
    }

    &.down {
      background: $color-danger;
    }
  }

  /* 区块标题（KPI 卡片名、面板标题） */
  @mixin section-title {
    font-size: $font-size-title;
    font-weight: 600;
    color: $color-text-secondary;
  }

  /* 卡片/面板基类 */
  @mixin data-card-base {
    padding: 14px;
    background: $bg-card;
    border: 2px solid $border-axure;
    border-radius: $radius-card;
  }

  /* 表格基类 */
  @mixin table-base {
    width: 100%;
    font-size: $font-size-body;
    border-collapse: collapse;

    th {
      font-weight: 500;
      color: $color-text-muted;
      background: transparent;
    }
  }

  /* ========== 根布局 ========== */
  .finance-screen-wrap {
    position: absolute;
    top: 0;
    left: 0;

    /* 原型为固定画布，内部用绝对定位的“边距感” */
    padding: 0;
    background: $color-bg;
  }

  /* ========== 顶栏 ========== */
  .finance-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    /* 原型顶栏没有包裹面板：仅做“定位区” */
    padding: 15px 13px 0;
    margin-bottom: 13px;
    background: transparent;
    border: 0;
  }

  .header-left {
    font-family:
      'PingFang SC',
      Inter,
      system-ui,
      -apple-system,
      'Segoe UI',
      Roboto,
      Arial,
      'Microsoft YaHei',
      sans-serif;
    font-size: 14px;
    color: $color-text-axure;
  }

  .header-right {
    display: flex;
    flex-wrap: nowrap;
    gap: 10px;
    align-items: center;
    justify-content: flex-end;
  }

  .header-filters {
    display: flex;
    flex-wrap: nowrap;
    gap: 10px;
    align-items: center;
    font-size: 14px;
    color: $color-text-axure;

    .filter-divider {
      display: none;
    }

    :deep(.aps-filter-select) {
      width: 150px;
    }

    /* Element Plus v2：用 wrapper 模拟原型的“pill 下拉” */
    :deep(.aps-filter-select .el-select__wrapper) {
      min-height: 36px;
      padding: 0 10px;
      color: $color-text-axure;
      background: $color-slate-700;
      border: 1px solid $color-slate-700;
      border-radius: 12px; /* 原型下拉为 12px */
      box-shadow: none;
    }

    :deep(.aps-filter-select .el-select__selected-item) {
      color: $color-text-axure;
    }

    :deep(.aps-filter-select .el-select__placeholder) {
      color: $color-text-axure;
      opacity: 0.85;
    }

    :deep(.aps-filter-select .el-select__caret) {
      color: $color-text-axure;
    }

    :deep(.aps-filter-select .el-select__wrapper.is-focused) {
      border-color: rgb(74 190 255 / 55%);
    }
  }

  .header-right .btn-export {
    height: 36px;
    padding: 0 16px;
    font-family:
      'PingFang SC',
      Inter,
      system-ui,
      -apple-system,
      'Segoe UI',
      Roboto,
      Arial,
      'Microsoft YaHei',
      sans-serif;
    font-size: 14px;
    color: $color-text-axure;
    cursor: pointer;
    background: $color-slate-700; /* 原型：rgba(51,65,85,1) */
    border: 1px solid $color-slate-700;
    border-radius: 8px; /* 原型导出按钮为 8px */

    &:hover {
      filter: brightness(1.06);
    }
  }

  /* ========== 通用区块与数据卡片基类 ========== */
  .row {
    display: flex;
    gap: 16px;
    margin-bottom: 16px;
  }

  .row-1 {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 16px;
  }

  .kpi-card {
    @include data-card-base;

    position: relative;
    min-height: 200px;

    /* KPI 卡片原型为渐变底 + 2px #334155 描边 */
    border-radius: 12px;

    .kpi-card-head {
      margin-bottom: 8px;
    }

    .kpi-card-name {
      @include section-title;
    }

    .kpi-card-roi {
      margin-bottom: 10px;

      .roi-value {
        margin-right: 8px;
        font-size: $font-size-roi;
        font-weight: 700;
        color: $color-text-primary;
      }

      .roi-change {
        font-size: $font-size-small;

        @include trend-colors();
      }
    }

    .kpi-card-metrics {
      display: flex;
      flex-wrap: wrap;
      gap: 8px 12px;
      margin-bottom: 8px;
      font-size: $font-size-body;
      color: $color-text-muted;
    }

    .kpi-card-mini-chart {
      position: absolute;
      right: 14px;
      bottom: 14px;
      left: 14px;
      height: 42px;
    }
  }

  /* KPI 渐变色（来自原型 SVG stop-color） */
  .row-1 .kpi-card:nth-child(1) {
    background: var(--aps-kpi-g1);
  }

  .row-1 .kpi-card:nth-child(2) {
    background: var(--aps-kpi-g2);
  }

  .row-1 .kpi-card:nth-child(3) {
    background: var(--aps-kpi-g3);
  }

  .row-1 .kpi-card:nth-child(4) {
    background: var(--aps-kpi-g4);
  }

  .row-1 .kpi-card:nth-child(5) {
    background: var(--aps-kpi-g5);
  }

  .row-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    min-height: 320px;
  }

  .panel {
    @include data-card-base;

    overflow: hidden;

    /* 面板原型为深色渐变底（如 u2477/u2530） */
    background: var(--aps-panel-gradient);

    .panel-title {
      @include section-title;

      margin-bottom: 10px;
    }

    .chart-dom {
      height: 260px;
      min-height: 200px;
    }
  }

  .panel-heatmap .heatmap-wrap {
    max-height: 260px;
    overflow: auto;
  }

  .quality-heatmap-dom {
    height: 260px;
    min-height: 200px;
  }

  /* ========== 表格通用（热力图 + 详情表） ========== */
  .heatmap-table {
    @include table-base;

    th,
    td {
      padding: 6px 10px;
      text-align: center;
      border: 0;
    }

    .cell-channel {
      color: $color-text-secondary;
      text-align: left;
    }

    /* 原型热力图为“彩色 pill”而非整格染色 */
    .heatmap-pill {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 75px;
      height: 32px;
      padding: 0 10px;
      font-family:
        'PingFang SC',
        Inter,
        system-ui,
        -apple-system,
        'Segoe UI',
        Roboto,
        Arial,
        'Microsoft YaHei',
        sans-serif;
      font-size: 14px;
      color: #fffefe;
      white-space: nowrap;
      border-radius: 8px;
    }

    /* 对齐原型 styles.css 的 4 档底色 */
    .lv-green {
      background-color: rgb(16 185 129 / 100%);
    }

    .lv-olive {
      background-color: rgb(105 159 18 / 100%);
    }

    .lv-orange {
      background-color: rgb(245 158 11 / 100%);
    }

    .lv-red {
      background-color: rgb(239 68 68 / 100%);
    }
  }

  .row-3 {
    display: block;
  }

  .panel-table .table-wrap {
    height: 320px;
    overflow: hidden;
  }

  /* 详情表（ArtTable）紧凑样式 */
  .detail-cell {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    white-space: nowrap;
  }

  .mini-bar {
    display: inline-block;
    width: 24px;
    height: 6px;
    margin-left: 2px;
    vertical-align: middle;
    border-radius: 2px;

    @include trend-colors-bg();
  }

  .arrow {
    margin-left: 2px;

    @include trend-colors();
  }

  .status-dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    margin-right: 4px;
    vertical-align: middle;
    border-radius: 50%;

    &.excellent {
      background: $color-success;
    }

    &.average {
      background: $color-warning;
    }

    &.poor {
      background: $color-danger;
    }
  }

  .panel-table {
    :deep(.art-table) {
      height: 100%;
    }

    :deep(.el-table) {
      margin-top: 6px;
      background: transparent;
    }

    :deep(.el-table__inner-wrapper::before) {
      height: 0;
    }

    /* 表头整行渐变（从左到右） */
    :deep(.el-table__header thead tr) {
      background: var(--aps-table-header-gradient);
    }

    /* 让每个 th 透出整行渐变 */
    :deep(.el-table th.el-table__cell) {
      padding: 6px 0;
      font-size: 12px;
      color: var(--aps-table-header-text);
      background: transparent !important;
      border-bottom: 1px solid var(--aps-table-divider-strong);
    }

    :deep(.el-table td.el-table__cell) {
      padding: 6px 0;
      font-size: 12px;
      color: $color-text-secondary;
      background: transparent;
      border-bottom: 1px solid var(--aps-table-divider-weak);
    }

    :deep(.el-table__cell .cell) {
      padding: 0 8px;
    }

    :deep(.el-table--enable-row-hover .el-table__body tr:hover > td.el-table__cell) {
      background: var(--aps-bg-row-hover);
    }
  }

  /* ========== 分页 ========== */
  .pagination-wrap {
    display: flex;
    gap: 8px;
    align-items: center;
    padding-top: 12px;
    margin-top: 12px;
    font-size: $font-size-body;
    color: $color-text-muted;
    border-top: 1px solid $border-subtle;

    .page-btn {
      min-width: 28px;
      height: 28px;
      padding: 0 6px;
      font-size: $font-size-body;
      color: $color-text-secondary;
      cursor: pointer;
      background: $bg-page-btn;
      border: 1px solid $border-subtle-10;
      border-radius: $radius-page;

      &:hover:not(:disabled) {
        background: var(--aps-bg-page-btn-hover);
        border-color: var(--aps-border-page-btn-hover);
      }

      &:disabled {
        cursor: not-allowed;
        opacity: 0.4;
      }

      &.active {
        color: $color-text-primary;
        background: $bg-page-btn-active;
        border-color: $color-accent;
      }
    }

    .page-size {
      margin-left: 12px;
    }

    .page-jump {
      margin-left: auto;

      input {
        width: 40px;
        padding: 2px 6px;
        margin: 0 4px;
        font-size: $font-size-body;
        color: $color-text-secondary;
        text-align: center;
        background: $bg-page-btn;
        border: 1px solid $border-subtle-10;
        border-radius: $radius-page;
      }
    }
  }
</style>
