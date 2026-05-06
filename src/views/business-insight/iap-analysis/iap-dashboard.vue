<template>
  <div class="iap-dashboard-page iap-fx-page art-full-height">
    <div class="iap-page-fx" aria-hidden="true"></div>
    <header class="iap-dashboard-topbar iap-entry-1">
      <div class="iap-dashboard-filter iap-filter-panel">
        <div class="iap-dashboard-filter__item">
          <AppDatePicker
            v-model="dateRange"
            type="daterange"
            :shortcuts="dateRangeShortcuts"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            class="iap-filter-date"
            popper-class="iap-filter__popper"
            :prefix-icon="Calendar"
          />
        </div>
        <div class="iap-dashboard-filter__item">
          <AppPlatformSearchSelect
            v-model="filters.s_app_id"
            class="iap-filter-select iap-filter-select--app"
            input-class="iap-filter-select__input"
            mode="app"
            placeholder="应用"
            search-placeholder="应用"
            :setting-apps="settingAppsForSelect"
            :height="36"
            :min-width="200"
            :max-width="240"
            dropdown-class="iap-filter__popper"
          />
        </div>
        <div class="iap-dashboard-filter__item">
          <ElSelect
            :model-value="filters.s_country_code"
            class="iap-filter-select"
            popper-class="iap-filter__popper"
            placeholder="国家"
            filterable
            clearable
            @update:model-value="onCountryFilterUpdate"
          >
            <ElOption :label="tr('adPerformance.filterAll', '全部')" value="" />
            <ElOption
              v-for="opt in countryOptionsForSelect"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </ElSelect>
        </div>
        <!-- <div class="iap-dashboard-filter__item">
          <ElSelect
            v-model="filters.platform"
            class="iap-filter-select iap-filter-select--platform"
            popper-class="iap-filter__popper"
            placeholder="终端平台"
          >
            <ElOption
              v-for="opt in filterOptions?.platformOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </ElSelect>
        </div> -->

        <ElButton type="primary" plain round :icon="Search" @click="loadDashboard"> 查询 </ElButton>
        <ElButton type="primary" plain round @click="loadDashboard">
          <ElIcon><Refresh /></ElIcon>
          刷新
        </ElButton>
      </div>
    </header>

    <ElSkeleton :loading="overviewLoading" animated :throttle="0">
      <template #template>
        <div class="iap-dashboard-kpi-row iap-entry-3">
          <div v-for="i in 6" :key="'sk-kpi-' + i" class="iap-dashboard-kpi-card iap-dash-sk-card">
            <div class="iap-dash-sk-kpi-head">
              <ElSkeletonItem variant="text" class="iap-dash-sk-line iap-dash-sk-line--sm" />
              <ElSkeletonItem variant="rect" class="iap-dash-sk-spark" />
            </div>
            <ElSkeletonItem variant="text" class="iap-dash-sk-line iap-dash-sk-line--lg" />
            <ElSkeletonItem variant="text" class="iap-dash-sk-line iap-dash-sk-line--xs" />
          </div>
        </div>

        <div class="iap-dashboard-trend-row iap-entry-4">
          <div class="iap-dashboard-trend-card iap-dashboard-trend-card--wide iap-dash-sk-panel">
            <ElSkeletonItem variant="text" class="iap-dash-sk-line iap-dash-sk-line--title" />
            <ElSkeletonItem variant="rect" class="iap-dash-sk-chart iap-dash-sk-chart--lg" />
          </div>
          <div class="iap-dashboard-trend-card iap-dash-sk-panel">
            <ElSkeletonItem variant="text" class="iap-dash-sk-line iap-dash-sk-line--title" />
            <ElSkeletonItem variant="rect" class="iap-dash-sk-chart" />
          </div>
          <div class="iap-dashboard-trend-card iap-dash-sk-panel">
            <ElSkeletonItem variant="text" class="iap-dash-sk-line iap-dash-sk-line--title" />
            <ElSkeletonItem variant="rect" class="iap-dash-sk-chart" />
          </div>
        </div>

        <div class="iap-dashboard-section iap-dash-sk-section iap-entry-4">
          <div class="iap-dashboard-section-header">
            <ElSkeletonItem variant="text" class="iap-dash-sk-line iap-dash-sk-line--md" />
            <ElSkeletonItem variant="text" class="iap-dash-sk-line iap-dash-sk-line--xs" />
          </div>
          <div class="iap-dashboard-app-cards">
            <div v-for="i in 5" :key="'sk-app-' + i" class="iap-dashboard-app-card iap-dash-sk-app">
              <div class="iap-dash-sk-app-top">
                <ElSkeletonItem variant="circle" class="iap-dash-sk-ico" />
                <ElSkeletonItem
                  variant="text"
                  class="iap-dash-sk-line iap-dash-sk-line--app-name"
                />
                <ElSkeletonItem variant="text" class="iap-dash-sk-line iap-dash-sk-line--tag" />
              </div>
              <ElSkeletonItem variant="text" class="iap-dash-sk-line iap-dash-sk-line--full" />
              <div class="iap-dash-sk-app-bot">
                <ElSkeletonItem variant="text" class="iap-dash-sk-line iap-dash-sk-line--xs" />
                <ElSkeletonItem variant="rect" class="iap-dash-sk-app-spark" />
              </div>
            </div>
          </div>
        </div>

        <div class="iap-dashboard-bottom-row iap-entry-4">
          <div class="iap-dashboard-bottom-card iap-dashboard-bottom-card--wide iap-dash-sk-panel">
            <ElSkeletonItem variant="text" class="iap-dash-sk-line iap-dash-sk-line--title" />
            <div class="iap-dash-sk-table">
              <div v-for="r in 5" :key="'sk-row-' + r" class="iap-dash-sk-table-row">
                <ElSkeletonItem variant="text" class="iap-dash-sk-line iap-dash-sk-line--country" />
                <ElSkeletonItem variant="text" class="iap-dash-sk-line iap-dash-sk-line--num" />
                <ElSkeletonItem variant="text" class="iap-dash-sk-line iap-dash-sk-line--num" />
                <ElSkeletonItem variant="rect" class="iap-dash-sk-bar" />
              </div>
            </div>
          </div>
          <div class="iap-dashboard-bottom-card iap-dash-sk-panel">
            <ElSkeletonItem variant="text" class="iap-dash-sk-line iap-dash-sk-line--title" />
            <ElSkeletonItem variant="rect" class="iap-dash-sk-donut" />
            <div class="iap-dash-sk-donut-legend">
              <ElSkeletonItem variant="text" class="iap-dash-sk-line iap-dash-sk-line--sm" />
              <ElSkeletonItem variant="text" class="iap-dash-sk-line iap-dash-sk-line--sm" />
            </div>
          </div>
          <div class="iap-dashboard-bottom-card iap-dash-sk-panel">
            <ElSkeletonItem variant="text" class="iap-dash-sk-line iap-dash-sk-line--title" />
            <ElSkeletonItem variant="rect" class="iap-dash-sk-chart iap-dash-sk-chart--plat" />
          </div>
        </div>
      </template>
      <template #default>
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
              <span class="iap-card-title-text">付费率趋势</span>
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
                <div
                  :ref="(el) => setAppRef(app.name, el)"
                  class="iap-dashboard-app-sparkline"
                ></div>
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
      </template>
    </ElSkeleton>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
  import { useI18n } from 'vue-i18n'
  import AppDatePicker from '@/components/core/forms/AppDatePicker.vue'
  import { useRouter } from 'vue-router'
  import { storeToRefs } from 'pinia'
  import { cloneAppDate, formatYYYYMMDD, getAppNow, getAppTodayYYYYMMDD } from '@/utils/app-now'
  import { dateRangeShortcuts } from '@/utils/form/date-shortcuts'
  import AppPlatformSearchSelect from '@/components/filter/app-platform-search-select.vue'
  import { useCockpitMetaFilterStore } from '@/store/modules/cockpit-meta-filter'
  import {
    Calendar,
    Download,
    Refresh,
    Search,
    Top,
    Bottom,
    Warning,
    Iphone,
    Camera,
    VideoCamera,
    Sunny
  } from '@element-plus/icons-vue'
  import { echarts } from '@/plugins/echarts'
  import { loadIapDashboardOverviewModules } from './composables/useIapDashboardModules'
  import type {
    IapFilterState,
    IapKpiCard,
    IapAppCard,
    IapCountryRow,
    IapProductTypeDonutItem,
    IapOverviewTrend,
    IapPlatformCompare
  } from '@/views/business-insight/iap-analysis/types'
  import type { CockpitMetaOptionItem, CockpitSettingAppItem } from '@/types/cockpit-meta-filter'

  defineOptions({ name: 'IapDashboard' })

  const { t, te } = useI18n()
  const tr = (key: string, fallback: string) => (te(key) ? t(key) : fallback)

  const router = useRouter()
  const metaStore = useCockpitMetaFilterStore()
  const { data: cockpitMeta } = storeToRefs(metaStore)

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
    s_app_id: [],
    s_country_code: '',
    platform: 'all'
  }
  const filters = ref<IapFilterState>({ ...defaultFilters })

  function onCountryFilterUpdate(v: string | undefined | null) {
    filters.value.s_country_code = v ?? ''
  }

  const countryOptionsForSelect = computed(() =>
    (cockpitMeta.value?.countryOptions ?? []).filter((o) => {
      const v = String(o.value ?? '')
        .trim()
        .toLowerCase()
      return v !== '' && v !== 'all'
    })
  )

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

  /** 概览 KPI / 图表 / 应用卡 / 底栏统一骨架（查询、刷新、首屏） */
  const overviewLoading = ref(true)
  const kpiList = ref<IapKpiCard[]>([])
  const trendData = ref<IapOverviewTrend | null>(null)
  const appList = ref<IapAppCard[]>([])
  const countryData = ref<(IapCountryRow & { barWidth?: string; barColor?: string })[]>([])
  const productTypeDonut = ref<IapProductTypeDonutItem[]>([])
  const platformCompare = ref<IapPlatformCompare | null>(null)
  const settingAppsForSelect = computed<CockpitSettingAppItem[]>(() => {
    const fromCockpit = cockpitMeta.value?.settingApps ?? []
    if (fromCockpit.length) return fromCockpit

    return (cockpitMeta.value?.appOptions ?? [])
      .filter((opt: CockpitMetaOptionItem) => opt.value && opt.value !== 'all')
      .map((opt: CockpitMetaOptionItem, index: number) => ({
        sAppId: String(opt.value ?? ''),
        nPlatform: '',
        platformName: '',
        sAppName: String(opt.label ?? ''),
        sAppShortName: String(opt.label ?? ''),
        nCategory: `fallback-${index}`,
        categoryName: '应用'
      }))
  })

  const donutColors: Record<string, string> = { 内购: '#0ea5e9', 订阅: '#a78bfa' }

  const kpiChartRefs = ref<(HTMLElement | null)[]>(Array(6).fill(null))

  const appChartRefs = ref<Record<string, HTMLElement | null>>({})

  const chart1Ref = ref<HTMLElement>()
  const chart2Ref = ref<HTMLElement>()
  const chart3Ref = ref<HTMLElement>()
  const donutRef = ref<HTMLElement>()
  const platformRef = ref<HTMLElement>()

  const charts: Array<ReturnType<typeof echarts.init>> = []

  const dashChartAnim: import('echarts').EChartsOption = {
    animation: true,
    animationDuration: 880,
    animationEasing: 'cubicOut',
    animationDelay: (idx: number) => idx * 48,
    animationDurationUpdate: 420,
    animationEasingUpdate: 'cubicOut'
  }

  const dashSparklineAnim: import('echarts').EChartsOption = {
    animation: true,
    animationDuration: 480,
    animationEasing: 'cubicOut',
    animationDelay: (idx: number) => idx * 28,
    animationDurationUpdate: 260,
    animationEasingUpdate: 'cubicOut'
  }

  function initChart(el: HTMLElement | undefined, opt: import('echarts').EChartsOption) {
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

  const dashTooltipAxis: import('echarts').TooltipComponentOption = {
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

  const dashTooltipItem: import('echarts').TooltipComponentOption = {
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
    overviewLoading.value = true
    try {
      const p = params()
      const { kpi, trend, appCards, country, donut, platform } =
        await loadIapDashboardOverviewModules(p)
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
    } finally {
      overviewLoading.value = false
    }
    // Skeleton 关闭后再等一轮 patch，避免 chart ref 仍为 null
    await nextTick()
    await nextTick()
    charts.forEach((c) => c.dispose())
    charts.length = 0
    initKpiSparklines()
    initAppSparklines()
    initChart1()
    initChart2()
    initChart3()
    initDonut()
    initPlatform()
    resizeCharts()
  }

  onMounted(() => {
    metaStore.ensureLoaded().finally(() => {
      loadDashboard().then(() => {
        window.addEventListener('resize', resizeCharts)
      })
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
  @use '../../user-growth/styles/app-platform-select-ad-theme.scss' as apSelect;
  @use '../../user-growth/styles/filter-bar-theme.scss' as filterTheme;

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
    margin-bottom: 16px;
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

  .iap-dashboard-filter.iap-filter-panel {
    @include filterTheme.filter-panel(14px 16px);
    @include filterTheme.filter-panel-children;
    @include filterTheme.filter-row;

    min-width: 0;
  }

  .iap-dashboard-filter.iap-filter-panel > .iap-dashboard-filter__item {
    display: inline-flex;
    gap: 0;
    align-items: center;
    min-height: 0;
    padding: 0;
    background: transparent;
    border: none;
  }

  .iap-filter-select:not(.iap-filter-select--app) {
    @include filterTheme.filter-select-size(240px, 200px, 240px);
  }

  .iap-filter-select--platform {
    flex: 0 0 128px;
    width: 128px;
    min-width: 128px;
    max-width: 128px;
  }

  :deep(.iap-filter-date) {
    --el-input-focus-border-color: var(--theme-color, var(--art-primary, #3b82f6));
    --el-border-color-hover: var(--theme-color, var(--art-primary, #3b82f6));
    --el-color-primary: var(--theme-color, var(--art-primary, #3b82f6));
    --el-border-color-focus: var(--theme-color, var(--art-primary, #3b82f6));
    --el-border-color: var(--theme-color, var(--art-primary, #3b82f6));
    --el-component-size: 36px;
    --el-date-editor-width: 250px;
    --el-date-editor-daterange-width: 250px;
  }

  @include filterTheme.date-range-trigger('.iap-filter-date', 250px);
  @include filterTheme.element-select-trigger('.iap-filter-select');
  @include apSelect.apply-app-platform-select-ad-theme(
    '.iap-dashboard-filter.iap-filter-panel',
    'iap-filter-select__input',
    'iap-filter__popper',
    240px,
    200px,
    240px
  );
  @include filterTheme.select-popper('iap-filter__popper');
  @include filterTheme.app-platform-popper('iap-filter__popper');
  @include filterTheme.date-picker-popper('iap-filter__popper');

  :global(.iap-filter__popper.el-popper),
  :global(.iap-filter__popper.el-select__popper),
  :global(.iap-filter__popper.el-picker__popper) {
    z-index: 4000 !important;
  }

  :deep(.iap-filter-select),
  :deep(.iap-filter-select__input) {
    --el-input-focus-border-color: var(--theme-color, var(--art-primary, #3b82f6));
    --el-border-color-hover: var(--theme-color, var(--art-primary, #3b82f6));
    --el-color-primary: var(--theme-color, var(--art-primary, #3b82f6));
    --el-border-color-focus: var(--theme-color, var(--art-primary, #3b82f6));
    --el-border-color: var(--theme-color, var(--art-primary, #3b82f6));
    --el-component-size: 36px;
  }

  .iap-filter-panel :deep(.iap-query-btn.el-button) {
    height: 36px;
    padding: 0 18px;
    font-weight: 600;
    color: var(--theme-color, var(--art-primary, #3b82f6));
    background: color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 6%, transparent);
    border: 1px solid var(--theme-color, var(--art-primary, #3b82f6));
    box-shadow: none;
  }

  .iap-filter-panel :deep(.iap-query-btn.el-button:hover) {
    border-color: var(--theme-color, var(--art-primary, #3b82f6));
    box-shadow: 0 0 0 1px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 14%, transparent);
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

  /* 概览骨架屏：布局与真实卡片区一致，霓虹底与 KPI 卡一致 */
  .iap-dash-sk-card {
    @extend %iap-neon-surface;

    display: flex;
    flex-direction: column;
    gap: 8px;
    min-height: 112px;
    padding: 12px 14px 10px;
    border-top: 2px solid color-mix(in srgb, var(--art-primary) 24%, transparent);
  }

  .iap-dash-sk-kpi-head {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    align-items: center;
  }

  .iap-dash-sk-spark {
    width: 100%;
    height: 36px;
  }

  .iap-dash-sk-panel {
    @extend %iap-neon-surface;

    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: 220px;
    padding: 12px 14px;
  }

  .iap-dashboard-bottom-row .iap-dash-sk-panel {
    min-height: 260px;
  }

  .iap-dash-sk-section {
    @extend %iap-neon-surface;

    padding: 12px 14px;
    margin-bottom: 16px;
  }

  .iap-dash-sk-app {
    @extend %iap-neon-surface;

    display: flex;
    flex-direction: column;
    gap: 10px;
    min-height: 96px;
    padding: 14px;
  }

  .iap-dash-sk-app-top {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .iap-dash-sk-app-bot {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .iap-dash-sk-ico {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
  }

  .iap-dash-sk-app-spark {
    flex-shrink: 0;
    width: 70px;
    height: 28px;
  }

  .iap-dash-sk-chart {
    flex: 1;
    width: 100%;
    min-height: 160px;
  }

  .iap-dash-sk-chart--lg {
    min-height: 168px;
  }

  .iap-dash-sk-chart--plat {
    min-height: 170px;
  }

  .iap-dash-sk-line {
    height: 12px;
    border-radius: 6px;
  }

  .iap-dash-sk-line--xs {
    width: 52%;
  }

  .iap-dash-sk-line--sm {
    width: 45%;
  }

  .iap-dash-sk-line--md {
    width: 32%;
  }

  .iap-dash-sk-line--lg {
    width: 58%;
    height: 22px;
  }

  .iap-dash-sk-line--title {
    width: 42%;
    height: 14px;
  }

  .iap-dash-sk-line--full {
    width: 92%;
  }

  .iap-dash-sk-line--app-name {
    flex: 1;
    width: auto;
    min-width: 40%;
  }

  .iap-dash-sk-line--tag {
    flex-shrink: 0;
    width: 40px;
  }

  .iap-dash-sk-line--country {
    flex: 1;
    width: auto;
    min-width: 36%;
  }

  .iap-dash-sk-line--num {
    flex-shrink: 0;
    width: 52px;
  }

  .iap-dash-sk-table {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 10px;
    min-height: 0;
  }

  .iap-dash-sk-table-row {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .iap-dash-sk-bar {
    flex-shrink: 0;
    width: 60px;
    height: 5px;
  }

  .iap-dash-sk-donut {
    width: 100%;
    max-width: 220px;
    min-height: 160px;
    margin-inline: auto;
  }

  .iap-dash-sk-donut-legend {
    display: flex;
    gap: 16px;
    justify-content: center;
  }

  @media (prefers-reduced-motion: reduce) {
    .iap-dash-sk-card,
    .iap-dash-sk-panel,
    .iap-dash-sk-section,
    .iap-dash-sk-app {
      :deep(.el-skeleton.is-animated .el-skeleton__item) {
        animation: none;
      }
    }
  }
</style>

<style lang="scss">
  @use './styles/iap-popper.scss' as *;
</style>
