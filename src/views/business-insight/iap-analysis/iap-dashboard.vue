<template>
  <div class="iap-dashboard-page art-full-height">
    <header class="iap-dashboard-header">
      <div class="iap-dashboard-header__left">
        <div class="iap-dashboard-breadcrumb">
          <span class="iap-dashboard-bc-parent">{{ $t('menus.businessInsight.title') }}</span>
          <span class="iap-dashboard-bc-sep">›</span>
          <span class="iap-dashboard-bc-current">{{
            $t('menus.businessInsight.iapAnalysis')
          }}</span>
        </div>
        <div class="iap-dashboard-subtitle">应用内购订单与收入分析</div>
      </div>
      <div class="iap-dashboard-header__actions">
        <ElButton class="iap-dashboard-btn iap-dashboard-btn--export" size="small" round>
          <ElIcon><Download /></ElIcon>
          导出
        </ElButton>
        <ElButton
          class="iap-dashboard-btn iap-dashboard-btn--refresh"
          size="small"
          round
          @click="loadDashboard"
        >
          <ElIcon><Refresh /></ElIcon>
          刷新
        </ElButton>
      </div>
    </header>

    <div class="iap-dashboard-filter">
      <div class="iap-dashboard-filter__item">
        <span class="iap-dashboard-f-label">时间范围</span>
        <ElSelect
          v-model="filters.timeRange"
          size="small"
          class="iap-dashboard-sel iap-dashboard-sel--w110"
        >
          <ElOption
            v-for="opt in filterOptions?.timeRangeOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </ElSelect>
      </div>
      <div class="iap-dashboard-filter__item">
        <span class="iap-dashboard-f-label">应用</span>
        <ElSelect
          v-model="filters.s_app_id"
          size="small"
          class="iap-dashboard-sel iap-dashboard-sel--w110"
        >
          <ElOption
            v-for="opt in filterOptions?.appOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </ElSelect>
      </div>
      <div class="iap-dashboard-filter__item">
        <span class="iap-dashboard-f-label">产品类型</span>
        <ElSelect
          v-model="filters.productType"
          size="small"
          class="iap-dashboard-sel iap-dashboard-sel--w90"
        >
          <ElOption
            v-for="opt in filterOptions?.productTypeOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </ElSelect>
      </div>
      <div class="iap-dashboard-filter__item">
        <span class="iap-dashboard-f-label">国家</span>
        <ElSelect
          v-model="filters.s_country_code"
          size="small"
          class="iap-dashboard-sel iap-dashboard-sel--w90"
        >
          <ElOption
            v-for="opt in filterOptions?.countryOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </ElSelect>
      </div>
      <div class="iap-dashboard-filter__item">
        <span class="iap-dashboard-f-label">平台</span>
        <ElSelect
          v-model="filters.platform"
          size="small"
          class="iap-dashboard-sel iap-dashboard-sel--w90"
        >
          <ElOption
            v-for="opt in filterOptions?.platformOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </ElSelect>
      </div>
    </div>

    <div class="iap-dashboard-kpi-row">
      <div
        v-for="(kpi, i) in kpiList"
        :key="i"
        class="iap-dashboard-kpi-card"
        :style="{ borderColor: kpi.borderColor }"
      >
        <div class="iap-dashboard-kpi-header">
          <span class="iap-dashboard-kpi-label">{{ kpi.label }}</span>
          <div :ref="(el) => setKpiRef(i, el)" class="iap-dashboard-kpi-sparkline"></div>
        </div>
        <div class="iap-dashboard-kpi-value">{{ kpi.value }}</div>
        <div class="iap-dashboard-kpi-change" :class="kpi.up ? 'is-up' : 'is-down'">
          <ElIcon :size="11"><component :is="kpi.up ? Top : Bottom" /></ElIcon>
          {{ kpi.change }} 环比
          <ElIcon v-if="!kpi.up && kpi.warn" :size="11" class="iap-dashboard-warn-icon">
            <Warning />
          </ElIcon>
        </div>
      </div>
    </div>

    <div class="iap-dashboard-trend-row">
      <div class="iap-dashboard-trend-card iap-dashboard-trend-card--wide">
        <div class="iap-dashboard-card-title">
          订单数 vs 收入趋势
          <div class="iap-dashboard-chart-legend">
            <span class="iap-dashboard-leg-item"
              ><i class="iap-dashboard-dot iap-dashboard-dot--teal"></i>订单数</span
            >
            <span class="iap-dashboard-leg-item"
              ><i class="iap-dashboard-dot iap-dashboard-dot--line"></i>收入</span
            >
          </div>
        </div>
        <div ref="chart1Ref" class="iap-dashboard-chart-area"></div>
      </div>
      <div class="iap-dashboard-trend-card">
        <div class="iap-dashboard-card-title">转化率趋势</div>
        <div ref="chart2Ref" class="iap-dashboard-chart-area"></div>
      </div>
      <div class="iap-dashboard-trend-card">
        <div class="iap-dashboard-card-title">ARPU趋势</div>
        <div ref="chart3Ref" class="iap-dashboard-chart-area"></div>
      </div>
    </div>

    <div class="iap-dashboard-section">
      <div class="iap-dashboard-section-header">
        <span class="iap-dashboard-section-title">应用分析</span>
        <span class="iap-dashboard-sort-hint">按收入排序 ▾</span>
      </div>
      <div class="iap-dashboard-app-cards">
        <div
          v-for="app in appList"
          :key="app.name"
          class="iap-dashboard-app-card"
          @click="handleAppClick(app)"
        >
          <div class="iap-dashboard-app-card-top">
            <div class="iap-dashboard-app-icon" :style="{ background: app.iconBg }">
              <ElIcon :size="14" color="#fff"
                ><component :is="iconMap[app.icon] || Iphone"
              /></ElIcon>
            </div>
            <span class="iap-dashboard-app-name">{{ app.name }}</span>
            <span
              class="iap-dashboard-app-platform"
              :class="app.platform === 'iOS' ? 'is-ios' : 'is-android'"
              >{{ app.platform }}</span
            >
          </div>
          <div class="iap-dashboard-app-stats">
            订单数 {{ app.orders }} / 收入 {{ app.revenue }} / ARPU {{ app.arpu }}
          </div>
          <div class="iap-dashboard-app-card-bottom">
            <span class="iap-dashboard-app-change" :class="app.up ? 'is-up' : 'is-down'">
              <ElIcon :size="10"><component :is="app.up ? Top : Bottom" /></ElIcon>
              {{ app.change }}
            </span>
            <div :ref="(el) => setAppRef(app.name, el)" class="iap-dashboard-app-sparkline"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="iap-dashboard-bottom-row">
      <div class="iap-dashboard-bottom-card iap-dashboard-bottom-card--wide">
        <div class="iap-dashboard-card-title">按国家/地区收入分布</div>
        <table class="iap-dashboard-country-table">
          <thead>
            <tr>
              <th>国家</th>
              <th class="iap-dashboard-tr">订单数</th>
              <th class="iap-dashboard-tr">收入(USD)</th>
              <th class="iap-dashboard-tr">占比</th>
              <th></th>
              <th class="iap-dashboard-tr">ARPU</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in countryData" :key="row.s_country_code">
              <td>
                <span class="iap-dashboard-flag">{{ row.flag }}</span>
                <span class="iap-dashboard-country-name">{{ row.country }}</span>
              </td>
              <td class="iap-dashboard-tr iap-dashboard-num">{{ row.orders.toLocaleString() }}</td>
              <td class="iap-dashboard-tr iap-dashboard-num iap-dashboard-num--green">{{
                row.revenue
              }}</td>
              <td class="iap-dashboard-tr iap-dashboard-num">{{ row.ratio }}</td>
              <td>
                <div class="iap-dashboard-ratio-wrap">
                  <div
                    class="iap-dashboard-ratio-bar"
                    :style="{
                      width: row.barWidth ?? row.ratio,
                      background: row.barColor ?? '#3b82f6'
                    }"
                  ></div>
                </div>
              </td>
              <td class="iap-dashboard-tr iap-dashboard-num">{{ row.arpu }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="iap-dashboard-bottom-card">
        <div class="iap-dashboard-card-title">产品类型分布</div>
        <div ref="donutRef" class="iap-dashboard-donut-area"></div>
        <div class="iap-dashboard-donut-legend">
          <div
            v-for="item in productTypeDonut"
            :key="item.name"
            class="iap-dashboard-donut-leg-item"
          >
            <i
              class="iap-dashboard-donut-dot"
              :style="{ background: donutColors[item.name] || '#0ea5e9' }"
            ></i>
            <span>{{ item.name }} {{ item.percent }}%</span>
            <span v-if="item.amount" class="iap-dashboard-donut-val">{{ item.amount }}</span>
          </div>
        </div>
      </div>
      <div class="iap-dashboard-bottom-card">
        <div class="iap-dashboard-card-title">
          平台对比
          <div class="iap-dashboard-chart-legend">
            <span class="iap-dashboard-leg-item"
              ><i class="iap-dashboard-dot iap-dashboard-dot--purple"></i>iOS</span
            >
            <span class="iap-dashboard-leg-item"
              ><i class="iap-dashboard-dot iap-dashboard-dot--green"></i>Android</span
            >
          </div>
        </div>
        <div ref="platformRef" class="iap-dashboard-platform-area"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, nextTick } from 'vue'
  import { useRouter } from 'vue-router'
  import {
    Download,
    Refresh,
    Top,
    Bottom,
    Warning,
    Iphone,
    Camera,
    VideoCamera,
    Sunny
  } from '@element-plus/icons-vue'
  import * as echarts from 'echarts'
  import {
    fetchIapMetaFilterOptions,
    fetchIapOverviewKpi,
    fetchIapOverviewTrend,
    fetchIapOverviewAppCards,
    fetchIapOverviewCountryDistribution,
    fetchIapOverviewProductTypeDonut,
    fetchIapOverviewPlatformCompare
  } from '@/api/business-insight'
  import type {
    IapFilterState,
    IapKpiCard,
    IapAppCard,
    IapCountryRow,
    IapProductTypeDonutItem
  } from '@/views/business-insight/iap-analysis/types'

  defineOptions({ name: 'IapDashboard' })

  const router = useRouter()

  const iconMap: Record<string, typeof Iphone> = {
    Iphone,
    Camera,
    VideoCamera,
    Sunny,
    Download
  }

  const defaultFilters: IapFilterState = {
    timeRange: '30',
    s_app_id: 'all',
    productType: 'all',
    s_country_code: 'all',
    platform: 'all'
  }
  const filters = ref<IapFilterState>({ ...defaultFilters })

  const filterOptions = ref<Awaited<ReturnType<typeof fetchIapMetaFilterOptions>> | null>(null)
  const kpiList = ref<IapKpiCard[]>([])
  const trendData = ref<Awaited<ReturnType<typeof fetchIapOverviewTrend>> | null>(null)
  const appList = ref<IapAppCard[]>([])
  const countryData = ref<(IapCountryRow & { barWidth?: string; barColor?: string })[]>([])
  const productTypeDonut = ref<IapProductTypeDonutItem[]>([])
  const platformCompare = ref<Awaited<ReturnType<typeof fetchIapOverviewPlatformCompare>> | null>(
    null
  )

  const donutColors: Record<string, string> = { 内购: '#0ea5e9', 订阅: '#a78bfa' }

  const kpiChartRefs = ref<(HTMLElement | null)[]>(Array(6).fill(null))

  const appChartRefs = ref<Record<string, HTMLElement | null>>({})

  const chart1Ref = ref<HTMLElement>()
  const chart2Ref = ref<HTMLElement>()
  const chart3Ref = ref<HTMLElement>()
  const donutRef = ref<HTMLElement>()
  const platformRef = ref<HTMLElement>()

  const charts: echarts.ECharts[] = []

  function initChart(el: HTMLElement | undefined, opt: echarts.EChartsOption) {
    if (!el) return
    const c = echarts.init(el, 'dark')
    c.setOption(opt)
    charts.push(c)
  }

  const axCfg = {
    axisLine: { lineStyle: { color: '#1e293b' } },
    splitLine: { lineStyle: { color: '#1a2535', type: 'dashed' as const } },
    axisLabel: { color: '#4b5563', fontSize: 10 }
  }

  function initChart1() {
    const data = trendData.value?.ordersRevenue
    if (!data || !chart1Ref.value) return
    initChart(chart1Ref.value, {
      backgroundColor: 'transparent',
      grid: { top: 20, right: 50, bottom: 28, left: 48 },
      legend: { show: false },
      xAxis: {
        type: 'category',
        data: data.dates,
        ...axCfg,
        axisLabel: { color: '#4b5563', fontSize: 9, interval: 4 }
      },
      yAxis: [
        { type: 'value', name: '', ...axCfg, axisLabel: { color: '#4b5563', fontSize: 9 } },
        { type: 'value', name: '', ...axCfg, axisLabel: { color: '#4b5563', fontSize: 9 } }
      ],
      series: [
        {
          type: 'bar',
          data: data.orders,
          yAxisIndex: 0,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(20,184,166,0.9)' },
              { offset: 1, color: 'rgba(20,184,166,0.2)' }
            ])
          },
          barWidth: '60%'
        },
        {
          type: 'line',
          data: data.revenue,
          yAxisIndex: 1,
          smooth: true,
          lineStyle: { color: '#f1f5f9', width: 1.5 },
          symbol: 'none',
          itemStyle: { color: '#f1f5f9' }
        }
      ]
    })
  }

  function initChart2() {
    const data = trendData.value?.conversion
    if (!data || !chart2Ref.value) return
    initChart(chart2Ref.value, {
      backgroundColor: 'transparent',
      grid: { top: 16, right: 10, bottom: 28, left: 40 },
      xAxis: {
        type: 'category',
        data: data.dates,
        ...axCfg,
        axisLabel: { color: '#4b5563', fontSize: 9, interval: 5 }
      },
      yAxis: {
        type: 'value',
        ...axCfg,
        axisLabel: { color: '#4b5563', fontSize: 9, formatter: '{value}%' }
      },
      series: [
        {
          type: 'line',
          data: data.values,
          smooth: true,
          lineStyle: { color: '#a855f7', width: 2 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(168,85,247,0.5)' },
              { offset: 1, color: 'rgba(168,85,247,0.02)' }
            ])
          },
          symbol: 'none',
          itemStyle: { color: '#a855f7' }
        }
      ]
    })
  }

  function initChart3() {
    const data = trendData.value?.arpu
    if (!data || !chart3Ref.value) return
    initChart(chart3Ref.value, {
      backgroundColor: 'transparent',
      grid: { top: 16, right: 10, bottom: 28, left: 40 },
      xAxis: {
        type: 'category',
        data: data.dates,
        ...axCfg,
        axisLabel: { color: '#4b5563', fontSize: 9, interval: 5 }
      },
      yAxis: {
        type: 'value',
        ...axCfg,
        axisLabel: { color: '#4b5563', fontSize: 9, formatter: '${value}' }
      },
      series: [
        {
          type: 'line',
          data: data.values,
          smooth: true,
          lineStyle: { color: '#14b8a6', width: 2 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(20,184,166,0.4)' },
              { offset: 1, color: 'rgba(20,184,166,0.02)' }
            ])
          },
          symbol: 'none',
          itemStyle: { color: '#14b8a6' }
        }
      ]
    })
  }

  function initDonut() {
    const list = productTypeDonut.value
    if (!list.length || !donutRef.value) return
    const colors: Record<string, string> = { 内购: '#0ea5e9', 订阅: '#a78bfa' }
    initChart(donutRef.value, {
      backgroundColor: 'transparent',
      series: [
        {
          type: 'pie',
          radius: ['52%', '75%'],
          center: ['50%', '48%'],
          label: { show: false },
          data: list.map((item) => ({
            value: item.value,
            name: item.name,
            itemStyle: { color: colors[item.name] ?? '#0ea5e9' }
          })),
          emphasis: { scale: false }
        }
      ]
    })
  }

  function initPlatform() {
    const data = platformCompare.value
    if (!data || !platformRef.value) return
    initChart(platformRef.value, {
      backgroundColor: 'transparent',
      grid: { top: 20, right: 10, bottom: 28, left: 36 },
      xAxis: { type: 'category', data: data.dimensions, ...axCfg },
      yAxis: {
        type: 'value',
        ...axCfg,
        axisLabel: { color: '#4b5563', fontSize: 9, formatter: '${value}' }
      },
      series: [
        {
          name: 'iOS',
          type: 'bar',
          data: data.ios,
          itemStyle: { color: '#8b5cf6' },
          barWidth: '28%'
        },
        {
          name: 'Android',
          type: 'bar',
          data: data.android,
          itemStyle: { color: '#10b981' },
          barWidth: '28%'
        }
      ]
    })
  }

  function initKpiSparklines() {
    const list = kpiList.value
    const colors = ['#0ea5e9', '#818cf8', '#22d3ee', '#c084fc', '#fbbf24', '#f87171']
    list.forEach((_kpi, i) => {
      const el = kpiChartRefs.value[i]
      if (!el) return
      const vals = Array.from({ length: 12 }, () => Math.random())
      const c = echarts.init(el, 'dark')
      c.setOption({
        backgroundColor: 'transparent',
        grid: { top: 0, right: 0, bottom: 0, left: 0 },
        xAxis: { type: 'category', show: false, data: vals.map((_, j) => j) },
        yAxis: { type: 'value', show: false },
        series: [
          {
            type: 'line',
            data: vals,
            smooth: true,
            lineStyle: { color: colors[i] ?? '#0ea5e9', width: 1.5 },
            symbol: 'none',
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: (colors[i] ?? '#0ea5e9') + '66' },
                { offset: 1, color: (colors[i] ?? '#0ea5e9') + '05' }
              ])
            },
            itemStyle: { color: colors[i] ?? '#0ea5e9' }
          }
        ]
      })
      charts.push(c)
    })
  }

  function initAppSparklines() {
    const colors = ['#6366f1', '#0ea5e9', '#3b82f6', '#f59e0b', '#ef4444']
    appList.value.forEach((app, i) => {
      const el = appChartRefs.value[app.name]
      if (!el) return
      const vals = Array.from({ length: 10 }, () => Math.random())
      const c = echarts.init(el, 'dark')
      c.setOption({
        backgroundColor: 'transparent',
        grid: { top: 0, right: 0, bottom: 0, left: 0 },
        xAxis: { type: 'category', show: false, data: vals.map((_, j) => j) },
        yAxis: { type: 'value', show: false },
        series: [
          {
            type: 'line',
            data: vals,
            smooth: true,
            lineStyle: { color: colors[i] ?? '#6366f1', width: 1.5 },
            symbol: 'none',
            itemStyle: { color: colors[i] ?? '#6366f1' }
          }
        ]
      })
      charts.push(c)
    })
  }

  function setKpiRef(i: number, el: unknown) {
    kpiChartRefs.value[i] = (el as HTMLElement) ?? null
  }

  function setAppRef(name: string, el: unknown) {
    appChartRefs.value[name] = (el as HTMLElement) ?? null
  }

  function handleAppClick(app: IapAppCard) {
    router.push({ name: 'IapAnalysisDetail', query: { app: app.name } })
  }

  function resizeCharts() {
    charts.forEach((c) => c.resize())
  }

  const params = () => ({
    timeRange: filters.value.timeRange,
    s_app_id: filters.value.s_app_id,
    productType: filters.value.productType,
    s_country_code: filters.value.s_country_code,
    platform: filters.value.platform
  })

  async function loadDashboard() {
    const p = params()
    const [metaRes, kpiRes, trendRes, appCardsRes, countryRes, donutRes, platformRes] =
      await Promise.all([
        fetchIapMetaFilterOptions(),
        fetchIapOverviewKpi(p),
        fetchIapOverviewTrend(p),
        fetchIapOverviewAppCards(p),
        fetchIapOverviewCountryDistribution(p),
        fetchIapOverviewProductTypeDonut({
          timeRange: p.timeRange,
          s_app_id: p.s_app_id,
          s_country_code: p.s_country_code,
          platform: p.platform
        }),
        fetchIapOverviewPlatformCompare({
          timeRange: p.timeRange,
          s_app_id: p.s_app_id,
          s_country_code: p.s_country_code
        })
      ])
    filterOptions.value = metaRes
    kpiList.value = kpiRes.kpis
    trendData.value = trendRes
    appList.value = appCardsRes.list
    const maxRatio = Math.max(
      ...countryRes.list.map((r) => parseFloat(String(r.ratio).replace('%', ''))),
      1
    )
    countryData.value = countryRes.list.map((r) => {
      const pct = parseFloat(String(r.ratio).replace('%', ''))
      return {
        ...r,
        barWidth: `${Math.round((pct / maxRatio) * 100)}%`,
        barColor: '#3b82f6'
      }
    })
    productTypeDonut.value = donutRes.list
    platformCompare.value = platformRes
    nextTick(() => {
      charts.forEach((c) => c.dispose())
      charts.length = 0
      initKpiSparklines()
      initAppSparklines()
      initChart1()
      initChart2()
      initChart3()
      initDonut()
      initPlatform()
    })
  }

  onMounted(() => {
    loadDashboard().then(() => {
      window.addEventListener('resize', resizeCharts)
    })
  })

  onUnmounted(() => {
    charts.forEach((c) => c.dispose())
    charts.length = 0
    window.removeEventListener('resize', resizeCharts)
  })
