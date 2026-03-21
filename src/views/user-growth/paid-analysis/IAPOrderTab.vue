<template>
  <div class="order-tab">
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
            <span :class="kpi.trendUp ? 'trend-up' : 'trend-down'" v-if="kpi.trendVal">
              {{ kpi.trendUp ? '↑' : '↓' }}{{ kpi.trendVal }}
            </span>
            <span class="kpi-sub">{{ kpi.sub }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Filters Row ────────────────────────────── -->
    <div class="filter-row">
      <div class="filter-item">
        <span class="fl">日期范围:</span>
        <span class="fv">2026-02-05 ~ 2026-03-05</span>
      </div>
      <el-select v-model="fApp" size="small" placeholder="App: 全部" class="fi-sel">
        <el-option label="全部" value="all" /><el-option label="Weather5" value="w5" />
      </el-select>
      <el-select v-model="fChannel" size="small" placeholder="渠道: 全部" class="fi-sel">
        <el-option label="全部" value="all" /><el-option label="Google" value="google" />
      </el-select>
      <el-select v-model="fCountry" size="small" placeholder="国家: 全部" class="fi-sel">
        <el-option label="全部" value="all" /><el-option label="US" value="us" />
      </el-select>
      <el-select v-model="fProduct" size="small" placeholder="商品: 全部" class="fi-sel">
        <el-option label="全部" value="all" />
      </el-select>
      <el-select v-model="fStatus" size="small" placeholder="状态: 全部" class="fi-sel">
        <el-option label="全部" value="all" /><el-option label="成功" value="ok" />
      </el-select>
      <el-input
        v-model="searchKw"
        size="small"
        placeholder="Search: 订单号/用户ID"
        class="fi-search"
        prefix-icon="Search"
        clearable
      />
      <el-button size="small" class="export-btn-sm">↓ 导出数据</el-button>
    </div>

    <!-- ── Main Content ───────────────────────────── -->
    <div class="main-layout" :class="{ 'detail-open': !!selectedOrder }">
      <div class="left-content">
        <!-- Top Two-column -->
        <div class="dual-grid">
          <!-- App × Platform Summary -->
          <div class="card">
            <div class="card-hd">
              应用 × 平台 订单汇总
              <span class="card-note"
                >注：安卓仅支持指定日期之后的数据，平台未配置的应用归入其他，总订阅数为截止到指定日期有效的订阅订单数量</span
              >
            </div>
            <table class="dt sm-dt">
              <thead>
                <tr>
                  <th rowspan="2">应用</th>
                  <th rowspan="2">平台</th>
                  <th rowspan="2">总订阅数</th>
                  <th colspan="6">订单数量</th>
                  <th colspan="4">收入 (USD)</th>
                </tr>
                <tr>
                  <th>付费</th><th>订阅</th><th>内购</th> <th>续订</th><th>退款</th><th>取消</th>
                  <th>付费</th><th>订阅</th><th>内购</th><th>续订</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in appPlatRows" :key="r.app + r.platform">
                  <td class="ch-name">{{ r.app }}</td>
                  <td
                    ><span
                      class="plat-tag"
                      :class="
                        r.platform === 'iOS'
                          ? 'plat-ios'
                          : r.platform === 'Android'
                            ? 'plat-android'
                            : ''
                      "
                      >{{ r.platform }}</span
                    ></td
                  >
                  <td>{{ r.total }}</td>
                  <td>{{ r.paid }}</td
                  ><td>{{ r.sub }}</td
                  ><td>{{ r.iap }}</td> <td>{{ r.renew }}</td
                  ><td>{{ r.refund }}</td
                  ><td>{{ r.cancel }}</td>
                  <td class="val-cyan">{{ r.rPaid }}</td>
                  <td>{{ r.rSub }}</td
                  ><td>{{ r.rIap }}</td
                  ><td>{{ r.rRenew }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Daily Summary -->
          <div class="card">
            <div class="card-hd">
              按日期订单汇总
              <div class="card-action">国家下钻: 全部 ▾</div>
            </div>
            <table class="dt sm-dt">
              <thead>
                <tr>
                  <th>日期</th><th>付费收入</th><th>付费人数</th> <th>付费率</th><th>订单量</th
                  ><th>广告支出</th> <th>CPA</th><th>新用户</th><th>续订率</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="r in dailyRows"
                  :key="r.date"
                  :class="{ 'row-selected': r.date === '2026-03-05' }"
                >
                  <td class="val-cyan cursor-pointer">{{ r.date }}</td>
                  <td>{{ r.rev }}</td
                  ><td>{{ r.users }}</td> <td>{{ r.payRate }}</td
                  ><td>{{ r.orders }}</td> <td>{{ r.adSpend }}</td
                  ><td>{{ r.cpa }}</td>
                  <td>{{ r.newUsers }}</td>
                  <td>
                    <span
                      class="reten-pill"
                      :class="parseFloat(r.reten) >= 20 ? 'ret-high' : 'ret-low'"
                    >
                      {{ r.reten }}
                    </span>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="total-row">
                  <td>合计</td><td>$4,103</td><td>1,503</td> <td>90.0%</td><td>430</td>
                  <td>$1,750</td><td>0.04</td><td>17</td>
                  <td><span class="reten-pill ret-high">20%</span></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- Order List + Charts Row -->
        <div class="order-charts-grid">
          <!-- Order List -->
          <div class="card order-list-card">
            <div class="list-header">
              <span class="card-hd" style="margin: 0">订单列表</span>
              <span class="record-count">Showing 1-8 of 9,749 records</span>
            </div>
            <table class="dt order-dt">
              <thead>
                <tr>
                  <th>订单号</th><th>用户ID</th><th>应用</th> <th>商品</th><th>金额</th
                  ><th>渠道</th> <th>国家</th><th>下单时间</th><th>支付方式</th> <th>状态</th
                  ><th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="r in orderRows"
                  :key="r.id"
                  :class="{ 'row-selected': selectedOrder?.id === r.id }"
                >
                  <td class="order-id" @click="selectOrder(r)">{{ r.id }}</td>
                  <td class="val-blue">{{ r.userId }}</td>
                  <td>{{ r.app }}</td>
                  <td class="order-product">{{ r.product }}</td>
                  <td>{{ r.amount }}</td>
                  <td>{{ r.channel }}</td>
                  <td>
                    <span class="country-flag">{{ r.flag }}</span>
                  </td>
                  <td class="val-muted">{{ r.time }}</td>
                  <td class="val-muted">{{ r.payMethod }}</td>
                  <td>
                    <span class="status-tag" :class="r.statusClass">{{ r.status }}</span>
                  </td>
                  <td>
                    <span class="link-btn" @click="selectOrder(r)">查看</span>
                  </td>
                </tr>
              </tbody>
            </table>
            <div class="pagination">
              <span class="page-btn">‹ 1</span>
              <span class="page-cur">2</span>
              <span class="page-btn">… 813 ›</span>
              <span class="page-info">showing 1-8 of 9,749</span>
            </div>
          </div>

          <!-- Right Charts -->
          <div class="charts-col">
            <div class="card">
              <div class="card-hd">24小时订单金额分布</div>
              <div ref="hourRef" style="height: 160px"></div>
            </div>
            <div class="card">
              <div class="card-hd">商品类型订单占比</div>
              <div ref="typeRef" style="height: 160px"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Order Detail Panel ────────────────── -->
      <transition name="slide">
        <div class="detail-panel" v-if="selectedOrder">
          <div class="detail-header">
            <div class="detail-title">
              <el-icon><Document /></el-icon>
              订单详情
            </div>
            <div class="detail-order-id">{{ selectedOrder.id }}</div>
            <span class="close-btn" @click="selectedOrder = null">✕</span>
          </div>

          <div class="pay-status">
            <span class="pay-ok-dot">✓</span>
            <span class="pay-ok-text">支付成功</span>
            <span class="pay-amount">$89.99 USD</span>
          </div>

          <div class="detail-sections">
            <div class="detail-section">
              <div class="ds-title">基本信息</div>
              <div class="ds-grid">
                <div class="ds-row"
                  ><span class="ds-k">订单号</span
                  ><span class="ds-v">{{ selectedOrder.id }}</span></div
                >
                <div class="ds-row"
                  ><span class="ds-k">用户ID</span
                  ><span class="ds-v val-blue">{{ selectedOrder.userId }}</span></div
                >
                <div class="ds-row"
                  ><span class="ds-k">应用</span><span class="ds-v">Weather5</span></div
                >
                <div class="ds-row"
                  ><span class="ds-k">平台</span><span class="ds-v">iOS</span></div
                >
                <div class="ds-row"
                  ><span class="ds-k">商品</span
                  ><span class="ds-v">Weather Premium Annual</span></div
                >
                <div class="ds-row"
                  ><span class="ds-k">商品ID</span
                  ><span class="ds-v val-muted">weather_premium_annual</span></div
                >
                <div class="ds-row"
                  ><span class="ds-k">价格</span><span class="ds-v">$89.99 USD</span></div
                >
                <div class="ds-row"
                  ><span class="ds-k">支付方式</span><span class="ds-v">App Store</span></div
                >
              </div>
            </div>

            <div class="detail-section">
              <div class="ds-title">渠道与地区</div>
              <div class="ds-grid">
                <div class="ds-row"
                  ><span class="ds-k">渠道</span><span class="ds-v">Google</span></div
                >
                <div class="ds-row"
                  ><span class="ds-k">国家/地区</span><span class="ds-v">🇺🇸 美国 (US)</span></div
                >
                <div class="ds-row"
                  ><span class="ds-k">时区</span><span class="ds-v">PST (UTC-8)</span></div
                >
                <div class="ds-row"
                  ><span class="ds-k">货币</span><span class="ds-v">USD</span></div
                >
              </div>
            </div>

            <div class="detail-section">
              <div class="ds-title">时间信息</div>
              <div class="ds-grid">
                <div class="ds-row"
                  ><span class="ds-k">下单时间</span
                  ><span class="ds-v">2026-03-05 14:32:18</span></div
                >
                <div class="ds-row"
                  ><span class="ds-k">支付时间</span
                  ><span class="ds-v">2026-03-05 14:32:45</span></div
                >
                <div class="ds-row"
                  ><span class="ds-k">订阅开始</span><span class="ds-v">2026-03-05</span></div
                >
                <div class="ds-row"
                  ><span class="ds-k">订阅到期</span><span class="ds-v">2027-03-05</span></div
                >
                <div class="ds-row"
                  ><span class="ds-k">首次付费</span><span class="ds-v val-green">是</span></div
                >
                <div class="ds-row"
                  ><span class="ds-k">首次付费周期</span><span class="ds-v">2.1天</span></div
                >
              </div>
            </div>

            <div class="detail-section">
              <div class="ds-title">订阅状态</div>
              <div class="ds-grid">
                <div class="ds-row"
                  ><span class="ds-k">订阅类型</span><span class="ds-v">年度订阅</span></div
                >
                <div class="ds-row"
                  ><span class="ds-k">自动续费</span><span class="ds-v val-green">已开启</span></div
                >
                <div class="ds-row"
                  ><span class="ds-k">续费次数</span><span class="ds-v">0次（首次）</span></div
                >
                <div class="ds-row"
                  ><span class="ds-k">预计续费日</span><span class="ds-v">2027-03-05</span></div
                >
              </div>
            </div>

            <div class="detail-section">
              <div class="ds-title">收入归因</div>
              <div class="ds-grid">
                <div class="ds-row"
                  ><span class="ds-k">归因渠道</span><span class="ds-v">Google UAC</span></div
                >
                <div class="ds-row"
                  ><span class="ds-k">Campaign</span
                  ><span class="ds-v val-muted">Weather5_US_Annual_0305</span></div
                >
                <div class="ds-row"
                  ><span class="ds-k">广告组</span
                  ><span class="ds-v val-muted">AG_US_iOS_Annual</span></div
                >
                <div class="ds-row"
                  ><span class="ds-k">归因模型</span><span class="ds-v">Last Click</span></div
                >
              </div>
            </div>
          </div>

          <div class="detail-footer">
            <el-button size="small" class="detail-btn">‹ 上一条</el-button>
            <el-button size="small" class="detail-btn">下一条 ›</el-button>
            <el-button size="small" class="detail-btn-primary">复制订单号</el-button>
            <el-button size="small" class="detail-btn-outline">导出此订单</el-button>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue'
  import * as echarts from 'echarts'

  /* ── Filter State ─────────────────────────────── */
  const fApp = ref('all'),
    fChannel = ref('all'),
    fCountry = ref('all')
  const fProduct = ref('all'),
    fStatus = ref('all'),
    searchKw = ref('')

  /* ── Order Detail ─────────────────────────────── */
  interface OrderRow {
    id: string
    userId: string
    app: string
    product: string
    amount: string
    channel: string
    flag: string
    time: string
    payMethod: string
    status: string
    statusClass: string
  }
  const selectedOrder = ref<OrderRow | null>(null)
  function selectOrder(r: OrderRow) {
    selectedOrder.value = r
  }

  /* ── Refs ─────────────────────────────────────── */
  const hourRef = ref<HTMLElement | null>(null)
  const typeRef = ref<HTMLElement | null>(null)
  const chartInstances: echarts.ECharts[] = []

  /* ── KPI ─────────────────────────────────────── */
  const kpiCards = [
    {
      label: '订单总量',
      value: '9,749笔',
      trendUp: true,
      trendVal: '',
      sub: '今日新增342笔',
      color: '#22d3ee'
    },
    {
      label: '订单成功率',
      value: '95.2%',
      trendUp: false,
      trendVal: '',
      sub: '失败247笔',
      color: '#10b981'
    },
    {
      label: '退款率',
      value: '1.9%',
      trendUp: false,
      trendVal: '',
      sub: '退款185笔',
      color: '#f59e0b'
    },
    {
      label: '订单总金额',
      value: '$284,520',
      trendUp: true,
      trendVal: '8.4% vs.上月',
      sub: '',
      color: '#3b82f6'
    }
  ]

  /* ── App × Platform ───────────────────────────── */
  const appPlatRows = [
    {
      app: '汇总',
      platform: '--',
      total: '28,xxx',
      paid: '16,xxx',
      sub: '15,xxx',
      iap: 296,
      renew: 9,
      refund: 14,
      cancel: 0,
      rPaid: '$85,xxx',
      rSub: '$76,xxx',
      rIap: '$89,xxx',
      rRenew: '$6x,xxx'
    },
    {
      app: 'PhoneTracker',
      platform: 'Android',
      total: '28,xxx',
      paid: '16,xxx',
      sub: '15,xxx',
      iap: 296,
      renew: 9,
      refund: 14,
      cancel: 0,
      rPaid: '$85,xxx',
      rSub: '$76,xxx',
      rIap: '$89,xxx',
      rRenew: '$6x,xxx'
    },
    {
      app: 'YearCam',
      platform: 'iOS',
      total: '14,xxx',
      paid: '7,xxx',
      sub: '15,xxx',
      iap: 116,
      renew: 8,
      refund: 0,
      cancel: 0,
      rPaid: '$75,xxx',
      rSub: '$66,xxx',
      rIap: '$89,xxx',
      rRenew: '$6x,xxx'
    },
    {
      app: 'PhoneTracker2',
      platform: 'iOS',
      total: '14,xxx',
      paid: '7,xxx',
      sub: '1,xxx',
      iap: 72,
      renew: 0,
      refund: 14,
      cancel: 0,
      rPaid: '$85,xxx',
      rSub: '$29,xxx',
      rIap: '$89,xxx',
      rRenew: '$6x,xxx'
    },
    {
      app: 'AgeCam',
      platform: 'Android',
      total: '14,xxx',
      paid: '6,xxx',
      sub: '5,xxx',
      iap: 5,
      renew: 0,
      refund: 3,
      cancel: 0,
      rPaid: '$86,xxx',
      rSub: '$69,xxx',
      rIap: '$89,xxx',
      rRenew: '$6x,xxx'
    },
    {
      app: 'AgeCam',
      platform: 'iOS',
      total: '11,xxx',
      paid: '2,xxx',
      sub: '4,xxx',
      iap: 4,
      renew: 0,
      refund: 2,
      cancel: 0,
      rPaid: '$75,xxx',
      rSub: '$75,xxx',
      rIap: '$89,xxx',
      rRenew: '$6x,xxx'
    }
  ]

  /* ── Daily Rows ───────────────────────────────── */
  const dailyRows = [
    {
      date: '2026-02-25',
      rev: '$4,103',
      users: 118,
      payRate: '90.5%',
      orders: 136,
      adSpend: '$2,750',
      cpa: 0.03,
      newUsers: 1,
      reten: '20%'
    },
    {
      date: '2026-02-25',
      rev: '$4,103',
      users: 75,
      payRate: '80.2%',
      orders: 39,
      adSpend: '$1,888',
      cpa: 0.04,
      newUsers: 6,
      reten: '20%'
    },
    {
      date: '2026-02-29',
      rev: '$4,103',
      users: 19,
      payRate: '70.0%',
      orders: 19,
      adSpend: '$4,780',
      cpa: 0.04,
      newUsers: 1,
      reten: '20%'
    },
    {
      date: '2026-03-01',
      rev: '$4,103',
      users: 102,
      payRate: '89.9%',
      orders: 155,
      adSpend: '$1,480',
      cpa: 0.04,
      newUsers: 8,
      reten: '20%'
    },
    {
      date: '2026-03-01',
      rev: '$4,103',
      users: 71,
      payRate: '53.3%',
      orders: 36,
      adSpend: '$1,918',
      cpa: 0.04,
      newUsers: 4,
      reten: '10%'
    },
    {
      date: '2026-03-02',
      rev: '$4,103',
      users: 35,
      payRate: '45.7%',
      orders: 20,
      adSpend: '$2,789',
      cpa: 0.04,
      newUsers: 4,
      reten: '20%'
    },
    {
      date: '2026-03-03',
      rev: '$4,103',
      users: 85,
      payRate: '70.5%',
      orders: 15,
      adSpend: '$1,480',
      cpa: 0.03,
      newUsers: 1,
      reten: '20%'
    },
    {
      date: '2026-03-05',
      rev: '$4,103',
      users: 58,
      payRate: '60.6%',
      orders: 75,
      adSpend: '$1,788',
      cpa: 0.06,
      newUsers: 20,
      reten: '6%'
    }
  ]

  /* ── Order List ───────────────────────────────── */
  const orderRows: OrderRow[] = [
    {
      id: 'ORD-20260305-8842',
      userId: 'USR-284920',
      app: 'Weather5',
      product: 'Annual $89.99',
      amount: '$89.99',
      channel: 'Google',
      flag: '🇺🇸',
      time: '03-05 14:32',
      payMethod: 'App Store',
      status: '成功',
      statusClass: 'st-ok'
    },
    {
      id: 'ORD-20260305-8842',
      userId: 'USR-284920',
      app: 'Weather5',
      product: 'Annual $89.99',
      amount: '$89.99',
      channel: 'Google',
      flag: '🇺🇸',
      time: '03-05 14:32',
      payMethod: 'App Store',
      status: '成功',
      statusClass: 'st-ok'
    },
    {
      id: 'ORD-20260305-8843',
      userId: 'USR-284920',
      app: 'Weather5',
      product: 'Annual $89.99',
      amount: '$89.99',
      channel: 'Google',
      flag: '🇺🇸',
      time: '03-05 14:32',
      payMethod: 'App Store',
      status: '成功',
      statusClass: 'st-ok'
    },
    {
      id: 'ORD-20260305-8848',
      userId: 'USR-284928',
      app: 'Weather5',
      product: 'Annual $89.99',
      amount: '$89.99',
      channel: 'Google',
      flag: '🇩🇪',
      time: '03-05 14:32',
      payMethod: 'App Store',
      status: '退款',
      statusClass: 'st-refund'
    },
    {
      id: 'ORD-20260305-8842',
      userId: 'USR-284921',
      app: 'Weather5',
      product: 'Annual $89.99',
      amount: '$89.99',
      channel: 'Google',
      flag: '🇯🇵',
      time: '03-05 14:30',
      payMethod: 'App Store',
      status: '成功',
      statusClass: 'st-ok'
    },
    {
      id: 'ORD-20260305-8846',
      userId: 'USR-284920',
      app: 'Weather5',
      product: 'Annual $89.99',
      amount: '$89.99',
      channel: 'Google',
      flag: '🇰🇷',
      time: '03-05 14:30',
      payMethod: 'App Store',
      status: '退款',
      statusClass: 'st-refund'
    },
    {
      id: 'ORD-20260305-8842',
      userId: 'USR-284929',
      app: 'Weather5',
      product: 'Annual $89.99',
      amount: '$89.99',
      channel: 'Google',
      flag: '🇨🇦',
      time: '03-05 14:30',
      payMethod: 'App Store',
      status: '失败',
      statusClass: 'st-fail'
    },
    {
      id: 'ORD-20260305-8842',
      userId: 'USR-284920',
      app: 'Weather5',
      product: 'Annual $89.99',
      amount: '$89.99',
      channel: 'Google',
      flag: '🇨🇦',
      time: '03-05 14:30',
      payMethod: 'App Store',
      status: '成功',
      statusClass: 'st-ok'
    }
  ]

  /* ── ECharts ──────────────────────────────────── */
  onMounted(() => {
    initHourChart()
    initTypeChart()
  })
  onUnmounted(() => {
    chartInstances.forEach((c) => c.dispose())
  })

  function initHourChart() {
    if (!hourRef.value) return
    const c = echarts.init(hourRef.value)
    chartInstances.push(c)
    const hours = Array.from({ length: 24 }, (_, i) => `${i}-${i + 1}h`)
    const data = [
      200, 180, 120, 100, 80, 90, 200, 400, 600, 1200, 1800, 2200, 3000, 4000, 5000, 6000, 7200,
      8400, 9000, 10200, 11000, 12840, 9000, 5000
    ]
    c.setOption({
      backgroundColor: 'transparent',
      grid: { top: 10, right: 10, bottom: 40, left: 44 },
      xAxis: {
        type: 'category',
        data: hours,
        axisLabel: { color: '#6b7a99', fontSize: 9, interval: 3 },
        axisLine: { lineStyle: { color: '#1e2540' } },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#8892a8', fontSize: 10, formatter: (v: number) => `$${v}` },
        splitLine: { lineStyle: { color: '#1a2240' } }
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1a2035',
        borderColor: '#1e2540',
        textStyle: { color: '#e2e8f5' }
      },
      series: [
        {
          type: 'bar',
          data,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#22d3ee' },
              { offset: 1, color: '#22d3ee44' }
            ]),
            borderRadius: [2, 2, 0, 0]
          },
          barMaxWidth: 10,
          markLine: {
            data: [
              { xAxis: '13-14h', lineStyle: { color: '#ef444488', width: 1, type: 'dashed' } }
            ],
            label: { formatter: '13-15h\n$12,840', color: '#ef4444', fontSize: 9 },
            symbol: ['none', 'none']
          }
        }
      ]
    })
  }

  function initTypeChart() {
    if (!typeRef.value) return
    const c = echarts.init(typeRef.value)
    chartInstances.push(c)
    c.setOption({
      backgroundColor: 'transparent',
      grid: { top: 10, right: 10, bottom: 10, left: 60, containLabel: false },
      xAxis: { show: false, max: 52 },
      yAxis: {
        type: 'category',
        data: ['Other', 'Coins', 'Lifetime', 'Monthly', 'Annual'],
        axisLabel: { color: '#8892a8', fontSize: 11 },
        axisLine: { show: false },
        axisTick: { show: false }
      },
      series: [
        {
          type: 'bar',
          barWidth: 12,
          data: [
            { value: 4, itemStyle: { color: '#475569', borderRadius: [0, 3, 3, 0] } },
            { value: 8, itemStyle: { color: '#f59e0b', borderRadius: [0, 3, 3, 0] } },
            { value: 18, itemStyle: { color: '#8b5cf6', borderRadius: [0, 3, 3, 0] } },
            { value: 28, itemStyle: { color: '#3b82f6', borderRadius: [0, 3, 3, 0] } },
            { value: 42, itemStyle: { color: '#22d3ee', borderRadius: [0, 3, 3, 0] } }
          ],
          label: {
            show: true,
            position: 'right',
            formatter: (p: { dataIndex: number }) => ['4%', '8%', '18%', '28%', '42%'][p.dataIndex],
            color: '#e2e8f5',
            fontSize: 11
          }
        }
      ]
    })
  }
