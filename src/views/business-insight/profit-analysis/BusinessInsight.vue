<script setup lang="ts">
  import 'flag-icons/css/flag-icons.min.css'
  import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
  import * as echarts from 'echarts'
  import type { ProfitCountryRow, ProfitMapDataItem } from './types'
  import {
    buildProfitMapScatterChartData,
    normalizeProfitMapDataForEchartsMapSeries
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
    appRows,
    appTotal,
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
    const mapSeriesData = normalizeProfitMapDataForEchartsMapSeries(mapData.value)
    const maxVal = Math.max(1, ...mapData.value.map((d: ProfitMapDataItem) => d.value))
    const scatterSeriesData = buildProfitMapScatterChartData(mapScatter.value, mapData.value)
    mapChart.setOption({
      backgroundColor: 'transparent',
      geo: {
        map: 'world',
        roam: true,
        scaleLimit: { min: 0.85, max: 8 },
        /** 让地图绘制区域占满画布，避免「外层 div 变高但地图仍缩在中间」的留白感 */
        layoutCenter: ['50%', '50%'],
        layoutSize: '118%',
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
      visualMap: {
        min: 0,
        max: maxVal,
        show: false,
        seriesIndex: 0,
        inRange: {
          color: ['#1a2744', '#1e4080', '#1d6fa4', '#22c55e']
        }
      }
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

  type SparkTrend = 'up' | 'down' | 'flat' | 'none'

  function normalizeAppTrend(raw: string | undefined): SparkTrend {
    const v = (raw ?? '').trim().toLowerCase()
    if (v === 'up' || v === 'down' || v === 'flat' || v === 'none') return v
    return 'none'
  }

  function getTrendPath(raw: string | undefined): string {
    const type = normalizeAppTrend(raw)
    if (type === 'none') return ''
    if (type === 'flat') return 'M0,10 C10,10 20,10 30,10 C40,10 50,10 60,10'
    if (type === 'up') return 'M0,18 C10,16 20,12 30,9 C40,6 50,4 60,2'
    return 'M0,2 C10,4 20,6 30,9 C40,12 50,16 60,18'
  }

  function getTrendColor(raw: string | undefined): string {
    const type = normalizeAppTrend(raw)
    if (type === 'up') return '#4ade80'
    if (type === 'down') return '#f87171'
    if (type === 'flat') return '#facc15'
    return '#475569'
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
    await loadFilterMeta()
    await loadDashboard()
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
          <ElSelect
            v-model="query.sAppId"
            class="bi-filter-select"
            popper-class="bi-select__popper"
            :placeholder="$t('menus.businessInsight.profitAnalysisFilters.selectPlaceholder')"
            :disabled="pendingMeta"
            filterable
          >
            <ElOption
              v-for="opt in filterOptions.appOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </ElSelect>
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

        <ElButton type="primary" round :disabled="pendingMeta" @click="reloadDashboard"
          >查询</ElButton
        >
      </div>
    </header>

    <section class="bi-kpi-row bi-entry-2">
      <template v-if="pendingKpi">
        <div v-for="i in 5" :key="i" class="kpi-card kpi-card--skeleton kpi-card--skel-fx">
          <div class="kpi-card-decor" aria-hidden="true">
            <span class="kpi-card-decor__bar kpi-card-decor__bar--a" />
            <span class="kpi-card-decor__bar kpi-card-decor__bar--b" />
            <span class="kpi-card-decor__bar kpi-card-decor__bar--c" />
          </div>
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
          v-for="card in kpiCards"
          :key="card.label"
          class="kpi-card"
          :style="{ background: card.bg, '--card-border': card.border }"
        >
          <div class="kpi-card-decor" aria-hidden="true">
            <span class="kpi-card-decor__bar kpi-card-decor__bar--a" />
            <span class="kpi-card-decor__bar kpi-card-decor__bar--b" />
            <span class="kpi-card-decor__bar kpi-card-decor__bar--c" />
          </div>
          <div class="kpi-top">
            <span class="kpi-label">{{ card.label }}</span>
            <span
              v-if="card.badge"
              class="kpi-badge"
              :style="{ color: card.badgeColor, borderColor: card.badgeColor }"
              >{{ card.badge }}</span
            >
          </div>
          <div class="kpi-value" :style="{ color: card.valueColor }">{{ card.value }}</div>
          <div class="kpi-sub">{{ card.sub }}</div>
        </div>
      </template>
    </section>

    <section class="bi-mid-row bi-entry-3">
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
          <table v-show="!pendingApp" class="data-table">
            <thead>
              <tr>
                <th>应用</th>
                <th>广告收入(预)</th>
                <th>付费收入</th>
                <th>总收入</th>
                <th>广告支出</th>
                <th>预估利润</th>
                <th>利润率</th>
                <th class="th-trend">趋势</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in appRows" :key="row.app">
                <td class="td-app">{{ row.app }}</td>
                <td>{{ row.adRev }}</td>
                <td>{{ row.paidRev }}</td>
                <td>{{ row.total }}</td>
                <td>{{ row.adSpend }}</td>
                <td :style="{ color: row.profitColor, fontWeight: 600 }">{{ row.profit }}</td>
                <td :style="{ color: row.rateColor, fontWeight: 600 }">{{ row.rate }}</td>
                <td class="td-trend">
                  <div class="td-trend__inner">
                    <svg
                      v-if="normalizeAppTrend(row.trend) !== 'none'"
                      width="60"
                      height="20"
                      viewBox="0 0 60 20"
                      class="td-trend__svg"
                    >
                      <path
                        :d="getTrendPath(row.trend)"
                        fill="none"
                        :stroke="getTrendColor(row.trend)"
                        stroke-width="1.8"
                        stroke-linecap="round"
                      />
                    </svg>
                    <span v-else class="td-trend__dash">—</span>
                  </div>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="tr-total">
                <td class="td-app">Total</td>
                <td>{{ appTotal.adRev }}</td>
                <td>{{ appTotal.paidRev }}</td>
                <td>{{ appTotal.total }}</td>
                <td>{{ appTotal.adSpend }}</td>
                <td style="font-weight: 700; color: #4ade80">{{ appTotal.profit }}</td>
                <td style="font-weight: 700; color: #4ade80">{{ appTotal.rate }}</td>
                <td class="td-trend"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div class="bi-card bi-map-panel">
        <div class="card-title">国家或地区利润分布</div>
        <div class="bi-chart-host bi-chart-host--map">
          <!-- 地图容器始终占位，避免 v-show:none 时 ECharts 在 0×0 初始化导致不绘制 -->
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

    <footer class="bi-footer">
      <span class="footer-warn">⚠ 真实利润需月度对账后确认，当前为预估值</span>
    </footer>
  </div>
</template>

<style scoped lang="scss">
  @use '../../user-growth/ad-performance/styles/ap-card-fx.scss' as ap;

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
  .bi-filter-panel :deep(.bi-filter-date.el-date-editor .el-range-editor.el-input__wrapper) {
    min-height: 34px;
    background: rgb(0 0 0 / 28%);
    border: 1px solid rgb(96 165 250 / 26%);
    border-radius: 10px;
    box-shadow: 0 0 0 1px rgb(59 130 246 / 6%) inset;
  }

  .bi-filter-panel :deep(.bi-filter-select .el-select__wrapper:hover),
  .bi-filter-panel :deep(.bi-filter-date .el-range-editor.el-input__wrapper:hover) {
    border-color: rgb(147 197 253 / 42%);
    box-shadow:
      0 0 0 1px rgb(56 189 248 / 12%) inset,
      0 0 20px rgb(59 130 246 / 12%);
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

    &--platform {
      width: 128px;
    }
  }

  .bi-filter-date {
    width: 260px;
  }

  :deep(.bi-filter-select .el-select__wrapper),
  :deep(.bi-filter-date.el-date-editor) {
    background: rgb(0 0 0 / 28%);
    border: 1px solid rgb(96 165 250 / 26%);
    border-radius: 10px;
    box-shadow: 0 0 0 1px rgb(59 130 246 / 6%) inset;
  }

  :deep(.bi-filter-select .el-select__wrapper:hover),
  :deep(.bi-filter-date .el-range-editor.el-input__wrapper:hover) {
    box-shadow: 0 0 0 1px #38bdf8 inset;
  }

  :deep(.bi-filter-select .el-select__placeholder),
  :deep(.bi-filter-date .el-range-input) {
    color: var(--text-pri);
  }

  :deep(.bi-filter-date .el-range-separator) {
    color: var(--text-sec);
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

    &--skeleton {
      background: var(--bg-card);
      border: 1px solid var(--border);

      &::before {
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

  .kpi-card:not(.kpi-card--skeleton) {
    cursor: default;
    transition:
      transform 0.32s cubic-bezier(0.22, 1, 0.36, 1),
      box-shadow 0.32s ease,
      filter 0.32s ease;

    &:hover {
      z-index: 1;
      filter: brightness(1.07);
      box-shadow:
        0 20px 40px -14px rgb(0 0 0 / 72%),
        0 0 0 1px rgb(56 189 248 / 28%),
        0 0 32px -8px rgb(56 189 248 / 22%);
      transform: translateY(-5px);
    }

    &:active {
      transition-duration: 0.14s;
      transform: translateY(-2px);
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

  .kpi-top {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
  }

  .kpi-label {
    font-size: 12px;
    font-weight: 500;
    color: var(--text-sec);
  }

  .kpi-badge {
    padding: 1px 6px;
    font-size: 10px;
    background: rgb(255 255 255 / 4%);
    border: 1px solid currentcolor;
    border-radius: 4px;
  }

  .kpi-value {
    position: relative;
    z-index: 1;
    margin-bottom: 6px;
    font-size: 26px;
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: -0.5px;
  }

  .kpi-sub {
    position: relative;
    z-index: 1;
    font-size: 11px;
    color: var(--text-sec);
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
    grid-template-columns: 1fr 420px;
    gap: 14px;
    padding: 14px 24px 0;
  }

  .bi-table-host {
    position: relative;
    min-height: 280px;
  }

  .bi-app-table .bi-table-host {
    max-height: 620px;
    overflow-y: auto;
  }

  .bi-app-table .data-table thead th {
    position: sticky;
    top: 0;
    z-index: 2;
    background: rgb(10 10 14 / 96%);
    box-shadow: 0 1px 0 rgb(96 165 250 / 18%);
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

  .td-trend__svg {
    display: block;
    flex-shrink: 0;
  }

  .td-trend__dash {
    line-height: 1;
    color: #475569;
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
    height: 240px;
    min-height: 220px;
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
    grid-template-columns: 1fr 420px;
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
    border: 1px solid rgb(96 165 250 / 30%) !important;
    border-radius: 12px !important;
    box-shadow:
      0 18px 52px rgb(0 0 0 / 58%),
      0 0 0 1px rgb(96 165 250 / 14%),
      inset 0 1px 0 rgb(186 230 253 / 10%) !important;
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
