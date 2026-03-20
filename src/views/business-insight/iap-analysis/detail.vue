<template>
  <div class="iap-analysis-page art-full-height">
    <!-- 顶部面包屑 + 操作栏 -->
    <header class="iap-header">
      <div class="iap-breadcrumb">
        <span class="iap-breadcrumb__item">{{ $t('menus.businessInsight.title') }}</span>
        <span class="iap-breadcrumb__sep">&gt;</span>
        <span class="iap-breadcrumb__item iap-breadcrumb__link" @click="goBack">{{
          $t('menus.businessInsight.iapAnalysis')
        }}</span>
        <span class="iap-breadcrumb__sep">&gt;</span>
        <span class="iap-breadcrumb__item is-active">{{ appName }}</span>
      </div>
      <div class="iap-actions">
        <div class="iap-pill">
          <span class="iap-pill__label">时间范围</span>
          <ElSelect v-model="timeRange" size="small" class="iap-select">
            <ElOption label="最近30天" value="30" />
            <ElOption label="最近7天" value="7" />
            <ElOption label="最近90天" value="90" />
          </ElSelect>
        </div>
        <div class="iap-pill">
          <span class="iap-pill__label">国家</span>
          <ElSelect v-model="country" size="small" class="iap-select">
            <ElOption label="全部" value="all" />
          </ElSelect>
        </div>
        <div class="iap-pill">
          <span class="iap-pill__label">平台</span>
          <ElSelect v-model="platform" size="small" class="iap-select">
            <ElOption label="全部" value="all" />
          </ElSelect>
        </div>
        <ElButton size="small" round class="iap-export-btn">
          <ElIcon><Download /></ElIcon>
          导出
        </ElButton>
      </div>
    </header>

    <!-- 应用标题行 -->
    <div class="iap-app-header">
      <div class="iap-app-info">
        <div class="iap-app-icon">
          <ElIcon :size="20"><Monitor /></ElIcon>
        </div>
        <span class="iap-app-name">{{ appName }}</span>
        <ElTag size="small" class="iap-platform-tag iap-platform-tag--android">Android</ElTag>
      </div>
    </div>

    <!-- KPI 指标卡片行 -->
    <div class="iap-kpi-row">
      <div v-for="(kpi, i) in kpiList" :key="kpi.label" class="iap-kpi-card">
        <div class="iap-kpi-top">
          <span class="iap-kpi-label">{{ kpi.label }}</span>
          <div :ref="(el) => setKpiSparklineRef(i, el)" class="iap-kpi-sparkline" />
        </div>
        <div class="iap-kpi-value">{{ kpi.value }}</div>
        <div class="iap-kpi-change" :class="kpi.trend === 'up' ? 'is-up' : 'is-down'">
          <ElIcon><component :is="kpi.trend === 'up' ? ArrowUp : ArrowDown" /></ElIcon>
          {{ kpi.change }} 环比
        </div>
      </div>
    </div>

    <!-- Tab 切换 -->
    <nav class="iap-tab-bar">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        class="iap-tab-item"
        :class="{ 'is-active': activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
        <span v-if="tab.badge" class="iap-tab-badge">{{ tab.badge }}</span>
      </button>
    </nav>

    <!-- 产品统计 Tab -->
    <main v-if="activeTab === 'product'" class="iap-tab-content">
      <div class="iap-section-card">
        <div class="iap-section-title">产品SKU订单分析</div>
        <ElTable :data="skuData" class="iap-dark-table" size="small" row-key="name">
          <ElTableColumn prop="name" label="产品名称" min-width="145" show-overflow-tooltip />
          <ElTableColumn prop="type" label="类型" width="75">
            <template #default="{ row }">
              <ElTag :class="row.type === '订阅' ? 'iap-tag--sub' : 'iap-tag--iap'" size="small">
                {{ row.type }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="orders" label="订单数" width="100" />
          <ElTableColumn prop="revenue" label="收入(USD)" width="110" />
          <ElTableColumn prop="ratio" label="占比" width="180">
            <template #default="{ row }">
              <div class="iap-ratio-wrap">
                <div class="iap-ratio-bar" :style="{ width: row.ratio }"></div>
                <span class="iap-ratio-text">{{ row.ratio }}</span>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="arpu" label="ARPU" width="110" />
          <ElTableColumn prop="conversion" label="转化率" width="110" />
          <ElTableColumn prop="retention" label="续费率" width="110">
            <template #default="{ row }">
              <span :class="parseFloat(row.retention) > 60 ? 'iap-text-green' : 'iap-text-orange'">
                {{ row.retention }}
              </span>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="churn" label="退款率" width="110" />
          <ElTableColumn prop="trend" label="趋势" width="130">
            <template #default="{ row }">
              <div
                class="iap-sku-trend-spark"
                :ref="(el) => setSkuTrendSparklineRef(row.name, el)"
              />
            </template>
          </ElTableColumn>
        </ElTable>
      </div>

      <div class="iap-bottom-three-col">
        <div class="iap-section-card iap-flex-1">
          <div class="iap-section-title">用户分层分布</div>
          <div class="iap-segment-list">
            <div v-for="seg in userSegments" :key="seg.label" class="iap-segment-row">
              <div class="iap-seg-left">
                <span class="iap-seg-label">{{ seg.label }}</span>
                <span class="iap-seg-count">{{ seg.count }}</span>
              </div>
              <div class="iap-seg-bar-wrap">
                <div class="iap-seg-bar" :style="{ width: seg.pct, background: seg.color }"></div>
              </div>
              <span class="iap-seg-arpu">{{ seg.arpu }}</span>
            </div>
          </div>
        </div>
        <div class="iap-section-card iap-flex-1">
          <div class="iap-section-title">订阅周期分布</div>
          <div class="iap-donut-wrap">
            <div class="iap-donut-center">
              <div class="iap-donut-num">{{ subscriptionTotal }}</div>
              <div class="iap-donut-sub">订阅人数</div>
            </div>
            <div ref="donutRef" class="iap-donut-chart"></div>
          </div>
          <div class="iap-donut-legend">
            <span v-for="item in donutData" :key="item.name" class="iap-legend-item">
              <i :style="{ background: item.color }"></i>{{ item.name }} {{ item.pct }}
            </span>
          </div>
        </div>
        <div class="iap-section-card iap-flex-1">
          <div class="iap-section-title">续费周期分析</div>
          <div ref="renewRef" class="iap-renew-chart"></div>
        </div>
      </div>
    </main>

    <!-- 用户分析 Tab -->
    <main v-if="activeTab === 'user'" class="iap-tab-content">
      <div class="iap-two-col-grid">
        <div class="iap-section-card">
          <div class="iap-section-title">用户分层价值分析</div>
          <ElTable :data="userValueData" class="iap-dark-table" size="small">
            <ElTableColumn prop="segment" label="用户分层" width="120" />
            <ElTableColumn prop="count" label="用户数" width="80" />
            <ElTableColumn prop="ratio" label="占比" width="65" />
            <ElTableColumn prop="arpu" label="ARPU" width="75" />
            <ElTableColumn prop="conversion" label="转化率" width="75" />
            <ElTableColumn prop="retention" label="续费率" width="75">
              <template #default="{ row }">
                <span
                  :class="parseFloat(row.retention) > 60 ? 'iap-text-green' : 'iap-text-orange'"
                >
                  {{ row.retention }}
                </span>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="churn" label="退款率" width="75" />
          </ElTable>
        </div>
        <div class="iap-section-card">
          <div class="iap-section-title">Top 10 国家用户分布</div>
          <div ref="countryRef" class="iap-country-chart"></div>
        </div>
      </div>
      <div class="iap-two-col-grid iap-mt-16">
        <div class="iap-section-card">
          <div class="iap-section-title">新老用户付费行为对比</div>
          <div ref="userCompareRef" class="iap-user-compare-chart"></div>
        </div>
        <div class="iap-section-card">
          <div class="iap-section-title">用户首次付费时间分布</div>
          <div ref="firstPayRef" class="iap-first-pay-chart"></div>
        </div>
      </div>
    </main>

    <!-- 趋势分析 Tab -->
    <main v-if="activeTab === 'trend'" class="iap-tab-content">
      <div class="iap-section-card">
        <div class="iap-section-title iap-section-title--legend">
          订单数 vs 收入 日趋势
          <div class="iap-legend-right">
            <span class="iap-legend-dot iap-legend-dot--teal"></span>订单数
            <span class="iap-legend-dot iap-legend-dot--purple"></span>收入
          </div>
        </div>
        <div ref="trendRef" class="iap-trend-chart-lg"></div>
      </div>
      <div class="iap-three-col-grid iap-mt-16">
        <div class="iap-section-card">
          <div class="iap-section-title">ARPU 日趋势</div>
          <div ref="arpuTrendRef" class="iap-trend-chart-sm"></div>
        </div>
        <div class="iap-section-card">
          <div class="iap-section-title">转化率 & 续费率 趋势</div>
          <div ref="convTrendRef" class="iap-trend-chart-sm"></div>
        </div>
        <div class="iap-section-card">
          <div class="iap-section-title">退款率 趋势</div>
          <div ref="churnTrendRef" class="iap-trend-chart-sm"></div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { ArrowUp, ArrowDown, Download, Monitor } from '@element-plus/icons-vue'
  import * as echarts from 'echarts'
  import {
    fetchIapDetailKpi,
    fetchIapDetailProduct,
    fetchIapDetailUser,
    fetchIapDetailTrend
  } from '@/api/business-insight'
  import type { IapKpiCard } from '@/views/business-insight/iap-analysis/types'

  defineOptions({ name: 'IapAnalysisDetail' })

  const route = useRoute()
  const router = useRouter()

  const appName = computed(() => (route.query.app as string) || 'PhoneTracker')
  /** 用于接口的 s_app_id，与 route.query.app 一致（如 PhoneTracker）或转小写 */
  const s_app_id = computed(() => (route.query.app as string) || 'phonetracker')

  function goBack() {
    router.push({ name: 'IapAnalysis' })
  }

  const timeRange = ref('30')
  const country = ref('all')
  const platform = ref('all')
  const activeTab = ref<'product' | 'user' | 'trend'>('product')

  const tabs = [
    { key: 'product' as const, label: '产品统计' },
    { key: 'user' as const, label: '用户分析' },
    { key: 'trend' as const, label: '趋势分析', badge: 'ACTIVE' }
  ]

  const detailKpis = ref<IapKpiCard[]>([])
  const kpiList = computed(() =>
    detailKpis.value.map((k) => ({
      label: k.label,
      value: k.value,
      change: k.change,
      trend: (k.up ? 'up' : 'down') as 'up' | 'down',
      borderColor: k.borderColor,
      sparkColor: k.sparkColor ?? k.borderColor,
      sparklineValues: k.sparklineValues
    }))
  )

  const detailProduct = ref<Awaited<ReturnType<typeof fetchIapDetailProduct>> | null>(null)
  const skuData = computed(() => detailProduct.value?.skuList ?? [])
  const userSegments = computed(() => detailProduct.value?.userSegments ?? [])
  const donutData = computed(() => detailProduct.value?.subscriptionDonut ?? [])
  const subscriptionTotal = computed(() => detailProduct.value?.subscriptionTotal ?? '—')

  const detailUser = ref<Awaited<ReturnType<typeof fetchIapDetailUser>> | null>(null)
  const userValueData = computed(() => detailUser.value?.userValueTable ?? [])

  const detailTrend = ref<Awaited<ReturnType<typeof fetchIapDetailTrend>> | null>(null)

  const donutRef = ref<HTMLElement>()
  const renewRef = ref<HTMLElement>()
  const countryRef = ref<HTMLElement>()
  const userCompareRef = ref<HTMLElement>()
  const firstPayRef = ref<HTMLElement>()
  const trendRef = ref<HTMLElement>()
  const arpuTrendRef = ref<HTMLElement>()
  const convTrendRef = ref<HTMLElement>()
  const churnTrendRef = ref<HTMLElement>()

  const chartInstances: echarts.ECharts[] = []

  const kpiSparklineRefs = ref<(HTMLElement | null)[]>([])
  const skuTrendSparklineRefs = ref<Record<string, HTMLElement | null>>({})

  function initChart(el: HTMLElement | undefined, option: echarts.EChartsOption) {
    if (!el) return
    const chart = echarts.init(el, 'dark')
    chart.setOption(option)
    chartInstances.push(chart)
  }

  const commonGrid = { top: 30, right: 16, bottom: 30, left: 50, containLabel: true }
  const axisStyle = {
    axisLine: { lineStyle: { color: '#334155' } },
    splitLine: { lineStyle: { color: '#1e293b' } },
    axisLabel: { color: '#94a3b8', fontSize: 11 }
  }

  function initDonut() {
    const list = detailProduct.value?.subscriptionDonut ?? []
    if (!list.length || !donutRef.value) return
    const colors: Record<string, string> = {
      周订阅: '#6c63ff',
      月订阅: '#3b82f6',
      季订阅: '#10b981',
      年订阅: '#f59e0b'
    }
    initChart(donutRef.value, {
      backgroundColor: 'transparent',
      series: [
        {
          type: 'pie',
          radius: ['55%', '80%'],
          center: ['50%', '50%'],
          label: { show: false },
          data: list.map((item) => ({
            value: item.value ?? (Number(String(item.pct).replace('%', '')) || 0),
            name: item.name,
            itemStyle: { color: item.color ?? colors[item.name] ?? '#6c63ff' }
          }))
        }
      ]
    })
  }

  function initRenew() {
    const renew = detailProduct.value?.renewChart
    if (!renew || !renewRef.value) return
    initChart(renewRef.value, {
      backgroundColor: 'transparent',
      grid: { top: 20, right: 10, bottom: 30, left: 40 },
      xAxis: { type: 'category', data: renew.categories, ...axisStyle },
      yAxis: { type: 'value', ...axisStyle },
      series: [
        {
          type: 'bar',
          data: renew.counts,
          itemStyle: {
            color: (p: { dataIndex: number }) =>
              ['#6c63ff', '#3b82f6', '#10b981', '#f59e0b'][p.dataIndex]
          },
          barWidth: '40%',
          label: { show: true, position: 'top', color: '#e2e8f0', fontSize: 11 }
        },
        ...(renew.rates
          ? [
              {
                type: 'line' as const,
                data: renew.rates,
                yAxisIndex: 0,
                smooth: true,
                lineStyle: { color: '#f59e0b' },
                areaStyle: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: 'rgba(245,158,11,0.35)' },
                    { offset: 1, color: 'rgba(245,158,11,0)' }
                  ])
                },
                symbol: 'circle',
                symbolSize: 5,
                itemStyle: { color: '#f59e0b' }
              }
            ]
          : [])
      ]
    })
  }

  function initKpiSparklines() {
    kpiList.value.forEach((kpi, i) => {
      const el = kpiSparklineRefs.value[i]
      if (!el) return

      const vals =
        kpi.sparklineValues?.length && kpi.sparklineValues.length >= 2
          ? kpi.sparklineValues
          : Array.from({ length: 12 }, () => Math.random())

      const lineColor = kpi.sparkColor
      initChart(el, {
        backgroundColor: 'transparent',
        grid: { top: 0, right: 0, bottom: 0, left: 0 },
        xAxis: { type: 'category', show: false, data: vals.map((_, j) => j) },
        yAxis: { type: 'value', show: false },
        series: [
          {
            type: 'line',
            data: vals,
            smooth: true,
            showSymbol: false,
            lineStyle: { color: lineColor, width: 2 },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: `${lineColor}55` },
                { offset: 1, color: `${lineColor}00` }
              ])
            },
            itemStyle: { color: lineColor }
          }
        ]
      })
    })
  }

  function initSkuTrendSparklines() {
    const list = skuData.value
    list.forEach((row) => {
      const el = skuTrendSparklineRefs.value[row.name]
      if (!el) return

      const vals =
        row.sparklineValues?.length && row.sparklineValues.length >= 2
          ? row.sparklineValues
          : Array.from({ length: 12 }, () => Math.random())

      const upColor = '#14b8a6'
      const downColor = '#ef4444'
      const lineColor = row.trendUp ? upColor : downColor
      const lineColor2 = row.trendUp ? '#3b82f6' : '#f97316'

      initChart(el, {
        backgroundColor: 'transparent',
        grid: { top: 0, right: 0, bottom: 0, left: 0 },
        xAxis: { type: 'category', show: false, data: vals.map((_, j) => j) },
        yAxis: { type: 'value', show: false },
        series: [
          {
            type: 'line',
            data: vals,
            smooth: true,
            showSymbol: false,
            lineStyle: {
              width: 2,
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: lineColor },
                { offset: 1, color: lineColor2 }
              ])
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: `${lineColor}55` },
                { offset: 1, color: `${lineColor}00` }
              ])
            },
            itemStyle: { color: lineColor }
          }
        ]
      })
    })
  }

  function setKpiSparklineRef(i: number, el: unknown) {
    kpiSparklineRefs.value[i] = (el as HTMLElement) ?? null
  }

  function setSkuTrendSparklineRef(key: string, el: unknown) {
    skuTrendSparklineRefs.value[key] = (el as HTMLElement) ?? null
  }

  function initCountry() {
    const data = detailUser.value?.countryChartData
    if (!data || !countryRef.value) return
    const { countries, counts, arpu } = data
    initChart(countryRef.value, {
      backgroundColor: 'transparent',
      grid: { top: 10, right: 80, bottom: 10, left: 60, containLabel: true },
      xAxis: { type: 'value', ...axisStyle },
      yAxis: { type: 'category', data: countries, ...axisStyle },
      series: [
        {
          type: 'bar',
          data: counts,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#6c63ff' },
              { offset: 1, color: '#3b82f6' }
            ])
          },
          barWidth: '55%',
          label: {
            show: true,
            position: 'right',
            color: '#10b981',
            fontSize: 10,
            formatter: (p: { dataIndex: number }) => `$${arpu[p.dataIndex]} ARPU`
          }
        }
      ]
    })
  }

  function initUserCompare() {
    const data = detailUser.value?.userCompareData
    if (!data || !userCompareRef.value) return
    initChart(userCompareRef.value, {
      backgroundColor: 'transparent',
      grid: commonGrid,
      legend: { data: ['转化率', 'ARPU'], textStyle: { color: '#94a3b8' }, top: 0 },
      xAxis: { type: 'category', data: data.categories, ...axisStyle },
      yAxis: [
        { type: 'value', name: '转化率%', ...axisStyle },
        { type: 'value', name: 'ARPU$', ...axisStyle }
      ],
      series: [
        {
          name: '转化率',
          type: 'bar',
          data: data.conversion,
          itemStyle: { color: '#6c63ff' },
          barWidth: '30%'
        },
        {
          name: 'ARPU',
          type: 'bar',
          yAxisIndex: 1,
          data: data.arpu,
          itemStyle: { color: '#10b981' },
          barWidth: '30%'
        }
      ]
    })
  }

  function initFirstPay() {
    const data = detailUser.value?.firstPayData
    if (!data || !firstPayRef.value) return
    initChart(firstPayRef.value, {
      backgroundColor: 'transparent',
      grid: commonGrid,
      xAxis: { type: 'category', data: data.categories, ...axisStyle },
      yAxis: { type: 'value', ...axisStyle },
      series: [
        {
          type: 'bar',
          data: data.values,
          itemStyle: {
            color: (p: { dataIndex: number }) => (p.dataIndex === 0 ? '#f59e0b' : '#6c63ff')
          },
          barWidth: '45%',
          label: { show: true, position: 'top', color: '#e2e8f0', fontSize: 11, formatter: '{c}%' }
        }
      ]
    })
  }

  function initTrend() {
    const data = detailTrend.value?.ordersRevenue
    if (!data || !trendRef.value) return
    initChart(trendRef.value, {
      backgroundColor: 'transparent',
      grid: { top: 30, right: 60, bottom: 30, left: 60 },
      legend: { data: ['订单数', '收入'], textStyle: { color: '#94a3b8' }, right: 0, top: 0 },
      xAxis: {
        type: 'category',
        data: data.dates,
        ...axisStyle,
        axisLabel: { color: '#94a3b8', fontSize: 10, interval: 4 }
      },
      yAxis: [
        { type: 'value', name: '订单', ...axisStyle },
        { type: 'value', name: '收入$', ...axisStyle }
      ],
      series: [
        {
          name: '订单数',
          type: 'bar',
          data: data.orders,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(0,201,167,0.8)' },
              { offset: 1, color: 'rgba(0,201,167,0.1)' }
            ])
          },
          barWidth: '60%'
        },
        {
          name: '收入',
          type: 'line',
          yAxisIndex: 1,
          data: data.revenue,
          smooth: true,
          lineStyle: { color: '#a78bfa', width: 2 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(167,139,250,0.3)' },
              { offset: 1, color: 'rgba(167,139,250,0.01)' }
            ])
          },
          symbol: 'none',
          itemStyle: { color: '#a78bfa' }
        }
      ]
    })
  }

  function initArpuTrend() {
    const data = detailTrend.value?.arpuTrend
    if (!data || !arpuTrendRef.value) return
    initChart(arpuTrendRef.value, {
      backgroundColor: 'transparent',
      grid: { top: 20, right: 16, bottom: 30, left: 50 },
      xAxis: {
        type: 'category',
        data: data.dates,
        ...axisStyle,
        axisLabel: { color: '#94a3b8', fontSize: 9, interval: 6 }
      },
      yAxis: { type: 'value', ...axisStyle },
      series: [
        {
          type: 'line',
          data: data.values,
          smooth: true,
          lineStyle: { color: '#3b82f6', width: 2 },
          symbol: 'none',
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(59,130,246,0.3)' },
              { offset: 1, color: 'rgba(59,130,246,0.01)' }
            ])
          },
          itemStyle: { color: '#3b82f6' }
        }
      ]
    })
  }

  function initConvTrend() {
    const data = detailTrend.value?.conversionRetention
    if (!data || !convTrendRef.value) return
    initChart(convTrendRef.value, {
      backgroundColor: 'transparent',
      grid: { top: 20, right: 16, bottom: 30, left: 50 },
      legend: { data: ['转化率', '续费率'], textStyle: { color: '#94a3b8', fontSize: 10 }, top: 0 },
      xAxis: {
        type: 'category',
        data: data.dates,
        ...axisStyle,
        axisLabel: { color: '#94a3b8', fontSize: 9, interval: 6 }
      },
      yAxis: { type: 'value', ...axisStyle },
      series: [
        {
          name: '转化率',
          type: 'line',
          data: data.conversion,
          smooth: true,
          lineStyle: { color: '#6c63ff' },
          symbol: 'none',
          itemStyle: { color: '#6c63ff' }
        },
        {
          name: '续费率',
          type: 'line',
          data: data.retention,
          smooth: true,
          lineStyle: { color: '#10b981' },
          symbol: 'none',
          itemStyle: { color: '#10b981' }
        }
      ]
    })
  }

  function initChurnTrend() {
    const data = detailTrend.value?.churnTrend
    const threshold = detailTrend.value?.churnThreshold ?? 2
    if (!data || !churnTrendRef.value) return
    initChart(churnTrendRef.value, {
      backgroundColor: 'transparent',
      grid: { top: 20, right: 16, bottom: 30, left: 50 },
      xAxis: {
        type: 'category',
        data: data.dates,
        ...axisStyle,
        axisLabel: { color: '#94a3b8', fontSize: 9, interval: 6 }
      },
      yAxis: { type: 'value', ...axisStyle },
      visualMap: {
        show: false,
        dimension: 1,
        pieces: [
          { lte: threshold, color: '#ef4444' },
          { gt: threshold, color: '#f87171' }
        ]
      },
      series: [
        {
          type: 'line',
          data: data.values,
          smooth: true,
          lineStyle: { width: 2 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(239,68,68,0.4)' },
              { offset: 1, color: 'rgba(239,68,68,0.01)' }
            ])
          },
          symbol: 'none',
          markLine: {
            data: [{ yAxis: threshold }],
            lineStyle: { color: '#f59e0b', type: 'dashed' },
            label: { formatter: `预警线${threshold}%`, color: '#f59e0b' }
          }
        }
      ]
    })
  }

  function initAllCharts() {
    nextTick(() => {
      initKpiSparklines()
      if (activeTab.value === 'product') {
        initDonut()
        initRenew()
        initSkuTrendSparklines()
      } else if (activeTab.value === 'user') {
        initCountry()
        initUserCompare()
        initFirstPay()
      } else if (activeTab.value === 'trend') {
        initTrend()
        initArpuTrend()
        initConvTrend()
        initChurnTrend()
      }
    })
  }

  function resizeCharts() {
    chartInstances.forEach((c) => c.resize())
  }

  const params = () => ({
    s_app_id: s_app_id.value,
    timeRange: timeRange.value,
    s_country_code: country.value,
    platform: platform.value
  })

  async function loadDetail() {
    const p = params()
    const [kpiRes, productRes, userRes, trendRes] = await Promise.all([
      fetchIapDetailKpi(p),
      fetchIapDetailProduct(p),
      fetchIapDetailUser(p),
      fetchIapDetailTrend(p)
    ])
    detailKpis.value = kpiRes.kpis
    detailProduct.value = productRes
    detailUser.value = userRes
    detailTrend.value = trendRes
    nextTick(() => {
      chartInstances.forEach((c) => c.dispose())
      chartInstances.length = 0
      kpiSparklineRefs.value = []
      skuTrendSparklineRefs.value = {}
      initAllCharts()
    })
  }

  watch(activeTab, () => {
    chartInstances.forEach((c) => c.dispose())
    chartInstances.length = 0
    initAllCharts()
  })

  onMounted(() => {
    loadDetail().then(() => {
      window.addEventListener('resize', resizeCharts)
    })
  })

  onUnmounted(() => {
    chartInstances.forEach((c) => c.dispose())
    chartInstances.length = 0
    window.removeEventListener('resize', resizeCharts)
  })
