<template>
  <div class="channel-tab">
    <div v-if="loadError" class="card" style="padding: 10px 12px; color: #f87171">
      {{ loadError }}
    </div>
    <div v-else-if="loading" class="iap-tab-skeleton">
      <div class="iap-tab-skeleton__kpis">
        <div v-for="i in 5" :key="`channel-kpi-${i}`" class="iap-tab-skeleton__kpi card">
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
        <div class="card"><ElSkeleton animated :rows="7" /></div>
        <div class="card"><ElSkeleton animated :rows="6" /></div>
      </div>
      <div class="iap-tab-skeleton__grid iap-tab-skeleton__grid--bottom">
        <div class="card"><ElSkeleton animated :rows="8" /></div>
        <div class="card"><ElSkeleton animated :rows="6" /></div>
        <div class="iap-tab-skeleton__stack">
          <div class="card"><ElSkeleton animated :rows="5" /></div>
          <div class="card"><ElSkeleton animated :rows="4" /></div>
        </div>
      </div>
    </div>
    <template v-else>
      <!-- ── KPI Cards ─────────────────────────────── -->
      <div class="kpi-row" :style="{ '--kpi-count': kpiCards.length }">
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
              <span :class="kpi.trendUp ? 'trend-up' : 'trend-down'">
                {{ kpi.trendUp ? '↑' : '↓' }}{{ kpi.trendVal }}
              </span>
              <span class="kpi-sub">{{ kpi.sub }}</span>
            </div>
          </div>
          <div class="kpi-spark" :ref="(el) => setSparkRef(el as HTMLElement, i)"></div>
        </div>
      </div>

      <!-- ── Middle Grid: Table + ARPPU 图 ─────────── -->
      <div class="mid-grid">
        <!-- Channel IAP Table -->
        <div class="card span-table">
          <div class="card-hd">广告平台 IAP 转化质量对比表</div>
          <table class="dt">
            <thead>
              <tr>
                <th>广告平台</th><th>IAP收入</th><th>占比</th> <th>付费用户</th><th>ARPPU</th>
                <th>首次付费周期</th><th>续订率</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in channelRows" :key="r.ch">
                <td class="ch-name">{{ r.ch }}</td>
                <td>{{ r.rev }}</td>
                <td>
                  <span class="badge" :style="{ color: pctColor(r.revPct) }">
                    {{ r.revPct }}
                  </span>
                </td>
                <td>{{ r.users }}</td>
                <td>{{ r.arppu }}</td>
                <td>{{ r.period }}</td>
                <td>
                  <span
                    class="badge"
                    :style="{
                      color:
                        r.retention >= 65 ? '#10b981' : r.retention >= 55 ? '#f59e0b' : '#ef4444'
                    }"
                  >
                    {{ r.retention }}%
                  </span>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td>合计</td>
                <td
                  ><b>{{ formatUsd(totalRow.totalRevenueUsd) }}</b></td
                >
                <td
                  ><b>{{ totalRow.totalShare }}%</b></td
                >
                <td
                  ><b>{{ totalRow.totalUsers.toLocaleString('en-US') }}</b></td
                >
                <td
                  ><b>{{ formatUsd(totalRow.avgArppu) }}</b></td
                >
                <td
                  ><b>{{ totalRow.avgPeriod.toFixed(1) }}</b></td
                >
                <td
                  ><b>{{ totalRow.avgRetention.toFixed(1) }}%</b></td
                >
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- ARPPU Horizontal Bar -->
        <div class="card span-arppu">
          <div class="card-hd">广告平台 ARPPU 对比</div>
          <div ref="arppuRef" style="height: 230px"></div>
        </div>
      </div>

      <!-- ── Bottom Grid ────────────────────────────── -->
      <div class="btm-grid">
        <!-- ROI Cohort Table -->
        <div class="card roi-card">
          <div class="card-hd">ROI 队列分析（按日期区间）</div>
          <table class="dt sm-dt">
            <thead>
              <tr>
                <th>日期区间</th><th>ROI</th><th>金额</th> <th>付费收入</th><th>付费人数</th
                ><th>续订率</th> <th>付费收入</th><th>内购占比</th><th>内购订单</th
                ><th>内购人数</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in roiRows" :key="r.period">
                <td>{{ r.period }}</td>
                <td>
                  <span class="roi-pill" :class="roiClass(r.roiNum)">{{ r.roi }}</span>
                </td>
                <td>{{ r.cpa }}</td>
                <td>{{ r.rev }}</td>
                <td>{{ r.users }}</td>
                <td>{{ r.reten }}</td>
                <td>{{ r.iapRev }}</td>
                <td>{{ r.iapPct }}</td>
                <td>{{ r.iapOrd }}</td>
                <td>{{ r.iapUsers }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Retention Heatmap -->
        <div class="card reten-card">
          <div class="card-hd">订阅续订率队列（按广告平台）</div>
          <table class="dt hm-dt">
            <thead>
              <tr> <th>广告平台</th><th>Month1</th><th>Month2</th><th>Month5</th> </tr>
            </thead>
            <tbody>
              <tr v-for="r in retenRows" :key="r.ch">
                <td>{{ r.ch }}</td>
                <td
                  ><span class="hm-cell" :class="hmClass(r.m1)">{{ r.m1 }}</span></td
                >
                <td
                  ><span class="hm-cell" :class="hmClass(r.m2)">{{ r.m2 }}</span></td
                >
                <td
                  ><span class="hm-cell" :class="hmClass(r.m5)">{{ r.m5 }}</span></td
                >
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Right: Donut + AI -->
        <div class="right-col">
          <div class="card donut-card">
            <div class="card-hd">商品类型收入占比</div>
            <div ref="donutRef" style="height: 170px"></div>
          </div>
          <div class="card ai-card">
            <div class="card-hd">AI 洞察建议</div>
            <ul class="ai-list">
              <li v-for="tip in aiTips" :key="tip.id" class="ai-item">
                <span class="ai-dot" :style="{ background: tip.color }"></span>
                <span>{{ tip.text }}</span>
              </li>
            </ul>
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
    fetchPaidAnalysisTabChannelCharts,
    fetchPaidAnalysisTabChannelOverview,
    fetchPaidAnalysisTabChannelTables
  } from '@/api/user-growth/paid-analysis'
  import { getAppTodayYYYYMMDD } from '@/utils/app-now'

  defineOptions({ name: 'IAPChannelTab' })

  const props = defineProps<{
    filters: {
      appId: string | string[]
      platform: string
      country: string
      startDate: string
      endDate: string
    }
    searchToken: number
  }>()

  const loading = ref(false)
  const loadError = ref('')

  /* ── Refs ─────────────────────────────────────── */
  const arppuRef = ref<HTMLElement | null>(null)
  const donutRef = ref<HTMLElement | null>(null)
  const sparkRefs = ref<(HTMLElement | null)[]>([])
  const chartInstances: Array<ReturnType<typeof echarts.init>> = []

  function setSparkRef(el: HTMLElement | null, i: number) {
    sparkRefs.value[i] = el
  }

  function buildBody(): PaidAnalysisFilterBody {
    const today = getAppTodayYYYYMMDD()
    let start = String(props.filters.startDate ?? '').trim()
    let end = String(props.filters.endDate ?? '').trim()
    if (!start && !end) {
      start = today
      end = today
    } else {
      if (!start) start = end
      if (!end) end = start
    }
    return {
      startDate: start,
      endDate: end,
      appId: props.filters.appId || '',
      platform: props.filters.platform || '',
      countryCode: props.filters.country || '',
      source: ''
    }
  }

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

  const channelRows = ref<
    {
      ch: string
      rev: string
      revPct: string
      users: string
      arppu: string
      period: number
      retention: number
    }[]
  >([])

  const roiRows = ref<
    {
      period: string
      roi: string
      roiNum: number
      cpa: string
      rev: string
      users: number
      reten: string
      iapRev: string
      iapPct: string
      iapOrd: number
      iapUsers: number
    }[]
  >([])

  const retenRows = ref<{ ch: string; m1: string; m2: string; m5: string }[]>([])

  const arppuBar = ref<{ channelName: string; percentOfMax: number; arppu: number }[]>([])
  const productMixDonut = ref<{ name: string; value: number; color: string }[]>([])
  const donutCenterRevenueUsd = ref<number>(0)

  const aiTips = ref<{ id: number; color: string; text: string }[]>([])

  const totalRow = computed(() => {
    const rows = channelRows.value
    if (!rows.length) {
      return {
        totalRevenueUsd: 0,
        totalShare: 0,
        totalUsers: 0,
        avgArppu: 0,
        avgPeriod: 0,
        avgRetention: 0
      }
    }
    const totalRevenueUsd = rows.reduce(
      (s, r) => s + Number(String(r.rev).replace(/[$,]/g, '')) || 0,
      0
    )
    const totalUsers = rows.reduce(
      (s, r) => s + (Number(String(r.users).replace(/,/g, '')) || 0),
      0
    )
    const avgArppu =
      rows.reduce((s, r) => s + Number(String(r.arppu).replace(/[$,]/g, '')) || 0, 0) / rows.length
    const avgPeriod = rows.reduce((s, r) => s + (Number(r.period) || 0), 0) / rows.length
    const avgRetention = rows.reduce((s, r) => s + (Number(r.retention) || 0), 0) / rows.length
    return {
      totalRevenueUsd,
      totalShare: 100,
      totalUsers,
      avgArppu,
      avgPeriod,
      avgRetention
    }
  })

  function formatUsd(n: number) {
    return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  async function load() {
    loadError.value = ''
    chartInstances.forEach((c) => c.dispose())
    chartInstances.length = 0
    loading.value = true
    try {
      const body = buildBody()
      const [overview, tables, charts] = await Promise.all([
        fetchPaidAnalysisTabChannelOverview(body),
        fetchPaidAnalysisTabChannelTables(body),
        fetchPaidAnalysisTabChannelCharts(body)
      ])

      kpiCards.value = overview.kpis.map((k) => ({
        ...k,
        label: k.label === '订阅续费率' ? '续订率' : k.label
      }))
      aiTips.value = overview.aiTips

      channelRows.value = tables.channelRows.map((r) => ({
        ch: r.channelName,
        rev: formatUsd(r.iapRevenue),
        revPct: String(r.revenueSharePercent),
        users: r.payingUsers.toLocaleString('en-US'),
        arppu: formatUsd(r.arppu),
        period: r.firstPayPeriodDays,
        retention: r.retentionPercent
      }))

      roiRows.value = tables.roiCohortRows.map((r) => ({
        period: r.periodLabel,
        roi: `${r.roiPercent}%`,
        roiNum: r.roiPercent,
        cpa: `${r.cpaPercent}%`,
        rev: formatUsd(r.paidRevenue),
        users: r.paidUsers,
        reten: `${r.renewRatePercent}%`,
        iapRev: formatUsd(r.iapRevenue),
        iapPct: `${r.iapSharePercent}%`,
        iapOrd: r.iapOrders,
        iapUsers: r.iapUsers
      }))

      retenRows.value = tables.retentionRows.map((r) => ({
        ch: r.channelName,
        m1: r.month1Bucket,
        m2: r.month2Bucket,
        m5: r.month5Bucket
      }))

      arppuBar.value = charts.arppuBar
      productMixDonut.value = charts.productMixDonut
      donutCenterRevenueUsd.value = charts.donutCenterRevenueUsd
      loading.value = false
      await nextTick()
      rebuildCharts()
    } catch (e) {
      loadError.value = e instanceof Error ? e.message : String(e)
    } finally {
      if (loading.value) loading.value = false
    }
  }

  /* ── KPI data ─────────────────────────────────── */
  /* ── Helpers ──────────────────────────────────── */
  function pctColor(pct: string): string {
    const v = parseFloat(pct)
    if (v >= 70) return '#10b981'
    if (v >= 60) return '#22d3ee'
    return '#ef4444'
  }

  function roiClass(n: number): string {
    if (n >= 103) return 'roi-over'
    if (n >= 100) return 'roi-full'
    if (n >= 80) return 'roi-high'
    return 'roi-low'
  }

  function hmClass(val: string): string {
    if (val.startsWith('>')) return 'hm-high'
    if (val.startsWith('<')) return 'hm-low'
    return 'hm-mid'
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
    initArppu()
    initDonut()
  }

  watch(
    () => props.searchToken,
    () => {
      void load()
    }
  )

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
                    { offset: 0, color: kpi.color + '60' },
                    { offset: 1, color: kpi.color + '05' }
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

  function initArppu() {
    if (!arppuRef.value) return
    const c = echarts.init(arppuRef.value)
    chartInstances.push(c)

    const rows = arppuBar.value
    const channels = rows.map((r) => r.channelName)
    const vals = rows.map((r) => r.percentOfMax)
    const colors = rows.map(() => '#22d3ee')

    c.setOption({
      backgroundColor: 'transparent',
      grid: { top: 10, right: 65, bottom: 10, left: 70, containLabel: false },
      xAxis: { show: false, max: 115 },
      yAxis: {
        type: 'category',
        data: channels,
        axisLabel: { color: '#8892a8', fontSize: 12 },
        axisLine: { show: false },
        axisTick: { show: false }
      },
      series: [
        {
          type: 'bar',
          barWidth: 14,
          data: vals.map((v, i) => ({
            value: v,
            itemStyle: { color: colors[i] ?? '#22d3ee', borderRadius: [0, 3, 3, 0] }
          })),
          label: {
            show: true,
            position: 'right',
            formatter: (p: { dataIndex: number }) => {
              const r = rows[p.dataIndex]
              if (!r) return ''
              return `{val|${r.percentOfMax}%  $${r.arppu}}`
            },
            rich: { val: { color: '#e2e8f5', fontSize: 11 } }
          }
        }
      ]
    })
  }

  function initDonut() {
    if (!donutRef.value) return
    const c = echarts.init(donutRef.value)
    chartInstances.push(c)

    const center = donutCenterRevenueUsd.value
    const centerLabel = center
      ? `$${center.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
      : '$0'

    c.setOption({
      backgroundColor: 'transparent',
      legend: {
        orient: 'vertical',
        right: 4,
        top: 'center',
        textStyle: { color: '#8892a8', fontSize: 10 },
        itemWidth: 8,
        itemHeight: 8,
        formatter: (name: string) => {
          const row = productMixDonut.value.find((x) => x.name === name)
          if (!row) return name
          return `${row.name}  ${row.value}%`
        }
      },
      series: [
        {
          type: 'pie',
          radius: ['42%', '65%'],
          center: ['28%', '50%'],
          data: productMixDonut.value.map((d) => ({
            name: d.name,
            value: d.value,
            itemStyle: { color: d.color }
          })),
          label: {
            show: true,
            position: 'center',
            formatter: () => centerLabel,
            color: '#e2e8f5',
            fontSize: 11,
            fontWeight: 'bold'
          },
          labelLine: { show: false }
        }
      ]
    })
  }
</script>

<style scoped lang="scss">
  @use '../ad-performance/styles/ap-card-fx.scss' as *;

  /* ── Layout ───────────────────────────────────── */
  .channel-tab {
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
    grid-template-columns: repeat(5, 1fr);
    gap: 12px;
  }

  .iap-tab-skeleton__kpi {
    padding: 16px 18px;
  }

  .iap-tab-skeleton__grid {
    display: grid;
    grid-template-columns: minmax(0, 71fr) minmax(0, 29fr);
    gap: 12px;
  }

  .iap-tab-skeleton__grid--bottom {
    grid-template-columns: minmax(0, 1.7fr) minmax(0, 1fr) minmax(0, 0.9fr);
    align-items: start;
  }

  .iap-tab-skeleton__stack {
    display: grid;
    gap: 12px;
  }

  .iap-tab-skeleton :deep(.el-skeleton) {
    padding: 16px 18px;
  }

  /* KPI Row */
  .kpi-row {
    display: grid;
    grid-template-columns: repeat(min(6, max(1, var(--kpi-count, 1))), minmax(0, 1fr));
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

  /* Mid Grid */

  /* 原三列 54:22:24；去掉趋势图后按 54:22 比例分摊原 24fr → 约 71:29 */
  .mid-grid {
    display: grid;
    grid-template-columns: 71fr 29fr;
    gap: 12px;
  }

  /* Bottom Grid */
  .btm-grid {
    display: grid;
    grid-template-columns: 44fr 26fr 30fr;
    gap: 12px;
  }

  .right-col {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  /* ── Card base ────────────────────────────────── */
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

    margin-bottom: 12px;
    font-size: 14px;
    font-weight: 700;
  }

  /* ── Data Table ───────────────────────────────── */
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

  .ch-name {
    font-weight: 500;
    color: #e2e8f5;
  }

  .badge {
    font-weight: 600;
  }

  .total-row td {
    padding: 8px;
    color: #e2e8f5;
    border-top: 1px solid #22d3ee44;
    border-bottom: none;
  }

  /* SM table (ROI) */
  .sm-dt th,
  .sm-dt td {
    padding: 5px 7px;
    font-size: 11px;
  }

  /* ROI pill */
  .roi-pill {
    display: inline-block;
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 700;
    border-radius: 4px;
  }

  .roi-low {
    color: #60a5fa;
    background: #1e3a5a;
  }

  .roi-high {
    color: #34d399;
    background: #1e4a3a;
  }

  .roi-full {
    color: #10b981;
    background: #164e33;
  }

  .roi-over {
    color: #6ee7b7;
    background: #065f46;
  }

  /* Heatmap */
  .hm-dt td {
    text-align: center;
  }

  .hm-cell {
    display: inline-block;
    min-width: 48px;
    padding: 3px 10px;
    font-size: 11px;
    font-weight: 600;
    text-align: center;
    border-radius: 4px;
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

  /* AI List */
  .ai-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 0;
    margin: 0;
    list-style: none;
  }

  .ai-item {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    font-size: 12px;
    line-height: 1.5;
    color: #a0b0cc;
  }

  .ai-dot {
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    margin-top: 4px;
    border-radius: 50%;
  }

  /* ── Responsive ───────────────────────────────── */
  @media (width <= 1200px) {
    .kpi-row {
      grid-template-columns: repeat(2, 1fr);
    }

    .mid-grid {
      grid-template-columns: 1fr;
    }

    .btm-grid {
      grid-template-columns: 1fr;
    }

    .right-col {
      flex-flow: row wrap;
    }

    .right-col .card {
      flex: 1 1 calc(50% - 6px);
      min-width: 320px;
    }
  }

  @media (width <= 768px) {
    .kpi-row {
      grid-template-columns: 1fr;
    }

    .right-col {
      flex-direction: column;
    }

    .right-col .card {
      flex: 1 1 100%;
      min-width: 0;
    }
  }
</style>
