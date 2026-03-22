<script setup lang="ts">
  /**
   * ReviewMonitorPage.vue
   * 评论与评分监控 - 页面容器
   *
   * 直接注册到 vue-router，或嵌入业务页面即可
   * router: { path: '/shop/review-monitor', component: ReviewMonitorPage }
   */
  import { ref, reactive, computed } from 'vue'
  import ReviewMonitorSummary from './components/ReviewMonitorSummary.vue'
  import ReviewMonitorDetail from './components/ReviewMonitorDetail.vue'
  import type { GlobalFilter } from './api/reviewMonitor'

  // ─────────────────────────────────────────────
  // 全局过滤条件（传给两个子 Tab）
  // ─────────────────────────────────────────────
  const filters = reactive<GlobalFilter>({
    appId: '',
    platform: '',
    startDate: '2026-02-28',
    endDate: '2026-03-06',
    language: ''
  })

  // ─────────────────────────────────────────────
  // Tab 状态
  // ─────────────────────────────────────────────
  const activeTab = ref<'summary' | 'detail'>('summary')

  // ─────────────────────────────────────────────
  // 应用下拉选项（实际项目中从接口获取）
  // ─────────────────────────────────────────────
  const appOptions = [
    { label: '全部应用', value: '' },
    { label: 'ClapFinder', value: 'app_001' },
    { label: 'CRMonitor', value: 'app_002' },
    { label: 'Weather5', value: 'app_003' },
    { label: 'WeatherS', value: 'app_004' },
    { label: 'PhoneTracker', value: 'app_005' },
    { label: 'VideoDominos', value: 'app_006' }
  ]

  const platformOptions = [
    { label: 'Google Play / App Store', value: '' },
    { label: 'Google Play', value: 'google_play' },
    { label: 'App Store', value: 'app_store' }
  ]

  const languageOptions = [
    { label: '语言: 全部', value: '' },
    { label: '中文', value: 'zh' },
    { label: 'English', value: 'en' },
    { label: 'Español', value: 'es' }
  ]

  // 日期快捷选项
  const dateShortcuts = [
    {
      text: '最近 7 天',
      value: () => {
        const end = new Date()
        const start = new Date()
        start.setDate(start.getDate() - 6)
        return [start, end]
      }
    },
    {
      text: '最近 30 天',
      value: () => {
        const end = new Date()
        const start = new Date()
        start.setDate(start.getDate() - 29)
        return [start, end]
      }
    },
    {
      text: '本月',
      value: () => {
        const now = new Date()
        return [new Date(now.getFullYear(), now.getMonth(), 1), now]
      }
    }
  ]

  // daterange 双向绑定
  const dateRange = computed({
    get: () => (filters.startDate && filters.endDate ? [filters.startDate, filters.endDate] : []),
    set: (val: string[] | null) => {
      if (val && val.length === 2) {
        filters.startDate = val[0]
        filters.endDate = val[1]
      } else {
        filters.startDate = ''
        filters.endDate = ''
      }
    }
  })

  // ─────────────────────────────────────────────
  // 导出（占位，对接实际接口）
  // ─────────────────────────────────────────────
  function handleExport() {
    console.log('导出数据', filters)
    // 实际调用：reviewMonitorApi.exportData(filters)
  }

  // 总评论数（由 Detail 组件反向传值，这里用静态示例）
  const totalCount = ref(988)
</script>

