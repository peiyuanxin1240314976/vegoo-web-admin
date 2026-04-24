<template>
  <div class="iap-analysis-page art-full-height flex flex-col min-h-0">
    <div class="iap-page-fx" aria-hidden="true"></div>
    <header class="iap-analysis-page__section--filters iap-entry-1">
      <div class="iap-filters-inner">
        <div class="iap-filters-row">
          <div class="iap-filter-chip iap-filter-chip--static">
            <ElIcon class="iap-filter-chip__icon"><Calendar /></ElIcon>
            <span class="iap-filter-chip__label">日期</span>
            <span class="iap-filter-chip__value">{{ dateChipText }}</span>
          </div>
          <AppDatePicker
            v-model="filters.date"
            type="date"
            :shortcuts="dateShortcuts"
            value-format="YYYY-MM-DD"
            format="YYYY-MM-DD"
            placeholder="选择日期"
            class="iap-filter-date"
          />
          <AppPlatformSearchSelect
            v-model="filters.appId"
            mode="app"
            placeholder="应用"
            search-placeholder="应用"
            class="iap-filter-select iap-filter-select--app"
            input-class="iap-filter-select__input"
            :setting-apps="settingAppsForSelect"
            :height="36"
            :min-width="150"
            :max-width="240"
          />
          <ElSelect
            v-model="filters.country"
            placeholder="国家"
            class="iap-filter-select"
            :prefix-icon="Flag"
          >
            <ElOption
              v-for="opt in countrySelectOptions"
              :key="opt.value === '' ? '__all_country__' : opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </ElSelect>
          <div class="iap-filter-actions">
            <ElButton type="primary" plain round @click="handleSearch">搜索</ElButton>
            <!-- <ElButton type="primary" plain round @click="onExportClick">导出</ElButton> -->
          </div>
        </div>
      </div>
    </header>

    <nav class="iap-tab-nav iap-entry-1" role="tablist" aria-label="付费分析">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        role="tab"
        class="iap-tab-btn"
        :class="{ 'is-active': activeTab === tab.key }"
        :aria-selected="activeTab === tab.key"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </nav>

    <main class="iap-tab-body iap-entry-2 flex flex-1 flex-col min-h-0 min-w-0">
      <div v-if="bootLoading" class="iap-boot-skeleton" aria-busy="true" aria-label="加载中">
        <div class="iap-sk-kpis">
          <div v-for="i in 5" :key="i" class="iap-sk-kpi">
            <ElSkeleton animated :throttle="0">
              <template #template>
                <ElSkeletonItem variant="text" style="width: 56%; margin-bottom: 12px" />
                <ElSkeletonItem variant="h3" style="width: 72%; margin-bottom: 8px" />
                <ElSkeletonItem variant="text" style="width: 40%" />
              </template>
            </ElSkeleton>
          </div>
        </div>
        <ElSkeleton animated :throttle="0">
          <template #template>
            <ElSkeletonItem variant="h3" style="width: 32%; margin-bottom: 16px" />
            <ElSkeletonItem
              variant="rect"
              style="width: 100%; height: 220px; margin-bottom: 12px"
            />
            <ElSkeletonItem variant="rect" style="width: 100%; height: 160px" />
          </template>
        </ElSkeleton>
      </div>
      <template v-else>
        <IAPChannelTab
          v-if="activeTab === 'channel'"
          :key="`channel-${searchToken}`"
          class="iap-tab-panel"
          :filters="appliedFilters"
          :search-token="searchToken"
        />
        <IAPProductTab
          v-if="activeTab === 'product'"
          :key="`product-${searchToken}`"
          class="iap-tab-panel"
          :filters="appliedFilters"
          :search-token="searchToken"
        />
        <IAPOrderTab
          v-if="activeTab === 'order'"
          :key="`order-${searchToken}`"
          class="iap-tab-panel"
          :filters="appliedFilters"
          :search-token="searchToken"
        />
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
  import AppDatePicker from '@/components/core/forms/AppDatePicker.vue'
  import { Calendar, Flag } from '@element-plus/icons-vue'
  import { storeToRefs } from 'pinia'
  import AppPlatformSearchSelect from '@/components/filter/app-platform-search-select.vue'
  import { getAppTodayYYYYMMDD } from '@/utils/app-now'
  import { dateShortcuts } from '@/utils/form/date-shortcuts'
  import { useCockpitMetaFilterStore } from '@/store/modules/cockpit-meta-filter'
  import type { CockpitMetaOptionItem, CockpitSettingAppItem } from '@/types/cockpit-meta-filter'
  import IAPChannelTab from './IAPChannelTab.vue'
  import IAPProductTab from './IAPProductTab.vue'
  import IAPOrderTab from './IAPOrderTab.vue'

  defineOptions({ name: 'IAPAnalysis' })

  const metaStore = useCockpitMetaFilterStore()
  const { data: cockpitMeta } = storeToRefs(metaStore)

  function fallbackOptions(label: string): CockpitMetaOptionItem[] {
    return [{ label, value: '' }]
  }

  const appSelectOptions = computed(() => {
    const list = cockpitMeta.value?.appOptions
    return list?.length ? list : fallbackOptions('全部')
  })
  const countrySelectOptions = computed(() => {
    const list = cockpitMeta.value?.countryOptions
    return list?.length ? list : fallbackOptions('全部')
  })
  const settingAppsForSelect = computed<CockpitSettingAppItem[]>(() => {
    const fromCockpit = cockpitMeta.value?.settingApps ?? []
    if (fromCockpit.length) return fromCockpit

    return appSelectOptions.value
      .filter((opt) => opt.value !== '')
      .map((opt, index) => ({
        sAppId: String(opt.value ?? ''),
        nPlatform: '',
        platformName: '',
        sAppName: String(opt.label ?? ''),
        sAppShortName: String(opt.label ?? ''),
        nCategory: `fallback-${index}`,
        categoryName: '应用'
      }))
  })

  const activeTab = ref<'channel' | 'product' | 'order'>('channel')

  const tabs = [
    { key: 'channel' as const, label: '广告平台 IAP 转化' },
    { key: 'product' as const, label: '商品分析' },
    { key: 'order' as const, label: '订单明细' }
  ]

  const filters = reactive({
    appId: [] as string[],
    platform: '',
    country: '',
    date: getAppTodayYYYYMMDD()
  })

  const appliedFilters = ref<{ appId: string[]; platform: string; country: string; date: string }>({
    ...filters
  })
  const searchToken = ref(0)
  const hasSyncedInitialAutoApp = ref(false)

  const dateChipText = computed(() => filters.date || '-')

  const bootLoading = ref(true)
  let bootTimer: ReturnType<typeof setTimeout> | null = null

  onMounted(() => {
    void metaStore.ensureLoaded()
    bootTimer = setTimeout(() => {
      bootLoading.value = false
      bootTimer = null
    }, 420)
  })

  onBeforeUnmount(() => {
    if (bootTimer != null) clearTimeout(bootTimer)
  })

  function handleSearch() {
    appliedFilters.value = { ...filters }
    searchToken.value += 1
    bootLoading.value = true
    if (bootTimer != null) clearTimeout(bootTimer)
    bootTimer = setTimeout(() => {
      bootLoading.value = false
      bootTimer = null
    }, 260)
  }

  watch(
    () => filters.appId,
    (appId) => {
      // AppPlatformSearchSelect 会自动选首个应用；首屏把该值同步到 appliedFilters 并触发一次查询。
      if (hasSyncedInitialAutoApp.value) return
      if (Array.isArray(appId) ? appId.length === 0 : !appId) return
      hasSyncedInitialAutoApp.value = true
      handleSearch()
    }
  )

  // function onExportClick() {
  //   // 占位，保留原交互
  // }
