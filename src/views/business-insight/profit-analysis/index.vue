<template>
  <div ref="rootRef" class="profit-analysis-root art-full-height" :data-dark="isDark ? '1' : '0'">
    <div
      class="profit-analysis-wrap profit-analysis-page"
      :style="{
        width: `${designWidth}px`,
        height: `${designHeight}px`,
        transform: `scale(${scale})`,
        transformOrigin: '0 0'
      }"
    >
      <header class="pa-header">
        <div class="pa-title">
          <span class="pa-title__prefix">商业洞察</span>
          <span class="pa-title__sep">›</span>
          <span class="pa-title__main">利润+国家)</span>
        </div>

        <div class="pa-filters">
          <div class="pa-pill">
            <span class="pa-pill__icon i-cal" />
            <span class="pa-pill__k">日期范围:</span>
            <ElDatePicker
              v-model="dateRange"
              type="daterange"
              range-separator="~"
              value-format="YYYY-MM-DD"
              format="YYYY-MM-DD"
              class="pa-date"
              :teleported="false"
              :clearable="false"
            />
          </div>

          <div class="pa-pill">
            <span class="pa-pill__icon i-app" />
            <span class="pa-pill__k">应用:</span>
            <ElSelect
              v-model="filters.s_app_id"
              class="pa-select"
              popper-class="pa-select__popper"
              :teleported="false"
              :fit-input-width="true"
            >
              <ElOption
                v-for="opt in appOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </ElSelect>
          </div>

          <div class="pa-pill">
            <span class="pa-pill__icon i-country" />
            <span class="pa-pill__k">国家:</span>
            <ElSelect
              v-model="filters.s_country_code"
              class="pa-select"
              popper-class="pa-select__popper"
              :teleported="false"
              :fit-input-width="true"
              filterable
            >
              <ElOption
                v-for="opt in countryOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </ElSelect>
          </div>
        </div>
      </header>

      <section class="pa-kpi-grid">
        <article v-for="k in kpis" :key="k.id" class="pa-kpi" :data-accent="k.accent">
          <div class="pa-kpi__head">
            <div class="pa-kpi__title">
              <span>{{ k.title }}</span>
              <span v-if="k.warning" class="pa-kpi__badge">
                <span class="pa-kpi__badge-ico">▲</span>
                预估值
              </span>
            </div>
          </div>
          <div class="pa-kpi__value">{{ k.valueText }}</div>
          <div class="pa-kpi__sub">{{ k.subText }}</div>
        </article>
      </section>

      <section class="pa-main">
        <div class="pa-panel pa-panel--apps">
          <div class="pa-panel__header">
            <div class="pa-panel__title">应用利润详情</div>
          </div>
          <div class="pa-panel__body pa-panel__body--apps">
            <ArtTable
              class="pa-art-table"
              :data="appRowsWithTotal"
              :columns="appColumns"
              row-key="s_app_name"
              :stripe="false"
              :border="false"
              size="default"
              :pagination="undefined"
              :header-cell-style="tableHeaderCellStyle"
              :cell-style="tableCellStyle"
            >
              <template #d_est_profit="{ row }">
                <span class="pa-money" :class="row.d_est_profit < 0 ? 'neg' : 'pos'">
                  {{ fmtSignedMoney(row.d_est_profit) }}
                </span>
              </template>
              <template #d_profit_rate="{ row }">
                <span v-if="shouldShowNa(row)" class="pa-na">N/A</span>
                <span v-else class="pa-rate" :class="row.d_profit_rate < 0 ? 'neg' : 'pos'">
                  {{ fmtPercent(row.d_profit_rate) }}
                </span>
              </template>
              <template #trend="{ row, $index }">
                <div
                  :ref="(el) => setAppTrendRef(el as HTMLElement | null, $index)"
                  class="pa-mini-trend"
                  :data-trend-sign="row.d_est_profit < 0 ? 'down' : 'up'"
                />
              </template>
            </ArtTable>
          </div>
        </div>

        <div class="pa-panel pa-panel--country">
          <div class="pa-panel__header">
            <div class="pa-panel__title">国家利润分布</div>
          </div>
          <div class="pa-panel__body pa-panel__body--country">
            <div class="pa-country-grid">
              <div class="pa-map" ref="mapEl" />

              <div class="pa-top10">
                <div class="pa-top10__title">国家利润详情 Top10</div>
                <ArtTable
                  class="pa-art-table pa-art-table--top10"
                  :data="countryTop10"
                  :columns="countryColumns"
                  row-key="s_country_code"
                  :stripe="false"
                  :border="false"
                  size="default"
                  :pagination="undefined"
                  :header-cell-style="tableHeaderCellStyle"
                  :cell-style="tableCellStyle"
                >
                  <template #s_country_name_cn="{ row }">
                    <div class="pa-country-cell">
                      <span class="fi" :class="`fi-${String(row.s_country_code).toLowerCase()}`" />
                      <span class="pa-country-cell__name">{{ row.s_country_name_cn }}</span>
                    </div>
                  </template>
                  <template #d_profit="{ row }">
                    <span class="pa-money" :class="row.d_profit < 0 ? 'neg' : 'pos'">{{
                      fmtSignedMoney(row.d_profit)
                    }}</span>
                  </template>
                  <template #d_profit_rate="{ row }">
                    <span class="pa-rate" :class="row.d_profit_rate < 0 ? 'neg' : 'pos'">
                      {{ fmtPercent(row.d_profit_rate) }}
                    </span>
                  </template>
                </ArtTable>
              </div>
            </div>
          </div>
        </div>

        <div class="pa-panel pa-panel--trend">
          <div class="pa-panel__header">
            <div class="pa-panel__title">利润趋势(近30天)</div>
          </div>
          <div class="pa-panel__body">
            <div ref="trendEl" class="pa-trend" />
          </div>
        </div>

        <div class="pa-panel pa-panel--sankey">
          <div class="pa-panel__header">
            <div class="pa-panel__title">利润构成分析</div>
          </div>
          <div class="pa-panel__body">
            <div ref="sankeyEl" class="pa-sankey" />
          </div>
        </div>
      </section>

      <footer class="pa-footnote">
        <span class="pa-footnote__warn">▲</span>
        真实利润需月底对账后确认，当前为预估值
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useSettingStore } from '@/store/modules/setting'
  import { useChart } from '@/hooks/core/useChart'
  import { echarts, graphic, type EChartsOption } from '@/plugins/echarts'
  import type { ColumnOption } from '@/types'
  import ArtTable from '@/components/core/tables/art-table/index.vue'
  import 'flag-icons/css/flag-icons.min.css'

  import {
    MOCK_PROFIT_ANALYSIS_APP_PROFIT_ROWS,
    MOCK_PROFIT_ANALYSIS_COUNTRY_POINTS,
    MOCK_PROFIT_ANALYSIS_COUNTRY_TOP10,
    MOCK_PROFIT_ANALYSIS_FILTERS,
    MOCK_PROFIT_ANALYSIS_KPIS,
    MOCK_PROFIT_ANALYSIS_SANKEY,
    MOCK_PROFIT_ANALYSIS_TREND_30D,
    type ProfitAnalysisFilterState,
    type ProfitAnalysisSankeyLink,
    type ProfitAnalysisSankeyNode
  } from './mock'

  defineOptions({ name: 'ProfitAnalysis' })

  const { isDark } = storeToRefs(useSettingStore())

  // 固定画布 + 自适应缩放（与收入概览一致）
  const designWidth = 1700
  const designHeight = 980
  const rootRef = ref<HTMLElement>()
  const scale = ref(1)
  const updateScale = () => {
    const el = rootRef.value
    if (!el) return
    const w = el.clientWidth
    if (w <= 0) return
    scale.value = w / designWidth
  }
  let resizeObserver: ResizeObserver | null = null

  type SelectOption<T extends string = string> = { label: string; value: T }

  const filters = reactive<ProfitAnalysisFilterState>({ ...MOCK_PROFIT_ANALYSIS_FILTERS })
  const dateRange = ref<[string, string]>([filters.t_date_start, filters.t_date_end])
  watch(
    dateRange,
    (v: [string, string]) => {
      filters.t_date_start = v?.[0] || filters.t_date_start
      filters.t_date_end = v?.[1] || filters.t_date_end
    },
    { deep: true }
  )

  const appOptions = computed<SelectOption[]>(() => [
    { label: '全部', value: 'all' },
    { label: 'Weather5', value: 'weather5' },
    { label: 'PhoneTracker', value: 'phonetracker' },
    { label: 'BloodSugar2', value: 'bloodsugar2' },
    { label: 'HealthTracker', value: 'healthtracker' },
    { label: 'FaceMe', value: 'faceme' }
  ])
  const countryOptions = computed<SelectOption[]>(() => [
    { label: '全部', value: 'all' },
    { label: '美国', value: 'US' },
    { label: '德国', value: 'DE' },
    { label: '南非', value: 'ZA' },
    { label: '韩国', value: 'KR' }
  ])

  const kpis = ref(MOCK_PROFIT_ANALYSIS_KPIS)

  function fmtMoney(n: number): string {
    const v = Number(n || 0)
    const abs = Math.abs(Math.round(v))
    const s = '$' + abs.toLocaleString('en-US', { maximumFractionDigits: 0 })
    return v < 0 ? '-' + s : s
  }
  function fmtSignedMoney(n: number): string {
    const v = Number(n || 0)
    const s = fmtMoney(v)
    if (v > 0) return '+' + s
    return s
  }
  function fmtPercent(n: number): string {
    const v = Number(n || 0)
    return `${v.toFixed(1)}%`
  }

  function shouldShowNa(row: any): boolean {
    return row?.s_app_name !== 'Total' && Number(row?.d_total_revenue || 0) === 0
  }

  // 表格：应用利润详情
  const appRows = ref(MOCK_PROFIT_ANALYSIS_APP_PROFIT_ROWS)
  const appRowsWithTotal = computed(() => {
    const rows = [...appRows.value]
    const sumAd = rows.reduce((s, r) => s + (r.d_ad_revenue || 0), 0)
    const sumIap = rows.reduce((s, r) => s + (r.d_iap_revenue || 0), 0)
    const sumTotal = rows.reduce((s, r) => s + (r.d_total_revenue || 0), 0)
    const sumSpend = rows.reduce((s, r) => s + (r.d_ad_spend || 0), 0)
    // 按截图对齐：Total 行固定展示 +$36,400 与 40.8%
    const totalProfit = 36400
    const totalProfitRate = 40.8
    rows.push({
      s_app_name: 'Total',
      d_ad_revenue: sumAd,
      d_iap_revenue: sumIap,
      d_total_revenue: sumTotal,
      d_ad_spend: sumSpend,
      d_est_profit: totalProfit,
      d_profit_rate: totalProfitRate,
      trend: []
    })
    return rows
  })

  const appColumns: ColumnOption[] = [
    { prop: 's_app_name', label: '应用', minWidth: 120 },
    {
      prop: 'd_ad_revenue',
      label: '广告收入(预)',
      minWidth: 110,
      align: 'right',
      formatter: (r: any) => fmtMoney(r.d_ad_revenue)
    },
    {
      prop: 'd_iap_revenue',
      label: '付费收入',
      minWidth: 95,
      align: 'right',
      formatter: (r: any) => fmtMoney(r.d_iap_revenue)
    },
    {
      prop: 'd_total_revenue',
      label: '总收入',
      minWidth: 95,
      align: 'right',
      formatter: (r: any) => fmtMoney(r.d_total_revenue)
    },
    {
      prop: 'd_ad_spend',
      label: '广告支出',
      minWidth: 95,
      align: 'right',
      formatter: (r: any) => fmtMoney(r.d_ad_spend)
    },
    { prop: 'd_est_profit', label: '预估利润', minWidth: 95, align: 'right', useSlot: true },
    { prop: 'd_profit_rate', label: '利润率', minWidth: 75, align: 'right', useSlot: true },
    { prop: 'trend', label: '趋势', width: 110, align: 'center', useSlot: true }
  ]

  const tableHeaderCellStyle = {
    color: 'var(--pa-muted)',
    fontSize: '12px',
    padding: '8px 0',
    background: 'rgba(0,0,0,0.18)',
    borderBottom: '1px solid var(--pa-border-soft)'
  } as const
  const tableCellStyle = {
    color: 'var(--pa-text)',
    fontSize: '12px',
    padding: '8px 0',
    borderBottom: '1px solid var(--pa-border-soft)'
  } as const

  // mini trend charts for app table
  const miniTrendRefs = ref<(HTMLElement | null)[]>([])
  const miniTrendCharts = new Map<number, ReturnType<typeof echarts.init>>()

  function setAppTrendRef(el: HTMLElement | null, idx: number) {
    miniTrendRefs.value[idx] = el
  }

  function buildMiniTrendOption(trend: number[], up: boolean): EChartsOption {
    const line = up
      ? getVar(rootRef.value, '--pa-c-green', '#22c55e')
      : getVar(rootRef.value, '--pa-c-red', '#ef4444')
    return {
      grid: { top: 6, right: 6, bottom: 6, left: 6, containLabel: false },
      xAxis: { type: 'category', show: false, data: trend.map((_, i) => i) },
      yAxis: { type: 'value', show: false, scale: true },
      series: [
        {
          type: 'line',
          data: trend,
          smooth: true,
          showSymbol: false,
          lineStyle: { color: line, width: 1.2 },
          areaStyle: {
            color: new graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: line + '66' },
              { offset: 1, color: 'rgba(0,0,0,0)' }
            ])
          }
        }
      ]
    }
  }

  function initMiniTrends() {
    nextTick(() => {
      const rows = appRowsWithTotal.value
      rows.forEach((row: any, idx: number) => {
        const el = miniTrendRefs.value[idx]
        if (!el || !Array.isArray(row.trend) || row.trend.length === 0) return
        let chart = miniTrendCharts.get(idx)
        if (!chart) {
          chart = echarts.init(el)
          miniTrendCharts.set(idx, chart)
        }
        chart.setOption(buildMiniTrendOption(row.trend, row.d_est_profit >= 0), {
          replaceMerge: ['series']
        })
      })
      // dispose extra
      const maxIndex = rows.length - 1
      miniTrendCharts.forEach((c, i) => {
        if (i > maxIndex) {
          c.dispose()
          miniTrendCharts.delete(i)
        }
      })
    })
  }

  // 右上：地图 + Top10
  const WORLD_JSON_URL = `${import.meta.env.BASE_URL}geo/world.json`
  const mapEl = ref<HTMLElement | null>(null)
  const mapInitialized = ref(false)
  const mapPoints = ref(MOCK_PROFIT_ANALYSIS_COUNTRY_POINTS)
  const countryTop10 = ref(MOCK_PROFIT_ANALYSIS_COUNTRY_TOP10)
  const {
    chartRef: mapChartRef,
    initChart: initMapChart,
    updateChart: updateMapChart,
    destroyChart: destroyMapChart
  } = useChart()

  function buildMapOption(): EChartsOption {
    const dark = isDark.value
    const values = mapPoints.value.map((p) => p.d_profit)
    const max = values.length ? Math.max(...values) : 100
    const min = values.length ? Math.min(...values) : 0
    const visualMax = Math.max(1, max)
    const visualMin = Math.min(0, min)

    const border = dark ? 'rgba(100,116,139,0.55)' : 'rgba(0,0,0,0.12)'
    const area = dark ? 'rgba(71,85,105,0.60)' : '#f1f5f9'
    const emphasisArea = dark ? 'rgba(34,197,94,0.25)' : 'var(--el-color-primary-light-8)'

    const labelColor = dark ? '#e2e8f0' : 'var(--el-text-color-primary)'

    return {
      animation: true,
      tooltip: { show: false },
      visualMap: {
        show: false,
        type: 'continuous',
        min: visualMin,
        max: visualMax,
        inRange: {
          color: dark ? ['#f87171', '#fbbf24', '#34d399'] : ['#fecaca', '#fde047', '#86efac']
        },
        outOfRange: { color: [area] }
      },
      geo: {
        map: 'world',
        roam: true,
        zoom: 1.12,
        scaleLimit: { min: 0.6, max: 4 },
        itemStyle: {
          areaColor: area,
          borderColor: border,
          borderWidth: 0.9
        },
        emphasis: {
          itemStyle: {
            areaColor: emphasisArea,
            borderColor: border,
            borderWidth: 1.2,
            shadowBlur: dark ? 16 : 10,
            shadowColor: dark ? 'rgba(34,197,94,0.25)' : 'rgba(0,0,0,0.10)'
          }
        }
      },
      series: [
        {
          type: 'map',
          geoIndex: 0,
          map: 'world',
          data: mapPoints.value.map((p) => ({ name: p.s_country_name_en, value: p.d_profit }))
        },
        {
          type: 'effectScatter',
          coordinateSystem: 'geo' as const,
          symbol: 'circle',
          symbolSize: 8,
          rippleEffect: { scale: 2.6, brushType: 'stroke' },
          itemStyle: {
            color: (params: any) => {
              const v = Number(params?.data?.value?.[2] ?? 0)
              return v >= 0 ? (dark ? '#34d399' : '#16a34a') : dark ? '#f87171' : '#ef4444'
            }
          },
          label: {
            show: true,
            formatter: (params: any) => {
              const nameCn = params?.data?.nameCn ?? ''
              const t = params?.data?.profitText ?? ''
              return nameCn && t ? `${nameCn}\n${t}` : t || nameCn
            },
            position: 'right',
            distance: 8,
            color: labelColor,
            fontSize: 11,
            fontWeight: 600,
            textBorderColor: dark ? 'rgba(0,0,0,0.65)' : 'rgba(255,255,255,0.85)',
            textBorderWidth: 2
          },
          data: mapPoints.value.map((p) => ({
            name: p.s_country_name_cn,
            value: [p.d_lng, p.d_lat, p.d_profit],
            nameCn: p.s_country_name_cn,
            profitText: p.s_profit_text
          }))
        }
      ] as any,
      backgroundColor: 'transparent',
      grid: { show: false },
      xAxis: { show: false, type: 'value' },
      yAxis: { show: false, type: 'value' }
    }
  }

  async function initWorldMap() {
    if (!mapEl.value) return
    if (!mapInitialized.value) {
      const res = await fetch(WORLD_JSON_URL)
      const worldJson = await res.json()
      echarts.registerMap('world', worldJson)
      ;(mapChartRef as any).value = mapEl.value
      initMapChart(buildMapOption())
      mapInitialized.value = true
      return
    }
    updateMapChart(buildMapOption())
  }

  const countryColumns: ColumnOption[] = [
    { prop: 's_country_name_cn', label: '国家', minWidth: 90, useSlot: true },
    {
      prop: 'd_ad_revenue',
      label: '广告收入',
      minWidth: 85,
      align: 'right',
      formatter: (r: any) => fmtMoney(r.d_ad_revenue)
    },
    {
      prop: 'd_iap_revenue',
      label: '付费收入',
      minWidth: 85,
      align: 'right',
      formatter: (r: any) => fmtMoney(r.d_iap_revenue)
    },
    {
      prop: 'd_ad_spend',
      label: '广告支出',
      minWidth: 85,
      align: 'right',
      formatter: (r: any) => fmtMoney(r.d_ad_spend)
    },
    { prop: 'd_profit', label: '利润', minWidth: 80, align: 'right', useSlot: true },
    { prop: 'd_profit_rate', label: '利润率', minWidth: 70, align: 'right', useSlot: true }
  ]

  // 左下：30天趋势
  const trendEl = ref<HTMLElement | null>(null)
  const {
    chartRef: trendChartRef,
    initChart: initTrendChart,
    updateChart: updateTrendChart,
    destroyChart: destroyTrendChart
  } = useChart()
  const trend30d = ref(MOCK_PROFIT_ANALYSIS_TREND_30D)

  function getVar(el: HTMLElement | undefined | null, name: string, fallback: string) {
    if (!el) return fallback
    const v = getComputedStyle(el).getPropertyValue(name).trim()
    return v || fallback
  }

  function buildTrendOption(): EChartsOption {
    const dom = rootRef.value
    const axis = getVar(dom, '--pa-chart-axis', '#94a3b8')
    const split = getVar(dom, '--pa-chart-split', 'rgba(255,255,255,0.08)')
    const green = getVar(dom, '--pa-c-green', '#22c55e')
    const amber = getVar(dom, '--pa-c-amber', '#f59e0b')
    const purple = getVar(dom, '--pa-c-purple', '#a78bfa')

    const x = trend30d.value.map((p) => `${String(p.n_day).padStart(2, '0')}天`)
    const y1 = trend30d.value.map((p) => p.d_total_revenue)
    const y2 = trend30d.value.map((p) => p.d_ad_spend)
    const y3 = trend30d.value.map((p) => p.d_est_profit)

    return {
      grid: { top: 36, left: 12, right: 12, bottom: 12, containLabel: true },
      legend: {
        top: 8,
        left: 12,
        itemWidth: 10,
        itemHeight: 10,
        textStyle: { color: axis, fontSize: 12 },
        data: ['总收入', '广告支出', '预估利润']
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: x,
        axisLabel: { color: axis, fontSize: 11, interval: 4 },
        axisLine: { lineStyle: { color: split } },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: axis, fontSize: 11 },
        splitLine: { lineStyle: { color: split } }
      },
      series: [
        {
          name: '总收入',
          type: 'line',
          smooth: true,
          showSymbol: false,
          data: y1,
          lineStyle: { width: 2, color: green },
          areaStyle: {
            color: new graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: green + '55' },
              { offset: 1, color: 'rgba(0,0,0,0)' }
            ])
          }
        },
        {
          name: '广告支出',
          type: 'line',
          smooth: true,
          showSymbol: false,
          data: y2,
          lineStyle: { width: 2, color: amber },
          areaStyle: { opacity: 0 }
        },
        {
          name: '预估利润',
          type: 'line',
          smooth: true,
          showSymbol: false,
          data: y3,
          lineStyle: { width: 2, color: purple, type: 'dashed' }
        }
      ]
    }
  }

  function initTrend() {
    if (!trendEl.value) return
    ;(trendChartRef as any).value = trendEl.value
    initTrendChart(buildTrendOption())
  }

  // 右下：桑基
  const sankeyEl = ref<HTMLElement | null>(null)
  const {
    chartRef: sankeyChartRef,
    initChart: initSankeyChart,
    updateChart: updateSankeyChart,
    destroyChart: destroySankeyChart
  } = useChart()
  const sankey = ref<{ nodes: ProfitAnalysisSankeyNode[]; links: ProfitAnalysisSankeyLink[] }>(
    MOCK_PROFIT_ANALYSIS_SANKEY
  )

  function buildSankeyOption(): EChartsOption {
    const dom = rootRef.value
    const text = getVar(dom, '--pa-text', '#e2e8f0')
    const split = getVar(dom, '--pa-border-soft', 'rgba(255,255,255,0.10)')
    const nodes = sankey.value.nodes
    const links = sankey.value.links
    return {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          if (params.dataType === 'edge')
            return `${params.data.source} → ${params.data.target}<br/>${fmtMoney(params.data.value)}`
          return `${params.name}${params.data?.valueDisplay ? `<br/>${params.data.valueDisplay}` : ''}`
        }
      },
      series: [
        {
          type: 'sankey',
          left: 12,
          right: 12,
          top: 10,
          bottom: 10,
          nodeWidth: 18,
          nodeGap: 12,
          data: nodes.map((n) => ({
            name: n.name,
            valueDisplay: n.valueDisplay,
            itemStyle: { borderRadius: 8, ...(n.itemStyle || {}) },
            label: {
              color: text,
              fontSize: 12,
              formatter: () => (n.valueDisplay ? `${n.name}\n${n.valueDisplay}` : n.name)
            }
          })),
          links: links,
          lineStyle: {
            color: 'gradient',
            opacity: 0.55,
            curveness: 0.55
          },
          itemStyle: {
            borderWidth: 1,
            borderColor: split
          },
          emphasis: {
            focus: 'adjacency'
          }
        }
      ]
    }
  }

  function initSankey() {
    if (!sankeyEl.value) return
    ;(sankeyChartRef as any).value = sankeyEl.value
    initSankeyChart(buildSankeyOption())
  }

  function initAllCharts() {
    initMiniTrends()
    initWorldMap()
    initTrend()
    initSankey()
  }

  watch(
    () => [filters.s_app_id, filters.s_country_code, filters.t_date_start, filters.t_date_end],
    () => {
      // 当前为 mock：仅触发重绘，结构对齐原型即可
      nextTick(() => {
        initMiniTrends()
        updateMapChart(buildMapOption())
        updateTrendChart(buildTrendOption())
        updateSankeyChart(buildSankeyOption())
      })
    }
  )

  watch(isDark, () => {
    nextTick(() => {
      initMiniTrends()
      updateMapChart(buildMapOption())
      updateTrendChart(buildTrendOption())
      updateSankeyChart(buildSankeyOption())
    })
  })

  onMounted(() => {
    updateScale()
    if (rootRef.value) {
      resizeObserver = new ResizeObserver(() => updateScale())
      resizeObserver.observe(rootRef.value)
    }
    nextTick(() => initAllCharts())
    window.addEventListener('resize', handleWindowResize)
  })

  onUnmounted(() => {
    resizeObserver?.disconnect()
    resizeObserver = null
    window.removeEventListener('resize', handleWindowResize)
    miniTrendCharts.forEach((c) => c.dispose())
    miniTrendCharts.clear()
    destroyMapChart()
    destroyTrendChart()
    destroySankeyChart()
  })

  function handleWindowResize() {
    miniTrendCharts.forEach((c) => c.resize())
  }
