<template>
  <div class="product-tab">
    <div v-if="loadError" class="card" style="padding: 10px 12px; color: #f87171">
      {{ loadError }}
    </div>
    <div v-else-if="loading" class="iap-tab-skeleton">
      <div class="iap-tab-skeleton__kpis">
        <div v-for="i in 4" :key="`product-kpi-${i}`" class="iap-tab-skeleton__kpi card">
          <ElSkeleton animated :throttle="0">
            <template #template>
              <ElSkeletonItem variant="text" style="width: 44%; margin-bottom: 10px" />
              <ElSkeletonItem variant="h3" style="width: 66%; margin-bottom: 8px" />
              <ElSkeletonItem variant="text" style="width: 52%" />
            </template>
          </ElSkeleton>
        </div>
      </div>
      <div class="iap-tab-skeleton__grid">
        <div class="card"><ElSkeleton animated :rows="8" /></div>
        <div class="card"><ElSkeleton animated :rows="6" /></div>
      </div>
      <div class="iap-tab-skeleton__grid iap-tab-skeleton__grid--bottom">
        <div class="card"><ElSkeleton animated :rows="8" /></div>
        <div class="iap-tab-skeleton__stack">
          <div class="card"><ElSkeleton animated :rows="5" /></div>
          <div class="card"><ElSkeleton animated :rows="6" /></div>
          <div class="card"><ElSkeleton animated :rows="5" /></div>
        </div>
      </div>
    </div>
    <template v-else>
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
                <th :class="{ 'col-emphasis': activeSubTab === 'retention' }">续订率</th>
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
            <div class="card-hd">订阅续订率队列（按商品）</div>
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
    </template>
  </div>
</template>

