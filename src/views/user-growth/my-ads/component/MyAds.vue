<script setup lang="ts">
  import { ref, computed } from 'vue'
  import SummaryTab from './SummaryTab.vue'
  import PlatformTab from './PlatformTab.vue'
  import CampaignTab from './CampaignTab.vue'
  import { MOCK_MY_ADS_PAGE_HEADER } from '../mock/data'

  defineOptions({ name: 'MyAdsPageContent' })

  const pageHeader = MOCK_MY_ADS_PAGE_HEADER
  const staffList = pageHeader.staffList

  const selectedStaffId = ref(pageHeader.defaultStaffId)

  const staffAvatarLetter = computed(() => {
    const name = staffList.find((s) => s.id === selectedStaffId.value)?.name ?? ''
    return name ? name[0]! : '—'
  })

  const dateRange = ref<[string, string]>(pageHeader.dateRange)

  const activeTab = ref<string>('summary')

  const tabs = [
    { key: 'summary', label: '汇总' },
    { key: 'platform', label: '应用+广告平台' },
    { key: 'campaign', label: '广告系列明细' }
  ] as const

  const userCard = pageHeader.userCard
  const metrics = pageHeader.metrics

  const handleTabClick = (key: 'summary' | 'platform' | 'campaign') => {
    activeTab.value = key
  }
</script>

<template>
  <div class="ads-root">
    <!-- ── 顶部标题栏 ── -->
    <div class="top-bar">
      <h1 class="page-title">我的广告</h1>
      <div class="top-actions filter-bar" aria-label="页面筛选">
        <div class="user-pill user-pill--select">
          <ElSelect
            v-model="selectedStaffId"
            class="filter-staff-select"
            popper-class="my-ads-filter-select-popper"
            :teleported="true"
          >
            <template #prefix>
              <span class="pill-avatar">{{ staffAvatarLetter }}</span>
            </template>
            <ElOption v-for="s in staffList" :key="s.id" :label="`人员: ${s.name}`" :value="s.id" />
          </ElSelect>
        </div>
        <div class="date-pill date-pill--range">
          <span class="date-icon" aria-hidden="true">📅</span>
          <span class="date-pill__prefix">期间:</span>
          <ElDatePicker
            v-model="dateRange"
            type="daterange"
            range-separator="~"
            start-placeholder="开始"
            end-placeholder="结束"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            class="filter-date-range"
            popper-class="my-ads-filter-date-popper"
            :teleported="true"
            :clearable="false"
          />
        </div>
        <button type="button" class="export-btn">导出报表</button>
      </div>
    </div>

    <!-- ── 用户信息卡 ── -->
    <div class="user-card">
      <div class="user-left">
        <div class="user-avatar">{{ userCard.avatarLetter }}</div>
        <div class="user-info">
          <div class="user-name">{{ userCard.name }}</div>
          <div class="user-role">{{ userCard.role }}</div>
          <div class="user-apps">{{ userCard.appsLine }}</div>
        </div>
      </div>
      <div class="user-metrics">
        <div v-for="m in metrics" :key="m.label" class="metric-item">
          <div class="metric-label">{{ m.label }}</div>
          <div class="metric-value" :style="{ color: m.valueColor }">{{ m.value }}</div>
          <div class="metric-sub" :style="{ color: m.subColor }">{{ m.sub }}</div>
        </div>
      </div>
    </div>

    <!-- ── Tabs ── -->
    <div class="tabs-nav">
      <div
        v-for="tab in tabs"
        :key="tab.key"
        :class="['tab-item', activeTab === tab.key ? 'active' : '']"
        @click="handleTabClick(tab.key)"
      >
        {{ tab.label }}
      </div>
    </div>

    <!-- ── Tab 内容 ── -->
    <div class="tab-content">
      <SummaryTab v-if="activeTab === 'summary'" />
      <PlatformTab v-else-if="activeTab === 'platform'" />
      <CampaignTab v-else-if="activeTab === 'campaign'" />
    </div>
  </div>
</template>