<template>
  <div class="page-root reviews-ratings-page art-full-height">
    <!-- ── 顶部导航 & 全局过滤 ─────────────── -->
    <div class="page-header">
      <!-- 面包屑 -->
      <div class="breadcrumb">
        <span class="bc-parent">商店运营</span>
        <span class="bc-sep">›</span>
        <span class="bc-current">评论与评分监控</span>
      </div>

      <!-- 全局筛选器 -->
      <div class="global-filters">
        <!-- 应用选择 -->
        <el-select
          v-model="filters.appId"
          class="gf-select"
          size="small"
          popper-class="dark-popper"
        >
          <template #prefix>
            <span class="select-icon">⊞</span>
          </template>
          <el-option v-for="o in appOptions" :key="o.value" :label="o.label" :value="o.value" />
        </el-select>

        <!-- 平台选择 -->
        <el-select
          v-model="filters.platform"
          class="gf-select gf-platform"
          size="small"
          popper-class="dark-popper"
        >
          <template #prefix>
            <span class="select-icon">▶</span>
          </template>
          <el-option
            v-for="o in platformOptions"
            :key="o.value"
            :label="o.label"
            :value="o.value"
          />
        </el-select>

        <!-- 日期范围 -->
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          size="small"
          range-separator="–"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          class="gf-date"
          :shortcuts="dateShortcuts"
          popper-class="dark-popper"
        />

        <!-- 语言 -->
        <el-select
          v-model="filters.language"
          class="gf-select gf-lang"
          size="small"
          popper-class="dark-popper"
        >
          <template #prefix>
            <span class="select-icon">🌐</span>
          </template>
          <el-option
            v-for="o in languageOptions"
            :key="o.value"
            :label="o.label"
            :value="o.value"
          />
        </el-select>

        <!-- 导出 -->
        <el-button size="small" class="export-btn" @click="handleExport">
          <span>⬇</span> 导出
        </el-button>
      </div>
    </div>

    <!-- ── Tabs ────────────────────────────── -->
    <div class="tab-bar">
      <button
        :class="['tab-item', activeTab === 'summary' ? 'tab-active' : '']"
        @click="activeTab = 'summary'"
        >汇总分析</button
      >
      <button
        :class="['tab-item', activeTab === 'detail' ? 'tab-active' : '']"
        @click="activeTab = 'detail'"
      >
        明细列表
        <span class="tab-badge">{{ totalCount }}</span>
      </button>
    </div>

    <!-- ── Tab 内容区 ────────────────────────── -->
    <div class="tab-content">
      <transition name="tab-fade" mode="out-in">
        <ReviewMonitorSummary v-if="activeTab === 'summary'" :filters="filters" />
        <ReviewMonitorDetail v-else :filters="filters" @update:total="totalCount = $event" />
      </transition>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .page-root.reviews-ratings-page {
    display: flex;
    flex-direction: column;
    min-height: 0;
    font-family: 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', sans-serif;
    font-size: 13px;
    color: #e8eaed;
    background: #0d1117;
  }

  /* ── 页头 ─────────────────────────────────── */
  .page-header {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: space-between;
    height: 52px;
    padding: 0 20px;
    background: #0d1117;
    border-bottom: 1px solid #1e2a40;
  }

  .breadcrumb {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .bc-parent {
    font-size: 14px;
    color: #9ca3af;
  }

  .bc-sep {
    font-size: 14px;
    color: #4b5563;
  }

  .bc-current {
    font-size: 15px;
    font-weight: 600;
    color: #e8eaed;
  }

  /* ── 全局过滤器 ─────────────────────────────── */
  .global-filters {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .gf-select {
    :deep(.el-select__wrapper) {
      height: 30px;
      color: #e8eaed !important;
      background: #161b2e !important;
      border-color: #1e2a40 !important;
      box-shadow: none !important;
    }

    :deep(.el-select__placeholder),
    :deep(.el-select__selected-item) {
      font-size: 12px;
      color: #e8eaed !important;
    }

    :deep(.el-select__prefix) {
      color: #9ca3af;
    }
  }

  .gf-platform {
    width: 190px;
  }

  .gf-lang {
    width: 120px;
  }

  .select-icon {
    font-size: 13px;
  }

  .gf-date {
    :deep(.el-input__wrapper) {
      height: 30px;
      padding: 0 10px;
      background: #161b2e !important;
      border-color: #1e2a40 !important;
      box-shadow: none !important;
    }

    :deep(.el-input__inner) {
      font-size: 12px;
      color: #e8eaed !important;
    }

    :deep(.el-range-separator) {
      color: #9ca3af;
    }

    :deep(.el-range-input) {
      color: #e8eaed !important;
      background: transparent;
    }

    width: 220px;
  }

  .export-btn {
    height: 30px;
    font-size: 12px;
    color: #e8eaed;
    background: #161b2e;
    border-color: #1e2a40;
    transition: all 0.2s;

    &:hover {
      color: #00d4aa;
      background: #1e2a40;
      border-color: #00d4aa;
    }
  }

  /* ── Tab 栏 ─────────────────────────────────── */
  .tab-bar {
    display: flex;
    flex-shrink: 0;
    gap: 0;
    align-items: center;
    padding: 0 20px;
    background: #0d1117;
    border-bottom: 1px solid #1e2a40;
  }

  .tab-item {
    display: flex;
    gap: 6px;
    align-items: center;
    padding: 12px 16px;
    font-size: 13px;
    color: #9ca3af;
    cursor: pointer;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;

    &:hover {
      color: #e8eaed;
    }

    &.tab-active {
      font-weight: 600;
      color: #00d4aa;
      border-bottom-color: #00d4aa;
    }
  }

  .tab-badge {
    padding: 1px 6px;
    font-size: 11px;
    color: #9ca3af;
    background: #1e2a40;
    border-radius: 10px;

    .tab-active & {
      color: #00d4aa;
      background: rgb(0 212 170 / 15%);
    }
  }

  /* ── 内容区 ─────────────────────────────────── */
  .tab-content {
    position: relative;
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
  }

  /* Tab 切换动画 */
  .tab-fade-enter-active,
  .tab-fade-leave-active {
    position: absolute;
    width: 100%;
    transition: all 0.25s ease;
  }

  .tab-fade-enter-from {
    opacity: 0;
    transform: translateY(6px);
  }

  .tab-fade-leave-to {
    opacity: 0;
    transform: translateY(-4px);
  }
</style>

<!-- 全局覆盖 Element Plus 暗色下拉框 -->
<style>
  .dark-popper.el-select__popper {
    background: #1e2433 !important;
    border-color: #2a2d3a !important;
  }

  .dark-popper .el-select-dropdown__item {
    color: #c9d1d9 !important;
  }

  .dark-popper .el-select-dropdown__item.is-hovering,
  .dark-popper .el-select-dropdown__item:hover {
    color: #00d4aa !important;
    background: #2a3d5a !important;
  }

  .dark-popper .el-select-dropdown__item.is-selected {
    font-weight: 600;
    color: #00d4aa !important;
  }

  /* DatePicker 暗色 */
  .dark-popper.el-date-picker {
    color: #e8eaed !important;
    background: #161b2e !important;
    border-color: #2a2d3a !important;
  }

  .dark-popper .el-date-table th,
  .dark-popper .el-date-table td span {
    color: #9ca3af !important;
  }

  .dark-popper .el-date-table td.in-range div {
    background: rgb(0 212 170 / 10%) !important;
  }

  .dark-popper .el-date-table td.start-date div,
  .dark-popper .el-date-table td.end-date div {
    color: #0d1117 !important;
    background: #00d4aa !important;
  }
</style>
