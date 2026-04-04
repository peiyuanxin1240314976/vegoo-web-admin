<template>
  <div class="product-tab">
    <!-- ── KPI Cards ─────────────────────────────── -->
    <div class="kpi-row">
      <div
        class="kpi-card"
        v-for="(kpi, i) in kpiCards"
        :key="i"
        :style="{ '--accent': kpi.color }"
      >
        <div class="kpi-info">
          <div class="kpi-label">{{ kpi.label }}</div>
          <div class="kpi-value" :style="{ color: kpi.color }">{{ kpi.value }}</div>
          <div class="kpi-meta">
            <span :class="kpi.trendUp !== false ? 'trend-up' : 'trend-down'" v-if="kpi.trendVal">
              {{ kpi.trendUp !== false ? '↑' : '↓' }}{{ kpi.trendVal }}
            </span>
            <span class="kpi-sub">{{ kpi.sub }}</span>
          </div>
        </div>
        <div class="kpi-spark" :ref="(el) => setSparkRef(el as HTMLElement, i)"></div>
      </div>
    </div>

    <!-- ── Top Grid: Product Table + Donut ───────── -->
    <div class="top-grid">
      <!-- Product Revenue Table with sub-tabs -->
      <div class="card product-table-card">
        <div class="table-header-row">
          <span class="card-hd">商品收入排行表</span>
          <div class="sub-tabs">
            <span
              v-for="st in subTabs"
              :key="st.key"
              class="sub-tab"
              :class="{ 'sub-tab-active': activeSubTab === st.key }"
              @click="activeSubTab = st.key"
            >
              {{ st.label }}
            </span>
          </div>
        </div>
        <table class="dt product-rank-table">
          <thead>
            <tr>
              <th>商品名称</th><th>价格</th><th>类型</th>
              <th :class="{ 'col-emphasis': activeSubTab === 'revenue' }">收入</th>
              <th>占比</th>
              <th :class="{ 'col-emphasis': activeSubTab === 'orders' }">订单量</th>
              <th>ARPPU</th>
              <th :class="{ 'col-emphasis': activeSubTab === 'retention' }">续费率</th>
              <th :class="{ 'col-emphasis': activeSubTab === 'country' }">国家Top3</th>
              <th>30天趋势</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in sortedProductRows" :key="r.name">
              <td class="pname">{{ r.name }}</td>
              <td>{{ r.price }}</td>
              <td
                ><span class="type-tag" :class="r.typeClass">{{ r.type }}</span></td
              >
              <td
                class="text-white font-semibold"
                :class="{ 'col-emphasis': activeSubTab === 'revenue' }"
                >{{ r.revenue }}</td
              >
              <td>{{ r.pct }}%</td>
              <td :class="{ 'col-emphasis': activeSubTab === 'orders' }">{{ r.orders }}</td>
              <td>{{ r.arppu }}</td>
              <td :class="{ 'col-emphasis': activeSubTab === 'retention' }">
                <span :class="parseFloat(r.retention) >= 60 ? 'val-green' : 'val-red'">
                  {{ r.retention }}%
                </span>
              </td>
              <td class="val-muted" :class="{ 'col-emphasis': activeSubTab === 'country' }">{{
                r.countries
              }}</td>
              <td>
                <div
                  class="mini-trend"
                  :ref="(el) => setMiniRef(el as HTMLElement, r.name)"
                  style="display: inline-block; width: 60px; height: 24px"
                ></div>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td>合计</td><td>--</td><td>--</td> <td><b>$284,520</b></td
              ><td><b>100%</b></td> <td><b>14,728</b></td
              ><td><b>$30.82</b></td> <td><b>68.4%</b></td
              ><td>--</td><td>--</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Revenue Composition Donut -->
      <div class="card donut-card">
        <div class="card-hd">商品收入构成</div>
        <div ref="donutRef" style="height: 200px"></div>
        <div class="donut-legend">
          <div v-for="item in donutLegend" :key="item.name" class="dl-item">
            <span class="dl-dot" :style="{ background: item.color }"></span>
            <span class="dl-name">{{ item.name }}</span>
            <span class="dl-pct">{{ item.pct }}%</span>
            <span class="dl-val">{{ item.val }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Bottom Grid: Date Table + Right Charts ─── -->
    <div class="btm-grid">
      <!-- Date-based Order Summary -->
      <div class="card date-table-card">
        <div class="card-hd">按付费日期订单汇总（订阅/首购/续订/内购分类）</div>
        <div class="card-sub-hd">注：总订阅数为截止到指定日期有效的订阅订单数量</div>
        <table class="dt sm-dt">
          <thead>
            <tr>
              <th rowspan="2">付费日期</th>
              <th rowspan="2">总订阅数</th>
              <th colspan="5">订单数量</th>
              <th colspan="4">收入 (USD)</th>
            </tr>
            <tr>
              <th>付费</th><th>订阅</th><th>内购</th><th>续订</th> <th>退款</th><th>取消</th>
              <th>付费</th><th>订阅</th><th>内购</th><th>续订</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in dateRows" :key="r.date">
              <td>{{ r.date }}</td>
              <td>{{ r.total }}</td>
              <td>{{ r.paid }}</td
              ><td>{{ r.sub }}</td> <td>{{ r.iap }}</td
              ><td>{{ r.renew }}</td> <td>{{ r.refund }}</td
              ><td>{{ r.cancel }}</td>
              <td class="val-cyan">{{ r.revPaid }}</td>
              <td>{{ r.revSub }}</td>
              <td>{{ r.revIap }}</td>
              <td>{{ r.revRenew }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td>合计</td><td>8,790</td> <td>889</td><td>834</td><td>115</td><td>42</td><td>1</td
              ><td>6</td>
              <td>$13</td>
              <td class="val-cyan">$34,520</td><td>$27,094</td> <td>$4,643</td><td>$15,899</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Right column: trend + retention + bar -->
      <div class="right-col">
        <!-- Revenue Trend Line -->
        <div class="card">
          <div class="card-hd">商品收入趋势近30天</div>
          <div ref="trendRef" style="height: 150px"></div>
        </div>

        <!-- Subscription Retention by Product -->
        <div class="card">
          <div class="card-hd">订阅续费率队列（按商品）</div>
          <table class="dt sm-dt hm-dt">
            <thead>
              <tr>
                <th>商品</th>
                <th>Month1</th><th>Month2</th> <th>Month3</th><th>Month4</th><th>Month5</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in prodRetenRows" :key="r.name">
                <td class="pname-sm">{{ r.name }}</td>
                <td
                  ><span class="hm-cell" :class="hmCls(r.m1)">{{ r.m1 }}%</span></td
                >
                <td
                  ><span class="hm-cell" :class="hmCls(r.m2)">{{ r.m2 }}%</span></td
                >
                <td
                  ><span class="hm-cell" :class="hmCls(r.m3)">{{ r.m3 }}%</span></td
                >
                <td
                  ><span class="hm-cell" :class="hmCls(r.m4)">{{ r.m4 }}%</span></td
                >
                <td
                  ><span class="hm-cell" :class="hmCls(r.m5)">{{ r.m5 }}%</span></td
                >
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Country Distribution Bar -->
        <div class="card">
          <div class="card-hd">商品国家分布 Top6</div>
          <div ref="countryRef" style="height: 150px"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
  import * as echarts from 'echarts'

  defineOptions({ name: 'IAPProductTab' })

  const props = defineProps<{
    filters: {
      appId: string
      platform: string
      country: string
      date: string
    }
    searchToken: number
  }>()

  /* ── Refs ─────────────────────────────────────── */
  const donutRef = ref<HTMLElement | null>(null)
  const trendRef = ref<HTMLElement | null>(null)
  const countryRef = ref<HTMLElement | null>(null)
  const sparkRefs = ref<(HTMLElement | null)[]>([])
  const miniRefs = new Map<string, HTMLElement>()
  const chartInstances: echarts.ECharts[] = []

  function setSparkRef(el: HTMLElement | null, i: number) {
    sparkRefs.value[i] = el
  }
  function setMiniRef(el: HTMLElement | null, name: string) {
    if (el) miniRefs.set(name, el)
  }

  /* ── Sub-tabs ─────────────────────────────────── */
  const activeSubTab = ref('revenue')
  const subTabs = [
    { key: 'revenue', label: '收入' },
    { key: 'orders', label: '订单量' },
    { key: 'retention', label: '续费率' },
    { key: 'country', label: '国家分布' }
  ]

  function parseRankRevenueUsd(s: string): number {
    const n = Number(String(s).replace(/[$,]/g, ''))
    return Number.isFinite(n) ? n : 0
  }

  function parseRankOrders(s: string): number {
    const n = Number(String(s).replace(/,/g, ''))
    return Number.isFinite(n) ? n : 0
  }

  function parseRankRetention(s: string): number {
    if (!s || s === 'N/A') return -1
    const n = Number(s)
    return Number.isFinite(n) ? n : -1
  }

  function parseRankCountrySpread(s: string): number {
    if (!s) return 0
    return s.split('/').filter(Boolean).length
  }

  /** 商品收入排行表：子 Tab 仅前端按维度降序排序，不重拉接口（与契约 03-tab-product interaction 一致） */
  const sortedProductRows = computed(() => {
    const key = activeSubTab.value
    const rows = [...productRows]
    rows.sort((a, b) => {
      let va = 0
      let vb = 0
      if (key === 'revenue') {
        va = parseRankRevenueUsd(a.revenue)
        vb = parseRankRevenueUsd(b.revenue)
      } else if (key === 'orders') {
        va = parseRankOrders(a.orders)
        vb = parseRankOrders(b.orders)
      } else if (key === 'retention') {
        va = parseRankRetention(a.retention)
        vb = parseRankRetention(b.retention)
      } else {
        va = parseRankCountrySpread(a.countries)
        vb = parseRankCountrySpread(b.countries)
      }
      return vb - va
    })
    return rows
  })

  /* ── KPI ─────────────────────────────────────── */
  const kpiCards = [
    {
      label: '商品总收入',
      value: '$284,520',
      trendUp: true,
      trendVal: '8.4% vs.上月',
      sub: '',
      color: '#22d3ee',
      sparkData: [6.2, 7.1, 6.8, 7.5, 8.0, 8.3, 8.7],
      sparkType: 'line'
    },
    {
      label: '订阅收入占比',
      value: '70.0%',
      trendUp: false,
      trendVal: '',
      sub: '年订+月订',
      color: '#8b5cf6',
      sparkData: [68, 69, 70, 69, 71, 70, 70],
      sparkType: 'line'
    },
    {
      label: '活跃商品数',
      value: '7个',
      trendUp: false,
      trendVal: '',
      sub: '共4类型',
      color: '#3b82f6',
      sparkData: [5, 6, 6, 7, 7, 7, 7],
      sparkType: 'bar'
    },
    {
      label: '平均ARPPU',
      value: '$30.82',
      trendUp: true,
      trendVal: '2.3% vs.上月',
      sub: '',
      color: '#f59e0b',
      sparkData: [29, 30, 29, 31, 30, 31, 31],
      sparkType: 'line'
    },
    {
      label: '订阅续费率',
      value: '68.4%',
      trendUp: true,
      trendVal: '3.2pp vs.上月',
      sub: '',
      color: '#10b981',
      sparkData: [63, 65, 64, 66, 67, 68, 68],
      sparkType: 'line'
    }
  ]

  /* ── Product Rows ─────────────────────────────── */
  const productRows = [
    {
      name: 'Weather Premium Annual',
      price: '$89.99',
      type: '年度订阅',
      typeClass: 'type-year',
      revenue: '$119,480',
      pct: 42.0,
      orders: '1,328',
      arppu: '$89.99',
      retention: '78.4',
      countries: 'US/KR/DE',
      trendData: [3.2, 3.5, 3.8, 4.0, 3.9, 4.2, 4.4]
    },
    {
      name: 'Weather Premium Monthly',
      price: '$9.99',
      type: '月度订阅',
      typeClass: 'type-month',
      revenue: '$79,680',
      pct: 28.0,
      orders: '7,976',
      arppu: '$9.99',
      retention: '58.2',
      countries: 'US/JP/TW',
      trendData: [2.6, 2.4, 2.7, 2.9, 3.1, 3.0, 3.2]
    },
    {
      name: 'Weather Lifetime Unlock',
      price: '$49.99',
      type: '终身购买',
      typeClass: 'type-lifetime',
      revenue: '$51,190',
      pct: 18.0,
      orders: '1,024',
      arppu: '$49.99',
      retention: 'N/A',
      countries: 'US/DE/GB',
      trendData: [1.6, 1.8, 1.7, 2.0, 1.9, 2.1, 2.0]
    },
    {
      name: 'Coin Pack 1000',
      price: '$9.99',
      type: '虚拟币',
      typeClass: 'type-coin',
      revenue: '$22,756',
      pct: 8.0,
      orders: '2,278',
      arppu: '$9.99',
      retention: 'N/A',
      countries: 'US/KR/TW',
      trendData: [0.8, 0.7, 0.9, 1.0, 0.8, 0.9, 1.0]
    },
    {
      name: 'Coin Pack 500',
      price: '$4.99',
      type: '虚拟币',
      typeClass: 'type-coin',
      revenue: '$8,527',
      pct: 3.0,
      orders: '1,709',
      arppu: '$4.99',
      retention: 'N/A',
      countries: 'US/KR/JP',
      trendData: [0.3, 0.4, 0.4, 0.5, 0.3, 0.4, 0.4]
    },
    {
      name: 'Weather Pro Monthly',
      price: '$6.99',
      type: '月度订阅',
      typeClass: 'type-month',
      revenue: '$2,887',
      pct: 1.0,
      orders: '413',
      arppu: '$6.99',
      retention: '52.4',
      countries: 'US/CA/AU',
      trendData: [0.1, 0.1, 0.2, 0.1, 0.1, 0.1, 0.1]
    }
  ]

  /* ── Donut Legend ─────────────────────────────── */
  const donutLegend = [
    { name: '年度订阅', pct: 42, val: '$119,480', color: '#22d3ee' },
    { name: '月度订阅', pct: 28, val: '$79,680', color: '#3b82f6' },
    { name: '终身购买', pct: 18, val: '$51,190', color: '#8b5cf6' },
    { name: '虚拟币', pct: 8, val: '$22,756', color: '#f59e0b' },
    { name: '其他', pct: 4, val: '$11,414', color: '#475569' }
  ]

  /* ── Date Rows ────────────────────────────────── */
  const dateRows = [
    {
      date: '2026-03-05',
      total: 1024,
      paid: 105,
      sub: 98,
      iap: 17,
      renew: 6,
      refund: 1,
      cancel: 2,
      revPaid: '$4,103',
      revSub: '$3,212',
      revIap: '$691',
      revRenew: '$2,230'
    },
    {
      date: '2026-03-04',
      total: 987,
      paid: 97,
      sub: 91,
      iap: 15,
      renew: 4,
      refund: 1,
      cancel: 1,
      revPaid: '$3,715',
      revSub: '$2,974',
      revIap: '$595',
      revRenew: '$2,015'
    },
    {
      date: '2026-03-03',
      total: 1102,
      paid: 112,
      sub: 104,
      iap: 17,
      renew: 6,
      refund: 1,
      cancel: 1,
      revPaid: '$4,389',
      revSub: '$3,455',
      revIap: '$664',
      revRenew: '$2,264'
    },
    {
      date: '2026-03-02',
      total: 1089,
      paid: 108,
      sub: 99,
      iap: 15,
      renew: 5,
      refund: 0,
      cancel: 2,
      revPaid: '$4,102',
      revSub: '$3,301',
      revIap: '$620',
      revRenew: '$2,108'
    },
    {
      date: '2026-03-01',
      total: 1156,
      paid: 118,
      sub: 110,
      iap: 17,
      renew: 6,
      refund: 1,
      cancel: 2,
      revPaid: '$4,512',
      revSub: '$3,598',
      revIap: '$691',
      revRenew: '$2,230'
    },
    {
      date: '2026-02-28',
      total: 1234,
      paid: 128,
      sub: 119,
      iap: 17,
      renew: 8,
      refund: 1,
      cancel: 3,
      revPaid: '$4,987',
      revSub: '$3,856',
      revIap: '$691',
      revRenew: '$2,715'
    },
    {
      date: '2026-02-27',
      total: 1198,
      paid: 121,
      sub: 113,
      iap: 17,
      renew: 7,
      refund: 1,
      cancel: 2,
      revPaid: '$4,712',
      revSub: '$3,698',
      revIap: '$691',
      revRenew: '$2,337'
    }
  ]

  /* ── Product Retention Heatmap ───────────────── */
  const prodRetenRows = [
    { name: 'Weather Premium Annual', m1: 78.4, m2: 72.1, m3: 66.8, m4: 61.4, m5: 56.2 },
    { name: 'Weather Premium Monthly', m1: 58.2, m2: 50.4, m3: 44.8, m4: 39.2, m5: 34.6 },
    { name: 'Weather Pro Monthly', m1: 52.4, m2: 44.8, m3: 38.2, m4: 32.6, m5: 27.4 }
  ]

  /* ── Helpers ──────────────────────────────────── */
  function hmCls(v: number): string {
    if (v >= 65) return 'hm-high'
    if (v >= 50) return 'hm-mid'
    return 'hm-low'
  }

  /* ── ECharts ──────────────────────────────────── */
  onMounted(() => {
    initSparklines()
    initMiniTrends()
    initDonut()
    initTrend()
    initCountry()
  })

  onUnmounted(() => {
    chartInstances.forEach((c) => c.dispose())
  })

  function rebuildCharts() {
    chartInstances.forEach((c) => c.dispose())
    chartInstances.length = 0
    initSparklines()
    initMiniTrends()
    initDonut()
    initTrend()
    initCountry()
  }

  watch(
    () => props.searchToken,
    () => {
      rebuildCharts()
    }
  )

  watch(activeSubTab, () => {
    nextTick(() => rebuildCharts())
  })

  function initSparklines() {
    kpiCards.forEach((kpi, i) => {
      const el = sparkRefs.value[i]
      if (!el) return
      const c = echarts.init(el)
      chartInstances.push(c)
      if (kpi.sparkType === 'line') {
        c.setOption({
          backgroundColor: 'transparent',
          grid: { top: 4, right: 4, bottom: 4, left: 4 },
          xAxis: { type: 'category', show: false },
          yAxis: { type: 'value', show: false },
          series: [
            {
              type: 'line',
              data: kpi.sparkData,
              smooth: true,
              symbol: 'none',
              lineStyle: { color: kpi.color, width: 2 },
              areaStyle: {
                color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    { offset: 0, color: kpi.color + '55' },
                    { offset: 1, color: 'transparent' }
                  ]
                }
              }
            }
          ]
        })
      } else {
        c.setOption({
          backgroundColor: 'transparent',
          grid: { top: 4, right: 4, bottom: 4, left: 4 },
          xAxis: { type: 'category', show: false },
          yAxis: { type: 'value', show: false },
          series: [
            {
              type: 'bar',
              data: kpi.sparkData,
              itemStyle: { color: kpi.color + 'aa', borderRadius: [2, 2, 0, 0] },
              barWidth: '55%'
            }
          ]
        })
      }
    })
  }

  function initMiniTrends() {
    sortedProductRows.value.forEach((row) => {
      const el = miniRefs.get(row.name)
      if (!el) return
      const c = echarts.init(el)
      chartInstances.push(c)
      c.setOption({
        backgroundColor: 'transparent',
        grid: { top: 2, right: 2, bottom: 2, left: 2 },
        xAxis: { type: 'category', show: false },
        yAxis: { type: 'value', show: false },
        series: [
          {
            type: 'line',
            data: row.trendData,
            smooth: true,
            symbol: 'none',
            lineStyle: { color: '#22d3ee', width: 1.5 }
          }
        ]
      })
    })
  }

  function initDonut() {
    if (!donutRef.value) return
    const c = echarts.init(donutRef.value)
    chartInstances.push(c)
    c.setOption({
      backgroundColor: 'transparent',
      series: [
        {
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['50%', '50%'],
          data: donutLegend.map((d) => ({
            name: d.name,
            value: d.pct,
            itemStyle: { color: d.color }
          })),
          label: {
            show: true,
            position: 'center',
            formatter: () => '$284,520',
            color: '#e2e8f5',
            fontSize: 12,
            fontWeight: 'bold'
          },
          labelLine: { show: false }
        }
      ]
    })
  }

  function initTrend() {
    if (!trendRef.value) return
    const c = echarts.init(trendRef.value)
    chartInstances.push(c)
    const dates = ['Feb5', 'Feb11', 'Feb21', 'Feb23', 'Mar4', 'Mar5']
    const mk = (name: string, data: number[], color: string) => ({
      name,
      type: 'line' as const,
      smooth: true,
      data,
      symbol: 'none',
      lineStyle: { color, width: 2 },
      itemStyle: { color }
    })
    c.setOption({
      backgroundColor: 'transparent',
      grid: { top: 10, right: 10, bottom: 36, left: 44 },
      legend: {
        bottom: 0,
        textStyle: { color: '#8892a8', fontSize: 10 },
        itemWidth: 10,
        itemHeight: 5
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLabel: { color: '#8892a8', fontSize: 10 },
        axisLine: { lineStyle: { color: '#1e2540' } },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#8892a8', fontSize: 10, formatter: (v: number) => `$${v}` },
        splitLine: { lineStyle: { color: '#1a2240' } }
      },
      series: [
        mk('Weather Premium Annual', [3200, 3500, 3800, 3700, 4200, 4400], '#22d3ee'),
        mk('月度订阅', [2100, 2400, 2600, 2500, 2900, 3200], '#3b82f6'),
        mk('终身购买', [1600, 1800, 1700, 1900, 2000, 2100], '#8b5cf6'),
        mk('虚拟币', [600, 700, 650, 800, 750, 900], '#f59e0b'),
        mk('其他', [200, 250, 220, 280, 260, 300], '#64748b')
      ]
    })
  }

  function initCountry() {
    if (!countryRef.value) return
    const c = echarts.init(countryRef.value)
    chartInstances.push(c)
    c.setOption({
      backgroundColor: 'transparent',
      grid: { top: 10, right: 10, bottom: 30, left: 36 },
      legend: {
        bottom: 0,
        textStyle: { color: '#8892a8', fontSize: 10 },
        itemWidth: 8,
        itemHeight: 8
      },
      xAxis: {
        type: 'category',
        data: ['US', 'KR', 'DE', 'TW', 'JP', 'GB'],
        axisLabel: { color: '#8892a8', fontSize: 10 },
        axisLine: { lineStyle: { color: '#1e2540' } },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#8892a8', fontSize: 10, formatter: (v: number) => `$${v / 1000}K` },
        splitLine: { lineStyle: { color: '#1a2240' } }
      },
      series: [
        {
          name: '年订',
          type: 'bar',
          data: [42000, 28000, 18000, 14000, 10000, 8000],
          itemStyle: { color: '#22d3ee', borderRadius: [2, 2, 0, 0] },
          barMaxWidth: 12
        },
        {
          name: '月订',
          type: 'bar',
          data: [18000, 12000, 8000, 6000, 5000, 4000],
          itemStyle: { color: '#3b82f6', borderRadius: [2, 2, 0, 0] },
          barMaxWidth: 12
        },
        {
          name: '终身',
          type: 'bar',
          data: [12000, 8000, 6000, 4000, 3000, 3000],
          itemStyle: { color: '#8b5cf6', borderRadius: [2, 2, 0, 0] },
          barMaxWidth: 12
        },
        {
          name: '虚拟币',
          type: 'bar',
          data: [5000, 3000, 2000, 2000, 1500, 1000],
          itemStyle: { color: '#f59e0b', borderRadius: [2, 2, 0, 0] },
          barMaxWidth: 12
        }
      ]
    })
  }
