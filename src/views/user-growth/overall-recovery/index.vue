<template>
  <div class="or-analysis-page art-full-height flex flex-col min-h-0">
    <div class="or-page-fx" aria-hidden="true"></div>

    <div class="or-filters-wrap or-entry-1">
      <div class="or-filters-inner">
        <div class="or-filters-row">
          <div class="or-filter-chip or-filter-chip--static">
            <ElIcon class="or-filter-chip__icon"><Calendar /></ElIcon>
            <span class="or-filter-chip__label">统计周期</span>
            <span class="or-filter-chip__value">{{ dateRangeLabel }}</span>
          </div>
          <ElSelect
            v-model="filters.s_app_id"
            class="or-filter-select"
            :prefix-icon="Grid"
            placeholder="应用"
            popper-class="or-filter-popper"
          >
            <ElOption
              v-for="opt in appOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </ElSelect>
          <ElSelect
            v-model="filters.source"
            class="or-filter-select"
            :prefix-icon="Promotion"
            placeholder="广告平台"
            popper-class="or-filter-popper"
          >
            <ElOption
              v-for="opt in sourceOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </ElSelect>
          <ElSelect
            v-model="filters.s_country_code"
            class="or-filter-select or-filter-select--wide"
            :prefix-icon="Flag"
            placeholder="国家"
            filterable
            popper-class="or-filter-popper"
          >
            <ElOption
              v-for="opt in countryOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </ElSelect>
          <div class="or-filter-actions">
            <ElButton round class="or-search-btn" @click="handleSearch">检索</ElButton>
          </div>
        </div>
      </div>
    </div>

    <nav
      class="or-tab-nav or-entry-1"
      role="tablist"
      :aria-label="$t('menus.userGrowth.overallRecovery')"
    >
      <button
        v-for="t in tabList"
        :key="t.key"
        type="button"
        role="tab"
        class="or-tab-btn"
        :class="{ 'is-active': activeTab === t.key }"
        :aria-selected="activeTab === t.key"
        @click="activeTab = t.key"
      >
        {{ t.label }}
      </button>
    </nav>

    <main class="or-main or-entry-2 flex flex-1 flex-col min-h-0">
      <component
        :is="currentTabComponent"
        :key="`${activeTab}-${searchToken}`"
        :filter="appliedFilters"
        class="or-tab-root"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
  import type { Component } from 'vue'
  import { Calendar, Flag, Grid, Promotion } from '@element-plus/icons-vue'
  import type { OverallRecoveryTabKey, OverallRecoveryFilterState } from './types'
  import { useOverallRecoveryFilters } from './composables/useOverallRecoveryFilters'
  import TabOverall from './modules/tab-overall.vue'
  import TabOrganic from './modules/tab-organic.vue'

  defineOptions({ name: 'OverallRecovery' })

  const tabList: { key: OverallRecoveryTabKey; label: string }[] = [
    { key: 'overall', label: '整体回收（整合用户回）' },
    { key: 'organic', label: '自然量分析' }
  ]

  const activeTab = ref<OverallRecoveryTabKey>('overall')

  const filters = reactive<OverallRecoveryFilterState>({
    dateRange: '30d',
    s_app_id: 'all',
    source: 'all',
    s_country_code: 'all'
  })

  const appliedFilters = ref<OverallRecoveryFilterState>({ ...filters })
  const searchToken = ref(0)

  const { appOptions, sourceOptions, countryOptions } = useOverallRecoveryFilters()

  const dateRangeLabel = computed(() => {
    if (filters.dateRange === '30d') return '近30天'
    return filters.dateRange
  })

  const tabComponents: Record<OverallRecoveryTabKey, Component> = {
    overall: TabOverall,
    organic: TabOrganic
  }

  const currentTabComponent = computed(() => tabComponents[activeTab.value])

  function handleSearch() {
    appliedFilters.value = { ...filters }
    searchToken.value += 1
  }
</script>

