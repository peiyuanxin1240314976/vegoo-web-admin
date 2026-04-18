<template>
  <div class="or-analysis-page art-full-height flex flex-col min-h-0">
    <div class="or-page-fx" aria-hidden="true"></div>

    <div class="or-filters-wrap or-entry-1">
      <div class="or-filters-inner">
        <div class="or-filters-row">
          <ElDatePicker
            v-model="dateRangeModel"
            type="daterange"
            unlink-panels
            :shortcuts="dateShortcuts"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            :prefix-icon="Calendar"
            clearable
            class="or-filter-date"
            popper-class="or-filter-popper"
          />
          <AppPlatformSearchSelect
            v-model="filters.s_app_id"
            mode="app"
            placeholder="应用"
            search-placeholder="应用"
            class="or-filter-select or-filter-select--app"
            input-class="or-filter-select__input"
            :setting-apps="settingAppsForSelect"
            :height="36"
            :min-width="150"
            :max-width="240"
            dropdown-class="or-filter-popper"
          />
          <ElSelect
            v-model="filters.source"
            class="or-filter-select"
            :prefix-icon="Promotion"
            placeholder="广告平台"
            popper-class="or-filter-popper"
          >
            <ElOption
              v-for="opt in sourceOptions"
              :key="opt.value === '' ? '__or_all_src__' : opt.value"
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
              :key="opt.value === '' ? '__or_all_country__' : opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </ElSelect>
          <div class="or-filter-actions">
            <ElButton type="primary" plain round @click="handleSearch">查询</ElButton>
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
  import { Calendar, Flag, Promotion } from '@element-plus/icons-vue'
  import AppPlatformSearchSelect from '@/components/filter/app-platform-search-select.vue'
  import type { CockpitMetaOptionItem, CockpitSettingAppItem } from '@/types/cockpit-meta-filter'
  import type { OverallRecoveryTabKey, OverallRecoveryFilterState } from './types'
  import { resolveDateRangeFromPreset } from './utils/buildApiParams'
  import { useOverallRecoveryFilters } from './composables/useOverallRecoveryFilters'
  import { dateRangeShortcuts } from '@/utils/form/date-shortcuts'
  import TabOverall from './modules/tab-overall.vue'
  import TabOrganic from './modules/tab-organic.vue'

  defineOptions({ name: 'OverallRecovery' })

  const tabList: { key: OverallRecoveryTabKey; label: string }[] = [
    { key: 'overall', label: '整体回收（整合用户回）' },
    { key: 'organic', label: '自然量分析' }
  ]

  const activeTab = ref<OverallRecoveryTabKey>('overall')

  const defaultRange = resolveDateRangeFromPreset('30d')
  const filters = reactive<OverallRecoveryFilterState>({
    startDate: defaultRange.startDate,
    endDate: defaultRange.endDate,
    s_app_id: '',
    source: '',
    s_country_code: ''
  })

  const appliedFilters = ref<OverallRecoveryFilterState>({ ...filters })
  const searchToken = ref(0)

  const { appOptions, sourceOptions, countryOptions, settingApps } = useOverallRecoveryFilters()
  const settingAppsForSelect = computed<CockpitSettingAppItem[]>(() => {
    if (settingApps.value.length) return settingApps.value
    return appOptions.value
      .filter((opt: CockpitMetaOptionItem) => opt.value !== '')
      .map((opt: CockpitMetaOptionItem, index: number) => ({
        sAppId: String(opt.value ?? ''),
        nPlatform: '',
        platformName: '',
        sAppName: String(opt.label ?? ''),
        sAppShortName: String(opt.label ?? ''),
        nCategory: `fallback-${index}`,
        categoryName: '应用'
      }))
  })

  const dateRangeModel = computed<[string, string] | null>({
    get() {
      if (!filters.startDate || !filters.endDate) return null
      return [filters.startDate, filters.endDate]
    },
    set(v) {
      if (v?.[0] && v?.[1]) {
        filters.startDate = v[0]
        filters.endDate = v[1]
        return
      }
      const d = resolveDateRangeFromPreset('30d')
      filters.startDate = d.startDate
      filters.endDate = d.endDate
    }
  })

  const dateShortcuts = dateRangeShortcuts

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
  @use './styles/or-analysis-page.scss' as *;

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
    --el-button-size: 36px;

    height: 36px;
    padding: 0 20px;
    font-size: 14px;
    color: var(--theme-color, var(--art-primary, #3b82f6));
    background: color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 6%, transparent);
    border: 1px solid var(--theme-color, var(--art-primary, #3b82f6));
    border-radius: var(--el-border-radius-base, 4px);
    box-shadow: 0 0 18px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 20%, transparent);
    transition: box-shadow 0.22s ease;

    &:hover {
      background: color-mix(
        in srgb,
        var(--theme-color, var(--art-primary, #3b82f6)) 8%,
        transparent
      );
      box-shadow: 0 0 26px
        color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 28%, transparent);
    }
  }

  .or-filter-date {
    flex: 0 0 auto;
    width: 320px;
    min-width: 0;
    max-width: 100%;
  }

  :deep(.or-filter-date.el-date-editor) {
    flex: 0 0 auto;
    width: 320px;
    max-width: 100%;

    --el-input-focus-border-color: var(--theme-color, var(--art-primary, #3b82f6));
    --el-border-color-hover: var(--theme-color, var(--art-primary, #3b82f6));
    --el-color-primary: var(--theme-color, var(--art-primary, #3b82f6));
    --el-border-color-focus: var(--theme-color, var(--art-primary, #3b82f6));
    --el-border-color: var(--theme-color, var(--art-primary, #3b82f6));
    --el-component-size: 36px;
  }

  :deep(.or-filter-date .el-range__icon) {
    font-size: 16px;
    color: var(--theme-color, var(--art-primary, #3b82f6));
  }

  :deep(.or-filter-date .el-range-input) {
    font-size: 14px;
    color: var(--el-text-color-primary);
  }

  :deep(.or-filter-date .el-range-separator) {
    color: var(--el-text-color-secondary);
  }

  :deep(.or-filter-date .el-range__close-icon) {
    color: var(--theme-color, var(--art-primary, #3b82f6));
  }

  :deep(.or-filter-date.el-date-editor .el-range-input) {
    width: 42%;
  }

  :deep(.or-filter-date .el-input__wrapper) {
    min-height: 36px;
    padding: 0 12px;
    background: color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 6%, transparent);
    border: 1px solid var(--theme-color, var(--art-primary, #3b82f6));
    border-radius: var(--el-border-radius-base, 4px);
    box-shadow: none;
    transition:
      border-color 0.22s ease,
      box-shadow 0.22s ease,
      background 0.22s ease;
  }

  :deep(.or-filter-date .el-input__wrapper.is-focus) {
    background: color-mix(
      in srgb,
      var(--theme-color, var(--art-primary, #3b82f6)) 6%,
      transparent
    ) !important;
    border-color: var(--theme-color, var(--art-primary, #3b82f6)) !important;
    box-shadow: 0 0 0 2px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 18%, transparent) !important;
  }

  :deep(.or-filter-date .el-input__wrapper:hover) {
    border-color: var(--theme-color, var(--art-primary, #3b82f6));
    box-shadow: 0 0 0 1px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 14%, transparent);
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

  .or-filter-select--app {
    width: 150px;
    min-width: 150px;
    max-width: 240px;
  }

  :deep(.or-filter-select) {
    --el-input-focus-border-color: var(--theme-color, var(--art-primary, #3b82f6));
    --el-border-color-hover: var(--theme-color, var(--art-primary, #3b82f6));
    --el-color-primary: var(--theme-color, var(--art-primary, #3b82f6));
    --el-border-color-focus: var(--theme-color, var(--art-primary, #3b82f6));
    --el-border-color: var(--theme-color, var(--art-primary, #3b82f6));
    --el-component-size: 36px;
  }

  :deep(.or-filter-select .el-select__wrapper),
  :deep(.or-filter-select__input) {
    min-height: 36px;
    padding: 0 12px;
    background: color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 6%, transparent);
    border: 1px solid var(--theme-color, var(--art-primary, #3b82f6));
    border-radius: var(--el-border-radius-base, 4px);
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
    color: var(--theme-color, var(--art-primary, #3b82f6));
  }

  :deep(.or-filter-select .el-select__caret),
  :deep(.or-filter-select__input .app-platform-search-select__suffix) {
    color: var(--theme-color, var(--art-primary, #3b82f6));
  }

  :deep(.or-filter-select .el-select__wrapper.is-focused),
  :deep(.or-filter-select__input.is-open) {
    background: color-mix(
      in srgb,
      var(--theme-color, var(--art-primary, #3b82f6)) 6%,
      transparent
    ) !important;
    border-color: var(--theme-color, var(--art-primary, #3b82f6)) !important;
    box-shadow: 0 0 0 2px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 18%, transparent) !important;
  }

  :deep(.or-filter-select .el-select__wrapper:hover),
  :deep(.or-filter-select__input:hover) {
    border-color: var(--theme-color, var(--art-primary, #3b82f6));
    box-shadow: 0 0 0 1px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 14%, transparent);
  }

  .or-tab-nav {
    display: flex;
    flex-shrink: 0;
    flex-wrap: wrap;
    gap: 8px;
    padding: 4px;
    margin-bottom: 16px;
    background: color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 6%, transparent);
    border: 1px solid var(--theme-color, var(--art-primary, #3b82f6));
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
      color: var(--theme-color, var(--art-primary, #3b82f6));
      background: color-mix(
        in srgb,
        var(--theme-color, var(--art-primary, #3b82f6)) 12%,
        transparent
      );
    }

    &.is-active {
      font-weight: 700;
      color: var(--theme-color, var(--art-primary, #3b82f6));
      background: color-mix(
        in srgb,
        var(--theme-color, var(--art-primary, #3b82f6)) 18%,
        transparent
      );
      box-shadow: 0 0 0 1px
        color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 45%, transparent) inset;
    }

    &:focus-visible {
      box-shadow: 0 0 0 2px
        color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 45%, transparent);
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

    .or-filter-date {
      flex: 1 1 100%;
      width: 100%;
    }

    :deep(.or-filter-date.el-date-editor) {
      width: 100%;
    }

    .or-filter-select,
    .or-filter-select--wide,
    .or-filter-select--app {
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
  .or-filter-popper.el-popper {
    z-index: var(--z-dropdown) !important;
    background: rgb(10 10 14 / 96%) !important;
    border: 1px solid var(--theme-color, var(--art-primary, #3b82f6)) !important;
    border-radius: 12px !important;
    box-shadow:
      0 16px 48px rgb(0 0 0 / 55%),
      0 0 0 1px color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 12%, transparent),
      0 0 32px rgb(59 130 246 / 15%) !important;
  }

  .or-filter-popper .el-popper__arrow::before {
    background: rgb(10 10 14 / 96%) !important;
    border: 1px solid var(--theme-color, var(--art-primary, #3b82f6)) !important;
  }
</style>
