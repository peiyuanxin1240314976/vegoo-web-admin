<script setup lang="ts">
  import { ref, onMounted, onUnmounted, nextTick } from 'vue'
  import * as echarts from 'echarts'

  // ─── KPI 数据 ────────────────────────────────────────────────
  const kpiCards = [
    {
      label: '预估利润',
      badge: '⚠ 预估值',
      badgeColor: '#f5a623',
      value: '+$36,440',
      valueColor: '#a855f7',
      sub: '广告收入+付费-广告支出',
      border: 'linear-gradient(135deg,#7c3aed,#a855f7)',
      bg: 'rgba(124,58,237,0.12)'
    },
    {
      label: '总收入',
      value: '$125,680',
      valueColor: '#4ade80',
      sub: '广告$98,240 + 付费$27,440',
      border: 'linear-gradient(135deg,#16a34a,#4ade80)',
      bg: 'rgba(22,163,74,0.10)'
    },
    {
      label: '广告支出',
      value: '$89,240',
      valueColor: '#fb923c',
      sub: '自投$88,934 + 代投$306',
      border: 'linear-gradient(135deg,#c2410c,#fb923c)',
      bg: 'rgba(194,65,12,0.10)'
    },
    {
      label: '广告收益率',
      value: '40.8%',
      valueColor: '#38bdf8',
      sub: '(广告收入-广告支出)/广告支出',
      border: 'linear-gradient(135deg,#0369a1,#38bdf8)',
      bg: 'rgba(3,105,161,0.10)'
    },
    {
      label: '付费收入占比',
      value: '21.8%',
      valueColor: '#2dd4bf',
      sub: '付费$27,440/总$125,680',
      border: 'linear-gradient(135deg,#0d9488,#2dd4bf)',
      bg: 'rgba(13,148,136,0.10)'
    }
  ]

  // ─── 应用利润详情 ────────────────────────────────────────────
  const appRows = [
    {
      app: 'Weather5',
      adRev: '$45,200',
      paidRev: '$12,100',
      total: '$57,300',
      adSpend: '$38,500',
      profit: '+$18,800',
      profitColor: '#4ade80',
      rate: '32.8%',
      rateColor: '#4ade80',
      trend: 'up'
    },
    {
      app: 'PhoneTracker',
      adRev: '$28,600',
      paidRev: '$8,200',
      total: '$36,800',
      adSpend: '$22,400',
      profit: '+$14,400',
      profitColor: '#4ade80',
      rate: '39.1%',
      rateColor: '#4ade80',
      trend: 'up'
    },
    {
      app: 'BloodSugar2',
      adRev: '$15,300',
      paidRev: '$4,800',
      total: '$20,100',
      adSpend: '$18,200',
      profit: '+$1,900',
      profitColor: '#facc15',
      rate: '9.5%',
      rateColor: '#facc15',
      trend: 'flat'
    },
    {
      app: 'HealthTracker',
      adRev: '$9,100',
      paidRev: '$2,340',
      total: '$11,440',
      adSpend: '$10,140',
      profit: '-$700',
      profitColor: '#f87171',
      rate: '-6.1%',
      rateColor: '#f87171',
      trend: 'down'
    },
    {
      app: 'FaceMe',
      adRev: '$0',
      paidRev: '$0',
      total: '$0',
      adSpend: '$0',
      profit: '$0',
      profitColor: '#94a3b8',
      rate: 'N/A',
      rateColor: '#94a3b8',
      trend: 'none'
    }
  ]

  // ─── 国家 Top10 ──────────────────────────────────────────────
  const countryRows = [
    {
      flag: '🇺🇸',
      name: '美国',
      adRev: '$52,000',
      paidRev: '$14,200',
      adSpend: '$38,500',
      profit: '+$27,700',
      profitColor: '#4ade80',
      rate: '53.3%',
      rateColor: '#4ade80'
    },
    {
      flag: '🇰🇷',
      name: '韩国',
      adRev: '$11,200',
      paidRev: '$3,100',
      adSpend: '$8,400',
      profit: '+$5,900',
      profitColor: '#4ade80',
      rate: '52.7%',
      rateColor: '#4ade80'
    },
    {
      flag: '🇩🇪',
      name: '德国',
      adRev: '$7,800',
      paidRev: '$2,200',
      adSpend: '$6,100',
      profit: '+$3,900',
      profitColor: '#4ade80',
      rate: '50.0%',
      rateColor: '#4ade80'
    },
    {
      flag: '🇿🇦',
      name: '南非',
      adRev: '$9,600',
      paidRev: '$1,200',
      adSpend: '$8,200',
      profit: '+$2,600',
      profitColor: '#4ade80',
      rate: '27.1%',
      rateColor: '#4ade80'
    }
  ]

  // ─── 图表 refs ────────────────────────────────────────────────
  const mapRef = ref<HTMLElement | null>(null)
  const trendRef = ref<HTMLElement | null>(null)
  const sankeyRef = ref<HTMLElement | null>(null)

  let mapChart: echarts.ECharts | null = null
  let trendChart: echarts.ECharts | null = null
  let sankeyChart: echarts.ECharts | null = null

  // ─── 世界地图 ─────────────────────────────────────────────────
  async function initMap() {
    if (!mapRef.value) return
    const res = await fetch('/geo/world.json')
    const geoJson = await res.json()
    echarts.registerMap('world', geoJson)

    mapChart = echarts.init(mapRef.value, 'dark', { renderer: 'canvas' })
    const mapData = [
      { name: 'United States', value: 27700 },
      { name: 'South Korea', value: 5900 },
      { name: 'Germany', value: 3900 },
      { name: 'South Africa', value: 2600 },
      { name: 'Japan', value: 2100 },
      { name: 'United Kingdom', value: 1800 },
      { name: 'Australia', value: 1500 },
      { name: 'Canada', value: 1200 },
      { name: 'France', value: 900 },
      { name: 'Brazil', value: 600 }
    ]

    mapChart.setOption({
      backgroundColor: 'transparent',
      geo: {
        map: 'world',
        roam: false,
        silent: false,
        itemStyle: {
          areaColor: '#1a2744',
          borderColor: '#0f1f3d',
          borderWidth: 0.5
        },
        emphasis: {
          itemStyle: { areaColor: '#2563eb' },
          label: { show: false }
        }
      },
      series: [
        {
          type: 'map',
          map: 'world',
          geoIndex: 0,
          data: mapData,
          silent: false
        },
        {
          type: 'effectScatter',
          coordinateSystem: 'geo',
          rippleEffect: { brushType: 'stroke', scale: 3, period: 3 },
          symbolSize: 8,
          itemStyle: { color: '#4ade80' },
          data: [
            { name: '美国 +$18,200', value: [-95, 38, 18200] },
            { name: '韩国 +$4,800', value: [127, 37, 4800] },
            { name: '德国 +$3,200', value: [10, 51, 3200] },
            { name: '南非 +$2,100', value: [25, -29, 2100] }
          ],
          label: {
            show: true,
            formatter: (p: any) => p.name,
            position: 'right',
            color: '#e2e8f0',
            fontSize: 11,
            distance: 8
          }
        }
      ],
      visualMap: {
        min: 0,
        max: 30000,
        show: false,
        inRange: {
          color: ['#1a2744', '#1e4080', '#1d6fa4', '#22c55e']
        }
      }
    })
  }

  // ─── 利润趋势折线图 ────────────────────────────────────────────
  function generateTrendData(base: number, variance: number, len = 30) {
    const data: number[] = []
    let v = base
    for (let i = 0; i < len; i++) {
      v += (Math.random() - 0.48) * variance
      v = Math.max(base * 0.4, v)
      data.push(Math.round(v))
    }
    return data
  }

  function initTrend() {
    if (!trendRef.value) return
    trendChart = echarts.init(trendRef.value, 'dark', { renderer: 'canvas' })

    const days = Array.from({ length: 30 }, (_, i) => `${String(i + 1).padStart(2, '0')}天`)
    const revenue = generateTrendData(4000, 600, 30)
    const adSpend = generateTrendData(2800, 400, 30)
    const profit = revenue.map((r, i) => Math.round(r - adSpend[i]))

    trendChart.setOption({
      backgroundColor: 'transparent',
      grid: { top: 30, right: 20, bottom: 30, left: 50 },
      legend: {
        top: 4,
        right: 10,
        itemWidth: 20,
        itemHeight: 2,
        textStyle: { color: '#94a3b8', fontSize: 11 },
        data: [
          { name: '总收入', icon: 'rect' },
          { name: '广告支出', icon: 'rect' },
          { name: '预估利润', icon: 'rect' }
        ]
      },
      xAxis: {
        type: 'category',
        data: days,
        axisLine: { lineStyle: { color: '#1e3a5f' } },
        axisTick: { show: false },
        axisLabel: { color: '#475569', fontSize: 10, interval: 1 }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 5000,
        splitLine: { lineStyle: { color: '#1e3a5f', type: 'dashed' } },
        axisLabel: { color: '#475569', fontSize: 10 }
      },
      series: [
        {
          name: '总收入',
          type: 'line',
          data: revenue,
          smooth: true,
          symbol: 'none',
          lineStyle: { color: '#4ade80', width: 2 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(74,222,128,0.35)' },
              { offset: 1, color: 'rgba(74,222,128,0.02)' }
            ])
          }
        },
        {
          name: '广告支出',
          type: 'line',
          data: adSpend,
          smooth: true,
          symbol: 'none',
          lineStyle: { color: '#fb923c', width: 2 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(251,146,60,0.25)' },
              { offset: 1, color: 'rgba(251,146,60,0.02)' }
            ])
          }
        },
        {
          name: '预估利润',
          type: 'line',
          data: profit,
          smooth: true,
          symbol: 'none',
          lineStyle: { color: '#a78bfa', width: 2, type: 'dashed' }
        }
      ],
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#0f1f3d',
        borderColor: '#1e40af',
        textStyle: { color: '#e2e8f0', fontSize: 12 }
      }
    })
  }

  // ─── 桑基图（利润构成）────────────────────────────────────────
  function initSankey() {
    if (!sankeyRef.value) return
    sankeyChart = echarts.init(sankeyRef.value, 'dark', { renderer: 'canvas' })

    sankeyChart.setOption({
      backgroundColor: 'transparent',
      series: [
        {
          type: 'sankey',
          layout: 'none',
          emphasis: { focus: 'adjacency' },
          nodeWidth: 20,
          nodeGap: 12,
          left: '8%',
          right: '8%',
          top: '8%',
          bottom: '8%',
          data: [
            { name: '广告收入(IAA)\n$98,240', itemStyle: { color: '#38bdf8' } },
            { name: '付费收入(IAP)\n$27,440', itemStyle: { color: '#2dd4bf' } },
            { name: '总收入\n$125,680', itemStyle: { color: '#818cf8' } },
            { name: '广告支出\n$89,240', itemStyle: { color: '#fb923c' } },
            { name: '预估利润\n$36,440', itemStyle: { color: '#a855f7' } }
          ],
          links: [
            { source: '广告收入(IAA)\n$98,240', target: '总收入\n$125,680', value: 98240 },
            { source: '付费收入(IAP)\n$27,440', target: '总收入\n$125,680', value: 27440 },
            { source: '总收入\n$125,680', target: '广告支出\n$89,240', value: 89240 },
            { source: '总收入\n$125,680', target: '预估利润\n$36,440', value: 36440 }
          ],
          label: {
            color: '#e2e8f0',
            fontSize: 11,
            formatter: (p: any) => p.name
          },
          lineStyle: {
            color: 'gradient',
            opacity: 0.4,
            curveness: 0.5
          }
        }
      ],
      tooltip: {
        trigger: 'item',
        backgroundColor: '#0f1f3d',
        borderColor: '#1e40af',
        textStyle: { color: '#e2e8f0' }
      }
    })
  }

  // ─── 趋势迷你 sparkline ───────────────────────────────────────
  function getTrendPath(type: 'up' | 'down' | 'flat' | 'none'): string {
    if (type === 'none') return ''
    if (type === 'flat') return 'M0,10 C10,10 20,10 30,10 C40,10 50,10 60,10'
    if (type === 'up') return 'M0,18 C10,16 20,12 30,9 C40,6 50,4 60,2'
    return 'M0,2 C10,4 20,6 30,9 C40,12 50,16 60,18'
  }
  function getTrendColor(type: 'up' | 'down' | 'flat' | 'none'): string {
    if (type === 'up') return '#4ade80'
    if (type === 'down') return '#f87171'
    if (type === 'flat') return '#facc15'
    return '#475569'
  }

  // ─── resize ───────────────────────────────────────────────────
  function handleResize() {
    mapChart?.resize()
    trendChart?.resize()
    sankeyChart?.resize()
  }

  onMounted(async () => {
    await nextTick()
    await initMap()
    initTrend()
    initSankey()
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    mapChart?.dispose()
    trendChart?.dispose()
    sankeyChart?.dispose()
  })
