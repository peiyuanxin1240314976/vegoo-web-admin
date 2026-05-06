<template>
  <div class="admob-dashboard">
    <!-- 页面标题 + 筛选器 -->
    <div class="page-header">
      <div class="page-title-wrap">
        <button class="back-btn" @click="goBack">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7.5" stroke="currentColor" stroke-opacity="0.4" />
            <path
              d="M9.5 5L6.5 8L9.5 11"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          返回
        </button>
        <span class="page-title" :title="pageDetailTitle">{{ pageDetailTitle }}</span>
      </div>

      <div class="filters aapp-filter-panel">
        <div class="filter-item filter-field">
          <AppDatePicker
            v-model="dateRange"
            type="daterange"
            :shortcuts="dateRangeShortcuts"
            range-separator="～"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            unlink-panels
            class="aapp-filter-date"
            popper-class="aapp-filter__popper"
          />
        </div>
        <div class="filter-item filter-field">
          <el-select
            :model-value="countryFilter"
            class="aapp-filter-select"
            popper-class="aapp-filter__popper"
            filterable
            clearable
            @update:model-value="onCountryFilterUpdate"
            placeholder="国家"
          >
            <el-option :label="tr('adPerformance.filterAll', '全部')" value="" />
            <el-option
              v-for="opt in countryOptionsForSelect"
              :key="String(opt.value)"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </div>

        <el-button
          class="aapp-query-btn"
          type="primary"
          plain
          round
          :loading="pendingQuery"
          :disabled="pendingQuery"
          @click="runQuery"
        >
          查询
        </el-button>
      </div>
    </div>

    <!-- 主体内容：左右分栏 -->
    <div class="main-layout">
      <!-- 鱼骨屏骨架（loading） -->
      <div v-if="pendingQuery" class="fishbone-skeleton" aria-hidden="true">
        <div class="fishbone-skeleton__left">
          <div class="fishbone-skeleton__kpis">
            <div v-for="i in 4" :key="i" class="fishbone-card">
              <div class="fishbone-line fishbone-line--sm" />
              <div class="fishbone-line fishbone-line--lg" />
              <div class="fishbone-bones" />
            </div>
          </div>
          <div class="fishbone-panel">
            <div class="fishbone-panel__header">
              <div class="fishbone-line fishbone-line--md" />
              <div class="fishbone-chip-row">
                <span v-for="i in 3" :key="i" class="fishbone-chip" />
              </div>
            </div>
            <div class="fishbone-chart" />
          </div>
          <div class="fishbone-panel">
            <div class="fishbone-panel__header">
              <div class="fishbone-line fishbone-line--md" />
              <div class="fishbone-chip-row">
                <span v-for="i in 4" :key="i" class="fishbone-chip" />
              </div>
            </div>
            <div class="fishbone-list">
              <div v-for="i in 6" :key="i" class="fishbone-row">
                <span class="fishbone-dot" />
                <span class="fishbone-line fishbone-line--row" />
                <span class="fishbone-line fishbone-line--row2" />
              </div>
            </div>
          </div>
        </div>

        <div class="fishbone-skeleton__right">
          <div class="fishbone-panel">
            <div class="fishbone-panel__header">
              <div class="fishbone-line fishbone-line--md" />
            </div>
            <div class="fishbone-table">
              <div class="fishbone-table__head">
                <span v-for="i in 6" :key="i" class="fishbone-line fishbone-line--th" />
              </div>
              <div v-for="i in 7" :key="i" class="fishbone-table__tr">
                <span v-for="j in 6" :key="j" class="fishbone-line fishbone-line--td" />
              </div>
            </div>
          </div>
          <div class="fishbone-panel">
            <div class="fishbone-panel__header">
              <div class="fishbone-line fishbone-line--md" />
            </div>
            <div class="fishbone-ai">
              <div v-for="i in 3" :key="i" class="fishbone-ai__card">
                <div class="fishbone-line fishbone-line--sm" />
                <div class="fishbone-line fishbone-line--row" />
                <div class="fishbone-line fishbone-line--row2" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 左侧主内容 -->
      <div class="left-panel" :class="{ 'is-loading': pendingQuery }">
        <!-- KPI 卡片区 -->
        <div class="kpi-grid">
          <div
            v-for="card in appKpiCards"
            :key="card.id"
            class="kpi-card"
            :class="[kpiCardRootClass(card.id), { 'is-active': activeKpi === card.id }]"
            @click="activeKpi = card.id"
          >
            <div class="kpi-bg-glow" :class="kpiGlowClass(card.id)" />
            <div class="kpi-label">{{ card.label }}</div>
            <div class="kpi-value" :class="kpiValueClass(card.id)">
              <span class="kpi-number">{{ card.valueText }}</span>
              <div
                v-if="card.changeText"
                class="kpi-badge"
                :class="card.positive ? 'badge-up' : 'badge-down'"
              >
                <svg width="10" height="10" viewBox="0 0 10 10">
                  <path v-if="card.positive" d="M5 2L8 6H2L5 2Z" fill="currentColor" />
                  <path v-else d="M5 8L2 4H8L5 8Z" fill="currentColor" />
                </svg>
                {{ card.changeText }}
              </div>
            </div>
            <div class="kpi-sparkline">
              <svg viewBox="0 0 80 24" fill="none" preserveAspectRatio="none">
                <polyline
                  :points="sparkPolylinePoints(card.chartData)"
                  stroke="currentColor"
                  stroke-width="1.5"
                  fill="none"
                  opacity="0.8"
                />
              </svg>
            </div>
          </div>
        </div>

        <!-- 核心指标趋势图 -->
        <div class="chart-panel">
          <div class="panel-header">
            <h3 class="panel-title">核心指标趋势</h3>
            <div class="legend-list">
              <span
                class="legend-item"
                v-for="item in legendItems"
                :key="item.key"
                :class="{ 'legend-inactive': !item.active }"
                @click="toggleLegend(item)"
              >
                <i class="legend-dot" :style="{ background: item.color }" />
                {{ item.label }}
              </span>
            </div>
          </div>
          <div ref="chartRef" class="echarts-container" />
        </div>
      </div>

      <!-- 右侧面板 -->
      <div class="right-panel" :class="{ 'is-loading': pendingQuery }">
        <!-- 广告位表现 -->
        <div class="table-panel">
          <h3 class="panel-title">广告位表现</h3>
          <div class="custom-table">
            <div class="table-header">
              <span>广告位</span>
              <span>格式</span>
              <span>广告收入</span>
              <span>eCPM</span>
              <span>填充率</span>
              <span>展示次数</span>
            </div>
            <div
              v-for="(row, idx) in adUnitData"
              :key="idx"
              class="table-row"
              :class="{ 'row-hover': hoverRow === idx }"
              @mouseenter="hoverRow = idx"
              @mouseleave="hoverRow = -1"
            >
              <span class="col-network-cell">
                <el-tooltip
                  :content="String(row.network ?? '')"
                  placement="top"
                  :disabled="!row.network"
                >
                  <span class="col-network">{{ row.network }}</span>
                </el-tooltip>
              </span>
              <span class="col-format">
                <span class="format-tag" :class="`format-${row.formatType}`">{{ row.format }}</span>
              </span>
              <span class="col-revenue" :class="{ 'revenue-high': row.revenueHighlight }">{{
                row.revenue
              }}</span>
              <span class="col-ecpm">{{ row.ecpm }}</span>
              <span class="col-fill">
                <div class="fill-bar-wrap">
                  <div class="fill-bar-bg">
                    <div
                      class="fill-bar-fill"
                      :style="{ width: row.fillRate, background: getFillColor(row.fillRate) }"
                    />
                  </div>
                  <span>{{ row.fillRate }}</span>
                </div>
              </span>
              <span class="col-imp">{{ row.impressions }}</span>
            </div>
          </div>
        </div>

        <!-- AI洞察与建议 -->
        <div class="ai-insight-panel">
          <div class="ai-panel-header">
            <h3 class="panel-title">AI洞察与建议</h3>
            <div class="ai-icon-wrap">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"
                  fill="currentColor"
                  opacity="0.3"
                />
                <path d="M9 9h2v6H9zm4 0h2v6h-2z" fill="none" />
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="currentColor"
                  stroke-width="1"
                  stroke-dasharray="4 2"
                />
              </svg>
            </div>
          </div>
          <div class="insight-list">
            <div
              v-for="(insight, idx) in insights"
              :key="idx"
              class="insight-card"
              :class="{ 'insight-expanded': expandedInsight === idx }"
              @click="expandedInsight = expandedInsight === idx ? -1 : idx"
            >
              <div class="insight-icon-wrap">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path
                    d="M9 2a7 7 0 100 14A7 7 0 009 2z"
                    stroke="currentColor"
                    stroke-width="1.2"
                  />
                  <circle cx="9" cy="6" r="1" fill="currentColor" />
                  <path
                    d="M9 8.5V13"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                  />
                </svg>
              </div>
              <div class="insight-content">
                <div class="insight-tag">{{ insight.type }}</div>
                <p class="insight-text">{{ insight.text }}</p>
              </div>
              <svg
                class="insight-arrow"
                :class="{ rotated: expandedInsight === idx }"
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
              >
                <path
                  d="M5 5l4 2-4 2"
                  stroke="currentColor"
                  stroke-width="1.3"
                  stroke-linecap="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
  import AppDatePicker from '@/components/core/forms/AppDatePicker.vue'
  import { storeToRefs } from 'pinia'
  import { useRoute, useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import type { LocationQueryValue } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import { echarts, type EChartsOption } from '@/plugins/echarts'
  import { dateRangeShortcuts } from '@/utils/form/date-shortcuts'
  import {
    fetchAppAdPlatformPerformanceAiInsights,
    fetchAppAdPlatformPerformanceOverviewKpis,
    fetchAppAdPlatformPerformanceOverviewTrend,
    fetchAppAdPlatformPerformanceTableAdUnits
  } from '@/api/ad-platform-detail'
  import { cloneAppDate, formatYYYYMMDD, getAppNow } from '@/utils/app-now'
  import { useCockpitMetaFilterStore } from '@/store/modules/cockpit-meta-filter'
  import type {
    AdPlatformDetailKpiItem,
    AppAdPlatformAdUnitRow,
    AppAdPlatformAiInsightRow
  } from '../types'

  defineOptions({ name: 'AppAdPlatformPerformance' })

  const router = useRouter()
  const route = useRoute()

  const { t, te } = useI18n()
  const tr = (key: string, fallback: string) => (te(key) ? t(key) : fallback)

  const cockpitMetaStore = useCockpitMetaFilterStore()
  const { data: cockpitMeta } = storeToRefs(cockpitMetaStore)

  function toApiCountryCode(value: string): string {
    const v = String(value ?? '').trim()
    return v === '' || v.toLowerCase() === 'all' ? '' : value
  }

  /** 国家下拉：去掉 meta 中占位「全部」，首项由模板 ElOption value="" 提供 */
  const countryOptionsForSelect = computed(() =>
    (cockpitMeta.value?.countryOptions ?? []).filter((o) => {
      const v = String(o.value ?? '')
        .trim()
        .toLowerCase()
      return v !== '' && v !== 'all'
    })
  )

  function querySourceLabelString(
    v: LocationQueryValue | LocationQueryValue[] | undefined
  ): string {
    if (v === undefined || v === null) return ''
    if (Array.isArray(v)) {
      const first = v[0]
      return first == null || first === '' ? '' : first
    }
    return v === '' ? '' : v
  }

  function safeDecodeURIComponent(s: string): string {
    try {
      return decodeURIComponent(s)
    } catch {
      return s
    }
  }

  const platformTitlePart = computed(() => {
    const src = safeDecodeURIComponent(querySourceLabelString(route.query['platform-name']).trim())
    if (src) return src
    const s = safeDecodeURIComponent(querySourceLabelString(route.query.sourceLabel).trim())
    return s || '广告平台'
  })

  const routeAppQueryDecoded = computed(() =>
    safeDecodeURIComponent(querySourceLabelString(route.query.app).trim())
  )

  /** 接口请求体 `appId`：优先 `query.appId`（列表行自有 ID），兼容仅传 `query.app`（展示名或历史） */
  const routeAppIdForApi = computed(() => {
    const byId = safeDecodeURIComponent(querySourceLabelString(route.query.appId).trim())
    if (byId) return byId
    return routeAppQueryDecoded.value
  })

  /** 应用由路由 `query.app` 固定，不提供筛选；展示名即入参原文或后续接口回填 */
  const selectedAppDisplayName = computed(() => routeAppQueryDecoded.value || '应用')

  const pageDetailTitle = computed(
    () => `${selectedAppDisplayName.value}在${platformTitlePart.value}中的表现详情`
  )

  /** 回到父页，示例：`/business-insight/ad-platform-detail?platform-name=Liftoff&source=8` */
  function goBack() {
    const source = querySourceLabelString(route.query.source).trim()
    const sourceLabel = querySourceLabelString(route.query.sourceLabel).trim()
    const platformName = querySourceLabelString(route.query['platform-name']).trim()

    const query: Record<string, string> = {}
    if (platformName) query['platform-name'] = platformName
    if (source) query.source = source
    else if (sourceLabel) query.sourceLabel = sourceLabel

    router.push({
      path: '/business-insight/ad-platform-detail',
      query
    })
  }

  // ─── 筛选器状态（仅日期 + 国家；应用固定为路由 query.app）────────────────
  function buildDefaultDateRangeStrings(): [string, string] {
    const end = cloneAppDate(getAppNow())
    end.setHours(0, 0, 0, 0)
    const start = cloneAppDate(end)
    start.setDate(end.getDate() - 29)
    return [formatYYYYMMDD(start), formatYYYYMMDD(end)]
  }

  const initialDateRange = buildDefaultDateRangeStrings()
  /** `YYYY-MM-DD` 起止；与接口 `startDate` / `endDate` 一致 */
  const dateRange = ref<[string, string] | null>(initialDateRange)
  /** 与 meta `countryOptions` 对齐，「全部」为 `""`；请求前由 `toApiCountryCode` 映射 */
  const countryFilter = ref('')

  function onCountryFilterUpdate(v: string | undefined | null) {
    countryFilter.value = v ?? ''
  }

  // ─── KPI（契约字段驱动）──────────────────────────────────────────
  const INITIAL_APP_KPIS: AdPlatformDetailKpiItem[] = [
    {
      id: 'revenue',
      label: '收入',
      valueText: '$937.5K',
      changeText: '',
      positive: true,
      color: '#f59e0b',
      chartData: [650, 720, 680, 800, 750, 820, 900, 780, 810, 850, 880, 937]
    },
    {
      id: 'ecpm',
      label: 'eCPM',
      valueText: '¥3.10',
      changeText: '+12.3%',
      positive: true,
      color: '#3b82f6',
      chartData: [2.6, 2.7, 2.8, 2.9, 2.85, 2.95, 3.0, 2.98, 3.05, 3.08, 3.09, 3.1]
    },
    {
      id: 'fill',
      label: '填充率',
      valueText: '98%',
      changeText: '-3.2%',
      positive: false,
      color: '#10b981',
      chartData: [99, 98, 99, 97, 98, 98, 99, 97, 98, 98, 97, 98]
    },
    {
      id: 'impressions',
      label: '展示次数',
      valueText: '302M',
      changeText: '',
      positive: true,
      color: '#a855f7',
      chartData: [260, 275, 268, 290, 285, 295, 300, 292, 298, 305, 310, 302]
    }
  ]

  const appKpiCards = ref<AdPlatformDetailKpiItem[]>(
    INITIAL_APP_KPIS.map((k) => ({ ...k, chartData: [...k.chartData] }))
  )

  const activeKpi = ref('revenue')

  function kpiCardRootClass(id: string) {
    if (id === 'impressions') return 'kpi-impression'
    return `kpi-${id}`
  }

  function kpiGlowClass(id: string) {
    const map: Record<string, string> = {
      revenue: 'revenue-glow',
      ecpm: 'ecpm-glow',
      fill: 'fill-glow',
      impressions: 'impression-glow'
    }
    return map[id] ?? 'revenue-glow'
  }

  function kpiValueClass(id: string) {
    const map: Record<string, string> = {
      revenue: 'revenue-value',
      ecpm: 'ecpm-value',
      fill: 'fill-value',
      impressions: 'impression-value'
    }
    return map[id] ?? 'revenue-value'
  }

  function sparkPolylinePoints(data: number[], w = 80, h = 24): string {
    if (!data.length) return ''
    const min = Math.min(...data)
    const max = Math.max(...data)
    return data
      .map((v, i) => {
        const x = (i / (data.length - 1 || 1)) * w
        const y = h - 2 - ((v - min) / (max - min || 1)) * (h - 4)
        return `${x},${y}`
      })
      .join(' ')
  }

  // ─── 图表 ─────────────────────────────────────────────────────
  const chartRef = ref<HTMLElement | null>(null)
  let chartInstance: ReturnType<typeof echarts.init> | null = null

  const legendItems = ref([
    { key: 'revenue', label: '广告收入', color: '#f59e0b', active: true },
    { key: 'ecpm', label: 'eCPM', color: '#3b82f6', active: true },
    { key: 'fill', label: '填充率', color: '#10b981', active: true }
  ])

  function toggleLegend(item: (typeof legendItems.value)[0]) {
    item.active = !item.active
    if (chartInstance)
      chartInstance.dispatchAction({ type: 'legendToggleSelect', name: item.label })
  }

  const xAxisData = ref([
    '10/1',
    '10/3',
    '10/5',
    '10/7',
    '10/9',
    '10/11',
    '10/13',
    '10/15',
    '10/17',
    '10/19',
    '10/21',
    '10/23',
    '10/25',
    '10/27',
    '10/29',
    '10/31'
  ])
  const revenueData = ref([
    780, 650, 820, 590, 750, 680, 900, 620, 800, 720, 870, 640, 760, 810, 690, 937
  ])
  const ecpmData = ref([
    2.8, 2.6, 3.0, 2.5, 2.9, 2.7, 3.1, 2.6, 3.0, 2.8, 3.1, 2.6, 2.9, 3.0, 2.8, 3.1
  ])
  const fillData = ref([97, 96, 98, 95, 98, 97, 99, 96, 98, 97, 99, 96, 98, 98, 97, 98])

  function buildAppPerfChartOption(): EChartsOption {
    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(15,23,42,0.92)',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        padding: [10, 14],
        textStyle: { color: '#e2e8f0', fontSize: 12 },
        formatter(params: any) {
          const p = Array.isArray(params) ? params : [params]
          const idx = typeof p[0]?.dataIndex === 'number' ? p[0].dataIndex : 0
          const rev = revenueData.value[idx] ?? 0
          const ecpm = ecpmData.value[idx] ?? 0
          const fill = fillData.value[idx] ?? 0
          let html = `<div style="font-weight:600;margin-bottom:6px;color:#94a3b8">${p[0]?.axisValue}</div>`
          html += `<div style="display:flex;align-items:center;gap:4px;padding:2px 0"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#f59e0b;margin-right:6px"></span>Revenue: <b style="margin-left:auto;padding-left:12px">$${rev}K</b></div>`
          html += `<div style="display:flex;align-items:center;gap:4px;padding:2px 0"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#3b82f6;margin-right:6px"></span>eCPM: <b style="margin-left:auto;padding-left:12px">${ecpm.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b></div>`
          html += `<div style="display:flex;align-items:center;gap:4px;padding:2px 0"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#10b981;margin-right:6px"></span>Fill Rate: <b style="margin-left:auto;padding-left:12px">${fill}%</b></div>`
          return html
        },
        axisPointer: {
          type: 'line',
          lineStyle: { color: 'rgba(255,255,255,0.12)', type: 'dashed' }
        }
      },
      legend: { show: false },
      grid: { left: 56, right: 56, top: 16, bottom: 36 },
      xAxis: {
        type: 'category',
        data: xAxisData.value,
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
        axisTick: { show: false },
        axisLabel: { color: '#64748b', fontSize: 11 }
      },
      yAxis: [
        {
          type: 'value',
          name: '',
          position: 'left',
          axisLabel: {
            color: '#64748b',
            fontSize: 11,
            formatter: (v: number) => (v >= 1000 ? `$${v / 1000}K` : `$${v}K`)
          },
          splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
          axisLine: { show: false },
          axisTick: { show: false }
        },
        {
          type: 'value',
          name: '',
          position: 'right',
          min: 0,
          max: 100,
          axisLabel: { color: '#64748b', fontSize: 11, formatter: '{value}%' },
          splitLine: { show: false },
          axisLine: { show: false },
          axisTick: { show: false }
        }
      ],
      series: [
        {
          name: 'Revenue',
          type: 'line',
          data: revenueData.value,
          yAxisIndex: 0,
          smooth: 0.4,
          symbol: 'circle',
          symbolSize: 5,
          lineStyle: { color: '#f59e0b', width: 2 },
          itemStyle: { color: '#f59e0b', borderWidth: 2, borderColor: '#0f172a' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(245,158,11,0.25)' },
              { offset: 1, color: 'rgba(245,158,11,0.02)' }
            ])
          }
        },
        {
          name: 'eCPM',
          type: 'line',
          data: ecpmData.value,
          yAxisIndex: 0,
          smooth: 0.4,
          symbol: 'circle',
          symbolSize: 5,
          lineStyle: { color: '#3b82f6', width: 2 },
          itemStyle: { color: '#3b82f6', borderWidth: 2, borderColor: '#0f172a' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(59,130,246,0.2)' },
              { offset: 1, color: 'rgba(59,130,246,0.02)' }
            ])
          }
        },
        {
          name: 'Fill Rate',
          type: 'line',
          data: fillData.value,
          yAxisIndex: 1,
          smooth: 0.4,
          symbol: 'circle',
          symbolSize: 5,
          lineStyle: { color: '#10b981', width: 2 },
          itemStyle: { color: '#10b981', borderWidth: 2, borderColor: '#0f172a' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(16,185,129,0.18)' },
              { offset: 1, color: 'rgba(16,185,129,0.01)' }
            ])
          }
        }
      ]
    }
  }

  function initChart() {
    if (!chartRef.value) return
    chartInstance = echarts.init(chartRef.value, 'dark')
    if (!chartInstance) return
    chartInstance.setOption(buildAppPerfChartOption())
  }

  // ─── 广告位表格 ───────────────────────────────────────────────
  const hoverRow = ref(-1)
  const adUnitData = ref<AppAdPlatformAdUnitRow[]>([
    {
      network: 'AdMob',
      format: '插屏',
      formatType: 'interstitial',
      revenue: '$2.16M',
      ecpm: '$3.80',
      fillRate: '99%',
      impressions: '12.0M',
      revenueHighlight: false
    },
    {
      network: 'Facebook',
      format: '横幅',
      formatType: 'banner',
      revenue: '$2.16M',
      ecpm: '$3.80',
      fillRate: '95%',
      impressions: '7.0M',
      revenueHighlight: false
    },
    {
      network: 'Unity ads',
      format: '激励视频',
      formatType: 'rewarded',
      revenue: '$10.50M',
      ecpm: '$3.80',
      fillRate: '92%',
      impressions: '12.0M',
      revenueHighlight: true
    },
    {
      network: 'IronSource',
      format: '插屏',
      formatType: 'interstitial',
      revenue: '$2.16M',
      ecpm: '$3.80',
      fillRate: '99%',
      impressions: '12.0M',
      revenueHighlight: false
    },
    {
      network: 'Google Ads',
      format: '横幅',
      formatType: 'banner',
      revenue: '$13.50M',
      ecpm: '$3.80',
      fillRate: '95%',
      impressions: '12.0M',
      revenueHighlight: true
    },
    {
      network: 'IronSource',
      format: '插屏',
      formatType: 'interstitial',
      revenue: '$2.16M',
      ecpm: '$3.80',
      fillRate: '92%',
      impressions: '12.0M',
      revenueHighlight: false
    },
    {
      network: 'Google Ads',
      format: '横幅',
      formatType: 'banner',
      revenue: '$2.16M',
      ecpm: '$3.80',
      fillRate: '92%',
      impressions: '12.0M',
      revenueHighlight: false
    }
  ])

  function getFillColor(fill: string) {
    const v = parseInt(fill)
    if (v >= 98) return '#10b981'
    if (v >= 94) return '#3b82f6'
    return '#f59e0b'
  }

  // ─── AI 洞察 ──────────────────────────────────────────────────
  const expandedInsight = ref(-1)
  const insights = ref<AppAdPlatformAiInsightRow[]>([
    {
      type: '瀑布流优化',
      text: '在 Interstitial_LevelEnd 广告位中，AdMob 的填充率高达 99%，但 eCPM 低于 AppLovin，当前排序合理，可考虑提升 AppLovin floor price 以测试收益空间。'
    },
    {
      type: '广告位机会',
      text: 'Rewarded._ExtraLife 的 eCPM 高达 $7.50，是收入效率最高的广告位。建议在应用内增加更多此广告位的曝光机会，以提升总收入。'
    },
    {
      type: '填充率预警',
      text: 'Unity Ads 在激励视频广告位填充率仅为 92%，低于行业均值。建议补充备用广告网络或调整 waterfall 层级，避免库存浪费。'
    }
  ])

  // ─── resize ───────────────────────────────────────────────────
  function handleResize() {
    chartInstance?.resize()
  }

  const pendingQuery = ref(false)

  const appliedFilters = ref({
    startDate: initialDateRange[0],
    endDate: initialDateRange[1],
    countryFilter: countryFilter.value
  })

  function resolveDateRangeYmd(): { startDate: string; endDate: string } {
    const dr = dateRange.value
    if (dr && dr.length === 2 && dr[0] && dr[1]) {
      return { startDate: dr[0], endDate: dr[1] }
    }
    const [s, e] = buildDefaultDateRangeStrings()
    return { startDate: s, endDate: e }
  }

  async function runQuery() {
    if (pendingQuery.value) return
    pendingQuery.value = true
    try {
      const { startDate, endDate } = resolveDateRangeYmd()
      const appId = routeAppIdForApi.value || ''
      const sourceStr =
        querySourceLabelString(route.query.source).trim() ||
        querySourceLabelString(route.query.sourceLabel).trim()
      const body = {
        startDate,
        endDate,
        appId,
        countryCode: toApiCountryCode(countryFilter.value),
        ...(sourceStr ? { source: safeDecodeURIComponent(sourceStr) } : {})
      }

      const [kpiR, trendR, tableR, aiR] = await Promise.allSettled([
        fetchAppAdPlatformPerformanceOverviewKpis(body),
        fetchAppAdPlatformPerformanceOverviewTrend(body),
        fetchAppAdPlatformPerformanceTableAdUnits(body),
        fetchAppAdPlatformPerformanceAiInsights(body)
      ])

      if (kpiR.status === 'fulfilled') {
        const kpis = Array.isArray(kpiR.value.kpis) ? kpiR.value.kpis : []
        appKpiCards.value = kpis.map((k) => ({ ...k, chartData: [...k.chartData] }))
      } else {
        console.error(kpiR.reason)
        ElMessage.error('KPI 加载失败')
      }

      if (trendR.status === 'fulfilled') {
        const t = trendR.value
        xAxisData.value = Array.isArray(t.categories) ? [...t.categories] : []
        revenueData.value = Array.isArray(t.revenue) ? [...t.revenue] : []
        ecpmData.value = Array.isArray(t.d_ecpm) ? [...t.d_ecpm] : []
        fillData.value = Array.isArray(t.d_fill_rate) ? [...t.d_fill_rate] : []
      } else {
        console.error(trendR.reason)
        ElMessage.error('核心指标趋势加载失败')
      }

      if (tableR.status === 'fulfilled') {
        const records = Array.isArray(tableR.value.records) ? tableR.value.records : []
        adUnitData.value = records.map((r) => ({ ...r }))
      } else {
        console.error(tableR.reason)
        ElMessage.error('广告位表现加载失败')
      }

      if (aiR.status === 'fulfilled') {
        const list = Array.isArray(aiR.value.insights) ? aiR.value.insights : []
        insights.value = list.map((x: AppAdPlatformAiInsightRow) => ({ ...x }))
      } else {
        console.error(aiR.reason)
        ElMessage.error('AI 洞察加载失败')
      }

      appliedFilters.value = {
        startDate,
        endDate,
        countryFilter: countryFilter.value
      }

      await nextTick()
      chartInstance?.setOption(buildAppPerfChartOption(), true)
    } finally {
      pendingQuery.value = false
    }
  }

  onMounted(async () => {
    await cockpitMetaStore.ensureLoaded()
    await nextTick()
    initChart()
    window.addEventListener('resize', handleResize)
    await runQuery()
  })

  onBeforeUnmount(() => {
    chartInstance?.dispose()
    window.removeEventListener('resize', handleResize)
  })

  // 初始化会自动查询；之后仅点击「查询」按钮才触发 runQuery()
