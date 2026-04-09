<template>
  <div class="weekly-ad-platform">
    <!-- ── 页面标题行（与周报汇总一致）──────────────────────────── -->
    <div class="wap-title-row">
      <div class="wap-title-left">
        <span class="wap-title-app">整体</span>
        <span class="wap-title-app">全部平台</span>
        <span class="wap-title-badge">{{ reportLabel }}</span>
        <span class="wap-title-date">{{ titleDateText }}</span>
      </div>
    </div>

    <!-- ── 模块一：各广告平台卡片 ─────────────────────────────── -->
    <div class="section-block">
      <div class="section-title">各广告平台核心指标</div>
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
            <span class="pc-name">{{ p.name }}</span>
          </div>

          <div class="pc-label-row">
            <span class="pc-label">广告支出</span>
            <span class="pc-label">周环比</span>
          </div>
          <div class="pc-value-row">
            <span class="pc-spend-val">{{ p.adSpend }}</span>
            <span :class="['pc-chg', p.adSpendChange >= 0 ? 'pos' : 'neg']">
              {{ p.adSpendChange >= 0 ? '+' : '' }}{{ p.adSpendChange }}%
            </span>
          </div>

          <div class="pc-label-row pc-label-row--stats">
            <span class="pc-label">买量用户</span>
            <span class="pc-label">广告系列数</span>
          </div>
          <div class="pc-value-row">
            <span class="pc-val">{{ p.acquisitions }}</span>
            <span class="pc-val">{{ p.campaigns }}</span>
          </div>

          <div class="pc-label-row pc-label-row--triple">
            <span class="pc-label">CPI</span>
            <span class="pc-label">CPM</span>
            <span class="pc-label">CPC</span>
          </div>
          <div class="pc-value-row pc-value-row--triple">
            <span class="pc-val">{{ p.cpi }}</span>
            <span class="pc-val">{{ p.cpm }}</span>
            <span class="pc-val">{{ p.cpc }}</span>
          </div>

          <div class="pc-roi">
            <span
              >首日ROI <b class="roi-d1">{{ p.roi1d }}</b></span
            >
            <span
              >7日ROI <b class="roi-d7">{{ p.roi7d }}</b></span
            >
            <span v-if="p.roi14d" class="roi-14-wrap"
              >14日ROI <b class="roi-d14">{{ p.roi14d }}</b></span
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

        <!-- 其他平台 -->
        <div class="platform-card others-card" :style="{ '--accent': '#6b7280' }">
          <div class="others-h">其他平台</div>
          <div class="pc-label-row">
            <span class="pc-label">广告支出</span>
            <span class="pc-label">周环比</span>
          </div>
          <div class="pc-value-row">
            <span class="pc-spend-val">$17,100</span>
            <span class="pc-chg pos">+4.2%</span>
          </div>
          <div v-for="p in otherPlatforms" :key="p.id" class="other-row">
            <div class="other-logo" :style="{ background: p.color + '22', color: p.color }">{{
              p.logo
            }}</div>
            <span class="other-name">{{ p.name }}</span>
            <span class="other-spend">{{ p.weeklySpend }}</span>
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
    </div>

    <!-- ── 模块二：指标对比表 ─────────────────────────────────── -->
    <div class="data-card">
      <div class="card-title">周报广告平台指标对比</div>
      <div class="table-wrap">
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
                  <div class="tc-logo" :style="{ background: row.color + '22', color: row.color }">
                    {{ row.logo }}
                  </div>
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
              <td class="roi-d1">{{ row.roi1d }}</td>
              <td class="roi-d7">{{ row.roi7d }}</td>
              <td class="roi-d14">{{ row.roi14d }}</td>
              <td>{{ row.profit }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ── 底部推送（与周报汇总一致）──────────────────────────── -->
    <div class="wap-push-bar">
      <span class="wap-push-last">{{ pushText }}</span>
      <button class="wap-push-btn" type="button" @click="openPushModal()">立即推送</button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, inject } from 'vue'
  import { businessReportContextKey } from '../composables/business-report-context'
  import type { AdPlatformCard } from '../types'
  import { adPlatformCards } from '../mockData'

  defineOptions({ name: 'WeeklyAdPlatform' })

  function parseWanToNumber(s: string): number {
    const n = parseFloat(String(s).replace(/[^\d.]/g, ''))
    return Number.isFinite(n) ? n : 0
  }

  function mapCardsToWeeklyTableRows(cards: AdPlatformCard[]) {
    return cards.map((p) => ({
      id: p.id,
      name: p.name,
      logo: p.logo,
      color: p.color,
      spend: p.adSpend,
      change: p.adSpendChange,
      acquisitions: p.acquisitions,
      campaigns: p.campaigns,
      cpi: p.cpi,
      cpm: p.cpm,
      cpc: p.cpc,
      roi1d: p.roi1d,
      roi7d: p.roi7d,
      roi14d: p.roi14d ?? '—',
      profit: p.profit
    }))
  }

  const openPushModal = inject<() => void>('openPushModal', () => {})
  const ctx = inject(businessReportContextKey)

  const cardList = computed(() => ctx?.adPlatform.value?.platforms ?? null)
  const reportLabel = computed(() => {
    if (ctx?.period.value === 'daily') return '日报'
    if (ctx?.period.value === 'monthly') return '月报'
    return '周报'
  })
  const titleDateText = computed(() => {
    const range = ctx?.reportRange.value
    if (!range) return '--'
    if (ctx?.period.value === 'monthly') return range.startDate.slice(0, 7)
    if (ctx?.period.value === 'daily') return range.startDate
    return `${range.startDate} - ${range.endDate}`
  })
  const pushText = computed(
    () =>
      ctx?.getLastPushText?.(ctx?.period.value ?? 'weekly') ??
      `上次推送：-- 飞书群《经营${reportLabel.value}》`
  )

  const mainPlatforms = computed(() => {
    const api = cardList.value
    if (api && api.length) return api.slice(0, 5)
    return adPlatformCards.slice(0, 5).map((p) => {
      const base = parseInt(p.adSpend.replace(/[$,]/g, ''), 10)
      const accent = p.id === 'facebook' ? '#8B5CF6' : p.color
      return {
        ...p,
        color: accent,
        adSpend: '$' + (base * 7).toLocaleString('en-US'),
        acquisitions: (parseWanToNumber(p.acquisitions) * 7).toFixed(1) + '万',
        cpm: p.cpm ?? '$9.80',
        cpc: p.cpc ?? '$0.38',
        roi14d: p.roi14d ?? '93%'
      }
    })
  })

  const otherPlatforms = computed(() => {
    const api = cardList.value
    if (api && api.length) {
      return api.slice(5).map((p) => ({
        ...p,
        weeklySpend: p.adSpend
      }))
    }
    return adPlatformCards.slice(5).map((p) => {
      const base = parseInt(p.adSpend.replace(/[$,]/g, ''), 10)
      return {
        ...p,
        weeklySpend: '$' + (base * 7).toLocaleString('en-US')
      }
    })
  })

  const weeklyAdPlatformTableMock = [
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
      color: '#8B5CF6',
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

  const tableData = computed(() => {
    const api = cardList.value
    if (api && api.length) return mapCardsToWeeklyTableRows(api)
    return weeklyAdPlatformTableMock
  })
</script>

<style scoped>
  .weekly-ad-platform {
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

  /* ── 标题行（对齐周报汇总）────────────────────────────────── */
  .wap-title-row {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: space-between;
    padding: 2px 0 4px;
  }

  .wap-title-left {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
  }

  .wap-title-app {
    font-size: 18px;
    font-weight: 700;
    color: rgb(255 255 255 / 90%);
  }

  .wap-title-badge {
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 700;
    color: #000;
    background: #00d4a1;
    border-radius: 4px;
  }

  .wap-title-date {
    font-size: 13px;
    color: rgb(255 255 255 / 55%);
  }

  /* ── 区块标题 ─────────────────────────────────────────────── */
  .section-block {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .section-title {
    font-size: 13px;
    font-weight: 700;
    color: rgb(255 255 255 / 88%);
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
    gap: 0;
    padding: 14px;
    background: linear-gradient(
      145deg,
      color-mix(in srgb, var(--accent) 18%, transparent) 0%,
      color-mix(in srgb, var(--accent) 5%, #0d1529) 100%
    );
    border: 1px solid color-mix(in srgb, var(--accent) 38%, transparent);
    border-radius: 12px;
    transition:
      border-color 0.2s,
      transform 0.15s;
  }

  .platform-card:hover {
    border-color: color-mix(in srgb, var(--accent) 58%, transparent);
    transform: translateY(-2px);
  }

  .pc-header {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 10px;
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

  .pc-name {
    font-size: 15px;
    font-weight: 700;
    color: rgb(255 255 255 / 92%);
  }

  .pc-label-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 2px;
  }

  .pc-label-row--stats {
    margin-top: 6px;
  }

  .pc-label-row--triple {
    gap: 8px;
    justify-content: flex-start;
  }

  .pc-label-row--triple .pc-label {
    flex: 1;
    text-align: left;
  }

  .pc-label {
    flex: 1;
    font-size: 10px;
    color: rgb(255 255 255 / 42%);
  }

  .pc-value-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .pc-value-row--triple {
    gap: 8px;
    justify-content: flex-start;
  }

  .pc-value-row--triple .pc-val {
    flex: 1;
    min-width: 0;
  }

  .pc-spend-val {
    font-size: 20px;
    font-weight: 700;
    color: #fff;
    letter-spacing: -0.02em;
  }

  .pc-val {
    font-size: 13px;
    font-weight: 600;
    color: rgb(255 255 255 / 88%);
  }

  .pc-chg {
    font-size: 12px;
    font-weight: 600;
  }

  .pos {
    color: #4caf50;
  }

  .neg {
    color: #f44336;
  }

  .pc-roi {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 12px;
    margin-bottom: 10px;
    font-size: 11px;
    color: rgb(255 255 255 / 48%);
  }

  .pc-roi b {
    font-weight: 600;
  }

  .roi-d1 {
    color: #fb923c;
  }

  .roi-d7 {
    color: #60a5fa;
  }

  .roi-d14 {
    color: #4ade80;
  }

  .pc-share-label {
    display: block;
    margin-bottom: 4px;
    font-size: 10px;
    color: rgb(255 255 255 / 42%);
  }

  .pc-share-bar {
    height: 4px;
    overflow: hidden;
    background: rgb(255 255 255 / 8%);
    border-radius: 2px;
  }

  .pc-share-fill {
    height: 100%;
    border-radius: 2px;
  }

  .others-card {
    min-height: 100%;
    padding-bottom: 12px;
  }

  .others-h {
    margin-bottom: 10px;
    font-size: 15px;
    font-weight: 700;
    color: rgb(255 255 255 / 75%);
  }

  .other-row {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 8px;
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
    width: 36px;
    font-size: 11px;
    color: rgb(255 255 255 / 40%);
    text-align: right;
  }

  .data-card {
    padding: 14px;
    overflow: hidden;
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
    min-width: 960px;
    font-size: 12px;
    border-collapse: collapse;
  }

  .data-table th {
    padding: 8px 10px;
    font-weight: 500;
    color: rgb(255 255 255 / 45%);
    text-align: left;
    white-space: nowrap;
    background: rgb(255 255 255 / 4%);
    border-bottom: 1px solid rgb(255 255 255 / 8%);
  }

  .data-table td {
    padding: 8px 10px;
    color: rgb(255 255 255 / 88%);
    white-space: nowrap;
    border-bottom: 1px solid rgb(255 255 255 / 5%);
  }

  .data-table tbody tr:hover td {
    background: rgb(255 255 255 / 3%);
  }

  .platform-cell {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .tc-logo {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    font-size: 10px;
    font-weight: 700;
    border-radius: 5px;
  }

  .chg-pos {
    font-weight: 500;
    color: #4caf50;
  }

  .chg-neg {
    font-weight: 500;
    color: #f44336;
  }

  /* ── 底部推送 ─────────────────────────────────────────────── */
  .wap-push-bar {
    position: absolute;
    right: 14px;
    bottom: 12px;
    left: 14px;
    display: flex;
    gap: 16px;
    align-items: center;
    justify-content: flex-end;
  }

  .wap-push-last {
    font-size: 12px;
    color: rgb(255 255 255 / 38%);
  }

  .wap-push-btn {
    padding: 6px 16px;
    font-size: 12px;
    font-weight: 600;
    color: #000;
    cursor: pointer;
    background: #00d4a1;
    border: none;
    border-radius: 9999px;
    transition: filter 0.15s;
  }

  .wap-push-btn:hover {
    filter: brightness(1.08);
  }
</style>
