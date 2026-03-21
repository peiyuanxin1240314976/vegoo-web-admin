<template>
  <div class="weekly-summary">
    <!-- KPI Cards Row (5 cards) -->
    <div class="kpi-row">
      <KpiCard v-for="m in kpis" :key="m.key" :metric="m" />
    </div>

    <!-- Middle: User Metrics + ROI -->
    <div class="mid-section">
      <div class="data-card">
        <div class="card-title">用户指标</div>
        <table class="data-table">
          <thead>
            <tr>
              <th>指标</th>
              <th>本周 {{ weekLabel }}</th>
              <th>上周 {{ prevWeekLabel }}</th>
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

      <div class="data-card">
        <div class="card-title">ROI 跟踪</div>
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
              <td :class="['roi-val', row.isHighlighted ? 'roi-green' : 'roi-orange']">{{
                row.current
              }}</td>
              <td class="muted">{{ row.previous }}</td>
              <td class="change positive">{{ row.change }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Bottom: Retention + Revenue -->
    <div class="bottom-section">
      <div class="data-card">
        <div class="card-title">留存率（按装机日追踪）</div>
        <table class="data-table">
          <thead>
            <tr><th>指标</th><th>本周</th><th>上周</th><th>周环比</th></tr>
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

      <div class="data-card">
        <div class="card-title">收缴指标</div>
        <table class="data-table">
          <thead>
            <tr><th>指标</th><th>本周</th><th>上周</th><th>周环比</th></tr>
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
  import { weeklyKpis, weeklyUserMetrics, roiMetrics, retentionMetrics } from './mockData'
  import type { RevenueRow } from './types'

  defineProps<{ weekLabel?: string; prevWeekLabel?: string }>()

  const kpis = weeklyKpis
  const userMetrics = weeklyUserMetrics
  const roiRows = roiMetrics
  const retention = retentionMetrics
  const revenueMetrics: RevenueRow[] = [
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
</script>

<style scoped>
  .weekly-summary {
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
    background: rgb(255 255 255 / 3%);
    border: 1px solid rgb(255 255 255 / 7%);
    border-radius: 10px;
  }

  .card-title {
    margin-bottom: 12px;
    font-size: 13px;
    font-weight: 700;
    color: rgb(255 255 255 / 90%);
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
    color: rgb(255 255 255 / 55%) !important;
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
</style>
