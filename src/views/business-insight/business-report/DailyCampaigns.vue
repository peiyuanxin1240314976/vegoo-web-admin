<template>
  <div class="daily-campaigns">
    <!-- Summary bar -->
    <div class="summary-bar">
      <div class="summary-item">
        <span class="s-dot active"></span>
        <span class="s-label">在投系列</span>
        <span class="s-val">{{ activeCampaigns }}个</span>
      </div>
      <div class="summary-item">
        <span class="s-dot paused"></span>
        <span class="s-label">已暂停</span>
        <span class="s-val">{{ pausedCampaigns }}个</span>
      </div>
      <div class="summary-sep"></div>
      <div class="summary-item">
        <span class="s-label">总广告支出</span>
        <span class="s-val highlight">$41,100</span>
      </div>
    </div>

    <!-- Campaigns Table -->
    <div class="data-card">
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>应用</th>
              <th>平台</th>
              <th>广告平台</th>
              <th>广告系列名称</th>
              <th>状态</th>
              <th>国家</th>
              <th>广告支出</th>
              <th>广告支出环比</th>
              <th>CPI</th>
              <th>CPM</th>
              <th>CPC</th>
              <th>买量用户</th>
              <th>首日ROI</th>
              <th>3日ROI</th>
              <th>7日ROI</th>
              <th>14日ROI</th>
              <th>30日ROI</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in campaigns" :key="row.id" :class="{ paused: row.status === 'paused' }">
              <td>{{ row.app }}</td>
              <td>{{ row.platform }}</td>
              <td>
                <div class="platform-cell">
                  <div class="pl-dot" :style="{ background: row.adPlatformColor }"></div>
                  {{ row.adPlatform }}
                </div>
              </td>
              <td class="campaign-name">{{ row.campaignName }}</td>
              <td>
                <span :class="['status-badge', row.status]">
                  <span class="status-dot"></span>
                  {{ row.status === 'active' ? '在投中' : '已暂停' }}
                </span>
              </td>
              <td>
                <span class="flag">{{ row.countryFlag }}</span> {{ row.country }}
              </td>
              <td :class="row.status === 'paused' ? 'muted' : ''">{{ row.adSpend }}</td>
              <td :class="changeColor(row.adSpendChange)">
                {{
                  row.adSpendChange === -100
                    ? '-100%'
                    : (row.adSpendChange >= 0 ? '+' : '') + row.adSpendChange + '%'
                }}
              </td>
              <td class="muted-val">{{ row.cpi ?? '-' }}</td>
              <td class="muted-val">{{ row.cpm ?? '-' }}</td>
              <td class="muted-val">{{ row.cpc ?? '-' }}</td>
              <td>{{ row.acquisitions }}</td>
              <td :class="roiClass(row.roi1d)">{{ row.roi1d }}</td>
              <td :class="roiClass(row.roi3d)">{{ row.roi3d }}</td>
              <td :class="roiClass(row.roi7d)">{{ row.roi7d }}</td>
              <td :class="roiClass(row.roi14d)">{{ row.roi14d }}</td>
              <td :class="roiClass(row.roi30d)">{{ row.roi30d }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="table-footer">
        在投 {{ activeCampaigns }} 个 | 已暂停 {{ pausedCampaigns }} 个 | 总广告支出 $41,100
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { campaignData } from './mockData'

  const campaigns = campaignData
  const activeCampaigns = computed(() => campaigns.filter((c) => c.status === 'active').length)
  const pausedCampaigns = computed(() => campaigns.filter((c) => c.status === 'paused').length)

  const changeColor = (v: number) => (v >= 0 ? 'chg-pos' : 'chg-neg')
  const roiClass = (val: string) => {
    if (val === '-') return 'muted-val'
    const n = parseInt(val)
    if (n >= 100) return 'roi-green'
    if (n >= 80) return 'roi-orange'
    if (n >= 50) return 'roi-yellow'
    return 'roi-red'
  }
</script>

<style scoped>
  .daily-campaigns {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 12px;
    padding: 14px;
    overflow-y: auto;
  }

  .summary-bar {
    display: flex;
    gap: 16px;
    align-items: center;
    padding: 10px 16px;
    background: rgb(255 255 255 / 3%);
    border: 1px solid rgb(255 255 255 / 7%);
    border-radius: 10px;
  }

  .summary-item {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .s-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .s-dot.active {
    background: #00d4a1;
  }

  .s-dot.paused {
    background: #f59e0b;
  }

  .s-label {
    font-size: 12px;
    color: rgb(255 255 255 / 45%);
  }

  .s-val {
    font-size: 14px;
    font-weight: 700;
    color: rgb(255 255 255 / 90%);
  }

  .s-val.highlight {
    color: #00d4a1;
  }

  .summary-sep {
    width: 1px;
    height: 20px;
    margin: 0 4px;
    background: rgb(255 255 255 / 10%);
  }

  .data-card {
    flex: 1;
    padding: 14px;
    background: rgb(255 255 255 / 2%);
    border: 1px solid rgb(255 255 255 / 7%);
    border-radius: 10px;
  }

  .table-wrap {
    overflow-x: auto;
  }

  .data-table {
    width: 100%;
    min-width: 1400px;
    font-size: 12px;
    border-collapse: collapse;
  }

  .data-table th {
    padding: 7px 10px;
    font-weight: 500;
    color: rgb(255 255 255 / 40%);
    text-align: left;
    white-space: nowrap;
    background: rgb(255 255 255 / 2%);
    border-bottom: 1px solid rgb(255 255 255 / 7%);
  }

  .data-table td {
    padding: 8px 10px;
    color: rgb(255 255 255 / 85%);
    white-space: nowrap;
  }

  .data-table tr:not(:last-child) td {
    border-bottom: 1px solid rgb(255 255 255 / 4%);
  }

  .data-table tr:hover td {
    background: rgb(255 255 255 / 3%);
  }

  .data-table tr.paused {
    opacity: 0.55;
  }

  .platform-cell {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .pl-dot {
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .campaign-name {
    font-family: monospace;
    font-size: 11px;
    color: rgb(255 255 255 / 65%);
  }

  .flag {
    font-size: 14px;
  }

  .status-badge {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    padding: 2px 7px;
    font-size: 11px;
    border-radius: 4px;
  }

  .status-badge.active {
    color: #00d4a1;
    background: rgb(0 212 161 / 12%);
  }

  .status-badge.paused {
    color: #f59e0b;
    background: rgb(245 158 11 / 12%);
  }

  .status-dot {
    width: 5px;
    height: 5px;
    background: currentcolor;
    border-radius: 50%;
  }

  .muted {
    color: rgb(255 255 255 / 35%) !important;
  }

  .muted-val {
    color: rgb(255 255 255 / 50%);
  }

  .chg-pos {
    font-weight: 500;
    color: #00d4a1;
  }

  .chg-neg {
    font-weight: 500;
    color: #ff5c5c;
  }

  .roi-green {
    font-weight: 600;
    color: #4ade80;
  }

  .roi-orange {
    font-weight: 600;
    color: #fb923c;
  }

  .roi-yellow {
    font-weight: 600;
    color: #fcd34d;
  }

  .roi-red {
    font-weight: 600;
    color: #f87171;
  }

  .table-footer {
    margin-top: 10px;
    font-size: 11px;
    color: rgb(255 255 255 / 40%);
  }
</style>