</script>

<style scoped lang="scss">
  .iap-dashboard-page {
    display: flex;
    flex-direction: column;
    width: 100%;
    min-height: 100%;
    padding: 0;
    overflow: auto;
    font-size: 13px;
    color: var(--art-gray-900);
    background: var(--default-bg-color);
  }

  .iap-dashboard-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 14px 20px 10px;
    border-bottom: 1px solid var(--default-border);
  }

  .iap-dashboard-header__left {
    flex-shrink: 0;
  }

  .iap-dashboard-breadcrumb {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 15px;
    font-weight: 600;
  }

  .iap-dashboard-bc-parent {
    color: var(--art-gray-600);
    cursor: pointer;

    &:hover {
      color: var(--art-gray-900);
    }
  }

  .iap-dashboard-bc-sep {
    color: var(--art-gray-400);
  }

  .iap-dashboard-bc-current {
    color: var(--art-gray-900);
  }

  .iap-dashboard-subtitle {
    margin-top: 3px;
    font-size: 12px;
    color: var(--art-gray-500);
  }

  .iap-dashboard-header__actions {
    display: flex;
    gap: 8px;
    padding-top: 2px;
  }

  .iap-dashboard-btn {
    &--export {
      color: var(--art-gray-600) !important;
      background: transparent !important;
      border: 1px solid var(--default-border) !important;

      &:hover {
        color: var(--art-primary) !important;
        border-color: var(--art-primary) !important;
      }
    }

    &--refresh {
      color: #fff !important;
      background: var(--art-primary) !important;
      border-color: var(--art-primary) !important;

      &:hover {
        opacity: 0.9;
      }
    }
  }

  .iap-dashboard-filter {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: center;
    padding: 8px 20px;
    background: var(--default-box-color);
    border-bottom: 1px solid var(--default-border);
  }

  .iap-dashboard-filter__item {
    display: flex;
    gap: 5px;
    align-items: center;
  }

  .iap-dashboard-f-label {
    font-size: 12px;
    color: var(--art-gray-600);
    white-space: nowrap;
  }

  :deep(.iap-dashboard-sel) {
    .el-input__wrapper {
      background: var(--default-bg-color) !important;
      border-radius: 5px;
      box-shadow: 0 0 0 1px var(--default-border) !important;

      &:hover {
        box-shadow: 0 0 0 1px var(--art-gray-600) !important;
      }
    }

    .el-input__inner {
      font-size: 12px;
      color: var(--art-gray-900) !important;
    }
  }

  :deep(.iap-dashboard-sel--w110) {
    width: 110px;
  }

  :deep(.iap-dashboard-sel--w90) {
    width: 90px;
  }

  .iap-dashboard-kpi-row {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 10px;
    padding: 12px 20px;
  }

  .iap-dashboard-kpi-card {
    padding: 12px 14px 10px;
    cursor: pointer;
    background: var(--default-box-color);
    border: 1px solid var(--default-border);
    border-top-width: 2px;
    border-radius: 8px;
    transition:
      border-color 0.2s,
      transform 0.15s;

    &:hover {
      transform: translateY(-1px);
    }
  }

  .iap-dashboard-kpi-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
  }

  .iap-dashboard-kpi-label {
    font-size: 11px;
    color: var(--art-gray-600);
  }

  .iap-dashboard-kpi-sparkline {
    width: 60px;
    height: 28px;
  }

  .iap-dashboard-kpi-value {
    margin-bottom: 4px;
    font-size: 22px;
    font-weight: 700;
    color: var(--art-gray-900);
    letter-spacing: -0.5px;
  }

  .iap-dashboard-kpi-change {
    display: flex;
    gap: 3px;
    align-items: center;
    font-size: 11px;

    &.is-up {
      color: var(--art-success);
    }

    &.is-down {
      color: var(--art-danger);
    }
  }

  .iap-dashboard-warn-icon {
    margin-left: 2px;
    color: var(--art-danger);
  }

  .iap-dashboard-trend-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    gap: 10px;
    padding: 0 20px 12px;
  }

  .iap-dashboard-trend-card {
    padding: 12px 14px;
    background: var(--default-box-color);
    border: 1px solid var(--default-border);
    border-radius: 8px;

    &--wide {
      grid-column: span 1;
    }
  }

  .iap-dashboard-chart-area {
    height: 130px;
  }

  .iap-dashboard-section {
    padding: 0 20px 12px;
  }

  .iap-dashboard-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .iap-dashboard-section-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--art-gray-900);
  }

  .iap-dashboard-sort-hint {
    font-size: 12px;
    color: var(--art-gray-600);
    cursor: pointer;

    &:hover {
      color: var(--art-gray-700);
    }
  }

  .iap-dashboard-app-cards {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 10px;
  }

  .iap-dashboard-app-card {
    padding: 12px;
    cursor: pointer;
    background: var(--default-box-color);
    border: 1px solid var(--default-border);
    border-radius: 8px;
    transition:
      border-color 0.2s,
      transform 0.15s;

    &:hover {
      border-color: var(--art-gray-400);
      transform: translateY(-1px);
    }
  }

  .iap-dashboard-app-card-top {
    display: flex;
    gap: 7px;
    align-items: center;
    margin-bottom: 6px;
  }

  .iap-dashboard-app-icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 6px;
  }

  .iap-dashboard-app-name {
    flex: 1;
    font-size: 12px;
    font-weight: 600;
    color: var(--art-gray-900);
  }

  .iap-dashboard-app-platform {
    flex-shrink: 0;
    padding: 1px 5px;
    font-size: 10px;
    border-radius: 3px;

    &.is-android {
      color: var(--art-success);
      background: rgb(16 185 129 / 20%);
      border: 1px solid rgb(16 185 129 / 40%);
    }

    &.is-ios {
      color: var(--art-primary);
      background: rgb(59 130 246 / 20%);
      border: 1px solid rgb(59 130 246 / 40%);
    }
  }

  .iap-dashboard-app-stats {
    margin-bottom: 8px;
    font-size: 11px;
    line-height: 1.5;
    color: var(--art-gray-600);
  }

  .iap-dashboard-app-card-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .iap-dashboard-app-change {
    display: flex;
    gap: 2px;
    align-items: center;
    font-size: 11px;

    &.is-up {
      color: var(--art-success);
    }

    &.is-down {
      color: var(--art-danger);
    }
  }

  .iap-dashboard-app-sparkline {
    width: 70px;
    height: 28px;
  }

  .iap-dashboard-bottom-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    gap: 10px;
    padding: 0 20px 20px;
  }

  .iap-dashboard-bottom-card {
    padding: 12px 14px;
    background: var(--default-box-color);
    border: 1px solid var(--default-border);
    border-radius: 8px;

    &--wide {
      grid-column: span 1;
    }
  }

  .iap-dashboard-card-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 12px;
    font-weight: 600;
    color: var(--art-gray-600);
  }

  .iap-dashboard-chart-legend {
    display: flex;
    gap: 10px;
  }

  .iap-dashboard-leg-item {
    display: flex;
    gap: 4px;
    align-items: center;
    font-size: 11px;
    font-weight: 400;
    color: var(--art-gray-600);
  }

  .iap-dashboard-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 2px;

    &--teal {
      background: #14b8a6;
    }

    &--line {
      background: #f1f5f9;
    }

    &--purple {
      background: #8b5cf6;
    }

    &--green {
      background: var(--art-success);
    }
  }

  .iap-dashboard-country-table {
    width: 100%;
    font-size: 12px;
    border-collapse: collapse;

    th {
      padding: 4px 6px 8px;
      font-weight: 500;
      color: var(--art-gray-600);
      text-align: left;
      border-bottom: 1px solid var(--default-border);

      &.iap-dashboard-tr {
        text-align: right;
      }
    }

    td {
      padding: 5px 6px;
      color: var(--art-gray-600);
      border-bottom: 1px solid var(--default-bg-color);

      &.iap-dashboard-tr {
        text-align: right;
      }

      &.iap-dashboard-num {
        font-variant-numeric: tabular-nums;
      }

      &.iap-dashboard-num--green {
        color: var(--art-success);
      }
    }

    tr:last-child td {
      border-bottom: none;
    }

    tr:hover td {
      background: var(--art-hover-color);
    }
  }

  .iap-dashboard-flag {
    margin-right: 5px;
    font-size: 13px;
  }

  .iap-dashboard-country-name {
    color: var(--art-gray-900);
  }

  .iap-dashboard-ratio-wrap {
    width: 60px;
    height: 5px;
    overflow: hidden;
    background: var(--default-border);
    border-radius: 3px;
  }

  .iap-dashboard-ratio-bar {
    height: 100%;
    border-radius: 3px;
  }

  .iap-dashboard-donut-area {
    height: 150px;
  }

  .iap-dashboard-donut-legend {
    display: flex;
    gap: 20px;
    justify-content: center;
    margin-top: 4px;
  }

  .iap-dashboard-donut-leg-item {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 11px;
    color: var(--art-gray-600);
  }

  .iap-dashboard-donut-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .iap-dashboard-donut-val {
    font-weight: 600;
    color: var(--art-gray-900);
  }

  .iap-dashboard-platform-area {
    height: 160px;
  }
</style>