</script>

<style scoped lang="scss">
  @use './styles/iap-analysis-page.scss' as *;

  .iap-filters-inner {
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

  .iap-filters-row {
    display: flex;
    flex: 1;
    flex-wrap: wrap;
    gap: 10px 12px;
    align-items: center;
    min-width: 0;
  }

  .iap-filter-chip {
    display: inline-flex;
    gap: 7px;
    align-items: center;
    min-height: 36px;
    padding: 0 14px;
    white-space: nowrap;
    background: color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 6%, transparent);
    border: 1px solid var(--theme-color, var(--art-primary, #3b82f6));
    border-radius: var(--el-border-radius-base, 4px);
    box-shadow: 0 0 16px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 10%, transparent);
  }

  .iap-filter-chip__icon {
    font-size: 16px;
    color: var(--theme-color, var(--art-primary, #3b82f6));
  }

  .iap-filter-chip__label {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .iap-filter-chip__value {
    font-size: 13px;
    font-weight: 600;
    color: var(--theme-color, var(--art-primary, #3b82f6));
  }

  .iap-filter-date {
    flex: 0 1 160px;
    width: 160px;
    min-width: 140px;
  }

  :deep(.iap-filter-date.el-date-editor) {
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

  :deep(.iap-filter-date .el-input__wrapper) {
    padding: 0;
    background: transparent !important;
    border: none !important;
    border-radius: 0 !important;
    box-shadow: none !important;
  }

  :deep(.iap-filter-date.el-date-editor.is-active),
  :deep(.iap-filter-date .el-input__wrapper.is-focus) {
    background: color-mix(
      in srgb,
      var(--theme-color, var(--art-primary, #3b82f6)) 6%,
      transparent
    ) !important;
    border-color: var(--theme-color, var(--art-primary, #3b82f6)) !important;
    box-shadow: 0 0 0 2px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 18%, transparent) !important;
  }

  :deep(.iap-filter-date:hover) {
    border-color: var(--theme-color, var(--art-primary, #3b82f6)) !important;
    box-shadow: 0 0 0 1px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 14%, transparent) !important;
  }

  :deep(.iap-filter-date .el-input__inner) {
    font-size: 13px;
    color: var(--el-text-color-primary);
  }

  :deep(.iap-filter-date .el-input__prefix-inner),
  :deep(.iap-filter-date .el-input__icon) {
    color: var(--theme-color, var(--art-primary, #3b82f6));
  }

  .iap-filter-select {
    width: 150px;
    min-width: 120px;
    max-width: 100%;
  }

  .iap-filter-select--app {
    width: 150px;
    min-width: 150px;
    max-width: 240px;
  }

  :deep(.iap-filter-select) {
    --el-input-focus-border-color: var(--theme-color, var(--art-primary, #3b82f6));
    --el-border-color-hover: var(--theme-color, var(--art-primary, #3b82f6));
    --el-color-primary: var(--theme-color, var(--art-primary, #3b82f6));
    --el-border-color-focus: var(--theme-color, var(--art-primary, #3b82f6));
    --el-border-color: var(--theme-color, var(--art-primary, #3b82f6));
    --el-component-size: 36px;
  }

  :deep(.iap-filter-select .el-select__wrapper),
  :deep(.iap-filter-select .el-input__wrapper),
  :deep(.iap-filter-select__input) {
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

  :deep(.iap-filter-select .el-input__inner) {
    font-size: 14px;
    color: var(--el-text-color-primary);
  }

  :deep(.iap-filter-select .el-input__prefix-inner svg),
  :deep(.iap-filter-select__input .app-platform-search-select__suffix) {
    width: 16px;
    height: 16px;
    color: var(--theme-color, var(--art-primary, #3b82f6));
  }

  :deep(.iap-filter-select .el-select__caret) {
    color: var(--theme-color, var(--art-primary, #3b82f6));
  }

  :deep(.iap-filter-select .el-select__wrapper.is-focused),
  :deep(.iap-filter-select .el-input__wrapper.is-focus),
  :deep(.iap-filter-select__input.is-open) {
    background: color-mix(
      in srgb,
      var(--theme-color, var(--art-primary, #3b82f6)) 6%,
      transparent
    ) !important;
    border-color: var(--theme-color, var(--art-primary, #3b82f6)) !important;
    box-shadow: 0 0 0 2px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 18%, transparent) !important;
  }

  :deep(.iap-filter-select .el-select__wrapper:hover),
  :deep(.iap-filter-select .el-input__wrapper:hover),
  :deep(.iap-filter-select__input:hover) {
    border-color: var(--theme-color, var(--art-primary, #3b82f6));
    box-shadow: 0 0 0 1px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 14%, transparent);
  }

  .iap-filter-actions {
    display: inline-flex;
    gap: 10px;
    align-items: center;
  }

  .iap-search-btn {
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

  .iap-tab-nav {
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

  .iap-tab-btn {
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

  .iap-tab-body {
    overflow-x: auto;
  }

  .iap-tab-panel {
    flex: 1;
    min-width: 0;
    min-height: 0;
  }

  .iap-boot-skeleton {
    padding: 4px 0 8px;
  }

  .iap-sk-kpis {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 12px;
    margin-bottom: 20px;
  }

  .iap-sk-kpi {
    padding: 14px 16px;
    background: rgb(10 10 14 / 55%);
    border: 1px solid rgb(96 165 250 / 18%);
    border-radius: 14px;
  }

  @media (width <= 1200px) {
    .iap-sk-kpis {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (width <= 768px) {
    .iap-filters-inner {
      padding: 14px 16px;
    }

    .iap-filter-select,
    .iap-filter-select--app {
      flex: 1 1 calc(50% - 6px);
      width: auto;
      min-width: 0;
      max-width: 100%;
    }

    .iap-filter-actions {
      width: 100%;
      margin-left: 0;
    }

    .iap-search-btn {
      width: 100%;
    }

    .iap-tab-nav {
      flex-direction: column;
      align-items: stretch;
      border-radius: 12px;
    }

    .iap-tab-btn {
      width: 100%;
    }
  }

  @media (width <= 1200px) {
    .iap-filters-inner {
      padding: 16px 18px;
    }

    .iap-filter-select {
      width: 150px;
    }

    .iap-filter-actions {
      flex: 1 1 100%;
      justify-content: flex-start;
    }
  }
</style>
