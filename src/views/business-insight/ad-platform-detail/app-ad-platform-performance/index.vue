<template>
  <div class="admob-dashboard">
    <!-- 顶部导航栏 -->
    <div class="top-nav">
      <button class="back-btn" @click="$emit('back')">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="7.5" stroke="currentColor" stroke-opacity="0.4" />
          <path
            d="M9.5 5L6.5 8L9.5 11"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        返回
      </button>
      <div class="breadcrumb">
        <span>变现分析</span>
        <span class="sep">/</span>
        <span>AdMob 表现详情</span>
        <span class="sep">/</span>
        <span class="active">Weather8</span>
      </div>
    </div>

    <!-- 页面标题 + 筛选器 -->
    <div class="page-header">
      <h1 class="page-title">AdMob在Weather 8 中的表现详情</h1>
      <div class="filters">
        <div class="filter-item">
          <span class="filter-label">日期范围</span>
          <el-select v-model="dateRange" class="custom-select" style="width: 220px">
            <el-option label="2025年12月01日 - 2025年12月31日" value="2025-12" />
            <el-option label="2025年11月01日 - 2025年11月30日" value="2025-11" />
            <el-option label="2025年10月01日 - 2025年10月31日" value="2025-10" />
          </el-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">国家</span>
          <el-select v-model="country" class="custom-select" style="width: 130px">
            <el-option label="全部国家" value="all" />
            <el-option label="中国" value="cn" />
            <el-option label="美国" value="us" />
            <el-option label="日本" value="jp" />
          </el-select>
        </div>
      </div>
    </div>

    <!-- 主体内容：左右分栏 -->
    <div class="main-layout">
      <!-- 左侧主内容 -->
      <div class="left-panel">
        <!-- KPI 卡片区 -->
        <div class="kpi-grid">
          <!-- 收入卡片 -->
          <div
            class="kpi-card kpi-revenue"
            :class="{ 'is-active': activeKpi === 'revenue' }"
            @click="activeKpi = 'revenue'"
          >
            <div class="kpi-bg-glow revenue-glow" />
            <div class="kpi-label">收入</div>
            <div class="kpi-value revenue-value">
              <span class="kpi-number" ref="revenueEl">$937.5K</span>
            </div>
            <div class="kpi-sparkline">
              <svg viewBox="0 0 80 24" fill="none" preserveAspectRatio="none">
                <polyline
                  points="0,20 10,14 20,18 30,8 40,12 50,6 60,10 70,4 80,8"
                  stroke="#f59e0b"
                  stroke-width="1.5"
                  fill="none"
                  opacity="0.8"
                />
              </svg>
            </div>
          </div>

          <!-- eCPM 卡片 -->
          <div
            class="kpi-card kpi-ecpm"
            :class="{ 'is-active': activeKpi === 'ecpm' }"
            @click="activeKpi = 'ecpm'"
          >
            <div class="kpi-bg-glow ecpm-glow" />
            <div class="kpi-label">eCPM</div>
            <div class="kpi-value ecpm-value">
              <span class="kpi-number">¥3.10</span>
              <div class="kpi-badge badge-up">
                <svg width="10" height="10" viewBox="0 0 10 10">
                  <path d="M5 2L8 6H2L5 2Z" fill="currentColor" />
                </svg>
                +12.3%
              </div>
            </div>
            <div class="kpi-sparkline">
              <svg viewBox="0 0 80 24" fill="none" preserveAspectRatio="none">
                <polyline
                  points="0,16 10,12 20,14 30,8 40,10 50,4 60,6 70,2 80,4"
                  stroke="#3b82f6"
                  stroke-width="1.5"
                  fill="none"
                  opacity="0.8"
                />
              </svg>
            </div>
          </div>

          <!-- 填充率卡片 -->
          <div
            class="kpi-card kpi-fill"
            :class="{ 'is-active': activeKpi === 'fill' }"
            @click="activeKpi = 'fill'"
          >
            <div class="kpi-bg-glow fill-glow" />
            <div class="kpi-label">填充率</div>
            <div class="kpi-value fill-value">
              <span class="kpi-number">98%</span>
              <div class="kpi-badge badge-down">
                <svg width="10" height="10" viewBox="0 0 10 10">
                  <path d="M5 8L2 4H8L5 8Z" fill="currentColor" />
                </svg>
                -3.2%
              </div>
            </div>
            <div class="kpi-sparkline">
              <svg viewBox="0 0 80 24" fill="none" preserveAspectRatio="none">
                <polyline
                  points="0,8 10,10 20,6 30,12 40,8 50,14 60,10 70,16 80,12"
                  stroke="#10b981"
                  stroke-width="1.5"
                  fill="none"
                  opacity="0.8"
                />
              </svg>
            </div>
          </div>

          <!-- 展示次数卡片 -->
          <div
            class="kpi-card kpi-impression"
            :class="{ 'is-active': activeKpi === 'impression' }"
            @click="activeKpi = 'impression'"
          >
            <div class="kpi-bg-glow impression-glow" />
            <div class="kpi-label">展示次数</div>
            <div class="kpi-value impression-value">
              <span class="kpi-number">302M</span>
            </div>
            <div class="kpi-sparkline">
              <svg viewBox="0 0 80 24" fill="none" preserveAspectRatio="none">
                <polyline
                  points="0,12 10,8 20,14 30,6 40,10 50,4 60,8 70,2 80,6"
                  stroke="#a855f7"
                  stroke-width="1.5"
                  fill="none"
                  opacity="0.8"
                />
              </svg>
            </div>
          </div>
        </div>

        <!-- 核心指标趋势图 -->
        <div class="chart-panel">
          <div class="panel-header">
            <h3 class="panel-title">核心指标趋势</h3>
            <div class="legend-list">
              <span
                class="legend-item"
                v-for="item in legendItems"
                :key="item.key"
                :class="{ 'legend-inactive': !item.active }"
                @click="toggleLegend(item)"
              >
                <i class="legend-dot" :style="{ background: item.color }" />
                {{ item.label }}
              </span>
            </div>
          </div>
          <div ref="chartRef" class="echarts-container" />
        </div>

        <!-- 瀑布流设置 -->
        <div class="waterfall-panel">
          <h3 class="panel-title">瀑布流设置</h3>
          <el-tabs v-model="waterfallTab" class="custom-tabs">
            <el-tab-pane label="横幅" name="banner" />
            <el-tab-pane label="插屏" name="interstitial" />
            <el-tab-pane label="激励" name="rewarded" />
            <el-tab-pane label="其他" name="other" />
          </el-tabs>
          <div class="waterfall-grid">
            <div
              v-for="(item, idx) in waterfallItems[waterfallTab]"
              :key="idx"
              class="waterfall-item"
              :draggable="true"
              @dragstart="dragStart(idx)"
              @dragover.prevent
              @drop="dragDrop(idx)"
              :class="{ 'drag-over': dragOverIdx === idx }"
              @dragenter="dragOverIdx = idx"
              @dragleave="dragOverIdx = -1"
            >
              <div class="drag-handle">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <circle cx="4" cy="3" r="1" fill="currentColor" />
                  <circle cx="8" cy="3" r="1" fill="currentColor" />
                  <circle cx="4" cy="6" r="1" fill="currentColor" />
                  <circle cx="8" cy="6" r="1" fill="currentColor" />
                  <circle cx="4" cy="9" r="1" fill="currentColor" />
                  <circle cx="8" cy="9" r="1" fill="currentColor" />
                </svg>
              </div>
              <div class="network-icon" :style="{ background: item.color }">
                <span>{{ item.icon }}</span>
              </div>
              <span class="network-name">{{ item.name }}</span>
              <div class="item-actions">
                <span class="item-ecpm">¥{{ item.ecpm }}</span>
                <el-switch v-model="item.enabled" size="small" class="custom-switch" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧面板 -->
      <div class="right-panel">
        <!-- 广告位表现 -->
        <div class="table-panel">
          <h3 class="panel-title">广告位表现</h3>
          <div class="custom-table">
            <div class="table-header">
              <span>广告位</span>
              <span>格式</span>
              <span>收入</span>
              <span>eCPM</span>
              <span>填充率</span>
              <span>展示次数</span>
            </div>
            <div
              v-for="(row, idx) in adUnitData"
              :key="idx"
              class="table-row"
              :class="{ 'row-hover': hoverRow === idx }"
              @mouseenter="hoverRow = idx"
              @mouseleave="hoverRow = -1"
            >
              <span class="col-network">{{ row.network }}</span>
              <span class="col-format">
                <span class="format-tag" :class="`format-${row.formatType}`">{{ row.format }}</span>
              </span>
              <span class="col-revenue" :class="{ 'revenue-high': row.revenueHighlight }">{{
                row.revenue
              }}</span>
              <span class="col-ecpm">{{ row.ecpm }}</span>
              <span class="col-fill">
                <div class="fill-bar-wrap">
                  <div class="fill-bar-bg">
                    <div
                      class="fill-bar-fill"
                      :style="{ width: row.fillRate, background: getFillColor(row.fillRate) }"
                    />
                  </div>
                  <span>{{ row.fillRate }}</span>
                </div>
              </span>
              <span class="col-imp">{{ row.impressions }}</span>
            </div>
          </div>
        </div>

        <!-- AI洞察与建议 -->
        <div class="ai-insight-panel">
          <div class="ai-panel-header">
            <h3 class="panel-title">AI洞察与建议</h3>
            <div class="ai-icon-wrap">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"
                  fill="#3b82f6"
                  opacity="0.3"
                />
                <path d="M9 9h2v6H9zm4 0h2v6h-2z" fill="none" />
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="#3b82f6"
                  stroke-width="1"
                  stroke-dasharray="4 2"
                />
              </svg>
            </div>
          </div>
          <div class="insight-list">
            <div
              v-for="(insight, idx) in insights"
              :key="idx"
              class="insight-card"
              :class="{ 'insight-expanded': expandedInsight === idx }"
              @click="expandedInsight = expandedInsight === idx ? -1 : idx"
            >
              <div class="insight-icon-wrap">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M9 2a7 7 0 100 14A7 7 0 009 2z" stroke="#3b82f6" stroke-width="1.2" />
                  <circle cx="9" cy="6" r="1" fill="#3b82f6" />
                  <path d="M9 8.5V13" stroke="#3b82f6" stroke-width="1.5" stroke-linecap="round" />
                </svg>
              </div>
              <div class="insight-content">
                <div class="insight-tag">{{ insight.type }}</div>
                <p class="insight-text">{{ insight.text }}</p>
              </div>
              <svg
                class="insight-arrow"
                :class="{ rotated: expandedInsight === idx }"
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
              >
                <path
                  d="M5 5l4 2-4 2"
                  stroke="currentColor"
                  stroke-width="1.3"
                  stroke-linecap="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
  import * as echarts from 'echarts'

  // ─── emits ────────────────────────────────────────────────────
  defineEmits<{ (e: 'back'): void }>()

  // ─── 筛选器状态 ───────────────────────────────────────────────
  const dateRange = ref('2025-12')
  const country = ref('all')

  // ─── KPI ──────────────────────────────────────────────────────
  const activeKpi = ref('revenue')

  // ─── 图表 ─────────────────────────────────────────────────────
  const chartRef = ref<HTMLElement | null>(null)
  let chartInstance: echarts.ECharts | null = null

  const legendItems = ref([
    { key: 'revenue', label: 'Revenue', color: '#f59e0b', active: true },
    { key: 'ecpm', label: 'eCPM', color: '#3b82f6', active: true },
    { key: 'fill', label: 'Fill Rate', color: '#10b981', active: true }
  ])

  function toggleLegend(item: (typeof legendItems.value)[0]) {
    item.active = !item.active
    if (chartInstance)
      chartInstance.dispatchAction({ type: 'legendToggleSelect', name: item.label })
  }

  const xAxisData = [
    '10/1',
    '10/3',
    '10/5',
    '10/7',
    '10/9',
    '10/11',
    '10/13',
    '10/15',
    '10/17',
    '10/19',
    '10/21',
    '10/23',
    '10/25',
    '10/27',
    '10/29',
    '10/31'
  ]
  const revenueData = [
    780, 650, 820, 590, 750, 680, 900, 620, 800, 720, 870, 640, 760, 810, 690, 937
  ]
  const ecpmData = [2.8, 2.6, 3.0, 2.5, 2.9, 2.7, 3.1, 2.6, 3.0, 2.8, 3.1, 2.6, 2.9, 3.0, 2.8, 3.1]
  const fillData = [97, 96, 98, 95, 98, 97, 99, 96, 98, 97, 99, 96, 98, 98, 97, 98]

  function initChart() {
    if (!chartRef.value) return
    chartInstance = echarts.init(chartRef.value, 'dark')
    const option: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(15,23,42,0.92)',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        padding: [10, 14],
        textStyle: { color: '#e2e8f0', fontSize: 12 },
        formatter(params: any) {
          const p = Array.isArray(params) ? params : [params]
          let html = `<div style="font-weight:600;margin-bottom:6px;color:#94a3b8">${p[0]?.axisValue}</div>`
          p.forEach((s: any) => {
            const dot = `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${s.color};margin-right:6px"></span>`
            const val =
              s.seriesName === 'Revenue'
                ? `$${s.value}K`
                : s.seriesName === 'eCPM'
                  ? `¥${s.value}`
                  : `${s.value}%`
            html += `<div style="display:flex;align-items:center;gap:4px;padding:2px 0">${dot}${s.seriesName}: <b style="margin-left:auto;padding-left:12px">${val}</b></div>`
          })
          return html
        },
        axisPointer: {
          type: 'line',
          lineStyle: { color: 'rgba(255,255,255,0.12)', type: 'dashed' }
        }
      },
      legend: { show: false },
      grid: { left: 56, right: 56, top: 16, bottom: 36 },
      xAxis: {
        type: 'category',
        data: xAxisData,
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
        axisTick: { show: false },
        axisLabel: { color: '#64748b', fontSize: 11 }
      },
      yAxis: [
        {
          type: 'value',
          name: '',
          position: 'left',
          axisLabel: {
            color: '#64748b',
            fontSize: 11,
            formatter: (v: number) => (v >= 1000 ? `$${v / 1000}K` : `$${v}K`)
          },
          splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
          axisLine: { show: false },
          axisTick: { show: false }
        },
        {
          type: 'value',
          name: '',
          position: 'right',
          min: 0,
          max: 100,
          axisLabel: { color: '#64748b', fontSize: 11, formatter: '{value}%' },
          splitLine: { show: false },
          axisLine: { show: false },
          axisTick: { show: false }
        }
      ],
      series: [
        {
          name: 'Revenue',
          type: 'line',
          data: revenueData,
          yAxisIndex: 0,
          smooth: 0.4,
          symbol: 'circle',
          symbolSize: 5,
          lineStyle: { color: '#f59e0b', width: 2 },
          itemStyle: { color: '#f59e0b', borderWidth: 2, borderColor: '#0f172a' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(245,158,11,0.25)' },
              { offset: 1, color: 'rgba(245,158,11,0.02)' }
            ])
          }
        },
        {
          name: 'eCPM',
          type: 'line',
          data: ecpmData,
          yAxisIndex: 0,
          smooth: 0.4,
          symbol: 'circle',
          symbolSize: 5,
          lineStyle: { color: '#3b82f6', width: 2 },
          itemStyle: { color: '#3b82f6', borderWidth: 2, borderColor: '#0f172a' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(59,130,246,0.2)' },
              { offset: 1, color: 'rgba(59,130,246,0.02)' }
            ])
          }
        },
        {
          name: 'Fill Rate',
          type: 'line',
          data: fillData,
          yAxisIndex: 1,
          smooth: 0.4,
          symbol: 'circle',
          symbolSize: 5,
          lineStyle: { color: '#10b981', width: 2 },
          itemStyle: { color: '#10b981', borderWidth: 2, borderColor: '#0f172a' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(16,185,129,0.18)' },
              { offset: 1, color: 'rgba(16,185,129,0.01)' }
            ])
          }
        }
      ]
    }
    chartInstance.setOption(option)
  }

  // ─── 瀑布流 ───────────────────────────────────────────────────
  const waterfallTab = ref('banner')
  const dragIdx = ref(-1)
  const dragOverIdx = ref(-1)

  const waterfallItems = ref<Record<string, any[]>>({
    banner: [
      { name: 'AppLovin', icon: 'A', color: '#e85d04', ecpm: '3.80', enabled: true },
      { name: 'AppLovin', icon: 'A', color: '#e85d04', ecpm: '3.50', enabled: true },
      { name: 'Facebook', icon: 'F', color: '#1877f2', ecpm: '3.20', enabled: false },
      { name: 'Unity Ads', icon: 'U', color: '#222c37', ecpm: '2.90', enabled: true }
    ],
    interstitial: [
      { name: 'AdMob', icon: 'G', color: '#4285f4', ecpm: '4.20', enabled: true },
      { name: 'IronSource', icon: 'I', color: '#00b4d8', ecpm: '3.80', enabled: true },
      { name: 'AppLovin', icon: 'A', color: '#e85d04', ecpm: '3.60', enabled: true },
      { name: 'Unity Ads', icon: 'U', color: '#222c37', ecpm: '3.10', enabled: false }
    ],
    rewarded: [
      { name: 'AppLovin', icon: 'A', color: '#e85d04', ecpm: '7.50', enabled: true },
      { name: 'Unity Ads', icon: 'U', color: '#222c37', ecpm: '6.80', enabled: true },
      { name: 'IronSource', icon: 'I', color: '#00b4d8', ecpm: '6.20', enabled: true }
    ],
    other: [
      { name: 'Google Ads', icon: 'G', color: '#4285f4', ecpm: '2.10', enabled: true },
      { name: 'Facebook', icon: 'F', color: '#1877f2', ecpm: '1.90', enabled: false }
    ]
  })

  function dragStart(idx: number) {
    dragIdx.value = idx
  }
  function dragDrop(targetIdx: number) {
    if (dragIdx.value < 0 || dragIdx.value === targetIdx) return
    const list = waterfallItems.value[waterfallTab.value]
    const moved = list.splice(dragIdx.value, 1)[0]
    list.splice(targetIdx, 0, moved)
    dragIdx.value = -1
    dragOverIdx.value = -1
  }

  // ─── 广告位表格 ───────────────────────────────────────────────
  const hoverRow = ref(-1)
  const adUnitData = [
    {
      network: 'AdMob',
      format: '插屏',
      formatType: 'interstitial',
      revenue: '$2.16M',
      ecpm: '$3.80',
      fillRate: '99%',
      impressions: '12.0M',
      revenueHighlight: false
    },
    {
      network: 'Facebook',
      format: '横幅',
      formatType: 'banner',
      revenue: '$2.16M',
      ecpm: '$3.80',
      fillRate: '95%',
      impressions: '7.0M',
      revenueHighlight: false
    },
    {
      network: 'Unity ads',
      format: '激励视频',
      formatType: 'rewarded',
      revenue: '$10.50M',
      ecpm: '$3.80',
      fillRate: '92%',
      impressions: '12.0M',
      revenueHighlight: true
    },
    {
      network: 'IronSource',
      format: '插屏',
      formatType: 'interstitial',
      revenue: '$2.16M',
      ecpm: '$3.80',
      fillRate: '99%',
      impressions: '12.0M',
      revenueHighlight: false
    },
    {
      network: 'Google Ads',
      format: '横幅',
      formatType: 'banner',
      revenue: '$13.50M',
      ecpm: '$3.80',
      fillRate: '95%',
      impressions: '12.0M',
      revenueHighlight: true
    },
    {
      network: 'IronSource',
      format: '插屏',
      formatType: 'interstitial',
      revenue: '$2.16M',
      ecpm: '$3.80',
      fillRate: '92%',
      impressions: '12.0M',
      revenueHighlight: false
    },
    {
      network: 'Google Ads',
      format: '横幅',
      formatType: 'banner',
      revenue: '$2.16M',
      ecpm: '$3.80',
      fillRate: '92%',
      impressions: '12.0M',
      revenueHighlight: false
    }
  ]

  function getFillColor(fill: string) {
    const v = parseInt(fill)
    if (v >= 98) return '#10b981'
    if (v >= 94) return '#3b82f6'
    return '#f59e0b'
  }

  // ─── AI 洞察 ──────────────────────────────────────────────────
  const expandedInsight = ref(-1)
  const insights = [
    {
      type: '瀑布流优化',
      text: '在 Interstitial_LevelEnd 广告位中，AdMob 的填充率高达 99%，但 eCPM 低于 AppLovin，当前排序合理，可考虑提升 AppLovin floor price 以测试收益空间。'
    },
    {
      type: '广告位机会',
      text: 'Rewarded._ExtraLife 的 eCPM 高达 $7.50，是收入效率最高的广告位。建议在应用内增加更多此广告位的曝光机会，以提升总收入。'
    },
    {
      type: '填充率预警',
      text: 'Unity Ads 在激励视频广告位填充率仅为 92%，低于行业均值。建议补充备用广告网络或调整 waterfall 层级，避免库存浪费。'
    }
  ]

  // ─── resize ───────────────────────────────────────────────────
  function handleResize() {
    chartInstance?.resize()
  }

  onMounted(async () => {
    await nextTick()
    initChart()
    window.addEventListener('resize', handleResize)
  })

  onBeforeUnmount(() => {
    chartInstance?.dispose()
    window.removeEventListener('resize', handleResize)
  })

  watch([dateRange, country], () => {
    // 实际项目中在此处重新请求数据后调用 chartInstance?.setOption(...)
  })
