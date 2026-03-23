<template>
  <div class="weekly-campaigns">
    <!-- ── 顶栏：周期 + KPI + 迷你图（对齐日报在投结构）──────────────── -->
    <div class="wcc-title-row">
      <div class="wcc-title-left">
        <span class="wcc-title-app">整体</span>
        <span class="wcc-title-app">全部平台</span>
        <span class="wcc-title-badge">周报</span>
        <span class="wcc-title-date">2026年第10周（3/9-3/15）</span>
      </div>
      <div class="wcc-title-stats">
        <div class="wcc-stat">
          <span class="wcc-stat-dot active"></span>
          <span class="wcc-stat-label">在投系列</span>
          <span class="wcc-stat-val">{{ activeCount }}个</span>
          <span class="wcc-stat-arrow up" aria-hidden="true">↑</span>
        </div>
        <div class="wcc-stat">
          <span class="wcc-stat-dot paused"></span>
          <span class="wcc-stat-label">已暂停</span>
          <span class="wcc-stat-val paused">{{ pausedCount }}个</span>
          <span class="wcc-stat-arrow paused-arr" aria-hidden="true">↑</span>
        </div>
        <div class="wcc-stat-sep"></div>
        <div class="wcc-stat">
          <span class="wcc-stat-label">总广告支出</span>
          <span class="wcc-stat-val spend">{{ totalSpendDisplay }}</span>
        </div>
        <div class="wcc-mini-chart-wrap">
          <div ref="miniChartRef" class="wcc-mini-chart"></div>
        </div>
      </div>
    </div>

    <!-- ── 表格区 ─────────────────────────────────────────────── -->
    <div class="wcc-table-card">
      <div class="table-title">CAMPAIGN TABLE</div>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>应用</th>
              <th>平台</th>
              <th>广告平台</th>
              <th>广告系列名称</th>
              <th>状态</th>
              <th>国家</th>
              <th>广告支出</th>
              <th>周环比</th>
              <th>CPI</th>
              <th>CPM</th>
              <th>CPC</th>
              <th>买量用户</th>
              <th>首日ROI</th>
              <th>3日ROI</th>
              <th>7日ROI</th>
              <th>14日ROI</th>
              <th>30日ROI</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in campaigns" :key="row.id" :class="{ paused: row.status === 'paused' }">
              <td>{{ row.app }}</td>
              <td>{{ row.platform }}</td>
              <td>
                <div class="platform-cell">
                  <div class="pl-dot" :style="{ background: row.adPlatformColor }"></div>
                  {{ row.adPlatform }}
                </div>
              </td>
              <td class="campaign-name">{{ row.campaignName }}</td>
              <td>
                <span :class="['status-badge', row.status]">
                  <span class="status-dot"></span>
                  {{ row.status === 'active' ? '在投中' : '已暂停' }}
                </span>
              </td>
              <td>
                <span class="flag">{{ row.countryFlag }}</span> {{ row.country }}
              </td>
              <td :class="row.status === 'paused' ? 'muted' : ''">{{ row.adSpend }}</td>
              <td :class="changeColor(row.adSpendChange)">
                {{
                  row.adSpendChange === -100
                    ? '-100%'
                    : (row.adSpendChange >= 0 ? '+' : '') + row.adSpendChange + '%'
                }}
              </td>
              <td>{{ row.cpi ?? '-' }}</td>
              <td>{{ row.cpm ?? '-' }}</td>
              <td>{{ row.cpc ?? '-' }}</td>
              <td>{{ row.acquisitions }}</td>
              <td>
                <div :class="['heat-cell', heatClass(row.roi1d)]">{{ row.roi1d }}</div>
              </td>
              <td>
                <div :class="['heat-cell', heatClass(row.roi3d)]">{{ row.roi3d }}</div>
              </td>
              <td>
                <div :class="['heat-cell', heatClass(row.roi7d)]">{{ row.roi7d }}</div>
              </td>
              <td>
                <div :class="['heat-cell', heatClass(row.roi14d)]">{{ row.roi14d }}</div>
              </td>
              <td>
                <div :class="['heat-cell', heatClass(row.roi30d)]">{{ row.roi30d }}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ── 底部推送（对齐日报在投）──────────────────────────── -->
    <div class="wcc-push-bar">
      <span class="wcc-push-summary">
        在投 {{ activeCount }} 个 &nbsp;|&nbsp; 已暂停 {{ pausedCount }} 个 &nbsp;|&nbsp; 总广告支出
        {{ totalSpendDisplay }}
      </span>
      <div class="wcc-push-right">
        <span class="wcc-push-last">上次推送：本周一 08:30 飞书群《经营周报》</span>
        <button class="wcc-push-btn" type="button" @click="openPushModal()">立即推送</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, inject, onMounted, onUnmounted } from 'vue'
  import * as echarts from 'echarts'
  import { campaignData } from '../mockData'

  defineOptions({ name: 'WeeklyCampaigns' })

  const campaigns = campaignData.map((c) => ({
    ...c,
    adSpend:
      c.adSpend === '$0'
        ? '$0'
        : '$' + (parseInt(c.adSpend.replace(/[$,]/g, ''), 10) * 7).toLocaleString('en-US')
  }))

  const openPushModal = inject<() => void>('openPushModal', () => {})

  const activeCount = computed(() => campaigns.filter((c) => c.status === 'active').length)
  const pausedCount = computed(() => campaigns.filter((c) => c.status === 'paused').length)

  const totalSpendDisplay = computed(() => {
    const sum = campaigns.reduce((acc, c) => {
      if (c.adSpend === '$0') return acc
      return acc + parseInt(c.adSpend.replace(/[$,]/g, ''), 10)
    }, 0)
    return '$' + sum.toLocaleString('en-US')
  })

  const miniChartRef = ref<HTMLElement>()
  let chart: echarts.ECharts | null = null

  onMounted(() => {
    if (!miniChartRef.value) return
    chart = echarts.init(miniChartRef.value, 'dark')
    chart.setOption({
      backgroundColor: 'transparent',
      grid: { top: 4, right: 4, bottom: 4, left: 4 },
      xAxis: {
        type: 'category',
        data: ['安卓', 'iOS', '网站'],
        show: false
      },
      yAxis: { type: 'value', show: false },
      series: [
        {
          name: '安卓',
          type: 'bar',
          stack: 'total',
          data: [18000, 0, 0],
          itemStyle: { color: '#4285F4' },
          barWidth: 14
        },
        {
          name: 'iOS',
          type: 'bar',
          stack: 'total',
          data: [0, 8000, 0],
          itemStyle: { color: '#22C55E' },
          barWidth: 14
        },
        {
          name: '网站',
          type: 'bar',
          stack: 'total',
          data: [0, 0, 3000],
          itemStyle: { color: '#FB923C' },
          barWidth: 14
        }
      ],
      tooltip: { show: false }
    })
  })
  onUnmounted(() => chart?.dispose())

  const changeColor = (v: number) => (v >= 0 ? 'chg-pos' : 'chg-neg')
  const heatClass = (val: string) => {
    if (val === '-' || val === '0') return 'heat-none'
    const n = parseInt(val)
    if (n >= 110) return 'heat-5'
    if (n >= 100) return 'heat-4'
    if (n >= 90) return 'heat-3'
    if (n >= 70) return 'heat-2'
    if (n >= 50) return 'heat-1'
    return 'heat-0'
  }