</script>

<style scoped lang="scss">
  @use '../ad-performance/styles/ap-card-fx.scss' as *;

  .product-tab {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  /* KPI */
  .kpi-row {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 12px;
  }

  .kpi-card {
    @include ap-neon-bg;

    position: relative;
    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    overflow: hidden;
    border-left: 3px solid var(--accent);
    border-radius: 14px;
    transition: box-shadow 0.36s var(--ease-out);

    &:hover {
      box-shadow:
        0 16px 48px rgb(0 0 0 / 45%),
        0 0 40px color-mix(in srgb, var(--accent) 15%, transparent),
        0 0 72px color-mix(in srgb, var(--accent) 22%, transparent);
    }
  }

  .kpi-info {
    flex: 1;
    min-width: 0;
  }

  .kpi-label {
    margin-bottom: 4px;
    font-size: 12px;
    color: #6b7a99;
  }

  .kpi-value {
    font-size: 22px;
    font-weight: 700;
    line-height: 1.2;
  }

  .kpi-meta {
    display: flex;
    gap: 6px;
    align-items: center;
    margin-top: 4px;
    font-size: 11px;
  }

  .kpi-sub {
    color: #6b7a99;
  }

  .trend-up {
    font-weight: 600;
    color: #10b981;
  }

  .trend-down {
    font-weight: 600;
    color: #ef4444;
  }

  .kpi-spark {
    flex-shrink: 0;
    width: 80px;
    height: 44px;
  }

  /* Top Grid */
  .top-grid {
    display: grid;
    grid-template-columns: 62fr 38fr;
    gap: 12px;
  }

  /* Bottom Grid */
  .btm-grid {
    display: grid;
    grid-template-columns: 62fr 38fr;
    gap: 12px;
  }

  .right-col {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  /* Card */
  .card {
    @include ap-neon-bg;

    position: relative;
    padding: 14px 16px;
    overflow: hidden;
    border-radius: 14px;
    transition:
      border-color 0.28s ease,
      box-shadow 0.36s var(--ease-out);

    &:hover {
      border-color: rgb(96 165 250 / 55%);
      box-shadow:
        0 18px 56px rgb(0 0 0 / 48%),
        0 0 48px rgb(59 130 246 / 12%),
        0 0 90px rgb(34 211 238 / 10%);
    }
  }

  .card-hd {
    @include ap-title-gradient;

    margin-bottom: 10px;
    font-size: 14px;
    font-weight: 700;
  }

  .card-sub-hd {
    margin-top: -6px;
    margin-bottom: 8px;
    font-size: 11px;
    color: #5a6a8a;
  }

  /* Table */
  .dt {
    width: 100%;
    font-size: 12px;
    border-collapse: collapse;
  }

  .dt th {
    padding: 6px 8px;
    font-weight: 500;
    color: #6b7a99;
    text-align: left;
    white-space: nowrap;
    border-bottom: 1px solid #1a2240;
  }

  .dt td {
    padding: 7px 8px;
    color: #c4d0e8;
    white-space: nowrap;
    border-bottom: 1px solid #131e30;
  }

  .dt tbody tr:hover {
    background: #1a2035;
  }

  .sm-dt th,
  .sm-dt td {
    padding: 5px 7px;
    font-size: 11px;
  }

  .hm-dt td {
    text-align: center;
  }

  .total-row td {
    padding: 8px;
    color: #e2e8f5;
    border-top: 1px solid #22d3ee44;
    border-bottom: none;
  }

  .pname {
    font-weight: 500;
    color: #e2e8f5;
  }

  .pname-sm {
    max-width: 120px;
    overflow: hidden;
    font-size: 10px;
    color: #c4d0e8;
    text-overflow: ellipsis;
  }

  /* Type tags */
  .type-tag {
    display: inline-block;
    padding: 1px 7px;
    font-size: 11px;
    font-weight: 600;
    border-radius: 3px;
  }

  .type-year {
    color: #38bdf8;
    background: #0e3152;
  }

  .type-month {
    color: #60a5fa;
    background: #0e1e52;
  }

  .type-lifetime {
    color: #a78bfa;
    background: #1e0e52;
  }

  .type-coin {
    color: #fbbf24;
    background: #3a1e00;
  }

  .val-green {
    font-weight: 600;
    color: #10b981;
  }

  .val-red {
    font-weight: 600;
    color: #ef4444;
  }

  .val-cyan {
    font-weight: 600;
    color: #22d3ee;
  }

  .val-muted {
    color: #6b7a99;
  }

  .text-white {
    color: #e2e8f5;
  }

  .font-semibold {
    font-weight: 600;
  }

  /* Sub-tabs */
  .table-header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .sub-tabs {
    display: flex;
    gap: 2px;
  }

  .sub-tab {
    padding: 4px 12px;
    font-size: 12px;
    color: #6b7a99;
    cursor: pointer;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 4px;
    transition: all 0.2s;
  }

  .sub-tab:hover {
    color: #c4d0e8;
  }

  .sub-tab-active {
    color: #22d3ee;
    background: #22d3ee20;
    border-color: #22d3ee44;
  }

  .product-rank-table th.col-emphasis,
  .product-rank-table td.col-emphasis {
    box-shadow: inset 0 0 0 1px rgb(34 211 238 / 35%);
  }

  .product-rank-table th.col-emphasis {
    font-weight: 700;
    color: #22d3ee;
  }

  /* Donut legend */
  .donut-legend {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 8px;
  }

  .dl-item {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 11px;
  }

  .dl-dot {
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    border-radius: 2px;
  }

  .dl-name {
    flex: 1;
    color: #8892a8;
  }

  .dl-pct {
    width: 28px;
    font-weight: 600;
    color: #c4d0e8;
    text-align: right;
  }

  .dl-val {
    width: 70px;
    color: #8892a8;
    text-align: right;
  }

  /* Heatmap cells */
  .hm-cell {
    display: inline-block;
    min-width: 44px;
    padding: 3px 8px;
    font-size: 10px;
    font-weight: 600;
    text-align: center;
    border-radius: 3px;
  }

  .hm-high {
    color: #10b981;
    background: #064e3b;
  }

  .hm-mid {
    color: #86efac;
    background: #1a2e1a;
  }

  .hm-low {
    color: #f87171;
    background: #3b1c1c;
  }

  /* ── Responsive ───────────────────────────────── */
  @media (width <= 1200px) {
    .kpi-row {
      grid-template-columns: repeat(2, 1fr);
    }

    .top-grid {
      grid-template-columns: 1fr;
    }

    .btm-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (width <= 768px) {
    .kpi-row {
      grid-template-columns: 1fr;
    }

    .table-header-row {
      flex-direction: column;
      gap: 8px;
      align-items: flex-start;
    }

    .sub-tabs {
      flex-wrap: wrap;
    }
  }
</style>