</script>

<style scoped lang="scss">
  @use '../../../user-growth/styles/filter-bar-theme.scss' as filterTheme;

  /* ═══════════════════════════════════════════════
   CSS 变量 & 基础
═══════════════════════════════════════════════ */
  .admob-dashboard {
    --bg-base: var(--default-bg-color);
    --bg-panel: color-mix(in srgb, var(--default-box-color) 92%, transparent);
    --bg-card: color-mix(in srgb, var(--default-box-color) 88%, transparent);
    --bg-hover: color-mix(in srgb, var(--default-box-color) 78%, transparent);
    --border: color-mix(in srgb, var(--art-primary) 14%, var(--default-border));
    --border-light: color-mix(in srgb, var(--art-primary) 22%, var(--default-border));
    --text-primary: var(--text-primary);
    --text-secondary: var(--text-secondary);
    --text-muted: var(--text-tertiary);
    --accent-yellow: var(--art-warning);
    --accent-blue: var(--art-primary);
    --accent-green: var(--art-success);
    --accent-purple: color-mix(in srgb, var(--art-primary) 52%, var(--art-success));
    --accent-red: var(--art-danger);
    --radius-sm: 6px;
    --radius-md: 10px;
    --radius-lg: 14px;
    --shadow: 0 4px 24px rgb(0 0 0 / 40%);

    min-height: 100vh;
    padding: 0 0 32px;
    font-family: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
    font-size: 13px;
    color: var(--text-primary);
    background: var(--bg-base);
  }

  /* ═══════════════════════════════════════════════
   顶部导航
═══════════════════════════════════════════════ */
  .top-nav {
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    gap: 14px;
    align-items: center;
    padding: 14px 24px;
    background: rgb(9 14 26 / 80%);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--border);
  }

  .back-btn {
    display: flex;
    gap: 6px;
    align-items: center;
    padding: 5px 12px;
    font-size: 12px;
    color: var(--text-secondary);
    cursor: pointer;
    background: rgb(255 255 255 / 6%);
    border: 1px solid var(--border);
    border-radius: 20px;
    transition:
      color 0.2s cubic-bezier(0.4, 0, 0.2, 1),
      background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1),
      border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1),
      box-shadow 0.25s cubic-bezier(0, 0, 0.2, 1),
      transform 0.25s cubic-bezier(0, 0, 0.2, 1);
  }

  .back-btn:hover {
    color: var(--text-primary);
    background: var(--bg-hover);
    border-color: var(--border-light);
    box-shadow: 0 0 18px color-mix(in srgb, var(--art-primary) 14%, transparent);
    transform: translateX(-2px);
  }

  .breadcrumb {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 13px;
    color: var(--text-muted);
  }

  .breadcrumb .sep {
    opacity: 0.4;
  }

  .breadcrumb .active {
    font-weight: 500;
    color: var(--text-primary);
  }

  /* ═══════════════════════════════════════════════
   页面标题
═══════════════════════════════════════════════ */
  .page-header {
    display: flex;
    gap: 16px;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px 16px;
  }

  .page-title-wrap {
    display: flex;
    gap: 10px;
    align-items: center;
    min-width: 0;
  }

  .page-title {
    margin: 0;
    overflow: hidden;
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
    text-overflow: ellipsis;
    letter-spacing: -0.3px;
    white-space: nowrap;
  }

  .filters.aapp-filter-panel {
    @include filterTheme.filter-panel(10px 14px);
    @include filterTheme.filter-panel-children;
    @include filterTheme.filter-row(12px);

    min-width: 0;
  }

  .filters.aapp-filter-panel > .filter-item.filter-field {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    min-height: 0;
    padding: 0;
    background: transparent;
    border: none;
  }

  .filter-label {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    white-space: nowrap;
  }

  .aapp-filter-select {
    @include filterTheme.filter-select-size(150px, 130px, 150px);
  }

  .filters.aapp-filter-panel :deep(.aapp-filter-date) {
    --el-input-focus-border-color: var(--theme-color, var(--art-primary, #3b82f6));
    --el-border-color-hover: var(--theme-color, var(--art-primary, #3b82f6));
    --el-color-primary: var(--theme-color, var(--art-primary, #3b82f6));
    --el-border-color-focus: var(--theme-color, var(--art-primary, #3b82f6));
    --el-border-color: var(--theme-color, var(--art-primary, #3b82f6));
    --el-component-size: 36px;
  }

  @include filterTheme.date-trigger('.filters.aapp-filter-panel', '.aapp-filter-date', 280px);
  @include filterTheme.element-select-trigger('.aapp-filter-select');
  @include filterTheme.select-popper('aapp-filter__popper');
  @include filterTheme.date-picker-popper('aapp-filter__popper');

  :global(.aapp-filter__popper.el-popper),
  :global(.aapp-filter__popper.el-select__popper),
  :global(.aapp-filter__popper.el-picker__popper) {
    z-index: 4000 !important;
  }

  :deep(.aapp-filter-select) {
    --el-input-focus-border-color: var(--theme-color, var(--art-primary, #3b82f6));
    --el-border-color-hover: var(--theme-color, var(--art-primary, #3b82f6));
    --el-color-primary: var(--theme-color, var(--art-primary, #3b82f6));
    --el-border-color-focus: var(--theme-color, var(--art-primary, #3b82f6));
    --el-border-color: var(--theme-color, var(--art-primary, #3b82f6));
    --el-component-size: 36px;
  }

  .filters.aapp-filter-panel :deep(.aapp-query-btn.el-button) {
    height: 36px;
    padding: 0 18px;
    margin-left: 4px;
    font-weight: 600;
    color: var(--theme-color, var(--art-primary, #3b82f6));
    background: color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 6%, transparent);
    border: 1px solid var(--theme-color, var(--art-primary, #3b82f6));
    box-shadow: none;
    transition:
      border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1),
      box-shadow 0.25s cubic-bezier(0, 0, 0.2, 1),
      transform 0.25s cubic-bezier(0, 0, 0.2, 1);
  }

  .filters.aapp-filter-panel :deep(.aapp-query-btn.el-button:hover:not(.is-disabled)) {
    border-color: var(--theme-color, var(--art-primary, #3b82f6));
    box-shadow: 0 0 0 1px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 14%, transparent);
  }

  .filters.aapp-filter-panel :deep(.aapp-query-btn.el-button:focus-visible) {
    outline: none;
    box-shadow:
      0 0 0 2px color-mix(in srgb, var(--el-color-primary) 35%, transparent),
      0 0 0 4px color-mix(in srgb, var(--el-color-primary) 18%, transparent);
  }

  /* ═══════════════════════════════════════════════
   主体布局
═══════════════════════════════════════════════ */
  .main-layout {
    position: relative;
    display: grid;
    grid-template-columns: 1fr 615px;
    gap: 16px;
    padding: 0 24px;
  }

  .left-panel.is-loading,
  .right-panel.is-loading {
    pointer-events: none;
    opacity: 0;
  }

  .fishbone-skeleton {
    position: absolute;
    inset: 0;
    z-index: 2;
    display: grid;
    grid-template-columns: 1fr 615px;
    gap: 16px;
    padding: 0 24px;
  }

  .fishbone-skeleton__left,
  .fishbone-skeleton__right {
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-width: 0;
  }

  .fishbone-skeleton__kpis {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: clamp(8px, 1.2vw, 12px);
  }

  .fishbone-card,
  .fishbone-panel {
    position: relative;
    overflow: hidden;
    background:
      radial-gradient(
        circle at 20% 10%,
        color-mix(in srgb, var(--art-primary) 10%, transparent) 0%,
        transparent 58%
      ),
      linear-gradient(180deg, var(--bg-card) 0%, var(--bg-panel) 100%);
    border: 1px solid color-mix(in srgb, var(--art-primary) 18%, var(--default-border));
    border-radius: var(--radius-lg);
    box-shadow:
      0 12px 40px rgb(0 0 0 / 44%),
      inset 0 1px 0 color-mix(in srgb, var(--art-primary) 10%, transparent);
  }

  .fishbone-card {
    min-height: 118px;
    padding: 18px 16px 12px;
  }

  .fishbone-panel {
    padding: 16px;
  }

  .fishbone-panel__header {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }

  .fishbone-line,
  .fishbone-chip,
  .fishbone-dot {
    position: relative;
    overflow: hidden;
    background: rgb(255 255 255 / 6%);
    border: 1px solid color-mix(in srgb, var(--art-primary) 12%, transparent);
    border-radius: 9999px;
  }

  .fishbone-line::after,
  .fishbone-chip::after,
  .fishbone-dot::after {
    position: absolute;
    inset: -2px;
    content: '';
    background: linear-gradient(
      120deg,
      transparent 0%,
      color-mix(in srgb, var(--art-primary) 22%, transparent) 40%,
      color-mix(in srgb, var(--art-success) 18%, transparent) 55%,
      transparent 70%
    );
    transform: translateX(-80%);
    animation: fishbone-shimmer 1.25s var(--ease-out, cubic-bezier(0, 0, 0.2, 1)) infinite;
  }

  .fishbone-line--sm {
    width: 34%;
    height: 10px;
    margin-bottom: 10px;
  }

  .fishbone-line--md {
    width: 42%;
    height: 12px;
  }

  .fishbone-line--lg {
    width: 66%;
    height: 18px;
    margin-bottom: 12px;
  }

  .fishbone-bones {
    height: 24px;
    background-image: repeating-linear-gradient(
      120deg,
      rgb(255 255 255 / 4%) 0,
      rgb(255 255 255 / 4%) 10px,
      transparent 10px,
      transparent 18px
    );
    border: 1px solid color-mix(in srgb, var(--art-primary) 10%, transparent);
    border-radius: 12px;
    opacity: 0.9;
  }

  .fishbone-chip-row {
    display: inline-flex;
    gap: 6px;
  }

  .fishbone-chip {
    width: 56px;
    height: 20px;
  }

  .fishbone-chart {
    height: clamp(200px, 22vw, 260px);
    background-image:
      linear-gradient(
        180deg,
        color-mix(in srgb, var(--art-primary) 7%, transparent) 0%,
        transparent 100%
      ),
      repeating-linear-gradient(
        90deg,
        transparent 0,
        transparent 32px,
        rgb(255 255 255 / 3%) 32px,
        rgb(255 255 255 / 3%) 33px
      );
    border: 1px solid color-mix(in srgb, var(--art-primary) 12%, transparent);
    border-radius: 14px;
  }

  .fishbone-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .fishbone-row {
    display: grid;
    grid-template-columns: 12px 1fr 0.9fr;
    gap: 10px;
    align-items: center;
  }

  .fishbone-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  .fishbone-line--row {
    width: 100%;
    height: 10px;
  }

  .fishbone-line--row2 {
    width: 100%;
    height: 10px;
    opacity: 0.78;
  }

  .fishbone-table__head,
  .fishbone-table__tr {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 8px;
    align-items: center;
  }

  .fishbone-table__head {
    padding-bottom: 10px;
    margin-bottom: 10px;
    border-bottom: 1px solid color-mix(in srgb, var(--art-primary) 14%, transparent);
  }

  .fishbone-line--th {
    height: 10px;
  }

  .fishbone-table__tr {
    padding: 8px 0;
    border-bottom: 1px solid color-mix(in srgb, var(--art-primary) 10%, transparent);
  }

  .fishbone-line--td {
    height: 10px;
  }

  .fishbone-ai {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .fishbone-ai__card {
    padding: 10px 12px;
    background: rgb(255 255 255 / 2.5%);
    border: 1px solid color-mix(in srgb, var(--art-primary) 14%, var(--default-border));
    border-radius: var(--radius-md);
  }

  @keyframes fishbone-shimmer {
    0% {
      opacity: 0.85;
      transform: translateX(-85%);
    }

    100% {
      opacity: 1;
      transform: translateX(85%);
    }
  }

  .left-panel {
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-width: 0;
  }

  .right-panel {
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-width: 0;
  }

  /* ═══════════════════════════════════════════════
   KPI 卡片
═══════════════════════════════════════════════ */
  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: clamp(8px, 1.2vw, 12px);
  }

  .kpi-card {
    --kpi-accent: var(--art-primary);

    position: relative;
    min-width: 0;
    padding: 18px 16px 12px;
    overflow: hidden;
    cursor: pointer;
    background:
      radial-gradient(
        circle at 18% 12%,
        color-mix(in srgb, var(--kpi-accent) 18%, transparent) 0%,
        transparent 62%
      ),
      radial-gradient(
        circle at 86% 16%,
        color-mix(in srgb, var(--art-primary) 12%, transparent) 0%,
        transparent 58%
      ),
      linear-gradient(180deg, var(--bg-card) 0%, var(--bg-panel) 100%);
    border: 1px solid color-mix(in srgb, var(--kpi-accent) 22%, var(--default-border));
    border-radius: var(--radius-lg);
    box-shadow:
      0 12px 40px rgb(0 0 0 / 44%),
      0 0 0 1px color-mix(in srgb, var(--kpi-accent) 10%, transparent),
      inset 0 1px 0 color-mix(in srgb, var(--kpi-accent) 10%, transparent);
    transition:
      transform 0.32s cubic-bezier(0, 0, 0.2, 1),
      box-shadow 0.32s cubic-bezier(0, 0, 0.2, 1),
      border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1),
      filter 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .kpi-card:hover {
    filter: brightness(1.05);
    border-color: color-mix(in srgb, var(--kpi-accent) 44%, var(--default-border));
    box-shadow:
      0 20px 52px -14px rgb(0 0 0 / 62%),
      0 0 0 1px color-mix(in srgb, var(--kpi-accent) 18%, transparent),
      inset 0 1px 0 color-mix(in srgb, var(--kpi-accent) 14%, transparent),
      0 0 40px color-mix(in srgb, var(--kpi-accent) 18%, transparent);
    transform: translateY(-5px);
  }

  .kpi-card.is-active {
    border-color: color-mix(in srgb, var(--kpi-accent) 52%, var(--default-border));
    box-shadow:
      0 18px 48px -16px rgb(0 0 0 / 58%),
      0 0 0 1px color-mix(in srgb, var(--kpi-accent) 24%, transparent),
      0 0 44px -10px color-mix(in srgb, var(--kpi-accent) 22%, transparent);
  }

  .kpi-bg-glow {
    position: absolute;
    inset: 0;
    pointer-events: none;
    border-radius: inherit;
    opacity: 0.1;
  }

  .revenue-glow {
    background: radial-gradient(
      ellipse at 30% 0%,
      color-mix(in srgb, var(--art-warning) 34%, transparent) 0%,
      transparent 65%
    );
  }

  .ecpm-glow {
    background: radial-gradient(
      ellipse at 30% 0%,
      color-mix(in srgb, var(--art-primary) 34%, transparent) 0%,
      transparent 65%
    );
  }

  .fill-glow {
    background: radial-gradient(
      ellipse at 30% 0%,
      color-mix(in srgb, var(--art-success) 34%, transparent) 0%,
      transparent 65%
    );
  }

  .impression-glow {
    background: radial-gradient(
      ellipse at 30% 0%,
      color-mix(in srgb, var(--art-primary) 22%, transparent) 0%,
      transparent 65%
    );
  }

  .kpi-revenue {
    --kpi-accent: var(--art-warning);

    color: var(--art-warning);
  }

  .kpi-ecpm {
    --kpi-accent: var(--art-primary);

    color: var(--art-primary);
  }

  .kpi-fill {
    --kpi-accent: var(--art-success);

    color: var(--art-success);
  }

  .kpi-impression {
    --kpi-accent: color-mix(in srgb, var(--art-primary) 52%, var(--art-success));

    color: color-mix(in srgb, var(--art-primary) 52%, var(--art-success));
  }

  .kpi-label {
    margin-bottom: 10px;
    font-size: 11px;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .kpi-value {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: baseline;
  }

  .kpi-number {
    font-size: 26px;
    font-weight: 700;
    line-height: 1;
    letter-spacing: -1px;
  }

  .revenue-value .kpi-number {
    color: var(--accent-yellow);
  }

  .ecpm-value .kpi-number {
    color: var(--accent-blue);
  }

  .fill-value .kpi-number {
    color: var(--accent-green);
  }

  .impression-value .kpi-number {
    color: var(--accent-purple);
  }

  .kpi-badge {
    display: inline-flex;
    gap: 3px;
    align-items: center;
    padding: 2px 7px;
    font-size: 11px;
    font-weight: 600;
    border-radius: 10px;
  }

  .badge-up {
    color: var(--art-success);
    background: color-mix(in srgb, var(--art-success) 14%, transparent);
  }

  .badge-down {
    color: var(--art-danger);
    background: color-mix(in srgb, var(--art-danger) 14%, transparent);
  }

  .kpi-sparkline {
    height: 24px;
    margin-top: 10px;
    opacity: 0.7;
  }

  .kpi-sparkline svg {
    width: 100%;
    height: 100%;
  }

  /* ═══════════════════════════════════════════════
   通用面板样式
═══════════════════════════════════════════════ */
  .panel-title {
    margin: 0;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
    letter-spacing: -0.2px;
  }

  /* ═══════════════════════════════════════════════
   趋势图面板
═══════════════════════════════════════════════ */
  .chart-panel {
    padding: 18px 16px 14px;
    background:
      radial-gradient(
        circle at 14% 10%,
        color-mix(in srgb, var(--art-primary) 14%, transparent) 0%,
        transparent 60%
      ),
      linear-gradient(180deg, var(--bg-card) 0%, var(--bg-panel) 100%);
    border: 1px solid color-mix(in srgb, var(--art-primary) 18%, var(--default-border));
    border-radius: var(--radius-lg);
    box-shadow:
      0 12px 40px rgb(0 0 0 / 44%),
      inset 0 1px 0 color-mix(in srgb, var(--art-primary) 10%, transparent);
    transition:
      transform 0.32s cubic-bezier(0, 0, 0.2, 1),
      box-shadow 0.32s cubic-bezier(0, 0, 0.2, 1),
      border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .chart-panel:hover {
    border-color: color-mix(in srgb, var(--art-primary) 32%, var(--default-border));
    box-shadow:
      0 20px 52px -14px rgb(0 0 0 / 62%),
      0 0 0 1px color-mix(in srgb, var(--art-primary) 16%, transparent),
      inset 0 1px 0 color-mix(in srgb, var(--art-primary) 12%, transparent),
      0 0 44px color-mix(in srgb, var(--art-primary) 14%, transparent);
    transform: translateY(-4px);
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .legend-list {
    display: flex;
    gap: 16px;
    align-items: center;
  }

  .legend-item {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 11px;
    color: var(--text-secondary);
    cursor: pointer;
    user-select: none;
    transition:
      opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1),
      color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .legend-item:hover {
    color: var(--text-primary);
  }

  .legend-item.legend-inactive {
    opacity: 0.4;
  }

  .legend-dot {
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .echarts-container {
    width: 100%;
    height: clamp(200px, 22vw, 260px);
  }

  /* ═══════════════════════════════════════════════
   广告位表格
═══════════════════════════════════════════════ */
  .table-panel {
    padding: 16px;
    overflow: hidden;
    background:
      radial-gradient(
        circle at 14% 10%,
        color-mix(in srgb, var(--art-primary) 14%, transparent) 0%,
        transparent 60%
      ),
      linear-gradient(180deg, var(--bg-card) 0%, var(--bg-panel) 100%);
    border: 1px solid color-mix(in srgb, var(--art-primary) 18%, var(--default-border));
    border-radius: var(--radius-lg);
    box-shadow:
      0 12px 40px rgb(0 0 0 / 44%),
      inset 0 1px 0 color-mix(in srgb, var(--art-primary) 10%, transparent);
    transition:
      transform 0.32s cubic-bezier(0, 0, 0.2, 1),
      box-shadow 0.32s cubic-bezier(0, 0, 0.2, 1),
      border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .table-panel:hover {
    border-color: color-mix(in srgb, var(--art-primary) 32%, var(--default-border));
    box-shadow:
      0 20px 52px -14px rgb(0 0 0 / 62%),
      0 0 0 1px color-mix(in srgb, var(--art-primary) 16%, transparent),
      inset 0 1px 0 color-mix(in srgb, var(--art-primary) 12%, transparent),
      0 0 44px color-mix(in srgb, var(--art-primary) 14%, transparent);
    transform: translateY(-4px);
  }

  .custom-table {
    max-height: 550px;
    margin-top: 12px;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
  }

  .table-header {
    display: grid;
    grid-template-columns:
      minmax(92px, 1.2fr) minmax(66px, 0.9fr) minmax(74px, 1fr) minmax(58px, 0.8fr)
      minmax(100px, 1.1fr) minmax(76px, 1fr);
    gap: 4px;
    padding: 0 8px 8px;
    font-size: 11px;
    color: var(--text-muted);
    letter-spacing: 0.3px;
    border-bottom: 1px solid color-mix(in srgb, var(--art-primary) 18%, transparent);
  }

  .table-row {
    display: grid;
    grid-template-columns:
      minmax(92px, 1.2fr) minmax(66px, 0.9fr) minmax(74px, 1fr) minmax(58px, 0.8fr)
      minmax(100px, 1.1fr) minmax(76px, 1fr);
    gap: 4px;
    align-items: center;
    padding: 7px 8px;
    font-size: 12px;
    border-bottom: 1px solid color-mix(in srgb, var(--art-primary) 16%, transparent);
    border-radius: var(--radius-sm);
    transition:
      background-color 0.15s cubic-bezier(0.4, 0, 0.2, 1),
      transform 0.2s cubic-bezier(0, 0, 0.2, 1),
      box-shadow 0.25s cubic-bezier(0, 0, 0.2, 1),
      border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .table-row:last-child {
    border-bottom: none;
  }

  .table-row.row-hover {
    background: var(--bg-hover);
    border-color: color-mix(in srgb, var(--art-primary) 22%, transparent);
    box-shadow:
      0 12px 34px -18px rgb(0 0 0 / 58%),
      0 0 0 1px color-mix(in srgb, var(--art-primary) 12%, transparent);
    transform: translateY(-1px);
  }

  .col-network-cell {
    min-width: 0;
    max-width: 120px;
  }

  .col-network-cell > :deep(.el-tooltip__trigger) {
    display: block;
    max-width: 100%;
  }

  .col-network {
    display: block;
    width: 100%;
    min-width: 0;
    overflow: hidden;
    font-weight: 500;
    color: var(--text-secondary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .format-tag {
    display: inline-block;
    padding: 2px 6px;
    font-size: 10px;
    white-space: nowrap;
    border-radius: 4px;
  }

  .format-banner {
    color: var(--art-primary);
    background: color-mix(in srgb, var(--art-primary) 14%, transparent);
  }

  .format-interstitial {
    color: var(--art-warning);
    background: color-mix(in srgb, var(--art-warning) 14%, transparent);
  }

  .format-rewarded {
    color: color-mix(in srgb, var(--art-primary) 52%, var(--art-success));
    background: color-mix(in srgb, var(--art-primary) 12%, transparent);
  }

  .col-revenue {
    font-size: 11px;
    font-weight: 600;
    color: var(--accent-green);
  }

  .col-revenue.revenue-high {
    color: var(--art-warning);
  }

  .col-ecpm {
    font-size: 11px;
    color: var(--text-secondary);
  }

  .fill-bar-wrap {
    display: flex;
    gap: 5px;
    align-items: center;
    font-size: 11px;
    color: var(--text-secondary);
  }

  .fill-bar-bg {
    width: 36px;
    height: 4px;
    overflow: hidden;
    background: rgb(255 255 255 / 8%);
    border-radius: 2px;
  }

  .fill-bar-fill {
    height: 100%;
    border-radius: 2px;
    transition: width 0.5s ease;
  }

  .col-imp {
    font-size: 11px;
    color: var(--text-muted);
  }

  /* ═══════════════════════════════════════════════
   AI 洞察
═══════════════════════════════════════════════ */
  .ai-insight-panel {
    flex: 1;
    padding: 16px;
    background:
      radial-gradient(
        circle at 14% 10%,
        color-mix(in srgb, var(--art-primary) 14%, transparent) 0%,
        transparent 60%
      ),
      linear-gradient(180deg, var(--bg-card) 0%, var(--bg-panel) 100%);
    border: 1px solid color-mix(in srgb, var(--art-primary) 18%, var(--default-border));
    border-radius: var(--radius-lg);
    box-shadow:
      0 12px 40px rgb(0 0 0 / 44%),
      inset 0 1px 0 color-mix(in srgb, var(--art-primary) 10%, transparent);
    transition:
      transform 0.32s cubic-bezier(0, 0, 0.2, 1),
      box-shadow 0.32s cubic-bezier(0, 0, 0.2, 1),
      border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .ai-insight-panel:hover {
    border-color: color-mix(in srgb, var(--art-primary) 32%, var(--default-border));
    box-shadow:
      0 20px 52px -14px rgb(0 0 0 / 62%),
      0 0 0 1px color-mix(in srgb, var(--art-primary) 16%, transparent),
      inset 0 1px 0 color-mix(in srgb, var(--art-primary) 12%, transparent),
      0 0 44px color-mix(in srgb, var(--art-primary) 14%, transparent);
    transform: translateY(-4px);
  }

  .ai-panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }

  .ai-icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    color: var(--art-primary);
    background: color-mix(in srgb, var(--art-primary) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--art-primary) 22%, transparent);
    border-radius: 8px;
    animation: pulseGlow 3s ease-in-out infinite;
  }

  @keyframes pulseGlow {
    0%,
    100% {
      box-shadow: 0 0 0 0 color-mix(in srgb, var(--art-primary) 0%, transparent);
    }

    50% {
      box-shadow: 0 0 0 6px color-mix(in srgb, var(--art-primary) 10%, transparent);
    }
  }

  .insight-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .insight-card {
    position: relative;
    display: flex;
    gap: 10px;
    align-items: flex-start;
    padding: 10px 12px;
    cursor: pointer;
    background: rgb(255 255 255 / 2.5%);
    border: 1px solid color-mix(in srgb, var(--art-primary) 14%, var(--default-border));
    border-radius: var(--radius-md);
    transition:
      background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1),
      border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1),
      transform 0.2s cubic-bezier(0, 0, 0.2, 1),
      box-shadow 0.25s cubic-bezier(0, 0, 0.2, 1);
  }

  .insight-card:hover {
    background: var(--bg-hover);
    border-color: color-mix(in srgb, var(--art-primary) 28%, var(--default-border));
    box-shadow:
      0 12px 34px -18px rgb(0 0 0 / 58%),
      0 0 0 1px color-mix(in srgb, var(--art-primary) 12%, transparent);
    transform: translateY(-2px);
  }

  .insight-card.insight-expanded {
    background: color-mix(in srgb, var(--art-primary) 8%, transparent);
    border-color: color-mix(in srgb, var(--art-primary) 34%, var(--default-border));
  }

  .insight-icon-wrap {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    margin-top: 2px;
    color: var(--art-primary);
    background: color-mix(in srgb, var(--art-primary) 10%, transparent);
    border-radius: 7px;
  }

  .insight-content {
    flex: 1;
    min-width: 0;
  }

  .insight-tag {
    display: inline-block;
    padding: 1px 7px;
    margin-bottom: 5px;
    font-size: 10px;
    font-weight: 600;
    color: var(--art-primary);
    letter-spacing: 0.3px;
    background: color-mix(in srgb, var(--art-primary) 12%, transparent);
    border-radius: 10px;
  }

  .insight-text {
    display: -webkit-box;
    margin: 0;
    overflow: hidden;
    font-size: 11.5px;
    line-height: 1.6;
    color: var(--text-secondary);
    transition: all 0.3s;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .insight-expanded .insight-text {
    overflow: visible;
    -webkit-line-clamp: unset;
    line-clamp: unset;
  }

  .insight-arrow {
    flex-shrink: 0;
    margin-top: 4px;
    color: var(--text-muted);
    transition: transform 0.25s;
  }

  .insight-arrow.rotated {
    transform: rotate(90deg);
  }

  /* ═══════════════════════════════════════════════
   响应式
═══════════════════════════════════════════════ */
  @media (width <= 1200px) {
    .main-layout {
      grid-template-columns: 1fr;
    }

    .right-panel {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
  }

  @media (width <= 900px) {
    .right-panel {
      grid-template-columns: 1fr;
    }
  }

  @media (width <= 600px) {
    .page-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .filters {
      width: 100%;
    }

    .aapp-filter-panel {
      width: 100%;
    }

    .aapp-filter-date,
    .aapp-filter-select {
      width: 100%;
      min-width: 0;
    }

    .main-layout {
      padding: 0 12px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .fishbone-line::after,
    .fishbone-chip::after,
    .fishbone-dot::after {
      animation: none !important;
    }

    .kpi-card,
    .chart-panel,
    .table-panel,
    .ai-insight-panel,
    .aapp-query-btn,
    .back-btn,
    :deep(.aapp-filter-select .el-select__wrapper),
    :deep(.aapp-filter-date .el-input__wrapper) {
      transition: none !important;
    }

    .kpi-card:hover,
    .kpi-card:active,
    .chart-panel:hover,
    .table-panel:hover,
    .ai-insight-panel:hover {
      filter: none !important;
      box-shadow: none !important;
      transform: none !important;
    }
  }
</style>
