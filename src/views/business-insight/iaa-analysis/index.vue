<template>
  <div class="iaa-analysis-page iaa-fx-page art-full-height">
    <div class="iaa-page-fx" aria-hidden="true"></div>
    <!-- 顶栏：面包屑 + 全局筛选 -->
    <header class="iaa-header iaa-entry-1">
      <div class="iaa-header__filters">
        <div class="iaa-pill">
          <span class="iaa-pill__k">App:</span>
          <ElSelect
            v-model="filters.s_app_id"
            class="iaa-select"
            popper-class="iaa-select__popper"
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
            v-model="filters.platform"
            class="iaa-select"
            popper-class="iaa-select__popper"
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
            v-model="filters.s_country_code"
            class="iaa-select"
            popper-class="iaa-select__popper"
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
            v-model="filters.t_date"
            type="date"
            value-format="YYYY-MM-DD"
            format="YYYY-MM-DD"
            class="iaa-date"
            popper-class="iaa-date-popper"
            :clearable="false"
          />
        </div>
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
      <component :is="currentTabComponent" :filter="effectiveFilter" />
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

  const filters = reactive<IaaFilterState>({
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

      filters.s_app_id = opts[0].value
      hasInitDefaultAppId.value = true
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

  // 与 AdPerformance 类似：筛选变化统一汇总后再下发（轻量 debounce，避免下拉快速切换时每次都全量请求）
  const effectiveFilter = ref<IaaFilterState>({ ...filters })
  let filterTimer: number | null = null
  watch(
    filters,
    (val) => {
      if (filterTimer) window.clearTimeout(filterTimer)
      filterTimer = window.setTimeout(() => {
        effectiveFilter.value = { ...val }
      }, 180)
    },
    { deep: true, immediate: true }
  )

  const currentTabComponent = computed(() => tabComponents[activeTab.value])
</script>

<style scoped lang="scss">
  @import './styles/iaa-card-fx';

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
    display: flex;
    flex-wrap: wrap;
    gap: 14px 16px;
    align-items: center;
    justify-content: space-between;
    min-width: 0;
    padding: 16px 18px;
    margin-bottom: 16px;
    background: color-mix(in srgb, var(--default-bg-color) 82%, transparent);
    backdrop-filter: blur(12px);
    border: 1px solid color-mix(in srgb, var(--art-primary) 22%, transparent);
    border-radius: 16px;
    box-shadow:
      0 8px 32px rgb(0 0 0 / 40%),
      inset 0 1px 0 color-mix(in srgb, var(--text-primary) 8%, transparent),
      0 0 40px color-mix(in srgb, var(--art-primary) 10%, transparent);
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
    gap: 10px 12px;
    align-items: center;
    min-width: 0;
  }

  .iaa-pill {
    --iaa-filter-accent: var(--art-success);

    display: inline-flex;
    gap: 6px;
    align-items: center;
    min-height: 40px;
    padding: 0 14px;
    background: color-mix(in srgb, var(--iaa-filter-accent) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--iaa-filter-accent) 26%, transparent);
    border-radius: 9999px;
    box-shadow: 0 0 16px color-mix(in srgb, var(--iaa-filter-accent) 14%, transparent);

    .iaa-pill__k {
      font-size: 12px;
      color: var(--text-secondary);
      white-space: nowrap;
    }
  }

  .iaa-select {
    width: 132px;
    min-width: 110px;
    max-width: 100%;

    :deep(.el-input__wrapper) {
      background: transparent;
      box-shadow: none;
    }
  }

  .iaa-date {
    width: 140px;

    :deep(.el-input__wrapper) {
      background: transparent;
      box-shadow: none;
    }
  }

  /* Select / Date 统一成 ad-performance 的圆角透底风格 */
  :deep(.iaa-select .el-input__wrapper),
  :deep(.iaa-date .el-input__wrapper) {
    padding: 0 12px;
    background: color-mix(in srgb, var(--iaa-filter-accent) 8%, transparent);
    border: 1px solid color-mix(in srgb, var(--iaa-filter-accent) 28%, transparent);
    border-radius: 9999px;
    transition:
      border-color var(--duration-fast) var(--ease-default),
      box-shadow var(--duration-fast) var(--ease-default),
      background var(--duration-fast) var(--ease-default);
  }

  :deep(.iaa-select .el-input__inner),
  :deep(.iaa-date .el-input__inner) {
    font-size: 14px;
    color: var(--text-primary);
  }

  :deep(.iaa-select .el-select__caret) {
    color: var(--iaa-filter-accent);
  }

  :deep(.iaa-select .el-input__prefix-inner svg) {
    color: var(--iaa-filter-accent);
  }

  :deep(.iaa-select .el-input__wrapper:hover),
  :deep(.iaa-date .el-input__wrapper:hover) {
    border-color: color-mix(in srgb, var(--iaa-filter-accent) 55%, transparent);
    box-shadow: 0 0 18px color-mix(in srgb, var(--iaa-filter-accent) 18%, transparent);
  }

  :deep(.iaa-select .el-input__wrapper.is-focus),
  :deep(.iaa-date .el-input__wrapper.is-focus) {
    background: color-mix(in srgb, var(--iaa-filter-accent) 12%, transparent) !important;
    border-color: var(--iaa-filter-accent) !important;
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--iaa-filter-accent) 22%, transparent) !important;
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
