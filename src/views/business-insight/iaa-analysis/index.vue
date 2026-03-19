<template>
  <div class="iaa-analysis-page art-full-height">
    <!-- 顶栏：面包屑 + 全局筛选 -->
    <header class="iaa-header">
      <div class="iaa-header__left">
        <span class="iaa-breadcrumb">
          {{ $t('menus.businessInsight.title') }} &gt; {{ $t('menus.businessInsight.iaaAnalysis') }}
        </span>
      </div>
      <div class="iaa-header__filters">
        <div class="iaa-pill">
          <span class="iaa-pill__k">App:</span>
          <ElSelect
            v-model="filters.s_app_id"
            class="iaa-select"
            popper-class="iaa-select__popper"
            :teleported="false"
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
            :teleported="false"
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
            :teleported="false"
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
            :teleported="false"
            :clearable="false"
          />
        </div>
      </div>
    </header>

    <!-- Tab 栏 -->
    <nav class="iaa-tabs">
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
      <component :is="currentTabComponent" :filter="filters" />
    </main>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, reactive } from 'vue'
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

  const activeTab = ref<IaaTabKey>('adPlatform')

  const filters = reactive<IaaFilterState>({
    s_app_id: 'all',
    platform: 'all',
    s_country_code: 'all',
    t_date: '2026-03-05'
  })

  const { appOptions, platformOptions, countryOptions } = useIaaFilters()

  const tabComponents: Record<IaaTabKey, typeof TabAdType> = {
    adType: TabAdType,
    adPlatform: TabAdPlatform,
    adPlacement: TabAdPlacement,
    adUnit: TabAdUnit,
    country: TabCountry,
    version: TabVersion
  }

  const currentTabComponent = computed(() => tabComponents[activeTab.value])
</script>

<style scoped lang="scss">
  .iaa-analysis-page {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    padding: 16px 24px;
    overflow: hidden;
    background: var(--default-bg-color);
  }

  .iaa-header {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
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
    gap: 8px;
    align-items: center;
  }

  .iaa-pill {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    padding: 4px 10px;
    background: var(--default-box-color);
    border: 1px solid var(--default-border);
    border-radius: 9999px;

    .iaa-pill__k {
      font-size: 12px;
      color: var(--art-gray-600);
      white-space: nowrap;
    }
  }

  .iaa-select {
    width: 100px;

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

  .iaa-tabs {
    display: flex;
    gap: 4px;
    margin-bottom: 16px;
    border-bottom: 1px solid var(--default-border);
  }

  .iaa-tab {
    padding: 10px 16px;
    font-size: 14px;
    color: var(--art-gray-600);
    cursor: pointer;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    transition:
      color 0.2s,
      border-color 0.2s;

    &:hover {
      color: var(--art-gray-900);
    }

    &.is-active {
      color: var(--art-primary);
      border-bottom-color: var(--art-primary);
    }
  }

  .iaa-main {
    flex: 1;
    min-height: 0;
    overflow: auto;
  }
</style>
