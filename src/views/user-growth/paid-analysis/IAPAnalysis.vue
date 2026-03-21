<template>
  <div class="iap-page">
    <!-- Header -->
    <header class="iap-header">
      <div class="breadcrumb">
        <span class="bc-parent">商业洞察</span>
        <span class="bc-sep"> &rsaquo; </span>
        <span class="bc-current">IAP分析</span>
      </div>
      <div class="header-filters">
        <div class="filter-item">
          <span class="filter-label">App:</span>
          <el-select v-model="filters.app" size="small" class="filter-sel">
            <el-option label="全部" value="all" />
            <el-option label="Weather5" value="weather5" />
            <el-option label="PhoneTracker" value="phonetracker" />
            <el-option label="YearCam" value="yearcam" />
            <el-option label="AgeCam" value="agecam" />
          </el-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">Platform:</span>
          <el-select v-model="filters.platform" size="small" class="filter-sel">
            <el-option label="Android&iOS" value="all" />
            <el-option label="iOS" value="ios" />
            <el-option label="Android" value="android" />
          </el-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">Country:</span>
          <el-select v-model="filters.country" size="small" class="filter-sel">
            <el-option label="全部" value="all" />
            <el-option label="US" value="us" />
            <el-option label="KR" value="kr" />
            <el-option label="DE" value="de" />
            <el-option label="JP" value="jp" />
          </el-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">Date:</span>
          <el-date-picker
            v-model="filters.date"
            type="date"
            size="small"
            class="filter-date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </div>
        <el-button class="export-btn" size="small">导出</el-button>
      </div>
    </header>

    <!-- Tab Navigation -->
    <nav class="tab-nav">
      <div
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-btn"
        :class="{ 'tab-active': activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </div>
    </nav>

    <!-- Tab Content -->
    <main class="tab-body">
      <IAPChannelTab v-if="activeTab === 'channel'" />
      <IAPProductTab v-if="activeTab === 'product'" />
      <IAPOrderTab v-if="activeTab === 'order'" />
    </main>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import IAPChannelTab from './IAPChannelTab.vue'
  import IAPProductTab from './IAPProductTab.vue'
  import IAPOrderTab from './IAPOrderTab.vue'

  const activeTab = ref<string>('channel')

  const tabs = [
    { key: 'channel', label: '渠道IAP转化' },
    { key: 'product', label: '商品分析' },
    { key: 'order', label: '订单明细' }
  ]

  const filters = ref({
    app: 'all',
    platform: 'all',
    country: 'all',
    date: '2026-03-05'
  })
</script>

<style scoped>
  .iap-page {
    min-height: 100vh;
    font-family: 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
    font-size: 14px;
    color: #e2e8f5;
    background: #0b0e1a;
  }

  /* ── Header ──────────────────────────────────── */
  .iap-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 52px;
    padding: 0 24px;
    background: #0d1120;
    border-bottom: 1px solid #1a2240;
  }

  .breadcrumb {
    display: flex;
    align-items: center;
    font-size: 15px;
  }

  .bc-parent {
    color: #5a6a8a;
  }

  .bc-sep {
    margin: 0 6px;
    font-size: 16px;
    color: #3a4a66;
  }

  .bc-current {
    font-weight: 600;
    color: #e2e8f5;
  }

  .header-filters {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .filter-item {
    display: flex;
    gap: 4px;
    align-items: center;
    height: 30px;
    padding: 0 8px 0 10px;
    background: #151c30;
    border: 1px solid #1e2a44;
    border-radius: 6px;
  }

  .filter-label {
    font-size: 12px;
    color: #8892a8;
    white-space: nowrap;
  }

  .export-btn {
    height: 30px;
    padding: 0 16px;
    font-weight: 700;
    color: #0b0e1a !important;
    background: #22d3ee !important;
    border-color: #22d3ee !important;
    border-radius: 6px;
  }

  /* ── Tab Nav ──────────────────────────────────── */
  .tab-nav {
    display: flex;
    padding: 0 24px;
    background: #0d1120;
    border-bottom: 1px solid #1a2240;
  }

  .tab-btn {
    padding: 14px 20px 12px;
    font-size: 14px;
    color: #5a6a8a;
    cursor: pointer;
    user-select: none;
    border-bottom: 2px solid transparent;
    transition: all 0.2s ease;
  }

  .tab-btn:hover {
    color: #a0aec0;
  }

  .tab-active {
    color: #22d3ee !important;
    border-bottom-color: #22d3ee !important;
  }

  /* ── Tab Body ──────────────────────────────────── */
  .tab-body {
    padding: 16px 24px 24px;
    overflow-x: auto;
  }

  /* ── Element Plus overrides ──────────────────── */
  :deep(.filter-sel .el-input__wrapper),
  :deep(.filter-date .el-input__wrapper) {
    padding: 0;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
  }

  :deep(.filter-sel .el-input__inner),
  :deep(.filter-date .el-input__inner) {
    font-size: 12px;
    color: #e2e8f5 !important;
  }

  :deep(.filter-sel .el-select__caret),
  :deep(.filter-date .el-input__prefix) {
    color: #5a6a8a !important;
  }

  :deep(.filter-date) {
    width: 110px;
  }

  :deep(.el-select-dropdown) {
    background: #151c30 !important;
    border: 1px solid #1e2a44 !important;
  }

  :deep(.el-select-dropdown__item) {
    color: #a0b0cc !important;
  }

  :deep(.el-select-dropdown__item.is-selected) {
    color: #22d3ee !important;
  }

  :deep(.el-select-dropdown__item:hover) {
    background: #1e2a44 !important;
  }
</style>