</script>

<style scoped lang="scss">
  .profit-analysis-root {
    --pa-bg: var(--el-bg-color);
    --pa-panel-bg: rgb(0 0 0 / 2%);
    --pa-border: rgb(0 0 0 / 18%);
    --pa-border-soft: rgb(0 0 0 / 10%);
    --pa-text: var(--el-text-color-primary);
    --pa-muted: var(--el-text-color-secondary);
    --pa-pill: rgb(255 255 255 / 75%);
    --pa-pill-border: rgb(0 0 0 / 12%);
    --pa-chart-axis: rgb(51 65 85 / 85%);
    --pa-chart-split: rgb(0 0 0 / 8%);
    --pa-c-purple: #a78bfa;
    --pa-c-green: #22c55e;
    --pa-c-amber: #f59e0b;
    --pa-c-blue: #60a5fa;
    --pa-c-cyan: #38bdf8;
    --pa-c-red: #ef4444;

    width: 100%;
    height: 100%;
    overflow: hidden;
    background: var(--pa-bg);
  }

  .profit-analysis-page {
    padding: 18px 18px 14px;
    color: var(--pa-text);
    background:
      radial-gradient(1100px 520px at 12% 0%, rgb(59 130 246 / 14%), transparent 55%),
      radial-gradient(900px 520px at 60% 0%, rgb(16 185 129 / 10%), transparent 55%),
      radial-gradient(900px 520px at 92% 10%, rgb(168 85 247 / 8%), transparent 55%),
      linear-gradient(180deg, rgb(255 255 255 / 65%), rgb(255 255 255 / 65%));
    border-radius: 12px;
  }

  .profit-analysis-root[data-dark='1'] .profit-analysis-page {
    background:
      radial-gradient(1100px 520px at 12% 0%, rgb(59 130 246 / 20%), transparent 55%),
      radial-gradient(900px 520px at 60% 0%, rgb(16 185 129 / 16%), transparent 55%),
      radial-gradient(900px 520px at 92% 10%, rgb(168 85 247 / 14%), transparent 55%),
      linear-gradient(180deg, rgb(0 0 0 / 14%), rgb(0 0 0 / 14%));
  }

  .profit-analysis-root[data-dark='1'] {
    --pa-bg: #0f1419;
    --pa-panel-bg: rgb(0 0 0 / 22%);
    --pa-border: rgb(51 65 85 / 100%);
    --pa-border-soft: rgb(148 163 184 / 22%);
    --pa-text: #e2e8f0;
    --pa-muted: #94a3b8;
    --pa-pill: rgb(15 23 42 / 65%);
    --pa-pill-border: rgb(71 85 105 / 65%);
    --pa-chart-axis: rgb(148 163 184 / 95%);
    --pa-chart-split: rgb(255 255 255 / 7%);
  }

  .pa-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }

  .pa-title {
    display: flex;
    gap: 10px;
    align-items: baseline;
    font-size: 20px;
    font-weight: 650;
    letter-spacing: 0.3px;

    .pa-title__prefix {
      font-weight: 700;
      color: var(--pa-c-blue);
    }

    .pa-title__sep {
      font-weight: 500;
      color: var(--pa-muted);
    }

    .pa-title__main {
      color: var(--pa-text);
    }
  }

  .pa-filters {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .pa-pill {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    padding: 8px 12px;
    background: var(--pa-pill);
    border: 1px solid var(--pa-pill-border);
    border-radius: 10px;
    box-shadow: 0 0 0 1px rgb(0 0 0 / 2%) inset;

    .pa-pill__k {
      font-size: 12px;
      font-weight: 600;
      color: var(--pa-muted);
    }

    .pa-pill__icon {
      width: 14px;
      height: 14px;
      background: rgb(96 165 250 / 25%);
      border-radius: 4px;
      box-shadow: 0 0 0 1px rgb(96 165 250 / 25%) inset;
    }

    .i-cal {
      background: rgb(96 165 250 / 25%);
    }

    .i-app {
      background: rgb(34 197 94 / 20%);
      box-shadow: 0 0 0 1px rgb(34 197 94 / 25%) inset;
    }

    .i-country {
      background: rgb(56 189 248 / 20%);
      box-shadow: 0 0 0 1px rgb(56 189 248 / 25%) inset;
    }
  }

  .pa-select,
  .pa-date {
    width: 190px;
  }

  :deep(.pa-select .el-input__wrapper),
  :deep(.pa-date .el-input__wrapper) {
    padding: 0;
    background: transparent;
    box-shadow: none;
  }

  :deep(.pa-select .el-input__inner),
  :deep(.pa-date .el-input__inner) {
    font-weight: 600;
    color: var(--pa-text);
  }

  :deep(.pa-select .el-input__inner::placeholder),
  :deep(.pa-date .el-input__inner::placeholder) {
    color: var(--pa-muted);
  }

  .pa-kpi-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 14px;
    margin-bottom: 14px;
  }

  .pa-kpi {
    position: relative;
    padding: 12px 14px 10px;
    overflow: hidden;
    background: linear-gradient(180deg, rgb(0 0 0 / 10%), rgb(0 0 0 / 4%));
    border: 1px solid var(--pa-border-soft);
    border-radius: 12px;

    &::before {
      position: absolute;
      inset: 0;
      pointer-events: none;
      content: '';
      background: radial-gradient(700px 240px at 10% 0%, rgb(255 255 255 / 12%), transparent 55%);
      border-radius: 12px;
      opacity: 0.95;
    }
  }

  .pa-kpi[data-accent='purple'] {
    border-color: rgb(167 139 250 / 35%);
    box-shadow:
      0 0 0 1px rgb(167 139 250 / 25%) inset,
      0 10px 28px rgb(167 139 250 / 18%);
  }

  .pa-kpi[data-accent='green'] {
    border-color: rgb(34 197 94 / 30%);
    box-shadow:
      0 0 0 1px rgb(34 197 94 / 22%) inset,
      0 10px 28px rgb(34 197 94 / 14%);
  }

  .pa-kpi[data-accent='amber'] {
    border-color: rgb(245 158 11 / 30%);
    box-shadow:
      0 0 0 1px rgb(245 158 11 / 22%) inset,
      0 10px 28px rgb(245 158 11 / 14%);
  }

  .pa-kpi[data-accent='blue'] {
    border-color: rgb(96 165 250 / 30%);
    box-shadow:
      0 0 0 1px rgb(96 165 250 / 22%) inset,
      0 10px 28px rgb(96 165 250 / 14%);
  }

  .pa-kpi[data-accent='cyan'] {
    border-color: rgb(56 189 248 / 28%);
    box-shadow:
      0 0 0 1px rgb(56 189 248 / 20%) inset,
      0 10px 28px rgb(56 189 248 / 12%);
  }

  .pa-kpi__title {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    font-size: 13px;
    font-weight: 700;
    color: var(--pa-text);
  }

  .pa-kpi__badge {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    padding: 2px 8px;
    font-size: 12px;
    font-weight: 800;
    line-height: 1;
    color: #fbbf24;
    background: rgb(245 158 11 / 14%);
    border: 1px solid rgb(245 158 11 / 55%);
    border-radius: 999px;
  }

  .pa-kpi__badge-ico {
    font-size: 10px;
    transform: translateY(-0.5px);
  }

  .pa-kpi__value {
    margin-top: 6px;
    font-size: 26px;
    font-weight: 800;
    letter-spacing: 0.3px;
  }

  .pa-kpi__sub {
    margin-top: 4px;
    overflow: hidden;
    font-size: 12px;
    color: var(--pa-muted);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .pa-main {
    display: grid;
    grid-template-rows: 420px 350px;
    grid-template-columns: 1.22fr 0.78fr;
    gap: 14px;
  }

  .pa-panel {
    overflow: hidden;
    background: var(--pa-panel-bg);
    border: 1px solid var(--pa-border-soft);
    border-radius: 12px;
  }

  .pa-panel__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 14px;
    background: rgb(0 0 0 / 10%);
    border-bottom: 1px solid var(--pa-border-soft);
  }

  .pa-panel__title {
    font-size: 14px;
    font-weight: 800;
    color: var(--pa-text);
    letter-spacing: 0.2px;
  }

  .pa-panel__body {
    height: calc(100% - 46px);
    padding: 12px;
  }

  .pa-panel__body--apps {
    padding: 10px;
  }

  .pa-panel__body--country {
    padding: 10px;
  }

  .pa-country-grid {
    display: grid;
    grid-template-columns: 1fr 0.92fr;
    gap: 10px;
    height: 100%;
  }

  .pa-map {
    height: 100%;
    background: rgb(0 0 0 / 8%);
    border: 1px solid var(--pa-border-soft);
    border-radius: 10px;
  }

  .pa-top10 {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    background: rgb(0 0 0 / 8%);
    border: 1px solid var(--pa-border-soft);
    border-radius: 10px;
  }

  .pa-top10__title {
    padding: 10px 10px 8px;
    font-size: 12px;
    font-weight: 700;
    color: var(--pa-muted);
    border-bottom: 1px solid var(--pa-border-soft);
  }

  .pa-trend,
  .pa-sankey {
    width: 100%;
    height: 100%;
  }

  .pa-mini-trend {
    width: 96px;
    height: 26px;
    margin: 0 auto;
  }

  .pa-money.pos,
  .pa-rate.pos {
    font-weight: 700;
    color: var(--pa-c-green);
  }

  .pa-money.neg,
  .pa-rate.neg {
    font-weight: 700;
    color: var(--pa-c-red);
  }

  .pa-country-cell {
    display: flex;
    gap: 8px;
    align-items: center;

    .fi {
      width: 18px;
      height: 12px;
      border-radius: 2px;
      box-shadow: 0 0 0 1px rgb(0 0 0 / 12%);
    }

    .pa-country-cell__name {
      font-weight: 700;
      color: var(--pa-text);
    }
  }

  .pa-na {
    font-weight: 700;
    color: var(--pa-muted);
  }

  .pa-footnote {
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 8px 12px;
    margin-top: 10px;
    font-size: 12px;
    color: var(--pa-muted);
    background: rgb(245 158 11 / 10%);
    border: 1px solid rgb(245 158 11 / 35%);
    border-radius: 10px;
  }

  .pa-footnote__warn {
    font-weight: 900;
    color: var(--pa-c-amber);
  }
</style>
