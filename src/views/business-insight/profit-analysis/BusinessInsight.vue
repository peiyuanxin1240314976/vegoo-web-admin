<script setup lang="ts">
  import 'flag-icons/css/flag-icons.min.css'
  import 'element-plus/theme-chalk/el-table-v2.css'
  import 'element-plus/theme-chalk/el-virtual-list.css'
  import { computed, h, ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
  import { storeToRefs } from 'pinia'
  import { ElTableV2 } from 'element-plus'
  import * as echarts from 'echarts'
  import AppPlatformSearchSelect from '@/components/filter/app-platform-search-select.vue'
  import { useCockpitMetaFilterStore } from '@/store/modules/cockpit-meta-filter'
  import type { CockpitSettingAppItem } from '@/types/cockpit-meta-filter'
  import type {
    ProfitCountryRow,
    ProfitKpiCard,
    ProfitMapDataItem,
    ProfitAppProfitTreeNode
  } from './types'
  import {
    buildProfitMapScatterChartData,
    normalizeProfitMapDataForEchartsMapSeries,
    resolveEchartsWorldMapRegionName
  } from './country-profit-map-centroids'
  import { resolveProfitCountryIso } from './country-flag-iso'
  import { useProfitAnalysisDashboard } from './composables/useProfitAnalysisDashboard'

  defineOptions({ name: 'BusinessInsight' })

  const {
    query,
    filterOptions,
    pendingMeta,
    dateRangePicker,
    dateShortcuts,
    kpiCards,
    appProfitRoot,
    mapData,
    mapScatter,
    countryRows,
    trend30d,
    sankeyNodes,
    sankeyLinks,
    pendingKpi,
    pendingApp,
    pendingCountry,
    pendingTrend,
    pendingSankey,
    loadFilterMeta,
    loadDashboard,
    reloadDashboard
  } = useProfitAnalysisDashboard()
  const metaStore = useCockpitMetaFilterStore()
  const { data: cockpitMeta } = storeToRefs(metaStore)
  const settingAppsForSelect = computed<CockpitSettingAppItem[]>(() => {
    const fromCockpit = cockpitMeta.value?.settingApps ?? []
    if (fromCockpit.length) return fromCockpit

    return (filterOptions.value?.appOptions ?? [])
      .filter((opt) => opt.value && opt.value !== 'all')
      .map((opt, index) => ({
        sAppId: String(opt.value ?? ''),
        nPlatform: '',
        platformName: '',
        sAppName: String(opt.label ?? ''),
        sAppShortName: String(opt.label ?? ''),
        nCategory: `fallback-${index}`,
        categoryName: '应用'
      }))
  })

  type AppProfitFlatRow = {
    node: ProfitAppProfitTreeNode
    level: 0 | 1
    isRoot: boolean
  }

  const APP_PROFIT_ROW_HEIGHT = 40
  const APP_PROFIT_LOAD_BATCH = 24
  const APP_PROFIT_PRELOAD_ROWS = 6
  const appProfitScrollEl = ref<HTMLElement | null>(null)
  const appProfitScrollTop = ref(0)
  const appProfitViewportH = ref(520)
  const appProfitExpanded = ref(true)
  const appProfitLoadedChildren = ref(0)
  const appProfitLoadingMore = ref(false)
  const appProfitTableWrapRef = ref<HTMLElement | null>(null)
  const appProfitTableWidth = ref(0)
  const appProfitTableV2Ref = ref<any>(null)
  const appProfitHScrollRef = ref<HTMLElement | null>(null)
  const appProfitHScrollLeft = ref(0)

  // TableV2 需要显式 width。当前 element-plus 版本缺少 ElAutoResizer，用 ResizeObserver 替代。
  useResizeObserver(appProfitTableWrapRef, (entries) => {
    const w = Math.floor(entries?.[0]?.contentRect?.width ?? 0)
    if (w > 0) appProfitTableWidth.value = w
  })

  const appProfitChildrenAll = computed(() => appProfitRoot.value.children ?? [])
  const appProfitChildrenVisible = computed(() => {
    if (!appProfitExpanded.value) return []
    return appProfitChildrenAll.value.slice(0, appProfitLoadedChildren.value)
  })

  const appProfitFlatRows = computed<AppProfitFlatRow[]>(() => {
    const root = appProfitRoot.value
    const rows: AppProfitFlatRow[] = [{ node: root, level: 0, isRoot: true }]
    for (const child of appProfitChildrenVisible.value) {
      rows.push({ node: child, level: 1, isRoot: false })
    }
    return rows
  })

  const appProfitTableRows = computed(() =>
    appProfitFlatRows.value.map((r) => ({
      id: r.node.id,
      name: r.node.name,
      isRoot: r.isRoot,
      countryCode: r.node.countryCode ?? '',
      appName: r.node.appName ?? '',
      profit: r.node.profit,
      profitColor: r.node.profitColor,
      adRev: r.node.adRev,
      paidRev: r.node.paidRev,
      adSpend: r.node.adSpend,
      roi1d: r.node.roi1d,
      avgDau: r.node.avgDau,
      newUsers: r.node.newUsers,
      paidUsers: r.node.paidUsers,
      organicUsers: r.node.organicUsers
    }))
  )

  const appProfitPinnedRow = computed(() => appProfitTableRows.value[0])
  const appProfitFixedData = computed(() => {
    // 根行始终作为固定行渲染，保证“第一行”稳定存在且与表头/横向滚动完全对齐
    return appProfitPinnedRow.value ? [appProfitPinnedRow.value] : []
  })
  const appProfitTableRowsForV2 = computed(() => {
    // 数据区只放国家子行；收起时不展示子行
    if (!appProfitExpanded.value) return []
    return appProfitTableRows.value.slice(1)
  })

  // 应用利润详情表可视高度（调高以减少滚动频率）
  const APP_PROFIT_TABLE_MAX_H = 680
  const appProfitTableHeight = computed(() => APP_PROFIT_TABLE_MAX_H)

  const appProfitContentWidth = computed(() => {
    const sum = appProfitColumns.value.reduce((acc, c) => acc + Number(c?.width ?? 0), 0)
    return Math.max(sum, appProfitTableWidth.value || 0)
  })

  const appProfitColumns = computed<any[]>(() => {
    const appCell = ({ rowData }: { rowData: any }) => {
      if (rowData?.isRoot) {
        return h(
          'button',
          {
            type: 'button',
            class: 'bi-expand',
            'aria-expanded': appProfitExpanded.value,
            onClick: toggleAppProfitExpanded
          },
          [
            h('span', {
              class: ['bi-expand__chev', appProfitExpanded.value ? 'is-open' : '']
            }),
            h('span', { class: 'bi-expand__text' }, String(rowData?.appName || '全部应用'))
          ]
        )
      }
      return h('span', { class: 'bi-app-muted' }, String(rowData?.appName || '—'))
    }

    const countryCell = ({ rowData }: { rowData: any }) => {
      if (rowData?.isRoot) {
        return h('span', { class: 'td-country__text' }, '全部国家')
      }
      const iso = String(rowData?.countryCode ?? '').trim()
      const cls = fiCountryClass(iso)
      return h('div', { class: 'td-country td-country--v2' }, [
        cls ? h('span', { class: ['cflag', 'cflag--fi', cls], 'aria-hidden': 'true' }) : null,
        h('span', { class: 'td-country__text' }, String(rowData?.name ?? ''))
      ])
    }

    const colored = (key: 'profit', colorKey: 'profitColor') => {
      return ({ rowData }: { rowData: any }) =>
        h(
          'span',
          { style: { color: rowData?.[colorKey] ?? '#cbd5e1', fontWeight: 700 } },
          String(rowData?.[key] ?? '')
        )
    }

    return [
      {
        key: 'app',
        dataKey: 'app',
        title: '应用',
        width: 420,
        cellRenderer: appCell,
        class: 'bi-cell bi-cell--name'
      },
      {
        key: 'country',
        dataKey: 'country',
        title: '国家',
        width: 320,
        align: 'left' as const,
        cellRenderer: countryCell
      },
      {
        key: 'profit',
        dataKey: 'profit',
        title: '预估利润',
        width: 240,
        align: 'right' as const,
        cellRenderer: colored('profit', 'profitColor')
      },
      { key: 'adRev', dataKey: 'adRev', title: '广告收入', width: 300, align: 'right' as const },
      {
        key: 'paidRev',
        dataKey: 'paidRev',
        title: '付费收入',
        width: 240,
        align: 'right' as const
      },
      {
        key: 'adSpend',
        dataKey: 'adSpend',
        title: '广告支出',
        width: 240,
        align: 'right' as const
      },
      { key: 'roi1d', dataKey: 'roi1d', title: '首日ROI', width: 190, align: 'right' as const },
      { key: 'avgDau', dataKey: 'avgDau', title: '平均DAU', width: 190, align: 'right' as const },
      {
        key: 'newUsers',
        dataKey: 'newUsers',
        title: '新用户',
        width: 190,
        align: 'right' as const
      },
      {
        key: 'paidUsers',
        dataKey: 'paidUsers',
        title: '买量用户',
        width: 190,
        align: 'right' as const
      },
      {
        key: 'organicUsers',
        dataKey: 'organicUsers',
        title: '自然量',
        width: 190,
        align: 'right' as const
      }
    ]
  })

  function ensureAppProfitViewport() {
    const el = appProfitScrollEl.value
    if (!el) return
    appProfitViewportH.value = Math.max(240, el.clientHeight || 0)
  }

  function initAppProfitLoaded() {
    appProfitLoadedChildren.value = Math.min(
      APP_PROFIT_LOAD_BATCH,
      appProfitChildrenAll.value.length
    )
  }

  function toggleAppProfitExpanded() {
    appProfitExpanded.value = !appProfitExpanded.value
    if (appProfitExpanded.value && appProfitLoadedChildren.value === 0) {
      initAppProfitLoaded()
    }
    nextTick(() => {
      ensureAppProfitViewport()
    })
  }

  function maybeLoadMoreAppProfitChildren() {
    if (!appProfitExpanded.value) return
    const total = appProfitChildrenAll.value.length
    const loaded = appProfitLoadedChildren.value
    if (loaded >= total) return
    appProfitLoadedChildren.value = Math.min(total, loaded + APP_PROFIT_LOAD_BATCH)
  }

  const appProfitMaxScrollTop = computed(() => {
    const bodyH = appProfitTableHeight.value - 38
    const contentH = appProfitTableRowsForV2.value.length * APP_PROFIT_ROW_HEIGHT
    return Math.max(0, contentH - bodyH)
  })

  async function loadMoreAppProfitChildrenIfNeeded() {
    if (!appProfitExpanded.value) return
    if (appProfitLoadingMore.value) return
    const total = appProfitChildrenAll.value.length
    const loaded = appProfitLoadedChildren.value
    if (loaded >= total) return
    appProfitLoadingMore.value = true
    // 本地虚拟列表扩容不需要人为延迟，避免滚动触底时明显顿挫。
    maybeLoadMoreAppProfitChildren()
    await nextTick()
    appProfitLoadingMore.value = false
  }

  function handleAppProfitTableScroll({ scrollTop }: { scrollTop: number }) {
    appProfitScrollTop.value = scrollTop
    const preloadThreshold = Math.max(
      0,
      appProfitMaxScrollTop.value - APP_PROFIT_ROW_HEIGHT * APP_PROFIT_PRELOAD_ROWS
    )
    const needPreload = scrollTop >= preloadThreshold
    if (needPreload) {
      loadMoreAppProfitChildrenIfNeeded()
    }
  }

  function handleAppProfitTableV2Scroll(params: { scrollTop?: number; scrollLeft?: number }) {
    if (typeof params.scrollTop === 'number') {
      handleAppProfitTableScroll({ scrollTop: params.scrollTop })
    }
    if (typeof params.scrollLeft === 'number') {
      appProfitHScrollLeft.value = params.scrollLeft
      const el = appProfitHScrollRef.value
      if (el && Math.abs(el.scrollLeft - params.scrollLeft) > 1) {
        el.scrollLeft = params.scrollLeft
      }
    }
  }

  function handleAppProfitHScroll() {
    const el = appProfitHScrollRef.value
    if (!el) return
    const left = el.scrollLeft || 0
    appProfitHScrollLeft.value = left
    appProfitTableV2Ref.value?.scrollToLeft?.(left)
  }

  watch(
    () => appProfitRoot.value,
    () => {
      appProfitExpanded.value = true
      initAppProfitLoaded()
      appProfitScrollTop.value = 0
      nextTick(() => {
        const el = appProfitScrollEl.value
        if (el) el.scrollTop = 0
        ensureAppProfitViewport()
      })
    },
    { deep: true }
  )

  const HIDDEN_KPI_LABELS = new Set(['平均DAU', '新用户', '买量用户', '自然量', '首日ROI'])
  const visibleKpiCards = computed(() =>
    kpiCards.value.filter((c) => !HIDDEN_KPI_LABELS.has(c.label))
  )
  const TOP_KPI_ORDER = ['预估利润', '总收入', '广告支出', '广告收益率', '付费收入占比'] as const
  const topKpiCards = computed(() => {
    const byLabel = new Map(visibleKpiCards.value.map((c) => [c.label, c]))
    const ordered = TOP_KPI_ORDER.map((k) => byLabel.get(k)).filter((x): x is ProfitKpiCard => !!x)
    return ordered.length ? ordered : visibleKpiCards.value
  })
  function isEstimateBadge(card: ProfitKpiCard) {
    const badge = String(card.badge ?? '')
    return card.label === '预估利润' || badge.includes('预估')
  }

  const mapRef = ref<HTMLElement | null>(null)
  const trendRef = ref<HTMLElement | null>(null)
  const sankeyRef = ref<HTMLElement | null>(null)

  let mapChart: echarts.ECharts | null = null
  let trendChart: echarts.ECharts | null = null
  let sankeyChart: echarts.ECharts | null = null
  let mapGeoReady = false
  let mapResizeObserver: ResizeObserver | null = null

  function teardownMapResizeObserver() {
    mapResizeObserver?.disconnect()
    mapResizeObserver = null
  }

  function setupMapResizeObserver() {
    teardownMapResizeObserver()
    const el = mapRef.value
    if (!el || typeof ResizeObserver === 'undefined') return
    mapResizeObserver = new ResizeObserver(() => {
      mapChart?.resize()
    })
    mapResizeObserver.observe(el)
  }

  function fiCountryClass(code: string | undefined) {
    if (!code?.trim()) return ''
    const c = code.trim().toUpperCase()
    const alias: Record<string, string> = { UK: 'gb' }
    const iso = (alias[c] || c).toLowerCase()
    if (!/^[a-z]{2}$/.test(iso)) return ''
    return `fi fi-${iso}`
  }

  /** 優先 s_country_code，缺省時依中文國名解析 ISO，供 flag-icons */
  function countryRowFiClass(row: ProfitCountryRow) {
    return fiCountryClass(resolveProfitCountryIso(row))
  }

  async function ensureWorldGeo() {
    if (mapGeoReady) return
    const res = await fetch('/geo/world.json')
    const geoJson = await res.json()
    echarts.registerMap('world', geoJson)
    mapGeoReady = true
  }

  async function syncMapChart() {
    if (!mapRef.value) return
    await ensureWorldGeo()
    if (!mapChart) {
      mapChart = echarts.init(mapRef.value, 'dark', { renderer: 'canvas' })
    }
    const countryRowLookup = new Map<string, ProfitCountryRow>()
    for (const row of countryRows.value || []) {
      const raw = String(row.name || '').trim()
      if (raw) countryRowLookup.set(raw, row)
      const region = raw ? resolveEchartsWorldMapRegionName(raw) : null
      if (region) countryRowLookup.set(region, row)
    }
    const mapSeriesData = normalizeProfitMapDataForEchartsMapSeries(mapData.value)
    const rawVals = (mapData.value || [])
      .map((d: ProfitMapDataItem) => Number(d.value))
      .filter((n: number) => Number.isFinite(n))

    function quantile(sorted: number[], q: number): number {
      if (!sorted.length) return 0
      if (sorted.length === 1) return sorted[0]!
      const clamped = Math.min(1, Math.max(0, q))
      const pos = (sorted.length - 1) * clamped
      const base = Math.floor(pos)
      const rest = pos - base
      const a = sorted[base]!
      const b = sorted[Math.min(sorted.length - 1, base + 1)]!
      return a + (b - a) * rest
    }

    function buildProfitVisualMap(values: number[]) {
      const v = [...values].sort((a, b) => a - b)
      if (!v.length) {
        return { min: 0, max: 1, show: false }
      }

      // 国家数量不多时，使用“精确值分段”保证最大区分度（同值会同色）
      // 注意：visualMap piecewise 支持 { value } 精确匹配 series.data.value
      if (v.length <= 24) {
        const uniq = Array.from(new Set(v)).sort((a, b) => a - b)
        const palette = [
          '#22c55e',
          '#38bdf8',
          '#a78bfa',
          '#fb923c',
          '#f87171',
          '#2dd4bf',
          '#facc15',
          '#60a5fa',
          '#34d399',
          '#e879f9',
          '#f97316',
          '#4ade80',
          '#0ea5e9',
          '#c084fc',
          '#f59e0b',
          '#10b981'
        ]
        // 让更高值拿到更“亮”的颜色：反向映射
        const pieces = uniq
          .slice()
          .sort((a, b) => b - a)
          .map((val, idx) => ({
            value: val,
            color: palette[idx % palette.length]
          }))
        return {
          type: 'piecewise',
          show: false,
          seriesIndex: 0,
          pieces
        }
      }

      const hasNeg = v[0]! < 0
      const hasPos = v[v.length - 1]! > 0
      const EPS = 1e-9

      // 分段（piecewise）比连续渐变更容易“拉开区分”
      if (!hasNeg) {
        // 全正：按分位数分 7 档（低→高），让高值国家更容易区分色阶
        const q15 = quantile(v, 0.15)
        const q30 = quantile(v, 0.3)
        const q45 = quantile(v, 0.45)
        const q60 = quantile(v, 0.6)
        const q75 = quantile(v, 0.75)
        const q90 = quantile(v, 0.9)
        const pieces = [
          { lte: q15, color: '#1a2744' },
          { gt: q15, lte: q30, color: '#1e3a8a' },
          { gt: q30, lte: q45, color: '#0ea5e9' },
          { gt: q45, lte: q60, color: '#22d3ee' },
          { gt: q60, lte: q75, color: '#2dd4bf' },
          { gt: q75, lte: q90, color: '#a3e635' },
          { gt: q90, color: '#4ade80' }
        ]
        return {
          type: 'piecewise',
          show: false,
          seriesIndex: 0,
          pieces
        }
      }

      if (hasNeg && hasPos) {
        // 有负有正：负值红/橙，接近 0 走中性，正值走绿
        const neg = v.filter((n) => n < 0)
        const pos = v.filter((n) => n > 0)
        const n80 = neg.length ? quantile(neg, 0.8) : -EPS
        const n40 = neg.length ? quantile(neg, 0.4) : -EPS
        const p40 = pos.length ? quantile(pos, 0.4) : EPS
        const p80 = pos.length ? quantile(pos, 0.8) : EPS

        const pieces = [
          { lte: n80, color: '#ef4444' },
          { gt: n80, lte: n40, color: '#fb923c' },
          { gt: n40, lte: -EPS, color: '#fbbf24' },
          { gt: -EPS, lte: EPS, color: '#1a2744' },
          { gt: EPS, lte: p40, color: '#1d6fa4' },
          { gt: p40, lte: p80, color: '#22c55e' },
          { gt: p80, color: '#4ade80' }
        ]

        return {
          type: 'piecewise',
          show: false,
          seriesIndex: 0,
          pieces
        }
      }

      // 全负：按分位数分 5 档（更红 = 亏损更大）
      const q20 = quantile(v, 0.2)
      const q40 = quantile(v, 0.4)
      const q60 = quantile(v, 0.6)
      const q80 = quantile(v, 0.8)
      const pieces = [
        { lte: q20, color: '#7f1d1d' },
        { gt: q20, lte: q40, color: '#b91c1c' },
        { gt: q40, lte: q60, color: '#ef4444' },
        { gt: q60, lte: q80, color: '#fb923c' },
        { gt: q80, color: '#fbbf24' }
      ]
      return { type: 'piecewise', show: false, seriesIndex: 0, pieces }
    }
    const scatterSeriesData = buildProfitMapScatterChartData(mapScatter.value, mapData.value)
    mapChart.setOption({
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        confine: true,
        backgroundColor: 'rgba(15, 31, 61, 0.95)',
        borderColor: '#1e40af',
        borderWidth: 1,
        padding: [10, 12],
        textStyle: { color: '#e2e8f0', fontSize: 12 },
        extraCssText: 'box-shadow: 0 12px 30px rgba(0,0,0,.35); border-radius: 10px;',
        formatter: (p: any) => {
          const name = String(p?.name ?? '').trim()
          const row = name ? countryRowLookup.get(name) : undefined
          const val = Array.isArray(p?.value) ? Number(p.value?.[2]) : Number(p?.value)
          const profitText =
            row?.profit ??
            (Number.isFinite(val)
              ? new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  maximumFractionDigits: 0
                }).format(val)
              : '--')

          const header = `<div style='font-weight:600;font-size:13px;margin-bottom:8px;color:#f8fafc;'>${
            name || '--'
          }</div>`
          const kv = (k: string, v: string) =>
            `<div style='display:flex;justify-content:space-between;gap:16px;line-height:1.7;'><span style='color:#94a3b8;'>${k}</span><span style='color:#e2e8f0;'>${v}</span></div>`

          if (!row) {
            return `${header}${kv('利润', profitText)}`
          }

          return [
            header,
            kv('广告收入', row.adRev ?? '--'),
            kv('付费收入', row.paidRev ?? '--'),
            kv('广告支出', row.adSpend ?? '--'),
            kv('利润', profitText),
            kv('利润率', row.rate ?? '--')
          ].join('')
        }
      },
      geo: {
        map: 'world',
        roam: true,
        scaleLimit: { min: 0.85, max: 8 },
        /** 让地图绘制区域占满画布，避免「外层 div 变高但地图仍缩在中间」的留白感 */
        layoutCenter: ['50%', '50%'],
        layoutSize: '142%',
        silent: false,
        itemStyle: {
          areaColor: '#1a2744',
          borderColor: '#0f1f3d',
          borderWidth: 0.5
        },
        emphasis: {
          itemStyle: { areaColor: '#2563eb' },
          label: { show: false }
        }
      },
      series: [
        {
          type: 'map',
          map: 'world',
          geoIndex: 0,
          zlevel: 0,
          z: 1,
          data: mapSeriesData,
          silent: false
        },
        {
          type: 'effectScatter',
          coordinateSystem: 'geo',
          geoIndex: 0,
          /** 关闭裁剪：涟漪向外扩散时不会被 geo 区域切掉，否则动画看起来像「没出来」 */
          clip: false,
          zlevel: 2,
          z: 10,
          showEffectOn: 'render',
          /** 定位点尽量小；涟漪单独用半透明暖色 fill，比 stroke 在深色底上更明显 */
          symbol: 'circle',
          symbolSize: 7,
          rippleEffect: {
            brushType: 'fill',
            color: 'rgba(251, 146, 60, 0.45)',
            scale: 4,
            period: 2.2,
            number: 3
          },
          itemStyle: {
            color: '#fb923c',
            borderColor: '#fde68a',
            borderWidth: 1,
            shadowBlur: 6,
            shadowColor: 'rgb(251 146 60 / 50%)'
          },
          emphasis: {
            itemStyle: {
              color: '#fbbf24',
              borderColor: '#fff7ed',
              shadowBlur: 10,
              shadowColor: 'rgb(251 191 36 / 55%)'
            }
          },
          data: scatterSeriesData,
          label: {
            show: scatterSeriesData.length > 0,
            formatter: (p: { name?: string }) => p.name ?? '',
            position: 'right',
            color: '#fde68a',
            fontSize: 11,
            distance: 6
          }
        }
      ],
      visualMap: buildProfitVisualMap(rawVals)
    })
    await nextTick()
    mapChart.resize()
    requestAnimationFrame(() => {
      mapChart?.resize()
    })
  }

  function syncTrendChart() {
    if (!trendRef.value) return
    const { days, revenue, adSpend, profit } = trend30d.value
    if (!trendChart) {
      trendChart = echarts.init(trendRef.value, 'dark', { renderer: 'canvas' })
    }
    const numericMax = Math.max(
      1,
      ...revenue,
      ...adSpend,
      ...profit.map((n: number) => Math.abs(n))
    )
    const yMax = Math.ceil(numericMax * 1.12)

    trendChart.setOption({
      backgroundColor: 'transparent',
      grid: { top: 30, right: 20, bottom: 30, left: 50 },
      legend: {
        top: 4,
        right: 10,
        itemWidth: 20,
        itemHeight: 2,
        textStyle: { color: '#94a3b8', fontSize: 11 },
        data: [
          { name: '总收入', icon: 'rect' },
          { name: '广告支出', icon: 'rect' },
          { name: '预估利润', icon: 'rect' }
        ]
      },
      xAxis: {
        type: 'category',
        data: days,
        axisLine: { lineStyle: { color: '#1e3a5f' } },
        axisTick: { show: false },
        axisLabel: { color: '#475569', fontSize: 10, interval: 1 }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: yMax,
        splitLine: { lineStyle: { color: '#1e3a5f', type: 'dashed' } },
        axisLabel: { color: '#475569', fontSize: 10 }
      },
      series: [
        {
          name: '总收入',
          type: 'line',
          data: revenue,
          smooth: true,
          symbol: 'none',
          lineStyle: { color: '#4ade80', width: 2 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(74,222,128,0.35)' },
              { offset: 1, color: 'rgba(74,222,128,0.02)' }
            ])
          }
        },
        {
          name: '广告支出',
          type: 'line',
          data: adSpend,
          smooth: true,
          symbol: 'none',
          lineStyle: { color: '#fb923c', width: 2 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(251,146,60,0.25)' },
              { offset: 1, color: 'rgba(251,146,60,0.02)' }
            ])
          }
        },
        {
          name: '预估利润',
          type: 'line',
          data: profit,
          smooth: true,
          symbol: 'none',
          lineStyle: { color: '#a78bfa', width: 2, type: 'dashed' }
        }
      ],
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#0f1f3d',
        borderColor: '#1e40af',
        textStyle: { color: '#e2e8f0', fontSize: 12 }
      }
    })
  }

  function syncSankeyChart() {
    if (!sankeyRef.value) return
    if (!sankeyNodes.value.length || !sankeyLinks.value.length) {
      if (sankeyChart) sankeyChart.clear()
      return
    }
    if (!sankeyChart) {
      sankeyChart = echarts.init(sankeyRef.value, 'dark', { renderer: 'canvas' })
    }
    sankeyChart.setOption({
      backgroundColor: 'transparent',
      series: [
        {
          type: 'sankey',
          layout: 'none',
          emphasis: { focus: 'adjacency' },
          nodeWidth: 20,
          nodeGap: 12,
          left: '8%',
          right: '8%',
          top: '8%',
          bottom: '8%',
          data: sankeyNodes.value,
          links: sankeyLinks.value,
          label: {
            color: '#e2e8f0',
            fontSize: 11,
            formatter: (p: { name?: string }) => p.name ?? ''
          },
          lineStyle: {
            color: 'gradient',
            opacity: 0.4,
            curveness: 0.5
          }
        }
      ],
      tooltip: {
        trigger: 'item',
        backgroundColor: '#0f1f3d',
        borderColor: '#1e40af',
        textStyle: { color: '#e2e8f0' }
      }
    })
  }

  function handleResize() {
    mapChart?.resize()
    trendChart?.resize()
    sankeyChart?.resize()
  }

  watch(
    () => mapRef.value,
    () => {
      setupMapResizeObserver()
    },
    { flush: 'post', immediate: true }
  )

  watch(
    () => [pendingCountry.value, mapData.value, mapScatter.value],
    async () => {
      if (pendingCountry.value) return
      await nextTick()
      await syncMapChart()
    },
    { deep: true, flush: 'post' }
  )

  watch(
    () => [pendingTrend.value, trend30d.value],
    async () => {
      if (pendingTrend.value) return
      await nextTick()
      syncTrendChart()
    },
    { deep: true, flush: 'post' }
  )

  watch(
    () => [pendingSankey.value, sankeyNodes.value, sankeyLinks.value],
    async () => {
      if (pendingSankey.value) return
      await nextTick()
      syncSankeyChart()
    },
    { deep: true, flush: 'post' }
  )

  onMounted(async () => {
    window.addEventListener('resize', handleResize)
    await metaStore.ensureLoaded().catch(() => {
      // cockpit 元数据异常时，应用下拉回退为本页 meta appOptions
    })
    await loadFilterMeta()
    await loadDashboard()
    await nextTick()
    ensureAppProfitViewport()
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    teardownMapResizeObserver()
    mapChart?.dispose()
    trendChart?.dispose()
    sankeyChart?.dispose()
    mapChart = null
    trendChart = null
    sankeyChart = null
  })
