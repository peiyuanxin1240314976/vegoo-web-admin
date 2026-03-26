<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
  import { useRouter } from 'vue-router'
  import * as echarts from 'echarts'
  import ScreenshotModal from './ScreenshotModal.vue'
  import { AgencyAnalysisEndpoint, isAgencyAnalysisMock } from '../config/data-source'
  import { mockFetchAgencyAnalysisData } from '../mock/mock-data'
  import type {
    AgencyAnalysisCharts,
    AgencyExpandData,
    AgencyRow,
    CampaignRow,
    DailyRow,
    KpiCardItem,
    AgencyStatus
  } from '../types'

  // ─────────────────── KPI Cards ───────────────────
  const kpiCards = ref<KpiCardItem[]>([])
  const pageLoading = ref(true)
  const agencySkeletonRows = 4
  const campaignSkeletonRows = 5
  const dailySkeletonRows = 6

  // ─────────────────── Agency Table Data ───────────────────
  const agencies = ref<AgencyRow[]>([])

  // ─────────────────── Expand Detail Data ───────────────────
  const agencyDetailMap = ref<Record<string, AgencyExpandData>>({})

  // ─────────────────── Campaign Detail Table ───────────────────
  const campaigns = ref<CampaignRow[]>([])

  // ─────────────────── Daily Comparison ───────────────────
  const dailyRows = ref<DailyRow[]>([])
  const charts = ref<AgencyAnalysisCharts>({
    donut: [],
    channelDistribution: { categories: [], series: [] },
    countryTop8: [],
    spendTrend30d: { dates: [], series: [] }
  })

  // ─────────────────── Expand State ───────────────────
  const expandedSet = ref<Set<string>>(new Set())

  const toggleExpand = (id: string) => {
    if (expandedSet.value.has(id)) {
      expandedSet.value.delete(id)
    } else {
      expandedSet.value.add(id)
    }
    expandedSet.value = new Set(expandedSet.value) // trigger reactivity
  }

  const isExpanded = (id: string) => expandedSet.value.has(id)

  // ─────────────────── Screenshot Modal ───────────────────
  const showScreenshot = ref(false)
  const screenshotAgency = ref('GatherOne')
  const router = useRouter()

  const openScreenshot = (agencyName?: string) => {
    screenshotAgency.value = agencyName || 'GatherOne'
    showScreenshot.value = true
  }

  const goCampaignDetail = (campaign: CampaignRow) => {
    router.push({
      path: '/user-growth/ad-performance/campaign-detail',
      query: {
        id: campaign.id,
        name: campaign.name
      }
    })
  }

  // ─────────────────── Charts ───────────────────
  const donutRef = ref<HTMLElement | null>(null)
  const barRef = ref<HTMLElement | null>(null)
  const countryRef = ref<HTMLElement | null>(null)
  const trendRef = ref<HTMLElement | null>(null)
  let chartInstances: echarts.ECharts[] = []

  const disposeCharts = () => {
    chartInstances.forEach((c) => c.dispose())
    chartInstances = []
  }

  const initCharts = () => {
    disposeCharts()
    const bg = 'transparent'
    const donutRows = charts.value.donut
    const donutTotal = donutRows.reduce((sum, item) => sum + item.value, 0)

    // Donut chart
    if (donutRef.value) {
      const c = echarts.init(donutRef.value)
      c.setOption({
        backgroundColor: bg,
        tooltip: {
          trigger: 'item',
          formatter: (p: { name: string; value: number; percent: number }) =>
            `${p.name}: $${p.value.toLocaleString()} (${p.percent.toFixed(1)}%)`,
          backgroundColor: '#1a2d44',
          borderColor: '#1e3a5f',
          textStyle: { color: '#e2e8f0', fontSize: 11 }
        },
        legend: {
          orient: 'horizontal',
          left: 'center',
          bottom: 0,
          itemWidth: 8,
          itemHeight: 8,
          textStyle: { color: '#94a3b8', fontSize: 10 },
          data: donutRows.map((item) => item.name)
        },
        graphic: {
          type: 'text',
          left: 'center',
          top: '36%',
          silent: true,
          style: {
            text: `$${donutTotal.toLocaleString()}`,
            fill: '#e2e8f0',
            fontSize: 18,
            fontWeight: 700
          }
        },
        series: [
          {
            type: 'pie',
            radius: ['28%', '42%'],
            center: ['50%', '40%'],
            avoidLabelOverlap: true,
            itemStyle: { borderColor: '#0d1829', borderWidth: 2 },
            label: {
              show: true,
              position: 'outside',
              formatter: (p: { name: string; value: number; percent: number }) =>
                `${p.name}\n$${p.value.toLocaleString()} (${p.percent.toFixed(1)}%)`,
              color: '#e2e8f0',
              fontSize: 10,
              lineHeight: 14
            },
            labelLine: {
              show: true,
              length: 10,
              length2: 8,
              lineStyle: { color: '#94a3b8', width: 1 }
            },
            data: donutRows.map((item) => ({
              value: item.value,
              name: item.name,
              itemStyle: { color: item.color }
            }))
          }
        ]
      })
      chartInstances.push(c)
    }

    // Grouped bar
    if (barRef.value) {
      const c = echarts.init(barRef.value)
      c.setOption({
        backgroundColor: bg,
        tooltip: {
          trigger: 'axis',
          backgroundColor: '#1a2d44',
          borderColor: '#1e3a5f',
          textStyle: { color: '#e2e8f0', fontSize: 11 }
        },
        legend: {
          top: 4,
          itemWidth: 8,
          itemHeight: 8,
          textStyle: { color: '#94a3b8', fontSize: 9 },
          data: charts.value.channelDistribution.series.map((item) => item.name)
        },
        grid: { top: 30, right: 8, bottom: 24, left: 48 },
        xAxis: {
          type: 'category',
          data: charts.value.channelDistribution.categories,
          axisLabel: { color: '#64748b', fontSize: 9 },
          axisLine: { lineStyle: { color: '#1e3a5f' } },
          axisTick: { show: false }
        },
        yAxis: {
          type: 'value',
          axisLabel: { color: '#64748b', fontSize: 9, formatter: (v: number) => `$${v / 1000}k` },
          splitLine: { lineStyle: { color: '#1e3a5f', type: 'dashed' } }
        },
        series: charts.value.channelDistribution.series.map((item) => ({
          name: item.name,
          type: 'bar',
          data: item.values,
          itemStyle: { color: item.color, borderRadius: [2, 2, 0, 0] },
          barMaxWidth: 14
        }))
      })
      chartInstances.push(c)
    }

    // Country horizontal bar
    if (countryRef.value) {
      const countries = charts.value.countryTop8.map((item) => item.s_country_code)
      const values = charts.value.countryTop8.map((item) => item.spend)
      const percents = charts.value.countryTop8.map((item) => `${item.sharePct}%`)
      const c = echarts.init(countryRef.value)
      c.setOption({
        backgroundColor: bg,
        tooltip: {
          trigger: 'axis',
          backgroundColor: '#1a2d44',
          borderColor: '#1e3a5f',
          textStyle: { color: '#e2e8f0', fontSize: 11 }
        },
        grid: { top: 4, right: 80, bottom: 4, left: 28 },
        xAxis: { type: 'value', show: false },
        yAxis: {
          type: 'category',
          data: countries,
          axisLabel: { color: '#94a3b8', fontSize: 10 },
          axisLine: { show: false },
          axisTick: { show: false }
        },
        series: [
          {
            type: 'bar',
            data: values,
            barMaxWidth: 14,
            itemStyle: { color: '#00d4b4', borderRadius: [0, 3, 3, 0] },
            label: {
              show: true,
              position: 'right',
              color: '#94a3b8',
              fontSize: 9,
              formatter: (p: any) => `$${(p.value / 1000).toFixed(0)}k (${percents[p.dataIndex]})`
            }
          }
        ]
      })
      chartInstances.push(c)
    }

    // Trend area chart
    if (trendRef.value) {
      const dates = charts.value.spendTrend30d.dates
      const c = echarts.init(trendRef.value)
      c.setOption({
        backgroundColor: bg,
        tooltip: {
          trigger: 'axis',
          backgroundColor: '#1a2d44',
          borderColor: '#1e3a5f',
          textStyle: { color: '#e2e8f0', fontSize: 11 }
        },
        legend: {
          bottom: 2,
          itemWidth: 8,
          itemHeight: 8,
          textStyle: { color: '#94a3b8', fontSize: 9 }
        },
        grid: { top: 12, right: 12, bottom: 36, left: 46 },
        xAxis: {
          type: 'category',
          data: dates,
          axisLabel: { color: '#64748b', fontSize: 9 },
          axisLine: { lineStyle: { color: '#1e3a5f' } },
          axisTick: { show: false },
          boundaryGap: false
        },
        yAxis: {
          type: 'value',
          axisLabel: { color: '#64748b', fontSize: 9, formatter: (v: number) => `$${v / 1000}k` },
          splitLine: { lineStyle: { color: '#1e3a5f', type: 'dashed' } }
        },
        series: charts.value.spendTrend30d.series.map((item) => ({
          name: item.name,
          type: 'line',
          smooth: true,
          symbol: 'none',
          data: item.values,
          lineStyle: { color: item.color, width: 2 },
          itemStyle: { color: item.color },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: `${item.color}55` },
                { offset: 1, color: `${item.color}08` }
              ]
            }
          }
        }))
      })
      chartInstances.push(c)
    }
  }

  const loadPageData = async () => {
    pageLoading.value = true
    try {
      if (
        isAgencyAnalysisMock(AgencyAnalysisEndpoint.Overview) &&
        isAgencyAnalysisMock(AgencyAnalysisEndpoint.AgencySummary) &&
        isAgencyAnalysisMock(AgencyAnalysisEndpoint.CampaignTable) &&
        isAgencyAnalysisMock(AgencyAnalysisEndpoint.DailyComparison) &&
        isAgencyAnalysisMock(AgencyAnalysisEndpoint.DonutSpendShare) &&
        isAgencyAnalysisMock(AgencyAnalysisEndpoint.ChannelDistribution) &&
        isAgencyAnalysisMock(AgencyAnalysisEndpoint.CountryTop8) &&
        isAgencyAnalysisMock(AgencyAnalysisEndpoint.SpendTrend30d)
      ) {
        const payload = await mockFetchAgencyAnalysisData()
        kpiCards.value = payload.kpiCards
        agencies.value = payload.agencies
        agencyDetailMap.value = payload.agencyDetailMap
        campaigns.value = payload.campaigns
        dailyRows.value = payload.dailyRows
        charts.value = payload.charts
      }
    } finally {
      pageLoading.value = false
      await nextTick()
      initCharts()
    }
  }

  onMounted(loadPageData)
  onBeforeUnmount(disposeCharts)

  // ─────────────────── Helpers ───────────────────
  const fmtM = (v: number) => `$${v.toLocaleString()}`

  const statusInfo = (s: AgencyStatus) => {
    if (s === 'normal') return { label: '正常', dot: '#10b981', text: '#10b981' }
    if (s === 'low') return { label: '偏低', dot: '#f59e0b', text: '#f59e0b' }
    return { label: '暂停', dot: '#ef4444', text: '#ef4444' }
  }

  const roiClass = (v: number) => {
    if (v >= 100) return 'teal'
    if (v >= 90) return 'yellow'
    return 'red'
  }

  const roiBadgeClass = (v: number | null) => {
    if (v === null) return ''
    if (v >= 110) return 'roi-green'
    if (v >= 95) return 'roi-teal'
    if (v >= 85) return 'roi-yellow'
    return 'roi-red'
  }

  const changeClass = (v: number | null) => (v === null ? '' : v >= 0 ? 'change-up' : 'change-down')
  const changeTxt = (v: number | null) =>
    v === null ? '--' : `${v >= 0 ? '↑' : '↓'}${Math.abs(v)}%`

  const trendPath = (t: string) => {
    if (t === 'up') return 'M2,12 L6,8 L10,9 L14,5'
    if (t === 'down') return 'M2,5 L6,8 L10,7 L14,12'
    return 'M2,8 L6,8 L10,8 L14,8'
  }
  const trendColor = (t: string) => (t === 'up' ? '#00d4b4' : t === 'down' ? '#ef4444' : '#64748b')
