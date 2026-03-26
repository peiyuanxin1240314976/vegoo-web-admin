<template>
  <div class="weekly-summary">
    <!-- ── 标题行 ──────────────────────────────────────────────── -->
    <div class="ws-title-row">
      <div class="ws-title-left">
        <span class="ws-title-app">整体</span>
        <span class="ws-title-app">全部平台</span>
        <span class="ws-title-badge">周报</span>
        <span class="ws-title-date">2026年第10周 （3/9-3/15）</span>
      </div>
      <div class="ws-title-right">
        <span class="ws-update">数据更新时间：今日 08:30</span>
        <span class="ws-refresh">↺</span>
      </div>
    </div>

    <!-- ── KPI 卡片行 ──────────────────────────────────────────── -->
    <div class="kpi-row">
      <KpiCard v-for="m in kpis" :key="m.key" :metric="m" />
    </div>

    <!-- ── 主体 2列布局 ────────────────────────────────────────── -->
    <div class="ws-main-grid">
      <!-- 左列：用户指标 + 留存率 -->
      <div class="ws-col">
        <!-- 用户指标 -->
        <div class="data-card">
          <div class="card-title">用户指标</div>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>指标</th>
                  <th>本周 3/9-3/15</th>
                  <th>上周 3/2-3/8</th>
                  <th>周环比</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in userMetrics" :key="row.name">
                  <td class="row-name">{{ row.name }}</td>
                  <td>{{ row.current }}</td>
                  <td class="muted">{{ row.previous }}</td>
                  <td :class="['change', row.changeType]">{{ row.change }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 留存率 -->
        <div class="data-card">
          <div class="card-title">留存率（按装机日追踪）</div>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>指标</th>
                  <th>本周</th>
                  <th>上周</th>
                  <th>周环比</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in retention" :key="row.day">
                  <td class="row-name">{{ row.day }}</td>
                  <td>{{ row.current }}</td>
                  <td class="muted">{{ row.previous }}</td>
                  <td :class="['change', row.changeType]">{{ row.change }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 右列：ROI跟踪 + 收缴指标 -->
      <div class="ws-col">
        <!-- ROI跟踪 -->
        <div class="data-card">
          <div class="card-title">ROI 跟踪</div>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>ROI类型</th>
                  <th>本周</th>
                  <th>上周</th>
                  <th>周环比</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in roiRows" :key="row.type">
                  <td class="row-name">{{ row.type }}</td>
                  <td :class="['roi-val', roiColor(row.current)]">{{ row.current }}</td>
                  <td class="muted">{{ row.previous }}</td>
                  <td :class="['change', roiChangeType(row.change)]">{{ row.change }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 收缴指标 -->
        <div class="data-card">
          <div class="card-title">收缴指标</div>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>指标</th>
                  <th>本周</th>
                  <th>上周</th>
                  <th>周环比</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in revenueMetrics" :key="row.name">
                  <td class="row-name">{{ row.name }}</td>
                  <td>{{ row.current }}</td>
                  <td class="muted">{{ row.previous }}</td>
                  <td :class="['change', row.changeType]">{{ row.change }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- ── 底部推送栏 ───────────────────────────────────────────── -->
    <div class="ws-push-bar">
      <span class="ws-push-last">上次推送：本周一 08:30 飞书群《经营周报》</span>
      <button class="ws-push-btn" @click="openPushModal()">立即推送</button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, inject } from 'vue'
  import KpiCard from './KpiCard.vue'
  import { businessReportContextKey } from '../composables/business-report-context'
  import { weeklyKpis, weeklyUserMetrics, roiMetrics, retentionMetrics } from '../mockData'
  import type { RevenueRow } from '../types'

  defineOptions({ name: 'WeeklySummary' })

  const openPushModal = inject<() => void>('openPushModal', () => {})
  const ctx = inject(businessReportContextKey)

  const kpis = computed(() => ctx?.summary.value?.kpis ?? weeklyKpis)
  const userMetrics = computed(() => ctx?.summary.value?.userMetrics ?? weeklyUserMetrics)
  const roiRows = computed(() => ctx?.summary.value?.roiMetrics ?? roiMetrics)
  const retention = computed(() => ctx?.summary.value?.retentionMetrics ?? retentionMetrics)

  const weeklyRevenueMetricsFallback: RevenueRow[] = [
    {
      name: '总收缴',
      current: '$1,064,100',
      previous: '$981,500',
      change: '+8.4%',
      changeType: 'positive'
    },
    {
      name: '付费收缴',
      current: '$302,400',
      previous: '$277,200',
      change: '+9.1%',
      changeType: 'positive'
    },
    {
      name: '广告收缴',
      current: '$761,700',
      previous: '$704,300',
      change: '+8.2%',
      changeType: 'positive'
    },
    {
      name: '预估利润',
      current: '$762,300',
      previous: '$699,300',
      change: '+9.0%',
      changeType: 'positive'
    },
    {
      name: '计算利润',
      current: '$680,400',
      previous: '$625,800',
      change: '+8.7%',
      changeType: 'positive'
    },
    {
      name: '广告支出',
      current: '$287,700',
      previous: '$266,700',
      change: '+7.9%',
      changeType: 'positive'
    }
  ]

  const revenueMetrics = computed(
    () => ctx?.summary.value?.revenueMetrics ?? weeklyRevenueMetricsFallback
  )

  const roiColor = (val: string) => {
    if (val === '-') return ''
    const n = parseInt(val)
    return n >= 100 ? 'roi-green' : 'roi-orange'
  }

  const roiChangeType = (val: string) => {
    if (!val || val === '-' || val === '0pp') return 'neutral'
    return val.startsWith('+') ? 'positive' : 'negative'
  }
</script>

<style scoped>
  .weekly-summary {
    position: relative;
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 14px;
    padding: 14px 14px 52px;

    /* 不允许整体滚动 — 撑满父容器高度 */
    overflow: hidden;
    background: rgb(255 255 255 / 3%);
    border: 1px solid rgb(255 255 255 / 7%);
    border-radius: 12px;
  }

  /* ── 标题行 ─────────────────────────────────────────────────── */
  .ws-title-row {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: space-between;
    padding: 2px 0;
  }

  .ws-title-left {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .ws-title-app {
    font-size: 18px;
    font-weight: 700;
    color: rgb(255 255 255 / 90%);
  }

  .ws-title-badge {
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 700;
    color: #000;
    background: #00d4a1;
    border-radius: 4px;
  }

  .ws-title-date {
    font-size: 13px;
    color: rgb(255 255 255 / 55%);
  }

  .ws-title-right {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .ws-update {
    font-size: 12px;
    color: rgb(255 255 255 / 38%);
  }

  .ws-refresh {
    font-size: 14px;
    color: rgb(255 255 255 / 35%);
    cursor: pointer;
    transition: color 0.15s;

    &:hover {
      color: #00d4a1;
    }
  }

  /* ── KPI 卡片行 ──────────────────────────────────────────────── */
  .kpi-row {
    display: grid;
    flex-shrink: 0;
    grid-template-columns: repeat(5, 1fr);
    gap: 10px;
  }

  @media (width <= 1200px) {
    .kpi-row {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  /* ── 主体 2列布局 ────────────────────────────────────────────── */
  .ws-main-grid {
    display: grid;

    /* 用剩余高度填满，但不能超出 */
    flex: 1;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    min-height: 0;
  }

  .ws-col {
    display: flex;
    flex-direction: column;
    gap: 12px;

    /* 各列等高，每张卡 flex:1 → 各占列高 50% = 总高 1/4 */
    min-height: 0;
  }

  /* ── 数据卡片（各占 1/4 总高）────────────────────────────────── */
  .data-card {
    /* flex:1 让左/右列中的两张卡平分列高 */
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    padding: 14px;
    overflow: hidden;
    background: rgb(255 255 255 / 3%);
    border: 1px solid rgb(255 255 255 / 7%);
    border-radius: 10px;
  }

  .card-title {
    flex-shrink: 0;
    margin-bottom: 12px;
    font-size: 13px;
    font-weight: 700;
    color: rgb(255 255 255 / 90%);
  }

  /* ── 表格滚动容器 ────────────────────────────────────────────── */
  .table-wrap {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgb(255 255 255 / 10%) transparent;
  }

  .table-wrap::-webkit-scrollbar {
    width: 4px;
  }

  .table-wrap::-webkit-scrollbar-thumb {
    background: rgb(255 255 255 / 10%);
    border-radius: 2px;
  }

  /* ── 表格 ──────────────────────────────────────────────────── */
  .data-table {
    width: 100%;
    font-size: 12px;
    border-collapse: collapse;
  }

  .data-table th {
    padding: 5px 8px;
    font-weight: 500;
    color: rgb(255 255 255 / 40%);
    text-align: left;
    white-space: nowrap;
    border-bottom: 1px solid rgb(255 255 255 / 6%);
  }

  .data-table td {
    padding: 7px 8px;
    color: rgb(255 255 255 / 85%);
    white-space: nowrap;
  }

  .data-table tbody tr:not(:last-child) td {
    border-bottom: 1px solid rgb(255 255 255 / 4%);
  }

  .data-table tbody tr:hover td {
    background: rgb(255 255 255 / 3%);
  }

  .row-name {
    color: rgb(255 255 255 / 55%) !important;
  }

  .muted {
    color: rgb(255 255 255 / 38%) !important;
  }

  .change.positive {
    color: #00d4a1;
  }

  .change.negative {
    color: #ff5c5c;
  }

  .change.neutral {
    color: rgb(255 255 255 / 38%);
  }

  /* ── ROI 颜色 ─────────────────────────────────────────────── */
  .roi-val {
    font-weight: 600;
  }

  .roi-green {
    color: #4ade80;
  }

  .roi-orange {
    color: #fb923c;
  }

  /* ── 底部推送栏 ──────────────────────────────────────────────── */
  .ws-push-bar {
    position: absolute;
    right: 14px;
    bottom: 14px;
    left: 14px;
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: flex-end;
  }

  .ws-push-last {
    font-size: 11px;
    color: rgb(255 255 255 / 35%);
  }

  .ws-push-btn {
    padding: 4px 14px;
    font-size: 11px;
    font-weight: 600;
    color: #000;
    cursor: pointer;
    background: #00d4a1;
    border: none;
    border-radius: 5px;
    transition: opacity 0.2s;

    &:hover {
      opacity: 0.85;
    }
  }
</style>
