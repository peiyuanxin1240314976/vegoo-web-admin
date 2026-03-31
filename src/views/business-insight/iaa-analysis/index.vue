<template>
  <div class="iaa-analysis-page iaa-fx-page art-full-height">
    <div class="iaa-page-fx" aria-hidden="true"></div>
    <!-- 顶栏：面包屑 + 全局筛选 -->
    <header class="iaa-header iaa-entry-1">
      <div class="iaa-header__filters iaa-filter-panel">
        <div class="iaa-pill">
          <span class="iaa-pill__k">App:</span>
          <ElSelect
            v-model="filtersDraft.s_app_id"
            class="iaa-select"
            popper-class="iaa-select__popper"
            :teleported="true"
            :fit-input-width="true"
          >
            <ElOption
              v-for="opt in appOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </ElSelect>
        </div>
        <div class="iaa-pill">
          <span class="iaa-pill__k">Platform:</span>
          <ElSelect
            v-model="filtersDraft.platform"
            class="iaa-select"
            popper-class="iaa-select__popper"
            :teleported="true"
            :fit-input-width="true"
          >
            <ElOption
              v-for="opt in platformOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </ElSelect>
        </div>
        <div class="iaa-pill">
          <span class="iaa-pill__k">Country:</span>
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
          <span class="iaa-pill__k">Date:</span>
          <ElDatePicker
            v-model="filtersDraft.t_date"
            type="date"
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
      <component v-if="effectiveFilter" :is="currentTabComponent" :filter="effectiveFilter" />
    </main>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, reactive, watch } from 'vue'
  import { getAppTodayYYYYMMDD } from '@/utils/app-now'
  import type { IaaTabKey, IaaFilterState } from './types'
  import { useIaaFilters } from './composables/useIaaFilters'
  import TabAdType from './modules/tab-ad-type.vue'
  import TabAdPlatform from './modules/tab-ad-platform.vue'
  import TabAdPlacement from './modules/tab-ad-placement.vue'
  import TabAdUnit from './modules/tab-ad-unit.vue'
  import TabCountry from './modules/tab-country.vue'
  import TabVersion from './modules/tab-version.vue'

  defineOptions({ name: 'IaaAnalysis' })

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
    s_app_id: '',
    platform: 'all',
    s_country_code: 'all',
    t_date: getAppTodayYYYYMMDD()
  })

  const { appOptions, platformOptions, countryOptions } = useIaaFilters()

  const hasInitDefaultAppId = ref(false)
  watch(
    appOptions,
    (opts) => {
      if (hasInitDefaultAppId.value) return
      if (!opts?.length) return
      if (!opts[0]?.value) return

      filtersDraft.s_app_id = opts[0].value
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
    min-height: 32px;
    padding: 0 10px;
    background: rgb(0 0 0 / 28%);
    border: 1px solid rgb(96 165 250 / 24%);
    border-radius: 10px;
    box-shadow: 0 0 0 1px rgb(59 130 246 / 6%) inset;
  }

  .iaa-filter-panel :deep(.iaa-date .el-input__wrapper) {
    min-height: 32px;
    padding: 0 10px;
    background: rgb(0 0 0 / 28%);
    border: 1px solid rgb(96 165 250 / 24%);
    border-radius: 10px;
    box-shadow: 0 0 0 1px rgb(59 130 246 / 6%) inset;
  }

  :global(html:not(.dark) .iaa-filter-panel) :deep(.iaa-select .el-select__wrapper),
  :global(html:not(.dark) .iaa-filter-panel) :deep(.iaa-date .el-input__wrapper) {
    background: rgb(255 255 255 / 90%);
    border: 1px solid rgb(15 23 42 / 8%);
    box-shadow: none;
  }

  .iaa-filter-panel :deep(.iaa-query-btn.el-button) {
    height: 36px;
    padding: 0 18px;
    font-weight: 600;
    color: #f8fafc;
    background: linear-gradient(135deg, rgb(37 99 235 / 96%), rgb(6 182 212 / 88%));
    border: 1px solid rgb(96 165 250 / 55%);
    box-shadow:
      0 0 0 1px rgb(186 230 253 / 14%) inset,
      0 8px 26px rgb(37 99 235 / 38%),
      0 0 32px rgb(6 182 212 / 12%);
  }

  .iaa-filter-panel :deep(.iaa-query-btn.el-button:hover) {
    filter: brightness(1.08);
    border-color: rgb(147 197 253 / 62%);
    box-shadow:
      0 0 0 1px rgb(186 230 253 / 20%) inset,
      0 10px 34px rgb(37 99 235 / 45%),
      0 0 44px rgb(6 182 212 / 20%);
  }

  :global(html:not(.dark) .iaa-filter-panel) :deep(.iaa-query-btn.el-button) {
    color: #0f172a;
    background: rgb(15 23 42 / 6%);
    border: 1px solid rgb(15 23 42 / 8%);
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
    font-size: 12px;
    color: var(--text-secondary);
  }

  .iaa-select,
  .iaa-date {
    width: 140px;
  }

  :deep(.iaa-select .el-select__wrapper) {
    min-height: 30px;
    padding: 0 8px;
    background: transparent;
    border: 0;
    box-shadow: none;
  }

  :deep(.iaa-date .el-input__wrapper) {
    min-height: 30px;
    padding: 0 8px;
    background: transparent;
    border: 0;
    box-shadow: none;
  }

  :deep(.iaa-date .el-input__inner) {
    color: var(--text-primary);
  }

  :global(html:not(.dark) .iaa-filter-panel) :deep(.iaa-date .el-input__inner) {
    color: #0f172a;
  }

  :deep(.iaa-select .el-select__selected-item),
  :deep(.iaa-select .el-select__placeholder),
  :deep(.iaa-select .el-select__caret) {
    color: var(--text-primary);
  }

  :global(html:not(.dark) .iaa-filter-panel) :deep(.iaa-select .el-select__selected-item),
  :global(html:not(.dark) .iaa-filter-panel) :deep(.iaa-select .el-select__placeholder),
  :global(html:not(.dark) .iaa-filter-panel) :deep(.iaa-select .el-select__caret) {
    color: #0f172a;
  }

  :deep(.iaa-date .el-input__prefix),
  :deep(.iaa-date .el-input__suffix) {
    color: var(--text-primary);
  }

  :global(html:not(.dark) .iaa-filter-panel) :deep(.iaa-date .el-input__prefix),
  :global(html:not(.dark) .iaa-filter-panel) :deep(.iaa-date .el-input__suffix) {
    color: #0f172a;
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
</style>

<style lang="scss">
  .iaa-select__popper,
  .iaa-date-popper {
    z-index: 3200 !important;
    background: color-mix(in srgb, var(--default-bg-color) 92%, transparent);
    backdrop-filter: blur(12px);
    border: 1px solid color-mix(in srgb, var(--art-primary) 28%, transparent);
    box-shadow:
      0 12px 36px rgb(0 0 0 / 48%),
      0 0 0 1px color-mix(in srgb, var(--art-primary) 12%, transparent);
  }

  .iaa-select__popper .el-select-dropdown__item.is-selected {
    color: var(--art-primary);
    background: color-mix(in srgb, var(--art-primary) 12%, var(--default-box-color));
  }

  .iaa-select__popper .el-select-dropdown__item:hover {
    background: color-mix(in srgb, var(--art-primary) 10%, var(--default-box-color));
  }
</style>
