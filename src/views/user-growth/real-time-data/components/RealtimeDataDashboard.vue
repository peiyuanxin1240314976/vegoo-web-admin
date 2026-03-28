<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
  import * as echarts from 'echarts'
  import AppDetailModal from './AppDetailModal.vue'
  import type { AppCard, AppDetailData } from '../types'
  import { useRealtimeDashboardMock } from '../composables/useRealtimeDashboardMock'

  defineOptions({ name: 'RealtimeDataDashboard' })

  const { apps, kpiData, bottomSeries } = useRealtimeDashboardMock()

  // ===== Modal =====
  const showModal = ref(false)
  const selectedApp = ref<AppDetailData | null>(null)

  function openDetail(app: AppCard) {
    selectedApp.value = app.detail
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
  const sparklineEls = ref<(HTMLDivElement | null)[]>(new Array(apps.value.length).fill(null))
  const sparklineInstances: echarts.ECharts[] = []

  function setSparkRef(el: unknown, idx: number) {
    sparklineEls.value[idx] = el as HTMLDivElement | null
  }

  function initSparklines() {
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

  const HOURS = ['0:00', '2:00', '4:00', '6:00', '8:00', '10:00', '12:00', '14:00']

  function initBottomChart() {
    if (!bottomChartEl.value) return
    bottomChart = echarts.init(bottomChartEl.value, null, { renderer: 'canvas' })
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
        data: HOURS,
        axisLine: { lineStyle: { color: '#1e2d42' } },
        axisLabel: { color: '#4a5a72', fontSize: 11 },
        axisTick: { show: false }
      },
      yAxis: [
        {
          type: 'value',
          min: 0,
          max: 1000,
          interval: 250,
          axisLabel: { color: '#4a5a72', fontSize: 11, formatter: (v: number) => `$${v}` },
          splitLine: { lineStyle: { color: '#151f30', type: 'dashed' } },
          axisLine: { show: false },
          axisTick: { show: false }
        },
        {
          type: 'value',
          min: 0,
          max: 150,
          interval: 50,
          axisLabel: { color: '#4a5a72', fontSize: 11, formatter: (v: number) => `${v}%` },
          splitLine: { show: false },
          axisLine: { show: false },
          axisTick: { show: false }
        }
      ],
      series: [
        {
          name: 'Weather5',
          type: 'bar',
          data: bottomSeries.weather5,
          itemStyle: { color: '#00cfc0', borderRadius: [2, 2, 0, 0] },
          barMaxWidth: 14
        },
        {
          name: 'PhoneTracker',
          type: 'bar',
          data: bottomSeries.phonetracker,
          itemStyle: { color: '#ffa040', borderRadius: [2, 2, 0, 0] },
          barMaxWidth: 14
        },
        {
          name: 'BloodSugar2',
          type: 'bar',
          data: bottomSeries.bloodsugar2,
          itemStyle: { color: '#4d9eff', borderRadius: [2, 2, 0, 0] },
          barMaxWidth: 14
        },
        {
          name: 'PhoneTracker2',
          type: 'bar',
          data: bottomSeries.phonetracker2,
          itemStyle: { color: '#a855f7', borderRadius: [2, 2, 0, 0] },
          barMaxWidth: 14
        },
        {
          name: 'ROI',
          type: 'line',
          yAxisIndex: 1,
          data: bottomSeries.roi,
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

  // ===== Lifecycle =====
  onMounted(async () => {
    await nextTick()
    initSparklines()
    initBottomChart()
    startCountdown()
    window.addEventListener('resize', onResize)
  })

  onBeforeUnmount(() => {
    if (countdownTimer) clearInterval(countdownTimer)
    sparklineInstances.forEach((c) => c.dispose())
    bottomChart?.dispose()
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
  <div class="dashboard">
    <!-- ===== Header ===== -->
    <div class="top-header">
      <div class="breadcrumb">
        <!-- <span class="bc-parent">用户增长</span>
        <span class="bc-sep">›</span>
        <span class="bc-current">实时数据</span> -->
        <div class="bc-subtitle">按需要调整匹配产品的最新广告投战数据</div>
      </div>
      <div class="header-actions">
        <span class="last-update">⏱ 最后更新：14:40:20</span>
        <button class="btn-refresh">↻ 手动刷新</button>
        <button class="btn-auto">⚙ 设置自动刷新</button>
      </div>
    </div>

    <!-- ===== Alert Banner ===== -->
    <div class="alert-banner">
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
    <div class="filter-bar">
      <div class="filter-group">
        <span class="filter-label">应用筛选：</span>
        <button class="filter-btn">全部应用 ▾</button>
      </div>
      <div class="filter-group">
        <span class="filter-label">渠道筛选：</span>
        <button class="filter-btn">全部渠道 ▾</button>
      </div>
      <!-- <div class="view-toggle">
        <span class="filter-label">显示方式：</span>
        <button class="toggle-btn active">⊞</button>
        <button class="toggle-btn">☰</button>
      </div> -->
    </div>

    <!-- ===== Summary KPI Cards ===== -->
    <div class="kpi-summary">
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
    <div class="app-grid">
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
    <div class="bottom-section">
      <div class="bottom-header">
        <span class="bottom-title">实时小时消耗趋势对比</span>
        <div class="legend-list">
          <span class="legend-item">
            <span class="legend-dot" style="background: #00cfc0"></span>Weather5
          </span>
          <span class="legend-item">
            <span class="legend-dot" style="background: #ffa040"></span>PhoneTracker
          </span>
          <span class="legend-item">
            <span class="legend-dot" style="background: #4d9eff"></span>BloodSugar2
          </span>
          <span class="legend-item">
            <span class="legend-dot" style="background: #a855f7"></span>PhoneTracker2
          </span>
        </div>
      </div>
      <div ref="bottomChartEl" class="bottom-chart"></div>
    </div>

    <!-- ===== Detail Modal ===== -->
    <AppDetailModal v-model="showModal" :app-data="selectedApp" />
  </div>
</template>

<style scoped>
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
    border-bottom: 1px solid #121c2e;
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
    padding: 5px 12px;
    font-size: 12px;
    color: #00cfc0;
    white-space: nowrap;
    cursor: pointer;
    background: #0e1a2e;
    border: 1px solid #1e3050;
    border-radius: 6px;
    transition: background 0.15s;
  }

  .btn-refresh:hover {
    background: #122040;
  }

  .btn-auto {
    padding: 5px 12px;
    font-size: 12px;
    color: #6b7a99;
    white-space: nowrap;
    cursor: pointer;
    background: none;
    border: 1px solid #1e2d42;
    border-radius: 6px;
    transition: background 0.15s;
  }

  .btn-auto:hover {
    background: #0e1525;
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

  /* ===== Filters ===== */
  .filter-bar {
    display: flex;
    gap: 20px;
    align-items: center;
    padding: 10px 24px;
    border-bottom: 1px solid #0e1525;
  }

  .filter-group {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .filter-label {
    font-size: 12px;
    color: #4a5a72;
  }

  .filter-btn {
    padding: 4px 12px;
    font-size: 12px;
    color: #c8d6e8;
    cursor: pointer;
    background: #0e1525;
    border: 1px solid #1a2840;
    border-radius: 5px;
    transition: border-color 0.15s;
  }

  .filter-btn:hover {
    border-color: #00cfc044;
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
    transition: all 0.15s;
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
    padding: 14px 18px;
    background: #0b1020;
    border: 1px solid #141e32;
    border-radius: 8px;
  }

  .warning-card {
    background: #130e00;
    border-color: #2a1e00;
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
    min-width: 0;
    padding: 12px 10px 10px;
    cursor: pointer;
    background: #0b1020;
    border: 1px solid #141e32;
    border-radius: 8px;
    transition:
      border-color 0.18s,
      transform 0.12s,
      box-shadow 0.18s;
  }

  .app-card:hover {
    border-color: #00cfc044;
    box-shadow: 0 6px 24px rgb(0 207 192 / 8%);
    transform: translateY(-1px);
  }

  .card-warning {
    background: #120a0c;
    border-color: #ff4d6a33;
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
    padding: 16px;
    margin: 16px 24px 0;
    background: #0b1020;
    border: 1px solid #141e32;
    border-radius: 8px;
  }

  .bottom-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .bottom-title {
    font-size: 13px;
    font-weight: 600;
    color: #c8d6e8;
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
</style>
