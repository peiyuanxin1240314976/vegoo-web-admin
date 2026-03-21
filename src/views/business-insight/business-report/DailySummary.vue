<template>
  <div class="daily-summary">
    <!-- KPI Cards Row -->
    <div class="kpi-row">
      <KpiCard v-for="m in kpis" :key="m.key" :metric="m" />
    </div>

    <!-- Middle Section: User Metrics + ROI -->
    <div class="mid-section">
      <!-- User Metrics Table -->
      <div class="data-card">
        <div class="card-title"
          >用户指标
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

      <!-- ROI Table -->
      <div class="data-card">
        <div class="card-title">ROI 跟踪</div>
        <table class="data-table">
          <thead>
            <tr>
              <th>ROI类型</th>
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

    <!-- Bottom Section: Retention + Revenue -->
    <div class="bottom-section">
      <!-- Retention -->
      <div class="data-card">
        <div class="card-title"
          >留存率（按装机日追踪）
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

      <!-- Revenue Metrics -->
      <div class="data-card">
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
</template>

<script setup lang="ts">
  import KpiCard from './KpiCard.vue'
  import {
    dailyKpis,
    dailyUserMetrics,
    roiMetrics,
    retentionMetrics,
    dailyRevenueMetrics
  } from './mockData'

  defineProps<{ dateLabel?: string; prevDateLabel?: string }>()

  const kpis = dailyKpis
  const userMetrics = dailyUserMetrics
  const roiRows = roiMetrics
  const retention = retentionMetrics
  const revenueMetrics = dailyRevenueMetrics
</script>

<style scoped>
  .daily-summary {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 14px;
    padding: 14px;
    overflow-y: auto;
  }

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

  .mid-section,
  .bottom-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .data-card {
    padding: 14px;
    overflow-x: auto;
    background: rgb(255 255 255 / 3%);
    border: 1px solid rgb(255 255 255 / 7%);
    border-radius: 10px;
  }

  .card-title {
    display: flex;
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
    padding: 6px 8px;
    color: rgb(255 255 255 / 85%);
    white-space: nowrap;
  }

  .data-table tr:not(:last-child) td {
    border-bottom: 1px solid rgb(255 255 255 / 4%);
  }

  .data-table tr:hover td {
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
    margin-top: 6px;
    font-size: 10px;
    color: rgb(255 255 255 / 30%);
  }
</style>
