<template>
  <div class="daily-by-country" :class="{ 'dbc--weekly': isWeekly }">
    <!-- ── 页面标题行 ────────────────────────────────────────── -->
    <div class="dbc-title-row">
      <div class="dbc-title-left">
        <span class="dbc-title-app">整体</span>
        <span class="dbc-title-app">全部平台</span>
        <span class="dbc-title-badge">{{ isWeekly ? '周报' : isMonthly ? '月报' : '日报' }}</span>
        <span class="dbc-title-date">{{ titleDateText }}</span>
      </div>
    </div>

    <!-- ── 国家数据表 ─────────────────────────────────────────── -->
    <div class="data-card">
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th class="sticky-col">国家</th>
              <th>平均DAU</th>
              <th>{{ isWeekly ? '总收益' : isMonthly ? '总收缴' : '总收缴' }}</th>
              <th>付费收缴</th>
              <th>预估利润</th>
              <th>计算利润</th>
              <th>新用户</th>
              <th>自然量</th>
              <th>自然量比例</th>
              <th>DAU占比</th>
              <th>ECPM</th>
              <th>ARPDAU(千倍)</th>
              <th>广告支出</th>
              <th>CPI</th>
              <th>CPM</th>
              <th>CPC</th>
              <th>买量用户</th>
              <th>广告系列数</th>
              <th>首日ROI</th>
              <th>7日ROI</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, idx) in countries"
              :key="row.name"
              :class="{ 'tr-zebra': isWeekly && idx % 2 === 1 }"
            >
              <td class="sticky-col country-cell">
                <span
                  v-if="isWeekly && countryFiClass(row.name)"
                  class="fi country-fi"
                  :class="countryFiClass(row.name)"
                />
                <span v-else class="flag">{{ row.flag }}</span>
                <span>{{ row.name }}</span>
              </td>
              <td>{{ row.avgDau }}</td>
              <td class="revenue-cell">{{ row.revenue }}</td>
              <td>{{ row.paidRevenue }}</td>
              <td>{{ row.profit }}</td>
              <td>{{ row.calcProfit }}</td>
              <td>{{ row.newUsers }}</td>
              <td>{{ row.organic }}</td>
              <td>{{ row.organicRate }}</td>
              <td>
                <div v-if="isWeekly" class="dau-share-wrap dau-share-wrap--bar-first">
                  <div class="dau-bar">
                    <div
                      class="dau-bar-fill"
                      :style="{ width: Math.min(row.dauShare * 3, 100) + '%' }"
                    ></div>
                  </div>
                  <span class="dau-pct">{{ row.dauShare }}%</span>
                </div>
                <div v-else class="dau-share-wrap">
                  <span class="dau-pct">{{ row.dauShare }}%</span>
                  <div class="dau-bar">
                    <div
                      class="dau-bar-fill"
                      :style="{ width: Math.min(row.dauShare * 3, 100) + '%' }"
                    ></div>
                  </div>
                </div>
              </td>
              <td>{{ row.ecpm }}</td>
              <td>{{ row.arpdau }}</td>
              <td>{{ row.adSpend }}</td>
              <td>{{ row.cpi }}</td>
              <td>{{ row.cpm }}</td>
              <td>{{ row.cpc }}</td>
              <td>{{ row.acquisitions }}</td>
              <td>{{ row.campaigns }}</td>
              <td :class="roiColor(row.roi1d)">{{ row.roi1d }}</td>
              <td :class="roiColor(row.roi7d)">{{ row.roi7d }}</td>
            </tr>

            <!-- 其他国家合并行 -->
            <tr class="others-row">
              <td class="sticky-col country-cell">
                <div class="others-label-block">
                  <span class="others-label">{{ othersRow.name }}</span>
                  <span class="others-sub">{{ othersRow.subLabel }}</span>
                </div>
              </td>
              <td>{{ othersRow.avgDau }}</td>
              <td class="revenue-cell">{{ othersRow.revenue }}</td>
              <td>{{ othersRow.paidRevenue }}</td>
              <td>{{ othersRow.profit }}</td>
              <td>{{ othersRow.calcProfit }}</td>
              <td>{{ othersRow.newUsers }}</td>
              <td>{{ othersRow.organic }}</td>
              <td>{{ othersRow.organicRate }}</td>
              <td>
                <div v-if="isWeekly" class="dau-share-wrap dau-share-wrap--bar-first">
                  <div class="dau-bar">
                    <div
                      class="dau-bar-fill"
                      :style="{ width: Math.min(othersRow.dauShare * 3, 100) + '%' }"
                    ></div>
                  </div>
                  <span class="dau-pct">{{ othersRow.dauShare }}%</span>
                </div>
                <div v-else class="dau-share-wrap">
                  <span class="dau-pct">{{ othersRow.dauShare }}%</span>
                  <div class="dau-bar">
                    <div
                      class="dau-bar-fill"
                      :style="{ width: Math.min(othersRow.dauShare * 3, 100) + '%' }"
                    ></div>
                  </div>
                </div>
              </td>
              <td>{{ othersRow.ecpm }}</td>
              <td>{{ othersRow.arpdau }}</td>
              <td>{{ othersRow.adSpend }}</td>
              <td>{{ othersRow.cpi }}</td>
              <td>{{ othersRow.cpm }}</td>
              <td>{{ othersRow.cpc }}</td>
              <td>{{ othersRow.acquisitions }}</td>
              <td>{{ othersRow.campaigns }}</td>
              <td :class="roiColor(othersRow.roi1d)">{{ othersRow.roi1d }}</td>
              <td :class="roiColor(othersRow.roi7d)">{{ othersRow.roi7d }}</td>
            </tr>

            <!-- 合计行 -->
            <tr class="total-row">
              <td class="sticky-col">合计</td>
              <td>{{ totals.avgDau }}</td>
              <td class="revenue-cell">{{ totals.revenue }}</td>
              <td>{{ totals.paidRevenue }}</td>
              <td>{{ totals.profit }}</td>
              <td>{{ totals.calcProfit }}</td>
              <td>{{ totals.newUsers }}</td>
              <td>{{ totals.organic }}</td>
              <td>{{ totals.organicRate }}</td>
              <td>
                <div v-if="isWeekly" class="dau-share-wrap dau-share-wrap--bar-first">
                  <div class="dau-bar">
                    <div
                      class="dau-bar-fill total-bar"
                      :style="{ width: Math.min(totals.dauShare * 3, 100) + '%' }"
                    ></div>
                  </div>
                  <span class="dau-pct">{{ totals.dauShare }}%</span>
                </div>
                <div v-else class="dau-share-wrap">
                  <span class="dau-pct">{{ totals.dauShare }}%</span>
                  <div class="dau-bar">
                    <div
                      class="dau-bar-fill total-bar"
                      :style="{ width: Math.min(totals.dauShare * 3, 100) + '%' }"
                    ></div>
                  </div>
                </div>
              </td>
              <td>{{ totals.ecpm }}</td>
              <td>{{ totals.arpdau }}</td>
              <td>{{ totals.adSpend }}</td>
              <td>{{ totals.cpi }}</td>
              <td>{{ totals.cpm }}</td>
              <td>{{ totals.cpc }}</td>
              <td>{{ totals.acquisitions }}</td>
              <td>{{ totals.campaigns }}</td>
              <td :class="roiColor(totals.roi1d)">{{ totals.roi1d }}</td>
              <td :class="roiColor(totals.roi7d)">{{ totals.roi7d }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ── 底部推送栏 ───────────────────────────────────────── -->
    <div class="dbc-push-bar">
      <span class="dbc-count">共 {{ countryCount }} 个国家</span>
      <div class="dbc-push-right">
        <span class="dbc-push-last">{{ pushText }}</span>
        <button class="dbc-push-btn" type="button" @click="openPushModal()">立即推送</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import 'flag-icons/css/flag-icons.min.css'
  import { computed, inject } from 'vue'
  import { businessReportContextKey } from '../composables/business-report-context'
  import { countryData, countryOthersRow } from '../mockData'

  const props = withDefaults(
    defineProps<{
      /** 周期样式：日报/周报/月报 */
      variant?: 'daily' | 'weekly' | 'monthly'
    }>(),
    { variant: 'daily' }
  )

  defineOptions({ name: 'DailyByCountry' })

  const openPushModal = inject<() => void>('openPushModal', () => {})
  const ctx = inject(businessReportContextKey)

  const isWeekly = computed(() => props.variant === 'weekly')
  const isMonthly = computed(() => props.variant === 'monthly')

  const countries = computed(() => ctx?.byCountry.value?.rows ?? countryData)
  const othersRow = computed(() => ctx?.byCountry.value?.othersRow ?? countryOthersRow)
  const reportLabel = computed(() => (isWeekly.value ? '周报' : isMonthly.value ? '月报' : '日报'))
  const titleDateText = computed(() => {
    const range = ctx?.reportRange.value
    if (!range) return '--'
    if (isMonthly.value) return range.startDate.slice(0, 7)
    if (isWeekly.value) return `${range.startDate} - ${range.endDate}`
    return range.startDate
  })
  const pushText = computed(
    () =>
      ctx?.getLastPushText?.(ctx?.period.value ?? props.variant) ??
      `上次推送：-- 飞书群《经营${reportLabel.value}》`
  )

  function parseDisplayNumber(value: string | number | null | undefined): number {
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0
    if (value == null) return 0
    const raw = String(value)
      .trim()
      .replace(/[$,%\s,]/g, '')
    if (!raw) return 0
    if (raw.endsWith('亿')) return Number(raw.slice(0, -1)) * 100000000
    if (raw.endsWith('万')) return Number(raw.slice(0, -1)) * 10000
    const parsed = Number(raw)
    return Number.isFinite(parsed) ? parsed : 0
  }
  function formatCompactCn(value: number): string {
    if (value >= 100000000) return `${(value / 100000000).toFixed(1)}亿`
    if (value >= 10000) return `${(value / 10000).toFixed(1)}万`
    return value.toLocaleString('en-US', { maximumFractionDigits: 0 })
  }
  function formatUsd(value: number, digits = 0): string {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`
  }
  function formatPercent(value: number): string {
    return `${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}%`
  }

  const allRows = computed(() => [...countries.value, othersRow.value])
  const countryCount = computed(() => {
    const otherMatch = othersRow.value.subLabel?.match(/\d+/)
    const othersCount = otherMatch ? Number(otherMatch[0]) : 0
    return countries.value.length + othersCount
  })
  const totals = computed(() => {
    const rows = allRows.value
    const spendTotal = rows.reduce((sum, row) => sum + parseDisplayNumber(row.adSpend), 0)
    const count = rows.length || 1
    const newUsersTotal = rows.reduce((sum, row) => sum + parseDisplayNumber(row.newUsers), 0)
    const organicTotal = rows.reduce((sum, row) => sum + parseDisplayNumber(row.organic), 0)
    return {
      avgDau: formatCompactCn(rows.reduce((sum, row) => sum + parseDisplayNumber(row.avgDau), 0)),
      revenue: formatUsd(
        rows.reduce((sum, row) => sum + parseDisplayNumber(row.revenue), 0),
        0
      ),
      paidRevenue: formatUsd(
        rows.reduce((sum, row) => sum + parseDisplayNumber(row.paidRevenue), 0),
        0
      ),
      profit: formatUsd(
        rows.reduce((sum, row) => sum + parseDisplayNumber(row.profit), 0),
        0
      ),
      calcProfit: formatUsd(
        rows.reduce((sum, row) => sum + parseDisplayNumber(row.calcProfit), 0),
        0
      ),
      newUsers: formatCompactCn(newUsersTotal),
      organic: formatCompactCn(organicTotal),
      organicRate: formatPercent(newUsersTotal > 0 ? (organicTotal / newUsersTotal) * 100 : 0),
      dauShare: rows.reduce((sum, row) => sum + row.dauShare, 0),
      ecpm: formatUsd(rows.reduce((sum, row) => sum + parseDisplayNumber(row.ecpm), 0) / count, 2),
      arpdau: (
        rows.reduce((sum, row) => sum + parseDisplayNumber(row.arpdau), 0) / count
      ).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      adSpend: formatUsd(spendTotal, 0),
      cpi: formatUsd(rows.reduce((sum, row) => sum + parseDisplayNumber(row.cpi), 0) / count, 2),
      cpm: formatUsd(rows.reduce((sum, row) => sum + parseDisplayNumber(row.cpm), 0) / count, 2),
      cpc: formatUsd(rows.reduce((sum, row) => sum + parseDisplayNumber(row.cpc), 0) / count, 2),
      acquisitions: formatCompactCn(
        rows.reduce((sum, row) => sum + parseDisplayNumber(row.acquisitions), 0)
      ),
      campaigns: rows.reduce((sum, row) => sum + row.campaigns, 0),
      roi1d: formatPercent(
        rows.reduce((sum, row) => sum + parseDisplayNumber(row.roi1d), 0) / count
      ),
      roi7d: formatPercent(
        rows.reduce((sum, row) => sum + parseDisplayNumber(row.roi7d), 0) / count
      )
    }
  })

  /** 国家名称 → flag-icons 的 `fi-xx`（与 mock 国家名一致） */
  const COUNTRY_FI: Record<string, string> = {
    美国: 'us',
    德国: 'de',
    日本: 'jp',
    韩国: 'kr',
    巴西: 'br',
    墨西哥: 'mx',
    法国: 'fr',
    英国: 'gb',
    意大利: 'it',
    西班牙: 'es',
    加拿大: 'ca',
    澳大利亚: 'au',
    印度: 'in',
    俄罗斯: 'ru',
    土耳其: 'tr',
    印尼: 'id',
    泰国: 'th',
    越南: 'vn',
    菲律宾: 'ph',
    荷兰: 'nl',
    瑞典: 'se',
    波兰: 'pl'
  }

  function countryFiClass(name: string): string | undefined {
    const code = COUNTRY_FI[name]
    return code ? `fi-${code}` : undefined
  }

  const roiColor = (val: string) => {
    const n = parseInt(val)
    if (n >= 100) return 'roi-green'
    if (n >= 80) return 'roi-orange'
    return ''
  }
</script>

<style scoped>
  .daily-by-country {
    position: relative;
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 14px;
    min-height: 0;
    padding: 14px 14px 52px;
    overflow-y: auto;
    background: rgb(255 255 255 / 3%);
    border: 1px solid rgb(255 255 255 / 7%);
    border-radius: 12px;
  }

  /* 周报：仅表格区域滚动；min-width:0 避免 flex 子项被宽表撑开导致不出现横向条 */
  .daily-by-country.dbc--weekly {
    width: 100%;
    min-width: 0;
    max-width: 100%;
    overflow: hidden;
  }

  /* ── 标题行 ─────────────────────────────────────────────────── */
  .dbc-title-row {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    padding: 2px 0;
  }

  .dbc-title-left {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .dbc-title-app {
    font-size: 18px;
    font-weight: 700;
    color: rgb(255 255 255 / 90%);
  }

  .dbc-title-badge {
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 700;
    color: #000;
    background: #00d4a1;
    border-radius: 4px;
  }

  .dbc-title-date {
    font-size: 13px;
    color: rgb(255 255 255 / 65%);
  }

  /* ── 数据卡片 ───────────────────────────────────────────────── */
  .data-card {
    padding: 0;
    overflow: hidden;
    background: rgb(255 255 255 / 2%);
    border: 1px solid rgb(255 255 255 / 7%);
    border-radius: 10px;
  }

  .dbc--weekly .data-card {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
  }

  .table-wrap {
    overflow-x: auto;
  }

  .dbc--weekly .table-wrap {
    flex: 1;
    min-width: 0;
    min-height: 0;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
  }

  /* ── 表格 ─────────────────────────────────────────────────── */
  .data-table {
    width: 100%;
    min-width: max-content;
    font-size: 11.5px;
    border-collapse: collapse;
  }

  .dbc--weekly .data-table {
    width: 100%;
    min-width: max-content;
  }

  .data-table thead {
    background: rgb(255 255 255 / 6%);
  }

  .data-table th {
    padding: 8px 10px;
    font-weight: 600;
    color: rgb(255 255 255 / 55%);
    text-align: left;
    white-space: nowrap;
  }

  .data-table th:first-child {
    border-radius: 0;
  }

  .data-table td {
    padding: 6px 10px;
    color: rgb(255 255 255 / 85%);
    white-space: nowrap;
  }

  .data-table tbody tr:not(.total-row) td {
    border-bottom: 1px solid rgb(255 255 255 / 4%);
  }

  .data-table tbody tr:hover td {
    background: rgb(255 255 255 / 3%);
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

  /* ── 国家格 ─────────────────────────────────────────────────── */
  .country-cell {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .country-fi {
    flex-shrink: 0;
    width: 18px;
    height: 18px;
    overflow: hidden;
    font-size: 14px;
    line-height: 1;
    border-radius: 50%;
    box-shadow: 0 0 0 1px rgb(255 255 255 / 12%);
  }

  .flag {
    font-size: 14px;
  }

  /* ── 其他国家行 ─────────────────────────────────────────────── */
  .others-row td {
    color: rgb(255 255 255 / 70%);
  }

  .others-label-block {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .others-label {
    font-size: 12px;
    font-weight: 600;
    color: rgb(255 255 255 / 80%);
  }

  .others-sub {
    font-size: 10px;
    color: rgb(255 255 255 / 40%);
  }

  /* ── 收入高亮 ───────────────────────────────────────────────── */
  .revenue-cell {
    font-weight: 600;
    color: #fff !important;
  }

  /* ── DAU占比 ────────────────────────────────────────────────── */
  .dau-share-wrap {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .dau-share-wrap--bar-first {
    flex-direction: row;
  }

  .dau-pct {
    min-width: 32px;
    font-size: 11px;
  }

  .dau-bar {
    flex-shrink: 0;
    width: 44px;
    height: 4px;
    overflow: hidden;
    background: rgb(255 255 255 / 8%);
    border-radius: 2px;
  }

  .dau-bar-fill {
    height: 100%;
    background: #00d4a1;
    border-radius: 2px;
  }

  .total-bar {
    width: 100% !important;
  }

  /* ── 合计行 ─────────────────────────────────────────────────── */
  .total-row td {
    font-weight: 600;
    color: #00d4a1 !important;
    border-top: 1px solid rgb(0 212 161 / 25%) !important;
  }

  .total-row .sticky-col {
    background: rgb(0 22 18) !important;
  }

  /* ── 周报：斑马纹、合计行整块青绿底、DAU 条在前 ─────────────── */
  .dbc--weekly .data-table tbody tr.tr-zebra td {
    background: rgb(255 255 255 / 2.5%);
  }

  .dbc--weekly .data-table tbody tr.tr-zebra td.sticky-col {
    background: rgb(16 24 46) !important;
  }

  .dbc--weekly .data-table tbody tr:not(.tr-zebra, .others-row, .total-row) td.sticky-col {
    background: #0d1529 !important;
  }

  .dbc--weekly .data-table tbody tr:hover td {
    background: rgb(255 255 255 / 5%) !important;
  }

  .dbc--weekly .data-table tbody tr.tr-zebra:hover td {
    background: rgb(255 255 255 / 6%) !important;
  }

  .dbc--weekly .total-row td {
    color: #f4f4f5 !important;
    background: rgb(0 120 108 / 50%) !important;
    border-top: none !important;
  }

  .dbc--weekly .total-row .sticky-col {
    background: rgb(0 105 95 / 58%) !important;
  }

  .dbc--weekly .total-row .roi-orange {
    color: #fde68a !important;
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
  .dbc-push-bar {
    position: absolute;
    right: 14px;
    bottom: 14px;
    left: 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .dbc-count {
    font-size: 11px;
    color: rgb(255 255 255 / 40%);
  }

  .dbc-push-right {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .dbc-push-last {
    font-size: 11px;
    color: rgb(255 255 255 / 35%);
  }

  .dbc-push-btn {
    padding: 6px 16px;
    font-size: 11px;
    font-weight: 600;
    color: #000;
    cursor: pointer;
    background: #00d4a1;
    border: none;
    border-radius: 9999px;
    transition: opacity 0.2s;
  }

  .dbc-push-btn:hover {
    opacity: 0.88;
  }

  .dbc--weekly .dbc-push-btn {
    padding: 6px 18px;
  }
</style>
