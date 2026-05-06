<template>
  <div class="iaa-analysis-page iaa-fx-page art-full-height">
    <div class="iaa-page-fx" aria-hidden="true"></div>
    <!-- 顶栏：面包屑 + 全局筛选 -->
    <header class="iaa-header iaa-entry-1">
      <div class="iaa-header__filters iaa-filter-panel">
        <div class="iaa-filter-field">
          <AppDatePicker
            v-model="filtersDraft.t_date"
            type="date"
            :shortcuts="dateShortcuts"
            value-format="YYYY-MM-DD"
            format="YYYY-MM-DD"
            class="iaa-filter-date"
            :teleported="true"
            popper-class="iaa-filter__popper"
            :clearable="false"
            :prefix-icon="Calendar"
          />
        </div>
        <div class="iaa-filter-field">
          <AppPlatformSearchSelect
            v-model="filtersDraft.s_app_id"
            mode="app"
            class="iaa-filter-select iaa-filter-select--app"
            input-class="iaa-filter-select__input"
            placeholder="应用"
            search-placeholder="应用"
            :setting-apps="settingAppsForSelect"
            :height="36"
            :min-width="200"
            :max-width="240"
            dropdown-class="iaa-filter__popper"
          />
        </div>
        <div class="iaa-filter-field">
          <ElSelect
            :model-value="filtersDraft.s_country_code"
            class="iaa-filter-select"
            popper-class="iaa-filter__popper"
            placeholder="国家"
            :teleported="true"
            :fit-input-width="true"
            filterable
            clearable
            @update:model-value="onCountryFilterUpdate"
          >
            <ElOption :label="tr('adPerformance.filterAll', '全部')" value="" />
            <ElOption
              v-for="opt in countryOptionsForSelect"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </ElSelect>
        </div>

        <ElButton type="primary" plain round class="iaa-query-btn" :icon="Search" @click="onQuery">
          查询
        </ElButton>
      </div>
    </header>

    <!-- Tab 栏 -->
    <nav class="iaa-tabs iaa-entry-2">
      <button
        v-for="t in tabList"
        :key="t.key"
        type="button"
        class="iaa-tab"
        :class="{ 'is-active': activeTab === t.key }"
        @click="activeTab = t.key"
      >
        {{ $t('menus.businessInsight.iaaTabs.' + t.key) }}
      </button>
    </nav>

    <!-- 主内容区：按 Tab 渲染对应模块 -->
    <main class="iaa-main">
      <div v-if="isMainSkeletonVisible" class="iaa-page-skeleton">
        <section class="iaa-kpi-grid">
          <article v-for="i in 4" :key="i" class="iaa-kpi iaa-kpi--sk">
            <ElSkeleton animated :throttle="0">
              <template #template>
                <div class="iaa-kpi-sk">
                  <ElSkeletonItem variant="text" class="iaa-kpi-sk__t" />
                  <ElSkeletonItem variant="text" class="iaa-kpi-sk__v" />
                  <ElSkeletonItem variant="text" class="iaa-kpi-sk__s" />
                </div>
              </template>
            </ElSkeleton>
          </article>
        </section>

        <section class="iaa-main-grid">
          <ElCard class="iaa-panel" shadow="never">
            <template #header><span>&nbsp;</span></template>
            <div class="iaa-chart-sk iaa-chart-sk--radar"></div>
          </ElCard>
          <ElCard class="iaa-panel" shadow="never">
            <template #header><span>&nbsp;</span></template>
            <div class="iaa-chart-sk iaa-chart-sk--bar"></div>
          </ElCard>
          <ElCard class="iaa-panel" shadow="never">
            <template #header><span>&nbsp;</span></template>
            <div class="iaa-list-sk">
              <div v-for="i in 6" :key="i" class="iaa-list-sk__row">
                <ElSkeleton animated :throttle="0">
                  <template #template>
                    <ElSkeletonItem variant="text" class="iaa-list-sk__t" />
                  </template>
                </ElSkeleton>
              </div>
            </div>
          </ElCard>
        </section>
      </div>

      <component v-else-if="effectiveFilter" :is="currentTabComponent" :filter="effectiveFilter" />
    </main>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, reactive, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { storeToRefs } from 'pinia'
  import { Calendar, Search } from '@element-plus/icons-vue'
  import AppPlatformSearchSelect from '@/components/filter/app-platform-search-select.vue'
  import { useCockpitMetaFilterStore } from '@/store/modules/cockpit-meta-filter'
  import AppDatePicker from '@/components/core/forms/AppDatePicker.vue'
  import { getAppTodayYYYYMMDD } from '@/utils/app-now'
  import { dateShortcuts } from '@/utils/form/date-shortcuts'
  import type { IaaTabKey, IaaFilterState } from './types'
  import type { CockpitSettingAppItem } from '@/types/cockpit-meta-filter'
  import { useIaaFilters } from './composables/useIaaFilters'
  import { provideIaaPageLoading } from './composables/useIaaPageLoading'
  import TabAdType from './modules/tab-ad-type.vue'
  import TabAdPlatform from './modules/tab-ad-platform.vue'
  import TabAdPlacement from './modules/tab-ad-placement.vue'
  import TabAdUnit from './modules/tab-ad-unit.vue'
  import TabCountry from './modules/tab-country.vue'
  import TabVersion from './modules/tab-version.vue'

  defineOptions({ name: 'IaaAnalysis' })

  const { t, te } = useI18n()
  const tr = (key: string, fallback: string) => (te(key) ? t(key) : fallback)

  const metaStore = useCockpitMetaFilterStore()
  const { data: cockpitMeta } = storeToRefs(metaStore)

  const tabList: { key: IaaTabKey }[] = [
    { key: 'adType' },
    { key: 'adPlatform' },
    { key: 'adPlacement' },
    { key: 'adUnit' },
    { key: 'country' },
    { key: 'version' }
  ]

  const activeTab = ref<IaaTabKey>('adType')

  const filtersDraft = reactive<IaaFilterState>({
    s_app_id: [],
    platform: 'all',
    s_country_code: '',
    t_date: getAppTodayYYYYMMDD()
  })

  function onCountryFilterUpdate(v: string | undefined | null) {
    filtersDraft.s_country_code = v ?? ''
  }

  const { appOptions, loading: filterOptionsLoading } = useIaaFilters()

  const countryOptionsForSelect = computed(() =>
    (cockpitMeta.value?.countryOptions ?? []).filter((o) => {
      const v = String(o.value ?? '')
        .trim()
        .toLowerCase()
      return v !== '' && v !== 'all'
    })
  )
  const settingAppsForSelect = computed<CockpitSettingAppItem[]>(() => {
    const fromCockpit = cockpitMeta.value?.settingApps ?? []
    if (fromCockpit.length) return fromCockpit

    return (cockpitMeta.value?.appOptions ?? [])
      .filter((opt) => opt.value && opt.value !== 'all')
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
  provideIaaPageLoading()
  void metaStore.ensureLoaded()

  const hasInitDefaultAppId = ref(false)
  watch(
    appOptions,
    (opts) => {
      if (hasInitDefaultAppId.value) return
      if (!opts?.length) return
      if (!opts[0]?.value) return

      filtersDraft.s_app_id = [opts[0].value]
      hasInitDefaultAppId.value = true
      onQuery()
    },
    { immediate: true }
  )

  const tabComponents: Record<IaaTabKey, typeof TabAdType> = {
    adType: TabAdType,
    adPlatform: TabAdPlatform,
    adPlacement: TabAdPlacement,
    adUnit: TabAdUnit,
    country: TabCountry,
    version: TabVersion
  }

  // 仅初始化与点击“查询”时才下发筛选，避免下拉切换触发各 tab 的全量请求
  const effectiveFilter = ref<IaaFilterState | null>(null)
  function onQuery() {
    effectiveFilter.value = { ...filtersDraft }
  }

  const currentTabComponent = computed(() => tabComponents[activeTab.value])
  const isMainSkeletonVisible = computed(() => {
    if (filterOptionsLoading.value) return true
    if (!effectiveFilter.value) return true
    return false
  })
</script>

<style scoped lang="scss">
  @use './styles/iaa-card-fx.scss' as *;
  @use '../../user-growth/styles/app-platform-select-ad-theme.scss' as apSelect;
  @use '../../user-growth/styles/filter-bar-theme.scss' as filterTheme;

  .iaa-analysis-page {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    padding: 16px 24px;
    overflow: auto;
    background: var(--default-bg-color);
  }

  .iaa-header {
    padding: 0 0 10px;
    margin-bottom: 12px;
  }

  .iaa-header__left {
    flex-shrink: 0;
  }

  .iaa-breadcrumb {
    font-size: 14px;
    color: var(--art-gray-600);
  }

  .iaa-header__filters.iaa-filter-panel {
    @include filterTheme.filter-panel(14px 16px);
    @include filterTheme.filter-panel-children;
    @include filterTheme.filter-row;

    min-width: 0;
  }

  .iaa-header__filters.iaa-filter-panel > .iaa-filter-field {
    display: inline-flex;
    gap: 0;
    align-items: center;
    min-height: 0;
    padding: 0;
    background: transparent;
    border: none;
  }

  .iaa-filter-select:not(.iaa-filter-select--app) {
    @include filterTheme.filter-select-size(240px, 200px, 240px);
  }

  .iaa-header__filters.iaa-filter-panel :deep(.iaa-filter-date) {
    --el-input-focus-border-color: var(--theme-color, var(--art-primary, #3b82f6));
    --el-border-color-hover: var(--theme-color, var(--art-primary, #3b82f6));
    --el-color-primary: var(--theme-color, var(--art-primary, #3b82f6));
    --el-border-color-focus: var(--theme-color, var(--art-primary, #3b82f6));
    --el-border-color: var(--theme-color, var(--art-primary, #3b82f6));
    --el-component-size: 36px;
  }

  @include filterTheme.date-trigger(
    '.iaa-header__filters.iaa-filter-panel',
    '.iaa-filter-date',
    240px
  );
  @include filterTheme.element-select-trigger('.iaa-filter-select');
  @include apSelect.apply-app-platform-select-ad-theme(
    '.iaa-header__filters.iaa-filter-panel',
    'iaa-filter-select__input',
    'iaa-filter__popper',
    240px,
    200px,
    240px
  );
  @include filterTheme.select-popper('iaa-filter__popper');
  @include filterTheme.app-platform-popper('iaa-filter__popper');
  @include filterTheme.date-picker-popper('iaa-filter__popper');

  :global(.iaa-filter__popper.el-popper),
  :global(.iaa-filter__popper.el-select__popper),
  :global(.iaa-filter__popper.el-picker__popper) {
    z-index: 4000 !important;
  }

  :deep(.iaa-filter-select),
  :deep(.iaa-filter-select__input) {
    --el-input-focus-border-color: var(--theme-color, var(--art-primary, #3b82f6));
    --el-border-color-hover: var(--theme-color, var(--art-primary, #3b82f6));
    --el-color-primary: var(--theme-color, var(--art-primary, #3b82f6));
    --el-border-color-focus: var(--theme-color, var(--art-primary, #3b82f6));
    --el-border-color: var(--theme-color, var(--art-primary, #3b82f6));
    --el-component-size: 36px;
  }

  .iaa-filter-panel :deep(.iaa-query-btn.el-button) {
    height: 36px;
    padding: 0 18px;
    font-weight: 600;
    color: var(--theme-color, var(--art-primary, #3b82f6));
    background: color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 6%, transparent);
    border: 1px solid var(--theme-color, var(--art-primary, #3b82f6));
    box-shadow: none;
  }

  .iaa-filter-panel :deep(.iaa-query-btn.el-button:hover) {
    border-color: var(--theme-color, var(--art-primary, #3b82f6));
    box-shadow: 0 0 0 1px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 14%, transparent);
  }

  /* 小屏：筛选条改为纵向堆叠 */
  @media (width <= 768px) {
    .iaa-header {
      align-items: stretch;
      padding: 14px 16px;
    }

    .iaa-header__filters {
      justify-content: flex-start;
    }
  }

  .iaa-tabs {
    position: relative;
    display: flex;
    gap: 6px;
    padding: 4px;
    margin-bottom: 16px;
    background: color-mix(in srgb, var(--default-bg-color) 86%, transparent);
    border: 1px solid color-mix(in srgb, var(--art-primary) 22%, transparent);
    border-radius: 9999px;
    box-shadow:
      0 10px 30px rgb(0 0 0 / 45%),
      inset 0 1px 0 color-mix(in srgb, var(--text-primary) 10%, transparent);
  }

  .iaa-tab {
    position: relative;
    padding: 8px 18px;
    font-size: 14px;
    font-weight: 500;
    color: var(--text-secondary);
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: 9999px;
    transition:
      color var(--duration-fast) var(--ease-default),
      background-color var(--duration-fast) var(--ease-default),
      transform var(--duration-fast) var(--ease-out),
      box-shadow var(--duration-fast) var(--ease-out);

    &:hover {
      color: var(--text-primary);
      box-shadow: 0 6px 14px color-mix(in srgb, var(--art-primary) 18%, transparent);
      transform: translateY(-1px);
    }

    &.is-active {
      color: var(--art-primary);
      background: color-mix(in srgb, var(--art-primary) 16%, transparent);
      box-shadow:
        0 0 0 1px color-mix(in srgb, var(--art-primary) 32%, transparent),
        0 0 20px color-mix(in srgb, var(--art-primary) 24%, transparent);
    }
  }

  .iaa-main {
    flex: 1;
    min-height: 0;
    overflow: visible;
  }

  .iaa-page-skeleton {
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-height: 100%;
  }

  .iaa-kpi-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }

  .iaa-kpi--sk {
    padding: 16px;
    background: var(--default-box-color);
    border: 1px solid var(--default-border);
    border-radius: 8px;
  }

  .iaa-kpi-sk__t {
    width: 52%;
    height: 12px;
    margin-bottom: 10px;
  }

  .iaa-kpi-sk__v {
    width: 78%;
    height: 24px;
    margin-bottom: 8px;
  }

  .iaa-kpi-sk__s {
    width: 60%;
    height: 12px;
  }

  .iaa-main-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 12px;
    align-items: stretch;
  }

  .iaa-panel {
    background: var(--default-box-color);
    border: 1px solid var(--default-border);
  }

  .iaa-chart-sk {
    height: 240px;
    background: linear-gradient(
      90deg,
      rgb(148 163 184 / 8%) 25%,
      rgb(148 163 184 / 14%) 37%,
      rgb(148 163 184 / 8%) 63%
    );
    background-size: 400% 100%;
    border-radius: 8px;
    animation: iaa-skeleton-shimmer 1.2s ease-in-out infinite;
  }

  @keyframes iaa-skeleton-shimmer {
    0% {
      background-position: 100% 0;
    }

    100% {
      background-position: 0 0;
    }
  }

  .iaa-list-sk__row {
    padding: 10px 0;
    border-bottom: 1px solid var(--default-border);
  }

  .iaa-list-sk__row:last-child {
    border-bottom: 0;
  }

  .iaa-list-sk__t {
    width: 100%;
    height: 12px;
  }
</style>

<style>
  .iaa-filter__popper .el-date-table td.today .el-date-table-cell__text {
    color: #fff !important;
  }
</style>