</script>

<style scoped>
  .weekly-campaigns {
    position: relative;
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 14px;
    min-height: 0;
    padding: 14px 14px 52px;
    overflow: hidden;
    background: rgb(255 255 255 / 3%);
    border: 1px solid rgb(255 255 255 / 7%);
    border-radius: 12px;
  }

  /* ── 顶栏 ─────────────────────────────────────────────────── */
  .wcc-title-row {
    display: flex;
    flex-shrink: 0;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    padding: 2px 0;
  }

  .wcc-title-left {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
  }

  .wcc-title-app {
    font-size: 18px;
    font-weight: 700;
    color: rgb(255 255 255 / 90%);
  }

  .wcc-title-badge {
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 700;
    color: #000;
    background: #00d4a1;
    border-radius: 4px;
  }

  .wcc-title-date {
    font-size: 13px;
    color: rgb(255 255 255 / 55%);
  }

  .wcc-title-stats {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
  }

  .wcc-stat {
    display: flex;
    gap: 5px;
    align-items: center;
  }

  .wcc-stat-dot {
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .wcc-stat-dot.active {
    background: #00d4a1;
  }

  .wcc-stat-dot.paused {
    background: #f59e0b;
  }

  .wcc-stat-label {
    font-size: 11px;
    color: rgb(255 255 255 / 45%);
  }

  .wcc-stat-val {
    font-size: 14px;
    font-weight: 700;
    color: rgb(255 255 255 / 90%);
  }

  .wcc-stat-val.paused {
    color: #fb923c;
  }

  .wcc-stat-val.spend {
    color: #00d4a1;
  }

  .wcc-stat-arrow {
    margin-left: 1px;
    font-size: 11px;
    font-weight: 700;
  }

  .wcc-stat-arrow.up {
    color: #4ade80;
  }

  .wcc-stat-arrow.paused-arr {
    color: #fb923c;
  }

  .wcc-stat-sep {
    width: 1px;
    height: 18px;
    background: rgb(255 255 255 / 10%);
  }

  .wcc-mini-chart-wrap {
    margin-left: 4px;
  }

  .wcc-mini-chart {
    width: 80px;
    height: 36px;
  }

  /* ── 表格卡片 ─────────────────────────────────────────────── */
  .wcc-table-card {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    padding: 14px;
    overflow: hidden;
    background: rgb(255 255 255 / 2%);
    border: 1px solid rgb(255 255 255 / 7%);
    border-radius: 10px;
  }

  .table-title {
    flex-shrink: 0;
    margin-bottom: 10px;
    font-size: 11px;
    font-weight: 700;
    color: rgb(255 255 255 / 35%);
    letter-spacing: 0.1em;
  }

  .table-wrap {
    flex: 1;
    min-height: 0;
    overflow: auto;
  }

  .data-table {
    width: 100%;
    min-width: 1400px;
    font-size: 12px;
    border-collapse: collapse;
  }

  .data-table th {
    padding: 7px 10px;
    font-weight: 500;
    color: rgb(255 255 255 / 40%);
    text-align: left;
    white-space: nowrap;
    border-bottom: 1px solid rgb(255 255 255 / 7%);
  }

  .data-table td {
    padding: 7px 8px;
    color: rgb(255 255 255 / 85%);
    white-space: nowrap;
  }

  .data-table tr:not(:last-child) td {
    border-bottom: 1px solid rgb(255 255 255 / 4%);
  }

  .data-table tr:hover td {
    background: rgb(255 255 255 / 3%);
  }

  .data-table tr.paused {
    opacity: 0.55;
  }

  .platform-cell {
    display: flex;
    gap: 5px;
    align-items: center;
  }

  .pl-dot {
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .campaign-name {
    max-width: 180px;
    overflow: hidden;
    font-family: monospace;
    font-size: 11px;
    color: rgb(255 255 255 / 60%);
    text-overflow: ellipsis;
  }

  .flag {
    font-size: 14px;
  }

  .status-badge {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    padding: 2px 7px;
    font-size: 11px;
    border-radius: 4px;
  }

  .status-badge.active {
    color: #00d4a1;
    background: rgb(0 212 161 / 12%);
  }

  .status-badge.paused {
    color: #f59e0b;
    background: rgb(245 158 11 / 12%);
  }

  .status-dot {
    width: 5px;
    height: 5px;
    background: currentcolor;
    border-radius: 50%;
  }

  .muted {
    color: rgb(255 255 255 / 30%) !important;
  }

  .chg-pos {
    font-weight: 500;
    color: #00d4a1;
  }

  .chg-neg {
    font-weight: 500;
    color: #ff5c5c;
  }

  .heat-cell {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 40px;
    padding: 2px 6px;
    font-size: 12px;
    font-weight: 600;
    border-radius: 4px;
  }

  .heat-none {
    color: rgb(255 255 255 / 30%);
    background: transparent;
  }

  .heat-0 {
    color: #f87171;
    background: rgb(248 113 113 / 20%);
  }

  .heat-1 {
    color: #fcd34d;
    background: rgb(251 191 36 / 18%);
  }

  .heat-2 {
    color: #fb923c;
    background: rgb(251 146 60 / 20%);
  }

  .heat-3 {
    color: #34d399;
    background: rgb(52 211 153 / 15%);
  }

  .heat-4 {
    color: #4ade80;
    background: rgb(74 222 128 / 20%);
  }

  .heat-5 {
    color: #00d4a1;
    background: rgb(0 212 161 / 22%);
  }

  /* ── 底部推送 ─────────────────────────────────────────────── */
  .wcc-push-bar {
    position: absolute;
    right: 14px;
    bottom: 12px;
    left: 14px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    justify-content: space-between;
  }

  .wcc-push-summary {
    font-size: 11px;
    color: rgb(255 255 255 / 45%);
  }

  .wcc-push-right {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
  }

  .wcc-push-last {
    font-size: 11px;
    color: rgb(255 255 255 / 35%);
  }

  .wcc-push-btn {
    padding: 6px 16px;
    font-size: 11px;
    font-weight: 600;
    color: #000;
    cursor: pointer;
    background: #00d4a1;
    border: none;
    border-radius: 9999px;
    transition: opacity 0.2s;
  }

  .wcc-push-btn:hover {
    opacity: 0.88;
  }
</style>
