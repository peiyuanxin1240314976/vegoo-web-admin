<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
  import * as echarts from 'echarts'
  import AppPlatformSearchSelect from '@/components/filter/app-platform-search-select.vue'
  import AppDetailModal from './AppDetailModal.vue'
  import type { AppDetailData, RealtimeAppCardRow } from '../types'
  import { useRealtimeDashboard } from '../composables/useRealtimeDashboard'

  defineOptions({ name: 'RealtimeDataDashboard' })

  const {
    apps,
    kpiData,
    hourlyComparison,
    filterAppId,
    filterSourceUi,
    settingApps,
    sourceSelectOptions,
    filterOptionsLoading,
    dashboardLoading,
    loadFilterOptions,
    loadDashboard,
    loadAppDetail
  } = useRealtimeDashboard()

  // ===== Modal =====
  const showModal = ref(false)
  const selectedApp = ref<AppDetailData | null>(null)

  async function openDetail(app: RealtimeAppCardRow) {
    const detail = await loadAppDetail(app.id)
    if (!detail) return
    selectedApp.value = detail
    showModal.value = true
  }

  // ===== Countdown =====
  const nextRefreshDisplay = ref('15:10:23')
  let countdownSecs = 50 * 60
  let countdownTimer: ReturnType<typeof setInterval> | null = null

  function startCountdown() {
    countdownTimer = setInterval(() => {
      countdownSecs--
      if (countdownSecs < 0) countdownSecs = 50 * 60
      const m = Math.floor(countdownSecs / 60)
      const s = countdownSecs % 60
      nextRefreshDisplay.value = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    }, 1000)
  }

  // ===== Sparkline charts =====
  const sparklineEls = ref<(HTMLDivElement | null)[]>([])
  const sparklineInstances: echarts.ECharts[] = []

  watch(
    () => apps.value.length,
    (n) => {
      sparklineEls.value = new Array(Math.max(0, n)).fill(null)
    },
    { immediate: true }
  )

  function setSparkRef(el: unknown, idx: number) {
    sparklineEls.value[idx] = el as HTMLDivElement | null
  }

  function disposeSparklines() {
    sparklineInstances.forEach((c) => c.dispose())
    sparklineInstances.length = 0
  }

  function initSparklines() {
    disposeSparklines()
    apps.value.forEach((app, idx) => {
      const el = sparklineEls.value[idx]
      if (!el) return
      const chart = echarts.init(el, null, { renderer: 'canvas' })
      sparklineInstances.push(chart)
      chart.setOption({
        animation: false,
        grid: { top: 4, right: 0, bottom: 4, left: 0 },
        xAxis: { type: 'category', show: false },
        yAxis: { type: 'value', show: false },
        series: [
          {
            type: 'line',
            data: app.chartData,
            smooth: true,
            symbol: 'none',
            lineStyle: { color: app.chartColor, width: 1.8 },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: app.chartColor + '55' },
                { offset: 1, color: app.chartColor + '05' }
              ])
            }
          }
        ]
      })
    })
  }

  // ===== Bottom chart =====
  const bottomChartEl = ref<HTMLDivElement | null>(null)
  let bottomChart: echarts.ECharts | null = null

  function disposeBottomChart() {
    bottomChart?.dispose()
    bottomChart = null
  }

  function initBottomChart() {
    if (!bottomChartEl.value) return
    disposeBottomChart()
    bottomChart = echarts.init(bottomChartEl.value, null, { renderer: 'canvas' })
    const hc = hourlyComparison.value
    if (!hc?.series?.length) {
      bottomChart.setOption({
        backgroundColor: 'transparent',
        title: {
          text: '暂无数据',
          left: 'center',
          top: 'center',
          textStyle: { color: '#4a5a72', fontSize: 12 }
        }
      })
      return
    }

    const maxCost = Math.max(1, ...hc.series.flatMap((s) => s.costSeries))
    const yMax = Math.max(250, Math.ceil(maxCost / 250) * 250)
    const yInterval = Math.max(50, Math.round(yMax / 4))

    const roiVals = hc.roiPercentSeries ?? []
    const maxRoi = Math.max(100, ...roiVals, 1)
    const roiAxisMax = Math.ceil(maxRoi / 50) * 50
    const roiInterval = Math.max(25, Math.round(roiAxisMax / 4))

    const barSeries = hc.series.map((s) => ({
      name: s.name,
      type: 'bar' as const,
      data: s.costSeries,
      itemStyle: { color: s.color, borderRadius: [2, 2, 0, 0] },
      barMaxWidth: 14
    }))

    bottomChart.setOption({
      backgroundColor: 'transparent',
      animation: false,
      grid: { top: 16, right: 56, bottom: 28, left: 56 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#0a0f1e',
        borderColor: '#1e2d42',
        textStyle: { color: '#c8d6e8', fontSize: 12 }
      },
      xAxis: {
        type: 'category',
        data: hc.hourLabels,
        axisLine: { lineStyle: { color: '#1e2d42' } },
        axisLabel: { color: '#4a5a72', fontSize: 11 },
        axisTick: { show: false }
      },
      yAxis: [
        {
          type: 'value',
          min: 0,
          max: yMax,
          interval: yInterval,
          axisLabel: { color: '#4a5a72', fontSize: 11, formatter: (v: number) => `$${v}` },
          splitLine: { lineStyle: { color: '#151f30', type: 'dashed' } },
          axisLine: { show: false },
          axisTick: { show: false }
        },
        {
          type: 'value',
          min: 0,
          max: roiAxisMax,
          interval: roiInterval,
          axisLabel: { color: '#4a5a72', fontSize: 11, formatter: (v: number) => `${v}%` },
          splitLine: { show: false },
          axisLine: { show: false },
          axisTick: { show: false }
        }
      ],
      series: [
        ...barSeries,
        {
          name: 'ROI',
          type: 'line',
          yAxisIndex: 1,
          data: roiVals,
          smooth: true,
          symbol: 'circle',
          symbolSize: 4,
          lineStyle: { color: 'rgba(255,255,255,0.7)', width: 1.5, type: 'dashed' },
          itemStyle: { color: '#ffffff' }
        }
      ]
    })
  }

  // ===== Resize =====
  function onResize() {
    sparklineInstances.forEach((c) => c.resize())
    bottomChart?.resize()
  }

  /** 首屏骨架（测试体验用）；结束后与原先一致初始化图表 */
  const showContentSkeleton = ref(true)

  function normalizeFilterModels() {
    if (filterAppId.value == null || filterAppId.value === undefined) filterAppId.value = ''
    if (filterSourceUi.value == null || filterSourceUi.value === undefined) {
      filterSourceUi.value = ''
    }
  }

  async function applyFilters() {
    normalizeFilterModels()
    if (showContentSkeleton.value) return
    await loadDashboard()
    nextTick(() => {
      disposeSparklines()
      initSparklines()
      initBottomChart()
    })
  }

  async function onManualRefresh() {
    await applyFilters()
  }

  async function onQuery() {
    await applyFilters()
  }

  // ===== Lifecycle =====
  onMounted(() => {
    startCountdown()
    window.addEventListener('resize', onResize)
    void loadFilterOptions()
    window.setTimeout(() => {
      void (async () => {
        await loadDashboard()
        showContentSkeleton.value = false
        nextTick(() => {
          initSparklines()
          initBottomChart()
        })
      })()
    }, 520)
  })

  onBeforeUnmount(() => {
    if (countdownTimer) clearInterval(countdownTimer)
    disposeSparklines()
    disposeBottomChart()
    window.removeEventListener('resize', onResize)
  })

  // ===== Utils =====
  function fmtSpend(v: number): string {
    return v >= 100 ? `$${Math.round(v).toLocaleString('en-US')}` : `$${v.toFixed(2)}`
  }
  function fmtBigMoney(v: number): string {
    return `$${Math.round(v).toLocaleString('en-US')}`
  }
