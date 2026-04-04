<template>
  <div class="pad-page art-full-height">
    <div class="pad-page-fx" aria-hidden="true" />

    <!-- ── 顶栏筛选（日期自定义；应用/广告平台/国家来自 cockpit meta-filter Store）──── -->
    <header class="pad-filter-bar">
      <div class="pad-filter-bar__inner">
        <div class="pad-filter-item pad-filter-item--date">
          <ElIcon class="pad-filter-item__icon" aria-hidden="true"><Calendar /></ElIcon>
          <span v-if="isLast7DaysPreset" class="pad-filter-date-preset">近7天</span>
          <ElDatePicker
            v-model="dateRange"
            type="daterange"
            unlink-panels
            range-separator="~"
            value-format="YYYY-MM-DD"
            format="YYYY-MM-DD"
            :clearable="false"
            class="pad-filter-date"
            popper-class="pad-filter-date-popper"
          />
        </div>

        <div class="pad-filter-item pad-filter-item--select">
          <span class="pad-filter-item__prefix">应用：</span>
          <ElSelect
            v-model="filters.appId"
            class="pad-filter-select pad-filter-select--app"
            filterable
            placeholder="全部"
            popper-class="pad-filter-select-popper"
          >
            <ElOption
              v-for="opt in appOptions"
              :key="opt.value === '' ? '__all_app__' : opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </ElSelect>
        </div>

        <div class="pad-filter-item pad-filter-item--select">
          <span class="pad-filter-item__prefix">广告平台：</span>
          <ElSelect
            v-model="filters.source"
            class="pad-filter-select pad-filter-select--source"
            placeholder="全部"
            popper-class="pad-filter-select-popper"
          >
            <ElOption
              v-for="opt in sourceOptions"
              :key="opt.value === '' ? '__all_src__' : opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </ElSelect>
        </div>

        <div class="pad-filter-item pad-filter-item--select">
          <span class="pad-filter-item__prefix">国家：</span>
          <ElSelect
            v-model="filters.s_country_code"
            class="pad-filter-select pad-filter-select--country"
            filterable
            placeholder="全部"
            popper-class="pad-filter-select-popper"
          >
            <ElOption
              v-for="opt in countryOptions"
              :key="opt.value === '' ? '__all_cty__' : opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </ElSelect>
        </div>

        <ElButton round class="pad-filter-search" :icon="Search" @click="loadPage">查询</ElButton>
      </div>
    </header>

    <div v-loading="pageLoading" class="pad-page-content">
      <!-- ── 顶栏 KPI（结构与综合分析页 KpiCard 一致）──────────────── -->
      <section class="pad-kpi-grid">
        <article
          v-for="(card, kpiIndex) in pageData?.kpis ?? []"
          :key="card.id"
          class="pad-kpi"
          :class="`pad-kpi--${kpiCardTheme(kpiIndex)}`"
        >
          <div class="pad-kpi__border-spin" aria-hidden="true" />
          <div class="pad-kpi__inner">
            <div class="pad-kpi__title">{{ card.title }}</div>
            <div class="pad-kpi__value tabular-nums">{{ card.primaryValue }}</div>
            <div v-if="card.subTitle" class="pad-kpi__sub">{{ card.subTitle }}</div>
            <div class="pad-kpi__tip-row">
              <div class="pad-kpi__compare" :class="card.trendUp ? 'is-up' : 'is-down'">
                <el-icon class="pad-kpi__compare-icon" aria-hidden="true">
                  <Top v-if="card.trendUp" />
                  <Bottom v-else />
                </el-icon>
                <span class="pad-kpi__compare-pct tabular-nums">{{ card.trendText }}</span>
                <span v-if="card.trendCompareLabel" class="pad-kpi__compare-label">{{
                  card.trendCompareLabel
                }}</span>
              </div>
            </div>
          </div>
        </article>
      </section>

      <main class="pad-main">
        <!-- ── 面包屑导航 ──────────────────────────────────────── -->
        <div class="pad-nav-bar">
          <el-breadcrumb separator="›" class="pad-breadcrumb">
            <el-breadcrumb-item to="/user-growth/comprehensive-analysis"
              >综合分析</el-breadcrumb-item
            >
            <el-breadcrumb-item>应用层面</el-breadcrumb-item>
          </el-breadcrumb>
          <div class="pad-current-view">
            <span class="pad-current-view__badge">当前查看</span>
            <span class="pad-current-view__text">
              <strong>{{ sourceName }}</strong>
              <span class="pad-current-view__dim">×</span>
              <span>{{ selectedAppLabel }}</span>
              <span class="pad-current-view__dim">×</span>
              <span>{{ selectedSourceLabel }}</span>
              <span class="pad-current-view__dim">×</span>
              <span>{{ selectedCountryLabel }}</span>
            </span>
          </div>
        </div>

        <!-- ── 左右主体 ──────────────────────────────────────────── -->
        <div class="pad-body">
          <!-- ── 左列 ──────────────────────────────────────────── -->
          <div class="pad-left">
            <!-- 第一行：安卓 / iOS / 合计 三张卡片横排 -->
            <div class="pad-stat-row">
              <div
                v-for="card in pageData?.statCards ?? []"
                :key="card.label"
                class="pad-stat-card"
                :class="padStatCardThemeClass(card.platform)"
              >
                <div class="pad-stat-card__content">
                  <div class="pad-stat-card__header">
                    <span class="pad-stat-card__label">{{ card.label }}</span>
                    <span
                      v-if="card.platform === 'android'"
                      class="pad-os-badge pad-os-badge--android"
                      >安卓</span
                    >
                    <span v-else-if="card.platform === 'ios'" class="pad-os-badge pad-os-badge--ios"
                      >iOS</span
                    >
                  </div>
                  <div class="pad-stat-rows">
                    <div class="pad-stat-row-item">
                      <span class="pad-stat-label">广告支出</span>
                      <span class="pad-stat-value tabular-nums">{{ card.adSpend }}</span>
                    </div>
                    <div class="pad-stat-row-item">
                      <span class="pad-stat-label">首日ROI</span>
                      <span class="pad-stat-value pad-stat-value--accent tabular-nums">{{
                        card.roi
                      }}</span>
                    </div>
                    <div class="pad-stat-row-item">
                      <span class="pad-stat-label">安装数</span>
                      <span class="pad-stat-value tabular-nums">{{ card.installs }}</span>
                    </div>
                    <div class="pad-stat-row-item">
                      <span class="pad-stat-label">预估利润</span>
                      <span class="pad-stat-value tabular-nums">{{ card.profit }}</span>
                    </div>
                    <div class="pad-stat-row-item">
                      <span class="pad-stat-label">活跃平台</span>
                      <span class="pad-stat-value tabular-nums">{{ card.activePlatforms }}个</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 第二行：CPI 趋势 + ECPM 趋势左右并排 -->
            <div class="pad-charts-row">
              <ElCard class="pad-panel pad-panel--split-chart pad-panel--chart-cpi" shadow="never">
                <template #header>
                  <span class="pad-chart-card__title">广告平台 CPI 趋势</span>
                </template>
                <div class="pad-chart-plot">
                  <div ref="cpiTrendRef" class="pad-chart pad-chart--trend"></div>
                </div>
              </ElCard>
              <ElCard class="pad-panel pad-panel--split-chart pad-panel--chart-ecpm" shadow="never">
                <template #header>
                  <span class="pad-chart-card__title">ECPM 趋势</span>
                </template>
                <div class="pad-chart-plot pad-chart-plot--with-footer">
                  <div ref="ecpmRef" class="pad-chart pad-chart--ecpm"></div>
                </div>
                <div v-if="pageData?.ecpmMetrics" class="ecpm-metrics">
                  <div class="ecpm-metric ecpm-metric--teal">
                    <div class="ecpm-metric__label">预估ECPM</div>
                    <div class="ecpm-metric__value tabular-nums">
                      {{ pageData.ecpmMetrics.estimatedEcpm }}
                    </div>
                  </div>
                  <div class="ecpm-metric ecpm-metric--orange">
                    <div class="ecpm-metric__label">真实ECPM</div>
                    <div class="ecpm-metric__value tabular-nums">
                      {{ pageData.ecpmMetrics.actualEcpm }}
                    </div>
                  </div>
                  <div class="ecpm-metric ecpm-metric--red">
                    <div class="ecpm-metric__label">偏差率</div>
                    <div class="ecpm-metric__value tabular-nums">
                      {{ pageData.ecpmMetrics.biasRate }}
                    </div>
                  </div>
                  <div class="ecpm-metric ecpm-metric--red">
                    <div class="ecpm-metric__label">偏差金额</div>
                    <div class="ecpm-metric__value tabular-nums">
                      {{ pageData.ecpmMetrics.biasAmount }}
                    </div>
                  </div>
                </div>
              </ElCard>
            </div>
          </div>

          <!-- ── 右列：广告平台 × 国家 明细表（高度与左列趋势区对齐）──── -->
          <div class="pad-right">
            <ElCard class="pad-panel pad-panel--matrix" shadow="never">
              <template #header>
                <div class="panel-header-row">
                  <span class="pad-matrix-card__title">广告平台 × 国家 明细表</span>
                  <div class="matrix-actions">
                    <ElButton size="small" round plain @click="expandAll">全部展开</ElButton>
                    <ElButton size="small" round plain @click="collapseAll">全部收起</ElButton>
                    <ElButton size="small" round plain>自定义列</ElButton>
                    <ElButton size="small" round type="primary" plain>↓ 导出</ElButton>
                  </div>
                </div>
              </template>

              <div class="pad-matrix-body">
                <ElTable
                  ref="matrixTableRef"
                  class="pad-matrix-table"
                  :data="pageData?.matrixTable.rows ?? []"
                  row-key="id"
                  :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
                  :row-class-name="getRowClassName"
                  :row-style="getRowStyle"
                  size="small"
                  stripe
                  style="width: 100%"
                  height="100%"
                  default-expand-all
                >
                  <ElTableColumn
                    prop="platform"
                    label="广告平台"
                    min-width="80"
                    show-overflow-tooltip
                    fixed
                  >
                    <template #default="{ row }">
                      <div v-if="!row.isCountry" class="platform-cell">
                        <span class="platform-name">{{ row.platform }}</span>
                        <span class="country-count">共{{ row.countryCount }}个国家</span>
                      </div>
                      <div v-else class="country-cell">
                        <span
                          v-if="countryFlagFiClass(row.s_country_code)"
                          class="country-flag fi"
                          :class="'fi-' + countryFlagFiClass(row.s_country_code)"
                          aria-hidden="true"
                        />
                        <span class="country-name">{{ row.country }}</span>
                      </div>
                    </template>
                  </ElTableColumn>
                  <ElTableColumn prop="adSpend" label="广告支出" min-width="70" align="left" />
                  <ElTableColumn prop="cpi" label="CPI" min-width="68" align="center">
                    <template #default="{ row }">
                      <span class="cpi-badge" :class="`cpi-badge--${row.cpiLevel}`">{{
                        row.cpi
                      }}</span>
                    </template>
                  </ElTableColumn>
                  <ElTableColumn prop="cpm" label="CPM" min-width="60" align="left" />
                  <ElTableColumn prop="cpc" label="CPC" min-width="50" align="left" />
                  <ElTableColumn prop="roiD1" label="首日ROI" min-width="72" align="center">
                    <template #default="{ row }">
                      <span class="roi-badge" :class="`roi-badge--${row.roiD1Level}`">{{
                        row.roiD1
                      }}</span>
                    </template>
                  </ElTableColumn>
                  <ElTableColumn prop="roiD3" label="3日ROI" min-width="68" align="left" />
                  <ElTableColumn prop="roiD7" label="7日ROI" min-width="68" align="left" />
                  <ElTableColumn prop="profit" label="预估利润" min-width="70" align="left">
                    <template #default="{ row }">
                      <span :class="{ 'profit-neg': row.profitNeg }">{{ row.profit }}</span>
                    </template>
                  </ElTableColumn>
                  <ElTableColumn label="走势" min-width="68" align="left">
                    <template #default="{ row }">
                      <svg class="sparkline" viewBox="0 0 60 24">
                        <polyline
                          :points="sparklinePoints(row.sparkline)"
                          :stroke="row.profitNeg ? '#ef4444' : '#22c55e'"
                          stroke-width="1.5"
                          fill="none"
                        />
                      </svg>
                    </template>
                  </ElTableColumn>
                </ElTable>

                <div v-if="pageData?.matrixTable.total" class="matrix-total-row">
                  <span class="total-label">合计</span>
                  <span>{{ pageData.matrixTable.total.adSpend }}</span>
                  <span>{{ pageData.matrixTable.total.cpi }}</span>
                  <span>{{ pageData.matrixTable.total.cpm }}</span>
                  <span>{{ pageData.matrixTable.total.cpc }}</span>
                  <span>{{ pageData.matrixTable.total.roiD1 }}</span>
                  <span>{{ pageData.matrixTable.total.roiD3 }}</span>
                  <span>{{ pageData.matrixTable.total.roiD7 }}</span>
                  <span>{{ pageData.matrixTable.total.profit }}</span>
                  <span class="matrix-total-spark" aria-hidden="true">—</span>
                </div>
              </div>
            </ElCard>
          </div>
        </div>

        <!-- ── 底部智能预警栏 ─────────────────────────────────── -->
        <div class="pad-alert-bar">
          <template v-for="(alert, i) in pageData?.alertBar ?? []" :key="alert.id">
            <span v-if="i > 0" class="alert-sep"></span>
            <span class="alert-item" :class="`alert-item--${alert.level}`">
              <span class="alert-dot" :class="`alert-dot--${alert.level}`"></span>
              {{ alert.text }}
            </span>
          </template>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
  import 'flag-icons/css/flag-icons.min.css'
  import { ref, reactive, computed, onMounted, watch } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useRoute } from 'vue-router'
  import { Top, Bottom, Calendar, Search } from '@element-plus/icons-vue'
  import { useCockpitMetaFilterStore } from '@/store/modules/cockpit-meta-filter'
  import { resolveDateRangeFromPreset } from '../comprehensive-analysis/utils/buildApiParams'
  import { useChart } from '@/hooks/core/useChart'
  import type { EChartsOption } from '@/plugins/echarts'
  import type { PlatformAnalysisDetailData } from './types'
  import { loadPlatformAnalysisDetailPage } from '@/api/user-growth'

  defineOptions({ name: 'PlatformAnalysisDetail' })

  const route = useRoute()

  const cockpitMetaStore = useCockpitMetaFilterStore()
  const { data: cockpitMetaRef } = storeToRefs(cockpitMetaStore)

  const pageData = ref<PlatformAnalysisDetailData | null>(null)
  const pageLoading = ref(false)
  const matrixTableRef = ref()

  const preset7d = resolveDateRangeFromPreset('7d')
  const dateRange = ref<[string, string]>([preset7d.date_start, preset7d.date_end])

  const filters = reactive({
    appId: '' as string,
    source: '' as string,
    s_country_code: '' as string
  })

  const appOptions = ref<{ label: string; value: string }[]>([])
  const sourceOptions = ref<{ label: string; value: string }[]>([])
  const countryOptions = ref<{ label: string; value: string }[]>([])

  function normalizeMetaOptions(list: { label: string; value: string }[]) {
    return list.map((o) => ({
      ...o,
      value: o.value === 'all' ? '' : o.value
    }))
  }

  function syncMetaOptions() {
    const m = cockpitMetaRef.value
    if (!m) return
    appOptions.value = normalizeMetaOptions(m.appOptions)
    sourceOptions.value = normalizeMetaOptions(m.sourceOptions)
    countryOptions.value = normalizeMetaOptions(m.countryOptions)
  }

  const isLast7DaysPreset = computed(() => {
    const cur = dateRange.value
    if (!cur?.[0] || !cur?.[1]) return false
    const p = resolveDateRangeFromPreset('7d')
    return cur[0] === p.date_start && cur[1] === p.date_end
  })

  function optionLabel(value: string, options: { label: string; value: string }[]) {
    if (value === '' || value === 'all') return '全部'
    const o = options.find((x) => x.value === value)
    return o?.label ?? value
  }

  const selectedAppLabel = computed(() => optionLabel(filters.appId, appOptions.value))
  const selectedSourceLabel = computed(() => optionLabel(filters.source, sourceOptions.value))
  const selectedCountryLabel = computed(() =>
    optionLabel(filters.s_country_code, countryOptions.value)
  )

  function dimensionToApi(v: string) {
    return v === 'all' || v === '' ? '' : v
  }

  function buildRequest(): Api.UserGrowth.PlatformAnalysisDetailRequest {
    const name = ((route.query.name as string) || '应用').trim()
    const dr = dateRange.value
    const fallback = resolveDateRangeFromPreset('7d')
    return {
      name,
      startDate: dr?.[0] ?? fallback.date_start,
      endDate: dr?.[1] ?? fallback.date_end,
      appId: dimensionToApi(filters.appId),
      source: dimensionToApi(filters.source),
      s_country_code: dimensionToApi(filters.s_country_code)
    }
  }

  async function loadPage() {
    pageLoading.value = true
    try {
      pageData.value = await loadPlatformAnalysisDetailPage(buildRequest())
    } catch {
      // 错误提示由 http 拦截器处理
    } finally {
      pageLoading.value = false
    }
    renderCharts()
  }

  /** 与广告成效 KPI 卡片一致的主题轮换（光晕 / 旋转边框色） */
  function kpiCardTheme(index: number): string {
    const themes = ['spend', 'cpi', 'active', 'alert', 'roi', 'profit']
    return themes[index % themes.length] ?? 'spend'
  }

  /** 安卓 / iOS / 合计 统计卡主题（对齐广告成效色系） */
  function padStatCardThemeClass(platform: string | undefined): string {
    if (platform === 'android') return 'pad-stat-card--android'
    if (platform === 'ios') return 'pad-stat-card--ios'
    return 'pad-stat-card--total'
  }

  /** 优先展示接口回传的 sourceName，避免与钻取名不一致 */
  const sourceName = computed(() => {
    const q = (route.query.name as string)?.trim()
    return pageData.value?.sourceName?.trim() || q || '应用'
  })

  const COUNTRY_CODE_ALIASES: Record<string, string> = { UK: 'gb' }

  /** flag-icons 类名后缀（小写 ISO alpha-2）；非法则返回空字符串不渲染国旗 */
  function countryFlagFiClass(code: string | undefined): string {
    if (!code || typeof code !== 'string') return ''
    const t = code.trim()
    if (!/^[A-Za-z]{2}$/.test(t)) return ''
    const u = t.toUpperCase()
    return (COUNTRY_CODE_ALIASES[u] ?? t).toLowerCase()
  }

  // 图表
  const cpiTrendChart = useChart()
  const ecpmChart = useChart()
  const cpiTrendRef = cpiTrendChart.chartRef
  const ecpmRef = ecpmChart.chartRef

  // ─── 树形表行样式（借鉴 ad-performance-table 的 row-accent 模式）──

  const PLATFORM_ACCENT: Record<string, string> = {
    'Google Ads': '#3B82F6',
    TikTok: '#10B981',
    Facebook: '#2563EB',
    Unity: '#8B5CF6',
    Kwai: '#F97316',
    Bigo: '#EC4899'
  }

  function getRowAccent(row: { platform: string }) {
    return PLATFORM_ACCENT[row.platform] ?? 'var(--art-primary)'
  }

  function getRowClassName({ row }: { row: any }) {
    return row.isCountry ? 'is-level-country' : 'is-level-platform'
  }

  function getRowStyle({ row }: { row: any }) {
    return { '--row-accent': getRowAccent(row) } as Record<string, string>
  }

  // 树形表操作
  function expandAll() {
    const rows = pageData.value?.matrixTable.rows ?? []
    rows.forEach((row) => matrixTableRef.value?.toggleRowExpansion(row, true))
  }
  function collapseAll() {
    const rows = pageData.value?.matrixTable.rows ?? []
    rows.forEach((row) => matrixTableRef.value?.toggleRowExpansion(row, false))
  }

  // sparkline svg 点
  function sparklinePoints(data: number[]): string {
    if (!data || data.length === 0) return ''
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1
    if (data.length === 1) return `30,${12}`
    const step = 60 / (data.length - 1)
    return data.map((v, i) => `${i * step},${24 - ((v - min) / range) * 20}`).join(' ')
  }

  // ─── CPI 趋势图 ────────────────────────────────────────────────

  function buildCpiOption(): EChartsOption {
    const d = pageData.value?.cpiTrend
    if (!d) return {}
    const { getAxisLineStyle, getSplitLineStyle, getAxisLabelStyle, getTooltipStyle } =
      cpiTrendChart
    const legendNames = d.series.filter((s) => !s.dashed).map((s) => s.name)
    /**
     * 仅通过 grid 把「折线绘图区」下移，图例 legend 的 top/样式可单独保持不动。
     * grid.top = 容器顶到坐标系矩形上边界的距离；与图例是两套布局，这里只调 grid。
     * 换行按偏保守的每行项数估算，避免窄卡片下行数低估；最多按 3 行留高。
     */
    const legendMaxRows = 3
    const legendItemsPerRowGuess = 4
    const legendRowHeightPx = 30
    const legendToChartGapPx = 22
    const legendRows = Math.min(
      legendMaxRows,
      Math.max(1, Math.ceil(legendNames.length / legendItemsPerRowGuess))
    )
    const chartGridTopPx = 6 + legendRows * legendRowHeightPx + legendToChartGapPx
    return {
      tooltip: { ...getTooltipStyle('axis') },
      legend: {
        type: 'plain',
        data: legendNames,
        orient: 'horizontal',
        top: 4,
        left: 0,
        right: 8,
        width: '100%',
        itemGap: 12,
        itemWidth: 14,
        itemHeight: 10,
        z: 10,
        textStyle: { color: 'var(--art-gray-600)', fontSize: 12, lineHeight: 16 }
      },
      grid: {
        top: chartGridTopPx,
        right: 12,
        bottom: 32,
        left: 4,
        containLabel: true,
        z: 2
      },
      xAxis: {
        type: 'category',
        data: d.dates,
        axisLine: getAxisLineStyle(),
        axisTick: { show: false },
        axisLabel: getAxisLabelStyle()
      },
      yAxis: {
        type: 'value',
        axisLabel: { ...getAxisLabelStyle(), formatter: '${value}' },
        splitLine: getSplitLineStyle()
      },
      series: d.series.map((s) => ({
        name: s.name,
        type: 'line',
        smooth: !s.dashed,
        data: s.data,
        lineStyle: {
          color: s.color,
          width: s.dashed ? 1 : 2,
          type: s.dashed ? ('dashed' as const) : ('solid' as const)
        },
        itemStyle: { color: s.color },
        symbol: s.dashed ? 'none' : 'circle',
        symbolSize: 3,
        areaStyle: s.dashed ? undefined : { color: s.color, opacity: 0.06 }
      }))
    }
  }

  // ─── ECPM 趋势图 ────────────────────────────────────────────────

  function buildEcpmOption(): EChartsOption {
    const d = pageData.value?.ecpmTrend
    if (!d) return {}
    const { getAxisLineStyle, getSplitLineStyle, getAxisLabelStyle, getTooltipStyle } = ecpmChart
    return {
      tooltip: { ...getTooltipStyle('axis') },
      legend: {
        data: ['预估ECPM', '真实ECPM'],
        top: 0,
        right: 0,
        textStyle: { color: 'var(--art-gray-600)', fontSize: 11 },
        itemWidth: 20,
        itemHeight: 8
      },
      grid: { top: 28, right: 10, bottom: 30, left: 0, containLabel: true },
      xAxis: {
        type: 'category',
        data: d.dates,
        axisLine: getAxisLineStyle(),
        axisTick: { show: false },
        axisLabel: getAxisLabelStyle()
      },
      yAxis: {
        type: 'value',
        min: (v: any) => Math.floor(v.min - 2),
        axisLabel: getAxisLabelStyle(),
        splitLine: getSplitLineStyle()
      },
      series: [
        {
          name: '预估ECPM',
          type: 'line',
          smooth: true,
          data: d.series[0]?.data ?? [],
          lineStyle: { color: '#f59e0b', width: 2, type: 'dashed' },
          itemStyle: { color: '#f59e0b' },
          symbol: 'none',
          areaStyle: { color: '#f59e0b', opacity: 0.15 }
        },
        {
          name: '真实ECPM',
          type: 'line',
          smooth: true,
          data: d.series[1]?.data ?? [],
          lineStyle: { color: '#14b8a6', width: 2 },
          itemStyle: { color: '#14b8a6' },
          symbol: 'none',
          areaStyle: { color: '#14b8a6', opacity: 0.2 }
        }
      ]
    }
  }

  function renderCharts() {
    cpiTrendChart.initChart(buildCpiOption())
    ecpmChart.initChart(buildEcpmOption())
  }

  watch(pageData, renderCharts, { deep: true })

  watch(cockpitMetaRef, syncMetaOptions, { immediate: true })

  watch(
    () => route.query.name,
    () => {
      loadPage()
    }
  )

  onMounted(async () => {
    await cockpitMetaStore.ensureLoaded()
    syncMetaOptions()
    await loadPage()
  })
