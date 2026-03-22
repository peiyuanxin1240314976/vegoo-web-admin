<template>
  <div class="app-sidebar">
    <!-- ─── Header ─── -->
    <div class="sidebar-header">
      <span class="sidebar-title">应用列表</span>
      <button class="sort-btn" @click="toggleSort">
        {{ sortLabel }} <i :class="['sort-icon', sortDir === 'desc' ? '' : 'asc']">↓</i>
      </button>
    </div>

    <!-- ═══════════════════════════════════════════════════════
         AD-SPEND MODE – special layered layout
         ═══════════════════════════════════════════════════ -->
    <template v-if="showField === 'adSpend'">
      <!-- Overall card -->
      <div
        v-if="overallItem"
        class="app-item overall ad-overall"
        :class="{ selected: selectedId === overallItem.id }"
        @click="$emit('select', overallItem.id)"
      >
        <!-- title row -->
        <div class="ad-overall-title">
          <span class="ad-overall-name">整体</span>
          <span class="ad-overall-cat">全部平台</span>
        </div>

        <!-- 4-metric grid: 广告支出 | 环比 | 买量用户 | 广告系列数 -->
        <div class="ad-metrics-grid">
          <div class="ad-metric">
            <div class="ad-metric-label">广告支出</div>
            <div class="ad-metric-value ad-green"> ${{ formatNum(overallItem.adSpend ?? 0) }} </div>
          </div>
          <div class="ad-metric">
            <div class="ad-metric-label">环比</div>
            <div class="ad-metric-value" :class="changeClass(overallItem.adSpendChange ?? 0)">
              {{ changeStr(overallItem.adSpendChange ?? 0) }}
            </div>
          </div>
          <div class="ad-metric">
            <div class="ad-metric-label">买量用户</div>
            <div class="ad-metric-value">{{ overallItem.paidUsers }}万</div>
          </div>
          <div class="ad-metric">
            <div class="ad-metric-label">广告系列数</div>
            <div class="ad-metric-value">{{ overallItem.activeCampaigns }}</div>
          </div>
        </div>

        <!-- Platform distribution bar -->
        <div class="platform-bar">
          <div
            v-for="seg in overallItem.platformBreakdown ?? []"
            :key="seg.name"
            class="platform-seg"
            :style="{ width: seg.percent + '%', background: seg.color }"
          >
            <template v-if="seg.percent >= 10">
              <div class="seg-name">{{ seg.name }}</div>
              <div class="seg-pct">{{ seg.percent }}%</div>
            </template>
          </div>
        </div>

        <!-- Legend (top 3 platforms) -->
        <div class="platform-legend">
          <span
            v-for="seg in (overallItem.platformBreakdown ?? []).slice(0, 3)"
            :key="seg.name"
            class="legend-item"
          >
            <span class="legend-dot" :style="{ background: seg.color }" />
            {{ seg.name }}
          </span>
        </div>
      </div>

      <!-- Major apps (has sparkline) -->
      <div
        v-for="item in majorAppsSorted"
        :key="item.id"
        class="app-item major-app-ad"
        :class="{ selected: selectedId === item.id }"
        @click="$emit('select', item.id)"
      >
        <div class="major-app-header">
          <div class="app-icon" :style="{ background: item.iconBg }">
            {{ item.iconEmoji }}
          </div>
          <span class="app-name">{{ item.name }}</span>
          <span class="app-category">{{ item.category }}</span>
        </div>
        <div class="major-app-metrics">
          <div class="major-metric">
            <div class="major-metric-label">广告支出</div>
            <div class="major-metric-row">
              <span class="major-metric-value"> ${{ formatNum(item.adSpend ?? 0) }} </span>
              <span :class="['major-metric-change', changeClass(item.adSpendChange ?? 0)]">
                {{ changeStr(item.adSpendChange ?? 0) }}
              </span>
            </div>
          </div>
          <div class="major-metric major-metric-right">
            <div class="major-metric-label">买量用户</div>
            <div class="major-metric-value">{{ item.paidUsers }}万</div>
          </div>
        </div>
      </div>

      <!-- Sub-apps 2-column grid -->
      <div v-if="subAppsSorted.length" class="sub-apps-grid">
        <div
          v-for="item in subAppsSorted"
          :key="item.id"
          class="sub-app-item"
          :class="{ selected: selectedId === item.id }"
          @click="$emit('select', item.id)"
        >
          <div class="sub-app-name">{{ item.name }}</div>
          <div class="sub-app-cat">{{ item.category }}</div>
          <div class="sub-app-spend">${{ formatNum(item.adSpend ?? 0) }}</div>
          <div :class="['sub-app-change', changeClass(item.adSpendChange ?? 0)]">
            {{ changeStr(item.adSpendChange ?? 0) }}
          </div>
        </div>
      </div>
    </template>

    <!-- ═══════════════════════════════════════════════════════
         NORMAL MODE – 2-column grid layout
         ═══════════════════════════════════════════════════ -->
    <template v-else>
      <div class="nm-grid">
        <!-- Group cards: isOverall or has dau (category-level apps) -->
        <div
          v-for="item in groupApps"
          :key="item.id"
          :class="['nm-card', 'nm-card--group', { 'is-selected': selectedId === item.id }]"
          @click="$emit('select', item.id)"
        >
          <div class="nm-gc-head">
            <span class="nm-gc-dot" :style="{ background: item.iconColor }" />
            <span class="nm-gc-name">{{ item.name }}</span>
            <span class="nm-gc-cat">{{ item.category }}</span>
          </div>
          <div class="nm-gc-revenue">
            <span class="nm-gc-amount">${{ formatNum(item.revenue) }}</span>
            <span :class="['nm-gc-change', item.revenueChange >= 0 ? 'is-up' : 'is-down']">
              环比 {{ item.revenueChange >= 0 ? '+' : '' }}{{ item.revenueChange }}%
            </span>
          </div>
          <div class="nm-gc-meta">
            <div>预估利润 ${{ formatNum(item.profit) }}</div>
            <div>{{ showField === 'mau' ? 'MAU' : 'DAU' }} {{ item.dau }}万</div>
          </div>
          <SparklineChart
            class="nm-gc-spark"
            :data="item.sparkline ?? sparkData"
            :color="item.iconColor"
            :width="110"
            :height="26"
          />
          <div v-if="item.platforms?.length" class="nm-gc-tags">
            <span v-for="p in item.platforms" :key="p" class="nm-gc-tag">{{ p }}</span>
          </div>
        </div>

        <!-- Simple cards: individual apps (no dau) -->
        <div
          v-for="item in singleApps"
          :key="item.id"
          :class="['nm-card', 'nm-card--single', { 'is-selected': selectedId === item.id }]"
          @click="$emit('select', item.id)"
        >
          <div class="nm-sc-name">
            {{ item.name }}
            <span class="nm-sc-cat">{{ item.category }}</span>
          </div>
          <div class="nm-sc-bottom">
            <span class="nm-sc-amount">${{ formatNum(item.revenue) }}</span>
            <span :class="['nm-sc-change', item.revenueChange >= 0 ? 'is-up' : 'is-down']">
              {{ item.revenueChange >= 0 ? '+' : '' }}{{ item.revenueChange }}%
            </span>
          </div>
        </div>
      </div>
    </template>

    <!-- ─── Footer ─── -->
    <div class="sidebar-footer">
      <span class="app-count">共 {{ appList.length - 1 }} 个应用</span>
      <button class="compare-btn" @click="$emit('compareMode')"> <span>+</span> 对比模式 </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import type { AppListItem } from './types'
  import SparklineChart from './SparklineChart.vue'

  const props = withDefaults(
    defineProps<{
      appList: AppListItem[]
      selectedId?: string
      showField?: 'mau' | 'dau' | 'adSpend'
    }>(),
    {
      selectedId: 'overall',
      showField: 'mau'
    }
  )

  defineEmits<{
    (e: 'select', id: string): void
    (e: 'compareMode'): void
  }>()

  const sortDir = ref<'desc' | 'asc'>('desc')
  const sortLabel = computed(() => (props.showField === 'adSpend' ? '广告支出' : '总收缴'))

  const toggleSort = () => {
    sortDir.value = sortDir.value === 'desc' ? 'asc' : 'desc'
  }

  // ── Normal mode: group cards (has dau) vs simple cards ───────
  const groupApps = computed(() => {
    const items = props.appList.filter((a) => a.isOverall || a.dau !== undefined)
    return [...items].sort((a, b) => {
      if (a.isOverall) return -1
      if (b.isOverall) return 1
      return sortDir.value === 'desc' ? b.revenue - a.revenue : a.revenue - b.revenue
    })
  })

  const singleApps = computed(() => {
    const items = props.appList.filter((a) => !a.isOverall && a.dau === undefined)
    return [...items].sort((a, b) =>
      sortDir.value === 'desc' ? b.revenue - a.revenue : a.revenue - b.revenue
    )
  })

  // ── Ad-spend mode separated lists ───────────────────────────
  const overallItem = computed(() => props.appList.find((a) => a.isOverall))

  const majorAppsSorted = computed(() => {
    const major = props.appList.filter((a) => !a.isOverall && !!a.sparkline)
    return [...major].sort((a, b) => {
      const va = a.adSpend ?? 0
      const vb = b.adSpend ?? 0
      return sortDir.value === 'desc' ? vb - va : va - vb
    })
  })

  const subAppsSorted = computed(() => {
    const subs = props.appList.filter((a) => !a.isOverall && !a.sparkline)
    return [...subs].sort((a, b) => {
      const va = a.adSpend ?? 0
      const vb = b.adSpend ?? 0
      return sortDir.value === 'desc' ? vb - va : va - vb
    })
  })

  // ── Helpers ──────────────────────────────────────────────────
  const sparkData = [3800, 4000, 3900, 4200, 4100, 4350, 4400, 4521]

  /** Format with commas: 41100 → "41,100" */
  const formatNum = (v: number) => {
    if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + 'M'
    return v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  const changeStr = (change: number) => (change >= 0 ? '+' : '') + change + '%'
  const changeClass = (change: number) => (change >= 0 ? 'ad-positive' : 'ad-negative')
</script>

<style scoped>
  /* ── Shell ─────────────────────────────────────────────────── */
  .app-sidebar {
    display: flex;
    flex-direction: column;
  }

  /* ── Header ────────────────────────────────────────────────── */
  .sidebar-header {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: space-between;
    padding: 12px 14px 8px;
  }

  .sidebar-title {
    font-size: 13px;
    font-weight: 600;
    color: rgb(255 255 255 / 85%);
  }

  .sort-btn {
    display: flex;
    gap: 2px;
    align-items: center;
    padding: 2px 4px;
    font-size: 11px;
    color: rgb(255 255 255 / 50%);
    cursor: pointer;
    background: none;
    border: none;
    border-radius: 4px;
    transition: color 0.15s;
  }

  .sort-btn:hover {
    color: #00d4a1;
  }

  .sort-icon {
    display: inline-block;
    font-style: normal;
    transition: transform 0.2s;
  }

  .sort-icon.asc {
    transform: rotate(180deg);
  }

  /* ── Shared item base ───────────────────────────────────────── */
  .app-item {
    position: relative;
    cursor: pointer;
    border-left: 2px solid transparent;
    transition:
      background 0.15s,
      border-color 0.15s;
  }

  .app-item:hover {
    background: rgb(255 255 255 / 4%);
  }

  .app-item.selected {
    background: rgb(0 212 161 / 8%);
    border-left-color: #00d4a1;
  }

  /* ════════════════════════════════════════════════════════════
     AD-SPEND MODE STYLES
     ════════════════════════════════════════════════════════ */

  /* ── Overall card ───────────────────────────────────────── */
  .ad-overall {
    padding: 12px 14px;
    margin-bottom: 4px;
    background: rgb(0 212 161 / 6%);
    border-bottom: 1px solid rgb(255 255 255 / 6%);
  }

  .ad-overall.selected {
    background: rgb(0 212 161 / 12%);
    border-left-color: #00d4a1;
  }

  .ad-overall-title {
    margin-bottom: 10px;
  }

  .ad-overall-name {
    font-size: 14px;
    font-weight: 700;
    color: rgb(255 255 255 / 90%);
  }

  .ad-overall-cat {
    margin-left: 6px;
    font-size: 11px;
    color: rgb(255 255 255 / 40%);
  }

  /* 4-metric grid */
  .ad-metrics-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 4px;
    margin-bottom: 10px;
  }

  .ad-metric {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .ad-metric-label {
    font-size: 9px;
    color: rgb(255 255 255 / 40%);
    white-space: nowrap;
  }

  .ad-metric-value {
    font-size: 12px;
    font-weight: 700;
    color: rgb(255 255 255 / 90%);
    white-space: nowrap;
  }

  .ad-green {
    color: #00d4a1;
  }

  .ad-positive {
    color: #00d4a1;
  }

  .ad-negative {
    color: #ff5c5c;
  }

  /* Platform bar */
  .platform-bar {
    display: flex;
    height: 36px;
    margin-bottom: 6px;
    overflow: hidden;
    border-radius: 4px;
  }

  .platform-seg {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    padding: 0 4px;
    overflow: hidden;
  }

  .seg-name {
    overflow: hidden;
    font-size: 9px;
    font-weight: 600;
    color: rgb(255 255 255 / 90%);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .seg-pct {
    font-size: 9px;
    color: rgb(255 255 255 / 70%);
    white-space: nowrap;
  }

  /* Platform legend */
  .platform-legend {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .legend-item {
    display: flex;
    gap: 4px;
    align-items: center;
    font-size: 10px;
    color: rgb(255 255 255 / 55%);
  }

  .legend-dot {
    flex-shrink: 0;
    width: 7px;
    height: 7px;
    border-radius: 50%;
  }

  /* ── Major app items ────────────────────────────────────── */
  .major-app-ad {
    padding: 10px 14px;
    border-bottom: 1px solid rgb(255 255 255 / 4%);
  }

  .major-app-header {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 8px;
  }

  .major-app-metrics {
    display: flex;
    justify-content: space-between;
  }

  .major-metric {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .major-metric-right {
    text-align: right;
  }

  .major-metric-label {
    font-size: 10px;
    color: rgb(255 255 255 / 40%);
  }

  .major-metric-row {
    display: flex;
    gap: 5px;
    align-items: baseline;
  }

  .major-metric-value {
    font-size: 13px;
    font-weight: 600;
    color: rgb(255 255 255 / 88%);
  }

  .major-metric-change {
    font-size: 10px;
    font-weight: 500;
  }

  /* ── Sub-apps 2-column grid ─────────────────────────────── */
  .sub-apps-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1px;
    margin-top: 1px;
    background: rgb(255 255 255 / 4%);
  }

  .sub-app-item {
    padding: 10px 12px;
    cursor: pointer;
    background: var(--rp-surface, #0d1529);
    border-left: 2px solid transparent;
    transition: background 0.15s;
  }

  .sub-app-item:hover {
    background: rgb(255 255 255 / 4%);
  }

  .sub-app-item.selected {
    background: rgb(0 212 161 / 8%);
    border-left-color: #00d4a1;
  }

  .sub-app-name {
    margin-bottom: 1px;
    overflow: hidden;
    font-size: 11px;
    font-weight: 600;
    color: rgb(255 255 255 / 85%);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .sub-app-cat {
    margin-bottom: 4px;
    font-size: 9px;
    color: rgb(255 255 255 / 35%);
  }

  .sub-app-spend {
    font-size: 13px;
    font-weight: 700;
    color: rgb(255 255 255 / 88%);
  }

  .sub-app-change {
    font-size: 10px;
    font-weight: 500;
  }

  /* ════════════════════════════════════════════════════════════
     NORMAL MODE STYLES – 2-column grid
     ════════════════════════════════════════════════════════ */

  .nm-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    padding: 0 10px 10px;
  }

  /* Base card */
  .nm-card {
    padding: 10px;
    cursor: pointer;
    background: rgb(255 255 255 / 4%);
    border: 1px solid transparent;
    border-radius: 10px;
    transition:
      background 0.15s,
      border-color 0.15s;
  }

  .nm-card:hover {
    background: rgb(255 255 255 / 7%);
  }

  .nm-card.is-selected {
    background: rgb(0 212 161 / 8%);
    border-color: #00d4a1;
  }

  /* Group card */
  .nm-card--group {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .nm-gc-head {
    display: flex;
    gap: 5px;
    align-items: center;
  }

  .nm-gc-dot {
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .nm-gc-name {
    font-size: 12px;
    font-weight: 600;
    color: rgb(255 255 255 / 85%);
    white-space: nowrap;
  }

  .nm-gc-cat {
    overflow: hidden;
    font-size: 10px;
    color: rgb(255 255 255 / 40%);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .nm-gc-revenue {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .nm-gc-amount {
    font-size: 15px;
    font-weight: 700;
    color: rgb(255 255 255 / 90%);
    letter-spacing: -0.02em;
  }

  .nm-gc-change {
    font-size: 10px;
    font-weight: 500;
  }

  .nm-gc-change.is-up {
    color: #00d4a1;
  }

  .nm-gc-change.is-down {
    color: #ff5c5c;
  }

  .nm-gc-meta {
    display: flex;
    flex-direction: column;
    gap: 1px;
    font-size: 10px;
    color: rgb(255 255 255 / 40%);
  }

  .nm-gc-spark {
    display: block;
    width: 100%;
  }

  .nm-gc-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 3px;
  }

  .nm-gc-tag {
    padding: 1px 4px;
    font-size: 9px;
    color: rgb(255 255 255 / 45%);
    background: rgb(255 255 255 / 8%);
    border-radius: 3px;
  }

  /* Simple card */
  .nm-card--single {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .nm-sc-name {
    overflow: hidden;
    font-size: 11px;
    font-weight: 600;
    color: rgb(255 255 255 / 80%);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .nm-sc-cat {
    margin-left: 3px;
    font-size: 10px;
    font-weight: 400;
    color: rgb(255 255 255 / 40%);
  }

  .nm-sc-bottom {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
  }

  .nm-sc-amount {
    font-size: 14px;
    font-weight: 700;
    color: rgb(255 255 255 / 88%);
    letter-spacing: -0.02em;
  }

  .nm-sc-change {
    font-size: 10px;
    font-weight: 500;
  }

  .nm-sc-change.is-up {
    color: #00d4a1;
  }

  .nm-sc-change.is-down {
    color: #ff5c5c;
  }

  /* ── Footer ─────────────────────────────────────────────── */
  .sidebar-footer {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    margin-top: auto;
    border-top: 1px solid rgb(255 255 255 / 6%);
  }

  .app-count {
    font-size: 11px;
    color: rgb(255 255 255 / 40%);
  }

  .compare-btn {
    display: flex;
    gap: 3px;
    align-items: center;
    padding: 3px 8px;
    font-size: 11px;
    color: #00d4a1;
    cursor: pointer;
    background: rgb(0 212 161 / 10%);
    border: 1px solid rgb(0 212 161 / 25%);
    border-radius: 5px;
    transition: background 0.15s;
  }

  .compare-btn:hover {
    background: rgb(0 212 161 / 20%);
  }
</style>