</script>

<template>
  <div class="bi-root">
    <!-- ─── Header ─────────────────────────────── -->
    <header class="bi-header">
      <div class="bi-breadcrumb">
        <span class="bi-brand">商业洞察</span>
        <span class="bi-sep">›</span>
        <span class="bi-page">利用+国家)</span>
      </div>
      <div class="bi-filters">
        <div class="filter-btn">
          <span class="filter-icon">📅</span>
          <span class="filter-label">日期范围：</span>
          <span class="filter-val">2026-03-01 ～ 2026-03-05</span>
        </div>
        <div class="filter-btn">
          <span class="filter-icon">⊞</span>
          <span class="filter-label">应用：</span>
          <span class="filter-val">全部</span>
        </div>
        <div class="filter-btn">
          <span class="filter-icon">🌐</span>
          <span class="filter-label">国家：</span>
          <span class="filter-val">全部</span>
        </div>
      </div>
    </header>

    <!-- ─── KPI Row ────────────────────────────── -->
    <section class="bi-kpi-row">
      <div
        v-for="card in kpiCards"
        :key="card.label"
        class="kpi-card"
        :style="{ background: card.bg, '--card-border': card.border }"
      >
        <div class="kpi-top">
          <span class="kpi-label">{{ card.label }}</span>
          <span
            v-if="card.badge"
            class="kpi-badge"
            :style="{ color: card.badgeColor, borderColor: card.badgeColor }"
            >{{ card.badge }}</span
          >
        </div>
        <div class="kpi-value" :style="{ color: card.valueColor }">{{ card.value }}</div>
        <div class="kpi-sub">{{ card.sub }}</div>
      </div>
    </section>

    <!-- ─── Middle Row ─────────────────────────── -->
    <section class="bi-mid-row">
      <!-- App Table -->
      <div class="bi-card bi-app-table">
        <div class="card-title">应用利润详情</div>
        <table class="data-table">
          <thead>
            <tr>
              <th>应用</th>
              <th>广告收入(预)</th>
              <th>付费收入</th>
              <th>总收入</th>
              <th>广告支出</th>
              <th>预估利润</th>
              <th>利润率</th>
              <th>趋势</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in appRows" :key="row.app">
              <td class="td-app">{{ row.app }}</td>
              <td>{{ row.adRev }}</td>
              <td>{{ row.paidRev }}</td>
              <td>{{ row.total }}</td>
              <td>{{ row.adSpend }}</td>
              <td :style="{ color: row.profitColor, fontWeight: 600 }">{{ row.profit }}</td>
              <td :style="{ color: row.rateColor, fontWeight: 600 }">{{ row.rate }}</td>
              <td class="td-trend">
                <svg v-if="row.trend !== 'none'" width="60" height="20" viewBox="0 0 60 20">
                  <path
                    :d="getTrendPath(row.trend as any)"
                    fill="none"
                    :stroke="getTrendColor(row.trend as any)"
                    stroke-width="1.8"
                    stroke-linecap="round"
                  />
                </svg>
                <span v-else style="color: #475569">—</span>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="tr-total">
              <td class="td-app">Total</td>
              <td>$98,200</td>
              <td>$27,440</td>
              <td>$125,640</td>
              <td>$89,240</td>
              <td style="font-weight: 700; color: #4ade80">+$36,400</td>
              <td style="font-weight: 700; color: #4ade80">40.8%</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- World Map + Country Table -->
      <div class="bi-card bi-map-panel">
        <div class="card-title">国家利润分布</div>
        <div ref="mapRef" class="world-map"></div>
        <div class="card-title" style="margin-top: 12px">国家利润详情 Top10</div>
        <table class="data-table country-table">
          <thead>
            <tr>
              <th>国家</th>
              <th>广告收入</th>
              <th>付费收入</th>
              <th>广告支出</th>
              <th>利润</th>
              <th>利润率</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in countryRows" :key="row.name">
              <td class="td-country"
                ><span class="cflag">{{ row.flag }}</span> {{ row.name }}</td
              >
              <td>{{ row.adRev }}</td>
              <td>{{ row.paidRev }}</td>
              <td>{{ row.adSpend }}</td>
              <td :style="{ color: row.profitColor, fontWeight: 600 }">{{ row.profit }}</td>
              <td :style="{ color: row.rateColor, fontWeight: 600 }">{{ row.rate }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- ─── Bottom Row ─────────────────────────── -->
    <section class="bi-bot-row">
      <!-- Trend Chart -->
      <div class="bi-card bi-trend">
        <div class="card-title">利润趋势（近30天）</div>
        <div ref="trendRef" class="chart-area"></div>
      </div>

      <!-- Sankey Chart -->
      <div class="bi-card bi-sankey">
        <div class="card-title">利润构成分析</div>
        <div ref="sankeyRef" class="chart-area"></div>
      </div>
    </section>

    <!-- ─── Footer Notice ──────────────────────── -->
    <footer class="bi-footer">
      <span class="footer-warn">⚠ 真实利润需月度对账后确认，当前为预估值</span>
    </footer>
  </div>
</template>

<style scoped lang="scss">
  // ─── CSS Variables ────────────────────────────────────────────
  .bi-root {
    --bg-deep: #070f1e;
    --bg-card: #0d1b2e;
    --bg-card2: #0f2040;
    --border: #1a3052;
    --border-hl: #1e4080;
    --text-pri: #e2e8f0;
    --text-sec: #64748b;
    --text-muted: #334155;
    --green: #4ade80;
    --orange: #fb923c;
    --purple: #a855f7;
    --cyan: #2dd4bf;
    --yellow: #facc15;
    --red: #f87171;

    min-height: 100vh;
    padding: 0 0 16px;
    font-family: 'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', sans-serif;
    font-size: 13px;
    color: var(--text-pri);
    user-select: none;
    background: var(--bg-deep);
  }

  // ─── Header ───────────────────────────────────────────────────
  .bi-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 24px;
    background: linear-gradient(180deg, #0b1729 0%, var(--bg-deep) 100%);
    border-bottom: 1px solid var(--border);
  }

  .bi-breadcrumb {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 16px;
    font-weight: 700;
  }

  .bi-brand {
    color: #38bdf8;
    letter-spacing: 0.5px;
  }

  .bi-sep {
    color: #475569;
  }

  .bi-page {
    color: var(--text-pri);
  }

  .bi-filters {
    display: flex;
    gap: 10px;
  }

  .filter-btn {
    display: flex;
    gap: 5px;
    align-items: center;
    padding: 5px 14px;
    font-size: 12px;
    cursor: pointer;
    background: var(--bg-card2);
    border: 1px solid var(--border-hl);
    border-radius: 6px;
    transition: border-color 0.2s;

    &:hover {
      border-color: #38bdf8;
    }
  }

  .filter-label {
    color: var(--text-sec);
  }

  .filter-val {
    font-weight: 500;
    color: var(--text-pri);
  }

  .filter-icon {
    font-size: 13px;
  }

  // ─── KPI Row ──────────────────────────────────────────────────
  .bi-kpi-row {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 14px;
    padding: 16px 24px 0;
  }

  .kpi-card {
    position: relative;
    padding: 14px 16px 12px;
    overflow: hidden;
    background-clip: padding-box;
    border: 1px solid transparent;
    border-radius: 10px;

    &::before {
      position: absolute;
      inset: 0;
      padding: 1px;
      pointer-events: none;
      content: '';
      background: var(--card-border);
      border-radius: 10px;
      -webkit-mask:
        linear-gradient(#fff 0 0) content-box,
        linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
    }
  }

  .kpi-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
  }

  .kpi-label {
    font-size: 12px;
    font-weight: 500;
    color: var(--text-sec);
  }

  .kpi-badge {
    padding: 1px 6px;
    font-size: 10px;
    background: rgb(255 255 255 / 4%);
    border: 1px solid currentcolor;
    border-radius: 4px;
  }

  .kpi-value {
    margin-bottom: 6px;
    font-size: 26px;
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: -0.5px;
  }

  .kpi-sub {
    font-size: 11px;
    color: var(--text-sec);
  }

  // ─── Shared Card ──────────────────────────────────────────────
  .bi-card {
    padding: 14px 16px;
    overflow: hidden;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 10px;
  }

  .card-title {
    padding-bottom: 6px;
    margin-bottom: 10px;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-pri);
    border-bottom: 1px solid var(--border);
  }

  // ─── Middle Row ───────────────────────────────────────────────
  .bi-mid-row {
    display: grid;
    grid-template-columns: 1fr 420px;
    gap: 14px;
    padding: 14px 24px 0;
  }

  // ─── Data Table ───────────────────────────────────────────────
  .data-table {
    width: 100%;
    font-size: 12px;
    border-collapse: collapse;

    th {
      padding: 6px 8px;
      font-weight: 500;
      color: var(--text-sec);
      text-align: right;
      white-space: nowrap;
      border-bottom: 1px solid var(--border);

      &:first-child {
        text-align: left;
      }
    }

    td {
      padding: 7px 8px;
      color: #cbd5e1;
      text-align: right;
      border-bottom: 1px solid rgb(30 64 128 / 40%);

      &:first-child {
        text-align: left;
      }
    }

    tbody tr:hover td {
      background: rgb(30 64 128 / 18%);
    }
  }

  .td-app {
    font-weight: 500;
    color: var(--text-pri) !important;
  }

  .td-trend {
    text-align: center !important;
  }

  .td-country {
    display: flex;
    gap: 6px;
    align-items: center;
    font-weight: 500;
    color: var(--text-pri) !important;
  }

  .cflag {
    font-size: 14px;
  }

  .tr-total td {
    font-weight: 700 !important;
    color: var(--text-pri) !important;
    border-top: 1px solid var(--border-hl);
    border-bottom: none;
  }

  // ─── World Map ────────────────────────────────────────────────
  .world-map {
    width: 100%;
    height: 200px;
    overflow: hidden;
    border-radius: 6px;
  }

  .country-table th,
  .country-table td {
    padding: 5px 8px;
  }

  // ─── Bottom Row ───────────────────────────────────────────────
  .bi-bot-row {
    display: grid;
    grid-template-columns: 1fr 420px;
    gap: 14px;
    padding: 14px 24px 0;
  }

  .chart-area {
    width: 100%;
    height: 240px;
  }

  // ─── Footer ───────────────────────────────────────────────────
  .bi-footer {
    padding: 8px 16px;
    margin: 14px 24px 0;
    text-align: center;
    background: rgb(245 166 35 / 8%);
    border: 1px solid rgb(245 166 35 / 30%);
    border-radius: 6px;
  }

  .footer-warn {
    font-size: 12px;
    color: #f5a623;
  }

  // ─── Responsive ───────────────────────────────────────────────
  @media (width <= 1280px) {
    .bi-kpi-row {
      grid-template-columns: repeat(3, 1fr);
    }

    .bi-mid-row,
    .bi-bot-row {
      grid-template-columns: 1fr;
    }
  }
</style>