</script>

<style scoped>
  .order-tab {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  /* KPI */
  .kpi-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }

  .kpi-card {
    display: flex;
    align-items: center;
    padding: 16px 18px;
    background: #131624;
    border: 1px solid #1a2240;
    border-left: 3px solid var(--accent);
    border-radius: 8px;
  }

  .kpi-info {
    flex: 1;
  }

  .kpi-label {
    margin-bottom: 4px;
    font-size: 12px;
    color: #6b7a99;
  }

  .kpi-value {
    font-size: 26px;
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

  /* Filter Row */
  .filter-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    padding: 10px 14px;
    background: #131624;
    border: 1px solid #1a2240;
    border-radius: 8px;
  }

  .filter-item {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 12px;
  }

  .fl {
    color: #6b7a99;
  }

  .fv {
    font-weight: 500;
    color: #e2e8f5;
  }

  .fi-sel {
    width: 120px;
  }

  .fi-search {
    width: 180px;
  }

  .export-btn-sm {
    margin-left: auto;
    font-size: 12px;
    color: #8892a8 !important;
    background: transparent !important;
    border: 1px solid #1e2a44 !important;
  }

  /* Main Layout */
  .main-layout {
    display: flex;
    gap: 12px;
    transition: all 0.3s;
  }

  .left-content {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 12px;
    min-width: 0;
  }

  .detail-open .left-content {
    flex: 0 0 calc(100% - 340px);
  }

  /* Card */
  .card {
    padding: 14px 16px;
    background: #131624;
    border: 1px solid #1a2240;
    border-radius: 8px;
  }

  .card-hd {
    display: block;
    margin-bottom: 10px;
    font-size: 13px;
    font-weight: 600;
    color: #c4d0e8;
  }

  .card-note {
    margin-left: 8px;
    font-size: 10px;
    font-weight: 400;
    color: #4a5a7a;
  }

  .card-action {
    font-size: 11px;
    color: #6b7a99;
    cursor: pointer;
  }

  .card-action:hover {
    color: #22d3ee;
  }

  /* Tables */
  .dt {
    width: 100%;
    font-size: 12px;
    border-collapse: collapse;
  }

  .dt th {
    padding: 5px 7px;
    font-weight: 500;
    color: #6b7a99;
    text-align: left;
    white-space: nowrap;
    border-bottom: 1px solid #1a2240;
  }

  .dt td {
    padding: 6px 7px;
    color: #c4d0e8;
    white-space: nowrap;
    border-bottom: 1px solid #131e30;
  }

  .dt tbody tr:hover {
    background: #1a2035;
  }

  .sm-dt th,
  .sm-dt td {
    padding: 5px 6px;
    font-size: 11px;
  }

  .total-row td {
    color: #e2e8f5;
    border-top: 1px solid #22d3ee44;
    border-bottom: none;
  }

  .row-selected {
    background: #1a2a3f !important;
  }

  .ch-name {
    font-weight: 500;
    color: #e2e8f5;
  }

  .val-cyan {
    font-weight: 600;
    color: #22d3ee;
  }

  .val-blue {
    color: #60a5fa;
  }

  .val-green {
    font-weight: 600;
    color: #10b981;
  }

  .val-muted {
    color: #6b7a99;
  }

  .plat-tag {
    display: inline-block;
    padding: 1px 6px;
    font-size: 10px;
    font-weight: 600;
    border-radius: 3px;
  }

  .plat-ios {
    color: #38bdf8;
    background: #1e3a5f;
  }

  .plat-android {
    color: #4ade80;
    background: #1e3d2a;
  }

  .reten-pill {
    display: inline-block;
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 600;
    border-radius: 3px;
  }

  .ret-high {
    color: #4ade80;
    background: #1e3d2a;
  }

  .ret-low {
    color: #86efac;
    background: #1e2a1e;
  }

  /* Dual Grid */
  .dual-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  /* Order List + Charts */
  .order-charts-grid {
    display: grid;
    grid-template-columns: 1fr 260px;
    gap: 12px;
  }

  .charts-col {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  /* Order table */
  .order-dt td,
  .order-dt th {
    padding: 5px 6px;
    font-size: 11px;
  }

  .order-id {
    font-size: 10px;
    color: #22d3ee;
    cursor: pointer;
  }

  .order-id:hover {
    text-decoration: underline;
  }

  .order-product {
    max-width: 100px;
    overflow: hidden;
    color: #c4d0e8;
    text-overflow: ellipsis;
  }

  .status-tag {
    display: inline-block;
    padding: 1px 7px;
    font-size: 10px;
    font-weight: 600;
    border-radius: 3px;
  }

  .st-ok {
    color: #10b981;
    background: #064e3b;
  }

  .st-refund {
    color: #fb923c;
    background: #3b1c00;
  }

  .st-fail {
    color: #f87171;
    background: #3b1c1c;
  }

  .link-btn {
    font-size: 11px;
    color: #22d3ee;
    cursor: pointer;
  }

  .link-btn:hover {
    text-decoration: underline;
  }

  .list-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .record-count {
    font-size: 11px;
    color: #5a6a8a;
  }

  .pagination {
    display: flex;
    gap: 6px;
    align-items: center;
    margin-top: 10px;
    font-size: 12px;
  }

  .page-btn {
    padding: 2px 6px;
    color: #6b7a99;
    cursor: pointer;
  }

  .page-btn:hover {
    color: #22d3ee;
  }

  .page-cur {
    padding: 2px 8px;
    color: #22d3ee;
    background: #22d3ee20;
    border-radius: 3px;
  }

  .page-info {
    margin-left: auto;
    color: #5a6a8a;
  }

  /* ── Order Detail Panel ───────────────────────── */
  .detail-panel {
    position: sticky;
    top: 0;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    align-self: flex-start;
    width: 320px;
    max-height: calc(100vh - 120px);
    overflow: hidden;
    overflow-y: auto;
    background: #131624;
    border: 1px solid #1a2240;
    border-radius: 8px;
  }

  .detail-header {
    display: flex;
    flex-shrink: 0;
    gap: 8px;
    align-items: center;
    padding: 14px 16px;
    border-bottom: 1px solid #1a2240;
  }

  .detail-title {
    display: flex;
    flex: 1;
    gap: 6px;
    align-items: center;
    font-size: 14px;
    font-weight: 600;
    color: #c4d0e8;
  }

  .detail-order-id {
    font-size: 11px;
    color: #6b7a99;
  }

  .close-btn {
    padding: 2px;
    font-size: 16px;
    color: #6b7a99;
    cursor: pointer;
  }

  .close-btn:hover {
    color: #e2e8f5;
  }

  .pay-status {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 10px 16px;
    background: #0d2a1a;
    border-bottom: 1px solid #1a2240;
  }

  .pay-ok-dot {
    font-size: 14px;
    font-weight: 700;
    color: #10b981;
  }

  .pay-ok-text {
    flex: 1;
    font-size: 13px;
    font-weight: 600;
    color: #10b981;
  }

  .pay-amount {
    font-size: 15px;
    font-weight: 700;
    color: #e2e8f5;
  }

  .detail-sections {
    padding: 0 16px;
  }

  .detail-section {
    padding: 12px 0;
    border-bottom: 1px solid #1a2240;
  }

  .detail-section:last-child {
    border-bottom: none;
  }

  .ds-title {
    margin-bottom: 8px;
    font-size: 12px;
    font-weight: 600;
    color: #8892a8;
  }

  .ds-grid {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .ds-row {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    justify-content: space-between;
  }

  .ds-k {
    flex-shrink: 0;
    min-width: 80px;
    font-size: 11px;
    color: #6b7a99;
    white-space: nowrap;
  }

  .ds-v {
    font-size: 11px;
    color: #c4d0e8;
    text-align: right;
    word-break: break-all;
  }

  .detail-footer {
    display: flex;
    flex-shrink: 0;
    flex-wrap: wrap;
    gap: 6px;
    padding: 12px 16px;
    border-top: 1px solid #1a2240;
  }

  .detail-btn {
    font-size: 11px;
    color: #a0b0cc !important;
    background: #1a2240 !important;
    border-color: #2a3450 !important;
  }

  .detail-btn-primary {
    font-size: 11px;
    color: #22d3ee !important;
    background: #22d3ee22 !important;
    border-color: #22d3ee44 !important;
  }

  .detail-btn-outline {
    font-size: 11px;
    color: #8892a8 !important;
    background: transparent !important;
    border-color: #2a3450 !important;
  }

  /* ── Slide Transition ─────────────────────────── */
  .slide-enter-active,
  .slide-leave-active {
    transition: all 0.25s ease;
  }

  .slide-enter-from,
  .slide-leave-to {
    opacity: 0;
    transform: translateX(20px);
  }

  /* ── Element Plus overrides ───────────────────── */
  :deep(.fi-sel .el-input__wrapper),
  :deep(.fi-search .el-input__wrapper) {
    background: #1a2240 !important;
    border: 1px solid #2a3450 !important;
    box-shadow: none !important;
  }

  :deep(.fi-sel .el-input__inner),
  :deep(.fi-search .el-input__inner) {
    font-size: 12px;
    color: #e2e8f5 !important;
  }

  :deep(.fi-sel .el-select__caret) {
    color: #5a6a8a !important;
  }

  /* Scrollbar */
  .detail-panel::-webkit-scrollbar {
    width: 4px;
  }

  .detail-panel::-webkit-scrollbar-track {
    background: transparent;
  }

  .detail-panel::-webkit-scrollbar-thumb {
    background: #1e2a44;
    border-radius: 2px;
  }
</style>
