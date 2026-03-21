<template>
  <div class="daily-ad-platform">
    <!-- Platform Cards Grid -->
    <div class="platforms-grid">
      <!-- Main platforms (5 large cards) -->
      <div
        v-for="p in mainPlatforms"
        :key="p.id"
        class="platform-card"
        :style="{ '--accent': p.color }"
      >
        <div class="pc-header">
          <div class="pc-logo" :style="{ background: p.color + '22', color: p.color }">{{
            p.logo
          }}</div>
          <span class="pc-name">{{ p.name }}</span>
        </div>
        <div class="pc-spend">
          <span class="pc-spend-val">{{ p.adSpend }}</span>
          <span :class="['pc-spend-chg', p.adSpendChange >= 0 ? 'pos' : 'neg']">
            {{ p.adSpendChange >= 0 ? '+' : '' }}{{ p.adSpendChange }}%
          </span>
        </div>
        <div class="pc-metrics">
          <div class="pc-metric-row">
            <span class="pc-ml">广告支出</span>
            <span class="pc-ml">环比</span>
          </div>
          <div class="pc-metric-row">
            <span>买量用户</span><span>{{ p.acquisitions }}</span>
          </div>
          <div class="pc-metric-row">
            <span>CPI</span><span>{{ p.cpi }}</span>
          </div>
        </div>
        <div class="pc-roi">
          <span
            >首日ROI <b :class="roiColor(p.roi1d)">{{ p.roi1d }}</b></span
          >
          <span
            >7日ROI <b :class="roiColor(p.roi7d)">{{ p.roi7d }}</b></span
          >
        </div>
        <div class="pc-share">
          <span class="pc-share-label">占总支出 {{ p.sharePercent }}%</span>
          <div class="pc-share-bar">
            <div
              class="pc-share-fill"
              :style="{ width: p.sharePercent + '%', background: p.color }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Others mini card -->
      <div class="platform-card others-card">
        <div class="others-header">其他平台</div>
        <div v-for="p in otherPlatforms" :key="p.id" class="other-row">
          <div class="other-logo" :style="{ background: p.color + '22', color: p.color }">{{
            p.logo
          }}</div>
          <span class="other-name">{{ p.name }}</span>
          <span class="other-spend">{{ p.adSpend }}</span>
          <span class="other-share">{{ p.sharePercent }}%</span>
        </div>
      </div>
    </div>

    <!-- Comparison Table -->
    <div class="data-card">
      <div class="card-title">广告平台指标对比</div>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>平台</th>
              <th>广告支出</th>
              <th>广告支出环比</th>
              <th>买量用户</th>
              <th>广告系列数</th>
              <th>CPI</th>
              <th>CPM</th>
              <th>CPC</th>
              <th>首日ROI</th>
              <th>7日ROI</th>
              <th>预估利润</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in allPlatforms" :key="p.id">
              <td>
                <div class="platform-cell">
                  <div class="tc-logo" :style="{ background: p.color + '22', color: p.color }">{{
                    p.logo
                  }}</div>
                  <span>{{ p.name }}</span>
                </div>
              </td>
              <td>{{ p.adSpend }}</td>
              <td :class="p.adSpendChange >= 0 ? 'chg-pos' : 'chg-neg'">
                {{ p.adSpendChange >= 0 ? '+' : '' }}{{ p.adSpendChange }}%
              </td>
              <td>{{ p.acquisitions }}</td>
              <td>{{ p.campaigns }}</td>
              <td>{{ p.cpi }}</td>
              <td>{{ p.cpm }}</td>
              <td>{{ p.cpc }}</td>
              <td :class="roiColor(p.roi1d)">{{ p.roi1d }}</td>
              <td :class="roiColor(p.roi7d)">{{ p.roi7d }}</td>
              <td>—</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { adPlatformCards } from './mockData'

  const mainPlatforms = computed(() => adPlatformCards.slice(0, 5))
  const otherPlatforms = computed(() => adPlatformCards.slice(5))
  const allPlatforms = computed(() => adPlatformCards)

  const roiColor = (val: string) => {
    const n = parseInt(val)
    if (n >= 100) return 'roi-green'
    if (n >= 80) return 'roi-orange'
    return 'roi-normal'
  }
