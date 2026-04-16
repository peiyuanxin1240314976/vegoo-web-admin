<template>
  <div class="iap-dashboard-page iap-fx-page art-full-height">
    <div class="iap-page-fx" aria-hidden="true"></div>
    <header class="iap-dashboard-topbar iap-entry-1">
      <div class="iap-dashboard-header">
        <div class="iap-dashboard-header__left">
          <div class="iap-dashboard-subtitle">应用内购订单与收入分析</div>
        </div>
        <div class="iap-dashboard-header__actions">
          <ElButton class="iap-dashboard-btn iap-dashboard-btn--export" round>
            <ElIcon><Download /></ElIcon>
            导出
          </ElButton>
          <ElButton
            class="iap-dashboard-btn iap-dashboard-btn--refresh"
            round
            @click="loadDashboard"
          >
            <ElIcon><Refresh /></ElIcon>
            刷新
          </ElButton>
        </div>
      </div>

      <div class="iap-dashboard-filter">
        <div class="iap-dashboard-filter__item">
          <span class="iap-dashboard-f-label">时间范围</span>
          <ElDatePicker
            v-model="dateRange"
            type="daterange"
            :shortcuts="dateRangeShortcuts"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            class="iap-dashboard-sel iap-dashboard-sel--w220"
            popper-class="iap-date-popper"
          />
        </div>
        <div class="iap-dashboard-filter__item">
          <span class="iap-dashboard-f-label">应用</span>
          <ElSelect
            v-model="filters.s_app_id"
            class="iap-dashboard-sel iap-dashboard-sel--w110"
            popper-class="iap-select-popper"
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
          <span class="iap-dashboard-f-label">国家</span>
          <ElSelect
            v-model="filters.s_country_code"
            class="iap-dashboard-sel iap-dashboard-sel--w90"
            popper-class="iap-select-popper"
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
            class="iap-dashboard-sel iap-dashboard-sel--w90"
            popper-class="iap-select-popper"
          >
            <ElOption
              v-for="opt in filterOptions?.platformOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </ElSelect>
        </div>

        <ElButton round class="iap-dashboard-btn iap-dashboard-btn--query" @click="loadDashboard">
          查询
        </ElButton>
      </div>
    </header>

    <div class="iap-dashboard-kpi-row iap-entry-3">
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

    <div class="iap-dashboard-trend-row iap-entry-4">
      <div class="iap-dashboard-trend-card iap-dashboard-trend-card--wide iap-neon-surface">
        <div class="iap-dashboard-card-title">
          <span class="iap-card-title-text">订单数 vs 收入趋势</span>
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
      <div class="iap-dashboard-trend-card iap-neon-surface">
        <div class="iap-dashboard-card-title">
          <span class="iap-card-title-text">转化率趋势</span>
        </div>
        <div ref="chart2Ref" class="iap-dashboard-chart-area"></div>
      </div>
      <div class="iap-dashboard-trend-card iap-neon-surface">
        <div class="iap-dashboard-card-title">
          <span class="iap-card-title-text">ARPU趋势</span>
        </div>
        <div ref="chart3Ref" class="iap-dashboard-chart-area"></div>
      </div>
    </div>

    <div class="iap-dashboard-section iap-neon-surface iap-entry-4">
      <div class="iap-dashboard-section-header">
        <span class="iap-dashboard-section-title iap-card-title-text">应用分析</span>
        <span class="iap-dashboard-sort-hint">按收入排序 ▾</span>
      </div>
      <div class="iap-dashboard-app-cards">
        <div
          v-for="app in appList"
          :key="app.name"
          class="iap-dashboard-app-card iap-neon-surface"
          @click="handleAppClick(app)"
        >
          <div class="iap-dashboard-app-card-top">
            <div class="iap-dashboard-app-icon" :style="{ background: app.iconBg }">
              <ElIcon :size="14" color="var(--text-primary)"
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

    <div class="iap-dashboard-bottom-row iap-entry-4">
      <div class="iap-dashboard-bottom-card iap-dashboard-bottom-card--wide iap-neon-surface">
        <div class="iap-dashboard-card-title">
          <span class="iap-card-title-text">按国家/地区收入分布</span>
        </div>
        <div class="iap-dashboard-table-scroll">
          <table class="iap-dashboard-country-table">
            <thead>
              <tr>
                <th>国家</th>
                <th>订单数</th>
                <th>收入(USD)</th>
                <th>占比</th>
                <th></th>
                <th>ARPU</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in countryData" :key="row.s_country_code">
                <td>
                  <span class="iap-dashboard-flag">{{ row.flag }}</span>
                  <span class="iap-dashboard-country-name">{{ row.country }}</span>
                </td>
                <td class="iap-dashboard-num">{{ row.orders.toLocaleString() }}</td>
                <td class="iap-dashboard-num iap-dashboard-num--green">{{ row.revenue }}</td>
                <td class="iap-dashboard-num">{{ row.ratio }}</td>
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
                <td class="iap-dashboard-num">{{ row.arpu }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="iap-dashboard-bottom-card iap-neon-surface">
        <div class="iap-dashboard-card-title">
          <span class="iap-card-title-text">产品类型分布</span>
        </div>
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
      <div class="iap-dashboard-bottom-card iap-neon-surface">
        <div class="iap-dashboard-card-title">
          <span class="iap-card-title-text">平台对比</span>
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
  import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
  import { useRouter } from 'vue-router'
  import { cloneAppDate, formatYYYYMMDD, getAppNow, getAppTodayYYYYMMDD } from '@/utils/app-now'
  import { dateRangeShortcuts } from '@/utils/form/date-shortcuts'
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
  import { loadIapDashboardOverviewModules } from './composables/useIapDashboardModules'
  import type {
    IapFilterState,
    IapFilterOptions,
    IapKpiCard,
    IapAppCard,
    IapCountryRow,
    IapProductTypeDonutItem,
    IapOverviewTrend,
    IapPlatformCompare
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

  const defaultRangeStart = (() => {
    const day = cloneAppDate(getAppNow())
    day.setHours(0, 0, 0, 0)
    day.setDate(day.getDate() - 7)
    return formatYYYYMMDD(day)
  })()

  const defaultFilters: IapFilterState = {
    startDate: defaultRangeStart,
    endDate: getAppTodayYYYYMMDD(),
    s_app_id: 'all',
    s_country_code: 'all',
    platform: 'all'
  }
  const filters = ref<IapFilterState>({ ...defaultFilters })

  const dateRange = computed({
    get: (): [string, string] | null =>
      filters.value.startDate && filters.value.endDate
        ? [filters.value.startDate, filters.value.endDate]
        : null,
    set: (val: [string, string] | null) => {
      filters.value.startDate = val?.[0] ?? ''
      filters.value.endDate = val?.[1] ?? ''
    }
  })

  const filterOptions = ref<IapFilterOptions | null>(null)
  const kpiList = ref<IapKpiCard[]>([])
  const trendData = ref<IapOverviewTrend | null>(null)
  const appList = ref<IapAppCard[]>([])
  const countryData = ref<(IapCountryRow & { barWidth?: string; barColor?: string })[]>([])
  const productTypeDonut = ref<IapProductTypeDonutItem[]>([])
  const platformCompare = ref<IapPlatformCompare | null>(null)

  const donutColors: Record<string, string> = { 内购: '#0ea5e9', 订阅: '#a78bfa' }

  const kpiChartRefs = ref<(HTMLElement | null)[]>(Array(6).fill(null))

  const appChartRefs = ref<Record<string, HTMLElement | null>>({})

  const chart1Ref = ref<HTMLElement>()
  const chart2Ref = ref<HTMLElement>()
  const chart3Ref = ref<HTMLElement>()
  const donutRef = ref<HTMLElement>()
  const platformRef = ref<HTMLElement>()

  const charts: echarts.ECharts[] = []

  const dashChartAnim: echarts.EChartsOption = {
    animation: true,
    animationDuration: 880,
    animationEasing: 'cubicOut',
    animationDelay: (idx: number) => idx * 48,
    animationDurationUpdate: 420,
    animationEasingUpdate: 'cubicOut'
  }

  const dashSparklineAnim: echarts.EChartsOption = {
    animation: true,
    animationDuration: 480,
    animationEasing: 'cubicOut',
    animationDelay: (idx: number) => idx * 28,
    animationDurationUpdate: 260,
    animationEasingUpdate: 'cubicOut'
  }

  function initChart(el: HTMLElement | undefined, opt: echarts.EChartsOption) {
    if (!el) return
    const c = echarts.init(el, 'dark')
    c.setOption({ ...dashChartAnim, ...opt })
    charts.push(c)
  }

  const axCfg = {
    axisLine: { lineStyle: { color: '#1e293b' } },
    splitLine: { lineStyle: { color: '#1a2535', type: 'dashed' as const } },
    axisLabel: { color: '#4b5563', fontSize: 10 }
  }

  function dashCategoryXAxisLabel(len: number, fontSize = 10) {
    const rotate = len > 16 ? 38 : len > 10 ? 24 : 0
    return {
      color: '#94a3b8',
      fontSize: rotate ? 9 : fontSize,
      interval: 0,
      hideOverlap: false,
      rotate,
      margin: rotate ? 12 : 8
    }
  }

  function dashGridBottomForCategoryLen(len: number) {
    if (len > 16) return 44
    if (len > 10) return 36
    return 28
  }

  const dashTooltipAxis: echarts.TooltipComponentOption = {
    trigger: 'axis',
    confine: true,
    backgroundColor: 'rgba(24, 24, 27, 0.96)',
    borderColor: '#52525b',
    borderWidth: 1,
    padding: [10, 14],
    textStyle: { color: '#f4f4f5', fontSize: 12 },
    axisPointer: {
      type: 'line',
      lineStyle: { color: '#3b82f6', width: 1, type: 'dashed' },
      label: {
        show: true,
        color: '#e4e4e7',
        backgroundColor: '#27272a',
        borderColor: '#3f3f46',
        borderWidth: 1,
        padding: [4, 8]
      }
    }
  }

  const dashTooltipItem: echarts.TooltipComponentOption = {
    trigger: 'item',
    confine: true,
    backgroundColor: 'rgba(24, 24, 27, 0.96)',
    borderColor: '#52525b',
    borderWidth: 1,
    padding: [10, 14],
    textStyle: { color: '#f4f4f5', fontSize: 12 }
  }

  function canRenderLineAreaAxis(
    categories: unknown[] | undefined,
    values: unknown[] | undefined,
    minPoints = 2
  ) {
    if (!Array.isArray(categories) || !Array.isArray(values)) return false
    if (categories.length < minPoints || values.length !== categories.length) return false
    return values.every((v) => v !== undefined && v !== null && !Number.isNaN(Number(v)))
  }

  function initChart1() {
    const data = trendData.value?.ordersRevenue
    if (!data || !chart1Ref.value) return
    if (
      !Array.isArray(data.dates) ||
      data.dates.length < 1 ||
      !Array.isArray(data.orders) ||
      !Array.isArray(data.revenue) ||
      data.orders.length !== data.dates.length ||
      data.revenue.length !== data.dates.length
    ) {
      return
    }
    const d1 = data.dates.length
    initChart(chart1Ref.value, {
      backgroundColor: 'transparent',
      tooltip: { ...dashTooltipAxis },
      grid: { top: 20, right: 50, bottom: dashGridBottomForCategoryLen(d1), left: 48 },
      legend: { show: false },
      xAxis: {
        type: 'category',
        data: data.dates,
        ...axCfg,
        axisLabel: dashCategoryXAxisLabel(d1, 9)
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
    if (!canRenderLineAreaAxis(data.dates, data.values)) return
    const d2 = data.dates.length
    initChart(chart2Ref.value, {
      backgroundColor: 'transparent',
      tooltip: { ...dashTooltipAxis },
      grid: { top: 16, right: 10, bottom: dashGridBottomForCategoryLen(d2), left: 40 },
      xAxis: {
        type: 'category',
        data: data.dates,
        ...axCfg,
        axisLabel: dashCategoryXAxisLabel(d2, 9)
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
    if (!canRenderLineAreaAxis(data.dates, data.values)) return
    const d3 = data.dates.length
    initChart(chart3Ref.value, {
      backgroundColor: 'transparent',
      tooltip: { ...dashTooltipAxis },
      grid: { top: 16, right: 10, bottom: dashGridBottomForCategoryLen(d3), left: 40 },
      xAxis: {
        type: 'category',
        data: data.dates,
        ...axCfg,
        axisLabel: dashCategoryXAxisLabel(d3, 9)
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
      tooltip: { ...dashTooltipItem },
      series: [
        {
          type: 'pie',
          radius: ['52%', '75%'],
          center: ['50%', '48%'],
          animationType: 'scale',
          animationEasing: 'cubicOut',
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
    const pd = data.dimensions.length
    initChart(platformRef.value, {
      backgroundColor: 'transparent',
      tooltip: { ...dashTooltipAxis },
      grid: { top: 20, right: 10, bottom: dashGridBottomForCategoryLen(pd), left: 36 },
      xAxis: {
        type: 'category',
        data: data.dimensions,
        ...axCfg,
        axisLabel: dashCategoryXAxisLabel(pd, 9)
      },
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
        ...dashSparklineAnim,
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
                { offset: 1, color: (colors[i] ?? '#0ea5e9') + '00' }
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
        ...dashSparklineAnim,
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
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: (colors[i] ?? '#6366f1') + '66' },
                { offset: 1, color: (colors[i] ?? '#6366f1') + '00' }
              ])
            },
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
    router.push({ name: 'IapAnalysisDetail', query: { app: app.name, appId: app.appId } })
  }

  function resizeCharts() {
    charts.forEach((c) => c.resize())
  }

  const params = () => ({
    startDate: filters.value.startDate,
    endDate: filters.value.endDate,
    s_app_id: filters.value.s_app_id,
    s_country_code: filters.value.s_country_code,
    platform: filters.value.platform
  })

  async function loadDashboard() {
    const p = params()
    const { meta, kpi, trend, appCards, country, donut, platform } =
      await loadIapDashboardOverviewModules(p)
    filterOptions.value = meta
    kpiList.value = kpi.kpis
    trendData.value = trend
    appList.value = appCards.list
    const maxRatio = Math.max(
      ...country.list.map((r) => parseFloat(String(r.ratio).replace('%', ''))),
      1
    )
    countryData.value = country.list.map((r) => {
      const pct = parseFloat(String(r.ratio).replace('%', ''))
      const safeWidth = isNaN(pct) ? 0 : Math.round((pct / maxRatio) * 100)
      return {
        ...r,
        barWidth: `${safeWidth}%`,
        barColor: '#3b82f6'
      }
    })
    productTypeDonut.value = donut.list
    platformCompare.value = platform
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
  @use './styles/iap-card-fx.scss' as *;
  @use '../../user-growth/ad-performance/styles/ap-card-fx.scss' as ap;

  .iap-dashboard-page {
    display: flex;
    flex-direction: column;
    width: 100%;
    min-height: 100%;
    padding: 20px 24px 28px;
    overflow: hidden;
    font-size: 13px;
    color: var(--art-gray-900);
    background: transparent;
  }

  .iap-dashboard-topbar {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    padding: 18px 20px;
    margin-bottom: 16px;
    background: color-mix(in srgb, var(--default-bg-color) 82%, transparent);
    backdrop-filter: blur(12px);
    border: 1px solid color-mix(in srgb, var(--el-color-primary) 24%, transparent);
    border-radius: 14px;
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--el-color-primary) 8%, transparent);
  }

  .iap-dashboard-header {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    align-items: center;
  }

  .iap-dashboard-header__left {
    flex-shrink: 0;
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
        color: var(--el-color-primary) !important;
        border-color: var(--el-color-primary) !important;
      }
    }

    &--refresh {
      color: var(--text-primary) !important;
      background: var(--el-color-primary) !important;
      border-color: var(--el-color-primary) !important;

      &:hover {
        opacity: 0.9;
      }
    }

    &--query {
      --el-button-bg-color: color-mix(
        in srgb,
        var(--theme-color, var(--art-primary, #3b82f6)) 6%,
        transparent
      );
      --el-button-text-color: var(--theme-color, var(--art-primary, #3b82f6));
      --el-button-border-color: var(--theme-color, var(--art-primary, #3b82f6));
      --el-button-hover-text-color: var(--theme-color, var(--art-primary, #3b82f6));
      --el-button-hover-border-color: var(--theme-color, var(--art-primary, #3b82f6));
      --el-button-hover-bg-color: color-mix(
        in srgb,
        var(--theme-color, var(--art-primary, #3b82f6)) 10%,
        transparent
      );
      --el-button-active-text-color: var(--theme-color, var(--art-primary, #3b82f6));
      --el-button-active-border-color: var(--theme-color, var(--art-primary, #3b82f6));
      --el-button-active-bg-color: color-mix(
        in srgb,
        var(--theme-color, var(--art-primary, #3b82f6)) 12%,
        transparent
      );

      box-shadow: none;
      transition:
        box-shadow 0.22s var(--ease-default),
        transform 0.18s var(--ease-default);

      &:hover {
        box-shadow: 0 0 0 1px
          color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 14%, transparent);
        transform: translateY(-1px);
      }
    }
  }

  .iap-dashboard-filter {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    padding: 0;
    margin-bottom: 0;
    background: transparent;
    border: none;
  }

  .iap-dashboard-filter__item {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .iap-dashboard-f-label {
    font-size: 13px;
    color: var(--art-gray-600);
    white-space: nowrap;
  }

  :deep(.iap-dashboard-sel) {
    --el-input-focus-border-color: var(--theme-color, var(--art-primary, #3b82f6));
    --el-border-color-hover: var(--theme-color, var(--art-primary, #3b82f6));
    --el-border-color-focus: var(--theme-color, var(--art-primary, #3b82f6));
    --el-component-size: 40px;

    .el-select__wrapper,
    .el-input__wrapper {
      padding: 0 14px;
      background: color-mix(
        in srgb,
        var(--theme-color, var(--art-primary, #3b82f6)) 6%,
        transparent
      ) !important;
      border: 1px solid var(--theme-color, var(--art-primary, #3b82f6)) !important;
      border-radius: var(--el-border-radius-base, 4px);
      box-shadow: none !important;
      transition:
        border-color 0.22s var(--ease-default),
        box-shadow 0.22s var(--ease-default),
        background-color 0.22s var(--ease-default);
    }

    .el-input__inner,
    .el-select__selected-item {
      font-size: 14px;
      color: var(--text-primary) !important;
    }

    .el-input__prefix-inner {
      margin-right: 4px;
    }

    .el-select__placeholder {
      color: var(--el-text-color-placeholder);
    }

    .el-select__caret,
    .el-select__suffix,
    .el-select__icon {
      color: var(--theme-color, var(--art-primary, #3b82f6));
    }
  }

  :deep(.iap-dashboard-sel.el-date-editor.el-date-editor--daterange) {
    background: color-mix(
      in srgb,
      var(--theme-color, var(--art-primary, #3b82f6)) 6%,
      transparent
    ) !important;
    border: 1px solid var(--theme-color, var(--art-primary, #3b82f6)) !important;
    border-radius: var(--el-border-radius-base, 4px) !important;
    box-shadow: none !important;
    transition:
      border-color 0.22s var(--ease-default),
      box-shadow 0.22s var(--ease-default),
      background-color 0.22s var(--ease-default);
  }

  :deep(.iap-dashboard-sel.el-date-editor.el-date-editor--daterange:hover) {
    border-color: var(--theme-color, var(--art-primary, #3b82f6)) !important;
    box-shadow: 0 0 0 1px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 14%, transparent) !important;
  }

  :deep(.iap-dashboard-sel.el-date-editor.el-date-editor--daterange.is-active),
  :deep(.iap-dashboard-sel.el-date-editor.el-date-editor--daterange:focus-within) {
    border-color: var(--theme-color, var(--art-primary, #3b82f6)) !important;
    box-shadow: 0 0 0 2px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 18%, transparent) !important;
  }

  :deep(.iap-dashboard-sel.el-date-editor.el-date-editor--daterange .el-range-input),
  :deep(.iap-dashboard-sel.el-date-editor.el-date-editor--daterange .el-range-separator),
  :deep(.iap-dashboard-sel.el-date-editor.el-date-editor--daterange .el-range__icon),
  :deep(.iap-dashboard-sel.el-date-editor.el-date-editor--daterange .el-range__close-icon) {
    color: var(--theme-color, var(--art-primary, #3b82f6));
  }

  :deep(.iap-dashboard-sel .el-select__wrapper.is-focused),
  :deep(.iap-dashboard-sel .el-input__wrapper.is-focus),
  :deep(.iap-dashboard-sel.el-date-editor--daterange:focus-within .el-input__wrapper) {
    background: color-mix(
      in srgb,
      var(--theme-color, var(--art-primary, #3b82f6)) 6%,
      transparent
    ) !important;
    border-color: var(--theme-color, var(--art-primary, #3b82f6)) !important;
    box-shadow: 0 0 0 2px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 18%, transparent) !important;
  }

  :deep(.iap-dashboard-sel .el-select__wrapper:hover),
  :deep(.iap-dashboard-sel .el-input__wrapper:hover) {
    border-color: var(--theme-color, var(--art-primary, #3b82f6)) !important;
    box-shadow: 0 0 0 1px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 14%, transparent) !important;
  }

  :deep(.iap-dashboard-sel--w220) {
    width: 220px;
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
    margin-bottom: 16px;
  }

  .iap-dashboard-kpi-card {
    @extend %iap-neon-surface;

    min-height: 112px;
    padding: 12px 14px 10px;
    cursor: pointer;
    border-top-width: 2px;
  }

  .iap-dashboard-kpi-header {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    align-items: center;
    margin-bottom: 6px;
  }

  .iap-dashboard-kpi-label {
    font-size: 11px;
    color: var(--art-gray-600);
  }

  .iap-dashboard-kpi-sparkline {
    width: 100%;
    height: 36px;
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
    margin-bottom: 16px;
  }

  .iap-dashboard-trend-card {
    display: flex;
    flex-direction: column;
    min-height: 220px;
    padding: 12px 14px;

    &--wide {
      grid-column: span 1;
    }
  }

  .iap-dashboard-chart-area {
    flex: 1;
    min-height: 160px;
  }

  .iap-dashboard-section {
    padding: 12px 14px;
    margin-bottom: 16px;
  }

  .iap-dashboard-section-header {
    display: flex;
    column-gap: 12px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .iap-dashboard-section-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--art-gray-900);
  }

  .iap-card-title-text {
    @include ap.ap-title-gradient;
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
    gap: 12px;
  }

  .iap-dashboard-app-card {
    min-height: 96px;
    padding: 14px;
    cursor: pointer;
  }

  .iap-dashboard-app-card-top {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 10px;
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
      background: color-mix(in srgb, var(--art-success) 20%, transparent);
      border: 1px solid color-mix(in srgb, var(--art-success) 40%, transparent);
    }

    &.is-ios {
      color: var(--el-color-primary);
      background: color-mix(in srgb, var(--el-color-primary) 20%, transparent);
      border: 1px solid color-mix(in srgb, var(--el-color-primary) 40%, transparent);
    }
  }

  .iap-dashboard-app-stats {
    margin-bottom: 10px;
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
  }

  .iap-dashboard-bottom-card {
    display: flex;
    flex-direction: column;
    min-height: 260px;
    padding: 12px 14px;

    &--wide {
      grid-column: span 1;
    }
  }

  .iap-dashboard-card-title {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    font-size: 12px;
    font-weight: 600;
    color: var(--art-gray-600);
  }

  .iap-neon-surface {
    @include ap.ap-card-title-hover('.iap-card-title-text');
  }

  .iap-dashboard-chart-legend {
    display: flex;
    gap: 12px;
  }

  .iap-dashboard-leg-item {
    display: flex;
    gap: 6px;
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

  .iap-dashboard-table-scroll {
    flex: 1;
    min-height: 0;
    max-height: 200px;
    overflow: auto;
    overscroll-behavior: contain;
    border-radius: 10px;
  }

  .iap-dashboard-country-table {
    width: 100%;
    font-size: 12px;
    border-collapse: collapse;

    th {
      position: sticky;
      top: 0;
      z-index: 2;
      padding: 4px 6px 8px;
      font-weight: 500;
      color: var(--art-gray-600);
      text-align: left;
      background: color-mix(in srgb, var(--default-box-color) 88%, transparent);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid var(--default-border);
    }

    td {
      padding: 5px 6px;
      color: var(--art-gray-600);
      border-bottom: 1px solid var(--default-bg-color);

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
    flex: 1;
    min-height: 160px;
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
    flex: 1;
    min-height: 170px;
  }
</style>

<style lang="scss">
  @use './styles/iap-popper.scss' as *;
</style>