</script>

<template>
  <div class="dashboard dashboard--ap-fx art-full-height">
    <!-- ===== Header ===== -->
    <div class="top-header rtd-entry-1">
      <div class="breadcrumb">
        <!-- <span class="bc-parent">用户增长</span>
        <span class="bc-sep">›</span>
        <span class="bc-current">实时数据</span> -->
        <!-- <div class="bc-subtitle">按需要调整匹配产品的最新广告投战数据</div> -->
      </div>
      <div class="header-actions">
        <span class="last-update">⏱ 最后更新：14:40:20</span>
        <button type="button" class="btn-refresh" @click="onManualRefresh">↻ 手动刷新</button>
        <button class="btn-auto">⚙ 设置自动刷新</button>
      </div>
    </div>

    <!-- ===== Alert Banner ===== -->
    <div class="alert-banner rtd-entry-2">
      <div class="banner-left">
        <span class="banner-icon">⚠</span>
        <span class="banner-text"> 实时数据每 30 分钟自动更新一次，如需额外需新数据请点击 </span>
        <button class="banner-link">手动刷新</button>
        <span class="banner-shortcut">《快捷》</span>
      </div>
      <div class="banner-right">
        下次自动刷新：<span class="countdown">{{ nextRefreshDisplay }}</span>
      </div>
    </div>

    <!-- ===== Filters ===== -->
    <div class="filter-bar rtd-entry-3">
      <div class="rtd-filter-panel">
        <div class="filter-group rtd-filter-field">
          <span class="filter-label">应用筛选</span>
          <AppPlatformSearchSelect
            v-model="filterAppId"
            mode="app"
            class="rtd-filter-select"
            placeholder="全部应用"
            search-placeholder="搜索类别/应用名称/应用简称"
            :setting-apps="settingApps"
            :height="38"
            :min-width="200"
            :max-width="248"
            input-class="rtd-filter-select"
            dropdown-class="rtd-filter-select-popper"
          />
        </div>
        <div class="filter-group rtd-filter-field">
          <span class="filter-label">广告平台</span>
          <ElSelect
            v-model="filterSourceUi"
            class="rtd-filter-select"
            placeholder="全部广告平台"
            clearable
            filterable
            :loading="filterOptionsLoading"
            popper-class="rtd-filter-select-popper"
          >
            <ElOption
              v-for="opt in sourceSelectOptions"
              :key="'src-' + (opt.value || 'all')"
              :label="opt.label"
              :value="opt.value"
            />
          </ElSelect>
        </div>
        <button type="button" class="filter-btn" @click="onQuery">查询</button>
      </div>
    </div>

    <template v-if="showContentSkeleton">
      <!-- ===== Skeleton：KPI / 卡片栅格 / 底部图 ===== -->
      <div class="kpi-summary rtd-skel-kpi">
        <div v-for="s in 4" :key="`sk-${s}`" class="summary-card rtd-skel-block">
          <ElSkeleton animated>
            <template #template>
              <ElSkeletonItem variant="text" style="width: 42%; margin-bottom: 14px" />
              <ElSkeletonItem
                variant="text"
                style="width: 68%; height: 28px; margin-bottom: 10px"
              />
              <ElSkeletonItem variant="text" style="width: 52%" />
            </template>
          </ElSkeleton>
        </div>
      </div>
      <div class="app-grid rtd-skel-grid">
        <div v-for="s in 7" :key="`sg-${s}`" class="app-card rtd-skel-block">
          <ElSkeleton animated>
            <template #template>
              <ElSkeletonItem variant="text" style="width: 55%; margin-bottom: 12px" />
              <ElSkeletonItem variant="text" style="width: 100%; margin-bottom: 8px" />
              <ElSkeletonItem variant="text" style="width: 88%; margin-bottom: 8px" />
              <ElSkeletonItem variant="text" style="width: 72%; margin-bottom: 10px" />
              <ElSkeletonItem
                variant="rect"
                style="width: 100%; height: 48px; margin-bottom: 8px"
              />
              <ElSkeletonItem variant="text" style="width: 40%" />
            </template>
          </ElSkeleton>
        </div>
      </div>
      <div class="bottom-section rtd-skel-bottom rtd-entry-6">
        <div class="bottom-header">
          <span class="bottom-title">实时小时消耗趋势对比</span>
        </div>
        <ElSkeleton animated>
          <template #template>
            <ElSkeletonItem variant="rect" style="width: 100%; height: 200px" />
          </template>
        </ElSkeleton>
      </div>
    </template>
    <template v-else>
      <!-- ===== Summary KPI Cards ===== -->
      <div class="kpi-summary rtd-entry-4">
        <div class="summary-card">
          <div class="sum-label">在线应用数</div>
          <div class="sum-value">{{ kpiData.onlineApps }} <span class="sum-unit">个</span></div>
          <div class="sum-sub">共 {{ kpiData.totalApps }} 个应用</div>
        </div>
        <div class="summary-card">
          <div class="sum-label">全应用今日花费</div>
          <div class="sum-value">{{ fmtBigMoney(kpiData.todaySpend) }}</div>
          <div class="sum-sub">
            周环比
            <span class="sum-up">{{ kpiData.spendChange }} ↑</span>
          </div>
        </div>
        <div class="summary-card">
          <div class="sum-label">全应用实时ROI均值</div>
          <div class="sum-value green-text">{{ kpiData.roiAvg }}%</div>
          <div class="sum-sub">
            达标线 {{ kpiData.roiTarget }}%
            <span class="badge-reach">达标</span>
          </div>
        </div>
        <div class="summary-card warning-card">
          <div class="sum-label">预警应用</div>
          <div class="sum-value orange-text"
            >{{ kpiData.warningApps }} <span class="sum-unit">个</span></div
          >
          <div class="sum-sub">
            <span class="warn-tag">超预算</span>
            <span class="mx4">/</span>
            <span class="warn-tag">低活跃</span>
          </div>
        </div>
      </div>

      <!-- ===== App Cards Grid ===== -->
      <div v-loading="dashboardLoading" class="app-grid rtd-entry-5">
        <div
          v-for="(app, idx) in apps"
          :key="app.id"
          class="app-card"
          :class="{ 'card-warning': app.hasWarning && app.roi < 80 }"
          @click="openDetail(app)"
        >
          <!-- Card Header -->
          <div class="card-header">
            <div class="card-title">
              <span class="app-icon-small" :style="{ background: app.iconBg }">
                {{ app.iconText }}
              </span>
              <span class="app-name">{{ app.name }}</span>
            </div>
            <div class="card-badges">
              <span v-if="app.hasWarning && app.warningBadge" class="badge-warn">{{
                app.warningBadge
              }}</span>
              <span class="badge-status" :class="app.isLive ? 'badge-live' : 'badge-launch'">
                <span v-if="app.isLive" class="live-dot"></span>
                {{ app.launchLabel }} ›
              </span>
            </div>
          </div>

          <!-- Spend & Installs -->
          <div class="card-row2">
            <div class="cr-block">
              <div class="cr-label">今日花费</div>
              <div class="cr-value">
                {{ fmtSpend(app.spend) }}
                <span
                  v-if="app.spendChange"
                  class="change"
                  :class="app.spendUp ? 'chg-up' : 'chg-dn'"
                >
                  {{ app.spendUp ? '↑' : '↓' }}{{ app.spendChange }}
                </span>
              </div>
            </div>
            <div class="cr-block cr-right">
              <div class="cr-label">今日安装</div>
              <div class="cr-value">{{ app.installs.toLocaleString() }}</div>
            </div>
          </div>

          <!-- CPI & Active -->
          <div class="card-row3">
            <div class="cr-block">
              <div class="cr-label">实时CPI</div>
              <div class="cr-value cpi-val">
                ${{ app.cpi.toFixed(2) }}
                <span v-if="app.cpiChange" class="change" :class="app.cpiUp ? 'chg-up' : 'chg-dn'"
                  >{{ app.cpiUp ? '↑' : '↓' }}{{ app.cpiChange }}</span
                >
              </div>
            </div>
            <div class="cr-block cr-right">
              <div class="cr-label">活跃系列</div>
              <div class="cr-value">{{ app.activeSeries }} 个</div>
            </div>
          </div>

          <!-- Sparkline -->
          <div :ref="(el) => setSparkRef(el, idx)" class="sparkline"></div>

          <!-- ROI Footer -->
          <div class="card-footer">
            <div class="roi-block">
              <div class="roi-label">当前量目ROI</div>
              <div class="roi-val" :style="{ color: app.roiColor }">{{ app.roi }}%</div>
            </div>
            <div class="action-tag" :class="`tag-${app.actionTagType}`">
              {{ app.actionTag }}
            </div>
          </div>
        </div>
      </div>

      <!-- ===== Bottom Chart ===== -->
      <div class="bottom-section rtd-entry-6">
        <div class="bottom-header">
          <span class="bottom-title">实时小时消耗趋势对比</span>
          <div class="legend-list">
            <span v-for="s in hourlyComparison?.series ?? []" :key="s.s_app_id" class="legend-item">
              <span class="legend-dot" :style="{ background: s.color }"></span>{{ s.name }}
            </span>
          </div>
        </div>
        <div ref="bottomChartEl" class="bottom-chart"></div>
      </div>
    </template>

    <!-- ===== Detail Modal ===== -->
    <AppDetailModal v-model="showModal" :app-data="selectedApp" />
  </div>