</script>

<template>
  <div class="bi-root">
    <div class="bi-page-fx" aria-hidden="true"></div>
    <header class="bi-header bi-entry-1">
      <!-- <div class="bi-breadcrumb">
        <span class="bi-brand">{{ $t('menus.businessInsight.title') }}</span>
        <span class="bi-sep">›</span>
        <span class="bi-page">{{ $t('menus.businessInsight.profitAnalysis') }}</span>
      </div> -->
      <div class="bi-filters bi-filter-panel">
        <div class="bi-filter-field">
          <span class="bi-filter-label">{{
            $t('menus.businessInsight.profitAnalysisFilters.dateRange')
          }}</span>
          <ElDatePicker
            v-model="dateRangePicker"
            type="daterange"
            unlink-panels
            range-separator="～"
            :start-placeholder="$t('menus.businessInsight.profitAnalysisFilters.startDate')"
            :end-placeholder="$t('menus.businessInsight.profitAnalysisFilters.endDate')"
            value-format="YYYY-MM-DD"
            format="YYYY-MM-DD"
            :shortcuts="dateShortcuts"
            :clearable="false"
            :disabled="pendingMeta"
            class="bi-filter-date"
            popper-class="bi-select__popper"
          />
        </div>
        <div class="bi-filter-field">
          <span class="bi-filter-label">{{
            $t('menus.businessInsight.profitAnalysisFilters.app')
          }}</span>
          <AppPlatformSearchSelect
            v-model="query.sAppId"
            class="bi-filter-select"
            :placeholder="$t('menus.businessInsight.profitAnalysisFilters.selectPlaceholder')"
            :disabled="pendingMeta"
            search-placeholder="搜索类别/应用名称/应用简称"
            mode="app"
            :setting-apps="settingAppsForSelect"
            :height="36"
            :min-width="148"
            :max-width="220"
            input-class="bi-filter-select__input"
          >
          </AppPlatformSearchSelect>
        </div>
        <div class="bi-filter-field">
          <span class="bi-filter-label">{{
            $t('menus.businessInsight.profitAnalysisFilters.country')
          }}</span>
          <ElSelect
            v-model="query.sCountryCode"
            class="bi-filter-select"
            popper-class="bi-select__popper"
            :placeholder="$t('menus.businessInsight.profitAnalysisFilters.selectPlaceholder')"
            :disabled="pendingMeta"
            filterable
          >
            <ElOption
              v-for="opt in filterOptions.countryOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </ElSelect>
        </div>
        <div class="bi-filter-field">
          <span class="bi-filter-label">{{
            $t('menus.businessInsight.profitAnalysisFilters.platform')
          }}</span>
          <ElSelect
            v-model="query.platform"
            class="bi-filter-select bi-filter-select--platform"
            popper-class="bi-select__popper"
            :placeholder="$t('menus.businessInsight.profitAnalysisFilters.selectPlaceholder')"
            :disabled="pendingMeta"
          >
            <ElOption
              v-for="opt in filterOptions.platformOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </ElSelect>
        </div>
        <ElButton type="primary" plain round :disabled="pendingMeta" @click="reloadDashboard"
          >查询</ElButton
        >
      </div>
    </header>

    <section class="bi-kpi-row bi-entry-2">
      <template v-if="pendingKpi">
        <div v-for="i in 5" :key="i" class="kpi-card kpi-card--skeleton kpi-card--skel-fx">
          <!-- <div class="kpi-card-decor" aria-hidden="true">
            <span class="kpi-card-decor__bar kpi-card-decor__bar--a" />
            <span class="kpi-card-decor__bar kpi-card-decor__bar--b" />
            <span class="kpi-card-decor__bar kpi-card-decor__bar--c" />
          </div> -->
          <ElSkeleton animated>
            <template #template>
              <ElSkeletonItem variant="text" style="width: 40%; margin-bottom: 12px" />
              <ElSkeletonItem variant="h1" style="width: 70%; height: 32px; margin-bottom: 10px" />
              <ElSkeletonItem variant="text" style="width: 90%" />
            </template>
          </ElSkeleton>
        </div>
      </template>
      <template v-else>
        <div
          v-for="card in topKpiCards"
          :key="card.label"
          class="kpi-card kpi-card--neo"
          :style="{
            background: card.bg,
            '--card-border': card.border,
            '--kpi-accent': card.valueColor
          }"
        >
          <div class="kpi-edge kpi-edge--l" aria-hidden="true"></div>
          <div class="kpi-edge kpi-edge--r" aria-hidden="true"></div>

          <div class="kpi-top">
            <div class="kpi-label">{{ card.label }}</div>
            <div
              v-if="card.badge && !isEstimateBadge(card)"
              class="kpi-badge"
              :style="{ borderColor: card.badgeColor }"
            >
              {{ card.badge }}
            </div>
          </div>

          <div
            v-if="card.badge && isEstimateBadge(card)"
            class="kpi-badge kpi-badge--estimate"
            :style="{ borderColor: card.badgeColor, color: card.badgeColor }"
          >
            {{ card.badge }}
          </div>

          <div class="kpi-value">{{ card.value }}</div>
          <div v-if="card.sub" class="kpi-sub">{{ card.sub }}</div>
        </div>
      </template>
    </section>

    <section class="bi-bot-row bi-entry-4">
      <div class="bi-card bi-trend">
        <div class="card-title">利润趋势（近30天）</div>
        <div class="bi-chart-host">
          <div
            v-show="pendingTrend"
            class="bi-skeleton-block bi-skeleton-block--chart bi-skeleton--fx"
          >
            <ElSkeleton animated :rows="0">
              <template #template>
                <ElSkeletonItem variant="rect" style="width: 100%; height: 240px" />
              </template>
            </ElSkeleton>
          </div>
          <div v-show="!pendingTrend" ref="trendRef" class="chart-area"></div>
        </div>
      </div>

      <div class="bi-card bi-sankey">
        <div class="card-title">利润构成分析</div>
        <div class="bi-chart-host">
          <div
            v-show="pendingSankey"
            class="bi-skeleton-block bi-skeleton-block--chart bi-skeleton--fx"
          >
            <ElSkeleton animated :rows="0">
              <template #template>
                <ElSkeletonItem variant="rect" style="width: 100%; height: 240px" />
              </template>
            </ElSkeleton>
          </div>
          <div v-show="!pendingSankey" ref="sankeyRef" class="chart-area"></div>
        </div>
      </div>
    </section>

    <section class="bi-mid-row bi-entry-3">
      <div class="bi-card bi-map-panel">
        <div class="card-title">国家或地区利润分布</div>
        <div class="bi-chart-host bi-chart-host--map">
          <!-- 地图容器始终占位，避免 v-show:none 时 ECharts 以 0×0 初始化导致不绘制 -->
          <div ref="mapRef" class="world-map" aria-label="国家利润分布地图"></div>
          <div v-show="pendingCountry" class="bi-map-loading-mask">
            <div class="bi-skeleton-block bi-skeleton-block--map bi-skeleton--fx">
              <ElSkeleton animated :rows="0">
                <template #template>
                  <ElSkeletonItem variant="rect" style="width: 100%; height: 100%" />
                </template>
              </ElSkeleton>
            </div>
          </div>
        </div>
        <div class="card-title" style="margin-top: 12px">国家利润详情 Top10</div>
        <div class="bi-table-host bi-table-host--country">
          <div v-show="pendingCountry" class="bi-skeleton-block bi-skeleton--fx">
            <ElSkeleton animated :rows="5">
              <template #template>
                <ElSkeletonItem
                  v-for="n in 5"
                  :key="n"
                  variant="text"
                  style="width: 100%; height: 24px; margin-bottom: 6px"
                />
              </template>
            </ElSkeleton>
          </div>
          <table v-show="!pendingCountry" class="data-table country-table">
            <thead>
              <tr>
                <th>国家</th>
                <th>广告收入</th>
                <th>付费收入</th>
                <th>广告支出</th>
                <th>利润</th>
                <th>利润率</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in countryRows" :key="row.name + (row.s_country_code ?? '')">
                <td class="td-country">
                  <span
                    v-if="countryRowFiClass(row)"
                    :class="countryRowFiClass(row)"
                    class="cflag cflag--fi"
                    aria-hidden="true"
                  />
                  {{ row.name }}
                </td>
                <td>{{ row.adRev }}</td>
                <td>{{ row.paidRev }}</td>
                <td>{{ row.adSpend }}</td>
                <td :style="{ color: row.profitColor, fontWeight: 600 }">{{ row.profit }}</td>
                <td :style="{ color: row.rateColor, fontWeight: 600 }">{{ row.rate }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="bi-card bi-app-table">
        <div class="card-title">应用利润详情</div>
        <div class="bi-table-host">
          <div v-show="pendingApp" class="bi-skeleton-block bi-skeleton--fx">
            <ElSkeleton animated :rows="6">
              <template #template>
                <ElSkeletonItem
                  v-for="n in 6"
                  :key="n"
                  variant="text"
                  style="width: 100%; height: 28px; margin-bottom: 8px"
                />
              </template>
            </ElSkeleton>
          </div>

          <div v-show="!pendingApp" ref="appProfitTableWrapRef" class="bi-v2-wrap">
            <div ref="appProfitScrollEl" class="bi-v2-host">
              <ElTableV2
                ref="appProfitTableV2Ref"
                :width="appProfitTableWidth || 1"
                :height="appProfitTableHeight"
                :row-height="APP_PROFIT_ROW_HEIGHT"
                :header-height="38"
                :columns="appProfitColumns"
                :data="appProfitTableRowsForV2"
                :fixed-data="appProfitFixedData"
                row-key="id"
                :row-class="({ rowData }) => (rowData?.isRoot ? 'bi-v2-row--root' : '')"
                scrollbar-always-on
                @scroll="handleAppProfitTableV2Scroll"
              />
            </div>

            <div v-if="appProfitExpanded" class="bi-v2-foot">
              <template v-if="appProfitLoadingMore">
                <span class="bi-v2-spin" aria-hidden="true"></span>
                加载中…
              </template>
              <template v-else>
                已显示 {{ appProfitChildrenVisible.length }} /
                {{ appProfitChildrenAll.length }} 个国家
                <span
                  v-if="appProfitChildrenVisible.length < appProfitChildrenAll.length"
                  class="bi-v2-foot__hint"
                >
                  （滚到最底部加载更多）
                </span>
                <span v-else class="bi-v2-foot__hint">（已加载完成）</span>
              </template>
            </div>

            <div ref="appProfitHScrollRef" class="bi-v2-hscroll" @scroll="handleAppProfitHScroll">
              <div
                class="bi-v2-hscroll__spacer"
                :style="{ width: appProfitContentWidth + 'px' }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <footer class="bi-footer">
      <span class="footer-warn">⚠ 真实利润需月度对账后确认，当前为预估值</span>
    </footer>
  </div>
</template>

<style scoped lang="scss">
  @use '../../user-growth/ad-performance/styles/ap-card-fx.scss' as ap;

  /* 旋转渐变边框：CSS Houdini @property（复刻 ad-performance-kpi-cards） */
  @property --kpi-border-angle {
    syntax: '<angle>';
    initial-value: 0deg;
    inherits: false;
  }

  .bi-root {
    --bg-deep: #0f1012;
    --bg-card: #0d1b2e;
    --bg-card2: #0f2040;
    --border: #1a3052;
    --border-hl: #1e4080;
    --text-pri: #e2e8f0;
    --text-sec: #64748b;
    --text-muted: #334155;
    --green: #4ade80;
    --orange: #fb923c;
    --purple: #a855f7;
    --cyan: #2dd4bf;
    --yellow: #facc15;
    --red: #f87171;

    position: relative;
    min-height: 100vh;
    padding: 0 0 16px;
    overflow-x: clip;
    font-family: 'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', sans-serif;
    font-size: 13px;
    color: var(--text-pri);
    user-select: none;
    background: var(--bg-deep);
    isolation: isolate;

    &::before {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      content: '';
      background:
        radial-gradient(ellipse 70% 50% at 6% 6%, rgb(16 185 129 / 34%) 0%, transparent 58%),
        radial-gradient(ellipse 55% 42% at 94% 8%, rgb(59 130 246 / 34%) 0%, transparent 58%),
        radial-gradient(ellipse 40% 35% at 48% 16%, rgb(168 85 247 / 14%) 0%, transparent 55%);
      mask-image: linear-gradient(to bottom, black 0%, black 32%, transparent 62%);
      animation: bi-ap-aurora-drift 14s ease-in-out infinite alternate;
    }

    &::after {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      content: '';
      background-image:
        linear-gradient(rgb(186 230 253 / 5%) 1px, transparent 1px),
        linear-gradient(90deg, rgb(186 230 253 / 5%) 1px, transparent 1px);
      background-size: 40px 40px;
      mask-image: linear-gradient(to bottom, black 0%, black 22%, transparent 48%);
    }

    > *:not(.bi-page-fx) {
      position: relative;
      z-index: 1;
    }
  }

  .bi-page-fx {
    position: absolute;
    inset: -12% -12% 52%;
    z-index: 0;
    pointer-events: none;
    background: conic-gradient(
      from 0deg at 50% 50%,
      transparent 0deg,
      rgb(59 130 246 / 11%) 55deg,
      rgb(6 182 212 / 7%) 80deg,
      transparent 130deg,
      rgb(16 185 129 / 9%) 200deg,
      transparent 285deg,
      rgb(168 85 247 / 7%) 330deg,
      transparent 360deg
    );
    opacity: 0.8;
    mask-image: linear-gradient(to bottom, black 0%, black 46%, transparent 82%);
    animation: bi-ap-fx-spin 52s linear infinite;
    will-change: transform;
  }

  @keyframes bi-ap-aurora-drift {
    0% {
      opacity: 0.72;
      transform: scale(1) translate(0, 0);
    }

    100% {
      opacity: 1;
      transform: scale(1.04) translate(1%, -0.8%);
    }
  }

  @keyframes bi-ap-fx-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes bi-ap-slide-up {
    from {
      opacity: 0;
      transform: translateY(16px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes bi-skeleton-orbit {
    0%,
    100% {
      box-shadow:
        0 0 0 1px rgb(96 165 250 / 16%),
        0 0 22px rgb(59 130 246 / 8%);
    }

    50% {
      box-shadow:
        0 0 0 1px rgb(96 165 250 / 34%),
        0 0 38px rgb(59 130 246 / 18%),
        0 0 64px rgb(6 182 212 / 8%);
    }
  }

  .bi-entry-1 {
    animation: bi-ap-slide-up 0.52s var(--ease-out, cubic-bezier(0, 0, 0.2, 1)) both;
    animation-delay: 0.04s;
  }

  .bi-entry-2 {
    animation: bi-ap-slide-up 0.56s var(--ease-out, cubic-bezier(0, 0, 0.2, 1)) both;
    animation-delay: 0.1s;
  }

  .bi-entry-3 {
    animation: bi-ap-slide-up 0.58s var(--ease-out, cubic-bezier(0, 0, 0.2, 1)) both;
    animation-delay: 0.16s;
  }

  .bi-entry-4 {
    animation: bi-ap-slide-up 0.6s var(--ease-out, cubic-bezier(0, 0, 0.2, 1)) both;
    animation-delay: 0.22s;
  }

  .bi-header {
    padding: 14px 24px;
    background: linear-gradient(180deg, rgb(19 21 24 / 88%) 0%, rgb(15 16 18 / 72%) 100%);
    border-bottom: 1px solid rgb(96 165 250 / 18%);
  }

  .bi-breadcrumb {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 16px;
    font-weight: 700;
  }

  .bi-brand {
    color: #38bdf8;
    letter-spacing: 0.5px;
  }

  .bi-sep {
    color: #475569;
  }

  .bi-page {
    color: var(--text-pri);
  }

  .bi-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
  }

  .bi-filter-panel {
    padding: 10px 14px;
    overflow: hidden;
    border-radius: 16px;

    @include ap.ap-neon-bg;
    @include ap.ap-card-mesh;

    transition:
      box-shadow 0.35s var(--ease-out, cubic-bezier(0, 0, 0.2, 1)),
      border-color 0.3s var(--ease-default, cubic-bezier(0.4, 0, 0.2, 1));

    &:hover {
      border-color: rgb(96 165 250 / 48%);
      box-shadow:
        0 12px 40px rgb(0 0 0 / 44%),
        0 0 0 1px rgb(96 165 250 / 22%),
        inset 0 1px 0 rgb(186 230 253 / 16%),
        0 0 48px rgb(59 130 246 / 14%);
    }

    .bi-filter-field {
      position: relative;
      z-index: 1;
    }
  }

  .bi-filter-panel :deep(.bi-filter-select .el-select__wrapper),
  .bi-filter-panel :deep(.bi-filter-select__input .el-select__wrapper),
  .bi-filter-panel :deep(.bi-filter-date.el-date-editor--daterange) {
    min-height: 36px;
    background: color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 6%, transparent);
    border: 1px solid var(--theme-color, var(--art-primary, #3b82f6));
    border-radius: var(--el-border-radius-base, 4px);
    box-shadow: none;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease,
      background 0.2s ease;
  }

  .bi-filter-panel :deep(.bi-filter-select .el-select__wrapper:hover),
  .bi-filter-panel :deep(.bi-filter-select__input .el-select__wrapper:hover),
  .bi-filter-panel :deep(.bi-filter-date.el-date-editor--daterange:hover) {
    border-color: var(--theme-color, var(--art-primary, #3b82f6));
    box-shadow: 0 0 0 1px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 14%, transparent);
  }

  .bi-filter-panel :deep(.bi-filter-select .el-select__wrapper.is-focused),
  .bi-filter-panel :deep(.bi-filter-select__input .el-select__wrapper.is-focused),
  .bi-filter-panel :deep(.bi-filter-date.el-date-editor--daterange.is-active),
  .bi-filter-panel :deep(.bi-filter-date.el-date-editor--daterange:focus-within) {
    border-color: var(--theme-color, var(--art-primary, #3b82f6)) !important;
    box-shadow: 0 0 0 2px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 18%, transparent) !important;
  }

  .bi-filter-field {
    display: flex;
    gap: 8px;
    align-items: center;
    min-height: 32px;
  }

  .bi-filter-label {
    flex-shrink: 0;
    font-size: 12px;
    color: var(--text-sec);
    white-space: nowrap;
  }

  .bi-filter-select {
    width: 148px;
  }

  .bi-filter-select--platform {
    width: 128px;
  }

  .bi-filter-date {
    width: 260px;
  }

  :deep(.bi-filter-select .el-select__wrapper),
  :deep(.bi-filter-select__input .el-select__wrapper),
  :deep(.bi-filter-date.el-date-editor--daterange) {
    min-height: 36px;
  }

  :deep(.bi-filter-select .el-select__wrapper:hover),
  :deep(.bi-filter-select__input .el-select__wrapper:hover),
  :deep(.bi-filter-date.el-date-editor--daterange:hover) {
    border-color: var(--theme-color, var(--art-primary, #3b82f6));
  }

  :deep(.bi-filter-select .el-select__placeholder),
  :deep(.bi-filter-select .el-select__selected-item),
  :deep(.bi-filter-select .el-select__caret),
  :deep(.bi-filter-date .el-range-input),
  :deep(.bi-filter-select__input .el-select__placeholder),
  :deep(.bi-filter-select__input .el-select__selected-item),
  :deep(.bi-filter-select__input .el-select__caret) {
    color: var(--theme-color, var(--art-primary, #3b82f6));
  }

  :deep(.bi-filter-date .el-range-separator) {
    color: var(--theme-color, var(--art-primary, #3b82f6));
  }

  .bi-filter-panel :deep(.bi-query-btn.el-button) {
    height: 36px;
    padding: 0 18px;
    font-weight: 600;
    color: var(--theme-color, var(--art-primary, #3b82f6));
    background: color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 6%, transparent);
    border: 1px solid var(--theme-color, var(--art-primary, #3b82f6));
    box-shadow: none;
  }

  .bi-filter-panel :deep(.bi-query-btn.el-button:hover) {
    border-color: var(--theme-color, var(--art-primary, #3b82f6));
    box-shadow: 0 0 0 1px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 14%, transparent);
  }

  .bi-kpi-row {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 14px;
    padding: 16px 24px 0;
  }

  .kpi-card {
    position: relative;
    padding: 14px 16px 12px;
    overflow: hidden;
    background-clip: padding-box;
    border: 1px solid transparent;
    border-radius: 10px;

    &::before {
      position: absolute;
      inset: 0;
      padding: 1px;
      pointer-events: none;
      content: '';
      background: var(--card-border);
      border-radius: 10px;
      -webkit-mask:
        linear-gradient(#fff 0 0) content-box,
        linear-gradient(#fff 0 0);
      mask:
        linear-gradient(#fff 0 0) content-box,
        linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
    }

    /**
     * 四边光晕：用一层模糊的渐变描边做外扩散光（不占内容层级）。
     * 与 ::before 的“锐利描边”叠加，能同时保留边界清晰度与氛围光。
     */
    &::after {
      position: absolute;
      inset: -2px;
      pointer-events: none;
      content: '';
      background: var(--card-border);
      filter: blur(12px);
      border-radius: 12px;
      opacity: 0.32;
      transform: translateZ(0);
    }

    /* 内发光：让四边更“亮”一点，不抢文字 */
    box-shadow:
      inset 0 0 0 1px rgb(255 255 255 / 4%),
      inset 0 0 18px color-mix(in srgb, var(--kpi-glow, rgb(56 189 248)) 10%, transparent);

    &--skeleton {
      background: var(--bg-card);
      border: 1px solid var(--border);

      &::before {
        display: none;
      }

      &::after {
        display: none;
      }
    }

    &--skel-fx {
      animation: bi-skeleton-orbit 2.45s ease-in-out infinite;
    }

    &--skel-fx:nth-child(even) {
      animation-delay: 0.12s;
    }
  }

  /** 右下角微型柱状装饰（不参与信息层级） */
  .kpi-card-decor {
    position: absolute;
    right: 8px;
    bottom: 8px;
    z-index: 0;
    display: flex;
    gap: 4px;
    align-items: flex-end;
    height: 26px;
    pointer-events: none;
    opacity: 0.88;
  }

  .kpi-card--skeleton .kpi-card-decor {
    opacity: 0.72;
  }

  .kpi-card--skeleton :deep(.el-skeleton) {
    position: relative;
    z-index: 1;
  }

  .kpi-card-decor__bar {
    width: 4px;
    border-radius: 9999px;
    box-shadow: 0 0 10px rgb(0 0 0 / 15%);
  }

  .kpi-card-decor__bar--a {
    height: 10px;
    background: linear-gradient(180deg, rgb(45 212 191 / 85%) 0%, rgb(45 212 191 / 45%) 100%);
  }

  .kpi-card-decor__bar--b {
    height: 22px;
    background: linear-gradient(180deg, rgb(74 222 128 / 88%) 0%, rgb(74 222 128 / 48%) 100%);
  }

  .kpi-card-decor__bar--c {
    height: 14px;
    background: linear-gradient(180deg, rgb(251 146 60 / 88%) 0%, rgb(251 146 60 / 48%) 100%);
  }

  .kpi-card:not(.kpi-card--skeleton, .kpi-card--neo) {
    cursor: default;
    transition:
      box-shadow 0.32s ease,
      filter 0.32s ease;

    &:hover {
      z-index: 1;
      filter: brightness(1.07);
      box-shadow:
        0 20px 40px -14px rgb(0 0 0 / 72%),
        0 0 0 1px color-mix(in srgb, var(--kpi-glow, rgb(56 189 248)) 28%, transparent),
        0 0 32px -8px color-mix(in srgb, var(--kpi-glow, rgb(56 189 248)) 26%, transparent),
        0 0 78px color-mix(in srgb, var(--kpi-glow, rgb(56 189 248)) 16%, transparent),
        inset 0 0 18px color-mix(in srgb, var(--kpi-glow, rgb(56 189 248)) 12%, transparent);
    }

    &:active {
      transition-duration: 0.14s;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .kpi-card:not(.kpi-card--skeleton) {
      transition:
        box-shadow 0.2s ease,
        filter 0.2s ease;

      &:hover,
      &:active {
        filter: brightness(1.05);
        box-shadow: 0 0 0 1px rgb(56 189 248 / 35%);
        transform: none;
      }
    }
  }

  /** 顶部 KPI 卡片：霓虹描边 + 顶部光带（对齐截图风格） */
  .kpi-card--neo {
    /* 复刻广告成效 KPI 卡片风格 */
    --kpi-accent: #3b82f6;
    --kpi-accent-2: color-mix(in srgb, var(--kpi-accent) 55%, #22d3ee);
    --kpi-glow: color-mix(in srgb, var(--kpi-accent) 45%, transparent);
    --kpi-glow-2: color-mix(in srgb, var(--kpi-accent-2) 22%, transparent);
    --kpi-spin-a: color-mix(in srgb, var(--kpi-accent) 62%, transparent);
    --kpi-spin-b: color-mix(in srgb, var(--kpi-accent-2) 48%, transparent);
    --kpi-spin-c: color-mix(in srgb, #a855f7 38%, transparent);

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 18px 12px;
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

    /* 顶部主题色高光弧（贴边，复刻 ad-performance） */
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

    /* 底部主题色反光线（贴边，复刻 ad-performance） */
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

    /* 左右边缘光带：补齐四周“贴边发亮” */
    .kpi-edge {
      position: absolute;
      top: 10px;
      bottom: 10px;
      z-index: 0;
      width: 1px;
      pointer-events: none;
      background: linear-gradient(
        180deg,
        transparent,
        color-mix(in srgb, var(--kpi-accent) 85%, transparent),
        color-mix(in srgb, var(--kpi-accent-2) 65%, transparent),
        transparent
      );

      /* 不依赖 blur 外扩散，避免被 overflow:hidden 裁掉 */
      box-shadow:
        0 0 0 1px color-mix(in srgb, var(--kpi-accent) 16%, transparent),
        0 0 12px color-mix(in srgb, var(--kpi-accent) 45%, transparent),
        0 0 26px color-mix(in srgb, var(--kpi-accent-2) 18%, transparent);
      opacity: 0.9;
    }

    .kpi-edge--l {
      left: 1px;
    }

    .kpi-edge--r {
      right: 1px;
    }

    > *:not(.kpi-edge, .kpi-badge--estimate) {
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

    .kpi-value {
      text-shadow: 0 0 22px rgb(0 0 0 / 22%);
    }
  }

  .kpi-top {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    margin-top: -6px;
    margin-bottom: 8px;
    pointer-events: none;
  }

  /* 顶/底反光线已改为卡片自身 ::before/::after（贴边） */

  .kpi-label {
    font-size: 12px;
    font-weight: 600;
    color: rgb(248 250 252 / 92%);
  }

  .kpi-badge {
    padding: 1px 6px;
    font-size: 10px;
    color: rgb(248 250 252 / 92%);
    pointer-events: none;
    background: rgb(255 255 255 / 4%);
    border: 1px solid currentcolor;
    border-radius: 4px;
  }

  .kpi-badge--estimate {
    position: absolute;
    top: 10px;
    right: 12px;
    z-index: 2;
    padding: 2px 8px;
    font-weight: 700;
    letter-spacing: 0.02em;
    background: color-mix(in srgb, currentcolor 10%, rgb(8 8 12 / 92%));
    box-shadow:
      0 0 0 1px color-mix(in srgb, currentcolor 28%, transparent),
      0 0 16px color-mix(in srgb, currentcolor 22%, transparent);
  }

  .kpi-value {
    position: relative;
    z-index: 1;
    margin-bottom: 6px;
    font-size: 26px;
    font-weight: 700;
    line-height: 1.2;
    color: rgb(248 250 252 / 96%);
    text-align: center;
    letter-spacing: -0.5px;
  }

  .kpi-sub {
    display: none;
  }

  .bi-card {
    position: relative;
    padding: 14px 16px;
    overflow: hidden;
    border: 2px solid transparent;
    border-radius: 10px;

    @include ap.ap-neon-bg;
    @include ap.ap-card-mesh;
    @include ap.ap-panel-hover;
  }

  .bi-card > * {
    position: relative;
    z-index: 1;
  }

  .card-title {
    padding-bottom: 6px;
    margin-bottom: 10px;
    font-size: 13px;
    font-weight: 600;
    border-bottom: 1px solid rgb(96 165 250 / 22%);

    @include ap.ap-title-gradient;
  }

  .bi-mid-row {
    display: grid;
    grid-template-columns: 4fr 6fr;
    gap: 14px;
    padding: 14px 24px 0;
  }

  .bi-table-host {
    position: relative;
    min-height: 280px;
  }

  .bi-app-table .bi-table-host {
    /* 禁止外层滚动，避免与 TableV2 内部滚动叠加产生双滚动条 */
    max-height: none;
    overflow: hidden;
  }

  .bi-v2-wrap {
    /* 预留外置横向滚动条空间 */
    padding-bottom: 18px;
    overflow: hidden;
    background: rgb(10 10 14 / 40%);
    border: 1px solid rgb(96 165 250 / 18%);
    border-radius: 10px;
  }

  .bi-v2-resizer {
    width: 100%;
  }

  .bi-v2-host {
    position: relative;
  }

  /* 隐藏 TableV2 内置横向滚动条，改用外置横向滚动条 */
  .bi-v2-host :deep(.el-vl__horizontal) {
    display: none !important;
  }

  .bi-v2-hscroll {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 3;
    height: 18px;
    overflow: auto hidden;
    background: rgb(10 10 14 / 92%);
    backdrop-filter: blur(10px);
    border-top: 1px solid rgb(96 165 250 / 14%);
  }

  .bi-v2-hscroll__spacer {
    height: 1px;
  }

  .bi-v2-hscroll::-webkit-scrollbar {
    height: 12px;
  }

  .bi-v2-hscroll::-webkit-scrollbar-track {
    background: rgb(148 163 184 / 10%);
    border-radius: 9999px;
  }

  .bi-v2-hscroll::-webkit-scrollbar-thumb {
    background: color-mix(
      in srgb,
      var(--theme-color, var(--el-color-primary, #3b82f6)) 55%,
      transparent
    );
    border-radius: 9999px;
  }

  /* TableV2 容器与主题适配 */
  .bi-v2-host :deep(.el-table-v2) {
    background: transparent;
  }

  /* 禁止单元格/表头的 ellipsis（不要显示 ...），宽度不够时直接裁切 */
  .bi-v2-host :deep(.el-table-v2__cell-text) {
    text-overflow: clip !important;
  }

  .bi-v2-host :deep(.el-table-v2__header-cell .el-table-v2__cell-text) {
    text-overflow: clip !important;
  }

  .bi-v2-host :deep(.el-table-v2__header-row) {
    background: rgb(10 10 14 / 92%);
    backdrop-filter: blur(10px);
  }

  .bi-v2-host :deep(.el-table-v2__header-cell) {
    padding: 0 6px;
    font-size: 12px;
    font-weight: 500;
    color: var(--text-sec);
    border-bottom: 1px solid var(--border);
  }

  .bi-v2-host :deep(.el-table-v2__row-cell) {
    padding: 0 6px;
  }

  .bi-v2-host :deep(.el-table-v2__row) {
    color: #cbd5e1;
    border-bottom: 1px solid rgb(30 64 128 / 40%);
  }

  .bi-v2-host :deep(.el-table-v2__row:hover) {
    background: rgb(30 64 128 / 18%);
  }

  .bi-v2-host :deep(.bi-v2-row--root) {
    background: color-mix(in srgb, rgb(59 130 246) 6%, transparent);
  }

  /* TableV2 内部元素不带 scoped 属性，需用 :deep() 才能生效 */
  .bi-v2-host :deep(.bi-expand) {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    max-width: 100%;
    padding: 6px 4px;
    font: inherit;
    color: var(--text-pri);
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: 8px;
    transition:
      background 0.2s var(--ease-default, cubic-bezier(0.4, 0, 0.2, 1)),
      box-shadow 0.2s var(--ease-default, cubic-bezier(0.4, 0, 0.2, 1));
  }

  .bi-v2-host :deep(.bi-expand:focus-visible) {
    outline: none;
    box-shadow: 0 0 0 2px
      color-mix(in srgb, var(--theme-color, var(--el-color-primary, #3b82f6)) 35%, transparent);
  }

  .bi-v2-host :deep(.bi-expand:hover) {
    background: rgb(255 255 255 / 3%);
  }

  .bi-v2-host :deep(.bi-expand__chev) {
    position: relative;
    display: inline-flex;
    flex: 0 0 14px;
    align-items: center;
    justify-content: center;
    width: 14px;
    height: 14px;
  }

  .bi-v2-host :deep(.bi-expand__chev::before) {
    position: absolute;
    width: 0;
    height: 0;
    content: '';
    border-top: 6px solid transparent;
    border-bottom: 6px solid transparent;
    border-left: 8px solid rgb(148 163 184 / 85%);
    transition:
      transform 0.16s ease,
      border-left-color 0.16s ease;
    transform: translateX(1px) rotate(0deg);
  }

  .bi-v2-host :deep(.bi-expand__chev.is-open::before) {
    transform: translateX(0) rotate(90deg);
  }

  .bi-v2-host :deep(.bi-expand__text) {
    overflow: hidden;
    text-overflow: clip;
    white-space: nowrap;
  }

  .bi-child-name {
    display: inline-flex;
    gap: 10px;
    align-items: center;
    padding: 6px 4px 6px 22px;
    color: var(--text-pri);
  }

  .bi-child-dot {
    width: 6px;
    height: 6px;
    background: rgb(148 163 184 / 60%);
    border-radius: 9999px;
    box-shadow: 0 0 0 1px rgb(148 163 184 / 20%);
  }

  .bi-app-muted {
    padding: 6px 4px;
    color: rgb(148 163 184 / 75%);
    white-space: nowrap;
  }

  .td-country--v2 {
    display: inline-flex;
    gap: 8px;
    align-items: center;
  }

  .td-country__text {
    white-space: nowrap;
  }

  .bi-v2-foot {
    position: sticky;
    bottom: 14px;
    z-index: 2;
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 10px 12px;
    font-size: 11px;
    color: var(--text-sec);
    background: rgb(10 10 14 / 88%);
    backdrop-filter: blur(10px);
    border-top: 1px solid rgb(96 165 250 / 14%);
  }

  .bi-v2-foot__hint {
    color: rgb(148 163 184 / 80%);
  }

  .bi-v2-spin {
    width: 14px;
    height: 14px;
    border: 2px solid rgb(148 163 184 / 35%);
    border-top-color: color-mix(
      in srgb,
      var(--theme-color, var(--el-color-primary, #3b82f6)) 70%,
      white
    );
    border-radius: 9999px;
    animation: bi-v2-spin 0.8s linear infinite;
  }

  @keyframes bi-v2-spin {
    to {
      transform: rotate(360deg);
    }
  }

  .bi-table-host--country {
    min-height: 220px;
  }

  .bi-skeleton-block {
    position: absolute;
    inset: 0;
    padding: 4px 0;
  }

  .bi-skeleton--fx {
    animation: bi-skeleton-orbit 2.65s ease-in-out infinite;
  }

  .bi-skeleton--fx:nth-child(odd) {
    animation-delay: 0.08s;
  }

  .bi-skeleton-block--map {
    position: relative;
    height: 100%;
    min-height: 220px;
  }

  .bi-skeleton-block--chart {
    position: relative;
    height: 240px;
  }

  .bi-chart-host {
    position: relative;
    width: 100%;
  }

  .bi-chart-host--map {
    min-height: 0;
  }

  .bi-map-loading-mask {
    position: absolute;
    inset: 0;
    z-index: 2;
    background: rgb(13 27 46 / 94%);
    border-radius: 6px;
  }

  .data-table {
    width: 100%;
    font-size: 12px;
    border-collapse: collapse;

    th {
      padding: 6px 8px;
      font-weight: 500;
      color: var(--text-sec);
      text-align: right;
      white-space: nowrap;
      border-bottom: 1px solid var(--border);

      &:first-child {
        text-align: left;
      }
    }

    td {
      padding: 7px 8px;
      color: #cbd5e1;
      text-align: right;
      border-bottom: 1px solid rgb(30 64 128 / 40%);

      &:first-child {
        text-align: left;
      }
    }

    tbody tr:hover td {
      background: rgb(30 64 128 / 18%);
    }
  }

  .td-app {
    font-weight: 500;
    color: var(--text-pri) !important;
  }

  .th-trend {
    text-align: center !important;
  }

  .td-trend {
    text-align: center !important;
    vertical-align: middle;
  }

  .td-trend__inner {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 22px;
  }

  .td-country {
    display: flex;
    gap: 6px;
    align-items: center;
    font-weight: 500;
    color: var(--text-pri) !important;
  }

  .cflag {
    font-size: 14px;
  }

  .cflag--fi {
    display: inline-block;
    width: 1.15em;
    line-height: 1;
    background-size: cover;
  }

  .tr-total td {
    font-weight: 700 !important;
    color: var(--text-pri) !important;
    border-top: 1px solid var(--border-hl);
    border-bottom: none;
  }

  .world-map {
    display: block;
    width: 100%;
    height: 320px;
    min-height: 280px;
    overflow: hidden;
    border-radius: 6px;
  }

  .country-table th,
  .country-table td {
    padding: 5px 8px;
  }

  /* 國家列寬度：改下方 min-width 即可 */
  .country-table th:first-child,
  .country-table td:first-child {
    min-width: 70px;
  }

  .bi-bot-row {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
    padding: 14px 24px 0;
  }

  .chart-area {
    width: 100%;
    height: 240px;
  }

  .bi-footer {
    padding: 8px 16px;
    margin: 14px 24px 0;
    text-align: center;
    background: rgb(245 166 35 / 8%);
    border: 1px solid rgb(245 166 35 / 30%);
    border-radius: 6px;
  }

  .footer-warn {
    font-size: 12px;
    color: #f5a623;
  }

  @media (prefers-reduced-motion: reduce) {
    .bi-root::before {
      animation: none;
    }

    .bi-page-fx {
      animation: none;
    }

    .bi-entry-1,
    .bi-entry-2,
    .bi-entry-3,
    .bi-entry-4 {
      opacity: 1;
      transform: none;
      animation: none;
    }

    .kpi-card--skel-fx,
    .bi-skeleton--fx {
      animation: none;
    }

    .bi-card:hover,
    .bi-card:active {
      transform: none;
    }
  }

  :global(html.dark .bi-select__popper.el-popper) {
    overflow: hidden;
    background: rgb(24 24 27 / 98%) !important;
    border: 1px solid var(--theme-color, var(--art-primary, #3b82f6)) !important;
    border-radius: 12px !important;
    box-shadow: 0 18px 52px rgb(0 0 0 / 58%) !important;
  }

  :global(html:not(.dark) .bi-select__popper.el-popper) {
    border-radius: 12px !important;
    box-shadow: 0 14px 40px rgb(15 23 42 / 12%) !important;
  }

  @media (width <= 1280px) {
    .bi-kpi-row {
      grid-template-columns: repeat(3, 1fr);
    }

    .bi-mid-row,
    .bi-bot-row {
      grid-template-columns: 1fr;
    }
  }
</style>
