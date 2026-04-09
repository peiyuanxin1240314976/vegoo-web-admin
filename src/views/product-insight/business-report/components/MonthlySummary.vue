<template>
  <div class="ms-wrap">
    <!-- Header Row -->
    <div class="section-header">
      <span class="title-main">整体</span>
      <span class="title-main">全部平台</span>
      <span class="period-badge">{{ reportLabel }}</span>
      <span class="period-text">{{ currentMonthLabel }}</span>
      <span class="update-time"
        >数据更新时间：{{ updateTimeText }}
        <button class="refresh-btn" title="刷新" :disabled="ctx?.loading.value" @click="refreshNow">
          ↻
        </button></span
      >
    </div>

    <!-- KPI Cards Row -->
    <div class="kpi-row">
      <KpiCard v-for="kpi in monthlyKpis" :key="kpi.key" :metric="kpi" class="kpi-card-item" />
    </div>

    <!-- 3-column content area -->
    <div class="content-grid" style="flex: 1">
      <!-- Left: 用户指标 -->
      <div class="content-col">
        <div class="table-section table-card">
          <div class="table-title"> 用户指标 </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>指标</th>
                <th>{{ currentMonthLabel }}</th>
                <th>{{ previousMonthLabel }}</th>
                <th>月环比</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in monthlyUserMetrics" :key="row.name">
                <td class="metric-name">{{ row.name }}</td>
                <td>{{ row.current }}</td>
                <td class="muted">{{ row.previous }}</td>
                <td :class="changeClass(row.changeType)">{{ row.change }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 留存率 -->
        <div class="table-section table-card">
          <div class="table-title">留存率</div>
          <table class="data-table">
            <thead>
              <tr>
                <th>指标</th>
                <th>{{ currentMonthLabel }}</th>
                <th>{{ previousMonthLabel }}</th>
                <th>月环比</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in retentionMetrics" :key="row.day">
                <td class="metric-name">{{ row.day }}</td>
                <td>{{ row.current }}</td>
                <td class="muted">{{ row.previous }}</td>
                <td :class="changeClass(row.changeType)">{{ row.change }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Middle: ROI + 收缴指标 -->
      <div class="content-col">
        <div class="table-section table-card">
          <div class="table-title">ROI 跟踪</div>
          <table class="data-table">
            <thead>
              <tr>
                <th>ROI类型</th>
                <th>{{ currentMonthLabel }}</th>
                <th>{{ previousMonthLabel }}</th>
                <th>月环比</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in roiMetrics" :key="row.type">
                <td class="metric-name">{{ row.type }}</td>
                <td :class="roiValueClass(row.current)">{{ row.current }}</td>
                <td class="muted">{{ row.previous }}</td>
                <td :class="changeClass(row.changeType ?? 'neutral')">{{ row.change }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="table-section table-card">
          <div class="table-title">收缴指标</div>
          <table class="data-table">
            <thead>
              <tr>
                <th>指标</th>
                <th>{{ currentMonthLabel }}</th>
                <th>{{ previousMonthLabel }}</th>
                <th>月环比</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in monthlyRevenueMetrics" :key="row.name">
                <td class="metric-name">{{ row.name }}</td>
                <td>{{ row.current }}</td>
                <td class="muted">{{ row.previous }}</td>
                <td :class="changeClass(row.changeType)">{{ row.change }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Right: 费用抄扣 -->
      <div class="content-col fee-col">
        <div class="fee-panel table-card">
          <div class="fee-header">
            <span class="fee-title">费用抄扣</span>
            <span class="fee-badge">月报专有</span>
            <span class="fee-warning">⚠</span>
          </div>
          <div class="fee-total-row">
            <span class="fee-total-label">费用抄扣合计</span>
          </div>
          <div class="fee-total-value">
            <span class="fee-amount">-$79,101.52</span>
            <span class="fee-change positive">月环比 +12.3%</span>
          </div>
          <div class="fee-divider" />
          <table class="fee-table">
            <thead>
              <tr>
                <th>费用项目</th>
                <th>金额</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in feeItems" :key="item.name">
                <td>{{ item.name }}</td>
                <td
                  :class="
                    item.amount.startsWith('+')
                      ? 'positive'
                      : item.amount.startsWith('-')
                        ? 'negative'
                        : ''
                  "
                >
                  {{ item.amount }}
                </td>
              </tr>
              <tr class="fee-total-row-table">
                <td><strong>合计</strong></td>
                <td class="negative"><strong>-$79,101.52</strong></td>
              </tr>
            </tbody>
          </table>
          <div class="fee-note">费用抄扣已计入预估利润计算</div>
        </div>
      </div>
    </div>

    <!-- Push Bar -->
    <div class="ms-push-bar">
      <span class="ms-push-last">{{ pushText }}</span>
      <button class="ms-push-btn" type="button" @click="openPushModal()">立即推送</button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, inject } from 'vue'
  import KpiCard from './KpiCard.vue'
  import { businessReportContextKey } from '../composables/business-report-context'
  import {
    monthlyKpis as monthlyKpisMock,
    monthlyUserMetrics as monthlyUserMetricsMock,
    roiMetrics as roiMetricsMock,
    retentionMetrics as retentionMetricsMock,
    monthlyRevenueMetrics as monthlyRevenueMetricsMock,
    feeDeductions as feeDeductionsMock
  } from '../mockData'

  defineOptions({ name: 'MonthlySummary' })

  const openPushModal = inject<() => void>('openPushModal', () => {})
  const ctx = inject(businessReportContextKey)

  const monthlyKpis = computed(() => ctx?.summary.value?.kpis ?? monthlyKpisMock)
  const monthlyUserMetrics = computed(
    () => ctx?.summary.value?.userMetrics ?? monthlyUserMetricsMock
  )
  const retentionMetrics = computed(
    () => ctx?.summary.value?.retentionMetrics ?? retentionMetricsMock
  )
  const roiMetrics = computed(() => ctx?.summary.value?.roiMetrics ?? roiMetricsMock)
  const monthlyRevenueMetrics = computed(
    () => ctx?.summary.value?.revenueMetrics ?? monthlyRevenueMetricsMock
  )
  const feeItems = computed(() => ctx?.summary.value?.feeDeductions ?? feeDeductionsMock)
  const reportLabel = computed(() => {
    if (ctx?.period.value === 'daily') return '日报'
    if (ctx?.period.value === 'weekly') return '周报'
    return '月报'
  })
  function prevMonthLabel(ym: string): string {
    const [y, m] = ym.split('-').map(Number)
    const d = new Date(y, m - 2, 1)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  }
  const currentMonthLabel = computed(() => {
    const range = ctx?.reportRange.value
    return range ? range.startDate.slice(0, 7) : '--'
  })
  const previousMonthLabel = computed(() =>
    currentMonthLabel.value === '--' ? '--' : prevMonthLabel(currentMonthLabel.value)
  )
  const updateTimeText = '--'
  const pushText = computed(
    () =>
      ctx?.getLastPushText?.(ctx?.period.value ?? 'monthly') ??
      `上次推送：-- 飞书群《经营${reportLabel.value}》`
  )
  async function refreshNow() {
    await ctx?.refreshReport()
  }

  function changeClass(type?: string) {
    if (type === 'positive') return 'positive'
    if (type === 'negative') return 'negative'
    return 'neutral'
  }

  function roiValueClass(val: string) {
    if (!val || val === '-') return ''
    const n = parseFloat(val)
    if (n >= 100) return 'roi-green'
    if (n > 0) return 'roi-orange'
    return ''
  }
</script>

<style scoped>
  .ms-wrap {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 20px 20px 56px;
    color: var(--rp-text);
    background: var(--rp-surface);
    border: 1px solid var(--rp-border);
    border-radius: 12px;
  }

  .section-header {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .title-main {
    font-size: 18px;
    font-weight: 700;
    color: rgb(255 255 255 / 90%);
  }

  .period-badge {
    padding: 2px 8px;
    font-size: 11px;
    color: var(--rp-accent);
    background: rgb(0 212 161 / 15%);
    border: 1px solid rgb(0 212 161 / 30%);
    border-radius: 4px;
  }

  .period-text {
    font-size: 13px;
    color: var(--rp-muted);
  }

  .update-time {
    margin-left: auto;
    font-size: 11px;
    color: var(--rp-muted);
  }

  .refresh-btn {
    padding: 2px 6px;
    font-size: 14px;
    color: var(--rp-muted);
    cursor: pointer;
    background: none;
    border: none;
    transition: color 0.2s;
  }

  .refresh-btn:hover {
    color: var(--rp-accent);
  }

  .kpi-row {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 12px;
  }

  .content-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 320px;
    gap: 16px;
    align-items: start;
  }

  .content-col {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .table-title {
    margin-bottom: 10px;
    font-size: 13px;
    font-weight: 600;
    color: var(--rp-text);
  }

  .table-card {
    padding: 14px 16px;
    background: var(--rp-surface);
    border: 1px solid var(--rp-border);
    border-radius: 10px;
  }

  .data-table {
    width: 100%;
    font-size: 12px;
    border-collapse: collapse;
  }

  .data-table th {
    padding: 6px 8px;
    font-weight: 500;
    color: var(--rp-muted);
    text-align: right;
    border-bottom: 1px solid var(--rp-border);
  }

  .data-table th:first-child {
    text-align: left;
  }

  .data-table td {
    padding: 7px 8px;
    text-align: right;
    border-bottom: 1px solid rgb(255 255 255 / 3%);
  }

  .data-table td.metric-name {
    color: var(--rp-muted);
    text-align: left;
  }

  .data-table td.muted {
    color: var(--rp-muted);
  }

  /* Fee Panel */
  .fee-panel {
    background: rgb(251 191 36 / 4%);
    border-color: rgb(251 191 36 / 35%);
  }

  .fee-header {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 12px;
  }

  .fee-title {
    font-size: 13px;
    font-weight: 600;
  }

  .fee-badge {
    padding: 1px 6px;
    font-size: 10px;
    color: #fcd34d;
    background: rgb(251 191 36 / 15%);
    border: 1px solid rgb(251 191 36 / 30%);
    border-radius: 3px;
  }

  .fee-warning {
    color: #fcd34d;
  }

  .fee-total-label {
    font-size: 11px;
    color: var(--rp-muted);
  }

  .fee-total-value {
    display: flex;
    gap: 10px;
    align-items: baseline;
    margin: 4px 0 12px;
  }

  .fee-amount {
    font-size: 22px;
    font-weight: 700;
    color: #f87171;
  }

  .fee-change {
    font-size: 11px;
  }

  .fee-divider {
    height: 1px;
    margin-bottom: 12px;
    background: var(--rp-border);
  }

  .fee-table {
    width: 100%;
    font-size: 12px;
    border-collapse: collapse;
  }

  .fee-table th {
    padding: 5px 0;
    font-weight: 500;
    color: var(--rp-muted);
    border-bottom: 1px solid var(--rp-border);
  }

  .fee-table th:last-child {
    text-align: right;
  }

  .fee-table td {
    padding: 5px 0;
    border-bottom: 1px solid rgb(255 255 255 / 3%);
  }

  .fee-table td:last-child {
    text-align: right;
  }

  .fee-total-row-table td {
    padding-top: 8px;
    border-top: 1px solid var(--rp-border);
  }

  .fee-note {
    margin-top: 10px;
    font-size: 10px;
    color: var(--rp-muted);
  }

  /* Colors */
  .positive {
    color: #4ade80;
  }

  .negative {
    color: #f87171;
  }

  .neutral {
    color: var(--rp-muted);
  }

  .roi-green {
    font-weight: 600;
    color: #4ade80;
  }

  .roi-orange {
    font-weight: 600;
    color: #fb923c;
  }

  /* ── Push Bar ────────────────────────────────────────────────── */
  .ms-push-bar {
    position: absolute;
    right: 20px;
    bottom: 16px;
    display: flex;
    gap: 16px;
    align-items: center;
  }

  .ms-push-last {
    font-size: 12px;
    color: var(--rp-muted);
  }

  .ms-push-btn {
    padding: 7px 20px;
    font-size: 13px;
    font-weight: 600;
    color: #000;
    cursor: pointer;
    background: #00d4a1;
    border: none;
    border-radius: 9999px;
    transition: filter 0.15s;
  }

  .ms-push-btn:hover {
    filter: brightness(1.08);
  }
</style>
