<template>
  <div class="daily-campaigns">
    <!-- ── 页面标题行 ──────────────────────────────────────────── -->
    <div class="dc-title-row">
      <div class="dc-title-left">
        <span class="dc-title-app">整体</span>
        <span class="dc-title-app">全部平台</span>
        <span class="dc-title-badge">{{ reportLabel }}</span>
        <span class="dc-title-date">{{ titleDateText }}</span>
      </div>
      <div class="dc-title-stats">
        <div class="dc-stat">
          <span class="dc-stat-dot active"></span>
          <span class="dc-stat-label">在投系列</span>
          <span class="dc-stat-val">{{ activeCampaigns }}个</span>
        </div>
        <div class="dc-stat">
          <span class="dc-stat-dot paused"></span>
          <span class="dc-stat-label">已暂停</span>
          <span class="dc-stat-val paused">{{ pausedCampaigns }}个</span>
        </div>
        <div class="dc-stat-sep"></div>
        <div class="dc-stat">
          <span class="dc-stat-label">总广告支出</span>
          <span class="dc-stat-val spend">{{ totalSpendDisplay }}</span>
        </div>
      </div>
    </div>

    <!-- ── 数据表格 ───────────────────────────────────────────── -->
    <div class="data-card">
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th class="sticky-col">应用</th>
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
            <tr
              v-for="(row, index) in campaigns"
              :key="`${row.id}-${row.platform}-${row.adPlatform}-${row.country}-${index}`"
              :class="{ 'row-paused': row.status === 'paused' }"
            >
              <td class="sticky-col app-cell">{{ row.app }}</td>
              <td class="platform-os">{{ row.platform }}</td>
              <td>
                <div
                  class="ad-platform-badge"
                  :style="{
                    '--ap-color': row.adPlatformColor,
                    background: row.adPlatformColor + '22',
                    border: '1px solid ' + row.adPlatformColor + '55'
                  }"
                >
                  <span
                    class="ap-icon"
                    :style="{ background: row.adPlatformColor + '44', color: row.adPlatformColor }"
                    >{{ row.adPlatform[0] }}</span
                  >
                  <span class="ap-name" :style="{ color: row.adPlatformColor }">{{
                    row.adPlatform
                  }}</span>
                </div>
              </td>
              <td class="campaign-name">{{ row.campaignName }}</td>
              <td>
                <span :class="['status-badge', row.status]">
                  <span class="status-dot"></span>
                  {{ row.status === 'active' ? '在投中' : '已暂停' }}
                </span>
              </td>
              <td class="country-cell">
                <span class="flag">{{ row.countryFlag }}</span>
                <span>{{ row.country }}</span>
              </td>
              <td class="spend-cell">{{ row.adSpend }}</td>
              <td :class="changeColor(row.adSpendChange)">
                {{
                  row.adSpendChange === -100
                    ? '-100%'
                    : (row.adSpendChange >= 0 ? '+' : '') + row.adSpendChange + '%'
                }}
              </td>
              <td class="dim-val">{{ row.cpi ?? '-' }}</td>
              <td class="dim-val">{{ row.cpm ?? '-' }}</td>
              <td class="dim-val">{{ row.cpc ?? '-' }}</td>
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
    </div>

    <!-- ── 底部推送栏 ─────────────────────────────────────────── -->
    <div class="dc-push-bar">
      <span class="dc-push-summary">
        在投 {{ activeCampaigns }} 个 &nbsp;|&nbsp; 已暂停 {{ pausedCampaigns }} 个 &nbsp;|&nbsp;
        总广告支出 {{ totalSpendDisplay }}
      </span>
      <div class="dc-push-right">
        <span class="dc-push-last">{{ lastPushText }}</span>
        <button class="dc-push-btn" @click="openPushModal()">立即推送</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, inject } from 'vue'
  import { businessReportContextKey } from '../composables/business-report-context'
  import { campaignData } from '../mockData'

  const openPushModal = inject<() => void>('openPushModal', () => {})
  const ctx = inject(businessReportContextKey)

  const campaigns = computed(() => ctx?.campaigns.value?.rows ?? campaignData)
  const reportLabel = computed(() => {
    if (ctx?.period.value === 'weekly') return '周报'
    if (ctx?.period.value === 'monthly') return '月报'
    return '日报'
  })
  const titleDateText = computed(() => {
    const range = ctx?.reportRange.value
    if (!range) return '--'
    if (ctx?.period.value === 'weekly') return `${range.startDate} - ${range.endDate}`
    if (ctx?.period.value === 'monthly') return range.startDate.slice(0, 7)
    return range.startDate
  })

  const activeCampaigns = computed(
    () => campaigns.value.filter((c) => c.status === 'active').length
  )
  const pausedCampaigns = computed(
    () => campaigns.value.filter((c) => c.status === 'paused').length
  )
  const totalSpendDisplay = computed(() => {
    const sum = campaigns.value.reduce((acc, c) => {
      const n = Number(c.adSpend.replace(/[$,]/g, ''))
      return Number.isFinite(n) ? acc + n : acc
    }, 0)
    return `$${sum.toLocaleString('en-US')}`
  })
  const lastPushText = computed(
    () =>
      ctx?.getLastPushText?.(ctx?.period.value ?? 'daily') ??
      `上次推送：-- 飞书群《经营${reportLabel.value}》`
  )

  const changeColor = (v: number) => (v >= 0 ? 'chg-pos' : 'chg-neg')

  const roiClass = (val: string) => {
    if (!val || val === '-') return 'dim-val'
    const n = parseInt(val)
    if (n >= 100) return 'roi-green'
    if (n >= 80) return 'roi-orange'
    return ''
  }
