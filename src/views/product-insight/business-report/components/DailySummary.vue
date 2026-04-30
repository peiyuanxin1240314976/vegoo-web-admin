<template>
  <div class="daily-summary">
    <!-- ── 标题卡 ─────────────────────────────────────────── -->
    <div class="summary-title-card">
      <div class="stc-left">
        <span class="stc-app">{{ props.appName }}</span>
        <span class="stc-app">{{ props.platformName }}</span>
        <span class="stc-badge">{{ reportLabel }}</span>
        <span class="stc-date">{{ fullDateText }}</span>
      </div>
      <div class="stc-right">
        <div class="stc-top-row">
          <span class="stc-update">数据更新时间：{{ updateTimeText }}</span>
          <button class="stc-refresh-btn" :disabled="ctx?.loading.value" @click="refreshNow">
            <span class="stc-refresh-icon">↺</span>
            刷新
          </button>
        </div>
      </div>
    </div>

    <!-- ── 右下角推送 ─────────────────────────────────────── -->
    <div class="ds-push-bar">
      <span class="ds-push-last">{{ pushText }}</span>
      <button class="ds-push-btn" @click="openPushModal()">立即推送</button>
    </div>

    <!-- ── KPI Cards（第一排不动）────────────────────────── -->
    <div class="kpi-row">
      <KpiCard v-for="m in kpis" :key="m.key" :metric="m" />
    </div>

    <!-- ── 三列主体 ─────────────────────────────────────── -->
    <div class="tri-grid">
      <!-- 左列：用户指标 + 留存率 -->
      <div class="tri-col tri-col--left">
        <div class="data-card">
          <div class="card-title">
            用户指标
            <el-tooltip content="按装机日追踪用户行为" placement="top">
              <span class="info-icon">ⓘ</span>
            </el-tooltip>
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>指标</th>
                <th>{{ currentPeriodLabel }} {{ dateLabelText }}</th>
                <th>{{ previousPeriodLabel }} {{ prevDateLabelText }}</th>
                <th>环比</th>
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

        <div class="data-card">
          <div class="card-title">
            留存率（按装机日追踪）
            <el-tooltip content="按装机日追踪留存率" placement="top">
              <span class="info-icon">ⓘ</span>
            </el-tooltip>
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>指标</th>
                <th>今日</th>
                <th>昨日</th>
                <th>环比</th>
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

      <!-- 中列：ROI 跟踪 -->
      <div class="tri-col">
        <div class="data-card data-card--full">
          <div class="card-title">ROI 跟踪</div>
          <table class="data-table">
            <thead>
              <tr>
                <th>ROI 类型</th>
                <th>{{ currentPeriodLabel }} {{ dateLabelText }}</th>
                <th>{{ previousPeriodLabel }} {{ prevDateLabelText }}</th>
                <th>环比</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in roiRows" :key="row.type">
                <td class="row-name">{{ row.type }}</td>
                <td :class="['roi-val', row.isHighlighted ? 'roi-green' : 'roi-orange']">
                  {{ row.current }}
                </td>
                <td class="muted">{{ row.previous }}</td>
                <td class="change positive">{{ row.change }}</td>
              </tr>
            </tbody>
          </table>
          <p class="roi-hint">首日ROI基于昨日及更早装机用户计算</p>
        </div>
      </div>

      <!-- 右列：收入指标 -->
      <div class="tri-col">
        <div class="data-card data-card--full">
          <div class="card-title">收入指标</div>
          <table class="data-table">
            <thead>
              <tr>
                <th>指标</th>
                <th>今日</th>
                <th>昨日</th>
                <th>环比</th>
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
</template>