<style scoped>
  /* ── CSS 变量 ── */
  .ads-root {
    --bg-root: #080e1a;
    --bg-card: #0f1929;
    --bg-card2: #111c2d;
    --border: #1e2f45;
    --teal: #00d4aa;
    --teal-dim: rgb(0 212 170 / 15%);
    --yellow: #f59e0b;
    --orange: #f97316;
    --purple: #a78bfa;
    --red: #ef4444;
    --green: #10b981;
    --blue: #60a5fa;
    --text-primary: #e2e8f0;
    --text-secondary: #94a3b8;
    --text-dim: #64748b;

    box-sizing: border-box;
    min-height: 100vh;
    padding: 16px 20px;
    font-family: 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', sans-serif;
    font-size: 13px;
    color: var(--text-primary);
    background: var(--bg-root);
  }

  /* ── 顶部栏 ── */
  .top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .page-title {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #f1f5f9;
  }

  .top-actions {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .user-pill {
    display: flex;
    gap: 6px;
    align-items: center;
    padding: 5px 12px 5px 6px;
    font-size: 12px;
    font-weight: 600;
    color: #000;
    cursor: pointer;
    background: var(--teal);
    border-radius: 20px;
  }

  .user-pill--select {
    padding: 0;
    cursor: default;
  }

  .filter-staff-select {
    min-width: 168px;
  }

  .user-pill--select :deep(.el-select__wrapper) {
    gap: 6px;
    min-height: 32px;
    padding: 5px 28px 5px 6px;
    background: transparent;
    border: none;
    box-shadow: none;
  }

  .user-pill--select :deep(.el-select__wrapper.is-hovering),
  .user-pill--select :deep(.el-select__wrapper.is-focused) {
    box-shadow: none;
  }

  .user-pill--select :deep(.el-select__selected-item) {
    font-size: 12px;
    font-weight: 600;
    color: #000;
  }

  .user-pill--select :deep(.el-select__placeholder) {
    font-size: 12px;
    font-weight: 600;
    color: rgb(0 0 0 / 55%);
  }

  .user-pill--select :deep(.el-select__caret) {
    font-size: 10px;
    color: #000;
  }

  .pill-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    font-size: 11px;
    font-weight: 700;
    color: #fff;
    background: rgb(0 0 0 / 25%);
    border-radius: 50%;
  }

  .pill-caret {
    font-size: 10px;
  }

  .date-pill {
    display: flex;
    gap: 6px;
    align-items: center;
    padding: 5px 12px;
    font-size: 12px;
    color: var(--text-secondary);
    cursor: pointer;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 6px;
  }

  .date-pill--range {
    padding: 3px 10px 3px 12px;
    cursor: default;
  }

  .date-pill__prefix {
    flex-shrink: 0;
    font-size: 12px;
    color: var(--text-secondary);
  }

  .filter-date-range {
    flex: 1;
    width: 220px;
    min-width: 200px;
  }

  .date-pill--range :deep(.el-date-editor.el-date-editor--daterange) {
    --el-date-editor-width: 100%;
    --el-date-editor-daterange-width: 100%;

    flex: 1;
    min-width: 0;
  }

  .date-pill--range :deep(.el-date-editor .el-input__wrapper) {
    padding: 2px 4px;
    background: transparent;
    border: none;
    box-shadow: none;
  }

  .date-pill--range :deep(.el-date-editor .el-input__wrapper.is-focus) {
    box-shadow: none;
  }

  .date-pill--range :deep(.el-range-input) {
    font-size: 12px;
    color: var(--text-secondary);
  }

  .date-pill--range :deep(.el-range-separator) {
    flex: 0 0 auto;
    padding: 0 4px;
    font-size: 12px;
    color: var(--text-secondary);
  }

  .date-pill--range :deep(.el-range__icon) {
    display: none;
  }

  .date-pill--range :deep(.el-range__close-icon) {
    color: var(--text-dim);
  }

  .export-btn {
    padding: 7px 16px;
    font-size: 13px;
    font-weight: 600;
    color: #000;
    cursor: pointer;
    background: var(--teal);
    border: none;
    border-radius: 6px;
    transition: opacity 0.2s;
  }

  .export-btn:hover {
    opacity: 0.85;
  }

  /* ── 用户卡 ── */
  .user-card {
    position: relative;
    display: flex;
    gap: 24px;
    align-items: center;
    padding: 16px 20px;
    margin-bottom: 0;
    overflow: hidden;
    background: var(--bg-card);
    border: 1px solid var(--teal);
    border-radius: 10px;
  }

  .user-card::before {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 4px;
    content: '';
    background: var(--teal);
  }

  .user-left {
    display: flex;
    gap: 14px;
    align-items: center;
    min-width: 240px;
  }

  .user-avatar {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    font-size: 22px;
    font-weight: 700;
    color: #000;
    background: var(--teal);
    border-radius: 50%;
  }

  .user-name {
    font-size: 18px;
    font-weight: 700;
    color: #f1f5f9;
  }

  .user-role {
    margin-top: 2px;
    font-size: 12px;
    color: var(--text-secondary);
  }

  .user-apps {
    margin-top: 2px;
    font-size: 12px;
    color: var(--text-dim);
  }

  .user-metrics {
    display: flex;
    flex: 1;
    justify-content: space-around;
    padding-left: 24px;
    border-left: 1px solid var(--border);
  }

  .metric-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
    align-items: center;
  }

  .metric-label {
    font-size: 12px;
    color: var(--text-secondary);
  }

  .metric-value {
    font-size: 20px;
    font-weight: 700;
    line-height: 1.2;
  }

  .metric-sub {
    font-size: 11px;
  }

  /* ── Tabs ── */
  .tabs-nav {
    display: flex;
    gap: 0;
    margin-top: 16px;
    border-bottom: 1px solid var(--border);
  }

  .tab-item {
    padding: 10px 20px;
    margin-bottom: -1px;
    font-size: 14px;
    color: var(--text-secondary);
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
  }

  .tab-item:hover {
    color: var(--text-primary);
  }

  .tab-item.active {
    font-weight: 500;
    color: var(--teal);
    border-bottom-color: var(--teal);
  }

  /* ── Tab 内容区域 ── */
  .tab-content {
    padding-top: 16px;
  }
</style>

<style lang="scss">
  /* Teleport 到 body 的下拉/面板，与顶部深色条协调 */
  .my-ads-filter-select-popper.el-popper {
    background: #0f1929;
    border: 1px solid #1e2f45;
  }

  .my-ads-filter-select-popper .el-select-dropdown__item {
    font-size: 12px;
    color: #e2e8f0;
  }

  .my-ads-filter-select-popper .el-select-dropdown__item.is-hovering {
    background: rgb(0 212 170 / 12%);
  }

  .my-ads-filter-select-popper .el-select-dropdown__item.is-selected {
    font-weight: 600;
    color: #00d4aa;
  }

  .my-ads-filter-date-popper.el-popper {
    --el-datepicker-border-color: #1e2f45;
    --el-datepicker-text-color: #e2e8f0;
    --el-datepicker-off-text-color: #64748b;
    --el-datepicker-header-text-color: #e2e8f0;
    --el-datepicker-active-color: #00d4aa;
    --el-datepicker-hover-text-color: #00d4aa;

    background: #0f1929;
    border: 1px solid #1e2f45;
  }
</style>
