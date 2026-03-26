<template>
  <div class="daily-summary">
    <!-- ── 标题卡 ─────────────────────────────────────────── -->
    <div class="summary-title-card">
      <div class="stc-left">
        <span class="stc-app">{{ appName }}</span>
        <span class="stc-app">{{ platformName }}</span>
        <span class="stc-badge">日报</span>
        <span class="stc-date">{{ fullDate }} {{ weekday }}</span>
      </div>
      <div class="stc-right">
        <div class="stc-top-row">
          <span class="stc-update">数据更新时间：{{ updateTime }}</span>
          <button class="stc-refresh-btn">
            <span class="stc-refresh-icon">↺</span>
            刷新
          </button>
        </div>
      </div>
    </div>

    <!-- ── 右下角推送 ─────────────────────────────────────── -->
    <div class="ds-push-bar">
      <span class="ds-push-last">上次推送：{{ updateTime }} 飞书群《经营日报》</span>
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
                <th>今日 {{ dateLabel }}</th>
                <th>昨日 {{ prevDateLabel }}</th>
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
                <th>今日 {{ dateLabel }}</th>
                <th>昨日 {{ prevDateLabel }}</th>
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
  import {
    dailyKpis,
    dailyUserMetrics,
    roiMetrics,
    retentionMetrics,
    dailyRevenueMetrics
  } from '../mockData'

  withDefaults(
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
      dateLabel: '3/13',
      prevDateLabel: '3/12',
      appName: '整体',
      platformName: '全部平台',
      fullDate: '2026年3月13日',
      weekday: '周四',
      updateTime: '今日 08:30'
    }
  )

  const openPushModal = inject<() => void>('openPushModal', () => {})
  const ctx = inject(businessReportContextKey)

  const kpis = computed(() => ctx?.summary.value?.kpis ?? dailyKpis)
  const userMetrics = computed(() => ctx?.summary.value?.userMetrics ?? dailyUserMetrics)
  const roiRows = computed(() => ctx?.summary.value?.roiMetrics ?? roiMetrics)
  const retention = computed(() => ctx?.summary.value?.retentionMetrics ?? retentionMetrics)
  const revenueMetrics = computed(() => ctx?.summary.value?.revenueMetrics ?? dailyRevenueMetrics)
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
