<template>
  <div class="weekly-ad-platform">
    <!-- Platform Cards 3-column layout -->
    <div class="platforms-grid">
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
          <div class="pc-title">
            <span class="pc-name">{{ p.name }}</span>
            <span :class="['pc-change', p.adSpendChange >= 0 ? 'pos' : 'neg']">
              {{ p.adSpendChange >= 0 ? '+' : '' }}{{ p.adSpendChange }}%
            </span>
          </div>
        </div>
        <div class="pc-spend-row">
          <span class="pc-label">广告支出</span>
          <span class="pc-spend-val">{{ p.adSpend }}</span>
        </div>
        <div class="pc-stats">
          <div class="pc-stat">
            <span class="ps-label">买量用户</span>
            <span class="ps-val">{{ p.acquisitions }}</span>
          </div>
          <div class="pc-stat">
            <span class="ps-label">{{ p.campaigns }} 系列</span>
          </div>
        </div>
        <div class="pc-costs">
          <span
            >CPI <b>{{ p.cpi }}</b></span
          >
          <span
            >CPM <b>{{ p.cpm }}</b></span
          >
          <span
            >CPC <b>{{ p.cpc }}</b></span
          >
        </div>
        <div class="pc-roi">
          <span class="roi-label"
            >首日ROI <b :class="roiColor(p.roi1d)">{{ p.roi1d }}</b></span
          >
          <span class="roi-label"
            >7日ROI <b :class="roiColor(p.roi7d)">{{ p.roi7d }}</b></span
          >
          <span v-if="p.roi14d" class="roi-label"
            >14日ROI <b :class="roiColor(p.roi14d)">{{ p.roi14d }}</b></span
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

      <!-- Others card -->
      <div class="platform-card others-card">
        <div class="pc-name-h">其他平台</div>
        <div class="pc-spend-row">
          <span class="pc-label">广告支出</span>
          <span class="pc-spend-val">$17,100</span>
          <span class="pos">+4.2%</span>
        </div>
        <div v-for="p in otherPlatforms" :key="p.id" class="other-row">
          <div class="other-logo" :style="{ background: p.color + '22', color: p.color }">{{
            p.logo
          }}</div>
          <span class="other-name">{{ p.name }}</span>
          <span class="other-spend">{{ p.adSpend }}</span>
          <span class="other-share">{{ p.sharePercent }}%</span>
        </div>
        <div class="pc-share" style="margin-top: auto">
          <span class="pc-share-label">占总支出 6%</span>
          <div class="pc-share-bar">
            <div class="pc-share-fill" style="width: 6%; background: #6b7280"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Weekly Platform Comparison Table -->
    <div class="data-card">
      <div class="card-title">周报广告平台指标对比</div>
      <table class="data-table">
        <thead>
          <tr>
            <th>平台</th>
            <th>广告支出</th>
            <th>周环比</th>
            <th>买量用户</th>
            <th>广告系列数</th>
            <th>CPI</th>
            <th>CPM</th>
            <th>CPC</th>
            <th>首日ROI</th>
            <th>7日ROI</th>
            <th>14日ROI</th>
            <th>预估利润</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in tableData" :key="row.id">
            <td>
              <div class="platform-cell">
                <div class="tc-logo" :style="{ background: row.color + '22', color: row.color }">{{
                  row.logo
                }}</div>
                <span>{{ row.name }}</span>
              </div>
            </td>
            <td>{{ row.spend }}</td>
            <td :class="row.change >= 0 ? 'chg-pos' : 'chg-neg'">
              {{ row.change >= 0 ? '+' : '' }}{{ row.change }}%
            </td>
            <td>{{ row.acquisitions }}</td>
            <td>{{ row.campaigns }}</td>
            <td>{{ row.cpi }}</td>
            <td>{{ row.cpm }}</td>
            <td>{{ row.cpc }}</td>
            <td :class="roiColor(row.roi1d)">{{ row.roi1d }}</td>
            <td :class="roiColor(row.roi7d)">{{ row.roi7d }}</td>
            <td :class="roiColor(row.roi14d)">{{ row.roi14d }}</td>
            <td>{{ row.profit }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { adPlatformCards } from './mockData'

  const mainPlatforms = computed(() =>
    adPlatformCards.slice(0, 5).map((p) => ({
      ...p,
      adSpend: '$' + (parseInt(p.adSpend.replace(/[$,]/g, '')) * 7).toLocaleString(),
      acquisitions: (parseFloat(p.acquisitions) * 7).toFixed(1) + '万',
      cpm: p.cpm ?? '$9.80',
      cpc: p.cpc ?? '$0.38',
      roi14d: p.roi14d ?? '93%'
    }))
  )
  const otherPlatforms = computed(() => adPlatformCards.slice(5))

  const tableData = [
    {
      id: 'google',
      name: 'Google',
      logo: 'G',
      color: '#4285F4',
      spend: '$106,400',
      change: 8.1,
      acquisitions: '66.5万',
      campaigns: 5,
      cpi: '$1.60',
      cpm: '$9.80',
      cpc: '$0.38',
      roi1d: '38%',
      roi7d: '98%',
      roi14d: '101%',
      profit: '$381,000'
    },
    {
      id: 'facebook',
      name: 'Facebook',
      logo: 'f',
      color: '#1877F2',
      spend: '$74,800',
      change: 7.4,
      acquisitions: '46.9万',
      campaigns: 3,
      cpi: '$1.60',
      cpm: '$9.20',
      cpc: '$0.36',
      roi1d: '35%',
      roi7d: '94%',
      roi14d: '96%',
      profit: '$268,100'
    },
    {
      id: 'unity',
      name: 'Unity',
      logo: 'U',
      color: '#22C55E',
      spend: '$43,200',
      change: 6.9,
      acquisitions: '27.3万',
      campaigns: 2,
      cpi: '$1.58',
      cpm: '$8.90',
      cpc: '$0.35',
      roi1d: '33%',
      roi7d: '90%',
      roi14d: '93%',
      profit: '$155,000'
    },
    {
      id: 'mintegral',
      name: 'Mintegral',
      logo: 'M',
      color: '#F59E0B',
      spend: '$28,700',
      change: 9.2,
      acquisitions: '18.2万',
      campaigns: 2,
      cpi: '$1.58',
      cpm: '$8.60',
      cpc: '$0.34',
      roi1d: '34%',
      roi7d: '91%',
      roi14d: '94%',
      profit: '$102,900'
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      logo: '♪',
      color: '#FF4D4F',
      spend: '$17,500',
      change: 5.3,
      acquisitions: '11.2万',
      campaigns: 1,
      cpi: '$1.56',
      cpm: '$8.20',
      cpc: '$0.32',
      roi1d: '31%',
      roi7d: '85%',
      roi14d: '87%',
      profit: '$62,700'
    },
    {
      id: 'snapchat',
      name: 'Snapchat',
      logo: '👻',
      color: '#FFFC00',
      spend: '$8,400',
      change: 3.1,
      acquisitions: '5.6万',
      campaigns: 1,
      cpi: '$1.50',
      cpm: '$7.80',
      cpc: '$0.30',
      roi1d: '29%',
      roi7d: '79%',
      roi14d: '81%',
      profit: '$30,100'
    }
  ]

  const roiColor = (val: string) => {
    const n = parseInt(val)
    if (n >= 100) return 'roi-green'
    if (n >= 80) return 'roi-orange'
    return 'roi-normal'
  }
</script>

<style scoped>
  .weekly-ad-platform {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 14px;
    padding: 14px;
    overflow-y: auto;
  }

  .platforms-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  @media (width <= 1200px) {
    .platforms-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .platform-card {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 14px;
    background: rgb(255 255 255 / 3%);
    border: 1px solid rgb(255 255 255 / 7%);
    border-radius: 12px;
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
    gap: 10px;
    align-items: center;
  }

  .pc-logo {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    font-size: 15px;
    font-weight: 700;
    border-radius: 8px;
  }

  .pc-title {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .pc-name {
    font-size: 15px;
    font-weight: 700;
    color: rgb(255 255 255 / 90%);
  }

  .pc-change {
    font-size: 11px;
    font-weight: 500;
  }

  .pc-name-h {
    font-size: 14px;
    font-weight: 700;
    color: rgb(255 255 255 / 70%);
  }

  .pc-spend-row {
    display: flex;
    gap: 8px;
    align-items: baseline;
  }

  .pc-label {
    font-size: 11px;
    color: rgb(255 255 255 / 40%);
  }

  .pc-spend-val {
    font-size: 20px;
    font-weight: 700;
    color: #fff;
    letter-spacing: -0.02em;
  }

  .pos {
    font-size: 11px;
    color: #00d4a1;
  }

  .neg {
    font-size: 11px;
    color: #ff5c5c;
  }

  .pc-stats {
    display: flex;
    gap: 16px;
  }

  .pc-stat {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .ps-label {
    font-size: 10px;
    color: rgb(255 255 255 / 35%);
  }

  .ps-val {
    font-size: 14px;
    font-weight: 600;
    color: rgb(255 255 255 / 85%);
  }

  .pc-costs {
    display: flex;
    gap: 12px;
    font-size: 11px;
    color: rgb(255 255 255 / 45%);
  }

  .pc-costs b {
    font-weight: 500;
    color: rgb(255 255 255 / 80%);
  }

  .pc-roi {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    font-size: 11px;
    color: rgb(255 255 255 / 45%);
  }

  .roi-label b {
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
  }

  .others-card {
    justify-content: flex-start;
  }

  .other-row {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .other-logo {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    font-size: 12px;
    font-weight: 700;
    border-radius: 6px;
  }

  .other-name {
    flex: 1;
    font-size: 12px;
    color: rgb(255 255 255 / 75%);
  }

  .other-spend {
    font-size: 13px;
    font-weight: 600;
    color: rgb(255 255 255 / 90%);
  }

  .other-share {
    width: 30px;
    font-size: 11px;
    color: rgb(255 255 255 / 40%);
    text-align: right;
  }

  .data-card {
    padding: 14px;
    overflow-x: auto;
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
    min-width: 900px;
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