<style scoped lang="scss">
  @import './styles/or-analysis-page';

  .or-filters-wrap {
    flex-shrink: 0;
    margin-bottom: 16px;
  }

  .or-filters-inner {
    display: flex;
    flex-wrap: wrap;
    gap: 14px 16px;
    align-items: center;
    justify-content: space-between;
    min-width: 0;
    padding: 18px 20px;
    background: rgb(10 10 14 / 82%);
    backdrop-filter: blur(12px);
    border: 1px solid rgb(96 165 250 / 20%);
    border-radius: 16px;
    box-shadow:
      0 8px 32px rgb(0 0 0 / 40%),
      inset 0 1px 0 rgb(186 230 253 / 10%),
      0 0 40px rgb(59 130 246 / 8%);
  }

  .or-filters-row {
    display: flex;
    flex: 1;
    flex-wrap: wrap;
    gap: 10px 12px;
    align-items: center;
    min-width: 0;
  }

  .or-filter-actions {
    display: inline-flex;
    gap: 10px;
    align-items: center;
  }

  .or-search-btn {
    --el-button-size: 40px;

    height: 40px;
    padding: 0 20px;
    font-size: 14px;
    color: var(--art-success);
    background: color-mix(in srgb, var(--art-success) 16%, transparent);
    border: 1px solid color-mix(in srgb, var(--art-success) 45%, transparent);
    box-shadow:
      0 0 18px color-mix(in srgb, var(--art-success) 20%, transparent),
      inset 0 1px 0 rgb(255 255 255 / 10%);
    transition:
      box-shadow 0.22s ease,
      transform 0.18s ease;

    &:hover {
      box-shadow:
        0 0 26px color-mix(in srgb, var(--art-success) 34%, transparent),
        inset 0 1px 0 rgb(255 255 255 / 16%);
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
    }
  }

  .or-filter-chip {
    display: inline-flex;
    gap: 7px;
    align-items: center;
    min-height: 40px;
    padding: 0 14px;
    white-space: nowrap;
    background: rgb(16 185 129 / 8%);
    border: 1px solid rgb(16 185 129 / 30%);
    border-radius: 9999px;
    box-shadow: 0 0 16px rgb(16 185 129 / 10%);
  }

  .or-filter-chip__icon {
    font-size: 16px;
    color: #10b981;
    filter: drop-shadow(0 0 6px rgb(16 185 129 / 55%));
  }

  .or-filter-chip__label {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .or-filter-chip__value {
    font-size: 13px;
    font-weight: 600;
    color: #10b981;
    text-shadow: 0 0 10px rgb(16 185 129 / 50%);
  }

  .or-filter-select {
    width: 150px;
    min-width: 120px;
    max-width: 100%;
  }

  .or-filter-select--wide {
    width: 180px;
    min-width: 140px;
  }

  :deep(.or-filter-select) {
    --el-input-focus-border-color: #10b981;
    --el-border-color-hover: rgb(16 185 129 / 75%);
    --el-color-primary: #10b981;
    --el-border-color-focus: #10b981;
    --el-component-size: 40px;
  }

  :deep(.or-filter-select .el-select__wrapper) {
    min-height: 40px;
    padding: 0 12px;
    background: rgb(16 185 129 / 6%);
    border: 1px solid rgb(16 185 129 / 28%);
    border-radius: 9999px;
    box-shadow: none;
    transition:
      border-color 0.22s ease,
      box-shadow 0.22s ease,
      background 0.22s ease;
  }

  :deep(.or-filter-select .el-select__selection) {
    flex-wrap: nowrap;
  }

  :deep(.or-filter-select .el-select__placeholder),
  :deep(.or-filter-select .el-select__selected-item) {
    font-size: 14px;
    color: var(--el-text-color-primary);
  }

  :deep(.or-filter-select .el-select__prefix) {
    margin-right: 4px;
  }

  :deep(.or-filter-select .el-select__prefix svg) {
    width: 16px;
    height: 16px;
    color: #10b981;
    filter: drop-shadow(0 0 5px rgb(16 185 129 / 50%));
  }

  :deep(.or-filter-select .el-select__caret) {
    color: #10b981;
  }

  :deep(.or-filter-select .el-select__wrapper.is-focused) {
    background: rgb(16 185 129 / 10%) !important;
    border-color: #10b981 !important;
    box-shadow: 0 0 0 2px rgb(16 185 129 / 20%) !important;
  }

  :deep(.or-filter-select .el-select__wrapper:hover) {
    border-color: rgb(16 185 129 / 60%);
    box-shadow: 0 0 12px rgb(16 185 129 / 18%);
  }

  .or-tab-nav {
    display: flex;
    flex-shrink: 0;
    flex-wrap: wrap;
    gap: 8px;
    padding: 4px;
    margin-bottom: 16px;
    background: color-mix(in srgb, var(--default-box-color) 75%, transparent);
    border: 1px solid color-mix(in srgb, var(--art-success) 35%, var(--default-border));
    border-radius: 9999px;
  }

  .or-tab-btn {
    min-width: 108px;
    height: 36px;
    padding: 0 20px;
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-secondary);
    touch-action: manipulation;
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: 9999px;
    outline: none;
    transition:
      background-color 0.15s ease,
      color 0.15s ease,
      box-shadow 0.15s ease;

    &:hover {
      color: var(--art-success);
      background: color-mix(in srgb, var(--art-success) 12%, transparent);
    }

    &.is-active {
      font-weight: 700;
      color: var(--art-success);
      background: color-mix(in srgb, var(--art-success) 18%, transparent);
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--art-success) 45%, transparent) inset;
    }

    &:focus-visible {
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--art-success) 45%, transparent);
    }
  }

  .or-main {
    overflow: auto;
  }

  .or-tab-root {
    min-height: 100%;
  }

  @media (width <= 768px) {
    .or-filters-inner {
      padding: 14px 16px;
    }

    .or-filter-select,
    .or-filter-select--wide {
      flex: 1 1 calc(50% - 6px);
    }

    .or-filter-actions {
      width: 100%;
      margin-left: 0;
    }

    .or-search-btn {
      width: 100%;
    }

    .or-tab-nav {
      flex-direction: column;
      align-items: stretch;
      border-radius: 12px;
    }

    .or-tab-btn {
      width: 100%;
    }
  }
</style>

<style lang="scss">
  /* 挂载在 body（popper），须非 scoped；避免下拉被内容遮挡 */
  .or-filter-popper.el-popper {
    z-index: var(--z-dropdown) !important;
    background: rgb(10 10 14 / 96%) !important;
    border: 1px solid rgb(96 165 250 / 28%) !important;
    border-radius: 12px !important;
    box-shadow:
      0 16px 48px rgb(0 0 0 / 55%),
      0 0 0 1px rgb(16 185 129 / 12%),
      0 0 32px rgb(59 130 246 / 15%) !important;
  }

  .or-filter-popper .el-popper__arrow::before {
    background: rgb(10 10 14 / 96%) !important;
    border: 1px solid rgb(96 165 250 / 25%) !important;
  }
</style>