</script>

<template>
  <div class="page-wrap">
    <!-- ── Top bar ── -->
    <div class="top-bar">
      <div class="top-filters">
        <el-date-picker
          model-value="2026-03-07"
          type="date"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          size="small"
          class="filter-date"
          prefix-icon=""
        >
          <template #prefix>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style="margin-right: 2px">
              <rect x="1" y="2" width="12" height="11" rx="2" stroke="#64748b" stroke-width="1.2" />
              <path
                d="M1 5h12M4 1v2M10 1v2"
                stroke="#64748b"
                stroke-width="1.2"
                stroke-linecap="round"
              />
            </svg>
          </template>
        </el-date-picker>

        <el-select model-value="全部应用" size="small" class="filter-select">
          <el-option label="全部应用" value="all" />
        </el-select>

        <el-select model-value="全部代投方" size="small" class="filter-select">
          <el-option label="全部代投方" value="all" />
        </el-select>

        <el-select model-value="全部渠道" size="small" class="filter-select">
          <el-option label="全部渠道" value="all" />
        </el-select>

        <button class="btn-screenshot" @click="openScreenshot()">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style="margin-right: 6px">
            <rect
              x="1"
              y="2"
              width="12"
              height="10"
              rx="2"
              stroke="currentColor"
              stroke-width="1.2"
            />
            <circle cx="7" cy="7" r="2.5" stroke="currentColor" stroke-width="1.2" />
          </svg>
          一键截图复制
        </button>
      </div>
    </div>

    <!-- ── KPI Cards ── -->
    <div class="kpi-row">
      <div
        v-for="(card, i) in kpiCards"
        :key="i"
        class="kpi-card"
        :class="{ highlighted: card.highlighted }"
      >
        <div class="kpi-label">{{ card.label }}</div>
        <div class="kpi-value">{{ card.value }}</div>
        <div v-if="card.changeText" class="kpi-change" :class="card.changeUp ? 'up' : 'down'">
          {{ card.changeText }}
        </div>
        <svg
          v-if="card.sparkPoints"
          class="kpi-spark"
          viewBox="0 0 96 36"
          fill="none"
          preserveAspectRatio="none"
        >
          <polyline
            :points="card.sparkPoints"
            :stroke="card.sparkColor"
            stroke-width="1.5"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <!-- Badge numbers top-left for highlighted -->
        <div v-if="card.highlighted" class="kpi-idx">{{ i + 1 }}</div>
      </div>
    </div>

    <!-- ── Main layout ── -->
    <div class="main-layout">
      <!-- Left content -->
      <div class="main-left">
        <!-- ① Agency Summary Table -->
        <div class="section-block">
          <div class="section-header">
            <div class="section-title">
              <span class="section-num">1</span>
              代投方汇总
              <span class="section-subtitle">14px</span>
            </div>
            <div class="section-actions">
              <span class="data-date">数据日期: 2026-03-07</span>
              <button class="btn-small-outline">导出</button>
            </div>
          </div>

          <table class="data-table">
            <thead>
              <tr>
                <th class="th-expand"></th>
                <th>代投方</th>
                <th class="text-right">应用数</th>
                <th class="text-right">渠道数</th>
                <th class="text-right">消耗($)</th>
                <th class="text-right">安装数</th>
                <th class="text-right">CPI($)</th>
                <th class="text-right">CPA($)</th>
                <th class="text-right">首日ROI</th>
                <th>预算执行率</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <template v-if="pageLoading">
                <tr v-for="idx in agencySkeletonRows" :key="`agency-skeleton-${idx}`">
                  <td colspan="12" class="skeleton-row-cell">
                    <div class="row-skeleton-line" />
                  </td>
                </tr>
              </template>
              <template v-for="ag in agencies" :key="ag.id">
                <!-- Main row -->
                <tr class="agency-row" :class="{ expanded: isExpanded(ag.id) }">
                  <td class="td-expand">
                    <button
                      class="expand-arrow"
                      :class="{ open: isExpanded(ag.id) }"
                      @click="toggleExpand(ag.id)"
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path
                          d="M2 3.5L5 6.5L8 3.5"
                          stroke="currentColor"
                          stroke-width="1.5"
                          stroke-linecap="round"
                        />
                      </svg>
                    </button>
                  </td>
                  <td>
                    <div class="agency-name-cell">
                      <span :style="{ color: ag.nameColor || '#e2e8f0' }">{{ ag.name }}</span>
                      <span v-if="ag.hasWarning" class="warn-icon">⚠</span>
                    </div>
                  </td>
                  <td class="text-right">{{ ag.appCount }}</td>
                  <td class="text-right">{{ ag.channelCount }}</td>
                  <td class="text-right fw-600">{{ fmtM(ag.spend) }}</td>
                  <td class="text-right">{{ ag.installs.toLocaleString() }}</td>
                  <td class="text-right">${{ ag.cpi.toFixed(2) }}</td>
                  <td class="text-right">${{ ag.cpa.toFixed(2) }}</td>
                  <td class="text-right" :class="roiClass(ag.roi)">
                    <span :class="[`roi-text-${roiClass(ag.roi)}`]">{{ ag.roi }}%</span>
                  </td>
                  <td>
                    <div class="budget-bar-wrap">
                      <div class="budget-bar-track">
                        <div
                          class="budget-bar-fill"
                          :style="{
                            width: `${ag.budgetRate}%`,
                            background:
                              ag.budgetRate >= 90
                                ? '#00d4b4'
                                : ag.budgetRate >= 80
                                  ? '#3b82f6'
                                  : '#f59e0b'
                          }"
                        />
                      </div>
                      <span class="budget-pct">{{ ag.budgetRate }}%</span>
                    </div>
                  </td>
                  <td>
                    <div class="status-cell">
                      <span class="status-dot" :style="{ background: statusInfo(ag.status).dot }" />
                      <span :style="{ color: statusInfo(ag.status).text }">{{
                        statusInfo(ag.status).label
                      }}</span>
                    </div>
                  </td>
                  <td>
                    <button class="btn-expand-text" @click="toggleExpand(ag.id)">
                      {{ isExpanded(ag.id) ? '收起 ∧' : '展开 ∨' }}
                    </button>
                  </td>
                </tr>

                <!-- Expanded row -->
                <tr v-if="isExpanded(ag.id)" class="expand-row">
                  <td colspan="12" class="expand-td">
                    <div class="expand-panel">
                      <!-- Expand header -->
                      <div class="exp-hd">
                        <div class="exp-hd-left">
                          <span class="exp-device-icon">📱</span>
                          <span class="exp-name" :style="{ color: ag.nameColor || '#e2e8f0' }">{{
                            ag.name
                          }}</span>
                          <span class="exp-badge active">ACTIVE</span>
                          <span class="exp-meta">广告投放代理商</span>
                          <span class="exp-meta">数据日期: 2026-03-07</span>
                        </div>
                        <div class="exp-hd-right">
                          <!-- <button class="btn-sm-teal">展开全部</button>
                          <button class="btn-sm-ghost">自定义列</button> -->
                          <button class="btn-sm-ghost">↓ 导出</button>
                          <button class="btn-sm-ghost" @click="toggleExpand(ag.id)">收起 ∧</button>
                        </div>
                      </div>

                      <!-- Summary metrics -->
                      <div class="exp-metrics">
                        <div class="exp-metric">
                          <div class="exp-metric-label">应用数</div>
                          <div class="exp-metric-value">{{ agencyDetailMap[ag.id].appCount }}</div>
                        </div>
                        <div class="exp-metric">
                          <div class="exp-metric-label">广告渠道</div>
                          <div class="exp-metric-value">{{
                            agencyDetailMap[ag.id].channelCount
                          }}</div>
                        </div>
                        <div class="exp-metric">
                          <div class="exp-metric-label">总消耗</div>
                          <div class="exp-metric-value teal">{{
                            fmtM(agencyDetailMap[ag.id].totalSpend)
                          }}</div>
                        </div>
                        <div class="exp-metric">
                          <div class="exp-metric-label">总安装</div>
                          <div class="exp-metric-value">{{
                            agencyDetailMap[ag.id].totalInstalls.toLocaleString()
                          }}</div>
                        </div>
                        <div class="exp-metric">
                          <div class="exp-metric-label">平均首日ROI</div>
                          <div class="exp-metric-value-roi">
                            <span :class="`roi-text-${roiClass(agencyDetailMap[ag.id].roi)}`">
                              {{ agencyDetailMap[ag.id].roi }}%
                            </span>
                            <span
                              class="roi-tag"
                              :class="
                                agencyDetailMap[ag.id].roi >= agencyDetailMap[ag.id].roiTarget
                                  ? 'roi-tag-meet'
                                  : 'roi-tag-miss'
                              "
                            >
                              {{
                                agencyDetailMap[ag.id].roi >= agencyDetailMap[ag.id].roiTarget
                                  ? '达标'
                                  : '未达'
                              }}
                            </span>
                          </div>
                        </div>
                      </div>

                      <!-- Weekly summary -->
                      <div class="exp-weekly">
                        <span class="weekly-lbl">近7天汇总</span>
                        <span class="weekly-item"
                          >广告支出:
                          <strong
                            >${{ agencyDetailMap[ag.id].weeklySpend.toLocaleString() }}</strong
                          ></span
                        >
                        <span class="weekly-sep">|</span>
                        <span class="weekly-item"
                          >首日ROI:
                          <strong class="teal"
                            >{{ agencyDetailMap[ag.id].weeklyRoi }}%</strong
                          ></span
                        >
                        <span class="weekly-sep">|</span>
                        <span class="weekly-item">CPA: <strong>--</strong></span>
                        <span class="weekly-sep">|</span>
                        <span class="weekly-item"
                          >安装数:
                          <strong>{{
                            agencyDetailMap[ag.id].weeklyInstalls.toLocaleString()
                          }}</strong></span
                        >
                        <span class="weekly-sep">|</span>
                        <span class="weekly-item"
                          >在投应用: <strong>{{ agencyDetailMap[ag.id].weeklyApps }}</strong></span
                        >
                        <span class="weekly-sep">|</span>
                        <span class="weekly-item"
                          >广告账户:
                          <strong>{{ agencyDetailMap[ag.id].weeklyAccounts }}</strong></span
                        >
                        <span class="weekly-sep">|</span>
                        <span class="weekly-item"
                          >广告系列:
                          <strong>{{ agencyDetailMap[ag.id].weeklyCampaigns }}</strong></span
                        >
                        <span class="weekly-sep">|</span>
                        <span class="weekly-item"
                          >投放国家:
                          <strong>{{ agencyDetailMap[ag.id].weeklyCountries }}</strong></span
                        >
                        <span class="weekly-sep">|</span>
                        <span class="weekly-item"
                          >投放天数: <strong>{{ agencyDetailMap[ag.id].weeklyDays }}</strong></span
                        >
                      </div>

                      <!-- Account summary sub-table -->
                      <div class="exp-sub-section">
                        <div class="exp-sub-title">账户汇总</div>
                        <table class="sub-table">
                          <thead>
                            <tr>
                              <th>应用</th>
                              <th>平台</th>
                              <th>广告平台</th>
                              <th>账户ID</th>
                              <th>账户名称</th>
                              <th>广告支出</th>
                              <th>首日ROI</th>
                              <th>CPA</th>
                              <th>CPI</th>
                              <th>安装数</th>
                              <th>操作</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="(acc, ai) in agencyDetailMap[ag.id].accounts" :key="ai">
                              <td>{{ acc.app }}</td>
                              <td>{{ acc.platform }}</td>
                              <td>{{ acc.adPlatform }}</td>
                              <td class="account-id">{{ acc.accountId }}</td>
                              <td>{{ acc.accountName }}</td>
                              <td>{{ acc.spend }}</td>
                              <td :class="`roi-text-${roiClass(acc.roi)}`">{{ acc.roi }}%</td>
                              <td>{{ acc.cpa }}</td>
                              <td>{{ acc.cpi }}</td>
                              <td>{{ acc.installs.toLocaleString() }}</td>
                              <td><span class="link-action">详情</span></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <!-- Campaign detail sub-table -->
                      <div class="exp-sub-section">
                        <div class="exp-sub-title">近期明细</div>
                        <table class="sub-table">
                          <thead>
                            <tr>
                              <th>广告系列名称</th>
                              <th>预算</th>
                              <th>广告支出</th>
                              <th>CPA</th>
                              <th>CPI</th>
                              <th>安装数</th>
                              <th class="roi-date-head">3/4</th>
                              <th class="roi-date-head">3/3</th>
                              <th class="roi-date-head">3/2</th>
                              <th>明细</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr
                              v-for="(cp, ci) in agencyDetailMap[ag.id].campaigns"
                              :key="ci"
                              :class="{ 'row-red-tint': cp.isRed }"
                            >
                              <td :class="{ 'text-danger': cp.isRed }">{{ cp.name }}</td>
                              <td>${{ cp.budget }}</td>
                              <td>{{ cp.spend }}</td>
                              <td>{{ cp.cpa }}</td>
                              <td>{{ cp.cpi }}</td>
                              <td>{{ cp.installs }}</td>
                              <td>
                                <span
                                  v-if="cp.roi34 !== null"
                                  class="roi-badge"
                                  :class="roiBadgeClass(cp.roi34)"
                                  >{{ cp.roi34 }}%</span
                                >
                                <span v-else class="dim">--</span>
                              </td>
                              <td>
                                <span
                                  v-if="cp.roi33 !== null"
                                  class="roi-badge"
                                  :class="roiBadgeClass(cp.roi33)"
                                  >{{ cp.roi33 }}%</span
                                >
                                <span v-else class="dim">--</span>
                              </td>
                              <td>
                                <span
                                  v-if="cp.roi32 !== null"
                                  class="roi-badge"
                                  :class="roiBadgeClass(cp.roi32)"
                                  >{{ cp.roi32 }}%</span
                                >
                                <span v-else class="dim">--</span>
                              </td>
                              <td><span class="link-action">查看</span></td>
                            </tr>
                          </tbody>
                        </table>
                        <div class="sub-footnote"
                          >注: 时区 PST(UTC-8), 货币 USD; ROI计算包含广告收入及付费收入。</div
                        >
                      </div>
                    </div>
                  </td>
                </tr>
              </template>

              <!-- Total row -->
              <tr v-if="!pageLoading" class="total-row">
                <td></td>
                <td>小计</td>
                <td class="text-right">6</td>
                <td class="text-right">4</td>
                <td class="text-right fw-600">$284,520</td>
                <td class="text-right">8,642</td>
                <td class="text-right">$2.41</td>
                <td class="text-right">$32.18</td>
                <td class="text-right">96%</td>
                <td>
                  <div class="budget-bar-wrap">
                    <div class="budget-bar-track">
                      <div class="budget-bar-fill" style="width: 88%; background: #94a3b8" />
                    </div>
                    <span class="budget-pct">88%</span>
                  </div>
                </td>
                <td>--</td>
                <td>--</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ② Campaign Detail Table -->
        <div class="section-block">
          <div class="section-header">
            <div class="section-title">
              <span class="section-num">2</span>
              代投广告系列明细
            </div>
            <div class="section-actions">
              <button class="btn-small-outline">自定义列</button>
              <button class="btn-small-outline">导出</button>
            </div>
          </div>

          <table class="data-table">
            <thead>
              <tr>
                <th>代投方</th>
                <th>广告系列名称</th>
                <th>渠道</th>
                <th>应用</th>
                <th class="text-right">消耗($)</th>
                <th class="text-right">安装数</th>
                <th class="text-right">CPI($)</th>
                <th class="text-right">CTR(%)</th>
                <th class="text-right">CVR(%)</th>
                <th class="text-right">IPM</th>
                <th class="text-right">预算($)</th>
                <th class="text-right">执行率</th>
                <th>7日趋势</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <template v-if="pageLoading">
                <tr v-for="idx in campaignSkeletonRows" :key="`campaign-skeleton-${idx}`">
                  <td colspan="14" class="skeleton-row-cell">
                    <div class="row-skeleton-line" />
                  </td>
                </tr>
              </template>
              <tr v-for="(cp, i) in campaigns" :key="i" class="data-row">
                <td :style="{ color: cp.agencyColor || '#e2e8f0' }">{{ cp.agency }}</td>
                <td class="name-cell">{{ cp.name }}</td>
                <td>{{ cp.channel }}</td>
                <td>{{ cp.app }}</td>
                <td class="text-right">${{ cp.spend.toLocaleString() }}</td>
                <td class="text-right">{{ cp.installs.toLocaleString() }}</td>
                <td class="text-right">${{ cp.cpi.toFixed(2) }}</td>
                <td class="text-right">{{ cp.ctr }}%</td>
                <td class="text-right">{{ cp.cvr }}%</td>
                <td class="text-right">{{ cp.ipm }}</td>
                <td class="text-right">${{ cp.budget.toLocaleString() }}</td>
                <td class="text-right">{{ cp.execRate }}%</td>
                <td>
                  <svg width="40" height="18" viewBox="0 0 16 14" fill="none">
                    <path
                      :d="trendPath(cp.trend)"
                      :stroke="trendColor(cp.trend)"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      fill="none"
                    />
                    <path
                      :d="trendPath(cp.trend) + ' V14 H2 Z'"
                      :fill="trendColor(cp.trend)"
                      fill-opacity="0.15"
                    />
                  </svg>
                  <span class="trend-arrow" :style="{ color: trendColor(cp.trend) }">
                    {{ cp.trend === 'up' ? '↑' : cp.trend === 'down' ? '↓' : '→' }}
                  </span>
                </td>
                <td>
                  <span class="link-action" @click="goCampaignDetail(cp)">详情 ›</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ③ Daily Comparison -->
        <div class="section-block">
          <div class="section-header">
            <div class="section-title">
              <span class="section-num">3</span>
              逐日对比分析（近7天）
            </div>
          </div>

          <table class="data-table">
            <thead>
              <tr>
                <th>日期</th>
                <th>代投方</th>
                <th class="text-right">消耗($)</th>
                <th class="text-right">安装数</th>
                <th class="text-right">CPI($)</th>
                <th class="text-right">CPA($)</th>
                <th class="text-right">消耗环比</th>
                <th class="text-right">安装环比</th>
              </tr>
            </thead>
            <tbody>
              <template v-if="pageLoading">
                <tr v-for="idx in dailySkeletonRows" :key="`daily-skeleton-${idx}`">
                  <td colspan="8" class="skeleton-row-cell">
                    <div class="row-skeleton-line" />
                  </td>
                </tr>
              </template>
              <tr v-for="(row, i) in dailyRows" :key="i" class="data-row">
                <td>{{ row.date }}</td>
                <td :style="{ color: row.agencyColor || '#e2e8f0' }">{{ row.agency }}</td>
                <td class="text-right">${{ row.spend.toLocaleString() }}</td>
                <td class="text-right">{{ row.installs.toLocaleString() }}</td>
                <td class="text-right">${{ row.cpi.toFixed(2) }}</td>
                <td class="text-right">${{ row.cpa.toFixed(2) }}</td>
                <td class="text-right" :class="changeClass(row.spendChange)">
                  {{ changeTxt(row.spendChange) }}
                </td>
                <td class="text-right" :class="changeClass(row.installsChange)">
                  {{ changeTxt(row.installsChange) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Right sidebar -->
      <div class="sidebar-right">
        <!-- Donut chart -->
        <div class="chart-block donut-chart-block">
          <div class="chart-title">代投方消耗占比</div>
          <div ref="donutRef" class="chart-area" style="height: 220px" />
        </div>

        <!-- Bar chart -->
        <div class="chart-block">
          <div class="chart-title">渠道分布分析</div>
          <div ref="barRef" class="chart-area" style="height: 160px" />
        </div>

        <!-- Country horizontal bar -->
        <div class="chart-block">
          <div class="chart-title">国家消耗分布 Top 8</div>
          <div ref="countryRef" class="chart-area" style="height: 210px" />
        </div>

        <!-- Trend area -->
        <div class="chart-block">
          <div class="chart-title">代投消耗趋势（近30天）</div>
          <div ref="trendRef" class="chart-area" style="height: 180px" />
        </div>
      </div>
    </div>

    <!-- Screenshot Modal -->
    <ScreenshotModal
      v-model="showScreenshot"
      :agency-name="screenshotAgency"
      @download="() => {}"
      @copy="() => {}"
    />
  </div>
</template>

<style scoped lang="scss">
  // ─── Variables ───
  $bg-page: #08111e;
  $bg-card: #0d1829;
  $bg-row-hover: #111f35;
  $bg-header: #0a1422;
  $border: #1e3a5f;
  $text-primary: #e2e8f0;
  $text-secondary: #94a3b8;
  $text-muted: #64748b;
  $teal: #00d4b4;
  $blue: #3b82f6;
  $amber: #f59e0b;
  $red: #ef4444;
  $green: #10b981;

  // ─── Page ───
  .page-wrap {
    min-height: 100vh;
    padding: 0;
    font-family: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
    font-size: 13px;
    color: $text-primary;
    background: $bg-page;
  }

  // ─── Topbar ───
  .top-bar {
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    background: $bg-card;
    border-bottom: 1px solid $border;
  }

  .top-filters {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .filter-date {
    width: 130px !important;

    :deep(.el-input__wrapper) {
      height: 30px;
      background: #111f35 !important;
      border-color: $border !important;
      box-shadow: none !important;
    }

    :deep(.el-input__inner) {
      font-size: 12px;
      color: $text-primary !important;
    }
  }

  .filter-select {
    width: 110px !important;

    :deep(.el-input__wrapper) {
      height: 30px;
      background: #111f35 !important;
      border-color: $border !important;
      box-shadow: none !important;
    }

    :deep(.el-input__inner) {
      font-size: 12px;
      color: $text-primary !important;
    }

    :deep(.el-select__suffix) {
      color: $text-muted !important;
    }
  }

  .btn-screenshot {
    display: flex;
    align-items: center;
    padding: 6px 14px;
    font-size: 12px;
    font-weight: 600;
    color: #0a1628;
    white-space: nowrap;
    cursor: pointer;
    background: $teal;
    border: none;
    border-radius: 6px;
    transition: background 0.2s;

    &:hover {
      background: #00bfa3;
    }
  }

  // ─── KPI Cards ───
  .kpi-row {
    display: flex;
    gap: 0;
    gap: 12px;
    padding: 16px 20px;
  }

  .kpi-card {
    position: relative;
    flex: 1;
    min-width: 0;
    padding: 14px 16px;
    overflow: hidden;
    background: $bg-card;
    border: 1px solid $border;
    border-radius: 8px;
    transition: border-color 0.2s;

    &:hover {
      border-color: #2d5070;
    }

    &.highlighted {
      background: linear-gradient(135deg, rgb(0 212 180 / 6%) 0%, $bg-card 60%);
      border-color: $teal;
    }
  }

  .kpi-idx {
    position: absolute;
    top: 8px;
    left: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    font-size: 10px;
    font-weight: 700;
    color: #0a1628;
    background: $teal;
    border-radius: 50%;
  }

  .kpi-label {
    margin-bottom: 6px;
    margin-left: 22px;
    font-size: 11px;
    color: $text-muted;
  }

  .kpi-value {
    margin-bottom: 4px;
    font-size: 22px;
    font-weight: 700;
    line-height: 1;
    color: $text-primary;
  }

  .kpi-change {
    font-size: 11px;

    &.up {
      color: $teal;
    }

    &.down {
      color: $red;
    }
  }

  .kpi-spark {
    position: absolute;
    right: 10px;
    bottom: 8px;
    width: 80px;
    height: 28px;
    opacity: 0.8;
  }

  // ─── Main layout ───
  .main-layout {
    display: flex;
    gap: 12px;
    padding: 0 20px 20px;
  }

  .main-left {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 12px;
    min-width: 0;
  }

  .sidebar-right {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    gap: 10px;
    width: 260px;
  }

  // ─── Section blocks ───
  .section-block {
    overflow: hidden;
    background: $bg-card;
    border: 1px solid $border;
    border-radius: 8px;
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    background: $bg-header;
    border-bottom: 1px solid $border;
  }

  .section-title {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 13px;
    font-weight: 600;
    color: $text-primary;
  }

  .section-num {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    font-size: 11px;
    font-weight: 700;
    color: $text-secondary;
    background: #1e3a5f;
    border-radius: 4px;
  }

  .section-subtitle {
    font-size: 11px;
    font-weight: 400;
    color: $text-muted;
  }

  .section-actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .data-date {
    font-size: 11px;
    color: $text-muted;
  }

  .btn-small-outline {
    padding: 3px 10px;
    font-size: 11px;
    color: $text-secondary;
    cursor: pointer;
    background: transparent;
    border: 1px solid $border;
    border-radius: 4px;
    transition: all 0.2s;

    &:hover {
      color: $text-primary;
      border-color: #3d5570;
    }
  }

  // ─── Data Table ───
  .data-table {
    width: 100%;
    font-size: 12px;
    border-collapse: collapse;

    thead tr {
      background: $bg-header;
    }

    th {
      padding: 8px 10px;
      font-weight: 500;
      color: $text-muted;
      text-align: left;
      white-space: nowrap;
      border-bottom: 1px solid $border;
    }

    td {
      padding: 9px 10px;
      color: $text-secondary;
      white-space: nowrap;
      border-bottom: 1px solid #0f1c2e;
    }

    .text-right {
      text-align: right;
    }

    .fw-600 {
      font-weight: 600;
      color: $text-primary;
    }

    .data-row:hover td {
      background: $bg-row-hover;
    }
  }

  .skeleton-row-cell {
    padding: 10px !important;
    border-bottom: 1px solid #0f1c2e;
  }

  .row-skeleton-line {
    height: 16px;
    background: linear-gradient(90deg, #102135 20%, #17314e 40%, #102135 60%);
    background-size: 200% 100%;
    border-radius: 4px;
    animation: row-loading 1.2s ease-in-out infinite;
  }

  @keyframes row-loading {
    0% {
      background-position: 200% 0;
    }

    100% {
      background-position: -200% 0;
    }
  }

  // ─── Agency row ───
  .th-expand {
    width: 28px;
  }

  .td-expand {
    width: 28px;
    text-align: center;
  }

  .expand-arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    color: $text-muted;
    cursor: pointer;
    background: #1a2d44;
    border: none;
    border-radius: 4px;
    transition: all 0.2s;

    &:hover {
      color: $text-primary;
      background: #243d57;
    }

    svg {
      transition: transform 0.2s;
    }

    &.open svg {
      transform: rotate(180deg);
    }
  }

  .agency-row {
    transition: background 0.15s;

    &:hover td {
      background: $bg-row-hover;
    }

    &.expanded td {
      background: rgb(0 212 180 / 4%);
      border-bottom-color: $teal;
    }
  }

  .agency-name-cell {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .warn-icon {
    font-size: 12px;
    color: $amber;
  }

  .roi-text-teal {
    color: $teal;
  }

  .roi-text-yellow {
    color: $amber;
  }

  .roi-text-red {
    color: $red;
  }

  .budget-bar-wrap {
    display: flex;
    gap: 6px;
    align-items: center;
    min-width: 100px;
  }

  .budget-bar-track {
    flex: 1;
    height: 6px;
    overflow: hidden;
    background: #1a2d44;
    border-radius: 3px;
  }

  .budget-bar-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.3s;
  }

  .budget-pct {
    min-width: 32px;
    font-size: 11px;
    color: $text-secondary;
  }

  .status-cell {
    display: flex;
    gap: 5px;
    align-items: center;
    font-size: 12px;
  }

  .status-dot {
    flex-shrink: 0;
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  .btn-expand-text {
    padding: 3px 8px;
    font-size: 11px;
    color: $teal;
    white-space: nowrap;
    cursor: pointer;
    background: transparent;
    border: 1px solid $border;
    border-radius: 4px;

    &:hover {
      background: rgb(0 212 180 / 8%);
    }
  }

  // ─── Expand panel ───
  .expand-row td {
    padding: 0 !important;
  }

  .expand-td {
    padding: 0 !important;
  }

  .expand-panel {
    margin: 0 2px 4px;
    overflow: hidden;
    background: #091523;
    border: 1px solid rgb(0 212 180 / 30%);
    border-radius: 0 0 6px 6px;
  }

  .exp-hd {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    background: #0d1e30;
    border-bottom: 1px solid $border;

    &-left {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    &-right {
      display: flex;
      gap: 6px;
      align-items: center;
    }
  }

  .exp-device-icon {
    font-size: 14px;
  }

  .exp-name {
    font-size: 13px;
    font-weight: 700;
  }

  .exp-badge {
    padding: 2px 7px;
    font-size: 10px;
    border-radius: 4px;

    &.active {
      color: $teal;
      background: rgb(0 212 180 / 15%);
      border: 1px solid rgb(0 212 180 / 30%);
    }
  }

  .exp-meta {
    font-size: 11px;
    color: $text-muted;
  }

  .btn-sm-teal {
    padding: 4px 10px;
    font-size: 11px;
    color: $teal;
    cursor: pointer;
    background: transparent;
    border: 1px solid $teal;
    border-radius: 4px;

    &:hover {
      background: rgb(0 212 180 / 10%);
    }
  }

  .btn-sm-ghost {
    padding: 4px 10px;
    font-size: 11px;
    color: $text-secondary;
    cursor: pointer;
    background: transparent;
    border: 1px solid $border;
    border-radius: 4px;

    &:hover {
      border-color: #3d5570;
    }
  }

  // ─── Exp metrics ───
  .exp-metrics {
    display: flex;
    gap: 1px;
    background: $border;
    border-bottom: 1px solid $border;
  }

  .exp-metric {
    flex: 1;
    padding: 12px 14px;
    background: #091523;

    &-label {
      margin-bottom: 4px;
      font-size: 11px;
      color: $text-muted;
    }

    &-value {
      font-size: 20px;
      font-weight: 700;
      color: $text-primary;

      &.teal {
        color: $teal;
      }
    }

    &-value-roi {
      display: flex;
      gap: 8px;
      align-items: center;
      font-size: 20px;
      font-weight: 700;
    }
  }

  .roi-tag {
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 500;
    border-radius: 4px;

    &-meet {
      color: $teal;
      background: rgb(0 212 180 / 15%);
    }

    &-miss {
      color: $red;
      background: rgb(239 68 68 / 15%);
    }
  }

  // ─── Weekly summary ───
  .exp-weekly {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    padding: 8px 14px;
    font-size: 11px;
    background: #060e1a;
    border-bottom: 1px solid $border;

    .weekly-lbl {
      font-weight: 500;
      color: $text-secondary;
    }

    .weekly-item {
      color: $text-muted;

      strong {
        color: $text-primary;
      }
    }

    .weekly-sep {
      color: #2d3f54;
    }

    .teal {
      color: $teal;
    }
  }

  // ─── Sub tables ───
  .exp-sub-section {
    padding: 10px 14px;
    border-bottom: 1px solid $border;

    &:last-child {
      border-bottom: none;
    }
  }

  .exp-sub-title {
    margin-bottom: 8px;
    font-size: 11px;
    font-weight: 600;
    color: $text-muted;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .sub-table {
    width: 100%;
    font-size: 11px;
    border-collapse: collapse;

    th {
      padding: 5px 8px;
      font-weight: 500;
      color: $text-muted;
      text-align: left;
      white-space: nowrap;
      background: #060e1a;
      border-bottom: 1px solid $border;
    }

    td {
      padding: 6px 8px;
      color: $text-secondary;
      white-space: nowrap;
      border-bottom: 1px solid #0a1422;
    }

    tr:last-child td {
      border-bottom: none;
    }

    tr:hover td {
      background: #0d1829;
    }

    .roi-date-head {
      color: $teal;
      text-align: center;
      background: rgb(0 212 180 / 8%);
    }
  }

  .account-id {
    font-size: 10px;
    color: $text-muted;
  }

  .roi-badge {
    display: inline-block;
    min-width: 40px;
    padding: 1px 6px;
    font-size: 10px;
    font-weight: 600;
    text-align: center;
    border-radius: 4px;

    &.roi-green {
      color: #10b981;
      background: rgb(16 185 129 / 15%);
    }

    &.roi-teal {
      color: $teal;
      background: rgb(0 212 180 / 15%);
    }

    &.roi-yellow {
      color: $amber;
      background: rgb(245 158 11 / 15%);
    }

    &.roi-red {
      color: $red;
      background: rgb(239 68 68 / 15%);
    }
  }

  .row-red-tint td {
    background: rgb(239 68 68 / 4%);
  }

  .text-danger {
    color: $red !important;
  }

  .dim {
    color: $text-muted;
  }

  .link-action {
    font-size: 11px;
    color: $teal;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }

  .sub-footnote {
    padding-top: 6px;
    margin-top: 8px;
    font-size: 10px;
    color: #475569;
    border-top: 1px solid $border;
  }

  // ─── Campaign table ───
  .name-cell {
    max-width: 220px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .trend-arrow {
    margin-left: 2px;
    font-size: 11px;
  }

  // ─── Daily change ───
  .change-up {
    color: $teal;
  }

  .change-down {
    color: $red;
  }

  // ─── Total row ───
  .total-row {
    td {
      font-weight: 600;
      color: $text-primary;
      background: $bg-header;
      border-top: 1px solid $border;
    }
  }

  // ─── Sidebar charts ───
  .chart-block {
    padding: 10px 12px 8px;
    overflow: hidden;
    background: $bg-card;
    border: 1px solid $border;
    border-radius: 8px;
  }

  .chart-title {
    margin-bottom: 4px;
    font-size: 11px;
    font-weight: 600;
    color: $text-secondary;
  }

  .chart-area {
    width: 100%;
  }

  .donut-chart-block {
    overflow: visible;
  }
</style>
