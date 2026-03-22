<script setup lang="ts">
  import 'flag-icons/css/flag-icons.min.css'
  import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
  import * as echarts from 'echarts'
  import type { ProfitMapDataItem } from './types'
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

  function fiCountryClass(code: string | undefined) {
    if (!code?.trim()) return ''
    const c = code.trim().toUpperCase()
    const alias: Record<string, string> = { UK: 'gb' }
    const iso = (alias[c] || c).toLowerCase()
    if (!/^[a-z]{2}$/.test(iso)) return ''
    return `fi fi-${iso}`
  }

  function isFlagImgUrl(flag: string | undefined) {
    if (!flag?.trim()) return false
    return /^https?:\/\//i.test(flag.trim())
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
    const maxVal = Math.max(1, ...mapData.value.map((d: ProfitMapDataItem) => d.value))
    mapChart.setOption({
      backgroundColor: 'transparent',
      geo: {
        map: 'world',
        roam: false,
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
          data: mapData.value,
          silent: false
        },
        {
          type: 'effectScatter',
          coordinateSystem: 'geo',
          rippleEffect: { brushType: 'stroke', scale: 3, period: 3 },
          symbolSize: 8,
          itemStyle: { color: '#4ade80' },
          data: mapScatter.value.filter((p) => Array.isArray(p.value) && p.value.length >= 3),
          label: {
            show: true,
            formatter: (p: { name?: string }) => p.name ?? '',
            position: 'right',
            color: '#e2e8f0',
            fontSize: 11,
            distance: 8
          }
        }
      ],
      visualMap: {
        min: 0,
        max: maxVal,
        show: false,
        inRange: {
          color: ['#1a2744', '#1e4080', '#1d6fa4', '#22c55e']
        }
      }
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
    <header class="bi-header">
      <div class="bi-breadcrumb">
        <span class="bi-brand">{{ $t('menus.businessInsight.title') }}</span>
        <span class="bi-sep">›</span>
        <span class="bi-page">{{ $t('menus.businessInsight.profitAnalysis') }}</span>
      </div>
      <div class="bi-filters">
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
            @change="reloadDashboard"
          />
        </div>
        <div class="bi-filter-field">
          <span class="bi-filter-label">{{
            $t('menus.businessInsight.profitAnalysisFilters.app')
          }}</span>
          <ElSelect
            v-model="query.sAppId"
            class="bi-filter-select"
            :placeholder="$t('menus.businessInsight.profitAnalysisFilters.selectPlaceholder')"
            :disabled="pendingMeta"
            filterable
            @change="reloadDashboard"
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
            :placeholder="$t('menus.businessInsight.profitAnalysisFilters.selectPlaceholder')"
            :disabled="pendingMeta"
            filterable
            @change="reloadDashboard"
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
            :placeholder="$t('menus.businessInsight.profitAnalysisFilters.selectPlaceholder')"
            :disabled="pendingMeta"
            @change="reloadDashboard"
          >
            <ElOption
              v-for="opt in filterOptions.platformOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </ElSelect>
        </div>
      </div>
    </header>

    <section class="bi-kpi-row">
      <template v-if="pendingKpi">
        <div v-for="i in 5" :key="i" class="kpi-card kpi-card--skeleton">
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

    <section class="bi-mid-row">
      <div class="bi-card bi-app-table">
        <div class="card-title">应用利润详情</div>
        <div class="bi-table-host">
          <div v-show="pendingApp" class="bi-skeleton-block">
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
                <th>趋势</th>
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
                  <svg
                    v-if="normalizeAppTrend(row.trend) !== 'none'"
                    width="60"
                    height="20"
                    viewBox="0 0 60 20"
                  >
                    <path
                      :d="getTrendPath(row.trend)"
                      fill="none"
                      :stroke="getTrendColor(row.trend)"
                      stroke-width="1.8"
                      stroke-linecap="round"
                    />
                  </svg>
                  <span v-else style="color: #475569">—</span>
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
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div class="bi-card bi-map-panel">
        <div class="card-title">国家利润分布</div>
        <div class="bi-chart-host bi-chart-host--map">
          <div v-show="pendingCountry" class="bi-skeleton-block bi-skeleton-block--map">
            <ElSkeleton animated :rows="0">
              <template #template>
                <ElSkeletonItem variant="rect" style="width: 100%; height: 200px" />
              </template>
            </ElSkeleton>
          </div>
          <div v-show="!pendingCountry" ref="mapRef" class="world-map"></div>
        </div>
        <div class="card-title" style="margin-top: 12px">国家利润详情 Top10</div>
        <div class="bi-table-host bi-table-host--country">
          <div v-show="pendingCountry" class="bi-skeleton-block">
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
              <tr
                v-for="row in countryRows"
                :key="row.name + (row.flag ?? '') + (row.s_country_code ?? '')"
              >
                <td class="td-country">
                  <span
                    v-if="fiCountryClass(row.s_country_code)"
                    :class="fiCountryClass(row.s_country_code)"
                    class="cflag cflag--fi"
                    aria-hidden="true"
                  />
                  <img
                    v-else-if="isFlagImgUrl(row.flag)"
                    :src="row.flag"
                    alt=""
                    class="cflag cflag--img"
                  />
                  <span v-else-if="row.flag" class="cflag">{{ row.flag }}</span>
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

    <section class="bi-bot-row">
      <div class="bi-card bi-trend">
        <div class="card-title">利润趋势（近30天）</div>
        <div class="bi-chart-host">
          <div v-show="pendingTrend" class="bi-skeleton-block bi-skeleton-block--chart">
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
          <div v-show="pendingSankey" class="bi-skeleton-block bi-skeleton-block--chart">
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
  .bi-root {
    --bg-deep: #070f1e;
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

    min-height: 100vh;
    padding: 0 0 16px;
    font-family: 'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', sans-serif;
    font-size: 13px;
    color: var(--text-pri);
    user-select: none;
    background: var(--bg-deep);
  }

  .bi-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 24px;
    background: linear-gradient(180deg, #0b1729 0%, var(--bg-deep) 100%);
    border-bottom: 1px solid var(--border);
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
    background: var(--bg-card2);
    box-shadow: 0 0 0 1px var(--border-hl) inset;
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
    margin-bottom: 6px;
    font-size: 26px;
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: -0.5px;
  }

  .kpi-sub {
    font-size: 11px;
    color: var(--text-sec);
  }

  .bi-card {
    padding: 14px 16px;
    overflow: hidden;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 10px;
  }

  .card-title {
    padding-bottom: 6px;
    margin-bottom: 10px;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-pri);
    border-bottom: 1px solid var(--border);
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
    z-index: 1;
    background: var(--bg-card);
    box-shadow: 0 1px 0 var(--border);
  }

  .bi-table-host--country {
    min-height: 220px;
  }

  .bi-skeleton-block {
    position: absolute;
    inset: 0;
    padding: 4px 0;
  }

  .bi-skeleton-block--map {
    position: relative;
    height: 200px;
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
    min-height: 200px;
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

  .td-trend {
    text-align: center !important;
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

  .cflag--img {
    flex-shrink: 0;
    width: 18px;
    height: 13px;
    object-fit: cover;
    border-radius: 2px;
  }

  .tr-total td {
    font-weight: 700 !important;
    color: var(--text-pri) !important;
    border-top: 1px solid var(--border-hl);
    border-bottom: none;
  }

  .world-map {
    width: 100%;
    height: 200px;
    overflow: hidden;
    border-radius: 6px;
  }

  .country-table th,
  .country-table td {
    padding: 5px 8px;
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