</script>

<style scoped lang="scss">
  /* 整页滚动：固定可视高度 + 纵向 auto，避免只在 main/表格内出现滚动条 */
  .pad-page {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    min-width: 0;
    height: var(--art-full-height, 100%);
    max-height: var(--art-full-height, 100%);
    padding: 14px 20px;
    overflow: hidden auto;
    background-color: var(--default-bg-color);
    background-image: linear-gradient(
      165deg,
      color-mix(in srgb, var(--default-bg-color) 100%, rgb(15 23 42 / 35%)) 0%,
      var(--default-bg-color) 42%,
      color-mix(in srgb, var(--default-bg-color) 94%, rgb(8 12 24)) 100%
    );

    /* 顶部极光辐射，向下淡出 */
    &::before {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      content: '';
      background:
        radial-gradient(
          ellipse 72% 52% at 8% 4%,
          rgb(16 185 129 / 36%) 0%,
          rgb(6 182 212 / 16%) 40%,
          transparent 58%
        ),
        radial-gradient(
          ellipse 58% 44% at 92% 6%,
          rgb(59 130 246 / 32%) 0%,
          rgb(139 92 246 / 14%) 40%,
          transparent 58%
        ),
        radial-gradient(ellipse 44% 36% at 50% 14%, rgb(168 85 247 / 14%) 0%, transparent 52%),
        radial-gradient(
          ellipse 52% 40% at 78% 2%,
          rgb(34 211 238 / 16%) 0%,
          rgb(59 130 246 / 8%) 42%,
          transparent 56%
        );
      mask-image: linear-gradient(to bottom, black 0%, black 32%, transparent 62%);
      animation:
        pad-aurora-drift 16s ease-in-out infinite alternate,
        pad-bg-flow 24s ease-in-out infinite alternate;
    }

    /* 顶部细网格，与极光同区域淡出 */
    &::after {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      content: '';
      background-image:
        linear-gradient(rgb(186 230 253 / 4%) 1px, transparent 1px),
        linear-gradient(90deg, rgb(186 230 253 / 4%) 1px, transparent 1px),
        radial-gradient(circle, rgb(6 182 212 / 6%) 1px, transparent 1px);
      background-size:
        40px 40px,
        40px 40px,
        80px 80px;
      mask-image: linear-gradient(to bottom, black 0%, black 22%, transparent 48%);
    }

    > *:not(.pad-page-fx) {
      position: relative;
      z-index: 1;
    }
  }

  .pad-page-content {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    min-height: 320px;
  }

  .pad-filter-bar {
    flex-shrink: 0;
    margin-bottom: 14px;
  }

  .pad-filter-bar__inner {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 12px;
    align-items: center;
    padding: 14px 18px;
    background: color-mix(in srgb, rgb(8 8 12) 94%, transparent);
    border: 1px solid color-mix(in srgb, var(--art-primary) 26%, var(--default-border));
    border-radius: 14px;
    box-shadow:
      0 6px 28px rgb(0 0 0 / 38%),
      inset 0 1px 0 rgb(255 255 255 / 8%),
      0 0 0 1px color-mix(in srgb, var(--art-primary) 10%, transparent);
  }

  .pad-filter-item {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    min-height: 40px;
    padding: 4px 14px;
    background: color-mix(in srgb, var(--default-box-color) 50%, rgb(10 12 20));
    border: 1px solid color-mix(in srgb, var(--default-border) 90%, rgb(148 163 184 / 20%));
    border-radius: 12px;
    transition:
      border-color var(--duration-fast) var(--ease-default),
      box-shadow var(--duration-fast) var(--ease-default);

    &:hover {
      border-color: color-mix(in srgb, var(--art-primary) 40%, var(--default-border));
      box-shadow: 0 0 18px color-mix(in srgb, var(--art-primary) 12%, transparent);
    }

    &--date {
      flex: 1 1 300px;
      min-width: min(100%, 272px);
    }

    &--select {
      flex: 0 1 auto;
    }

    &__icon {
      flex-shrink: 0;
      font-size: 18px;
      color: var(--art-primary);
    }

    &__prefix {
      flex-shrink: 0;
      font-size: 13px;
      font-weight: 600;
      color: var(--text-secondary);
      white-space: nowrap;
    }
  }

  .pad-filter-date-preset {
    flex-shrink: 0;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
  }

  :deep(.pad-filter-date.el-date-editor) {
    flex: 1 1 200px;
    width: auto !important;
    min-width: 0;
  }

  :deep(.pad-filter-date .el-input__wrapper) {
    padding: 2px 6px 2px 2px;
    background: transparent;
    border: none;
    box-shadow: none;
  }

  :deep(.pad-filter-date .el-input__inner) {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
  }

  :deep(.pad-filter-date .el-range-separator) {
    padding: 0 4px;
    font-weight: 600;
    color: var(--text-tertiary);
  }

  :deep(.pad-filter-date .el-range-input) {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .pad-filter-select {
    width: 168px;
    min-width: 120px;

    &--app {
      min-width: 148px;
    }

    &--country {
      min-width: 136px;
    }
  }

  :deep(.pad-filter-select .el-select__wrapper) {
    min-height: 32px;
    padding: 2px 10px;
    background: transparent;
    border: none;
    box-shadow: none;
  }

  :deep(.pad-filter-select .el-select__placeholder) {
    font-size: 13px;
    color: var(--text-tertiary);
  }

  :deep(.pad-filter-select .el-select__selected-item) {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
  }

  :deep(.pad-filter-select .el-select__caret) {
    color: var(--text-tertiary);
  }

  .pad-filter-search {
    --el-button-bg-color: color-mix(in srgb, var(--el-color-primary) 10%, transparent);
    --el-button-text-color: var(--el-color-primary);
    --el-button-border-color: color-mix(in srgb, var(--el-color-primary) 42%, transparent);
    --el-button-hover-text-color: var(--text-primary);
    --el-button-hover-border-color: var(--el-color-primary);
    --el-button-hover-bg-color: color-mix(in srgb, var(--el-color-primary) 18%, transparent);

    box-shadow: 0 0 14px color-mix(in srgb, var(--el-color-primary) 10%, transparent);
    transition:
      box-shadow 0.22s var(--ease-default),
      transform 0.18s var(--ease-default);

    &:hover {
      box-shadow: 0 0 22px color-mix(in srgb, var(--el-color-primary) 22%, transparent);
      transform: translateY(-1px);
    }
  }

  .pad-page-fx {
    position: absolute;
    inset: -10% -10% 42%;
    z-index: 0;
    pointer-events: none;
    background: conic-gradient(
      from 0deg at 50% 50%,
      transparent 0deg,
      rgb(59 130 246 / 11%) 55deg,
      rgb(6 182 212 / 8%) 82deg,
      transparent 128deg,
      rgb(16 185 129 / 9%) 198deg,
      rgb(52 211 153 / 6%) 228deg,
      transparent 288deg,
      rgb(168 85 247 / 8%) 332deg,
      rgb(249 115 22 / 5%) 352deg,
      transparent 360deg
    );
    opacity: 0.8;
    mask-image: linear-gradient(to bottom, black 0%, black 48%, transparent 82%);
    animation: pad-fx-spin 56s linear infinite;
    will-change: transform;
  }

  @keyframes pad-aurora-drift {
    0% {
      filter: hue-rotate(0deg);
      opacity: 0.68;
      transform: scale(1) translate(0, 0);
    }

    50% {
      filter: hue-rotate(14deg);
      opacity: 0.95;
      transform: scale(1.05) translate(1%, -1%);
    }

    100% {
      filter: hue-rotate(-10deg);
      opacity: 0.78;
      transform: scale(1) translate(-1%, 0.8%);
    }
  }

  @keyframes pad-bg-flow {
    0% {
      opacity: 0.65;
      transform: scaleY(1) skewX(0deg);
    }

    100% {
      opacity: 0.92;
      transform: scaleY(1.06) skewX(0.8deg);
    }
  }

  @keyframes pad-fx-spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* 旋转渐变边框（与广告成效 KPI 卡片同源视觉） */
  @property --pad-kpi-border-angle {
    syntax: '<angle>';
    initial-value: 0deg;
    inherits: false;
  }

  // ── KPI 行（视觉对齐广告成效 ad-performance-kpi-cards）──────────
  .pad-kpi-grid {
    display: grid;
    flex-shrink: 0;
    grid-template-columns: repeat(5, 1fr);
    gap: 16px;
    margin-bottom: 16px;
  }

  @media (width <= 1536px) {
    .pad-kpi-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  @media (width <= 1280px) {
    .pad-kpi-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  @media (width <= 980px) {
    .pad-kpi-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (width <= 560px) {
    .pad-kpi-grid {
      grid-template-columns: 1fr;
    }
  }

  .pad-kpi {
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
    min-height: 112px;
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
      box-shadow 0.4s var(--ease-out),
      border-color 0.28s var(--ease-default);

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

    > *:not(.pad-kpi__border-spin) {
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

    &--spend {
      --kpi-accent: #f97316;
      --kpi-accent-2: #fbbf24;
      --kpi-glow: rgb(249 115 22 / 45%);
      --kpi-glow-2: rgb(251 191 36 / 22%);
      --kpi-spin-a: rgb(249 115 22 / 62%);
      --kpi-spin-b: rgb(239 68 68 / 48%);
      --kpi-spin-c: rgb(251 191 36 / 42%);
    }

    &--cpi {
      --kpi-accent: #10b981;
      --kpi-accent-2: #22d3ee;
      --kpi-glow: rgb(16 185 129 / 45%);
      --kpi-glow-2: rgb(34 211 238 / 22%);
      --kpi-spin-a: rgb(16 185 129 / 62%);
      --kpi-spin-b: rgb(34 211 238 / 48%);
      --kpi-spin-c: rgb(59 130 246 / 38%);
    }

    &--active {
      --kpi-accent: #3b82f6;
      --kpi-accent-2: #22d3ee;
      --kpi-glow: rgb(59 130 246 / 45%);
      --kpi-glow-2: rgb(34 211 238 / 22%);
      --kpi-spin-a: rgb(59 130 246 / 62%);
      --kpi-spin-b: rgb(34 211 238 / 48%);
      --kpi-spin-c: rgb(16 185 129 / 38%);
    }

    &--alert {
      --kpi-accent: #ef4444;
      --kpi-accent-2: #f97316;
      --kpi-glow: rgb(239 68 68 / 45%);
      --kpi-glow-2: rgb(249 115 22 / 22%);
      --kpi-spin-a: rgb(239 68 68 / 62%);
      --kpi-spin-b: rgb(249 115 22 / 48%);
      --kpi-spin-c: rgb(251 191 36 / 38%);
    }

    &--roi {
      --kpi-accent: #10b981;
      --kpi-accent-2: #34d399;
      --kpi-glow: rgb(16 185 129 / 45%);
      --kpi-glow-2: rgb(52 211 153 / 22%);
      --kpi-spin-a: rgb(52 211 153 / 62%);
      --kpi-spin-b: rgb(16 185 129 / 48%);
      --kpi-spin-c: rgb(34 211 238 / 38%);
    }

    &--profit {
      --kpi-accent: #a855f7;
      --kpi-accent-2: #818cf8;
      --kpi-glow: rgb(168 85 247 / 45%);
      --kpi-glow-2: rgb(129 140 248 / 22%);
      --kpi-spin-a: rgb(168 85 247 / 62%);
      --kpi-spin-b: rgb(129 140 248 / 48%);
      --kpi-spin-c: rgb(59 130 246 / 38%);
    }
  }

  .pad-kpi__border-spin {
    position: absolute;
    inset: -1px;
    z-index: 2;
    padding: 1.5px;
    pointer-events: none;
    background: conic-gradient(
      from var(--pad-kpi-border-angle, 0deg) at 50% 50%,
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
    animation: pad-kpi-border-spin 4s linear infinite;

    --pad-kpi-border-angle: 0deg;
  }

  @keyframes pad-kpi-border-spin {
    to {
      --pad-kpi-border-angle: 360deg;
    }
  }

  .pad-kpi__inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-width: 0;
    text-align: center;
  }

  .pad-kpi__title {
    margin-bottom: 8px;
    font-size: 12px;
    font-weight: 500;
    line-height: 1.3;
    color: var(--text-secondary);
    letter-spacing: 0.03em;
  }

  .pad-kpi__value {
    font-size: 22px;
    font-weight: 900;
    line-height: 1.2;
    color: var(--kpi-accent);
    text-shadow:
      0 0 12px color-mix(in srgb, var(--kpi-accent) 80%, transparent),
      0 0 30px color-mix(in srgb, var(--kpi-accent) 50%, transparent),
      0 0 60px color-mix(in srgb, var(--kpi-accent) 28%, transparent);
    filter: drop-shadow(0 0 4px color-mix(in srgb, var(--kpi-accent) 40%, transparent));
  }

  .pad-kpi__sub {
    max-width: 100%;
    margin-top: 4px;
    font-size: 11px;
    line-height: 1.35;
    color: var(--text-tertiary);
  }

  .pad-kpi__tip-row {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 22px;
    margin-top: 8px;
  }

  .pad-kpi__compare {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 4px 6px;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;

    &.is-up {
      color: var(--art-success);
      text-shadow: 0 0 8px rgb(16 185 129 / 40%);
    }

    &.is-down {
      color: var(--art-danger);
      text-shadow: 0 0 8px rgb(239 68 68 / 40%);
    }
  }

  .pad-kpi__compare-icon {
    font-size: 14px;
  }

  .pad-kpi__compare-pct {
    line-height: 1.2;
    white-space: nowrap;
  }

  .pad-kpi__compare-label {
    font-size: 11px;
    font-weight: 600;
    line-height: 1.2;
    white-space: nowrap;
    opacity: 0.9;
  }

  @media (prefers-reduced-motion: reduce) {
    .pad-page::before,
    .pad-page-fx {
      animation: none;
    }

    .pad-page-fx {
      transform: none;
    }

    .pad-filter-search:hover {
      transform: none;
    }

    .pad-kpi__border-spin {
      opacity: 0;
      animation: none;
    }

    .pad-kpi {
      transition: none;

      &:hover {
        transform: none;
      }
    }

    .pad-stat-card {
      transition: none;
    }

    .ecpm-metric:hover {
      transform: none;
    }
  }

  .pad-main {
    display: flex;
    flex: 0 0 auto;
    flex-direction: column;
    gap: 12px;
    overflow: visible;
  }

  // ── 面包屑（与顶栏 KPI 同系：深色底、微光、圆角）────────────────
  .pad-nav-bar {
    position: relative;
    display: flex;
    flex-shrink: 0;
    flex-wrap: wrap;
    gap: 12px 20px;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 2px 16px;
    overflow: hidden;
    background-color: rgb(8 8 12 / 96%);
    background-image:
      radial-gradient(
        ellipse 90% 120% at 0% 0%,
        color-mix(in srgb, var(--art-primary) 18%, transparent) 0%,
        transparent 55%
      ),
      radial-gradient(
        ellipse 70% 100% at 100% 50%,
        color-mix(in srgb, var(--art-success) 8%, transparent) 0%,
        transparent 50%
      ),
      linear-gradient(
        165deg,
        color-mix(in srgb, var(--default-box-color) 88%, rgb(8 8 12)) 0%,
        color-mix(in srgb, var(--default-box-color) 100%, rgb(12 12 18)) 100%
      );
    border: 1px solid color-mix(in srgb, var(--art-primary) 22%, var(--default-border));
    border-radius: 14px;
    box-shadow:
      0 4px 24px rgb(0 0 0 / 35%),
      inset 0 1px 0 rgb(255 255 255 / 8%);

    &::before {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 0;
      width: 100%;
      height: 1px;
      pointer-events: none;
      content: '';
      background: linear-gradient(
        90deg,
        transparent 0%,
        color-mix(in srgb, var(--art-primary) 55%, transparent) 22%,
        color-mix(in srgb, var(--art-success) 35%, transparent) 78%,
        transparent 100%
      );
      opacity: 0.85;
    }

    > * {
      position: relative;
      z-index: 1;
    }
  }

  .pad-breadcrumb {
    flex: 1;
    min-width: 0;
    padding: 2px 0;
    font-size: 13px;
    line-height: 1.5;

    :deep(.el-breadcrumb__separator) {
      margin: 0 6px;
      font-weight: 500;
      color: var(--text-tertiary);
    }

    :deep(.el-breadcrumb__item) {
      display: inline-flex;
      align-items: center;
    }

    :deep(.el-breadcrumb__inner) {
      font-weight: 500;
      color: var(--text-secondary);
    }

    :deep(.el-breadcrumb__inner.is-link) {
      font-weight: 500;
      color: var(--text-secondary);
      transition: color var(--duration-fast) var(--ease-default);
    }

    :deep(.el-breadcrumb__inner.is-link:hover) {
      color: var(--art-primary);
    }

    :deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
      font-weight: 600;
      color: var(--text-primary);
      cursor: default;
    }
  }

  .pad-current-view {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 12px;
    align-items: center;
    max-width: 100%;
    padding: 6px 12px;
    font-size: 12px;
    line-height: 1.4;
    color: var(--text-secondary);
    background: rgb(0 0 0 / 22%);
    border: 1px solid color-mix(in srgb, var(--default-border) 80%, transparent);
    border-radius: 10px;
  }

  .pad-current-view__badge {
    flex-shrink: 0;
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    background: color-mix(in srgb, var(--art-primary) 14%, transparent);
    border-radius: 6px;
  }

  .pad-current-view__text {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    min-width: 0;
    font-size: 12px;

    strong {
      font-weight: 800;
      color: var(--text-primary);
    }
  }

  .pad-current-view__dim {
    font-weight: 500;
    color: var(--text-tertiary);
    opacity: 0.75;
  }

  // ── 左右主体（保底高度拉高，图表/矩阵与视口比例更舒服）──────────
  .pad-body {
    display: grid;
    flex-shrink: 0;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    align-items: start;
    min-width: 0;

    /* 在父级 flex 剩余空间内至少占一大块纵向空间，避免主体被压得过矮 */
    min-height: clamp(520px, 56vh, 960px);
  }

  @media (height <= 700px) {
    .pad-body {
      min-height: clamp(300px, 46vh, 720px);
    }
  }

  // ── 左列 ─────────────────────────────────────────────────────
  .pad-left {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-width: 0;
    overflow: visible;
  }

  // CPI + ECPM 并排：保证图表区最小高度，避免被 flex 压扁
  .pad-charts-row {
    display: flex;
    flex: 0 0 auto;
    gap: 16px;
    align-items: stretch;
    min-width: 0;

    /* 左列内给趋势图稳定纵向空间（随视口略伸缩） */
    min-height: clamp(280px, 38vh, 480px);
  }

  .pad-panel--split-chart {
    --chart-accent: #3b82f6;
    --chart-accent-2: #22d3ee;
    --chart-glow: rgb(59 130 246 / 28%);

    position: relative;
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    background-color: rgb(8 8 12 / 94%) !important;
    background-image:
      radial-gradient(ellipse 90% 70% at 50% -30%, var(--chart-glow) 0%, transparent 55%),
      linear-gradient(
        168deg,
        color-mix(in srgb, var(--chart-accent) 12%, rgb(8 8 12)) 0%,
        rgb(8 8 12) 55%
      ) !important;
    border: 1px solid color-mix(in srgb, var(--chart-accent) 38%, var(--default-border)) !important;
    border-radius: 14px !important;
    box-shadow:
      0 10px 40px rgb(0 0 0 / 38%),
      inset 0 1px 0 rgb(255 255 255 / 8%);

    &::before {
      position: absolute;
      top: 0;
      left: 10%;
      z-index: 1;
      width: 80%;
      height: 1px;
      pointer-events: none;
      content: '';
      background: linear-gradient(
        90deg,
        transparent,
        var(--chart-accent),
        var(--chart-accent-2),
        transparent
      );
      opacity: 0.75;
    }

    :deep(.el-card__header) {
      position: relative;
      z-index: 2;
      padding: 12px 16px 10px;
      background: transparent !important;
      border-bottom: 1px solid color-mix(in srgb, var(--chart-accent) 16%, transparent) !important;
    }

    :deep(.el-card__body) {
      position: relative;
      z-index: 2;
      display: flex;
      flex: 1;
      flex-direction: column;
      gap: 0;
      min-height: 0;
      padding: 0 !important;
    }
  }

  .pad-panel--chart-cpi {
    --chart-accent: #3b82f6;
    --chart-accent-2: #38bdf8;
    --chart-glow: rgb(59 130 246 / 30%);
  }

  .pad-panel--chart-ecpm {
    --chart-accent: #14b8a6;
    --chart-accent-2: #f97316;
    --chart-glow: rgb(20 184 166 / 26%);
  }

  .pad-chart-card__title {
    font-size: 14px;
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: 0.02em;
  }

  .pad-chart-plot {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 220px;
    padding: 10px 12px 14px;
    margin: 0 10px 10px;
    background: rgb(0 0 0 / 28%);
    border: 1px solid color-mix(in srgb, var(--chart-accent) 14%, transparent);
    border-radius: 12px;
    box-shadow: inset 0 0 0 1px rgb(255 255 255 / 4%);

    &--with-footer {
      margin-bottom: 0;
      border-bottom: none;
      border-radius: 12px 12px 0 0;
    }
  }

  // ── 第一行：三张统计卡（视觉对齐广告成效 KPI / ad-detail 指标卡）────
  .pad-stat-row {
    display: grid;
    flex-shrink: 0;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
    align-items: stretch;
  }

  .pad-stat-card {
    --stat-accent: #3b82f6;
    --stat-accent-2: #22d3ee;
    --stat-glow: rgb(59 130 246 / 38%);

    position: relative;
    display: flex;
    flex-direction: column;
    min-width: 0;
    overflow: hidden;
    background-color: rgb(8 8 12 / 96%);
    background-image:
      radial-gradient(ellipse 110% 85% at 50% -22%, var(--stat-glow) 0%, transparent 56%),
      linear-gradient(
        168deg,
        color-mix(in srgb, var(--stat-accent) 20%, rgb(8 8 12)) 0%,
        color-mix(in srgb, var(--stat-accent) 8%, rgb(8 8 12)) 45%,
        rgb(8 8 12) 100%
      );
    border: 1px solid color-mix(in srgb, var(--stat-accent) 48%, transparent);
    border-radius: 14px;
    box-shadow:
      0 10px 36px rgb(0 0 0 / 42%),
      0 0 0 1px color-mix(in srgb, var(--stat-accent) 14%, transparent),
      inset 0 1px 0 rgb(255 255 255 / 10%);
    transition:
      border-color 0.28s var(--ease-default),
      box-shadow 0.35s var(--ease-out);

    &::before {
      position: absolute;
      top: 0;
      left: 8%;
      z-index: 0;
      width: 84%;
      height: 1.5px;
      pointer-events: none;
      content: '';
      background: linear-gradient(
        90deg,
        transparent,
        var(--stat-accent),
        var(--stat-accent-2),
        transparent
      );
      filter: blur(0.35px);
      opacity: 0.88;
    }

    &:hover {
      border-color: color-mix(in srgb, var(--stat-accent) 72%, transparent);
      box-shadow:
        0 16px 48px rgb(0 0 0 / 48%),
        0 0 0 1px color-mix(in srgb, var(--stat-accent) 28%, transparent),
        inset 0 1px 0 rgb(255 255 255 / 12%),
        0 0 28px color-mix(in srgb, var(--stat-accent) 18%, transparent);
    }

    &--android {
      --stat-accent: #10b981;
      --stat-accent-2: #34d399;
      --stat-glow: rgb(16 185 129 / 36%);
    }

    &--ios {
      --stat-accent: #3b82f6;
      --stat-accent-2: #60a5fa;
      --stat-glow: rgb(59 130 246 / 36%);
    }

    &--total {
      --stat-accent: #f97316;
      --stat-accent-2: #fbbf24;
      --stat-glow: rgb(249 115 22 / 34%);
    }

    &__content {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      padding: 14px 16px;
    }

    &__header {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
      padding-bottom: 10px;
      margin-bottom: 4px;
      border-bottom: 1px solid color-mix(in srgb, var(--stat-accent) 18%, transparent);
    }

    &__label {
      font-size: 13px;
      font-weight: 700;
      line-height: 1.3;
      color: var(--text-primary);
      white-space: nowrap;
    }
  }

  .pad-os-badge {
    padding: 2px 8px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.02em;
    border-radius: 9999px;

    &--android {
      color: #6ee7b7;
      background: rgb(16 185 129 / 22%);
      border: 1px solid rgb(52 211 153 / 45%);
      box-shadow: 0 0 12px rgb(16 185 129 / 20%);
    }

    &--ios {
      color: #93c5fd;
      background: rgb(59 130 246 / 22%);
      border: 1px solid rgb(96 165 250 / 45%);
      box-shadow: 0 0 12px rgb(59 130 246 / 18%);
    }
  }

  .pad-stat-rows {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .pad-stat-row-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 2px;
    font-size: 12px;
    border-bottom: 1px solid rgb(255 255 255 / 6%);

    &:last-child {
      padding-bottom: 2px;
      border-bottom: none;
    }
  }

  .pad-stat-label {
    flex-shrink: 0;
    margin-right: 10px;
    color: var(--text-secondary);
  }

  .pad-stat-value {
    min-width: 0;
    font-weight: 600;
    color: var(--text-primary);
    text-align: right;

    &--accent {
      font-weight: 800;
      color: var(--art-success);
      text-shadow:
        0 0 10px color-mix(in srgb, var(--art-success) 55%, transparent),
        0 0 22px color-mix(in srgb, var(--art-success) 28%, transparent);
    }
  }

  // ── 图表面板（矩阵表等未加 split 修饰时保持简洁）──────────────
  .pad-panel:not(.pad-panel--split-chart) {
    :deep(.el-card__header) {
      padding: 10px 14px;
      font-size: 13px;
      font-weight: 600;
      color: var(--art-gray-800);
    }

    :deep(.el-card__body) {
      padding: 0;
    }
  }

  .pad-chart {
    flex: 1;
    width: 100%;
    min-height: 200px;
    padding: 0;
  }

  .ecpm-metrics {
    display: grid;
    flex-shrink: 0;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
    padding: 12px 14px 14px;
    margin: 0 10px 10px;
    background: rgb(0 0 0 / 22%);
    border: 1px solid color-mix(in srgb, var(--chart-accent) 12%, transparent);
    border-top: 1px solid rgb(255 255 255 / 8%);
    border-radius: 0 0 12px 12px;
  }

  .pad-panel--chart-ecpm .ecpm-metrics {
    margin-top: -1px;
  }

  .ecpm-metric {
    padding: 10px 1px;
    text-align: center;
    border-radius: 10px;
    transition:
      box-shadow 0.25s var(--ease-default),
      transform 0.25s var(--ease-default);

    &__label {
      margin-bottom: 4px;
      font-size: 10px;
      font-weight: 600;
      color: rgb(255 255 255 / 88%);
      letter-spacing: 0.02em;
    }

    &__value {
      font-size: 12px;
      font-weight: 800;
      line-height: 1.2;
      color: #fff;
    }

    &--teal {
      background: linear-gradient(165deg, color-mix(in srgb, #0d9488 92%, #000) 0%, #0f766e 100%);
      border: 1px solid rgb(45 212 191 / 35%);
      box-shadow:
        0 4px 16px rgb(13 148 136 / 25%),
        inset 0 1px 0 rgb(255 255 255 / 12%);
    }

    &--orange {
      background: linear-gradient(165deg, color-mix(in srgb, #ea580c 90%, #000) 0%, #c2410c 100%);
      border: 1px solid rgb(251 146 60 / 38%);
      box-shadow:
        0 4px 16px rgb(234 88 12 / 28%),
        inset 0 1px 0 rgb(255 255 255 / 12%);
    }

    &--red {
      background: linear-gradient(165deg, color-mix(in srgb, #dc2626 92%, #000) 0%, #b91c1c 100%);
      border: 1px solid rgb(248 113 113 / 38%);
      box-shadow:
        0 4px 16px rgb(220 38 38 / 26%),
        inset 0 1px 0 rgb(255 255 255 / 10%);
    }

    &:hover {
      box-shadow:
        0 6px 22px rgb(0 0 0 / 35%),
        inset 0 1px 0 rgb(255 255 255 / 14%);
      transform: translateY(-1px);
    }
  }

  @media (width <= 1200px) {
    .ecpm-metrics {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  // ── 右列：与左列网格行等高，表体最小高度对齐趋势图区 ───────────
  .pad-right {
    display: flex;
    flex-direction: column;
    min-width: 0;
    height: auto;
  }

  .pad-panel--matrix {
    --matrix-accent: #818cf8;
    --matrix-accent-2: #3b82f6;
    --matrix-glow: rgb(129 140 248 / 22%);

    position: relative;
    display: flex;
    flex: 0 0 auto;
    flex-direction: column;
    width: 100%;
    overflow: visible;
    background-color: rgb(8 8 12 / 94%) !important;
    background-image:
      radial-gradient(ellipse 85% 65% at 80% -25%, var(--matrix-glow) 0%, transparent 55%),
      linear-gradient(
        168deg,
        color-mix(in srgb, var(--matrix-accent) 10%, rgb(8 8 12)) 0%,
        rgb(8 8 12) 50%
      ) !important;
    border: 1px solid color-mix(in srgb, var(--matrix-accent) 32%, var(--default-border)) !important;
    border-radius: 14px !important;
    box-shadow:
      0 10px 40px rgb(0 0 0 / 38%),
      inset 0 1px 0 rgb(255 255 255 / 8%);

    &::before {
      position: absolute;
      top: 0;
      left: 10%;
      z-index: 1;
      width: 80%;
      height: 1px;
      pointer-events: none;
      content: '';
      background: linear-gradient(
        90deg,
        transparent,
        var(--matrix-accent),
        var(--matrix-accent-2),
        transparent
      );
      opacity: 0.78;
    }

    :deep(.el-card__header) {
      position: relative;
      z-index: 2;
      padding: 12px 16px 10px !important;
      background: transparent !important;
      border-bottom: 1px solid color-mix(in srgb, var(--matrix-accent) 14%, transparent) !important;
    }

    :deep(.el-card__body) {
      position: relative;
      z-index: 2;
      display: flex;
      flex: 0 0 auto;
      flex-direction: column;
      padding: 0 !important;
      overflow: hidden;
    }

    :deep(.el-table__inner-wrapper::before) {
      display: none;
    }

    :deep(.el-table__header-wrapper th.el-table__cell) {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-secondary);
      background: rgb(12 12 18 / 96%) !important;
      border-bottom: 1px solid color-mix(in srgb, var(--matrix-accent) 18%, transparent) !important;
    }

    :deep(.el-table__body-wrapper .el-table__row) {
      background: rgb(10 10 14 / 88%);
    }

    :deep(.el-table__body-wrapper .el-table__row.el-table__row--striped) {
      background: rgb(14 14 20 / 92%);
    }

    :deep(.el-table td.el-table__cell) {
      color: var(--text-primary);
      border-color: rgb(255 255 255 / 6%);
    }

    :deep(.el-table__border-left-patch),
    :deep(.el-table__border-bottom-patch) {
      background: color-mix(in srgb, var(--matrix-accent) 22%, transparent);
    }

    :deep(.el-table--border::after),
    :deep(.el-table--border::before) {
      background-color: color-mix(in srgb, var(--matrix-accent) 20%, transparent);
    }

    :deep(.el-table__row.is-level-platform) {
      background: color-mix(in srgb, rgb(10 10 14) 72%, var(--row-accent) 28%);

      td:first-child .cell {
        font-weight: 600;
      }
    }

    :deep(.el-table__row.is-level-country) {
      background: color-mix(in srgb, rgb(10 10 14) 88%, var(--row-accent) 12%);

      td:first-child .cell {
        position: relative;
        padding-left: 18px;

        &::before {
          position: absolute;
          top: 6px;
          bottom: 6px;
          left: 6px;
          width: 3px;
          content: '';
          background: var(--row-accent);
          border-radius: 9999px;
        }
      }
    }
  }

  .pad-matrix-card__title {
    font-size: 14px;
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: 0.02em;
  }

  /* 固定可视高度 + 表体内部滚动，合计行固定在表格下方 */
  .pad-matrix-body {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    height: clamp(520px, 44vh, 620px);
    margin: 0 10px 10px;
    overflow: hidden;
    background: rgb(0 0 0 / 26%);
    border: 1px solid color-mix(in srgb, var(--matrix-accent) 12%, transparent);
    border-radius: 12px;
    box-shadow: inset 0 0 0 1px rgb(255 255 255 / 4%);

    :deep(.el-table) {
      flex: 1 1 auto;
      min-height: 0;
    }
  }

  .panel-header-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 12px;
    align-items: center;
    justify-content: space-between;
  }

  .matrix-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .platform-cell {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .platform-name {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .country-count {
    font-size: 10px;
    color: var(--text-tertiary);
  }

  .country-cell {
    display: flex;
    gap: 4px;
    align-items: center;
    padding-left: 4px;
  }

  .country-flag {
    flex-shrink: 0;
    width: 1.15em;
    line-height: 1;
    background-size: cover;
  }

  .country-name {
    font-size: 12px;
    color: var(--text-secondary);
  }

  .cpi-badge {
    display: inline-block;
    padding: 1px 6px;
    font-size: 11px;
    font-weight: 600;
    border-radius: 4px;

    &--good {
      color: #fff;
      background: #22c55e;
    }

    &--near {
      color: #fff;
      background: #f97316;
    }

    &--over {
      color: #fff;
      background: #ef4444;
    }
  }

  .roi-badge {
    display: inline-block;
    padding: 1px 6px;
    font-size: 11px;
    border-radius: 4px;

    &--good {
      color: var(--art-gray-800);
      background: transparent;
    }

    &--warn {
      color: #fff;
      background: #22c55e;
    }

    &--danger {
      color: #fff;
      background: #ef4444;
    }
  }

  .profit-neg {
    color: #ef4444;
  }

  .sparkline {
    display: block;
    width: 60px;
    height: 24px;
    margin: 0 auto;
  }

  // 合计行（与矩阵深色面板统一）
  .matrix-total-row {
    display: grid;
    flex-shrink: 0;
    grid-template-columns: 130px 80px 68px 68px 64px 72px 68px 68px 80px 68px;
    gap: 0;
    padding: 10px 12px;
    font-size: 12px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: var(--text-secondary);
    background: linear-gradient(180deg, rgb(16 16 24 / 95%) 0%, rgb(10 10 16 / 98%) 100%);
    border-top: 1px solid color-mix(in srgb, var(--matrix-accent) 28%, transparent);
    box-shadow: inset 0 1px 0 rgb(255 255 255 / 6%);

    > span {
      padding: 0 4px;
      text-align: right;

      &:first-child {
        color: var(--text-primary);
        text-align: left;
      }
    }

    .matrix-total-spark {
      color: var(--text-tertiary);
      text-align: center;
    }
  }

  // ── 预警栏 ───────────────────────────────────────────────────
  .pad-alert-bar {
    display: flex;
    flex-shrink: 0;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    padding: 10px 16px;
    background: color-mix(in srgb, #1c1917 40%, var(--default-box-color));
    border: 1px solid color-mix(in srgb, #f59e0b 20%, transparent);
    border-radius: 8px;
  }

  .alert-sep {
    flex-shrink: 0;
    width: 1px;
    height: 14px;
    background: var(--art-gray-400);
  }

  .alert-item {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    font-size: 12px;

    &--danger {
      color: #fca5a5;
    }

    &--warning {
      color: #fdba74;
    }

    &--good {
      color: #86efac;
    }

    &--info {
      color: #93c5fd;
    }
  }

  .alert-dot {
    display: inline-block;
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    border-radius: 50%;

    &--danger {
      background: #ef4444;
    }

    &--warning {
      background: #f97316;
    }

    &--good {
      background: #22c55e;
    }

    &--info {
      background: #3b82f6;
    }
  }
</style>