</script>

<style scoped>
  /* ═══════════════════════════════════════════════
   CSS 变量 & 基础
═══════════════════════════════════════════════ */
  .admob-dashboard {
    --bg-base: #090e1a;
    --bg-panel: #0d1526;
    --bg-card: #111d35;
    --bg-hover: #162040;
    --border: rgb(255 255 255 / 7%);
    --border-light: rgb(255 255 255 / 12%);
    --text-primary: #e2e8f0;
    --text-secondary: #94a3b8;
    --text-muted: #475569;
    --accent-yellow: #f59e0b;
    --accent-blue: #3b82f6;
    --accent-green: #10b981;
    --accent-purple: #a855f7;
    --accent-red: #ef4444;
    --radius-sm: 6px;
    --radius-md: 10px;
    --radius-lg: 14px;
    --shadow: 0 4px 24px rgb(0 0 0 / 40%);

    min-height: 100vh;
    padding: 0 0 32px;
    font-family: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
    font-size: 13px;
    color: var(--text-primary);
    background: var(--bg-base);
  }

  /* ═══════════════════════════════════════════════
   顶部导航
═══════════════════════════════════════════════ */
  .top-nav {
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    gap: 14px;
    align-items: center;
    padding: 14px 24px;
    background: rgb(9 14 26 / 80%);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--border);
  }

  .back-btn {
    display: flex;
    gap: 6px;
    align-items: center;
    padding: 5px 12px;
    font-size: 12px;
    color: var(--text-secondary);
    cursor: pointer;
    background: rgb(255 255 255 / 6%);
    border: 1px solid var(--border);
    border-radius: 20px;
    transition: all 0.2s;
  }

  .back-btn:hover {
    color: var(--text-primary);
    background: rgb(255 255 255 / 10%);
    transform: translateX(-2px);
  }

  .breadcrumb {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 13px;
    color: var(--text-muted);
  }

  .breadcrumb .sep {
    opacity: 0.4;
  }

  .breadcrumb .active {
    font-weight: 500;
    color: var(--text-primary);
  }

  /* ═══════════════════════════════════════════════
   页面标题
═══════════════════════════════════════════════ */
  .page-header {
    display: flex;
    gap: 16px;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px 16px;
  }

  .page-title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
    letter-spacing: -0.3px;
  }

  .filters {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .filter-item {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .filter-label {
    font-size: 12px;
    color: var(--text-secondary);
    white-space: nowrap;
  }

  /* Element Plus select 深色适配 */
  :deep(.custom-select .el-input__wrapper) {
    background: var(--bg-card) !important;
    border-radius: var(--radius-sm) !important;
    box-shadow: 0 0 0 1px var(--border) !important;
  }

  :deep(.custom-select .el-input__inner) {
    font-size: 12px;
    color: var(--text-primary) !important;
  }

  :deep(.el-select__popper) {
    background: var(--bg-panel) !important;
    border: 1px solid var(--border) !important;
  }

  :deep(.el-select-dropdown__item) {
    font-size: 12px;
    color: var(--text-secondary) !important;
  }

  :deep(.el-select-dropdown__item.is-selected),
  :deep(.el-select-dropdown__item:hover) {
    color: var(--text-primary) !important;
    background: var(--bg-hover) !important;
  }

  /* ═══════════════════════════════════════════════
   主体布局
═══════════════════════════════════════════════ */
  .main-layout {
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: 16px;
    padding: 0 24px;
  }

  .left-panel {
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-width: 0;
  }

  .right-panel {
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-width: 0;
  }

  /* ═══════════════════════════════════════════════
   KPI 卡片
═══════════════════════════════════════════════ */
  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }

  .kpi-card {
    position: relative;
    padding: 18px 16px 12px;
    overflow: hidden;
    cursor: pointer;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    transition:
      border-color 0.25s,
      transform 0.2s,
      box-shadow 0.25s;
  }

  .kpi-card:hover {
    box-shadow: 0 8px 32px rgb(0 0 0 / 35%);
    transform: translateY(-2px);
  }

  .kpi-card.is-active {
    border-color: rgb(255 255 255 / 20%);
  }

  .kpi-bg-glow {
    position: absolute;
    inset: 0;
    pointer-events: none;
    border-radius: inherit;
    opacity: 0.08;
  }

  .revenue-glow {
    background: radial-gradient(ellipse at 30% 0%, #f59e0b 0%, transparent 65%);
  }

  .ecpm-glow {
    background: radial-gradient(ellipse at 30% 0%, #3b82f6 0%, transparent 65%);
  }

  .fill-glow {
    background: radial-gradient(ellipse at 30% 0%, #10b981 0%, transparent 65%);
  }

  .impression-glow {
    background: radial-gradient(ellipse at 30% 0%, #a855f7 0%, transparent 65%);
  }

  .kpi-label {
    margin-bottom: 10px;
    font-size: 11px;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .kpi-value {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: baseline;
  }

  .kpi-number {
    font-size: 26px;
    font-weight: 700;
    line-height: 1;
    letter-spacing: -1px;
  }

  .revenue-value .kpi-number {
    color: var(--accent-yellow);
  }

  .ecpm-value .kpi-number {
    color: var(--accent-blue);
  }

  .fill-value .kpi-number {
    color: var(--accent-green);
  }

  .impression-value .kpi-number {
    color: var(--accent-purple);
  }

  .kpi-badge {
    display: inline-flex;
    gap: 3px;
    align-items: center;
    padding: 2px 7px;
    font-size: 11px;
    font-weight: 600;
    border-radius: 10px;
  }

  .badge-up {
    color: #10b981;
    background: rgb(16 185 129 / 15%);
  }

  .badge-down {
    color: #ef4444;
    background: rgb(239 68 68 / 15%);
  }

  .kpi-sparkline {
    height: 24px;
    margin-top: 10px;
    opacity: 0.7;
  }

  .kpi-sparkline svg {
    width: 100%;
    height: 100%;
  }

  /* ═══════════════════════════════════════════════
   通用面板样式
═══════════════════════════════════════════════ */
  .panel-title {
    margin: 0;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
    letter-spacing: -0.2px;
  }

  /* ═══════════════════════════════════════════════
   趋势图面板
═══════════════════════════════════════════════ */
  .chart-panel {
    padding: 18px 16px 14px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }

  .legend-list {
    display: flex;
    gap: 16px;
    align-items: center;
  }

  .legend-item {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 11px;
    color: var(--text-secondary);
    cursor: pointer;
    user-select: none;
    transition: opacity 0.2s;
  }

  .legend-item:hover {
    color: var(--text-primary);
  }

  .legend-item.legend-inactive {
    opacity: 0.4;
  }

  .legend-dot {
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .echarts-container {
    width: 100%;
    height: 220px;
  }

  /* ═══════════════════════════════════════════════
   瀑布流设置
═══════════════════════════════════════════════ */
  .waterfall-panel {
    padding: 18px 16px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
  }

  /* Tabs 深色适配 */
  :deep(.custom-tabs .el-tabs__nav-wrap::after) {
    display: none;
  }

  :deep(.custom-tabs .el-tabs__header) {
    margin-bottom: 14px;
  }

  :deep(.custom-tabs .el-tabs__nav-wrap) {
    border-bottom: 1px solid var(--border);
  }

  :deep(.custom-tabs .el-tabs__item) {
    height: 32px;
    padding: 0 14px;
    font-size: 12px;
    color: var(--text-muted) !important;
  }

  :deep(.custom-tabs .el-tabs__item.is-active) {
    color: var(--text-primary) !important;
  }

  :deep(.custom-tabs .el-tabs__active-bar) {
    background: var(--accent-blue) !important;
  }

  .waterfall-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .waterfall-item {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 8px 10px;
    cursor: grab;
    user-select: none;
    background: rgb(255 255 255 / 3%);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    transition:
      background 0.2s,
      border-color 0.2s,
      transform 0.15s;
  }

  .waterfall-item:hover {
    background: var(--bg-hover);
    border-color: var(--border-light);
  }

  .waterfall-item:active {
    cursor: grabbing;
  }

  .waterfall-item.drag-over {
    background: rgb(59 130 246 / 10%);
    border-color: var(--accent-blue);
    transform: scale(1.01);
  }

  .drag-handle {
    flex-shrink: 0;
    color: var(--text-muted);
    opacity: 0.5;
  }

  .network-icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    font-size: 11px;
    font-weight: 700;
    color: #fff;
    border-radius: 6px;
  }

  .network-name {
    flex: 1;
    overflow: hidden;
    font-size: 12px;
    color: var(--text-primary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .item-actions {
    display: flex;
    flex-shrink: 0;
    gap: 8px;
    align-items: center;
  }

  .item-ecpm {
    font-size: 11px;
    font-weight: 600;
    color: var(--accent-green);
  }

  :deep(.custom-switch .el-switch__core) {
    background: rgb(255 255 255 / 10%) !important;
    border-color: transparent !important;
  }

  :deep(.custom-switch.is-checked .el-switch__core) {
    background: var(--accent-blue) !important;
  }

  /* ═══════════════════════════════════════════════
   广告位表格
═══════════════════════════════════════════════ */
  .table-panel {
    padding: 16px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
  }

  .custom-table {
    margin-top: 12px;
  }

  .table-header {
    display: grid;
    grid-template-columns: 80px 60px 70px 50px 80px 60px;
    gap: 4px;
    padding: 0 8px 8px;
    font-size: 11px;
    color: var(--text-muted);
    letter-spacing: 0.3px;
    border-bottom: 1px solid var(--border);
  }

  .table-row {
    display: grid;
    grid-template-columns: 80px 60px 70px 50px 80px 60px;
    gap: 4px;
    align-items: center;
    padding: 7px 8px;
    font-size: 12px;
    border-bottom: 1px solid var(--border);
    border-radius: var(--radius-sm);
    transition: background 0.15s;
  }

  .table-row:last-child {
    border-bottom: none;
  }

  .table-row.row-hover {
    background: var(--bg-hover);
  }

  .col-network {
    font-weight: 500;
    color: var(--text-secondary);
  }

  .format-tag {
    display: inline-block;
    padding: 2px 6px;
    font-size: 10px;
    white-space: nowrap;
    border-radius: 4px;
  }

  .format-banner {
    color: #3b82f6;
    background: rgb(59 130 246 / 15%);
  }

  .format-interstitial {
    color: #f59e0b;
    background: rgb(245 158 11 / 15%);
  }

  .format-rewarded {
    color: #a855f7;
    background: rgb(168 85 247 / 15%);
  }

  .col-revenue {
    font-size: 11px;
    font-weight: 600;
    color: var(--accent-green);
  }

  .col-revenue.revenue-high {
    color: #f59e0b;
  }

  .col-ecpm {
    font-size: 11px;
    color: var(--text-secondary);
  }

  .fill-bar-wrap {
    display: flex;
    gap: 5px;
    align-items: center;
    font-size: 11px;
    color: var(--text-secondary);
  }

  .fill-bar-bg {
    width: 36px;
    height: 4px;
    overflow: hidden;
    background: rgb(255 255 255 / 8%);
    border-radius: 2px;
  }

  .fill-bar-fill {
    height: 100%;
    border-radius: 2px;
    transition: width 0.5s ease;
  }

  .col-imp {
    font-size: 11px;
    color: var(--text-muted);
  }

  /* ═══════════════════════════════════════════════
   AI 洞察
═══════════════════════════════════════════════ */
  .ai-insight-panel {
    flex: 1;
    padding: 16px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
  }

  .ai-panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }

  .ai-icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: rgb(59 130 246 / 10%);
    border: 1px solid rgb(59 130 246 / 20%);
    border-radius: 8px;
    animation: pulseGlow 3s ease-in-out infinite;
  }

  @keyframes pulseGlow {
    0%,
    100% {
      box-shadow: 0 0 0 0 rgb(59 130 246 / 0%);
    }

    50% {
      box-shadow: 0 0 0 6px rgb(59 130 246 / 8%);
    }
  }

  .insight-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .insight-card {
    position: relative;
    display: flex;
    gap: 10px;
    align-items: flex-start;
    padding: 10px 12px;
    cursor: pointer;
    background: rgb(255 255 255 / 2.5%);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    transition:
      background 0.2s,
      border-color 0.2s;
  }

  .insight-card:hover {
    background: var(--bg-hover);
    border-color: rgb(59 130 246 / 25%);
  }

  .insight-card.insight-expanded {
    background: rgb(59 130 246 / 6%);
    border-color: rgb(59 130 246 / 30%);
  }

  .insight-icon-wrap {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    margin-top: 2px;
    background: rgb(59 130 246 / 10%);
    border-radius: 7px;
  }

  .insight-content {
    flex: 1;
    min-width: 0;
  }

  .insight-tag {
    display: inline-block;
    padding: 1px 7px;
    margin-bottom: 5px;
    font-size: 10px;
    font-weight: 600;
    color: #3b82f6;
    letter-spacing: 0.3px;
    background: rgb(59 130 246 / 12%);
    border-radius: 10px;
  }

  .insight-text {
    display: -webkit-box;
    margin: 0;
    overflow: hidden;
    font-size: 11.5px;
    line-height: 1.6;
    color: var(--text-secondary);
    transition: all 0.3s;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .insight-expanded .insight-text {
    -webkit-line-clamp: unset;
    overflow: visible;
  }

  .insight-arrow {
    flex-shrink: 0;
    margin-top: 4px;
    color: var(--text-muted);
    transition: transform 0.25s;
  }

  .insight-arrow.rotated {
    transform: rotate(90deg);
  }

  /* ═══════════════════════════════════════════════
   响应式
═══════════════════════════════════════════════ */
  @media (width <= 1200px) {
    .main-layout {
      grid-template-columns: 1fr;
    }

    .right-panel {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
  }

  @media (width <= 900px) {
    .kpi-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .right-panel {
      grid-template-columns: 1fr;
    }

    .waterfall-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (width <= 600px) {
    .page-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .kpi-grid {
      grid-template-columns: 1fr 1fr;
    }

    .main-layout {
      padding: 0 12px;
    }
  }
</style>
