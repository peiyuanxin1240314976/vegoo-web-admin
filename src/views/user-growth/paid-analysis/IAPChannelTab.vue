<template>
  <div class="channel-tab">
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
            <span :class="kpi.trendUp ? 'trend-up' : 'trend-down'">
              {{ kpi.trendUp ? '↑' : '↓' }}{{ kpi.trendVal }}
            </span>
            <span class="kpi-sub">{{ kpi.sub }}</span>
          </div>
        </div>
        <div class="kpi-spark" :ref="(el) => setSparkRef(el as HTMLElement, i)"></div>
      </div>
    </div>

    <!-- ── Middle Grid: Table + 2 Charts ─────────── -->
    <div class="mid-grid">
      <!-- Channel IAP Table -->
      <div class="card span-table">
        <div class="card-hd">广告平台 IAP 转化质量对比表</div>
        <table class="dt">
          <thead>
            <tr>
              <th>广告平台</th><th>IAP收入</th><th>占比</th> <th>付费用户</th><th>ARPPU</th>
              <th>首次付费周期</th><th>续费率</th><th>质量评分</th>
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
                    color: r.retention >= 65 ? '#10b981' : r.retention >= 55 ? '#f59e0b' : '#ef4444'
                  }"
                >
                  {{ r.retention }}%
                </span>
              </td>
              <td>
                <span class="quality-tag" :class="r.quality.includes('A') ? 'q-a' : 'q-b'">
                  {{ r.quality }}
                </span>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td>合计</td><td><b>$384,520</b></td
              ><td><b>72.4%</b></td> <td><b>8,234</b></td
              ><td><b>$30.82</b></td> <td><b>2.4</b></td
              ><td><b>52.2%</b></td
              ><td>--</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- ARPPU Horizontal Bar -->
      <div class="card span-arppu">
        <div class="card-hd">广告平台 ARPPU 对比</div>
        <div ref="arppuRef" style="height: 230px"></div>
      </div>

      <!-- Revenue Trend -->
      <div class="card span-trend">
        <div class="card-hd">IAP 收入趋势（近30天）</div>
        <div ref="trendRef" style="height: 230px"></div>
      </div>
    </div>

    <!-- ── Bottom Grid ────────────────────────────── -->
    <div class="btm-grid">
      <!-- ROI Cohort Table -->
      <div class="card roi-card">
        <div class="card-hd">ROI 队列分析（按日期区间）</div>
        <div class="card-sub-hd"
          >ROI = 付费入数的区间，ROI= 同期消费收入入数，N-day定义：扣期期期</div
        >
        <table class="dt sm-dt">
          <thead>
            <tr>
              <th>日期区间</th><th>ROI</th><th>CPA</th> <th>付费收入</th><th>付费人数</th
              ><th>续率</th> <th>内购收入</th><th>内购占比</th><th>内购订单</th><th>内购人数</th>
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
        <div class="card-hd">订阅续费率队列（按广告平台）</div>
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
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, watch } from 'vue'
  import * as echarts from 'echarts'

  defineOptions({ name: 'IAPChannelTab' })

  const props = defineProps<{
    filters: {
      app: string
      platform: string
      country: string
      date: string
    }
    searchToken: number
  }>()

  /* ── Refs ─────────────────────────────────────── */
  const arppuRef = ref<HTMLElement | null>(null)
  const trendRef = ref<HTMLElement | null>(null)
  const donutRef = ref<HTMLElement | null>(null)
  const sparkRefs = ref<(HTMLElement | null)[]>([])
  const chartInstances: echarts.ECharts[] = []

  function setSparkRef(el: HTMLElement | null, i: number) {
    sparkRefs.value[i] = el
  }

  /* ── KPI data ─────────────────────────────────── */
  const kpiCards = [
    {
      label: 'IAP总收入',
      value: '$284,520',
      trendUp: true,
      trendVal: '18.4% vs.上月',
      sub: '',
      color: '#22d3ee',
      sparkData: [6.8, 7.2, 6.9, 8.1, 7.6, 8.4, 9.2],
      sparkType: 'line'
    },
    {
      label: '付费用户数',
      value: '9,234人',
      trendUp: true,
      trendVal: '',
      sub: '占DAU 5.4%',
      color: '#3b82f6',
      sparkData: [5.8, 6.2, 7.1, 6.5, 7.8, 8.1, 8.9],
      sparkType: 'bar'
    },
    {
      label: '平均ARPPU',
      value: '$30.82',
      trendUp: true,
      trendVal: '12.3% vs.上月',
      sub: '',
      color: '#8b5cf6',
      sparkData: [26, 28, 27, 29, 30, 28, 31],
      sparkType: 'line'
    },
    {
      label: '订阅续费率',
      value: '68.4%',
      trendUp: true,
      trendVal: '3.2pp vs.上月',
      sub: '',
      color: '#f59e0b',
      sparkData: [62, 64, 63, 65, 67, 66, 68],
      sparkType: 'line'
    },
    {
      label: '首次付费周期',
      value: '2.4天',
      trendUp: false,
      trendVal: '',
      sub: '中位数',
      color: '#10b981',
      sparkData: [3.1, 2.9, 2.8, 3.0, 2.7, 2.5, 2.4],
      sparkType: 'bar'
    }
  ]

  /* ── Channel Table ───────────────────────────── */
  const channelRows = [
    {
      ch: 'Google',
      rev: '$98,420',
      revPct: '72.4',
      users: '9,234',
      arppu: '$30.82',
      period: 2.4,
      retention: 68.4,
      quality: '★A+'
    },
    {
      ch: 'Facebook',
      rev: '$98,420',
      revPct: '68.2',
      users: '1,208',
      arppu: '$30.82',
      period: 1.3,
      retention: 69.2,
      quality: '★A'
    },
    {
      ch: 'TikTok',
      rev: '$17,280',
      revPct: '66.1',
      users: '833',
      arppu: '$30.82',
      period: 3.0,
      retention: 63.4,
      quality: '★A+'
    },
    {
      ch: 'Mintegral',
      rev: '$13,630',
      revPct: '81.3',
      users: '882',
      arppu: '$30.82',
      period: 2.4,
      retention: 54.3,
      quality: '★B-'
    },
    {
      ch: 'Applovin',
      rev: '$17,000',
      revPct: '79.5',
      users: '509',
      arppu: '$30.82',
      period: 1.3,
      retention: 52.5,
      quality: '★B-'
    },
    {
      ch: 'Organic',
      rev: '$29,990',
      revPct: '72.4',
      users: '807',
      arppu: '$30.82',
      period: 2.4,
      retention: 72.1,
      quality: '★B-'
    },
    {
      ch: '其他',
      rev: '$9,800',
      revPct: '52.4',
      users: '190',
      arppu: '$12.41',
      period: 1.8,
      retention: 52.4,
      quality: '★B-'
    }
  ]

  /* ── ROI Data ─────────────────────────────────── */
  const roiRows = [
    {
      period: '首日',
      roi: '32%',
      roiNum: 32,
      cpa: '6.3%',
      rev: '$16.58',
      users: 433,
      reten: '79.6%',
      iapRev: '$16.92',
      iapPct: '18.3%',
      iapOrd: 10,
      iapUsers: 15
    },
    {
      period: '3日',
      roi: '32%',
      roiNum: 32,
      cpa: '1.6%',
      rev: '$9.65',
      users: 263,
      reten: '89.0%',
      iapRev: '$5.96',
      iapPct: '46.8%',
      iapOrd: 10,
      iapUsers: 32
    },
    {
      period: '7日',
      roi: '32%',
      roiNum: 32,
      cpa: '8.2%',
      rev: '$7.95',
      users: 188,
      reten: '77.5%',
      iapRev: '$9.99',
      iapPct: '59.3%',
      iapOrd: 12,
      iapUsers: 47
    },
    {
      period: '14日',
      roi: '35%',
      roiNum: 35,
      cpa: '6.6%',
      rev: '$6.58',
      users: 262,
      reten: '90.6%',
      iapRev: '$8.86',
      iapPct: '50.6%',
      iapOrd: 10,
      iapUsers: 38
    },
    {
      period: '30日',
      roi: '90%',
      roiNum: 90,
      cpa: '10.0%',
      rev: '$7.68',
      users: 392,
      reten: '78.7%',
      iapRev: '$9.99',
      iapPct: '50.8%',
      iapOrd: 21,
      iapUsers: 25
    },
    {
      period: '45日',
      roi: '100%',
      roiNum: 100,
      cpa: '3.3%',
      rev: '$32.31',
      users: 387,
      reten: '86.6%',
      iapRev: '$20.56',
      iapPct: '30.1%',
      iapOrd: 18,
      iapUsers: 17
    },
    {
      period: '60日',
      roi: '100%',
      roiNum: 100,
      cpa: '20.3%',
      rev: '$36.39',
      users: 252,
      reten: '87.9%',
      iapRev: '$12.96',
      iapPct: '60.2%',
      iapOrd: 10,
      iapUsers: 15
    },
    {
      period: '75日',
      roi: '103%',
      roiNum: 103,
      cpa: '8.7%',
      rev: '$15.67',
      users: 127,
      reten: '88.6%',
      iapRev: '$13.86',
      iapPct: '70.9%',
      iapOrd: 8,
      iapUsers: 5
    }
  ]

  /* ── Retention Heatmap ───────────────────────── */
  const retenRows = [
    { ch: 'Google', m1: '>65%', m2: '>65%', m5: '>65%' },
    { ch: 'Facebook', m1: '>65%', m2: '50%', m5: '65%' },
    { ch: 'Organic', m1: '50%', m2: '65%', m5: '65%' },
    { ch: 'TikTok', m1: '65%', m2: '65%', m5: '<50%' },
    { ch: 'Mintegral', m1: '<50%', m2: '50%', m5: '<50%' },
    { ch: 'Applovin', m1: '<50%', m2: '<50%', m5: '<50%' }
  ]

  /* ── AI Tips ──────────────────────────────────── */
  const aiTips = [
    {
      id: 1,
      color: '#10b981',
      text: 'Organic用户续费率最高(78.6%)，远高于付费广告平台，建议加大自然量运营'
    },
    { id: 2, color: '#f59e0b', text: 'Mintegral用户首次付费周期最长(3.2天)，建议优化新手引导流程' },
    { id: 3, color: '#22d3ee', text: 'ROI在45日达到回本点(100%)，建议广告预算以45天为优化周期' }
  ]

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
    initSparklines()
    initArppu()
    initTrend()
    initDonut()
  })

  onUnmounted(() => {
    chartInstances.forEach((c) => c.dispose())
  })

  function rebuildCharts() {
    chartInstances.forEach((c) => c.dispose())
    chartInstances.length = 0
    initSparklines()
    initArppu()
    initTrend()
    initDonut()
  }

  watch(
    () => props.searchToken,
    () => {
      rebuildCharts()
    }
  )

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

    const channels = ['Other', 'Applovin', 'Mintegral', 'TikTok', 'Facebook', 'Organic', 'Google']
    const vals = [65, 76, 82, 88, 95, 100, 100]
    const colors = ['#64748b', '#f59e0b', '#f59e0b', '#8b5cf6', '#3b82f6', '#10b981', '#22d3ee']

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
            itemStyle: { color: colors[i], borderRadius: [0, 3, 3, 0] }
          })),
          label: {
            show: true,
            position: 'right',
            formatter: (p: { dataIndex: number }) => {
              const labels = [
                '65%  $30.82',
                '76%  $30.82',
                '82%  $30.82',
                '88%  $30.82',
                '95%  $30.82',
                '100%  $30.82',
                '100%  $30.82'
              ]
              return `{val|${labels[p.dataIndex]}}`
            },
            rich: { val: { color: '#e2e8f5', fontSize: 11 } }
          }
        }
      ]
    })
  }

  function initTrend() {
    if (!trendRef.value) return
    const c = echarts.init(trendRef.value)
    chartInstances.push(c)

    const mkArea = (name: string, data: number[], color: string) => ({
      name,
      type: 'line',
      smooth: true,
      data,
      symbol: 'none',
      lineStyle: { color, width: 2 },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: color + '55' },
            { offset: 1, color: color + '05' }
          ]
        }
      },
      itemStyle: { color }
    })

    c.setOption({
      backgroundColor: 'transparent',
      grid: { top: 10, right: 12, bottom: 36, left: 46 },
      legend: {
        bottom: 0,
        textStyle: { color: '#8892a8', fontSize: 11 },
        itemWidth: 12,
        itemHeight: 6
      },
      xAxis: {
        type: 'category',
        data: ['Mar1', 'Mar2', 'Mar3', 'Mar4', 'Mar5'],
        axisLabel: { color: '#8892a8', fontSize: 11 },
        axisLine: { lineStyle: { color: '#1e2540' } },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 12000,
        axisLabel: {
          color: '#8892a8',
          fontSize: 10,
          formatter: (v: number) => (v === 0 ? '$0' : `$${v / 1000}K`)
        },
        splitLine: { lineStyle: { color: '#1a2240' } }
      },
      series: [
        mkArea('Google', [8400, 7800, 8900, 9200, 8700], '#22d3ee'),
        mkArea('Facebook', [5200, 5800, 5400, 6100, 5900], '#3b82f6'),
        mkArea('TikTok', [2800, 3200, 2900, 3400, 3100], '#8b5cf6'),
        mkArea('Others', [1800, 2100, 1900, 2200, 2000], '#64748b')
      ]
    })
  }

  function initDonut() {
    if (!donutRef.value) return
    const c = echarts.init(donutRef.value)
    chartInstances.push(c)

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
          const m: Record<string, string> = {
            年订阅: '年订阅  42%  $89.99',
            月订阅: '月订阅  28%  $9.99',
            终身购: '终身购  18%  $49.99',
            虚拟币: '虚拟币   8%  $4.99',
            其他: '其他     4%'
          }
          return m[name] ?? name
        }
      },
      series: [
        {
          type: 'pie',
          radius: ['42%', '65%'],
          center: ['28%', '50%'],
          data: [
            { name: '年订阅', value: 42, itemStyle: { color: '#22d3ee' } },
            { name: '月订阅', value: 28, itemStyle: { color: '#3b82f6' } },
            { name: '终身购', value: 18, itemStyle: { color: '#8b5cf6' } },
            { name: '虚拟币', value: 8, itemStyle: { color: '#f59e0b' } },
            { name: '其他', value: 4, itemStyle: { color: '#475569' } }
          ],
          label: {
            show: true,
            position: 'center',
            formatter: () => '$284,520',
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
  @import '../ad-performance/styles/ap-card-fx';

  /* ── Layout ───────────────────────────────────── */
  .channel-tab {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  /* KPI Row */
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
    transition:
      transform 0.32s var(--ease-out),
      box-shadow 0.36s var(--ease-out);

    &:hover {
      box-shadow:
        0 16px 48px rgb(0 0 0 / 45%),
        0 0 40px color-mix(in srgb, var(--accent) 15%, transparent);
      transform: translateY(-4px);
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
  .mid-grid {
    display: grid;
    grid-template-columns: 54fr 22fr 24fr;
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
        0 0 48px rgb(59 130 246 / 12%);
    }
  }

  .card-hd {
    @include ap-title-gradient;

    margin-bottom: 12px;
    font-size: 14px;
    font-weight: 700;
  }

  .card-sub-hd {
    margin-bottom: 8px;
    font-size: 11px;
    color: #5a6a8a;
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

  .quality-tag {
    display: inline-block;
    padding: 1px 6px;
    font-size: 11px;
    font-weight: 600;
    border-radius: 3px;
  }

  .q-a {
    color: #22d3ee;
    background: #22d3ee18;
  }

  .q-b {
    color: #f59e0b;
    background: #f59e0b18;
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