<script setup lang="ts">
  import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
  import { echarts } from '@/plugins/echarts'
  import type { PaidAnalysisFilterBody } from './types'
  import {
    fetchPaidAnalysisTabProductCharts,
    fetchPaidAnalysisTabProductOverview,
    fetchPaidAnalysisTabProductRanking
  } from '@/api/user-growth/paid-analysis'

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

  const loading = ref(false)
  const loadError = ref('')

  function buildBody(): PaidAnalysisFilterBody {
    const date = props.filters.date || ''
    return {
      startDate: date,
      endDate: date,
      appId: props.filters.appId || '',
      platform: props.filters.platform || '',
      countryCode: props.filters.country || '',
      source: ''
    }
  }

  function formatUsd0(n: number) {
    return `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  }

  function formatUsd2(n: number) {
    return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  /* ── Refs ─────────────────────────────────────── */
  const donutRef = ref<HTMLElement | null>(null)
  const trendRef = ref<HTMLElement | null>(null)
  const countryRef = ref<HTMLElement | null>(null)
  const sparkRefs = ref<(HTMLElement | null)[]>([])
  const miniRefs = new Map<string, HTMLElement>()
  const chartInstances: Array<ReturnType<typeof echarts.init>> = []

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
    { key: 'retention', label: '续订率' },
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
    const rows = [...productRows.value]
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

  const kpiCards = ref<
    {
      label: string
      value: string
      trendUp: boolean
      trendVal: string
      sub: string
      color: string
      sparkData: number[]
      sparkType: 'line' | 'bar'
    }[]
  >([])

  const productRows = ref<
    {
      name: string
      price: string
      type: string
      typeClass: string
      revenue: string
      pct: number
      orders: string
      arppu: string
      retention: string
      countries: string
      trendData: number[]
    }[]
  >([])

  const donutLegend = ref<{ name: string; pct: number; val: string; color: string }[]>([])

  const dateRows = ref<
    {
      date: string
      total: number
      paid: number
      sub: number
      iap: number
      renew: number
      refund: number
      cancel: number
      revPaid: string
      revSub: string
      revIap: string
      revRenew: string
    }[]
  >([])

  const revenueTrend30d = ref<{ t_date: string; revenue: number }[]>([])
  const subscriptionRetentionMatrix = ref<
    { skuName: string; m1: number; m2: number; m3: number; m4: number; m5: number }[]
  >([])
  const countryBarTop = ref<
    { s_country_code: string; segments: { kind: string; revenue: number }[] }[]
  >([])

  function kindClass(key: string) {
    if (key === 'year_sub') return 'type-year'
    if (key === 'month_sub') return 'type-month'
    if (key === 'lifetime') return 'type-lifetime'
    if (key === 'coin') return 'type-coin'
    return 'type-other'
  }

  async function load() {
    loadError.value = ''
    chartInstances.forEach((c) => c.dispose())
    chartInstances.length = 0
    loading.value = true
    try {
      const body = buildBody()
      const [overview, ranking, charts] = await Promise.all([
        fetchPaidAnalysisTabProductOverview(body),
        fetchPaidAnalysisTabProductRanking(body),
        fetchPaidAnalysisTabProductCharts(body)
      ])

      kpiCards.value = overview.kpis
      productRows.value = ranking.productRows.map((r) => ({
        name: r.skuName,
        price: formatUsd2(r.priceUsd),
        type: r.productKind,
        typeClass: kindClass(r.productKindKey),
        revenue: formatUsd0(r.revenueUsd),
        pct: r.sharePercent,
        orders: r.orderCount.toLocaleString('en-US'),
        arppu: formatUsd2(r.arppuUsd),
        retention: r.retentionPercent == null ? 'N/A' : String(r.retentionPercent),
        countries: r.topCountries.join('/'),
        trendData: r.trendPoints
      }))

      donutLegend.value = charts.mixLegend.map((d) => ({
        name: d.name,
        pct: d.pct,
        val: formatUsd0(d.revenueUsd),
        color: d.color
      }))

      dateRows.value = charts.paidDateSummaryRows.map((r) => ({
        date: r.t_date,
        total: r.totalSubscriptions,
        paid: r.orderPaid,
        sub: r.orderSub,
        iap: r.orderIap,
        renew: r.orderRenew,
        refund: r.orderRefund,
        cancel: r.orderCancel,
        revPaid: formatUsd0(r.revPaidUsd),
        revSub: formatUsd0(r.revSubUsd),
        revIap: formatUsd0(r.revIapUsd),
        revRenew: formatUsd0(r.revRenewUsd)
      }))

      revenueTrend30d.value = charts.revenueTrend30d
      subscriptionRetentionMatrix.value = charts.subscriptionRetentionMatrix
      countryBarTop.value = charts.countryBarTop
      loading.value = false
      await nextTick()
      rebuildCharts()
    } catch (e) {
      loadError.value = e instanceof Error ? e.message : String(e)
    } finally {
      if (loading.value) loading.value = false
    }
  }

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
    void load()
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
      void load()
    }
  )

  watch(activeSubTab, () => {
    nextTick(() => rebuildCharts())
  })

  function initSparklines() {
    kpiCards.value.forEach((kpi, i) => {
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
          data: donutLegend.value.map((d) => ({
            name: d.name,
            value: d.pct,
            itemStyle: { color: d.color }
          })),
          label: {
            show: true,
            position: 'center',
            formatter: () => {
              const t = donutLegend.value.reduce(
                (s, d) => s + (Number(d.val.replace(/[$,]/g, '')) || 0),
                0
              )
              return formatUsd0(t)
            },
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
    const dates = revenueTrend30d.value.map((x) => x.t_date)
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
        mk(
          'Revenue',
          revenueTrend30d.value.map((x) => x.revenue),
          '#22d3ee'
        )
      ]
    })
  }

  function initCountry() {
    if (!countryRef.value) return
    const c = echarts.init(countryRef.value)
    chartInstances.push(c)
    const rows = countryBarTop.value
    const cats = rows.map((r) => String(r.s_country_code || '').toUpperCase())
    const kinds = Array.from(new Set(rows.flatMap((r) => r.segments.map((s) => s.kind))))
    const kindColors: Record<string, string> = {
      year_sub: '#22d3ee',
      month_sub: '#3b82f6',
      lifetime: '#8b5cf6',
      coin: '#f59e0b',
      other: '#64748b'
    }
    const series = kinds.map((k) => ({
      name: k,
      type: 'bar' as const,
      stack: 'rev',
      data: rows.map((r) => r.segments.find((s) => s.kind === k)?.revenue ?? 0),
      itemStyle: { color: kindColors[k] ?? '#64748b', borderRadius: [2, 2, 0, 0] },
      barMaxWidth: 14
    }))
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
        data: cats,
        axisLabel: { color: '#8892a8', fontSize: 10 },
        axisLine: { lineStyle: { color: '#1e2540' } },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#8892a8', fontSize: 10, formatter: (v: number) => `$${v / 1000}K` },
        splitLine: { lineStyle: { color: '#1a2240' } }
      },
      series
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

  .iap-tab-skeleton {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .iap-tab-skeleton__kpis {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }

  .iap-tab-skeleton__kpi {
    padding: 16px 18px;
  }

  .iap-tab-skeleton__grid {
    display: grid;
    grid-template-columns: minmax(0, 1.8fr) minmax(0, 0.9fr);
    gap: 12px;
  }

  .iap-tab-skeleton__grid--bottom {
    grid-template-columns: minmax(0, 1.8fr) minmax(0, 0.9fr);
    align-items: start;
  }

  .iap-tab-skeleton__stack {
    display: grid;
    gap: 12px;
  }

  .iap-tab-skeleton :deep(.el-skeleton) {
    padding: 16px 18px;
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