<script setup lang="ts">
  import { computed, inject } from 'vue'
  import KpiCard from './KpiCard.vue'
  import { businessReportContextKey } from '../composables/business-report-context'
  import type { KpiMetric } from '../types'
  import {
    dailyKpis,
    dailyUserMetrics,
    roiMetrics,
    retentionMetrics,
    dailyRevenueMetrics
  } from '../mockData'

  const props = withDefaults(
    defineProps<{
      dateLabel?: string
      prevDateLabel?: string
      appName?: string
      platformName?: string
      fullDate?: string
      weekday?: string
      updateTime?: string
    }>(),
    {
      dateLabel: '--',
      prevDateLabel: '--',
      appName: '整体',
      platformName: '全部平台',
      fullDate: '--',
      weekday: '',
      updateTime: '--'
    }
  )

  const openPushModal = inject<() => void>('openPushModal', () => {})
  const ctx = inject(businessReportContextKey)

  const KPI_FALLBACK_THEME: Array<Pick<KpiMetric, 'color' | 'bg'>> = [
    {
      color: '#00D4A1',
      bg: 'linear-gradient(135deg, rgba(0,212,161,0.22), rgba(0,212,161,0.08))'
    },
    {
      color: '#22C55E',
      bg: 'linear-gradient(135deg, rgba(34,197,94,0.22), rgba(34,197,94,0.08))'
    },
    {
      color: '#3B82F6',
      bg: 'linear-gradient(135deg, rgba(59,130,246,0.22), rgba(59,130,246,0.08))'
    },
    {
      color: '#F59E0B',
      bg: 'linear-gradient(135deg, rgba(245,158,11,0.22), rgba(245,158,11,0.08))'
    },
    {
      color: '#8B5CF6',
      bg: 'linear-gradient(135deg, rgba(139,92,246,0.22), rgba(139,92,246,0.08))'
    }
  ]

  const kpis = computed<KpiMetric[]>(() => {
    const source = ctx?.summary.value?.kpis ?? dailyKpis
    return source.map((metric, index) => {
      const theme = KPI_FALLBACK_THEME[index % KPI_FALLBACK_THEME.length]
      return {
        ...metric,
        color: metric.color || theme.color,
        bg: metric.bg || theme.bg,
        sparkline: metric.sparkline ?? [],
        changeLabel:
          metric.changeLabel ||
          `${metric.change >= 0 ? '环比昨日 ↑ ' : '环比昨日 ↓ '}${Math.abs(metric.change)}%`
      }
    })
  })
  const userMetrics = computed(() => ctx?.summary.value?.userMetrics ?? dailyUserMetrics)
  const roiRows = computed(() => ctx?.summary.value?.roiMetrics ?? roiMetrics)
  const retention = computed(() => ctx?.summary.value?.retentionMetrics ?? retentionMetrics)
  const revenueMetrics = computed(() => ctx?.summary.value?.revenueMetrics ?? dailyRevenueMetrics)
  const reportLabel = computed(() => {
    if (ctx?.period.value === 'weekly') return '周报'
    if (ctx?.period.value === 'monthly') return '月报'
    return '日报'
  })
  const currentPeriodLabel = computed(() => (ctx?.period.value === 'daily' ? '今日' : '本期'))
  const previousPeriodLabel = computed(() => (ctx?.period.value === 'daily' ? '昨日' : '上期'))
  function shiftDay(ymd: string, offset: number): string {
    const [y, m, d] = ymd.split('-').map(Number)
    const date = new Date(y, m - 1, d)
    date.setDate(date.getDate() + offset)
    const yy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    return `${yy}-${mm}-${dd}`
  }
  const dateLabelText = computed(() => ctx?.reportRange.value?.startDate ?? props.dateLabel)
  const prevDateLabelText = computed(() => {
    const cur = ctx?.reportRange.value?.startDate
    if (!cur) return props.prevDateLabel
    return shiftDay(cur, -1)
  })
  const fullDateText = computed(() => {
    const range = ctx?.reportRange.value
    if (!range) return `${props.fullDate} ${props.weekday}`
    if (ctx?.period.value === 'weekly') return `${range.startDate} - ${range.endDate}`
    if (ctx?.period.value === 'monthly') return range.startDate.slice(0, 7)
    return range.startDate
  })
  const updateTimeText = computed(() => props.updateTime)
  const pushText = computed(
    () =>
      ctx?.getLastPushText?.(ctx?.period.value ?? 'daily') ??
      `上次推送：-- 飞书群《经营${reportLabel.value}》`
  )
  async function refreshNow() {
    await ctx?.refreshReport()
  }
</script>