</script>

<style scoped lang="scss">
  .iap-analysis-page {
    display: flex;
    flex-direction: column;
    width: 100%;
    min-height: 100%;
    padding: 16px 20px;
    overflow: auto;
    font-size: 13px;
    color: var(--art-gray-900);
    background: var(--default-bg-color);
  }

  .iap-header {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .iap-breadcrumb {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 13px;
    color: var(--art-gray-600);

    .iap-breadcrumb__sep {
      color: var(--art-gray-400);
    }

    .iap-breadcrumb__item {
      &.is-active {
        color: var(--art-gray-900);
      }

      &.iap-breadcrumb__link {
        cursor: pointer;

        &:hover {
          color: var(--art-primary);
        }
      }
    }
  }

  .iap-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
  }

  .iap-pill {
    display: flex;
    gap: 4px;
    align-items: center;

    .iap-pill__label {
      color: var(--art-gray-600);
      white-space: nowrap;
    }
  }

  :deep(.iap-select .el-input__wrapper) {
    background: var(--default-box-color) !important;
    box-shadow: 0 0 0 1px var(--default-border) !important;

    .el-input__inner {
      font-size: 12px;
      color: var(--art-gray-900) !important;
    }
  }

  .iap-export-btn {
    color: var(--art-gray-600) !important;
    background: var(--default-box-color) !important;
    border-color: var(--default-border) !important;

    &:hover {
      color: var(--art-primary) !important;
      border-color: var(--art-primary) !important;
    }
  }

  .iap-app-header {
    display: flex;
    align-items: center;
    margin-bottom: 14px;
  }

  .iap-app-info {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .iap-app-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, #6c63ff, var(--art-primary));
    border-radius: 8px;
  }

  .iap-app-name {
    font-size: 18px;
    font-weight: 600;
    color: var(--art-gray-900);
  }

  .iap-platform-tag--android {
    color: #4ade80 !important;
    background: #166534 !important;
    border-color: #166534 !important;
  }

  .iap-kpi-row {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 10px;
    margin-bottom: 16px;
  }

  .iap-kpi-card {
    padding: 12px 14px;
    background: var(--default-box-color);
    border: 1px solid var(--default-border);
    border-radius: 10px;
    transition: border-color 0.2s;

    &:hover {
      border-color: var(--art-gray-400);
    }
  }

  .iap-kpi-top {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    align-items: center;
    margin-bottom: 6px;
  }

  .iap-kpi-label {
    font-size: 12px;
    color: var(--art-gray-600);
  }

  .iap-kpi-sparkline {
    width: 100%;
    height: 36px;
    border-radius: 4px;
    opacity: 1;
  }

  .iap-kpi-value {
    margin-bottom: 4px;
    font-size: 20px;
    font-weight: 700;
    color: var(--art-gray-900);
  }

  .iap-kpi-change {
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

  .iap-tab-bar {
    display: flex;
    gap: 0;
    margin-bottom: 16px;
    border-bottom: 1px solid var(--default-border);
  }

  .iap-tab-item {
    display: flex;
    gap: 6px;
    align-items: center;
    padding: 8px 20px;
    margin-bottom: -1px;
    font-size: 13px;
    color: var(--art-gray-600);
    cursor: pointer;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;

    &:hover {
      color: var(--art-gray-700);
    }

    &.is-active {
      color: var(--art-primary);
      border-bottom-color: var(--art-primary);
    }
  }

  .iap-tab-badge {
    padding: 1px 5px;
    font-size: 10px;
    color: #fff;
    background: #7c3aed;
    border-radius: 3px;
  }

  .iap-tab-content {
    flex: 1;
    min-height: 0;
  }

  .iap-section-card {
    padding: 14px 16px;
    background: var(--default-box-color);
    border: 1px solid var(--default-border);
    border-radius: 10px;
  }

  .iap-section-title {
    margin-bottom: 12px;
    font-size: 13px;
    font-weight: 600;
    color: var(--art-gray-800);

    &--legend {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  }

  :deep(.iap-dark-table) {
    background: transparent !important;

    .el-table__inner {
      width: 100%;
      table-layout: fixed;
    }

    th,
    td {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .el-table__header-wrapper th {
      font-size: 12px;
      color: var(--art-gray-600) !important;
      background: var(--art-gray-200) !important;
      border-bottom: 1px solid var(--default-border) !important;
    }

    .el-table__row {
      background: transparent !important;

      &:hover td {
        background: var(--art-hover-color) !important;
      }
    }

    td {
      font-size: 12px;
      color: var(--art-gray-800) !important;
      border-bottom: 1px solid var(--default-border) !important;
    }

    .el-table__inner-wrapper::before {
      display: none;
    }
  }

  .iap-tag--sub {
    color: #818cf8 !important;
    background: #1e1b4b !important;
    border-color: #312e81 !important;
  }

  .iap-tag--iap {
    color: #2dd4bf !important;
    background: #134e4a !important;
    border-color: #0f766e !important;
  }

  .iap-sku-trend-spark {
    width: 120px;
    height: 22px;
  }

  .iap-ratio-wrap {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .iap-ratio-bar {
    min-width: 4px;
    height: 6px;
    background: linear-gradient(90deg, #6c63ff, var(--art-primary));
    border-radius: 3px;
  }

  .iap-ratio-text {
    font-size: 11px;
    color: var(--art-gray-600);
    white-space: nowrap;
  }

  .iap-trend-up {
    color: var(--art-success);
  }

  .iap-trend-down {
    color: var(--art-danger);
  }

  .iap-text-green {
    color: var(--art-success);
  }

  .iap-text-orange {
    color: var(--art-warning);
  }

  .iap-bottom-three-col {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 10px;
    align-items: stretch;
    min-height: 340px;
    margin-top: 10px;
  }

  .iap-flex-1 {
    flex: 1;
  }

  .iap-bottom-three-col .iap-section-card {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .iap-bottom-three-col .iap-segment-list {
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: space-between;
    min-height: 0;
  }

  .iap-bottom-three-col .iap-donut-wrap {
    flex: 1;
    height: auto;
    min-height: 0;
  }

  .iap-bottom-three-col .iap-donut-chart {
    height: 100%;
  }

  .iap-bottom-three-col .iap-renew-chart {
    flex: 1;
    height: 100%;
    min-height: 0;
  }

  .iap-bottom-three-col .iap-segment-row:last-child {
    margin-bottom: 0;
  }

  .iap-segment-row {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 10px;
  }

  .iap-seg-left {
    display: flex;
    flex-shrink: 0;
    justify-content: space-between;
    width: 140px;
  }

  .iap-seg-label {
    font-size: 11px;
    color: var(--art-gray-600);
  }

  .iap-seg-count {
    font-size: 11px;
    color: var(--art-gray-500);
  }

  .iap-seg-bar-wrap {
    flex: 1;
    height: 6px;
    overflow: hidden;
    background: var(--default-border);
    border-radius: 3px;
  }

  .iap-seg-bar {
    height: 100%;
    border-radius: 3px;
  }

  .iap-seg-arpu {
    width: 100px;
    font-size: 11px;
    color: var(--art-gray-600);
    text-align: right;
    white-space: nowrap;
  }

  .iap-donut-wrap {
    position: relative;
    flex: 1;
    height: auto;
    min-height: 0;
  }

  .iap-donut-chart {
    width: 100%;
    height: 100%;
  }

  .iap-donut-center {
    position: absolute;
    top: 50%;
    left: 50%;
    text-align: center;
    pointer-events: none;
    transform: translate(-50%, -50%);
  }

  .iap-donut-num {
    font-size: 16px;
    font-weight: 700;
    color: var(--art-gray-900);
  }

  .iap-donut-sub {
    font-size: 10px;
    color: var(--art-gray-500);
  }

  .iap-donut-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 8px;
  }

  .iap-legend-item {
    display: flex;
    gap: 4px;
    align-items: center;
    font-size: 11px;
    color: var(--art-gray-600);

    i {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 2px;
    }
  }

  .iap-renew-chart {
    flex: 1;
    height: 100%;
    min-height: 0;
  }

  .iap-two-col-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .iap-three-col-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 10px;
  }

  .iap-mt-16 {
    margin-top: 16px;
  }

  .iap-country-chart {
    height: 200px;
  }

  .iap-user-compare-chart {
    height: 180px;
  }

  .iap-first-pay-chart {
    height: 180px;
  }

  .iap-trend-chart-lg {
    height: 260px;
  }

  .iap-trend-chart-sm {
    height: 180px;
  }

  .iap-legend-right {
    display: flex;
    gap: 12px;
    align-items: center;
    font-size: 12px;
    color: var(--art-gray-600);
  }

  .iap-legend-dot {
    display: inline-block;
    width: 10px;
    height: 10px;
    margin-right: 4px;
    border-radius: 2px;

    &--teal {
      background: #00c9a7;
    }

    &--purple {
      background: #a78bfa;
    }
  }
</style>