</script>

<style scoped>
  .daily-ad-platform {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 14px;
    padding: 14px;
    overflow-y: auto;
  }

  .platforms-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 10px;
  }

  @media (width <= 1300px) {
    .platforms-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .platform-card {
    padding: 12px;
    background: rgb(255 255 255 / 3%);
    border: 1px solid rgb(255 255 255 / 7%);
    border-radius: 10px;
    transition:
      border-color 0.2s,
      transform 0.15s;
  }

  .platform-card:hover {
    border-color: var(--accent, rgb(255 255 255 / 15%));
    transform: translateY(-2px);
  }

  .pc-header {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 8px;
  }

  .pc-logo {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    font-size: 14px;
    font-weight: 700;
    border-radius: 7px;
  }

  .pc-name {
    font-size: 14px;
    font-weight: 700;
    color: rgb(255 255 255 / 90%);
  }

  .pc-spend {
    display: flex;
    gap: 6px;
    align-items: baseline;
    margin-bottom: 8px;
  }

  .pc-spend-val {
    font-size: 18px;
    font-weight: 700;
    color: #fff;
  }

  .pos {
    font-size: 11px;
    color: #00d4a1;
  }

  .neg {
    font-size: 11px;
    color: #ff5c5c;
  }

  .pc-metrics {
    display: flex;
    flex-direction: column;
    gap: 3px;
    margin-bottom: 8px;
    font-size: 11px;
  }

  .pc-metric-row {
    display: flex;
    justify-content: space-between;
    color: rgb(255 255 255 / 65%);
  }

  .pc-ml {
    font-size: 10px;
    color: rgb(255 255 255 / 40%);
  }

  .pc-roi {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 8px;
    font-size: 11px;
    color: rgb(255 255 255 / 50%);
  }

  .pc-roi b {
    font-weight: 600;
  }

  .pc-share-label {
    display: block;
    margin-bottom: 4px;
    font-size: 10px;
    color: rgb(255 255 255 / 40%);
  }

  .pc-share-bar {
    height: 3px;
    overflow: hidden;
    background: rgb(255 255 255 / 8%);
    border-radius: 2px;
  }

  .pc-share-fill {
    height: 100%;
    border-radius: 2px;
    transition: width 0.6s ease;
  }

  .others-card {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .others-header {
    margin-bottom: 4px;
    font-size: 13px;
    font-weight: 700;
    color: rgb(255 255 255 / 70%);
  }

  .other-row {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .other-logo {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    font-size: 11px;
    font-weight: 700;
    border-radius: 5px;
  }

  .other-name {
    flex: 1;
    font-size: 12px;
    color: rgb(255 255 255 / 75%);
  }

  .other-spend {
    font-size: 12px;
    font-weight: 600;
    color: rgb(255 255 255 / 90%);
  }

  .other-share {
    width: 28px;
    font-size: 11px;
    color: rgb(255 255 255 / 40%);
    text-align: right;
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

  .table-wrap {
    overflow-x: auto;
  }

  .data-table {
    width: 100%;
    min-width: 800px;
    font-size: 12px;
    border-collapse: collapse;
  }

  .data-table th {
    padding: 6px 10px;
    font-weight: 500;
    color: rgb(255 255 255 / 40%);
    text-align: left;
    white-space: nowrap;
    border-bottom: 1px solid rgb(255 255 255 / 7%);
  }

  .data-table td {
    padding: 7px 10px;
    color: rgb(255 255 255 / 85%);
    white-space: nowrap;
  }

  .data-table tr:not(:last-child) td {
    border-bottom: 1px solid rgb(255 255 255 / 4%);
  }

  .data-table tr:hover td {
    background: rgb(255 255 255 / 3%);
  }

  .platform-cell {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .tc-logo {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    font-size: 10px;
    font-weight: 700;
    border-radius: 5px;
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

  .roi-normal {
    color: rgb(255 255 255 / 75%);
  }
</style>