</template>

<style scoped lang="scss">
  @use '../../ad-performance/styles/ap-card-fx.scss' as ap;

  /* ===== Root（极光 + 网格，对齐广告成效底氛围） ===== */
  .dashboard--ap-fx {
    position: relative;
    overflow-x: clip;
    background: #07090f;
    isolation: isolate;

    &::before {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      content: '';
      background:
        radial-gradient(ellipse 68% 48% at 8% 8%, rgb(16 185 129 / 28%) 0%, transparent 58%),
        radial-gradient(ellipse 52% 40% at 92% 10%, rgb(59 130 246 / 30%) 0%, transparent 55%),
        radial-gradient(ellipse 38% 32% at 50% 18%, rgb(168 85 247 / 12%) 0%, transparent 52%);
      mask-image: linear-gradient(to bottom, black 0%, black 36%, transparent 68%);
      animation: rtd-aurora-drift 14s ease-in-out infinite alternate;
    }

    &::after {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      content: '';
      background-image:
        linear-gradient(rgb(186 230 253 / 4%) 1px, transparent 1px),
        linear-gradient(90deg, rgb(186 230 253 / 4%) 1px, transparent 1px);
      background-size: 36px 36px;
      mask-image: linear-gradient(to bottom, black 0%, black 24%, transparent 52%);
    }

    > * {
      position: relative;
      z-index: 1;
    }
  }

  @keyframes rtd-aurora-drift {
    0% {
      opacity: 0.72;
      transform: scale(1) translate(0, 0);
    }

    100% {
      opacity: 1;
      transform: scale(1.03) translate(0.8%, -0.6%);
    }
  }

  @keyframes rtd-slide-up {
    from {
      opacity: 0;
      transform: translateY(16px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes rtd-skeleton-orbit {
    0%,
    100% {
      box-shadow:
        0 0 0 1px rgb(96 165 250 / 14%),
        0 0 20px rgb(16 185 129 / 8%);
    }

    50% {
      box-shadow:
        0 0 0 1px rgb(96 165 250 / 32%),
        0 0 36px rgb(59 130 246 / 14%),
        0 0 56px rgb(16 185 129 / 10%);
    }
  }

  .rtd-entry-1 {
    animation: rtd-slide-up 0.52s cubic-bezier(0, 0, 0.2, 1) both;
    animation-delay: 0.03s;
  }

  .rtd-entry-2 {
    animation: rtd-slide-up 0.54s cubic-bezier(0, 0, 0.2, 1) both;
    animation-delay: 0.08s;
  }

  .rtd-entry-3 {
    animation: rtd-slide-up 0.56s cubic-bezier(0, 0, 0.2, 1) both;
    animation-delay: 0.12s;
  }

  .rtd-entry-4 {
    animation: rtd-slide-up 0.56s cubic-bezier(0, 0, 0.2, 1) both;
    animation-delay: 0.06s;
  }

  .rtd-entry-5 {
    animation: rtd-slide-up 0.58s cubic-bezier(0, 0, 0.2, 1) both;
    animation-delay: 0.1s;
  }

  .rtd-entry-6 {
    animation: rtd-slide-up 0.6s cubic-bezier(0, 0, 0.2, 1) both;
    animation-delay: 0.12s;
  }

  .rtd-skel-block {
    animation: rtd-skeleton-orbit 2.5s ease-in-out infinite;
  }

  .rtd-skel-block:nth-child(odd) {
    animation-delay: 0.1s;
  }

  /* ===== Root ===== */
  .dashboard {
    box-sizing: border-box;
    min-height: 100vh;
    padding: 0 0 40px;
    font-family: 'PingFang SC', 'Segoe UI', system-ui, sans-serif;
    color: #c8d6e8;
    background: #07090f;
  }

  /* ===== Header ===== */
  .top-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 18px 24px 10px;
    border-bottom: 1px solid rgb(96 165 250 / 16%);
  }

  .breadcrumb {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: baseline;
  }

  /* .bc-parent {
    font-size: 17px;
    font-weight: 500;
    color: #6b7a99;
  }

  .bc-sep {
    font-size: 16px;
    color: #3a4a62;
  }

  .bc-current {
    font-size: 17px;
    font-weight: 700;
    color: #e2ebf8;
  } */

  .bc-subtitle {
    width: 100%;
    margin-top: 2px;
    font-size: 12px;
    color: #3a4a62;
    letter-spacing: 0.01em;
  }

  .header-actions {
    display: flex;
    flex-shrink: 0;
    gap: 10px;
    align-items: center;
  }

  .last-update {
    font-size: 12px;
    color: #4a5a72;
    white-space: nowrap;
  }

  .btn-refresh {
    padding: 6px 14px;
    font-size: 12px;
    font-weight: 500;
    color: #10b981;
    white-space: nowrap;
    cursor: pointer;
    background: rgb(16 185 129 / 8%);
    border: 1px solid rgb(16 185 129 / 38%);
    border-radius: 9999px;
    box-shadow: 0 0 12px rgb(16 185 129 / 10%);
    transition:
      background 0.2s ease,
      border-color 0.2s ease,
      box-shadow 0.2s ease;
  }

  .btn-refresh:hover {
    background: rgb(16 185 129 / 16%);
    border-color: #10b981;
    box-shadow: 0 0 20px rgb(16 185 129 / 22%);
  }

  .btn-auto {
    padding: 6px 14px;
    font-size: 12px;
    color: #94a3b8;
    white-space: nowrap;
    cursor: pointer;
    background: rgb(255 255 255 / 4%);
    border: 1px solid rgb(96 165 250 / 22%);
    border-radius: 9999px;
    transition:
      background 0.2s ease,
      border-color 0.2s ease;
  }

  .btn-auto:hover {
    background: rgb(255 255 255 / 7%);
    border-color: rgb(96 165 250 / 38%);
  }

  /* ===== Alert Banner ===== */
  .alert-banner {
    display: flex;
    gap: 20px;
    align-items: center;
    justify-content: space-between;
    padding: 9px 24px;
    font-size: 12px;
    background: #1a1200;
    border-top: 1px solid #3a2a00;
    border-bottom: 1px solid #3a2a00;
  }

  .banner-left {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  .banner-icon {
    font-size: 13px;
    color: #f0b429;
  }

  .banner-text {
    color: #a08030;
  }

  .banner-link {
    padding: 0;
    font-size: 12px;
    color: #00cfc0;
    text-decoration: underline;
    cursor: pointer;
    background: none;
    border: none;
  }

  .banner-shortcut {
    color: #6b7a99;
  }

  .banner-right {
    flex-shrink: 0;
    color: #6b7a99;
    white-space: nowrap;
  }

  .countdown {
    margin-left: 4px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: #e2ebf8;
  }

  /* ===== Filters（与顶栏霓虹面板一致：主色描边 + 胶囊选择器） ===== */
  .filter-bar {
    padding: 12px 24px 18px;
    background: linear-gradient(180deg, rgb(59 130 246 / 5%) 0%, rgb(59 130 246 / 0%) 100%);
    border-bottom: 1px solid rgb(96 165 250 / 12%);
  }

  .rtd-filter-panel {
    display: flex;
    flex-wrap: wrap;
    gap: 14px 8px;
    align-items: stretch;
    padding: 14px 20px;
    overflow: hidden;
    border: 1px solid rgb(96 165 250 / 18%);
    border-radius: 16px;

    @include ap.ap-neon-bg;
    @include ap.ap-card-mesh;

    transition:
      border-color var(--duration-normal, 250ms) var(--ease-default, cubic-bezier(0.4, 0, 0.2, 1)),
      box-shadow var(--duration-normal, 250ms) var(--ease-default, cubic-bezier(0.4, 0, 0.2, 1));

    &:hover {
      border-color: rgb(96 165 250 / 42%);
      box-shadow:
        0 12px 40px rgb(0 0 0 / 44%),
        0 0 0 1px rgb(96 165 250 / 22%),
        inset 0 1px 0 rgb(186 230 253 / 14%),
        0 0 40px rgb(59 130 246 / 12%);
    }

    .filter-group {
      position: relative;
      z-index: 1;
    }
  }

  .filter-group {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .rtd-filter-field {
    gap: 12px;
    align-items: center;
    min-height: 40px;

    & + .rtd-filter-field {
      padding-left: 22px;
      margin-left: 6px;
      border-left: 1px solid rgb(96 165 250 / 14%);
    }

    @media (width <= 640px) {
      & + .rtd-filter-field {
        padding-left: 0;
        margin-left: 0;
        border-left: none;
      }
    }
  }

  .filter-label {
    position: relative;
    flex-shrink: 0;
    padding-left: 11px;
    font-size: 12px;
    font-weight: 600;
    line-height: 1.3;
    color: var(--text-secondary, #94a3b8);
    letter-spacing: 0.02em;

    &::before {
      position: absolute;
      top: 50%;
      left: 0;
      width: 3px;
      height: 14px;
      content: '';
      background: linear-gradient(
        180deg,
        var(--art-primary, #3b82f6) 0%,
        rgb(34 211 238 / 88%) 100%
      );
      border-radius: 2px;
      box-shadow: 0 0 10px rgb(59 130 246 / 45%);
      transform: translateY(-50%);
    }
  }

  .filter-btn {
    min-height: 36px;
    padding: 6px 16px;
    font-size: 12px;
    font-weight: 500;
    color: var(--theme-color, var(--art-primary, #3b82f6));
    cursor: pointer;
    background: color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 6%, transparent);
    border: 1px solid var(--theme-color, var(--art-primary, #3b82f6));
    border-radius: var(--el-border-radius-base, 4px);
    box-shadow: none;
    transition:
      border-color 0.22s ease,
      box-shadow 0.22s ease,
      background 0.22s ease;
  }

  .filter-btn:hover {
    background: color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 6%, transparent);
    border-color: var(--theme-color, var(--art-primary, #3b82f6));
    box-shadow: 0 0 14px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 16%, transparent);
  }

  .rtd-filter-select {
    flex: 1;
    width: min(248px, 100%);
    min-width: min(200px, 100%);

    :deep(.app-platform-search-select) {
      color: var(--text-primary, #e2e8f0);
      background: color-mix(
        in srgb,
        var(--theme-color, var(--art-primary, #3b82f6)) 6%,
        transparent
      ) !important;
      border: 1px solid var(--theme-color, var(--art-primary, #3b82f6));
      border-radius: var(--el-border-radius-base, 4px);
      box-shadow: none;
      transition:
        border-color var(--duration-fast, 150ms) var(--ease-default, cubic-bezier(0.4, 0, 0.2, 1)),
        box-shadow var(--duration-fast, 150ms) var(--ease-default, cubic-bezier(0.4, 0, 0.2, 1)),
        background var(--duration-fast, 150ms) var(--ease-default, cubic-bezier(0.4, 0, 0.2, 1));
    }

    :deep(.app-platform-search-select:hover) {
      border-color: var(--theme-color, var(--art-primary, #3b82f6));
      box-shadow: 0 0 0 1px
        color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 14%, transparent);
    }

    :deep(.app-platform-search-select.is-open) {
      background: color-mix(
        in srgb,
        var(--theme-color, var(--art-primary, #3b82f6)) 6%,
        transparent
      ) !important;
      border-color: var(--theme-color, var(--art-primary, #3b82f6));
      box-shadow: 0 0 0 2px
        color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 18%, transparent);
    }

    :deep(.app-platform-search-select__text) {
      font-size: 12px;
      font-weight: 500;
      color: var(--text-primary, #e2e8f0);
    }

    :deep(.app-platform-search-select__text.is-placeholder) {
      color: var(--text-tertiary, #64748b);
    }

    :deep(.app-platform-search-select__suffix) {
      color: var(--theme-color, var(--art-primary, #3b82f6));
    }

    :deep(.el-select__wrapper) {
      min-height: 38px;
      padding: 5px 14px 5px 16px;
      background: color-mix(
        in srgb,
        var(--theme-color, var(--art-primary, #3b82f6)) 6%,
        transparent
      );
      border: 1px solid var(--theme-color, var(--art-primary, #3b82f6));
      border-radius: var(--el-border-radius-base, 4px);
      box-shadow: none;
      transition:
        border-color var(--duration-fast, 150ms) var(--ease-default, cubic-bezier(0.4, 0, 0.2, 1)),
        box-shadow var(--duration-fast, 150ms) var(--ease-default, cubic-bezier(0.4, 0, 0.2, 1)),
        background var(--duration-fast, 150ms) var(--ease-default, cubic-bezier(0.4, 0, 0.2, 1));
    }

    :deep(.el-select__wrapper:hover) {
      border-color: var(--theme-color, var(--art-primary, #3b82f6));
      box-shadow: 0 0 0 1px
        color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 14%, transparent);
    }

    :deep(.el-select__wrapper.is-focused) {
      background: color-mix(
        in srgb,
        var(--theme-color, var(--art-primary, #3b82f6)) 6%,
        transparent
      );
      border-color: var(--theme-color, var(--art-primary, #3b82f6));
      box-shadow: 0 0 0 2px
        color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 18%, transparent);
    }

    :deep(.el-select__placeholder) {
      font-size: 12px;
      font-weight: 500;
      color: var(--text-tertiary, #64748b);
    }

    :deep(.el-select__selected-item) {
      font-size: 12px;
      font-weight: 500;
      color: var(--text-primary, #e2e8f0);
    }

    :deep(.el-select__caret) {
      color: var(--theme-color, var(--art-primary, #3b82f6));
    }

    :deep(.el-select__suffix) {
      color: var(--theme-color, var(--art-primary, #3b82f6));
    }

    :deep(.el-icon.el-select__loading) {
      color: var(--theme-color, var(--art-primary, #3b82f6));
    }
  }

  .view-toggle {
    display: flex;
    gap: 4px;
    align-items: center;
    margin-left: auto;
  }

  .toggle-btn {
    padding: 3px 8px;
    font-size: 13px;
    color: #4a5a72;
    cursor: pointer;
    background: none;
    border: 1px solid #1a2840;
    border-radius: 4px;
    transition:
      color 0.15s ease,
      background 0.15s ease,
      border-color 0.15s ease,
      box-shadow 0.15s ease;
  }

  .toggle-btn.active {
    color: #00cfc0;
    background: #0e1f35;
    border-color: #00cfc044;
  }

  /* ===== Summary KPI Cards ===== */
  .kpi-summary {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    padding: 16px 24px;
    border-bottom: 1px solid #0e1525;
  }

  .summary-card {
    position: relative;
    padding: 14px 18px;
    overflow: hidden;
    border: 2px solid transparent;
    border-radius: 12px;

    @include ap.ap-neon-bg;
    @include ap.ap-card-mesh;
    @include ap.ap-panel-hover;

    transition:
      box-shadow 0.42s var(--ease-out),
      border-color 0.32s var(--ease-default),
      filter 0.32s var(--ease-default);

    &:hover,
    &:active {
      transform: none !important;
    }
  }

  .summary-card > * {
    position: relative;
    z-index: 1;
  }

  .warning-card {
    background: linear-gradient(155deg, rgb(40 22 8 / 95%), rgb(18 12 4 / 98%));
    border-color: rgb(245 158 11 / 35%);
    box-shadow:
      0 12px 40px rgb(0 0 0 / 45%),
      0 0 0 1px rgb(251 191 36 / 12%),
      inset 0 1px 0 rgb(254 243 199 / 8%);
  }

  .sum-label {
    margin-bottom: 6px;
    font-size: 11px;
    color: #4a5a72;
  }

  .sum-value {
    margin-bottom: 6px;
    font-size: 26px;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
    line-height: 1.1;
    color: #e2ebf8;
  }

  .sum-unit {
    font-size: 16px;
    font-weight: 500;
    color: #8892aa;
  }

  .sum-sub {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 11px;
    color: #4a5a72;
  }

  .sum-up {
    font-weight: 600;
    color: #22c55e;
  }

  .green-text {
    color: #00d68f !important;
  }

  .orange-text {
    color: #ffa040 !important;
  }

  .badge-reach {
    padding: 1px 6px;
    font-size: 10px;
    font-weight: 600;
    color: #00d68f;
    background: #003d20;
    border-radius: 3px;
  }

  .warn-tag {
    font-size: 11px;
    color: #ffa040;
  }

  .mx4 {
    margin: 0 2px;
  }

  /* ===== App Cards Grid ===== */
  .app-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 10px;
    padding: 16px 24px;
    border-bottom: 1px solid #0e1525;
  }

  @media (width <= 1400px) {
    .app-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  @media (width <= 900px) {
    .app-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .app-card {
    position: relative;
    min-width: 0;
    padding: 12px 10px 10px;
    overflow: hidden;
    cursor: pointer;
    border: 2px solid transparent;
    border-radius: 12px;

    @include ap.ap-neon-bg;
    @include ap.ap-card-mesh;
    @include ap.ap-panel-hover;

    transition:
      box-shadow 0.42s var(--ease-out),
      border-color 0.32s var(--ease-default),
      filter 0.32s var(--ease-default);

    &:hover,
    &:active {
      transform: none !important;
    }
  }

  .app-card > * {
    position: relative;
    z-index: 1;
  }

  .card-warning {
    background: linear-gradient(160deg, rgb(45 12 18 / 92%), rgb(12 8 10 / 96%));
    border-color: rgb(244 63 94 / 35%);
  }

  /* Card Header */
  .card-header {
    display: flex;
    gap: 4px;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .card-title {
    display: flex;
    gap: 6px;
    align-items: center;
    min-width: 0;
  }

  .app-icon-small {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    font-size: 11px;
    border-radius: 5px;
  }

  .app-name {
    overflow: hidden;
    font-size: 12px;
    font-weight: 700;
    color: #c8d6e8;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .card-badges {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    gap: 3px;
    align-items: flex-end;
  }

  .badge-warn {
    padding: 1px 5px;
    font-size: 9px;
    font-weight: 600;
    color: #ff4d6a;
    background: #ff4d6a22;
    border-radius: 3px;
  }

  .badge-status {
    display: flex;
    gap: 3px;
    align-items: center;
    padding: 1px 6px;
    font-size: 10px;
    font-weight: 500;
    cursor: pointer;
    border-radius: 3px;
  }

  .badge-live {
    color: #00d68f;
    background: #003a25;
    border: 1px solid #00d68f33;
  }

  .badge-launch {
    color: #6b7a99;
    background: #0e1a2e;
    border: 1px solid #1e2d42;
  }

  .live-dot {
    width: 5px;
    height: 5px;
    background: #00d68f;
    border-radius: 50%;
    animation: pulse 1.6s infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }

    50% {
      opacity: 0.4;
    }
  }

  /* Card rows */
  .card-row2,
  .card-row3 {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;
  }

  .cr-block {
    min-width: 0;
  }

  .cr-right {
    text-align: right;
  }

  .cr-label {
    margin-bottom: 2px;
    font-size: 9px;
    color: #3a4a62;
  }

  .cr-value {
    display: flex;
    flex-wrap: wrap;
    gap: 3px;
    align-items: baseline;
    font-size: 13px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: #c8d6e8;
  }

  .cr-right .cr-value {
    justify-content: flex-end;
  }

  .cpi-val {
    color: #00cfc0;
  }

  .change {
    font-size: 9px;
    font-weight: 600;
  }

  .chg-up {
    color: #22c55e;
  }

  .chg-dn {
    color: #00cfc0;
  }

  /* Sparkline */
  .sparkline {
    width: 100%;
    height: 52px;
    margin: 4px 0 2px;
  }

  /* Card Footer */
  .card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 4px;
  }

  .roi-block {
    min-width: 0;
  }

  .roi-label {
    font-size: 9px;
    color: #3a4a62;
  }

  .roi-val {
    font-size: 16px;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
  }

  .action-tag {
    padding: 2px 8px;
    font-size: 10px;
    font-weight: 600;
    border-radius: 4px;
  }

  .tag-cyan {
    color: #00cfc0;
    background: #003d3a;
    border: 1px solid #00cfc033;
  }

  .tag-orange {
    color: #ffa040;
    background: #3a1e00;
    border: 1px solid #ffa04033;
  }

  .tag-gray {
    color: #4a5a72;
    background: #0e1525;
    border: 1px solid #1a2840;
  }

  .tag-red {
    color: #ff4d6a;
    background: #3a0010;
    border: 1px solid #ff4d6a33;
  }

  /* ===== Bottom Chart ===== */
  .bottom-section {
    position: relative;
    padding: 16px;
    margin: 16px 24px 0;
    overflow: hidden;
    border: 2px solid transparent;
    border-radius: 12px;

    @include ap.ap-neon-bg;
    @include ap.ap-card-mesh;
    @include ap.ap-panel-hover;

    transition:
      box-shadow 0.42s var(--ease-out),
      border-color 0.32s var(--ease-default),
      filter 0.32s var(--ease-default);

    &:hover,
    &:active {
      transform: none !important;
    }
  }

  .bottom-section > * {
    position: relative;
    z-index: 1;
  }

  .bottom-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .bottom-title {
    font-size: 13px;
    font-weight: 700;

    @include ap.ap-title-gradient;
  }

  .legend-list {
    display: flex;
    gap: 16px;
  }

  .legend-item {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 11px;
    color: #6b7a99;
  }

  .legend-dot {
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    border-radius: 2px;
  }

  .bottom-chart {
    width: 100%;
    height: 200px;
  }

  @media (prefers-reduced-motion: reduce) {
    .dashboard--ap-fx::before {
      animation: none;
    }

    .rtd-entry-1,
    .rtd-entry-2,
    .rtd-entry-3,
    .rtd-entry-4,
    .rtd-entry-5,
    .rtd-entry-6 {
      opacity: 1;
      transform: none;
      animation: none;
    }

    .rtd-skel-block {
      animation: none;
    }

    .summary-card:hover,
    .summary-card:active,
    .app-card:hover,
    .app-card:active,
    .bottom-section:hover,
    .bottom-section:active {
      transform: none;
    }

    .btn-refresh:hover,
    .btn-auto:hover,
    .filter-btn:hover {
      transform: none;
    }

    .live-dot {
      animation: none;
    }
  }
</style>

<!-- 下拉挂到 body，须单独块（与实时数据筛选视觉一致） -->
<style lang="scss">
  .rtd-filter-select-popper.el-select__popper {
    overflow: hidden;
    background: rgb(15 23 42 / 96%) !important;
    backdrop-filter: blur(10px);
    border: 1px solid rgb(96 165 250 / 28%) !important;
    border-radius: 14px !important;
    box-shadow:
      0 20px 50px rgb(0 0 0 / 48%),
      0 0 0 1px rgb(96 165 250 / 12%),
      inset 0 1px 0 rgb(255 255 255 / 5%) !important;
  }

  .rtd-filter-select-popper .el-select-dropdown__list {
    padding: 6px;
  }

  .rtd-filter-select-popper .el-select-dropdown__item {
    margin: 2px 0;
    font-size: 13px;
    line-height: 1.4;
    color: #cbd5e1;
    border-radius: 10px;
    transition:
      background 0.15s ease,
      color 0.15s ease;
  }

  .rtd-filter-select-popper .el-select-dropdown__item:hover {
    color: #f1f5f9;
    background: rgb(59 130 246 / 14%);
  }

  .rtd-filter-select-popper .el-select-dropdown__item.is-selected {
    font-weight: 600;
    color: #fff;
    background: rgb(59 130 246 / 22%);
  }

  .rtd-filter-select-popper .el-select-dropdown__item.is-hovering {
    background: rgb(59 130 246 / 12%);
  }

  .rtd-filter-select-popper .app-platform-search-select__panel {
    color: #cbd5e1;
  }

  .rtd-filter-select-popper .app-platform-search-select__header {
    color: #6b7a99;
  }

  .rtd-filter-select-popper .app-platform-search-select__row:hover,
  .rtd-filter-select-popper .app-platform-search-select__row.is-active {
    background: color-mix(
      in srgb,
      var(--theme-color, var(--art-primary, #3b82f6)) 14%,
      transparent
    );
  }

  @media (prefers-reduced-motion: reduce) {
    .rtd-filter-select-popper .el-select-dropdown__item {
      transition: none;
    }
  }
</style>