</script>

<style scoped>
  .daily-campaigns {
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

  /* ── 标题行 ────────────────────────────────────────────────── */
  .dc-title-row {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: space-between;
    padding: 2px 0;
  }

  .dc-title-left {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .dc-title-app {
    font-size: 18px;
    font-weight: 700;
    color: rgb(255 255 255 / 90%);
  }

  .dc-title-badge {
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 700;
    color: #000;
    background: #00d4a1;
    border-radius: 4px;
  }

  .dc-title-date {
    font-size: 13px;
    color: rgb(255 255 255 / 55%);
  }

  /* 右侧统计 */
  .dc-title-stats {
    display: flex;
    gap: 20px;
    align-items: center;
  }

  .dc-stat {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .dc-stat-dot {
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .dc-stat-dot.active {
    background: #00d4a1;
  }

  .dc-stat-dot.paused {
    background: #fb923c;
  }

  .dc-stat-label {
    font-size: 11px;
    color: rgb(255 255 255 / 45%);
  }

  .dc-stat-val {
    font-size: 20px;
    font-weight: 700;
    color: rgb(255 255 255 / 92%);
  }

  .dc-stat-val.paused {
    color: #fb923c;
  }

  .dc-stat-val.spend {
    font-size: 20px;
    color: rgb(255 255 255 / 92%);
  }

  .dc-stat-sep {
    width: 1px;
    height: 28px;
    background: rgb(255 255 255 / 10%);
  }

  /* ── 数据卡片 ───────────────────────────────────────────────── */
  .data-card {
    padding: 0;
    overflow: hidden;
    background: rgb(255 255 255 / 2%);
    border: 1px solid rgb(255 255 255 / 7%);
    border-radius: 10px;
  }

  .table-wrap {
    overflow-x: auto;
  }

  /* ── 表格 ──────────────────────────────────────────────────── */
  .data-table {
    width: 100%;
    min-width: 1500px;
    font-size: 12px;
    border-collapse: collapse;
  }

  .data-table thead {
    background: rgb(255 255 255 / 6%);
  }

  .data-table th {
    padding: 8px 10px;
    font-weight: 600;
    color: rgb(255 255 255 / 45%);
    text-align: left;
    white-space: nowrap;
  }

  .data-table td {
    padding: 8px 10px;
    color: rgb(255 255 255 / 85%);
    white-space: nowrap;
  }

  .data-table tbody tr:not(:last-child) td {
    border-bottom: 1px solid rgb(255 255 255 / 4%);
  }

  .data-table tbody tr:hover td {
    background: rgb(255 255 255 / 3%);
  }

  /* ── 暂停行变暗 ─────────────────────────────────────────────── */
  .row-paused td {
    opacity: 0.5;
  }

  /* ── 固定列 ─────────────────────────────────────────────────── */
  .sticky-col {
    position: sticky;
    left: 0;
    z-index: 2;
    background: #0d1529 !important;
    border-right: 1px solid rgb(255 255 255 / 7%);
  }

  .data-table thead .sticky-col {
    z-index: 3;
    background: rgb(22 32 58) !important;
  }

  /* ── 应用名列 ───────────────────────────────────────────────── */
  .app-cell {
    font-weight: 600;
    color: rgb(255 255 255 / 90%);
  }

  .platform-os {
    font-size: 11px;
    color: rgb(255 255 255 / 55%);
  }

  /* ── 广告平台徽章 ───────────────────────────────────────────── */
  .ad-platform-badge {
    display: inline-flex;
    gap: 0;
    align-items: center;
    overflow: hidden;
    border-radius: 5px;
  }

  .ap-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    font-size: 11px;
    font-weight: 700;
  }

  .ap-name {
    padding: 0 7px;
    font-size: 11px;
    font-weight: 600;
  }

  /* ── 广告系列名称 ───────────────────────────────────────────── */
  .campaign-name {
    max-width: 200px;
    overflow: hidden;
    font-size: 11.5px;
    color: rgb(255 255 255 / 70%);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* ── 状态徽章 ──────────────────────────────────────────────── */
  .status-badge {
    display: inline-flex;
    gap: 5px;
    align-items: center;
    padding: 2px 8px;
    font-size: 11px;
    border-radius: 4px;
  }

  .status-badge.active {
    color: #00d4a1;
    background: rgb(0 212 161 / 12%);
  }

  .status-badge.paused {
    color: #fb923c;
    background: rgb(251 146 60 / 12%);
  }

  .status-dot {
    width: 5px;
    height: 5px;
    background: currentcolor;
    border-radius: 50%;
  }

  /* ── 国家列 ─────────────────────────────────────────────────── */
  .country-cell {
    display: flex;
    gap: 5px;
    align-items: center;
  }

  .flag {
    font-size: 14px;
  }

  /* ── 广告支出 ───────────────────────────────────────────────── */
  .spend-cell {
    font-weight: 600;
    color: #fff;
  }

  /* ── 环比 ──────────────────────────────────────────────────── */
  .chg-pos {
    font-weight: 500;
    color: #00d4a1;
  }

  .chg-neg {
    font-weight: 500;
    color: #ff5c5c;
  }

  /* ── 暗色辅助值 ─────────────────────────────────────────────── */
  .dim-val {
    color: rgb(255 255 255 / 45%);
  }

  /* ── ROI 颜色 ───────────────────────────────────────────────── */
  .roi-green {
    font-weight: 600;
    color: #4ade80;
  }

  .roi-orange {
    font-weight: 600;
    color: #fb923c;
  }

  /* ── 底部推送栏 ─────────────────────────────────────────────── */
  .dc-push-bar {
    position: absolute;
    right: 14px;
    bottom: 14px;
    left: 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .dc-push-summary {
    font-size: 11px;
    color: rgb(255 255 255 / 40%);
  }

  .dc-push-right {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .dc-push-last {
    font-size: 11px;
    color: rgb(255 255 255 / 35%);
  }

  .dc-push-btn {
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
