<template>
  <div class="weekly-campaigns">
    <!-- Summary bar -->
    <div class="summary-bar">
      <div class="summary-group">
        <div class="s-item"
          ><span class="s-dot active"></span><span class="s-l">在投系列</span
          ><span class="s-v">14个</span></div
        >
        <div class="s-item"
          ><span class="s-dot paused"></span><span class="s-l">已暂停</span
          ><span class="s-v">3个</span></div
        >
      </div>
      <div class="s-divider"></div>
      <div class="s-item"
        ><span class="s-l">总广告支出</span><span class="s-v highlight">$287,700</span></div
      >

      <!-- Mini Stacked Bar Chart -->
      <div class="mini-chart-wrap">
        <div ref="miniChartRef" class="mini-chart"></div>
      </div>
    </div>

    <!-- Campaigns Table with heatmap ROI -->
    <div class="data-card">
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
              <td
                ><span class="flag">{{ row.countryFlag }}</span> {{ row.country }}</td
              >
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
              <td
                ><div :class="['heat-cell', heatClass(row.roi1d)]">{{ row.roi1d }}</div></td
              >
              <td
                ><div :class="['heat-cell', heatClass(row.roi3d)]">{{ row.roi3d }}</div></td
              >
              <td
                ><div :class="['heat-cell', heatClass(row.roi7d)]">{{ row.roi7d }}</div></td
              >
              <td
                ><div :class="['heat-cell', heatClass(row.roi14d)]">{{ row.roi14d }}</div></td
              >
              <td
                ><div :class="['heat-cell', heatClass(row.roi30d)]">{{ row.roi30d }}</div></td
              >
            </tr>
          </tbody>
        </table>
      </div>
      <div class="table-footer"> 在投 14 个 | 已暂停 3 个 | 总广告支出 $287,700 </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue'
  import * as echarts from 'echarts'
  import { campaignData } from './mockData'

  const campaigns = campaignData.map((c) => ({
    ...c,
    adSpend:
      c.adSpend === '$0'
        ? '$0'
        : '$' + (parseInt(c.adSpend.replace(/[$,]/g, '')) * 7).toLocaleString()
  }))

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
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 12px;
    padding: 14px;
    overflow-y: auto;
  }

  .summary-bar {
    display: flex;
    gap: 16px;
    align-items: center;
    padding: 10px 16px;
    background: rgb(255 255 255 / 3%);
    border: 1px solid rgb(255 255 255 / 7%);
    border-radius: 10px;
  }

  .summary-group {
    display: flex;
    gap: 16px;
  }

  .s-item {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .s-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .s-dot.active {
    background: #00d4a1;
  }

  .s-dot.paused {
    background: #f59e0b;
  }

  .s-l {
    font-size: 11px;
    color: rgb(255 255 255 / 45%);
  }

  .s-v {
    font-size: 14px;
    font-weight: 700;
    color: rgb(255 255 255 / 90%);
  }

  .s-v.highlight {
    color: #00d4a1;
  }

  .s-divider {
    width: 1px;
    height: 20px;
    background: rgb(255 255 255 / 10%);
  }

  .mini-chart-wrap {
    margin-left: auto;
  }

  .mini-chart {
    width: 80px;
    height: 36px;
  }

  .data-card {
    flex: 1;
    padding: 14px;
    background: rgb(255 255 255 / 2%);
    border: 1px solid rgb(255 255 255 / 7%);
    border-radius: 10px;
  }

  .table-title {
    margin-bottom: 10px;
    font-size: 11px;
    font-weight: 700;
    color: rgb(255 255 255 / 35%);
    letter-spacing: 0.1em;
  }

  .table-wrap {
    overflow-x: auto;
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

  /* Heatmap cells */
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

  .table-footer {
    margin-top: 10px;
    font-size: 11px;
    color: rgb(255 255 255 / 40%);
  }
</style>
