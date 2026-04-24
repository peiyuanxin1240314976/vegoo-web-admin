<template>
  <div class="iaa-analysis-page iaa-fx-page art-full-height">
    <div class="iaa-page-fx" aria-hidden="true"></div>
    <!-- 顶栏：面包屑 + 全局筛选 -->
    <header class="iaa-header iaa-entry-1">
      <div class="iaa-header__filters iaa-filter-panel">
        <div class="iaa-pill">
          <span class="iaa-pill__k">应用:</span>
          <AppPlatformSearchSelect
            v-model="filtersDraft.s_app_id"
            mode="app"
            class="iaa-select iaa-select--app"
            input-class="iaa-select__input"
            placeholder="应用"
            search-placeholder="应用"
            :setting-apps="settingAppsForSelect"
            :height="32"
            :min-width="140"
            :max-width="240"
          />
        </div>
        <div class="iaa-pill">
          <span class="iaa-pill__k">国家:</span>
          <ElSelect
            v-model="filtersDraft.s_country_code"
            class="iaa-select"
            popper-class="iaa-select__popper"
            :teleported="true"
            :fit-input-width="true"
            filterable
          >
            <ElOption
              v-for="opt in countryOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </ElSelect>
        </div>
        <div class="iaa-pill">
          <span class="iaa-pill__k">日期:</span>
          <AppDatePicker
            v-model="filtersDraft.t_date"
            type="date"
            :shortcuts="dateShortcuts"
            value-format="YYYY-MM-DD"
            format="YYYY-MM-DD"
            class="iaa-date"
            :teleported="true"
            popper-class="iaa-date-popper"
            :clearable="false"
          />
        </div>

        <ElButton type="primary" plain round @click="onQuery">查询</ElButton>
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
  import { storeToRefs } from 'pinia'
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
    s_country_code: 'all',
    t_date: getAppTodayYYYYMMDD()
  })

  const {
    appOptions,
    // platformOptions,
    countryOptions,
    loading: filterOptionsLoading
  } = useIaaFilters()
  const settingAppsForSelect = computed<CockpitSettingAppItem[]>(() => {
    const fromCockpit = cockpitMeta.value?.settingApps ?? []
    if (fromCockpit.length) return fromCockpit

    return appOptions.value
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
  @use '../../user-growth/ad-performance/styles/ap-card-fx.scss' as ap;
  @use './styles/iaa-card-fx.scss' as *;

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

  .iaa-header__filters {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
  }

  .iaa-filter-panel {
    position: relative;
    padding: 10px 14px;
    overflow: hidden;
    border-radius: 16px;

    @include ap.ap-neon-bg;
    @include ap.ap-card-mesh;

    transition:
      box-shadow 0.35s var(--ease-out, cubic-bezier(0, 0, 0.2, 1)),
      border-color 0.3s var(--ease-default, cubic-bezier(0.4, 0, 0.2, 1));

    &:hover {
      border-color: rgb(96 165 250 / 48%);
      box-shadow:
        0 12px 40px rgb(0 0 0 / 44%),
        0 0 0 1px rgb(96 165 250 / 22%),
        inset 0 1px 0 rgb(186 230 253 / 16%),
        0 0 48px rgb(59 130 246 / 14%);
    }

    > * {
      position: relative;
      z-index: 1;
    }
  }

  :global(html:not(.dark) .iaa-filter-panel) {
    background: linear-gradient(148deg, rgb(255 255 255 / 98%), rgb(248 250 252 / 99%));
    border: 1px solid rgb(15 23 42 / 8%);
    box-shadow: 0 10px 32px rgb(15 23 42 / 7%);

    &:hover {
      border-color: rgb(59 130 246 / 22%);
      box-shadow: 0 12px 36px rgb(15 23 42 / 10%);
    }
  }

  :global(html.dark .iaa-filter-panel .iaa-pill) {
    background: rgb(15 23 42 / 0%);
    border-color: rgb(96 165 250 / 26%);
    box-shadow: 0 0 0 0 rgb(59 130 246 / 8%) inset;
  }

  .iaa-filter-panel :deep(.iaa-select .el-select__wrapper) {
    min-height: 36px;
    padding: 0 10px;
    background: color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 6%, transparent);
    border: 1px solid var(--theme-color, var(--art-primary, #3b82f6));
    border-radius: var(--el-border-radius-base, 4px);
    box-shadow: none;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease,
      background 0.2s ease;
  }

  .iaa-filter-panel :deep(.iaa-select__input .el-select__wrapper) {
    min-height: 36px;
    padding: 0 10px;
    background: color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 6%, transparent);
    border: 1px solid var(--theme-color, var(--art-primary, #3b82f6));
    border-radius: var(--el-border-radius-base, 4px);
    box-shadow: none;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease,
      background 0.2s ease;
  }

  .iaa-filter-panel :deep(.iaa-date .el-input__wrapper) {
    min-height: 36px;
    padding: 0 10px;
    background: color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 6%, transparent);
    border: 1px solid var(--theme-color, var(--art-primary, #3b82f6));
    border-radius: var(--el-border-radius-base, 4px);
    box-shadow: none;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease,
      background 0.2s ease;
  }

  :global(html:not(.dark) .iaa-filter-panel) :deep(.iaa-select .el-select__wrapper),
  :global(html:not(.dark) .iaa-filter-panel) :deep(.iaa-select__input .el-select__wrapper),
  :global(html:not(.dark) .iaa-filter-panel) :deep(.iaa-date .el-input__wrapper) {
    background: color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 6%, transparent);
    border: 1px solid var(--theme-color, var(--art-primary, #3b82f6));
    box-shadow: none;
  }

  .iaa-filter-panel :deep(.iaa-select .el-select__wrapper:hover),
  .iaa-filter-panel :deep(.iaa-select__input .el-select__wrapper:hover),
  .iaa-filter-panel :deep(.iaa-date .el-input__wrapper:hover) {
    border-color: var(--theme-color, var(--art-primary, #3b82f6));
    box-shadow: 0 0 0 1px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 14%, transparent);
  }

  .iaa-filter-panel :deep(.iaa-select .el-select__wrapper.is-focused),
  .iaa-filter-panel :deep(.iaa-select__input .el-select__wrapper.is-focused),
  .iaa-filter-panel :deep(.iaa-date .el-input__wrapper.is-focus),
  .iaa-filter-panel :deep(.iaa-date .el-input__wrapper:focus-within) {
    border-color: var(--theme-color, var(--art-primary, #3b82f6)) !important;
    box-shadow: 0 0 0 2px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 18%, transparent) !important;
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

  :global(html:not(.dark) .iaa-filter-panel) :deep(.iaa-query-btn.el-button) {
    color: var(--theme-color, var(--art-primary, #3b82f6));
    background: color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 6%, transparent);
    border: 1px solid var(--theme-color, var(--art-primary, #3b82f6));
    box-shadow: none;
  }

  :global(html:not(.dark) .iaa-filter-panel) :deep(.iaa-query-btn.el-button:hover) {
    filter: brightness(1.06);
  }

  .iaa-pill {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    height: 36px;
    padding: 0 10px;
    color: var(--text-primary);
    background: rgb(15 23 42 / 6%);
    border: 0 solid rgb(15 23 42 / 8%);
    border-radius: 14px;
  }

  :global(html.dark .iaa-pill) {
    color: #f4f4f5;
    background: rgb(24 24 27 / 45%);
  }

  .iaa-pill__k {
    flex-shrink: 0;
    font-size: 12px;
    color: var(--text-secondary);
    white-space: nowrap;
  }

  .iaa-select,
  .iaa-date {
    width: 140px;
  }

  :deep(.iaa-select .el-select__wrapper) {
    min-height: 36px;
    padding: 0 10px;
  }

  :deep(.iaa-select__input .el-select__wrapper) {
    min-height: 36px;
    padding: 0 10px;
  }

  :deep(.iaa-date .el-input__wrapper) {
    min-height: 36px;
    padding: 0 10px;
  }

  :deep(.iaa-date .el-input__inner) {
    color: #fff;
  }

  :deep(.iaa-select .el-select__selected-item),
  :deep(.iaa-select .el-select__placeholder),
  :deep(.iaa-select .el-select__caret),
  :deep(.iaa-select__input .el-select__selected-item),
  :deep(.iaa-select__input .el-select__placeholder),
  :deep(.iaa-select__input .el-select__caret) {
    color: #fff;
  }

  :deep(.iaa-date .el-input__prefix),
  :deep(.iaa-date .el-input__suffix) {
    color: #fff;
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

<style lang="scss">
  .iaa-select__popper,
  .iaa-date-popper {
    z-index: 3200 !important;
    background: color-mix(in srgb, var(--default-bg-color) 92%, transparent);
    backdrop-filter: blur(12px);
    border: 1px solid var(--theme-color, var(--art-primary, #3b82f6));
    box-shadow: 0 12px 36px rgb(0 0 0 / 48%);
  }

  .iaa-select__popper .el-select-dropdown__item.is-selected {
    color: var(--theme-color, var(--art-primary, #3b82f6));
    background: color-mix(
      in srgb,
      var(--theme-color, var(--art-primary, #3b82f6)) 12%,
      var(--default-box-color)
    );
  }

  .iaa-select__popper .el-select-dropdown__item:hover {
    background: color-mix(
      in srgb,
      var(--theme-color, var(--art-primary, #3b82f6)) 10%,
      var(--default-box-color)
    );
  }
</style>
