<template>
  <div class="app-sidebar">
    <div class="sidebar-header">
      <span class="sidebar-title">应用列表</span>
      <button class="sort-btn" @click="toggleSort">
        {{ sortLabel }} <i :class="['sort-icon', sortDir === 'desc' ? 'asc' : '']">↓</i>
      </button>
    </div>

    <!-- Overall item -->
    <div
      v-for="item in sortedApps"
      :key="item.id"
      class="app-item"
      :class="{ selected: selectedId === item.id, overall: item.isOverall }"
      @click="$emit('select', item.id)"
    >
      <!-- Overall special layout -->
      <template v-if="item.isOverall">
        <div class="overall-content">
          <div class="overall-top">
            <div class="overall-info">
              <span class="overall-name">整体 <span class="overall-cat">全部平台</span></span>
              <span v-if="selectedId === item.id" class="selected-badge">SELECTED</span>
            </div>
          </div>
          <div class="overall-value" :style="{ color: valueColor(item.revenueChange) }">
            ${{ formatRevenue(item.revenue) }}
            <span class="overall-change" :style="{ color: valueColor(item.revenueChange) }">
              {{ item.revenueChange >= 0 ? '+' : '' }}{{ item.revenueChange }}%
            </span>
          </div>
          <div class="overall-meta">
            <span v-if="showField === 'mau' && item.mau"
              >预估利润 ${{ formatRevenue(item.profit) }}&nbsp;&nbsp;MAU {{ item.mau }}万</span
            >
            <span v-else-if="showField === 'dau' && item.dau">DAU {{ item.dau }}万</span>
            <span v-else-if="showField === 'adSpend'"
              >广告支出 ${{ formatRevenue(item.adSpend ?? 0) }}&nbsp;&nbsp;买量用户
              {{ item.mau }}万</span
            >
          </div>
          <div class="overall-platforms">
            <span v-for="p in item.platforms" :key="p" class="platform-tag">{{ p }}</span>
          </div>
          <SparklineChart :data="sparkData" color="#00D4A1" :width="100" :height="28" />
        </div>
      </template>

      <!-- Regular app item -->
      <template v-else>
        <div class="app-icon" :style="{ background: item.iconBg }">
          <span>{{ item.iconEmoji }}</span>
        </div>
        <div class="app-info">
          <div class="app-name-row">
            <span class="app-name">{{ item.name }}</span>
            <span class="app-category">{{ item.category }}</span>
          </div>
          <div class="app-metrics">
            <span class="app-revenue" :style="{ color: valueColor(item.revenueChange) }">
              ${{ formatRevenue(item.revenue) }}
              <span class="app-change" :style="{ color: valueColor(item.revenueChange) }">
                {{ item.revenueChange >= 0 ? '+' : '' }}{{ item.revenueChange }}%
              </span>
            </span>
            <span v-if="showField === 'mau' && item.mau" class="app-dau">MAU {{ item.mau }}万</span>
            <span v-else-if="showField === 'dau' && item.dau" class="app-dau"
              >DAU {{ item.dau }}万</span
            >
            <span v-else-if="showField === 'adSpend' && item.adSpend" class="app-dau"
              >买量 {{ item.activeCampaigns ?? '-' }}个</span
            >
          </div>
        </div>
      </template>
    </div>

    <!-- Footer -->
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

  const sortedApps = computed(() => {
    const overall = props.appList.filter((a) => a.isOverall)
    const rest = props.appList.filter((a) => !a.isOverall)
    const sorted = [...rest].sort((a, b) => {
      const va = props.showField === 'adSpend' ? (a.adSpend ?? 0) : a.revenue
      const vb = props.showField === 'adSpend' ? (b.adSpend ?? 0) : b.revenue
      return sortDir.value === 'desc' ? vb - va : va - vb
    })
    return [...overall, ...sorted]
  })

  const sparkData = [3800, 4000, 3900, 4200, 4100, 4350, 4400, 4521]

  const formatRevenue = (v: number) => {
    if (v >= 1_000_000) return (v / 1_000_000).toFixed(2) + 'M'
    if (v >= 1000) return (v / 1000).toFixed(0) + ',000'
    return v.toString()
  }

  const valueColor = (change: number) => (change >= 0 ? '#00D4A1' : '#FF5C5C')
</script>

<style scoped>
  .app-sidebar {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden auto;

    /* width: 240px;
  min-width: 220px;
  max-width: 260px; */
    background: var(--rp-surface, #0d1529);
    border-right: 1px solid var(--rp-border, rgb(255 255 255 / 6%));
    scrollbar-width: thin;
    scrollbar-color: rgb(255 255 255 / 10%) transparent;
  }

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

  /* Scrollable list */
  .app-sidebar > .app-item,
  .app-sidebar > .overall-item {
    flex-shrink: 0;
  }

  .app-item {
    position: relative;
    padding: 10px 14px;
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

  .app-item.overall {
    margin-bottom: 4px;
    border-bottom: 1px solid rgb(255 255 255 / 6%);
  }

  .overall-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .overall-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .overall-info {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .overall-name {
    font-size: 13px;
    font-weight: 600;
    color: rgb(255 255 255 / 90%);
  }

  .overall-cat {
    font-size: 11px;
    font-weight: 400;
    color: rgb(255 255 255 / 40%);
  }

  .selected-badge {
    padding: 1px 5px;
    font-size: 9px;
    font-weight: 700;
    color: #00d4a1;
    letter-spacing: 0.05em;
    background: rgb(0 212 161 / 20%);
    border-radius: 4px;
  }

  .overall-value {
    display: flex;
    gap: 6px;
    align-items: baseline;
    font-size: 18px;
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .overall-change {
    font-size: 11px;
    font-weight: 500;
  }

  .overall-meta {
    font-size: 11px;
    color: rgb(255 255 255 / 40%);
  }

  .overall-platforms {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .platform-tag {
    padding: 1px 5px;
    font-size: 10px;
    color: rgb(255 255 255 / 50%);
    background: rgb(255 255 255 / 8%);
    border-radius: 3px;
  }

  .app-icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    font-size: 16px;
    border-radius: 8px;
  }

  .app-item:not(.overall) {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .app-info {
    flex: 1;
    min-width: 0;
  }

  .app-name-row {
    display: flex;
    gap: 4px;
    align-items: center;
    margin-bottom: 2px;
  }

  .app-name {
    overflow: hidden;
    font-size: 12px;
    font-weight: 600;
    color: rgb(255 255 255 / 85%);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .app-category {
    font-size: 10px;
    color: rgb(255 255 255 / 40%);
    white-space: nowrap;
  }

  .app-metrics {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .app-revenue {
    font-size: 13px;
    font-weight: 600;
  }

  .app-change {
    margin-left: 4px;
    font-size: 10px;
    font-weight: 500;
  }

  .app-dau {
    font-size: 10px;
    color: rgb(255 255 255 / 45%);
  }

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