<style scoped>
  .daily-summary {
    position: relative;
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 14px;
    padding: 14px 14px 52px;
    overflow-y: auto;
    background: rgb(255 255 255 / 3%);
    border: 1px solid rgb(255 255 255 / 7%);
    border-radius: 12px;
  }

  /* ── 标题行（无背景）──────────────────────────────────────── */
  .summary-title-card {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: space-between;
    padding: 4px 2px;
  }

  .stc-left {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .stc-app {
    font-size: 18px;
    font-weight: 700;
    color: rgb(255 255 255 / 90%);
  }

  .stc-badge {
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 700;
    color: #000;
    background: #00d4a1;
    border-radius: 4px;
  }

  .stc-date {
    font-size: 13px;
    color: rgb(255 255 255 / 65%);
  }

  .stc-right {
    display: flex;
    flex-direction: column;
    gap: 6px;
    align-items: flex-end;
  }

  .stc-top-row {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .stc-bottom-row {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .stc-update {
    font-size: 12px;
    color: rgb(255 255 255 / 40%);
  }

  .stc-lark-last {
    font-size: 11px;
    color: rgb(255 255 255 / 35%);
  }

  .stc-push-btn {
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

  .stc-refresh-btn {
    display: flex;
    gap: 4px;
    align-items: center;
    padding: 5px 12px;
    font-size: 12px;
    color: #4a9ef5;
    cursor: pointer;
    background: rgb(74 158 245 / 10%);
    border: 1px solid rgb(74 158 245 / 30%);
    border-radius: 6px;
    transition: background 0.15s;

    &:hover {
      background: rgb(74 158 245 / 18%);
    }
  }

  .stc-refresh-icon {
    font-size: 14px;
  }

  /* ── KPI 行 ────────────────────────────────────────────── */
  .kpi-row {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 10px;
  }

  @media (width <= 1200px) {
    .kpi-row {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  /* ── 三列网格 ────────────────────────────────────────────── */
  .tri-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    align-items: stretch;
  }

  .tri-col {
    display: flex;
    flex-direction: column;
  }

  .tri-col--left {
    gap: 12px;
  }

  .tri-col--left .data-card {
    flex: 1;
  }

  /* ── 卡片 ────────────────────────────────────────────────── */
  .data-card {
    display: flex;
    flex-direction: column;
    padding: 14px;
    overflow-x: auto;
    background: rgb(255 255 255 / 3%);
    border: 1px solid rgb(255 255 255 / 7%);
    border-radius: 10px;
  }

  .data-card--full {
    flex: 1;
  }

  .card-title {
    display: flex;
    flex-shrink: 0;
    gap: 6px;
    align-items: center;
    margin-bottom: 12px;
    font-size: 13px;
    font-weight: 700;
    color: rgb(255 255 255 / 90%);
  }

  .info-icon {
    font-size: 12px;
    color: rgb(255 255 255 / 30%);
    cursor: help;
  }

  /* ── 表格 ────────────────────────────────────────────────── */
  .data-table {
    width: 100%;
    font-size: 12px;
    border-collapse: collapse;
  }

  .data-table thead {
    background: rgb(255 255 255 / 6%);
  }

  .data-table th {
    padding: 7px 10px;
    font-weight: 600;
    color: rgb(255 255 255 / 55%);
    text-align: left;
    white-space: nowrap;
  }

  .data-table th:first-child {
    border-radius: 4px 0 0 4px;
  }

  .data-table th:last-child {
    border-radius: 0 4px 4px 0;
  }

  .data-table td {
    padding: 7px 10px;
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
    color: rgb(255 255 255 / 65%) !important;
  }

  .muted {
    color: rgb(255 255 255 / 40%) !important;
  }

  .change.positive {
    color: #00d4a1;
  }

  .change.negative {
    color: #ff5c5c;
  }

  .change.neutral {
    color: rgb(255 255 255 / 40%);
  }

  .roi-val {
    font-weight: 600;
  }

  .roi-orange {
    color: #fb923c;
  }

  .roi-green {
    color: #4ade80;
  }

  .roi-hint {
    flex-shrink: 0;
    margin-top: 8px;
    font-size: 10px;
    color: rgb(255 255 255 / 30%);
  }

  /* ── 右下角推送栏 ─────────────────────────────────────────── */
  .ds-push-bar {
    position: absolute;
    right: 14px;
    bottom: 14px;
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .ds-push-last {
    font-size: 11px;
    color: rgb(255 255 255 / 35%);
  }

  .ds-push-btn {
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
